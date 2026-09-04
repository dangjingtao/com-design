import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { wechatMiniProgramAdapter } from '../src/adapters/wechat-mini-program.mjs';
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

function evaluateCommonJs(source) {
  const module = { exports: {} };
  new Function('module', 'exports', source)(module, module.exports);
  return module.exports;
}

function readPath(value, dottedPath) {
  return dottedPath.split('.').reduce((current, key) => current?.[key], value);
}

test('WeChat Mini Program adapter emits a directly consumable semantic token module', () => {
  const context = buildContext();
  const files = wechatMiniProgramAdapter.build(null, context);
  const source = files.get('dist/wechat-mini-program/tokens.js');
  const tokens = evaluateCommonJs(source);

  assert.equal(tokens.source.modelId, 'com-design:canonical-model:v2');
  assert.equal(tokens.source.sourceHash, context.canonicalModel.sourceHash);
  assert.equal(tokens.color.light.primary, '#5B5EF7');
  assert.equal(tokens.space['16'], 16);
  assert.equal(tokens.radius.control, 8);
  assert.equal(tokens.touch.minimum, 44);
  assert.equal(tokens.density.comfortable['control-height'], 44);
  assert.equal(tokens.typography.body.fontSize, 16);
  assert.equal(tokens.typography.body.fontFamilyRole, 'host-system');
  assert.equal(tokens.unitPolicy.rpxAssumption, false);
  assert.match(source, /module\.exports = tokens/);
});

test('WeChat Mini Program adapter exposes platform/context and T010 host environment hooks', () => {
  const context = buildContext();
  const evidence = JSON.parse(
    wechatMiniProgramAdapter.build(null, context)
      .get('dist/wechat-mini-program/adapter.json'),
  );

  assert.equal(evidence.id, 'com-design:wechat-mini-program-adapter:v2');
  assert.equal(evidence.targetPlatform.platform, 'wechat-mini-program');
  assert.deepEqual(evidence.context.axes.input, ['touch', 'pointer', 'keyboard', 'hybrid']);
  assert.equal(evidence.context.platformDoesNotInferAxes, true);
  assert.equal(evidence.environment.geometryUnit, 'layout-unit');
  assert.equal(evidence.environment.runtimeHooks.safeAreaInsets, 'geometry.safeAreaInsets');
  assert.equal(evidence.environment.runtimeHooks.hostChrome, 'chrome');
  assert.equal(evidence.environment.hostChromeOwnedByComDesign, false);
  assert.equal(evidence.environment.referenceSnapshot.exampleOnly, true);
  assert.equal(
    evidence.environment.referenceSnapshot.snapshot.chrome[0].kind,
    'host-capsule',
  );
  assert.equal(
    evidence.environment.referenceSnapshot.snapshot.chrome[0].comDesignOwned,
    false,
  );
  for (const hook of Object.values(evidence.environment.runtimeHooks)) {
    assert.notEqual(
      readPath(evidence.environment.referenceSnapshot.snapshot, hook),
      undefined,
      `runtime hook must exist in T010 environment shape: ${hook}`,
    );
  }
});

test('WeChat Mini Program adapter consumes canonical reduced-motion and platform constraints', () => {
  const context = buildContext();
  const evidence = JSON.parse(
    wechatMiniProgramAdapter.build(null, context)
      .get('dist/wechat-mini-program/adapter.json'),
  );

  assert.equal(evidence.motion.reducedMotion.firstClass, true);
  assert.equal(evidence.motion.highFrequencySetDataAnimationAllowed, false);
  assert.ok(
    evidence.motion.platform.constraints.includes(
      'no-high-frequency-frame-by-frame-setData',
    ),
  );
  assert.equal(evidence.contract.tailwindOrDomRequired, false);
  assert.equal(evidence.contract.reactNativeRequired, false);
  assert.equal(evidence.contract.rpxRequiredByCore, false);
});

test('WeChat Mini Program adapter carries canonical source changes instead of maintaining a second token truth', () => {
  const context = buildContext();
  const mutatedModel = structuredClone(context.canonicalModel);
  const primary = mutatedModel.tokens.entries.find((token) => token.name === 'color-primary');
  primary.light = '#123456';
  mutatedModel.sourceHash = 'f'.repeat(64);

  const files = wechatMiniProgramAdapter.build(null, {
    ...context,
    canonicalModel: mutatedModel,
  });
  const tokens = evaluateCommonJs(files.get('dist/wechat-mini-program/tokens.js'));
  const evidence = JSON.parse(files.get('dist/wechat-mini-program/adapter.json'));

  assert.equal(tokens.color.light.primary, '#123456');
  assert.equal(tokens.source.sourceHash, 'f'.repeat(64));
  assert.equal(evidence.source.sourceHash, 'f'.repeat(64));
  assert.equal(evidence.consumption.wxssSourceOfTruth, false);
});

test('WeChat Mini Program adapter rejects missing canonical or platform evidence', () => {
  assert.throws(
    () => wechatMiniProgramAdapter.build(null, {}),
    /requires Canonical Design Model V2/,
  );

  const context = buildContext();
  assert.throws(
    () => wechatMiniProgramAdapter.build(null, {
      canonicalModel: context.canonicalModel,
      platformEnvironment: null,
    }),
    /requires canonical WeChat Mini Program environment evidence/,
  );
  assert.throws(
    () => wechatMiniProgramAdapter.build(null, {
      ...context,
      canonicalModel: { ...context.canonicalModel, motion: null },
    }),
    /requires canonical T011 motion foundation/,
  );
});
