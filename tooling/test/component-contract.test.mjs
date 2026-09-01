import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateComponentCatalog, validateJsonSchemaValue } from '../src/component-contract.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const designSourceRoot = path.join(repoRoot, 'design-source');
const repositorySchema = JSON.parse(
  fs.readFileSync(path.join(designSourceRoot, 'schemas', 'component-contract-v2.schema.json'), 'utf8'),
);

function baseContract(slug = 'button', name = 'Button') {
  return {
    schemaVersion: 2,
    slug,
    name,
    sourceKind: 'structured-spec',
    confidence: 'high',
    semanticTypeCandidates: ['actions-forms'],
    variantDimensions: { state: ['default'] },
    representativeVariants: [{ state: 'default' }],
    anatomy: ['container'],
    traits: {},
    structurePatterns: ['stable structure'],
    usageHints: ['use for the declared intent'],
    doNotInvent: [],
    unknowns: [],
  };
}

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-component-contract-'));
  const sourceRoot = path.join(root, 'design-source');
  const componentDir = path.join(sourceRoot, 'components');
  const schemaDir = path.join(sourceRoot, 'schemas');
  const previewDir = path.join(sourceRoot, 'preview');
  fs.mkdirSync(componentDir, { recursive: true });
  fs.mkdirSync(schemaDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });
  fs.writeFileSync(
    path.join(schemaDir, 'component-contract-v2.schema.json'),
    JSON.stringify(repositorySchema, null, 2),
  );

  const writeComponent = (slug, contract = baseContract(slug, slug)) => {
    fs.writeFileSync(path.join(componentDir, `${slug}.json`), JSON.stringify(contract, null, 2));
    fs.writeFileSync(path.join(previewDir, `component-${slug}.html`), `<div>${slug}</div>\n`);
  };

  const writeCatalog = (components) => {
    fs.writeFileSync(
      path.join(componentDir, 'index.json'),
      JSON.stringify({
        schemaVersion: 2,
        library: 'com-design',
        version: 'test',
        productType: 'company-mobile-core',
        language: 'zh',
        kitType: 'mobile',
        components,
      }, null, 2),
    );
  };

  return { root, sourceRoot, componentDir, previewDir, writeComponent, writeCatalog };
}

function entry(slug, name = slug) {
  return {
    slug,
    name,
    category: 'test',
    contract: `components/${slug}.json`,
    preview: `preview/component-${slug}.html`,
  };
}

test('repository catalog validates every currently indexed Core Component contract', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(designSourceRoot, 'components', 'index.json'), 'utf8'));
  const actualContracts = fs.readdirSync(path.join(designSourceRoot, 'components'))
    .filter((name) => name.endsWith('.json') && name !== 'index.json');

  const result = validateComponentCatalog(repoRoot);
  assert.deepEqual(result.errors, []);
  assert.equal(result.evidence.componentCount, catalog.components.length);
  assert.equal(result.evidence.contractFiles.length, actualContracts.length);
  assert.equal(result.evidence.contractFiles.length, result.evidence.componentCount);
});

test('simple components do not need interaction, accessibility or platform exception filler', () => {
  const contract = baseContract('divider', 'Divider');
  assert.equal(Object.hasOwn(contract, 'interactionContract'), false);
  assert.equal(Object.hasOwn(contract, 'accessibilityContract'), false);
  assert.equal(Object.hasOwn(contract, 'platformPresentationRefs'), false);
  assert.equal(Object.hasOwn(contract, 'platformExceptionRefs'), false);
  assert.deepEqual(validateJsonSchemaValue(contract, repositorySchema), []);
});

test('schema can express intent, states, interaction, accessibility and platform refs without redefining Core semantics', () => {
  const contract = {
    ...baseContract('select', 'Select'),
    intent: 'Choose one value while preserving one shared Core selection contract.',
    states: ['closed', 'open', 'disabled'],
    interactionContract: ['Activation opens the selected presentation without changing committed value.'],
    keyboardContract: ['Escape closes and restores focus.'],
    accessibilityContract: ['Expose the current value and expanded state through platform semantics.'],
    platformPresentationRefs: [
      { ref: 'adapter/select/presentation', context: 'context-capability-driven', note: 'Presentation is selected downstream.' },
    ],
    platformExceptionRefs: [
      { ref: 'environment/native-picker', context: 'platform-capability-driven', reason: 'Native picker may materially improve usability.' },
    ],
  };
  assert.deepEqual(validateJsonSchemaValue(contract, repositorySchema), []);
});

test('uniqueItems treats objects with different key order as the same value', () => {
  const contract = {
    ...baseContract('select', 'Select'),
    platformPresentationRefs: [
      { ref: 'adapter/select/presentation', context: 'touch' },
      { context: 'touch', ref: 'adapter/select/presentation' },
    ],
  };
  const errors = validateJsonSchemaValue(contract, repositorySchema);
  assert.ok(errors.some((error) => error.includes('platformPresentationRefs: items must be unique')));
});

test('schema rejects malformed identity and duplicate variant values', () => {
  const contract = baseContract('Bad Slug', 'Bad');
  contract.variantDimensions.state = ['default', 'default'];
  const errors = validateJsonSchemaValue(contract, repositorySchema);
  assert.ok(errors.some((error) => error.includes('must match')));
  assert.ok(errors.some((error) => error.includes('items must be unique')));
});

test('catalog deterministically rejects duplicate component ids and duplicate contract paths', () => {
  const fixture = makeFixture();
  fixture.writeComponent('button', baseContract('button', 'Button'));
  fixture.writeCatalog([
    entry('button', 'Button'),
    { ...entry('button', 'Button copy'), name: 'Button copy' },
  ]);

  const result = validateComponentCatalog(fixture.root);
  assert.ok(result.errors.some((error) => error.includes('duplicate component slug in catalog: button')));
  assert.ok(result.errors.some((error) => error.includes('duplicate component contract path in catalog: components/button.json')));
});

test('catalog deterministically rejects broken contract and preview paths', () => {
  const fixture = makeFixture();
  fixture.writeCatalog([
    {
      slug: 'button',
      name: 'Button',
      category: 'test',
      contract: 'components/missing.json',
      preview: 'preview/missing.html',
    },
  ]);

  const result = validateComponentCatalog(fixture.root);
  assert.ok(result.errors.some((error) => error.includes('contract points to missing path')));
  assert.ok(result.errors.some((error) => error.includes('preview points to missing path')));
});

test('catalog drift rejects index/contract identity mismatch', () => {
  const fixture = makeFixture();
  fixture.writeComponent('button', baseContract('button-renamed', 'Button'));
  fixture.writeCatalog([entry('button', 'Button')]);

  const result = validateComponentCatalog(fixture.root);
  assert.ok(result.errors.some((error) => error.includes('catalog drift for button: contract slug')));
});

test('catalog drift rejects unlisted component contract files', () => {
  const fixture = makeFixture();
  fixture.writeComponent('button', baseContract('button', 'Button'));
  fixture.writeComponent('orphan', baseContract('orphan', 'Orphan'));
  fixture.writeCatalog([entry('button', 'Button')]);

  const result = validateComponentCatalog(fixture.root);
  assert.ok(result.errors.some((error) => error.includes('catalog drift: unlisted component contract components/orphan.json')));
});
