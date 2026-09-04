import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { tailwindAdapter } from '../src/adapters/tailwind.mjs';
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

test('Web Adapter V2 preserves the Tailwind semantic consumer path from Canonical Design Model V2', () => {
  const context = buildContext();
  const files = tailwindAdapter.build(null, context);
  const preset = files.get('dist/tailwind/preset.cjs');
  const themeCss = files.get('dist/tailwind/theme.css');

  assert.ok(preset.includes('"primary": "var(--cd-color-primary)"'));
  assert.ok(preset.includes('"background": "var(--cd-color-background)"'));
  assert.match(themeCss, /--cd-color-primary:/);
  assert.ok(themeCss.includes('.theme-premium-gold'));
  assert.ok(themeCss.includes('[data-com-theme="premium-gold"]'));
});

test('Web Adapter V2 emits explicit platform, context and input capability evidence', () => {
  const context = buildContext();
  const files = tailwindAdapter.build(null, context);
  const evidence = JSON.parse(files.get('dist/tailwind/adapter.json'));

  assert.equal(evidence.schemaVersion, 2);
  assert.equal(evidence.id, 'com-design:web-adapter:v2');
  assert.equal(evidence.source.modelId, 'com-design:canonical-model:v2');
  assert.equal(evidence.source.sourceHash, context.canonicalModel.sourceHash);
  assert.equal(evidence.targetPlatform.platform, 'web');
  assert.equal(evidence.targetPlatform.maturity.status, 'implemented');
  assert.deepEqual(evidence.context.axes.input, ['touch', 'pointer', 'keyboard', 'hybrid']);
  assert.equal(evidence.context.platformDoesNotInferAxes, true);
  assert.equal(
    evidence.responsiveInput.id,
    'com-design:layout-input-foundation:v2',
  );
  assert.deepEqual(
    evidence.responsiveInput.viewportRules,
    context.canonicalModel.layoutInput.contract.viewportRules,
  );
  assert.deepEqual(
    evidence.responsiveInput.inputRules,
    context.canonicalModel.layoutInput.contract.inputRules,
  );
  assert.deepEqual(
    evidence.responsiveInput.interactionStatePolicy,
    context.canonicalModel.layoutInput.contract.interactionStatePolicy,
  );
  assert.deepEqual(
    evidence.responsiveInput.contentScaleRules,
    context.canonicalModel.layoutInput.contract.contentScaleRules,
  );

  assert.equal(evidence.capabilities.pointer.supported, true);
  assert.equal(evidence.capabilities.pointer.hover, true);
  assert.deepEqual(
    evidence.capabilities.pointer.activeWhen,
    context.canonicalModel.layoutInput.contract.interactionStatePolicy.hover
      .appliesToInput,
  );
  assert.equal(evidence.capabilities.pointer.coreSemanticFork, false);

  assert.equal(evidence.capabilities.keyboard.supported, true);
  assert.equal(evidence.capabilities.keyboard.composition, true);
  assert.deepEqual(
    evidence.capabilities.keyboard.activeWhen,
    Object.entries(context.canonicalModel.layoutInput.contract.inputRules)
      .filter(([, rule]) => rule.activationModes.includes('keyboard-activation'))
      .map(([input]) => input),
  );
  assert.equal(evidence.capabilities.keyboard.coreSemanticFork, false);

  assert.equal(evidence.capabilities.focus.supported, true);
  assert.equal(evidence.capabilities.focus.focusVisible, 'required');
  assert.deepEqual(
    evidence.capabilities.focus.focusVisibleRequiredFor,
    context.canonicalModel.layoutInput.contract.interactionStatePolicy[
      'focus-visible'
    ].appliesToInput,
  );
  assert.equal(evidence.capabilities.focus.coreSemanticFork, false);
  assert.equal(evidence.contract.coreSemanticFork, false);
  assert.equal(evidence.contract.domCssStructureRequired, false);
});

test('Web Adapter V2 carries future canonical T012 rule changes instead of hard-coding Web policy', () => {
  const context = buildContext();
  const mutatedModel = structuredClone(context.canonicalModel);
  mutatedModel.layoutInput.contract.viewportRules.wide.guidance.push(
    'review-fixture-rule-proves-canonical-consumption',
  );

  const files = tailwindAdapter.build(null, {
    ...context,
    canonicalModel: mutatedModel,
  });
  const evidence = JSON.parse(files.get('dist/tailwind/adapter.json'));

  assert.ok(
    evidence.responsiveInput.viewportRules.wide.guidance.includes(
      'review-fixture-rule-proves-canonical-consumption',
    ),
  );
});

test('Web Tailwind generation does not interpret platform-neutral component CSS or DOM strings', () => {
  const context = buildContext();
  const baseline = tailwindAdapter.build(null, context);
  const mutatedModel = structuredClone(context.canonicalModel);

  mutatedModel.components[0].contract.traits = {
    cssLeakFixture: '1px solid var(--color-danger)',
    domLeakFixture: '<button class="fixture">do not interpret me</button>',
  };
  mutatedModel.components[0].contract.structurePatterns = [
    'display:grid; position:fixed; className=fixture',
  ];

  const mutated = tailwindAdapter.build(null, {
    ...context,
    canonicalModel: mutatedModel,
  });

  assert.equal(
    mutated.get('dist/tailwind/preset.cjs'),
    baseline.get('dist/tailwind/preset.cjs'),
  );
  assert.equal(
    mutated.get('dist/tailwind/theme.css'),
    baseline.get('dist/tailwind/theme.css'),
  );
});

test('Web Adapter V2 rejects missing canonical or environment evidence instead of guessing', () => {
  assert.throws(
    () => tailwindAdapter.build(null, {}),
    /requires Canonical Design Model V2/,
  );

  const context = buildContext();
  assert.throws(
    () => tailwindAdapter.build(null, {
      canonicalModel: {
        ...context.canonicalModel,
        layoutInput: null,
      },
      platformEnvironment: context.platformEnvironment,
    }),
    /requires canonical T012 layout\/input foundation/,
  );
  assert.throws(
    () => tailwindAdapter.build(null, {
      canonicalModel: context.canonicalModel,
      platformEnvironment: null,
    }),
    /requires canonical Web platform environment evidence/,
  );
});
