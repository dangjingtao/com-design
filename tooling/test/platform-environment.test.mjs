import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  validatePlatformEnvironmentContract,
  validatePlatformEnvironmentSnapshot,
} from '../src/platform-environment.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const contract = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'specs', 'platform-environment-v1.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'schemas', 'platform-environment-v1.schema.json'), 'utf8'));
const platformModel = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'specs', 'platform-model-v2.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'specs', 'design-system-v1.json'), 'utf8'));

function example(platform) {
  return structuredClone(contract.examples.find((entry) => entry.platform === platform).snapshot);
}

test('repository environment contract, schema, platform model and manifest stay aligned', () => {
  assert.deepEqual(validatePlatformEnvironmentContract(contract, schema, platformModel, manifest), []);
});

test('platform environment schema keeps every canonical snapshot section required', () => {
  const weakenedSchema = structuredClone(schema);
  weakenedSchema.required = weakenedSchema.required.filter((key) => key !== 'focus');
  assert.ok(
    validatePlatformEnvironmentContract(contract, weakenedSchema, platformModel, manifest)
      .some((error) => error.includes('schema must require focus')),
  );
});

test('all four platform environment examples pass the schema contract', () => {
  assert.deepEqual(contract.examples.map((entry) => entry.platform).sort(), platformModel.axes.platform.values.slice().sort());
  for (const entry of contract.examples) {
    assert.deepEqual(validatePlatformEnvironmentSnapshot(entry.snapshot, schema), [], entry.name);
  }
});

test('WeChat capsule is host chrome with a host-owned reserved region', () => {
  const mini = example('wechat-mini-program');
  const capsule = mini.chrome.find((item) => item.kind === 'host-capsule');
  assert.ok(capsule);
  assert.equal(capsule.owner, 'host');
  assert.equal(capsule.comDesignOwned, false);
  const region = mini.geometry.reservedRegions.find((item) => capsule.reservedRegionIds.includes(item.id));
  assert.equal(region.owner, 'host');
  assert.equal(region.comDesignOwned, false);
});

test('environment can select presentation but cannot mutate Core semantics or hierarchy', () => {
  assert.equal(contract.invariants.platformPresentationSelectionAllowed, true);
  assert.equal(contract.invariants.coreSemanticsMutable, false);
  assert.equal(contract.invariants.actionHierarchyMutable, false);
  assert.equal(contract.invariants.taskResultMutable, false);
  assert.equal(contract.invariants.authoritativeStateMutable, false);
  for (const key of ['task-result', 'state-semantics', 'action-hierarchy']) {
    assert.ok(contract.presentationPolicy.mustRemainEquivalent.includes(key));
  }
});

test('platform name does not infer pointer capability', () => {
  const web = example('web');
  web.pointer = { supported: false, hover: false, precision: 'none' };
  assert.deepEqual(validatePlatformEnvironmentSnapshot(web, schema), []);

  const mini = example('wechat-mini-program');
  mini.pointer = { supported: true, hover: true, precision: 'fine' };
  assert.deepEqual(validatePlatformEnvironmentSnapshot(mini, schema), []);
});

test('back availability always exposes an actionable mechanism', () => {
  const android = example('android');
  android.back.available = true;
  android.back.mechanisms = [];
  assert.ok(
    validatePlatformEnvironmentSnapshot(android, schema)
      .some((error) => error.includes('must not be empty when back is available')),
  );
});

test('reserved region identifiers are unique within a snapshot', () => {
  const mini = example('wechat-mini-program');
  const duplicate = structuredClone(mini.geometry.reservedRegions[0]);
  duplicate.rect.x += 1;
  mini.geometry.reservedRegions.push(duplicate);
  assert.ok(
    validatePlatformEnvironmentSnapshot(mini, schema)
      .some((error) => error.includes(`duplicate id ${duplicate.id}`)),
  );
});

test('invalid geometry, ownership, capability and unknown properties are rejected', () => {
  const negativeInset = example('ios');
  negativeInset.geometry.safeAreaInsets.top = -1;
  assert.ok(validatePlatformEnvironmentSnapshot(negativeInset, schema).some((error) => error.includes('must be >= 0')));

  const coreOwnedChrome = example('wechat-mini-program');
  coreOwnedChrome.chrome[0].comDesignOwned = true;
  assert.ok(validatePlatformEnvironmentSnapshot(coreOwnedChrome, schema).some((error) => error.includes('must equal false')));

  const badDismissal = example('web');
  badDismissal.overlay.dismissalMechanisms.push('double-click');
  assert.ok(validatePlatformEnvironmentSnapshot(badDismissal, schema).some((error) => error.includes('dismissalMechanisms')));

  const missingRegion = example('android');
  missingRegion.chrome[0].reservedRegionIds = ['missing-region'];
  assert.ok(validatePlatformEnvironmentSnapshot(missingRegion, schema).some((error) => error.includes('references missing reserved region')));

  const unknown = example('web');
  unknown.platformGuess = 'desktop';
  assert.ok(validatePlatformEnvironmentSnapshot(unknown, schema).some((error) => error.includes('platformGuess is not allowed')));
});
