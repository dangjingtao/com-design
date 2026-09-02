import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { loadMotionFoundation, validateMotionFoundation } from '../src/motion-foundation.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('T011 motion foundation is machine-readable and valid', () => {
  assert.deepEqual(validateMotionFoundation(repoRoot), []);
  const { contract } = loadMotionFoundation(repoRoot);
  assert.equal(contract.schemaVersion, 2);
  assert.equal(contract.reducedMotion.firstClass, true);
  assert.equal(contract.intents.length, 7);
});

test('T011 platform mappings preserve intent without identical physics', () => {
  const { contract } = loadMotionFoundation(repoRoot);
  assert.equal(contract.platforms.ios.hostMotionPriority, true);
  assert.equal(contract.platforms.android.hostMotionPriority, true);
  assert.equal(contract.platforms['wechat-mini-program'].hostMotionPriority, true);
  assert.match(contract.platforms.web.reducedMotionSignal, /prefers-reduced-motion/);
  assert.ok(contract.platforms['wechat-mini-program'].constraints.includes('no-high-frequency-frame-by-frame-setData'));
});
