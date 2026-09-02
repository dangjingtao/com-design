import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildCanonicalDesignModel } from '../src/design-model.mjs';
import {
  assertPenpotCanonicalParity,
  compileCanonicalComponents,
  compileCanonicalTokenCoverage,
  compileCanonicalTrace,
  enrichCanonicalTokens,
} from '../../penpot/src/compile/canonical.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('T015 Penpot manifest carries canonical authority and source revision', () => {
  const model = buildCanonicalDesignModel(repoRoot);
  const sampleCanonicalToken = model.tokens.entries[0];
  const tokens = enrichCanonicalTokens([
    {
      set: 'light',
      name: sampleCanonicalToken.name,
      sourceId: sampleCanonicalToken.name,
      type: 'color',
      value: sampleCanonicalToken.light,
    },
    {
      set: 'light',
      name: 'com-brand-500',
      sourceId: 'com-brand-500',
      type: 'color',
      value: '#5B5EF7',
    },
  ], model);
  const manifest = {
    canonical: {
      ...compileCanonicalTrace(model),
      tokenCoverage: compileCanonicalTokenCoverage(tokens, model),
    },
    tokens,
    components: compileCanonicalComponents(model),
  };

  assert.equal(manifest.canonical.authority, 'design-source/');
  assert.equal(manifest.canonical.conflictPolicy, 'canonical-source-wins');
  assert.equal(manifest.canonical.writeBack, 'proposal-only');
  assert.equal(manifest.canonical.sourceHash, model.sourceHash);
  assert.equal(manifest.tokens[0].canonicalId, sampleCanonicalToken.id);
  assert.equal(manifest.tokens[0].sourceRevision, sampleCanonicalToken.provenance.sourceHash);
  assert.equal(manifest.tokens[1].provenanceKind, 'canonical-foundation-source');
  assert.equal(manifest.canonical.tokenCoverage.representedCanonicalTokenCount, 1);
  assert.deepEqual(assertPenpotCanonicalParity(manifest, model), []);
  assert.ok(manifest.components.every((component) => component.sourceId?.startsWith('component:')));
  assert.ok(manifest.components.every((component) => component.sourceRevision));
  assert.ok(manifest.components.every((component) => Array.isArray(component.platformPresentationRefs)));
  assert.ok(manifest.components.every((component) => Array.isArray(component.platformExceptionRefs)));
});
