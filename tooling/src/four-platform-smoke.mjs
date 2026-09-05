import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { buildCanonicalDesignModel } from './design-model.mjs';
import { engineeringAdapterRegistry } from './adapters/registry.mjs';
import { validatePlatformContext } from './platform-context.mjs';
import { validateSourceIntegrity } from './source-integrity.mjs';
import { buildTokenModel } from './token-model.mjs';

const EVIDENCE_ID = 'com-design:four-platform-smoke:v1';
const OUTPUT_PATH = path.join('dist', 'smoke', 'four-platform.json');

export const representativeSmokeContexts = Object.freeze({
  web: Object.freeze({
    schemaVersion: 2,
    platform: 'web',
    viewport: 'wide',
    input: 'hybrid',
    motion: 'reduced',
    colorScheme: 'light',
    contentScale: 'standard',
  }),
  ios: Object.freeze({
    schemaVersion: 2,
    platform: 'ios',
    viewport: 'compact',
    input: 'touch',
    motion: 'reduced',
    colorScheme: 'light',
    contentScale: 'standard',
  }),
  android: Object.freeze({
    schemaVersion: 2,
    platform: 'android',
    viewport: 'compact',
    input: 'touch',
    motion: 'reduced',
    colorScheme: 'light',
    contentScale: 'standard',
  }),
  'wechat-mini-program': Object.freeze({
    schemaVersion: 2,
    platform: 'wechat-mini-program',
    viewport: 'compact',
    input: 'touch',
    motion: 'reduced',
    colorScheme: 'light',
    contentScale: 'standard',
  }),
});

const REPRESENTATIVE_COMPONENTS = Object.freeze([
  'button',
  'select',
  'top-app-bar',
  'bottom-sheet',
  'search-field',
]);

function hash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function check(id, layer, condition, message, evidence = {}) {
  return {
    id,
    layer,
    status: condition ? 'pass' : 'fail',
    errors: condition ? [] : [message],
    evidence,
  };
}

function includesAll(actual, expected) {
  return expected.every((value) => actual.includes(value));
}

function componentBySlug(model, slug) {
  return model.components?.find((component) => component.slug === slug) ?? null;
}

function semanticSnapshot(component) {
  const contract = component?.contract ?? {};
  return {
    componentId: component?.id ?? null,
    sourceRevision: component?.provenance?.contract?.sourceHash ?? null,
    semanticTypeCandidates: contract.semanticTypeCandidates ?? [],
    states: contract.variantDimensions?.state ?? [],
    hierarchy: contract.variantDimensions?.hierarchy ?? [],
    presentation: contract.variantDimensions?.presentation ?? [],
    selectionMode: contract.selectionModel?.mode ?? null,
    anatomy: contract.anatomy ?? [],
    interactionContract: contract.interactionContract ?? [],
  };
}

function contractChecks(model) {
  const checks = [];
  const cases = Object.fromEntries(
    REPRESENTATIVE_COMPONENTS.map((slug) => [slug, componentBySlug(model, slug)]),
  );

  for (const [slug, component] of Object.entries(cases)) {
    checks.push(check(
      'contract:exists:' + slug,
      'contract',
      Boolean(component?.contract),
      'Representative component contract is missing: ' + slug + '.',
      { slug },
    ));
  }

  const button = cases.button?.contract ?? {};
  checks.push(check(
    'contract:button-state-hierarchy',
    'contract',
    includesAll(button.variantDimensions?.state ?? [], ['default', 'pressed', 'disabled'])
      && includesAll(
        button.variantDimensions?.hierarchy ?? [],
        ['primary', 'secondary', 'tertiary', 'destructive'],
      ),
    'Button must preserve representative authoritative states and action hierarchy.',
    { snapshot: semanticSnapshot(cases.button) },
  ));

  const select = cases.select?.contract ?? {};
  checks.push(check(
    'contract:select-single-choice',
    'contract',
    select.selectionModel?.mode === 'single'
      && includesAll(
        select.variantDimensions?.state ?? [],
        ['empty', 'value', 'open', 'error', 'disabled'],
      )
      && includesAll(
        select.variantDimensions?.presentation ?? [],
        ['bottom-sheet', 'anchored-listbox', 'native-picker'],
      ),
    'Select must keep one single-selection semantic model across presentation adapters.',
    { snapshot: semanticSnapshot(cases.select) },
  ));

  const topAppBar = cases['top-app-bar']?.contract ?? {};
  checks.push(check(
    'contract:top-app-bar-host-boundary',
    'contract',
    (topAppBar.interactionContract ?? []).length > 0
      && (topAppBar.platformPresentationRefs ?? []).some(
        (entry) => entry.ref === 'sources.platformEnvironment',
      )
      && (topAppBar.anatomy ?? []).includes('title'),
    'Top App Bar must keep navigation semantics while resolving host chrome outside Core.',
    { snapshot: semanticSnapshot(cases['top-app-bar']) },
  ));

  const bottomSheet = cases['bottom-sheet']?.contract ?? {};
  checks.push(check(
    'contract:bottom-sheet-safe-area',
    'contract',
    (bottomSheet.anatomy ?? []).includes('safeArea')
      && (bottomSheet.usageHints ?? []).some((hint) => hint.includes('platform-owned')),
    'Bottom Sheet must preserve modal task semantics while leaving safe area to the platform layer.',
    { snapshot: semanticSnapshot(cases['bottom-sheet']) },
  ));

  const search = cases['search-field']?.contract ?? {};
  checks.push(check(
    'contract:search-state-model',
    'contract',
    includesAll(
      search.variantDimensions?.state ?? [],
      ['idle', 'focused', 'query', 'loading', 'disabled'],
    ),
    'Search Field must preserve its query/focus/loading/disabled state vocabulary.',
    { snapshot: semanticSnapshot(cases['search-field']) },
  ));

  const invariants = model.layoutInput?.contract?.adaptation?.invariants ?? {};
  checks.push(check(
    'contract:t012-cross-platform-invariants',
    'contract',
    invariants.coreSemanticsMutable === false
      && invariants.actionHierarchyMutable === false
      && invariants.taskResultMutable === false
      && invariants.authoritativeStateMutable === false
      && invariants.semanticOrderMutable === false,
    'T012 must forbid platform adaptation from changing Core semantics, action hierarchy, task result, authoritative state, or semantic order.',
    { invariants },
  ));

  const snapshots = Object.fromEntries(
    Object.entries(cases).map(([slug, component]) => {
      const snapshot = semanticSnapshot(component);
      return [slug, { ...snapshot, semanticHash: hash(snapshot) }];
    }),
  );

  return { checks, snapshots };
}

function parseJsonOutput(outputs, relativePath) {
  const content = outputs.get(relativePath);
  if (typeof content !== 'string') return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function artifactForPlatform(outputs, platform) {
  if (platform === 'web') {
    return {
      path: 'dist/tailwind/adapter.json',
      payload: parseJsonOutput(outputs, 'dist/tailwind/adapter.json'),
    };
  }
  if (platform === 'wechat-mini-program') {
    return {
      path: 'dist/wechat-mini-program/adapter.json',
      payload: parseJsonOutput(outputs, 'dist/wechat-mini-program/adapter.json'),
    };
  }
  return {
    path: 'dist/native-mobile/adapter.json',
    payload: parseJsonOutput(outputs, 'dist/native-mobile/adapter.json'),
  };
}

function adapterFacts(platform, payload) {
  if (!payload) return null;
  if (platform === 'web') {
    return {
      sourceHash: payload.source?.sourceHash ?? null,
      coreSemanticFork: payload.contract?.coreSemanticFork,
      platformDeclared: payload.targetPlatform?.platform === 'web',
      pointer: payload.capabilities?.pointer ?? null,
      keyboard: payload.capabilities?.keyboard ?? null,
      focus: payload.capabilities?.focus ?? null,
    };
  }
  if (platform === 'wechat-mini-program') {
    return {
      sourceHash: payload.source?.sourceHash ?? null,
      coreSemanticFork: payload.contract?.coreSemanticFork,
      platformDeclared: payload.targetPlatform?.platform === platform,
      runtimeHooks: payload.environment?.runtimeHooks ?? null,
      hostChromeOwnedByComDesign: payload.environment?.hostChromeOwnedByComDesign,
      motion: payload.motion ?? null,
    };
  }
  return {
    sourceHash: payload.source?.sourceHash ?? null,
    coreSemanticFork: payload.contract?.coreSemanticFork,
    platformDeclared: Boolean(payload.platforms?.[platform]),
    touch: payload.platforms?.[platform]?.touch ?? null,
    environment: payload.platforms?.[platform]?.environment ?? null,
    motion: payload.motion?.intentContract?.platforms?.[platform] ?? null,
  };
}

function environmentForPlatform(platformEnvironment, platform) {
  return platformEnvironment?.examples?.find((entry) => entry.platform === platform) ?? null;
}

function platformChecks({
  platform,
  context,
  schema,
  canonicalModel,
  platformEnvironment,
  outputs,
  semanticHashes,
}) {
  const checks = [];
  const contextErrors = validatePlatformContext(context, schema);
  checks.push(check(
    'context:' + platform,
    'platform-context',
    contextErrors.length === 0,
    'Invalid representative platform context for ' + platform + ': ' + contextErrors.join(' '),
    { context, errors: contextErrors },
  ));

  const env = environmentForPlatform(platformEnvironment, platform);
  checks.push(check(
    'environment:' + platform,
    'platform-context',
    Boolean(env?.snapshot),
    'Platform environment example is missing for ' + platform + '.',
    { example: env?.name ?? null },
  ));

  const artifact = artifactForPlatform(outputs, platform);
  const facts = adapterFacts(platform, artifact.payload);
  checks.push(check(
    'adapter:artifact:' + platform,
    'adapter',
    Boolean(facts),
    'Adapter artifact is missing or invalid for ' + platform + '.',
    { path: artifact.path },
  ));
  checks.push(check(
    'adapter:source-parity:' + platform,
    'adapter',
    Boolean(facts?.sourceHash)
      && facts.sourceHash === canonicalModel.sourceHash,
    'Adapter source revision does not match Canonical Design Model V2 for ' + platform + '.',
    {
      expected: canonicalModel.sourceHash,
      actual: facts?.sourceHash ?? null,
    },
  ));
  checks.push(check(
    'adapter:no-core-semantic-fork:' + platform,
    'adapter',
    facts?.coreSemanticFork === false && facts?.platformDeclared === true,
    'Platform adapter must declare its target and must not fork Core semantics: ' + platform + '.',
    { facts },
  ));

  const motion = canonicalModel.motion?.contract?.platforms?.[platform];
  checks.push(check(
    'platform-context:reduced-motion:' + platform,
    'platform-context',
    context.motion === 'reduced'
      && canonicalModel.motion?.contract?.reducedMotion?.firstClass === true
      && Boolean(motion?.reducedMotionSignal),
    'Representative reduced-motion path is incomplete for ' + platform + '.',
    {
      requested: context.motion,
      reducedMotionFirstClass: canonicalModel.motion?.contract?.reducedMotion?.firstClass ?? null,
      platformMotion: motion ?? null,
    },
  ));

  const snapshot = env?.snapshot;
  if (platform === 'web') {
    checks.push(check(
      'platform-context:web-input',
      'platform-context',
      context.input === 'hybrid'
        && snapshot?.pointer?.hover === true
        && snapshot?.keyboardIme?.supported === true
        && snapshot?.focus?.focusVisible === 'required',
      'Web smoke must cover pointer + keyboard/focus through a hybrid input context.',
      {
        input: context.input,
        pointer: snapshot?.pointer ?? null,
        keyboardIme: snapshot?.keyboardIme ?? null,
        focus: snapshot?.focus ?? null,
      },
    ));
  } else {
    checks.push(check(
      'platform-context:touch:' + platform,
      'platform-context',
      context.input === 'touch'
        && snapshot?.keyboardIme?.supported === true,
      'Touch smoke path must retain keyboard/IME environment capability for ' + platform + '.',
      { input: context.input, keyboardIme: snapshot?.keyboardIme ?? null },
    ));
  }

  if (platform === 'ios') {
    checks.push(check(
      'adapter:ios-touch-safe-area',
      'adapter',
      facts?.touch?.minimum === 44
        && (snapshot?.geometry?.safeAreaInsets?.bottom ?? 0) > 0,
      'iOS smoke must resolve 44pt touch policy and system safe-area geometry.',
      { touch: facts?.touch ?? null, safeArea: snapshot?.geometry?.safeAreaInsets ?? null },
    ));
  }

  if (platform === 'android') {
    checks.push(check(
      'adapter:android-touch-back',
      'adapter',
      facts?.touch?.minimum === 48
        && snapshot?.back?.predictive === true,
      'Android smoke must resolve 48dp touch policy and predictive back environment.',
      { touch: facts?.touch ?? null, back: snapshot?.back ?? null },
    ));
  }

  if (platform === 'wechat-mini-program') {
    const capsule = snapshot?.chrome?.find((entry) => entry.kind === 'host-capsule');
    checks.push(check(
      'platform-context:wechat-host-chrome',
      'platform-context',
      capsule?.owner === 'host'
        && capsule?.comDesignOwned === false
        && facts?.hostChromeOwnedByComDesign === false
        && facts?.runtimeHooks?.safeAreaInsets === 'geometry.safeAreaInsets'
        && facts?.runtimeHooks?.hostChrome === 'chrome',
      'WeChat smoke must treat Capsule / Host Chrome and Safe Area as host/environment facts.',
      {
        capsule: capsule ?? null,
        runtimeHooks: facts?.runtimeHooks ?? null,
      },
    ));
    checks.push(check(
      'adapter:wechat-reduced-motion',
      'adapter',
      facts?.motion?.highFrequencySetDataAnimationAllowed === false
        && facts?.motion?.reducedMotion?.firstClass === true,
      'WeChat adapter must preserve reduced motion and forbid high-frequency frame-by-frame setData animation.',
      { motion: facts?.motion ?? null },
    ));
  }

  return {
    platform,
    context,
    environment: env?.name ?? null,
    adapterPath: artifact.path,
    semanticHashes,
    presentationFacts: {
      adapter: facts,
      safeArea: snapshot?.geometry?.safeAreaInsets ?? null,
      hostChrome: snapshot?.chrome ?? [],
      back: snapshot?.back ?? null,
      pointer: snapshot?.pointer ?? null,
      keyboardIme: snapshot?.keyboardIme ?? null,
      motion,
    },
    checks,
  };
}

export function buildFourPlatformSmokeInputs(repoRoot) {
  const sourceIntegrity = validateSourceIntegrity(repoRoot);
  if (sourceIntegrity.errors.length) {
    throw new Error(
      'Cannot build T018 smoke inputs because source integrity failed:\n- '
        + sourceIntegrity.errors.join('\n- '),
    );
  }

  const canonicalSources = sourceIntegrity.evidence.canonicalSources;
  const foundationPath = canonicalSources.foundation?.resolvedPath;
  const platformEnvironment = canonicalSources.platformEnvironment?.value;
  const contextSchema = canonicalSources.platformContextSchema?.value;
  if (!foundationPath || !platformEnvironment || !contextSchema) {
    throw new Error('T018 smoke requires foundation, platform environment, and context schema sources.');
  }

  const canonicalModel = buildCanonicalDesignModel(repoRoot);
  const tokenModel = buildTokenModel(foundationPath);
  const outputs = engineeringAdapterRegistry.build(tokenModel, {
    canonicalModel,
    platformEnvironment,
  });

  return {
    canonicalModel,
    platformEnvironment,
    contextSchema,
    outputs,
    contexts: clone(representativeSmokeContexts),
  };
}

export function evaluateFourPlatformSmoke(inputs) {
  const {
    canonicalModel,
    platformEnvironment,
    contextSchema,
    outputs,
    contexts = clone(representativeSmokeContexts),
  } = inputs;

  const contract = contractChecks(canonicalModel);
  const semanticHashes = Object.fromEntries(
    Object.entries(contract.snapshots).map(([slug, snapshot]) => [slug, snapshot.semanticHash]),
  );

  const platforms = Object.keys(representativeSmokeContexts).map((platform) =>
    platformChecks({
      platform,
      context: contexts[platform],
      schema: contextSchema,
      canonicalModel,
      platformEnvironment,
      outputs,
      semanticHashes,
    }),
  );

  const allChecks = [
    ...contract.checks,
    ...platforms.flatMap((entry) => entry.checks),
  ];
  const failures = allChecks.filter((entry) => entry.status === 'fail');

  return {
    schemaVersion: 1,
    id: EVIDENCE_ID,
    $metadata: {
      authority: 'derived-build-artifact',
      editable: false,
      sourceOfTruth: 'design-source/',
      owner: 'T018',
    },
    result: failures.length ? 'fail' : 'pass',
    source: {
      canonicalModelId: canonicalModel.id,
      canonicalSourceHash: canonicalModel.sourceHash,
    },
    invariants: {
      semanticSource: 'canonical-component-contract',
      platformDifferenceSources: [
        'platform-adapter',
        'platform-environment',
        'motion-platform-foundation',
      ],
      pixelEqualityRequired: false,
    },
    summary: {
      checks: allChecks.length,
      passed: allChecks.length - failures.length,
      failed: failures.length,
      platforms: platforms.length,
      representativeComponents: REPRESENTATIVE_COMPONENTS.length,
    },
    representativeComponents: contract.snapshots,
    platforms: platforms.map(({ checks, ...entry }) => ({
      ...entry,
      result: checks.some((item) => item.status === 'fail') ? 'fail' : 'pass',
      checks,
    })),
    failures: failures.map((entry) => ({
      id: entry.id,
      layer: entry.layer,
      errors: entry.errors,
    })),
  };
}

export function runFourPlatformSmoke(repoRoot) {
  return evaluateFourPlatformSmoke(buildFourPlatformSmokeInputs(repoRoot));
}

export function writeFourPlatformSmokeEvidence(repoRoot, evidence, relativePath = OUTPUT_PATH) {
  const outputPath = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(evidence, null, 2) + '\n', 'utf8');
  return relativePath.replaceAll('\\', '/');
}
