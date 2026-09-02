import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createAgentContract, evaluateAgentCompliance } from '../src/agent-contract.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('T014 exposes canonical implementation catalogs for a target platform', () => {
  const contract = createAgentContract(repoRoot, { platform: 'web', context: 'component-implementation' });
  assert.equal(contract.target.platform.platform, 'web');
  assert.ok(contract.catalogs.tokens.length > 0);
  assert.ok(contract.catalogs.components.length > 0);
  assert.ok(contract.catalogs.composites.length > 0);
  assert.ok(contract.catalogs.patterns.length > 0);
  assert.ok(contract.catalogs.platformAdapters.length >= 4);
  assert.ok(contract.catalogs.icons.entries.length > 0);
  assert.equal(contract.authority.agentMayRelease, false);
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
