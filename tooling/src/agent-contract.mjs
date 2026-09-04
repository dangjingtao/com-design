import fs from 'node:fs';
import path from 'node:path';
import { buildCanonicalDesignModel } from './design-model.mjs';
import { validatePlatformContext } from './platform-context.mjs';
import { validateSourceIntegrity } from './source-integrity.mjs';
import { engineeringAdapterRegistry } from './adapters/registry.mjs';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizePlatform(platform) {
  return String(platform ?? '').trim().toLowerCase().replaceAll('_', '-');
}

const PLATFORM_OWNER = Object.freeze({
  web: 'T007',
  ios: 'T008',
  android: 'T008',
  'wechat-mini-program': 'T009',
});

const PLATFORM_SUPPORTING_FAMILY = Object.freeze({
  web: 'web',
  ios: 'native-mobile',
  android: 'native-mobile',
  'wechat-mini-program': 'mini-program',
});

function implementationPath(platform, registeredAdapters) {
  if (!platform) return null;
  const maturity = platform.maturity ?? { status: 'planned', basis: 'No adapter maturity declared.' };
  const supportingFamily = PLATFORM_SUPPORTING_FAMILY[platform.platform];
  const supportingOutputs = registeredAdapters.filter((adapter) => adapter.family === supportingFamily);
  const ready = maturity.status === 'implemented' || maturity.status === 'verified';

  return {
    platform: platform.platform,
    readiness: ready ? 'ready' : 'incomplete',
    maturity,
    ownerTask: PLATFORM_OWNER[platform.platform] ?? null,
    supportingOutputs,
    rule: ready
      ? 'Use the platform adapter contract and its declared engineering outputs.'
      : 'Do not infer a finished platform implementation from Web or shared token outputs. Consume Core semantics, preserve platform context, and escalate the missing adapter capability to the owner task.',
  };
}

export function createAgentContract(repoRoot, options = {}) {
  const model = buildCanonicalDesignModel(repoRoot);
  const sourceIntegrity = validateSourceIntegrity(repoRoot);
  if (sourceIntegrity.errors.length) {
    throw new Error(`Agent contract source integrity failed:\n- ${sourceIntegrity.errors.join('\n- ')}`);
  }

  const iconography = sourceIntegrity.evidence.canonicalSources.iconography?.value
    ?? readJson(path.join(repoRoot, 'design-source', 'specs', 'iconography.json'));
  const motion = sourceIntegrity.evidence.canonicalSources.motionContract?.value ?? null;
  const contextSchema = sourceIntegrity.evidence.canonicalSources.platformContextSchema?.value;

  const context = options.context ?? null;
  if (context !== null) {
    const contextErrors = validatePlatformContext(context, contextSchema);
    if (contextErrors.length) {
      throw new Error(`Invalid Com Design platform context:\n- ${contextErrors.join('\n- ')}`);
    }
  }

  const requestedPlatform = normalizePlatform(options.platform ?? context?.platform);
  if (options.platform && context?.platform && normalizePlatform(options.platform) !== normalizePlatform(context.platform)) {
    throw new Error(`Target platform ${options.platform} conflicts with context.platform ${context.platform}.`);
  }

  const platforms = model.platform?.platforms ?? [];
  const platform = requestedPlatform
    ? platforms.find((entry) => normalizePlatform(entry.platform) === requestedPlatform)
    : null;

  if (requestedPlatform && !platform) {
    throw new Error(`Unknown Com Design target platform: ${options.platform ?? context?.platform}`);
  }

  const registeredAdapters = engineeringAdapterRegistry.list();
  const targetImplementation = implementationPath(platform, registeredAdapters);
  const productIcons = (iconography.icons ?? []).filter((entry) => String(entry.namespace ?? '').startsWith('product.'));

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
      context,
      implementationPath: targetImplementation,
    },
    catalogs: {
      tokens: model.tokens.entries,
      components: model.components,
      composites: model.composites,
      patterns: model.patterns,
      motion,
      platformAdapters: platforms,
      registeredEngineeringOutputs: registeredAdapters,
      icons: {
        providerKinds: iconography.providerKinds,
        providers: iconography.providers,
        defaultCoreProvider: iconography.defaultCoreProvider,
        entries: iconography.icons,
      },
    },
    layers: {
      core: {
        catalogs: ['tokens', 'components', 'composites', 'patterns', 'motion'],
        rule: 'Core semantics remain platform-neutral and cannot be forked by a consumer.',
      },
      productExtension: {
        entries: productIcons,
        mayMutateCore: false,
        rule: 'Product extensions use product-scoped namespaces and must not redefine Core contracts.',
      },
      platformAdapter: {
        target: targetImplementation,
        allTargets: platforms,
        rule: 'Platform adapters map presentation and host capabilities without redefining Core semantics.',
      },
    },
    compliance: {
      hard: {
        result: 'pass|fail',
        rules: [
          'canonical-source-integrity',
          'schema-and-reference-integrity',
          'required-state-and-anatomy',
          'platform-context-validity',
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
