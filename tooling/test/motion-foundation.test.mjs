import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { loadMotionFoundation, validateMotionFoundation } from '../src/motion-foundation.mjs';
import { buildCanonicalDesignModel } from '../src/design-model.mjs';
import { validateSourceIntegrity } from '../src/source-integrity.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('T011 motion foundation is machine-readable, canonical and valid', () => {
  assert.deepEqual(validateMotionFoundation(repoRoot), []);
  const { contract } = loadMotionFoundation(repoRoot);
  assert.equal(contract.schemaVersion, 2);
  assert.equal(contract.reducedMotion.firstClass, true);
  assert.equal(contract.intents.length, 7);

  const integrity = validateSourceIntegrity(repoRoot);
  assert.deepEqual(integrity.errors, []);
  assert.ok(integrity.evidence.canonicalSources.motionContract);
  assert.ok(integrity.evidence.canonicalSources.motionSchema);

  const model = buildCanonicalDesignModel(repoRoot);
  const sourceIds = new Set(model.provenance.canonicalSources.map((source) => source.id));
  assert.ok(sourceIds.has('source:motionContract'));
  assert.ok(sourceIds.has('source:motionSchema'));
});

test('T011 platform mappings preserve intent without identical physics', () => {
  const { contract } = loadMotionFoundation(repoRoot);
  assert.equal(contract.platforms.ios.hostMotionPriority, true);
  assert.equal(contract.platforms.android.hostMotionPriority, true);
  assert.equal(contract.platforms['wechat-mini-program'].hostMotionPriority, true);
  assert.match(contract.platforms.web.reducedMotionSignal, /prefers-reduced-motion/);
  assert.ok(contract.platforms['wechat-mini-program'].constraints.includes('no-high-frequency-frame-by-frame-setData'));
});
