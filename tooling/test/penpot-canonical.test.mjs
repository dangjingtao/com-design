import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildCanonicalDesignModel } from '../src/design-model.mjs';
import {
  assertPenpotCanonicalParity,
  compileCanonicalComponents,
  compileCanonicalTrace,
} from '../../penpot/src/compile/canonical.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('T015 Penpot manifest carries canonical authority and source revision', () => {
  const model = buildCanonicalDesignModel(repoRoot);
  const manifest = {
    canonical: compileCanonicalTrace(model),
    components: compileCanonicalComponents(model),
  };
  assert.equal(manifest.canonical.authority, 'design-source/');
  assert.equal(manifest.canonical.conflictPolicy, 'canonical-source-wins');
  assert.equal(manifest.canonical.writeBack, 'proposal-only');
  assert.equal(manifest.canonical.sourceHash, model.sourceHash);
  assert.deepEqual(assertPenpotCanonicalParity(manifest, model), []);
  assert.ok(manifest.components.every((component) => component.sourceId?.startsWith('component:')));
  assert.ok(manifest.components.every((component) => component.sourceRevision));
});
