import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { nativeMobileAdapter } from '../src/adapters/native-mobile.mjs';
import { buildCanonicalDesignModel } from '../src/design-model.mjs';
import { validateSourceIntegrity } from '../src/source-integrity.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function buildContext() {
  const sourceIntegrity = validateSourceIntegrity(repoRoot);
  return {
    canonicalModel: buildCanonicalDesignModel(repoRoot),
    platformEnvironment:
      sourceIntegrity.evidence.canonicalSources.platformEnvironment?.value ?? null,
  };
}

test('Native Mobile Adapter V2 makes iOS and Android first-class platform contracts', () => {
  const context = buildContext();
  const files = nativeMobileAdapter.build(null, context);
  const evidence = JSON.parse(files.get('dist/native-mobile/adapter.json'));

  assert.equal(evidence.id, 'com-design:native-mobile-adapter:v2');
  assert.equal(evidence.source.modelId, 'com-design:canonical-model:v2');
  assert.equal(evidence.platforms.ios.targetPlatform.platform, 'ios');
  assert.equal(evidence.platforms.android.targetPlatform.platform, 'android');
  assert.equal(evidence.platforms.ios.touch.minimum, 44);
  assert.equal(evidence.platforms.android.touch.minimum, 48);
  assert.equal(evidence.platforms.ios.touch.source.scope, 'base');
  assert.equal(evidence.platforms.android.touch.source.scope, 'platformAndroid');
  assert.deepEqual(evidence.platforms.ios.context.axes.input, ['touch', 'pointer', 'keyboard', 'hybrid']);
  assert.deepEqual(evidence.platforms.android.context.axes.viewport, ['compact', 'medium', 'wide']);
  assert.equal(evidence.platforms.ios.context.platformDoesNotInferAxes, true);
  assert.equal(evidence.platforms.android.context.platformDoesNotInferAxes, true);
  assert.equal(evidence.platforms.ios.unit, 'logical-point');
  assert.equal(evidence.platforms.android.unit, 'density-independent-pixel');
  assert.equal(evidence.contract.reactNativeIsPlatformDefinition, false);
  assert.equal(evidence.contract.coreSemanticFork, false);
});

test('Native Mobile Adapter V2 emits native-safe shadow, motion and typography structures', () => {
  const context = buildContext();
  const files = nativeMobileAdapter.build(null, context);
  const raw = files.get('dist/native-mobile/adapter.json');
  const evidence = JSON.parse(raw);

  assert.deepEqual(evidence.shadow.light['1'].offset, { x: 0, y: 4 });
  assert.equal(evidence.shadow.light['1'].blurRadius, 12);
  assert.deepEqual(evidence.shadow.light['1'].color, { r: 23, g: 27, b: 42, a: 0.14 });
  assert.equal(evidence.motion.tokens.durationsMs.fast, 120);
  assert.deepEqual(
    evidence.motion.tokens.easingCurves.standard,
    { kind: 'cubicBezier', controlPoints: [0.3, 0, 0, 1] },
  );
  assert.equal(evidence.typography.styles.body.fontSize, 16);
  assert.equal(evidence.typography.styles.body.lineHeight, 24);
  assert.equal(evidence.typography.styles.body.fontFamilyRole, 'platform-system');
  assert.equal(evidence.typography.fontFamilyPolicy.cssFontFamilyStackRequired, false);

  assert.equal(evidence.contract.cssBoxShadowStringsRequired, false);
  assert.equal(evidence.contract.cssCubicBezierStringsRequired, false);
  assert.equal(evidence.contract.cssFontFamilyStackRequired, false);
  assert.doesNotMatch(raw, /box-shadow/i);
  assert.doesNotMatch(raw, /cubic-bezier\s*\(/i);
  assert.doesNotMatch(raw, /system-ui\s*,\s*-apple-system/i);
});

test('Native Mobile Adapter V2 consumes canonical T011 motion semantics instead of redefining them', () => {
  const context = buildContext();
  const baseline = JSON.parse(
    nativeMobileAdapter.build(null, context).get('dist/native-mobile/adapter.json'),
  );
  assert.equal(
    baseline.motion.intentContract.id,
    'com-design:motion-foundation:v2',
  );
  assert.deepEqual(
    baseline.motion.intentContract.reducedMotion,
    context.canonicalModel.motion.contract.reducedMotion,
  );

  const mutatedModel = structuredClone(context.canonicalModel);
  mutatedModel.motion.contract.intents[0].notes =
    'review-fixture-proves-native-adapter-consumes-canonical-motion';
  const mutated = JSON.parse(
    nativeMobileAdapter.build(null, {
      ...context,
      canonicalModel: mutatedModel,
    }).get('dist/native-mobile/adapter.json'),
  );
  assert.equal(
    mutated.motion.intentContract.intents[0].notes,
    'review-fixture-proves-native-adapter-consumes-canonical-motion',
  );
});

test('Native Mobile Adapter V2 preserves RN and NativeWind as migration consumers, not platform truth', () => {
  const evidence = JSON.parse(
    nativeMobileAdapter.build(null, buildContext()).get('dist/native-mobile/adapter.json'),
  );

  assert.equal(evidence.migration.nativewind.adapterId, 'native-mobile.nativewind');
  assert.equal(evidence.migration.reactNative.adapterId, 'native-mobile.react-native');
  assert.equal(evidence.migration.nativewind.status, 'compatible-engineering-consumer');
  assert.equal(evidence.migration.reactNative.status, 'compatible-engineering-consumer');
  assert.match(evidence.migration.reactNative.rule, /Existing tokens\.ts remains available/);
});

test('Native Mobile Adapter V2 rejects missing canonical motion or platform environment evidence', () => {
  assert.throws(
    () => nativeMobileAdapter.build(null, {}),
    /requires Canonical Design Model V2/,
  );

  const context = buildContext();
  assert.throws(
    () => nativeMobileAdapter.build(null, {
      ...context,
      canonicalModel: { ...context.canonicalModel, motion: null },
    }),
    /requires canonical T011 motion foundation/,
  );
  assert.throws(
    () => nativeMobileAdapter.build(null, {
      canonicalModel: context.canonicalModel,
      platformEnvironment: null,
    }),
    /requires canonical ios platform environment evidence/,
  );
});
