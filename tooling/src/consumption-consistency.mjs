import fs from 'node:fs';
import path from 'node:path';
import { engineeringAdapterRegistry } from './adapters/registry.mjs';
import { validateSourceIntegrity } from './source-integrity.mjs';

const EXPECTED_PRIORITY = Object.freeze(['ai-agent', 'engineering', 'design']);
const EXPECTED_PLATFORMS = Object.freeze([
  'web',
  'ios',
  'android',
  'wechat-mini-program',
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeRepoPath(value) {
  return String(value ?? '').replaceAll('\\', '/').replace(/^\.\//, '');
}

function sourcePathFromManifest(repoRoot, sourceEvidence) {
  if (!sourceEvidence?.resolvedPath) return null;
  return normalizeRepoPath(path.relative(path.join(repoRoot, 'design-source'), sourceEvidence.resolvedPath));
}

function readTextIfPresent(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

function adapterOutputSet() {
  return new Set(
    engineeringAdapterRegistry
      .list()
      .flatMap((adapter) => adapter.outputPaths)
      .map(normalizeRepoPath),
  );
}

function requireFile(repoRoot, relativePath, errors, label = relativePath) {
  const resolved = path.join(repoRoot, relativePath);
  if (!fs.existsSync(resolved)) {
    errors.push(label + ' points to a missing repository path: ' + relativePath);
    return false;
  }
  return true;
}

function countPhrase(count, noun) {
  return count + ' ' + noun;
}

export function validateConsumptionConsistency(repoRoot) {
  const errors = [];
  const sourceIntegrity = validateSourceIntegrity(repoRoot);
  const canonicalSources = sourceIntegrity.evidence.canonicalSources ?? {};
  const libraryPath = path.join(repoRoot, 'design-source', 'library-consumption.json');

  let library = null;
  try {
    library = readJson(libraryPath);
  } catch (error) {
    return {
      errors: ['design-source/library-consumption.json cannot be parsed: ' + error.message],
      evidence: {},
    };
  }

  if (library.schemaVersion !== 2 || library.id !== 'com-design:library-consumption:v2') {
    errors.push('library-consumption must use the V2 consumption contract.');
  }
  if (library.scope !== 'four-platform') {
    errors.push('library-consumption scope must be four-platform.');
  }
  if (JSON.stringify(library.consumerPriority) !== JSON.stringify(EXPECTED_PRIORITY)) {
    errors.push('consumer priority must remain AI / Agent → engineering → design.');
  }
  if (
    library.authority?.canonicalManifest !== 'specs/design-system-v1.json'
    || library.authority?.canonicalSourceRoot !== 'design-source/'
    || library.authority?.generatedAgentContract !== 'dist/agent/contract.json'
  ) {
    errors.push('library authority must point to the canonical manifest/source root and T014 agent contract.');
  }

  const catalogDefinitions = {
    coreComponents: {
      sourceKey: 'componentIndex',
      collection: 'components',
      count: sourceIntegrity.evidence.catalogCounts?.coreComponents,
    },
    coreCompositeComponents: {
      sourceKey: 'coreComposites',
      collection: 'composites',
      count: sourceIntegrity.evidence.catalogCounts?.coreCompositeComponents,
    },
    corePatterns: {
      sourceKey: 'corePatterns',
      collection: 'patterns',
      count: sourceIntegrity.evidence.catalogCounts?.corePatterns,
    },
  };

  for (const [catalogId, expected] of Object.entries(catalogDefinitions)) {
    const actual = library.catalogs?.[catalogId];
    const expectedPath = sourcePathFromManifest(repoRoot, canonicalSources[expected.sourceKey]);
    if (!actual || actual.source !== expectedPath || actual.collection !== expected.collection) {
      errors.push(
        'library catalog ' + catalogId + ' must reference canonical '
          + expectedPath + '#' + expected.collection + '.',
      );
    }
  }

  for (const forbidden of ['coreComponents', 'coreCompositeComponents', 'corePatterns']) {
    if (Array.isArray(library[forbidden])) {
      errors.push('library-consumption must not duplicate the ' + forbidden + ' catalog as a hand-maintained item list.');
    }
  }

  if (
    library.previewPolicy?.referenceOnly !== true
    || library.previewPolicy?.productionSource !== false
  ) {
    errors.push('Preview must remain reference-only and must never be a production source.');
  }
  if (
    !String(library.previewPolicy?.rule ?? '').includes('Platform Adapter')
    || !String(library.previewPolicy?.rule ?? '').includes('DOM/CSS')
  ) {
    errors.push('Preview policy must explicitly direct production code to Platform Adapters instead of DOM/CSS copying.');
  }

  const outputPaths = adapterOutputSet();
  for (const platform of EXPECTED_PLATFORMS) {
    const declaration = library.platformAdapters?.[platform];
    if (!declaration?.contract) {
      errors.push('library-consumption must declare a contract path for platform: ' + platform);
      continue;
    }
    if (!outputPaths.has(normalizeRepoPath(declaration.contract))) {
      errors.push('platform adapter contract is not a registered engineering output for ' + platform + ': ' + declaration.contract);
    }
    for (const output of declaration.engineeringConsumers ?? []) {
      if (!outputPaths.has(normalizeRepoPath(output))) {
        errors.push('engineering consumer is not a registered adapter output for ' + platform + ': ' + output);
      }
    }
  }

  const canonicalReadOrder = library.recommendedReadOrder?.canonicalMachine ?? [];
  if (!Array.isArray(canonicalReadOrder) || canonicalReadOrder.length === 0) {
    errors.push('canonical machine read order must be a non-empty array.');
  } else {
    const componentSlugs = canonicalSources.componentIndex?.value?.components
      ?.map((entry) => entry?.slug)
      .filter(Boolean) ?? [];
    for (const relativePath of canonicalReadOrder) {
      if (relativePath === 'components/{slug}.json') {
        for (const slug of componentSlugs) {
          requireFile(
            repoRoot,
            path.join('design-source', 'components', slug + '.json'),
            errors,
            'canonical machine read order',
          );
        }
        continue;
      }
      requireFile(
        repoRoot,
        path.join('design-source', relativePath),
        errors,
        'canonical machine read order',
      );
    }
  }

  const aiReadOrder = library.recommendedReadOrder?.aiAgent ?? [];
  if (aiReadOrder[0] !== 'dist/agent/contract.json') {
    errors.push('AI / Agent read order must start from the generated T014 agent contract.');
  }
  for (const relativePath of aiReadOrder.slice(1)) {
    if (relativePath === 'design-source/components/{slug}.json') continue;
    requireFile(repoRoot, relativePath, errors, 'AI / Agent read order');
  }

  const humanPaths = library.recommendedReadOrder?.human ?? [];
  for (const relativePath of humanPaths) {
    requireFile(repoRoot, relativePath, errors, 'human read order');
  }

  if (
    library.downstreamConsumers?.penpot?.manifest !== 'penpot/build/manifest.json'
    || library.downstreamConsumers?.penpot?.upstreamAuthority !== false
  ) {
    errors.push('Penpot must remain a governed downstream consumer at penpot/build/manifest.json.');
  }
  if (
    library.downstreamConsumers?.humanGuide?.acceptedReport !== 'report/design-system-v1/'
    || library.downstreamConsumers?.humanGuide?.upstreamAuthority !== false
  ) {
    errors.push('Human Guide must remain downstream acceptance evidence at report/design-system-v1/.');
  }

  requireFile(repoRoot, 'report/design-system-v1', errors, 'accepted human report');
  requireFile(repoRoot, 'design-source/preview', errors, 'preview root');

  const rootReadme = readTextIfPresent(path.join(repoRoot, 'README.md'));
  const sourceReadme = readTextIfPresent(path.join(repoRoot, 'design-source', 'README.md'));
  const skill = readTextIfPresent(path.join(repoRoot, 'design-source', 'SKILL.md'));

  for (const [label, text] of [
    ['root README', rootReadme],
    ['design-source README', sourceReadme],
    ['SKILL', skill],
  ]) {
    if (text === null) {
      errors.push(label + ' is missing.');
      continue;
    }
    if (/Com Design Mobile|公司级移动端设计系统/.test(text)) {
      errors.push(label + ' still describes Com Design as Mobile-only.');
    }
  }

  if (rootReadme?.includes('当前尚未实现')) {
    errors.push('root README still claims current engineering adapters are not implemented.');
  }
  if (/read preview first|DOM\/CSS source; read preview first|copy preview structures/i.test(skill ?? '')) {
    errors.push('SKILL still tells production consumers to treat Preview DOM/CSS as an implementation source.');
  }

  const counts = {
    coreComponents: catalogDefinitions.coreComponents.count ?? 0,
    coreCompositeComponents: catalogDefinitions.coreCompositeComponents.count ?? 0,
    corePatterns: catalogDefinitions.corePatterns.count ?? 0,
  };
  const publicDocs = [
    ['root README', rootReadme],
    ['design-source README', sourceReadme],
    ['SKILL', skill],
  ];
  for (const [label, text] of publicDocs) {
    if (!text) continue;
    for (const [catalogId, noun] of [
      ['coreComponents', 'Core Components'],
      ['coreCompositeComponents', 'Core Composite Components'],
      ['corePatterns', 'Core UX Patterns'],
    ]) {
      if (!text.includes(countPhrase(counts[catalogId], noun))) {
        errors.push(label + ' must publish the canonical ' + countPhrase(counts[catalogId], noun) + ' fact.');
      }
    }
  }

  return {
    errors,
    evidence: {
      schemaVersion: library.schemaVersion ?? null,
      scope: library.scope ?? null,
      consumerPriority: library.consumerPriority ?? [],
      catalogCounts: counts,
      platforms: Object.keys(library.platformAdapters ?? {}).sort(),
      previewReferenceOnly: library.previewPolicy?.referenceOnly === true,
      previewProductionSource: library.previewPolicy?.productionSource === true,
      generatedAgentContract: library.authority?.generatedAgentContract ?? null,
    },
  };
}
