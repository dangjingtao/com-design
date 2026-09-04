import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  buildCanonicalDesignModel,
  validateCanonicalDesignModel,
  writeCanonicalDesignModel,
} from '../src/design-model.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function copyDesignSourceFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-model-v2-'));
  fs.cpSync(
    path.join(repoRoot, 'design-source'),
    path.join(root, 'design-source'),
    { recursive: true },
  );
  return root;
}

function assertProvenance(value, label) {
  assert.ok(value && typeof value === 'object', `${label} must carry provenance`);
}

function readFixtureJson(fixture, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(fixture, 'design-source', relativePath), 'utf8'));
}

function writeFixtureJson(fixture, relativePath, value) {
  fs.writeFileSync(
    path.join(fixture, 'design-source', relativePath),
    `${JSON.stringify(value, null, 2)}\n`,
  );
}

test('builds Canonical Design Model V2 from accepted canonical sources', () => {
  const model = buildCanonicalDesignModel(repoRoot);

  assert.equal(model.schemaVersion, 2);
  assert.equal(model.id, 'com-design:canonical-model:v2');
  assert.equal(model.$metadata.authority, 'derived-build-artifact');
  assert.equal(model.$metadata.editable, false);
  assert.match(model.sourceHash, /^[a-f0-9]{64}$/);
  assert.equal(model.components.length, 33);
  assert.equal(model.composites.length, 4);
  assert.equal(model.patterns.length, 6);
  assert.equal(model.platform.platforms.length, 4);
  assert.equal(model.layoutInput.id, 'com-design:layout-input-foundation:v2');
  assert.equal(model.layoutInput.schemaVersion, 2);
  assert.equal(model.navigation.id, 'com-design:navigation-foundation:v2');
  assert.equal(model.navigation.schemaVersion, 2);
  assert.equal(
    model.navigation.provenance.sourcePath,
    'design-source/specs/navigation-foundation-v2.json',
  );
  assert.equal(model.motion.id, 'com-design:motion-foundation:v2');
  assert.equal(model.motion.schemaVersion, 2);
  assert.equal(model.motion.contract.reducedMotion.firstClass, true);
  assert.equal(
    model.motion.provenance.sourcePath,
    'design-source/specs/motion-foundation-v2.json',
  );
  assert.deepEqual(
    model.layoutInput.contract.axes.input,
    ['touch', 'pointer', 'keyboard', 'hybrid'],
  );
  assert.equal(
    model.layoutInput.provenance.sourcePath,
    'design-source/specs/layout-input-foundation-v2.json',
  );
  assert.deepEqual(validateCanonicalDesignModel(model), []);

  assert.ok(model.tokens.entries.length > 0);
  assert.equal(model.tokens.themes.premiumGold.selector, '.theme-premium-gold');
  assert.equal(
    model.tokens.themes.premiumGold.dataSelector,
    '[data-com-theme="premium-gold"]',
  );
  assert.ok(model.tokens.entries.every((entry) => entry.id === `token:${entry.name}`));
  assert.ok(model.components.every((entry) => entry.id === `component:${entry.slug}`));
  assert.ok(model.composites.every((entry) => entry.id === `composite:${entry.sourceId}`));
  assert.ok(model.patterns.every((entry) => entry.id === `pattern:${entry.sourceId}`));
  assert.ok(model.platform.platforms.every((entry) => entry.id === `platform:${entry.platform}`));
  assert.ok(model.platform.axes.every((entry) => entry.id === `platform-axis:${entry.name}`));

  for (const token of model.tokens.entries) assertProvenance(token.provenance, token.id);
  for (const component of model.components) assertProvenance(component.provenance, component.id);
  for (const composite of model.composites) assertProvenance(composite.provenance, composite.id);
  for (const pattern of model.patterns) assertProvenance(pattern.provenance, pattern.id);
  for (const platform of model.platform.platforms) assertProvenance(platform.provenance, platform.id);
  for (const axis of model.platform.axes) assertProvenance(axis.provenance, axis.id);
});

test('preserves declared adapter maturity instead of inferring implementation state', () => {
  const model = buildCanonicalDesignModel(repoRoot);
  const maturity = Object.fromEntries(
    model.platform.platforms.map((entry) => [entry.platform, entry.maturity.status]),
  );

  assert.deepEqual(maturity, {
    ios: 'implemented',
    android: 'implemented',
    web: 'implemented',
    'wechat-mini-program': 'implemented',
  });
});

test('produces deterministic output and source hash for unchanged canonical sources', () => {
  const first = buildCanonicalDesignModel(repoRoot);
  const second = buildCanonicalDesignModel(repoRoot);
  assert.deepEqual(second, first);
  assert.equal(second.sourceHash, first.sourceHash);
});

test('does not parse or hash Preview DOM content into the canonical model', () => {
  const fixture = copyDesignSourceFixture();
  const before = buildCanonicalDesignModel(fixture);
  const previewPath = path.join(fixture, 'design-source', 'preview', 'component-button.html');
  fs.writeFileSync(previewPath, '<not-a-preview>this content must not affect the model</not-a-preview>\n');
  const after = buildCanonicalDesignModel(fixture);

  assert.equal(after.sourceHash, before.sourceHash);
  assert.deepEqual(after.components, before.components);
});

test('changes source hash when a canonical component contract changes', () => {
  const fixture = copyDesignSourceFixture();
  const before = buildCanonicalDesignModel(fixture);
  const buttonPath = path.join(fixture, 'design-source', 'components', 'button.json');
  const button = JSON.parse(fs.readFileSync(buttonPath, 'utf8'));
  button.unknowns = [...(button.unknowns ?? []), 'T005 hash fixture change'];
  fs.writeFileSync(buttonPath, `${JSON.stringify(button, null, 2)}\n`);
  const after = buildCanonicalDesignModel(fixture);

  assert.notEqual(after.sourceHash, before.sourceHash);
  assert.ok(
    after.components
      .find((entry) => entry.id === 'component:button')
      .contract.unknowns.includes('T005 hash fixture change'),
  );
});

test('rejects schema-invalid Composite and Pattern catalogs before emission', () => {
  const compositeFixture = copyDesignSourceFixture();
  const composites = readFixtureJson(compositeFixture, 'specs/core-composites.json');
  composites.composites[0].forbiddenReviewFixture = true;
  writeFixtureJson(compositeFixture, 'specs/core-composites.json', composites);
  assert.throws(
    () => buildCanonicalDesignModel(compositeFixture),
    /composite contract: coreComposites\.composites\[0\]\.forbiddenReviewFixture: additional property is not allowed/,
  );

  const patternFixture = copyDesignSourceFixture();
  const patterns = readFixtureJson(patternFixture, 'specs/core-patterns.json');
  patterns.patterns[0].forbiddenReviewFixture = true;
  writeFixtureJson(patternFixture, 'specs/core-patterns.json', patterns);
  assert.throws(
    () => buildCanonicalDesignModel(patternFixture),
    /pattern contract: corePatterns\.patterns\[0\]\.forbiddenReviewFixture: additional property is not allowed/,
  );
});

test('resolves references only within relation-allowed namespaces', () => {
  const fixture = copyDesignSourceFixture();
  const patterns = readFixtureJson(fixture, 'specs/core-patterns.json');
  patterns.patterns[0].name = 'Card';
  writeFixtureJson(fixture, 'specs/core-patterns.json', patterns);

  const model = buildCanonicalDesignModel(fixture);
  const carousel = model.composites.find((entry) => entry.id === 'composite:carousel');
  const cardRef = carousel.references.components.find((entry) => entry.sourceValue === 'Card');
  assert.equal(cardRef.targetId, 'component:card');
  assert.equal(cardRef.resolved, true);

  const collectionFilter = model.patterns.find((entry) => entry.id === 'pattern:collectionFilter');
  const filterBarRef = collectionFilter.references.components.find(
    (entry) => entry.sourceValue === 'Filter Bar',
  );
  assert.equal(filterBarRef.targetId, 'composite:filterBar');
  assert.equal(filterBarRef.resolved, true);
});

test('attributes overlay-defined tokens to the actual overlay source', () => {
  const model = buildCanonicalDesignModel(repoRoot);
  const reward = model.tokens.entries.find((entry) => entry.id === 'token:color-reward');
  const memberShadow = model.tokens.entries.find(
    (entry) => entry.id === 'token:shadow-member-card',
  );
  const primary = model.tokens.entries.find((entry) => entry.id === 'token:color-primary');

  assert.equal(reward.provenance.sourcePath, 'design-source/themes/premium-gold.css');
  assert.equal(memberShadow.provenance.sourcePath, 'design-source/themes/premium-gold.css');
  assert.equal(primary.provenance.sourcePath, 'design-source/colors_and_type.css');
});

test('normalizes Composite and Pattern references without inventing missing targets', () => {
  const model = buildCanonicalDesignModel(repoRoot);
  const carousel = model.composites.find((entry) => entry.id === 'composite:carousel');
  const cardRef = carousel.references.components.find((entry) => entry.sourceValue === 'Card');
  const textRef = carousel.references.components.find((entry) => entry.sourceValue === 'Text');
  const searchPatternRef = carousel.references.relatedPatterns.find(
    (entry) => entry.sourceValue === 'searchPattern',
  );

  assert.equal(cardRef.targetId, 'component:card');
  assert.equal(cardRef.resolved, true);
  assert.equal(textRef.targetId, null);
  assert.equal(textRef.resolved, false);
  assert.equal(searchPatternRef.targetId, 'pattern:searchPattern');
  assert.equal(searchPatternRef.resolved, true);
});

test('writes the normalized model as a generated dist artifact', () => {
  const fixture = copyDesignSourceFixture();
  const model = buildCanonicalDesignModel(fixture);
  const output = writeCanonicalDesignModel(fixture, model);

  assert.equal(output, 'dist/design-model-v2.json');
  const written = JSON.parse(fs.readFileSync(path.join(fixture, output), 'utf8'));
  assert.deepEqual(written, model);
  assert.equal(written.$metadata.editable, false);
});

test('rejects invalid canonical layout/input contract before model emission', () => {
  const fixture = copyDesignSourceFixture();
  const layoutInput = readFixtureJson(fixture, 'specs/layout-input-foundation-v2.json');
  layoutInput.schemaVersion = 99;
  writeFixtureJson(fixture, 'specs/layout-input-foundation-v2.json', layoutInput);

  assert.throws(
    () => buildCanonicalDesignModel(fixture),
    /layout\/input foundation: layoutInputFoundation\.schemaVersion: must equal 2/,
  );
});


test('rejects invalid canonical navigation foundation before model emission', () => {
  const fixture = copyDesignSourceFixture();
  const navigation = readFixtureJson(fixture, 'specs/navigation-foundation-v2.json');
  navigation.stateExample.activeAncestorIds = ['workspace'];
  writeFixtureJson(fixture, 'specs/navigation-foundation-v2.json', navigation);

  assert.throws(
    () => buildCanonicalDesignModel(fixture),
    /navigation foundation: stateExample\.activeAncestorIds must equal the derived active destination ancestor chain/,
  );
});

test('rejects invalid canonical motion contract before model emission', () => {
  const fixture = copyDesignSourceFixture();
  const motion = readFixtureJson(fixture, 'specs/motion-foundation-v2.json');
  delete motion.reducedMotion;
  writeFixtureJson(fixture, 'specs/motion-foundation-v2.json', motion);

  assert.throws(
    () => buildCanonicalDesignModel(fixture),
    /motion foundation: motionFoundation\.reducedMotion: is required/,
  );
});
