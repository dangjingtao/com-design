import fs from 'node:fs';
import path from 'node:path';

const PLANNED_STATUSES = new Set(['planned', 'deferred', 'non-canonical']);
const MATURITY_STATUSES = new Set(['planned', 'partial', 'implemented', 'verified']);

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${filePath}: invalid JSON (${error.message})`);
  }
}

function parseCanonicalSource(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.json') return readJson(filePath);

  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.trim()) throw new Error(`${filePath}: source is empty`);
  return raw;
}

export function validateSourceIntegrity(repoRoot, options = {}) {
  const manifestPath = options.manifestPath ?? path.join(repoRoot, 'design-source', 'specs', 'design-system-v1.json');
  const errors = [];
  const evidence = {
    manifestPath,
    canonicalSources: {},
    catalogCounts: {},
    platformTargets: [],
    adapterMaturity: {},
  };

  let manifest;
  try {
    manifest = readJson(manifestPath);
  } catch (error) {
    return { errors: [error.message], evidence };
  }

  const manifestDir = path.dirname(manifestPath);
  const sources = manifest.sources;
  if (!sources || typeof sources !== 'object' || Array.isArray(sources)) {
    errors.push('manifest.sources must be an object of canonical source paths.');
  } else {
    for (const [sourceKey, declaredPath] of Object.entries(sources)) {
      if (typeof declaredPath !== 'string' || !declaredPath.trim()) {
        errors.push(`sources.${sourceKey} must be a non-empty relative path string.`);
        continue;
      }
      if (declaredPath.includes('*')) {
        errors.push(`sources.${sourceKey} must resolve to one deterministic path; wildcards are not allowed.`);
        continue;
      }

      const resolvedPath = path.resolve(manifestDir, declaredPath);
      if (!fs.existsSync(resolvedPath)) {
        errors.push(`sources.${sourceKey} points to missing path: ${declaredPath}`);
        continue;
      }
      if (!fs.statSync(resolvedPath).isFile()) {
        errors.push(`sources.${sourceKey} must point to a file: ${declaredPath}`);
        continue;
      }

      try {
        evidence.canonicalSources[sourceKey] = {
          path: declaredPath,
          resolvedPath,
          value: parseCanonicalSource(resolvedPath),
        };
      } catch (error) {
        errors.push(`sources.${sourceKey} cannot be parsed: ${error.message}`);
      }
    }
  }

  const plannedSources = manifest.plannedSources ?? {};
  if (typeof plannedSources !== 'object' || Array.isArray(plannedSources)) {
    errors.push('manifest.plannedSources must be an object when present.');
  } else {
    for (const [sourceKey, declaration] of Object.entries(plannedSources)) {
      if (!declaration || typeof declaration !== 'object' || Array.isArray(declaration)) {
        errors.push(`plannedSources.${sourceKey} must be an object.`);
        continue;
      }
      if (declaration.canonical !== false) {
        errors.push(`plannedSources.${sourceKey}.canonical must be false.`);
      }
      if (!PLANNED_STATUSES.has(declaration.status)) {
        errors.push(`plannedSources.${sourceKey}.status must be planned, deferred, or non-canonical.`);
      }
    }
  }

  const catalogs = manifest.catalogs;
  if (!catalogs || typeof catalogs !== 'object' || Array.isArray(catalogs)) {
    errors.push('manifest.catalogs must declare catalog source + collection mappings.');
  } else {
    for (const [catalogKey, declaration] of Object.entries(catalogs)) {
      const sourceKey = declaration?.source;
      const collection = declaration?.collection;
      if (typeof sourceKey !== 'string' || typeof collection !== 'string') {
        errors.push(`catalogs.${catalogKey} must declare string source and collection fields.`);
        continue;
      }
      const sourceEvidence = evidence.canonicalSources[sourceKey];
      if (!sourceEvidence) {
        errors.push(`catalogs.${catalogKey} references unavailable canonical source: ${sourceKey}`);
        continue;
      }
      const parsed = sourceEvidence.value;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        errors.push(`catalogs.${catalogKey} source ${sourceKey} is not a JSON object.`);
        continue;
      }
      const items = parsed[collection];
      if (!Array.isArray(items)) {
        errors.push(`catalogs.${catalogKey} collection ${collection} is not an array in ${sourceKey}.`);
        continue;
      }
      evidence.catalogCounts[catalogKey] = items.length;
    }
  }

  const platformStatus = manifest.platformStatus;
  if (!platformStatus || !Array.isArray(platformStatus.targets) || !platformStatus.adapterMaturity) {
    errors.push('manifest.platformStatus must separate targets from adapterMaturity.');
  } else {
    evidence.platformTargets = [...platformStatus.targets];
    evidence.adapterMaturity = { ...platformStatus.adapterMaturity };
    const targets = new Set(platformStatus.targets);
    for (const target of targets) {
      const maturity = platformStatus.adapterMaturity[target];
      if (!maturity || typeof maturity !== 'object') {
        errors.push(`platformStatus.adapterMaturity.${target} is required for every target platform.`);
        continue;
      }
      if (!MATURITY_STATUSES.has(maturity.status)) {
        errors.push(`platformStatus.adapterMaturity.${target}.status must be planned, partial, implemented, or verified.`);
      }
    }
    for (const platform of Object.keys(platformStatus.adapterMaturity)) {
      if (!targets.has(platform)) {
        errors.push(`platformStatus.adapterMaturity.${platform} is not listed in platformStatus.targets.`);
      }
    }
  }

  if (manifest.counts) {
    errors.push('manifest.counts must not contain hand-maintained catalog totals; derive counts from catalog sources.');
  }

  const releaseGates = manifest.releaseGates;
  if (!releaseGates || releaseGates.evaluation !== 'validator-evidence' || !Array.isArray(releaseGates.requirements)) {
    errors.push('manifest.releaseGates must declare requirements and use validator-evidence evaluation instead of hand-written pass booleans.');
  }

  return { errors, evidence };
}
