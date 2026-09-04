import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { buildCanonicalDesignModel } from './design-model.mjs';
import { validateComponentCatalog } from './component-contract.mjs';
import { validateIconographyContract } from './iconography.mjs';
import { validateLayoutInputFoundationContract } from './layout-input-foundation.mjs';
import { validateNavigationFoundationContract } from './navigation-foundation.mjs';
import { validateMotionFoundationContract } from './motion-foundation.mjs';
import { validatePlatformEnvironmentContract } from './platform-environment.mjs';
import { validatePlatformModel } from './platform-context.mjs';
import { validateSourceIntegrity } from './source-integrity.mjs';
import { buildTokenModel, validateTokenModel } from './token-model.mjs';

const EVIDENCE_SCHEMA_VERSION = 1;
const EVIDENCE_ID = 'com-design:validation-evidence:v1';
const DEFAULT_EVIDENCE_PATH = path.join('dist', 'validation', 'evidence.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function normalizeMessages(messages) {
  return [...new Set((messages ?? []).filter((message) => typeof message === 'string' && message.trim()))];
}

function normalizeRepositoryMessage(repoRoot, message) {
  let normalized = String(message).replaceAll('\\', '/');
  const roots = new Set([path.resolve(repoRoot)]);
  try {
    roots.add(fs.realpathSync(repoRoot));
  } catch {
    // A missing fixture root will already fail a repository-owned hard gate.
  }

  for (const root of roots) {
    const portableRoot = root.replaceAll('\\', '/').replace(/\/+$/, '');
    normalized = normalized.split(`${portableRoot}/`).join('');
    if (normalized === portableRoot) normalized = '.';
  }
  return normalized;
}

function runCheck(id, runner) {
  try {
    const result = runner() ?? {};
    const errors = normalizeMessages(result.errors);
    const warnings = normalizeMessages(result.warnings);
    return {
      id,
      hardGate: true,
      status: errors.length ? 'fail' : warnings.length ? 'warn' : 'pass',
      errors,
      warnings,
      evidence: result.evidence ?? {},
    };
  } catch (error) {
    return {
      id,
      hardGate: true,
      status: 'fail',
      errors: [error instanceof Error ? error.message : String(error)],
      warnings: [],
      evidence: {},
    };
  }
}

export function buildValidationEvidence({
  checks,
  productVersion = null,
  manifestSha256 = null,
  sourceSha256 = null,
}) {
  const normalizedChecks = checks.map((check) => {
    const errors = normalizeMessages(check.errors);
    const warnings = normalizeMessages(check.warnings);
    return {
      id: check.id,
      hardGate: check.hardGate !== false,
      status: errors.length ? 'fail' : warnings.length ? 'warn' : 'pass',
      errors,
      warnings,
      evidence: check.evidence ?? {},
    };
  });

  const errors = normalizedChecks.flatMap((check) =>
    check.errors.map((message) => ({ checkId: check.id, message })),
  );
  const warnings = normalizedChecks.flatMap((check) =>
    check.warnings.map((message) => ({ checkId: check.id, message })),
  );
  const failed = normalizedChecks.filter((check) => check.status === 'fail').length;
  const warned = normalizedChecks.filter((check) => check.status === 'warn').length;
  const passed = normalizedChecks.filter((check) => check.status === 'pass').length;

  return {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    id: EVIDENCE_ID,
    $metadata: {
      authority: 'derived-build-artifact',
      editable: false,
      sourceOfTruth: 'design-source/',
    },
    result: errors.length ? 'fail' : 'pass',
    source: {
      productVersion,
      manifestSha256,
      sourceSha256,
      algorithm: 'sha256',
    },
    summary: {
      checksRun: normalizedChecks.length,
      passed,
      warned,
      failed,
      blockingErrors: errors.length,
      warnings: warnings.length,
    },
    checks: normalizedChecks,
    errors,
    warnings,
  };
}

export function runRepositoryValidation(repoRoot) {
  const sourceIntegrity = validateSourceIntegrity(repoRoot);
  const canonicalSources = sourceIntegrity.evidence.canonicalSources;
  let manifest = null;
  let tokenModel = null;
  let canonicalModel = null;

  try {
    manifest = readJson(sourceIntegrity.evidence.manifestPath);
  } catch {
    // Source integrity owns the canonical manifest parse error. Downstream checks
    // will report unavailable dependencies without inventing a second parser truth.
  }

  const checks = [];

  checks.push(runCheck('source-integrity', () => ({
    errors: sourceIntegrity.errors,
    evidence: {
      canonicalSourceCount: Object.keys(canonicalSources).length,
      canonicalSourceIds: Object.keys(canonicalSources).sort(),
      catalogCounts: sourceIntegrity.evidence.catalogCounts,
      platformTargets: sourceIntegrity.evidence.platformTargets,
      adapterMaturity: sourceIntegrity.evidence.adapterMaturity,
    },
  })));

  checks.push(runCheck('token-model', () => {
    const foundationPath = canonicalSources.foundation?.resolvedPath;
    if (!foundationPath) {
      return { errors: ['canonical foundation source is unavailable.'] };
    }
    tokenModel = buildTokenModel(foundationPath);
    return {
      errors: validateTokenModel(tokenModel),
      evidence: {
        consumerTokenCount: tokenModel.consumer.length,
        tokenSourceSha256: tokenModel.sourceHash,
      },
    };
  }));

  checks.push(runCheck('platform-model', () => {
    const platformModel = canonicalSources.platformModel?.value;
    const platformSchema = canonicalSources.platformContextSchema?.value;
    const errors = [];
    if (!platformModel) errors.push('canonical platformModel source is unavailable.');
    if (!platformSchema) errors.push('canonical platformContextSchema source is unavailable.');
    if (!manifest) errors.push('canonical manifest is unavailable.');
    if (errors.length) return { errors };
    return {
      errors: validatePlatformModel(platformModel, platformSchema, manifest),
      evidence: {
        platformCount: platformModel.axes?.platform?.values?.length ?? 0,
        contextAxes: Object.keys(platformModel.axes ?? {}).sort(),
      },
    };
  }));

  checks.push(runCheck('platform-environment', () => {
    const environment = canonicalSources.platformEnvironment?.value;
    const environmentSchema = canonicalSources.platformEnvironmentSchema?.value;
    const platformModel = canonicalSources.platformModel?.value;
    const errors = [];
    if (!environment) errors.push('canonical platformEnvironment source is unavailable.');
    if (!environmentSchema) errors.push('canonical platformEnvironmentSchema source is unavailable.');
    if (!platformModel) errors.push('canonical platformModel source is unavailable.');
    if (!manifest) errors.push('canonical manifest is unavailable.');
    if (errors.length) return { errors };
    return {
      errors: validatePlatformEnvironmentContract(
        environment,
        environmentSchema,
        platformModel,
        manifest,
      ),
      evidence: {
        exampleCount: environment.examples?.length ?? 0,
        platforms: (environment.examples ?? []).map((example) => example.platform).filter(Boolean).sort(),
      },
    };
  }));

  checks.push(runCheck('layout-input-foundation', () => {
    const contract = canonicalSources.layoutInputFoundation?.value;
    const schema = canonicalSources.layoutInputSchema?.value;
    const platformModel = canonicalSources.platformModel?.value;
    const errors = [];
    if (!contract) errors.push('canonical layoutInputFoundation source is unavailable.');
    if (!schema) errors.push('canonical layoutInputSchema source is unavailable.');
    if (!platformModel) errors.push('canonical platformModel source is unavailable.');
    if (!manifest) errors.push('canonical manifest is unavailable.');
    if (errors.length) return { errors };

    return {
      errors: validateLayoutInputFoundationContract(contract, schema, platformModel, manifest),
      evidence: {
        schemaVersion: contract.schemaVersion ?? null,
        foundationCount: contract.foundations?.length ?? 0,
        exampleCount: contract.examples?.length ?? 0,
        inputModes: contract.axes?.input ?? [],
        contentScaleModes: contract.axes?.contentScale ?? [],
      },
    };
  }));

  checks.push(runCheck('navigation-foundation', () => {
    const contract = canonicalSources.navigationFoundation?.value;
    const schema = canonicalSources.navigationSchema?.value;
    const platformModel = canonicalSources.platformModel?.value;
    const layoutInputFoundation = canonicalSources.layoutInputFoundation?.value;
    const platformEnvironment = canonicalSources.platformEnvironment?.value;
    const iconography = canonicalSources.iconography?.value;
    const iconographySchema = canonicalSources.iconographySchema?.value;
    const errors = [];
    if (!contract) errors.push('canonical navigationFoundation source is unavailable.');
    if (!schema) errors.push('canonical navigationSchema source is unavailable.');
    if (!platformModel) errors.push('canonical platformModel source is unavailable.');
    if (!layoutInputFoundation) errors.push('canonical layoutInputFoundation source is unavailable.');
    if (!platformEnvironment) errors.push('canonical platformEnvironment source is unavailable.');
    if (!iconography) errors.push('canonical iconography source is unavailable.');
    if (!iconographySchema) errors.push('canonical iconographySchema source is unavailable.');
    if (!manifest) errors.push('canonical manifest is unavailable.');
    if (errors.length) return { errors };

    return {
      errors: validateNavigationFoundationContract(
        contract,
        schema,
        platformModel,
        layoutInputFoundation,
        platformEnvironment,
        iconography,
        iconographySchema,
        manifest,
      ),
      evidence: {
        schemaVersion: contract.schemaVersion ?? null,
        sampleTreeDepth: 4,
        exampleCount: contract.examples?.length ?? 0,
        responsivePresentations: Object.fromEntries(
          Object.entries(contract.responsiveMapping ?? {}).map(([viewport, rule]) => [
            viewport,
            rule.defaultPresentation,
          ]),
        ),
        hostChromeIsCore: contract.topAppBar?.hostChromeIsCoreComponent ?? null,
      },
    };
  }));

  checks.push(runCheck('motion-foundation', () => {
    const contract = canonicalSources.motionContract?.value;
    const schema = canonicalSources.motionSchema?.value;
    const errors = [];
    if (!contract) errors.push('canonical motionContract source is unavailable.');
    if (!schema) errors.push('canonical motionSchema source is unavailable.');
    if (errors.length) return { errors };

    return {
      errors: validateMotionFoundationContract(contract, schema),
      evidence: {
        schemaVersion: contract.schemaVersion ?? null,
        intentCount: contract.intents?.length ?? 0,
        reducedMotionFirstClass: contract.reducedMotion?.firstClass === true,
      },
    };
  }));

  checks.push(runCheck('component-contracts', () => {
    const catalogPath = canonicalSources.componentIndex?.resolvedPath;
    const schemaPath = canonicalSources.componentSchema?.resolvedPath;
    const errors = [];
    if (!catalogPath) errors.push('canonical componentIndex source is unavailable.');
    if (!schemaPath) errors.push('canonical componentSchema source is unavailable.');
    if (errors.length) return { errors };

    const result = validateComponentCatalog(repoRoot, { catalogPath, schemaPath });
    return {
      errors: result.errors,
      evidence: {
        componentCount: result.evidence.componentCount,
        contractFileCount: result.evidence.contractFiles?.length ?? 0,
        previewFileCount: result.evidence.previewFiles?.length ?? 0,
      },
    };
  }));

  checks.push(runCheck('iconography', () => {
    const iconography = canonicalSources.iconography?.value;
    const schema = canonicalSources.iconographySchema?.value;
    const errors = [];
    if (!iconography) errors.push('canonical iconography source is unavailable.');
    if (!schema) errors.push('canonical iconographySchema source is unavailable.');
    if (errors.length) return { errors };
    return {
      errors: validateIconographyContract(iconography, schema),
      evidence: {
        coreIconCount: iconography.icons?.length ?? 0,
        providerCount: iconography.providers?.length ?? 0,
        defaultCoreProvider: iconography.defaultCoreProvider ?? null,
      },
    };
  }));

  checks.push(runCheck('canonical-design-model', () => {
    canonicalModel = buildCanonicalDesignModel(repoRoot);
    return {
      errors: [],
      evidence: {
        schemaVersion: canonicalModel.schemaVersion,
        id: canonicalModel.id,
        sourceSha256: canonicalModel.sourceHash,
        tokenCount: canonicalModel.tokens?.entries?.length ?? 0,
        componentCount: canonicalModel.components?.length ?? 0,
        compositeCount: canonicalModel.composites?.length ?? 0,
        patternCount: canonicalModel.patterns?.length ?? 0,
        navigationFoundationId: canonicalModel.navigation?.id ?? null,
        platformCount: canonicalModel.platform?.platforms?.length ?? 0,
      },
    };
  }));

  let manifestSha256 = null;
  try {
    manifestSha256 = sha256File(sourceIntegrity.evidence.manifestPath);
  } catch {
    // The source-integrity check already explains why the manifest is unreadable.
  }

  const portableChecks = checks.map((check) => ({
    ...check,
    errors: check.errors.map((message) => normalizeRepositoryMessage(repoRoot, message)),
    warnings: check.warnings.map((message) => normalizeRepositoryMessage(repoRoot, message)),
  }));

  return buildValidationEvidence({
    checks: portableChecks,
    productVersion: manifest?.$metadata?.version ?? null,
    manifestSha256,
    sourceSha256: canonicalModel?.sourceHash ?? null,
  });
}

export function writeValidationEvidence(repoRoot, evidence, relativePath = DEFAULT_EVIDENCE_PATH) {
  const outputPath = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  return relativePath.split(path.sep).join('/');
}
