import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateSourceIntegrity } from '../src/source-integrity.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('repository manifest resolves canonical sources and derives real catalog counts', () => {
  const result = validateSourceIntegrity(repoRoot);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.evidence.catalogCounts, {
    coreComponents: 33,
    coreCompositeComponents: 4,
    corePatterns: 6,
    coreIcons: 11,
  });
});

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-source-integrity-'));
  const specDir = path.join(root, 'design-source', 'specs');
  fs.mkdirSync(path.join(root, 'design-source', 'components'), { recursive: true });
  fs.mkdirSync(path.join(root, 'design-source', 'schemas'), { recursive: true });
  fs.mkdirSync(specDir, { recursive: true });

  fs.writeFileSync(path.join(root, 'design-source', 'colors_and_type.css'), ':root { --com-color-primary: #5b5ef7; }\n');
  fs.writeFileSync(path.join(root, 'design-source', 'components', 'index.json'), JSON.stringify({ components: [{ slug: 'button' }] }));
  fs.writeFileSync(path.join(root, 'design-source', 'schemas', 'composite-contract-v1.schema.json'), '{}\n');
  fs.writeFileSync(path.join(root, 'design-source', 'schemas', 'pattern-contract-v1.schema.json'), '{}\n');
  fs.writeFileSync(path.join(specDir, 'core-composites.json'), JSON.stringify({ composites: [{ id: 'filterBar' }] }));
  fs.writeFileSync(path.join(specDir, 'core-patterns.json'), JSON.stringify({ patterns: [{ id: 'searchPattern' }] }));

  const manifest = {
    sources: {
      foundation: '../colors_and_type.css',
      componentIndex: '../components/index.json',
      compositeSchema: '../schemas/composite-contract-v1.schema.json',
      patternSchema: '../schemas/pattern-contract-v1.schema.json',
      coreComposites: './core-composites.json',
      corePatterns: './core-patterns.json',
    },
    plannedSources: {
      componentSchema: { status: 'planned', canonical: false, owner: 'T003' },
      iconography: { status: 'planned', canonical: false, owner: 'T013' },
    },
    catalogs: {
      coreComponents: { source: 'componentIndex', collection: 'components' },
      coreCompositeComponents: { source: 'coreComposites', collection: 'composites' },
      corePatterns: { source: 'corePatterns', collection: 'patterns' },
    },
    platformStatus: {
      targets: ['ios', 'android', 'web', 'wechat-mini-program'],
      adapterMaturity: {
        ios: { status: 'partial' },
        android: { status: 'partial' },
        web: { status: 'partial' },
        'wechat-mini-program': { status: 'planned' },
      },
    },
    releaseGates: {
      evaluation: 'validator-evidence',
      requirements: ['sourceIntegrity'],
    },
  };

  const manifestPath = path.join(specDir, 'design-system-v1.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return { root, manifest, manifestPath };
}

function writeManifest(manifestPath, manifest) {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

test('accepts resolvable canonical sources and derives catalog counts', () => {
  const fixture = makeFixture();
  const result = validateSourceIntegrity(fixture.root);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.evidence.catalogCounts, {
    coreComponents: 1,
    coreCompositeComponents: 1,
    corePatterns: 1,
  });
});

test('fails when a canonical source path is missing', () => {
  const fixture = makeFixture();
  fixture.manifest.sources.foundation = '../missing/tokens.json';
  writeManifest(fixture.manifestPath, fixture.manifest);

  const result = validateSourceIntegrity(fixture.root);
  assert.ok(result.errors.some((error) => error.includes('sources.foundation points to missing path')));
});

test('fails when a canonical JSON source cannot be parsed', () => {
  const fixture = makeFixture();
  fs.writeFileSync(path.join(fixture.root, 'design-source', 'components', 'index.json'), '{ broken json');

  const result = validateSourceIntegrity(fixture.root);
  assert.ok(result.errors.some((error) => error.includes('sources.componentIndex cannot be parsed')));
});

test('allows absent planned non-canonical sources', () => {
  const fixture = makeFixture();
  fixture.manifest.plannedSources.motionContract = {
    status: 'planned',
    canonical: false,
    owner: 'T011',
    pathHint: '../tokens/motion.json',
  };
  writeManifest(fixture.manifestPath, fixture.manifest);

  const result = validateSourceIntegrity(fixture.root);
  assert.deepEqual(result.errors, []);
});

test('rejects hand-maintained catalog totals', () => {
  const fixture = makeFixture();
  fixture.manifest.counts = { coreComponents: 33 };
  writeManifest(fixture.manifestPath, fixture.manifest);

  const result = validateSourceIntegrity(fixture.root);
  assert.ok(result.errors.some((error) => error.includes('manifest.counts must not contain hand-maintained catalog totals')));
});

test('rejects missing required catalog mappings', () => {
  const fixture = makeFixture();
  delete fixture.manifest.catalogs.corePatterns;
  writeManifest(fixture.manifestPath, fixture.manifest);

  const result = validateSourceIntegrity(fixture.root);
  assert.ok(result.errors.some((error) => error.includes('required mapping: corePatterns')));
});

test('rejects canonical absolute paths', () => {
  const fixture = makeFixture();
  fixture.manifest.sources.foundation = path.join(fixture.root, 'design-source', 'colors_and_type.css');
  writeManifest(fixture.manifestPath, fixture.manifest);

  const result = validateSourceIntegrity(fixture.root);
  assert.ok(result.errors.some((error) => error.includes('sources.foundation must be a relative repository path')));
});

test('rejects canonical traversal outside the repository', () => {
  const fixture = makeFixture();
  const externalFile = path.join(os.tmpdir(), `com-design-external-${process.pid}-${Date.now()}.json`);
  fs.writeFileSync(externalFile, '{}\n');
  fixture.manifest.sources.componentIndex = path.relative(path.dirname(fixture.manifestPath), externalFile);
  writeManifest(fixture.manifestPath, fixture.manifest);

  const result = validateSourceIntegrity(fixture.root);
  assert.ok(result.errors.some((error) => error.includes('sources.componentIndex must stay inside the repository')));
  fs.rmSync(externalFile, { force: true });
});

test('canonical foundation evidence follows the manifest declaration', () => {
  const fixture = makeFixture();
  const alternatePath = path.join(fixture.root, 'design-source', 'alternate-foundation.css');
  fs.writeFileSync(alternatePath, ':root { --com-color-primary: #111111; }\n');
  fixture.manifest.sources.foundation = '../alternate-foundation.css';
  writeManifest(fixture.manifestPath, fixture.manifest);

  const result = validateSourceIntegrity(fixture.root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.evidence.canonicalSources.foundation.resolvedPath, fs.realpathSync(alternatePath));
});
