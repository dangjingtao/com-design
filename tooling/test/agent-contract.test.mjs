import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createAgentContract, evaluateAgentCompliance } from '../src/agent-contract.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const webContext = {
  schemaVersion: 2,
  platform: 'web',
  viewport: 'wide',
  input: 'pointer',
  motion: 'standard',
  colorScheme: 'light',
  contentScale: 'standard',
};

test('T014 exposes canonical implementation catalogs for a validated target context', () => {
  const contract = createAgentContract(repoRoot, { platform: 'web', context: webContext });
  assert.equal(contract.target.platform.platform, 'web');
  assert.equal(contract.target.context.input, 'pointer');
  assert.equal(contract.target.implementationPath.ownerTask, 'T007');
  assert.equal(contract.target.implementationPath.readiness, 'incomplete');
  assert.ok(contract.catalogs.tokens.length > 0);
  assert.ok(contract.catalogs.components.length > 0);
  assert.ok(contract.catalogs.composites.length > 0);
  assert.ok(contract.catalogs.patterns.length > 0);
  assert.ok(contract.catalogs.motion?.intents?.length >= 7);
  assert.ok(contract.catalogs.platformAdapters.length >= 4);
  assert.ok(contract.catalogs.registeredEngineeringOutputs.some((entry) => entry.id === 'web.tailwind'));
  assert.ok(contract.catalogs.icons.entries.length > 0);
  assert.equal(contract.authority.agentMayRelease, false);
  assert.equal(contract.layers.productExtension.mayMutateCore, false);
});

test('T014 rejects invalid or contradictory platform context instead of guessing', () => {
  assert.throws(
    () => createAgentContract(repoRoot, { platform: 'web', context: { ...webContext, viewport: 'desktop' } }),
    /Invalid Com Design platform context/,
  );
  assert.throws(
    () => createAgentContract(repoRoot, { platform: 'ios', context: webContext }),
    /conflicts with context\.platform/,
  );

  const mini = createAgentContract(repoRoot, {
    context: { ...webContext, platform: 'wechat-mini-program', viewport: 'compact', input: 'touch' },
  });
  assert.equal(mini.target.implementationPath.readiness, 'incomplete');
  assert.equal(mini.target.implementationPath.ownerTask, 'T009');
  assert.deepEqual(mini.target.implementationPath.supportingOutputs, []);
});

test('T014 keeps hard compliance separate from human judgement', () => {
  const pass = evaluateAgentCompliance({ evidence: [{ rule: 'schema', result: 'pass' }], warnings: ['visual balance needs review'] });
  assert.equal(pass.hardCompliance, 'pass');
  assert.equal(pass.humanDecision, 'required');
  assert.equal(pass.warnings.length, 1);

  const fail = evaluateAgentCompliance({ hardFailures: ['missing required state'] });
  assert.equal(fail.hardCompliance, 'fail');
  assert.equal(fail.humanDecision, 'required');
});
