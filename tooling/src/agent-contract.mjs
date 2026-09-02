import fs from 'node:fs';
import path from 'node:path';
import { buildCanonicalDesignModel } from './design-model.mjs';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizePlatform(platform) {
  return String(platform ?? '').trim().toLowerCase().replaceAll('_', '-');
}

export function createAgentContract(repoRoot, options = {}) {
  const model = buildCanonicalDesignModel(repoRoot);
  const iconography = readJson(path.join(repoRoot, 'design-source', 'specs', 'iconography.json'));
  const requestedPlatform = normalizePlatform(options.platform);
  const platforms = model.platform?.platforms ?? [];
  const platform = requestedPlatform
    ? platforms.find((entry) => normalizePlatform(entry.platform) === requestedPlatform)
    : null;

  if (requestedPlatform && !platform) {
    throw new Error(`Unknown Com Design target platform: ${options.platform}`);
  }

  return {
    schemaVersion: 1,
    id: 'com-design:agent-contract:v1',
    sourceHash: model.sourceHash,
    authority: {
      canonicalSource: 'design-source/',
      generatedModel: 'dist/design-model-v2.json',
      agentMayRelease: false,
      humanDecisionRequiredFor: ['product-quality', 'aesthetic-quality', 'platform-exception', 'release'],
    },
    target: {
      platform: platform ?? null,
      context: options.context ?? null,
    },
    catalogs: {
      tokens: model.tokens.entries,
      components: model.components,
      composites: model.composites,
      patterns: model.patterns,
      platformAdapters: platforms,
      icons: {
        providerKinds: iconography.providerKinds,
        providers: iconography.providers,
        defaultCoreProvider: iconography.defaultCoreProvider,
        entries: iconography.icons,
      },
    },
    layers: {
      core: ['tokens', 'components', 'composites', 'patterns'],
      productExtension: ['product.* icon namespaces', 'product-scoped contract extensions'],
      platformAdapter: ['platformAdapters'],
    },
    compliance: {
      hard: {
        result: 'pass|fail',
        rules: [
          'canonical-source-integrity',
          'schema-and-reference-integrity',
          'required-state-and-anatomy',
          'platform-adapter-availability',
          'accessibility-and-semantic-constraints',
          'generated-output-source-parity'
        ]
      },
      soft: {
        result: 'warning[]',
        rules: ['information-hierarchy', 'visual-balance', 'brand-restraint', 'platform-naturalness', 'motion-quality']
      },
      evidence: 'evidence[]',
      exceptions: 'exception[]',
      humanDecision: 'accept|revise|reject'
    }
  };
}

export function evaluateAgentCompliance({ hardFailures = [], warnings = [], evidence = [], exceptions = [] } = {}) {
  return {
    hardCompliance: hardFailures.length ? 'fail' : 'pass',
    hardFailures: [...hardFailures],
    warnings: [...warnings],
    evidence: [...evidence],
    exceptions: [...exceptions],
    humanDecision: 'required'
  };
}

export function writeAgentContract(repoRoot, options = {}) {
  const output = createAgentContract(repoRoot, options);
  const suffix = options.platform ? `-${normalizePlatform(options.platform)}` : '';
  const relativePath = `dist/agent/contract${suffix}.json`;
  const outputPath = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  return relativePath;
}
