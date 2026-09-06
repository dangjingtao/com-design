import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
const readText = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const switchContract = readJson('design-source/components/switch.json');
const timelineContract = readJson('design-source/components/timeline.json');
const switchPreview = readText('design-source/preview/component-switch.html');
const timelinePreview = readText('design-source/preview/component-timeline.html');

test('T024 Switch preserves value and availability as independent four-state dimensions', () => {
  assert.deepEqual(
    switchContract.variantDimensions.state,
    ['off', 'on', 'disabled-off', 'disabled-on'],
  );

  const { off, on, disabledOff, disabledOn } = switchContract.traits;
  assert.notEqual(disabledOff.track, off.track);
  assert.notEqual(disabledOn.track, on.track);
  assert.notEqual(disabledOff.track, disabledOn.track);
  assert.equal(disabledOff.thumb, 'var(--color-text-disabled)');
  assert.equal(disabledOn.thumb, 'var(--color-text-disabled)');
  assert.equal(disabledOff.label, 'var(--color-text-disabled)');
  assert.equal(disabledOn.label, 'var(--color-text-disabled)');
});

test('T024 Switch preview proves enabled/disabled × on/off without whole-row opacity', () => {
  for (const state of ['on', 'off', 'disabled-on', 'disabled-off']) {
    assert.match(switchPreview, new RegExp('data-evidence-sample="' + state + '"'));
  }

  assert.match(
    switchPreview,
    /\.switch-input:disabled:not\(:checked\) \+ \.switch-track\{background:var\(--color-disabled\);border-color:var\(--color-disabled\)\}/,
  );
  assert.match(
    switchPreview,
    /\.switch-input:disabled:checked \+ \.switch-track\{background:var\(--color-primary-container\);border-color:var\(--color-on-primary-container\)\}/,
  );
  assert.match(
    switchPreview,
    /\.switch-input:disabled \+ \.switch-track \.switch-thumb\{background:var\(--color-surface-subtle\)\}/,
  );
  assert.doesNotMatch(switchPreview, /\.switch-row\.is-disabled\s*\{[^}]*opacity\s*:/s);

  assert.match(
    switchPreview,
    /data-evidence-sample="disabled-on"[\s\S]*?<input[^>]*checked disabled/,
  );
  assert.match(
    switchPreview,
    /data-evidence-sample="disabled-off"[\s\S]*?<input[^>]*disabled/,
  );
});

test('T024 Timeline contract assigns connector ownership to the current event', () => {
  assert.equal(timelineContract.traits.connectorOwnership, 'current-event-to-next-event');
  assert.ok(
    timelineContract.structurePatterns.some((rule) =>
      /every non-final current event owns the connector/.test(rule),
    ),
  );
  assert.ok(
    timelineContract.structurePatterns.some((rule) =>
      /final event owns no outgoing connector/.test(rule),
    ),
  );
  assert.ok(
    timelineContract.structurePatterns.some((rule) =>
      /does not require a Card container/.test(rule),
    ),
  );
});

test('T024 Timeline preview keeps the rail continuous through variable event height', () => {
  assert.match(
    timelinePreview,
    /\.tl-event:not\(:last-child\) \.tl-content\{padding-bottom:var\(--tl-event-gap\)\}/,
  );
  assert.match(
    timelinePreview,
    /\.tl-rail\{[^}]*align-self:stretch[^}]*\}/,
  );
  assert.match(
    timelinePreview,
    /\.tl-event:not\(:last-child\) \.tl-rail::after\{/,
  );
  assert.doesNotMatch(timelinePreview, /\.tl-event \+ \.tl-event \.tl-rail::before/);
  const timelineRule = timelinePreview.match(/\.timeline\{([^}]*)\}/);
  assert.ok(timelineRule);
  assert.doesNotMatch(timelineRule[1], /(?:^|;)gap\s*:/);

  assert.match(timelinePreview, /data-evidence-sample="variable-height"/);
  assert.match(timelinePreview, /data-evidence-event="default-long"/);
  assert.match(timelinePreview, /data-evidence-event="danger-final"/);
  assert.match(timelinePreview, /data-evidence-sample="grayscale"/);
  assert.doesNotMatch(timelinePreview, /class="card"/);
});

test('T024 Timeline long-content evidence is materially taller than a one-line fixture', () => {
  const match = timelinePreview.match(
    /data-evidence-event="default-long"[\s\S]*?<span class="tl-support">([^<]+)<\/span>/,
  );
  assert.ok(match);
  assert.ok(match[1].length > 50);
});
