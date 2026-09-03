import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  validateLayoutInputFoundation,
  validateLayoutInputFoundationContract,
} from '../src/layout-input-foundation.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const contract = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'specs', 'layout-input-foundation-v2.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'schemas', 'layout-input-foundation-v2.schema.json'), 'utf8'));
const platformModel = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'specs', 'platform-model-v2.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'specs', 'design-system-v1.json'), 'utf8'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('repository layout/input foundation, schema, platform model and manifest stay aligned', () => {
  assert.deepEqual(validateLayoutInputFoundation(repoRoot, platformModel, manifest), []);
});

test('Stack, Center and Grid preserve confirmed planning responsibilities without Core promotion', () => {
  assert.deepEqual(contract.foundations.map(({ id, kind }) => [id, kind]), [
    ['layout.stack', 'stack'],
    ['layout.center', 'center'],
    ['layout.grid', 'grid'],
  ]);
  const byKind = Object.fromEntries(contract.foundations.map((foundation) => [foundation.kind, foundation]));
  for (const capability of ['vertical', 'horizontal', 'align', 'justify', 'wrap', 'semantic-gap']) {
    assert.ok(byKind.stack.capabilities.includes(capability));
  }
  for (const capability of ['inline-center', 'block-center-when-safe', 'both-axis-center']) {
    assert.ok(byKind.center.capabilities.includes(capability));
  }
  for (const capability of ['single-track-fallback', 'multi-track', 'adaptive-track-count', 'semantic-gap']) {
    assert.ok(byKind.grid.capabilities.includes(capability));
  }
  assert.ok(contract.integrationHooks.every((hook) => hook.coreComponent === false));
});

test('equivalent viewport/input contexts resolve the same layout across platform names', () => {
  const compact = contract.examples.filter((example) =>
    example.semanticTask === 'browse-filtered-collection'
    && example.context.viewport === 'compact'
    && example.context.input === 'touch'
    && example.context.contentScale === 'standard');
  assert.equal(compact.length, 2);
  assert.notEqual(compact[0].context.platform, compact[1].context.platform);
  assert.deepEqual(compact[0].resolvedLayout, compact[1].resolvedLayout);

  const wide = contract.examples.filter((example) =>
    example.semanticTask === 'browse-filtered-collection'
    && example.context.viewport === 'wide'
    && example.context.input === 'keyboard'
    && example.context.contentScale === 'standard');
  assert.equal(wide.length, 2);
  assert.notEqual(wide[0].context.platform, wide[1].context.platform);
  assert.deepEqual(wide[0].resolvedLayout, wide[1].resolvedLayout);
});

test('input modality policy separates hover, focus-visible and authoritative state', () => {
  assert.equal(contract.inputRules.touch.hoverMayAffectPresentation, false);
  assert.equal(contract.inputRules.pointer.hoverMayAffectPresentation, true);
  assert.equal(contract.inputRules.keyboard.focusVisibleRequired, true);
  assert.equal(contract.inputRules.hybrid.focusVisibleRequired, true);
  assert.deepEqual(contract.interactionStatePolicy.hover.appliesToInput, ['pointer', 'hybrid']);
  assert.deepEqual(contract.interactionStatePolicy['focus-visible'].appliesToInput, ['keyboard', 'hybrid']);
  assert.match(contract.interactionStatePolicy['selected-checked-open'].rule, /modality-independent/);
});

test('enlarged content reflows before clipping required content', () => {
  for (const rule of Object.values(contract.contentScaleRules)) {
    assert.equal(rule.reflowRequired, true);
    assert.equal(rule.criticalContentMayClip, false);
  }
  const standard = contract.examples.find((example) => example.name === 'wide-keyboard-web');
  const enlarged = contract.examples.find((example) => example.name === 'wide-keyboard-enlarged-web');
  assert.ok(enlarged.resolvedLayout.tracks < standard.resolvedLayout.tracks);
  assert.equal(enlarged.semanticTask, standard.semanticTask);
});

test('validator rejects platform-name-only layout drift', () => {
  const invalid = clone(contract);
  invalid.examples.find((example) => example.name === 'compact-touch-mini-program').resolvedLayout.tracks = 2;
  const errors = validateLayoutInputFoundationContract(invalid, schema, platformModel, manifest);
  assert.ok(errors.some((error) => error.includes('platform-only layout drift')));
});

test('validator rejects axis drift from the canonical platform model', () => {
  const invalid = clone(contract);
  invalid.axes.viewport = ['compact', 'wide', 'medium'];
  const errors = validateLayoutInputFoundationContract(invalid, schema, platformModel, manifest);
  assert.ok(errors.some((error) => error.includes('axis viewport must match')));
});

test('validator rejects content-scale clipping and premature Core promotion', () => {
  const clipping = clone(contract);
  clipping.contentScaleRules.enlarged.criticalContentMayClip = true;
  assert.ok(
    validateLayoutInputFoundationContract(clipping, schema, platformModel, manifest)
      .some((error) => error.includes('criticalContentMayClip')),
  );

  const promoted = clone(contract);
  promoted.integrationHooks[1].coreComponent = true;
  assert.ok(
    validateLayoutInputFoundationContract(promoted, schema, platformModel, manifest)
      .some((error) => error.includes('coreComponent')),
  );
});

test('validator rejects regression of confirmed Stack/Center/Grid responsibilities', () => {
  const invalid = clone(contract);
  invalid.foundations.find((foundation) => foundation.kind === 'stack').capabilities =
    invalid.foundations.find((foundation) => foundation.kind === 'stack').capabilities.filter((value) => value !== 'justify');
  const errors = validateLayoutInputFoundationContract(invalid, schema, platformModel, manifest);
  assert.ok(errors.some((error) => error.includes('confirmed capability justify')));
});
