import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildCanonicalDesignModel } from '../src/design-model.mjs';
import { createAgentContract } from '../src/agent-contract.mjs';
import { compileCanonicalComponents } from '../../penpot/src/compile/canonical.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
const readText = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const button = readJson('design-source/components/button.json');
const preview = readText('design-source/preview/component-button.html');

function openingButtonFor(sample) {
  const match = preview.match(
    new RegExp('<button[^>]*data-evidence-sample="' + sample + '"[^>]*>'),
  );
  assert.ok(match, 'missing preview button: ' + sample);
  return match[0];
}

test('T025 Button separates hierarchy semantic shape size and state axes', () => {
  assert.deepEqual(button.variantDimensions.hierarchy, ['primary','secondary','tertiary']);
  assert.deepEqual(button.variantDimensions.semantic, ['default','destructive']);
  assert.deepEqual(button.variantDimensions.shape, ['standard','pill']);
  assert.deepEqual(button.variantDimensions.size, ['compact','large']);
  assert.deepEqual(button.variantDimensions.state, ['default','pressed','loading','disabled']);

  assert.equal(button.variantDimensions.hierarchy.includes('destructive'), false);
  assert.equal(button.variantDimensions.semantic.includes('success'), false);
  assert.equal(button.variantDimensions.semantic.includes('warning'), false);
});

test('T025 Pill is a machine-readable shape variant and does not change base heights', () => {
  assert.equal(button.traits.radius, 'var(--radius-control)');
  assert.equal(button.traits.pillRadius, 'var(--radius-pill)');
  assert.equal(button.traits.compactHeight, '40px');
  assert.equal(button.traits.largeHeight, '48px');

  assert.match(preview, /\.btn\.pill \{ border-radius:var\(--radius-pill\); \}/);
  assert.match(preview, /data-evidence-sample="shape-standard"/);
  assert.match(preview, /data-evidence-sample="shape-pill"/);
});

test('T025 Destructive is semantic intent composed with action hierarchy', () => {
  const destructive = button.traits.destructive;
  assert.equal(destructive.background, 'var(--color-destructive)');
  assert.equal(destructive.secondaryForeground, 'var(--color-danger-text)');
  assert.equal(destructive.tertiaryForeground, 'var(--color-danger-text)');

  for (const hierarchy of ['primary','secondary','tertiary']) {
    assert.match(preview, new RegExp('data-evidence-sample="destructive-' + hierarchy + '"'));
  }

  assert.ok(
    button.interactionContract.some((rule) =>
      rule.includes('Destructive does not become a fourth hierarchy level'),
    ),
  );
  assert.ok(
    button.accessibilityContract.some((rule) =>
      /never by danger color alone/.test(rule),
    ),
  );
});

test('T025 Loading suppresses repeat activation without becoming disabled', () => {
  assert.equal(button.loadingContract.suppressRepeatedActivation, true);
  assert.equal(button.loadingContract.preservesMeasuredDimensions, true);
  assert.equal(button.loadingContract.loadingIsDisabled, false);
  assert.equal(button.loadingContract.busySemanticsRequired, true);
  assert.equal(button.loadingContract.focusableWhileBusy, true);
  assert.equal(button.loadingContract.defaultPresentation, 'spinner-label');
  assert.deepEqual(
    button.loadingContract.compositionPolicy.loadingPreserves,
    ['hierarchy','semantic','shape','size'],
  );
  assert.deepEqual(
    button.loadingContract.compositionPolicy.loadingOverrides,
    ['content','activation','busy-semantics'],
  );
  assert.equal(button.loadingContract.compositionPolicy.disabledOverridesVisualTreatment, true);
  assert.equal(button.loadingContract.compositionPolicy.pressedAllowedWhileLoading, false);

  const loading = openingButtonFor('loading-spinner-label');
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /data-repeat-activation="suppressed"/);
  assert.doesNotMatch(loading, /\sdisabled(?:\s|>|=)/);

  const disabled = openingButtonFor('disabled');
  assert.match(disabled, /\sdisabled(?:\s|>|=)/);
});

test('T025 spinner-only loading keeps an accessible name and busy state', () => {
  assert.equal(button.loadingContract.spinnerOnlyRequiresAccessibleName, true);
  const spinnerOnly = openingButtonFor('loading-spinner-only');
  assert.match(spinnerOnly, /aria-busy="true"/);
  assert.match(spinnerOnly, /aria-label="正在提交"/);
  assert.doesNotMatch(spinnerOnly, /\sdisabled(?:\s|>|=)/);
});

test('T025 loading preview proves stable width across idle and spinner-label states', () => {
  const before = openingButtonFor('loading-before');
  const loading = openingButtonFor('loading-spinner-label');

  assert.match(before, /data-width-lock="compact-demo"/);
  assert.match(loading, /data-width-lock="compact-demo"/);
  assert.match(preview, /\.btn\[data-width-lock="compact-demo"\] \{ width:120px; \}/);
});

test('T025 Canonical Model, Agent and Penpot all consume the new Button axes', () => {
  const model = buildCanonicalDesignModel(repoRoot);
  const canonicalButton = model.components.find((entry) => entry.slug === 'button');
  assert.ok(canonicalButton);
  assert.deepEqual(canonicalButton.contract.variantDimensions.semantic, ['default','destructive']);
  assert.ok(canonicalButton.contract.variantDimensions.state.includes('loading'));

  const agent = createAgentContract(repoRoot);
  const agentButton = agent.catalogs.components.find((entry) => entry.slug === 'button');
  assert.deepEqual(agentButton.contract.variantDimensions.shape, ['standard','pill']);
  assert.equal(agentButton.contract.loadingContract.loadingIsDisabled, false);

  const penpotButton = compileCanonicalComponents(model).find((entry) => entry.slug === 'button');
  assert.deepEqual(penpotButton.variantDimensions.hierarchy, ['primary','secondary','tertiary']);
  assert.deepEqual(penpotButton.variantDimensions.semantic, ['default','destructive']);
  assert.deepEqual(penpotButton.variantDimensions.shape, ['standard','pill']);
  assert.ok(penpotButton.states.includes('loading'));
});


test('T025 loading preserves destructive semantic treatment and suppresses preview activation', () => {
  const destructiveLoading = openingButtonFor('loading-destructive');
  assert.match(destructiveLoading, /class="btn primary is-destructive is-loading"/);
  assert.match(destructiveLoading, /aria-busy="true"/);
  assert.match(destructiveLoading, /data-repeat-activation="suppressed"/);

  assert.match(
    preview,
    /document\.querySelectorAll\('\.btn\.is-loading'\)[\s\S]*?event\.preventDefault\(\)[\s\S]*?event\.stopPropagation\(\)/,
  );

  const variant = button.representativeVariants.find(
    (entry) => entry.semantic === 'destructive' && entry.state === 'loading',
  );
  assert.ok(variant);
  assert.equal(variant.hierarchy, 'primary');
});
