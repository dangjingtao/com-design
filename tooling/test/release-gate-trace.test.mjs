import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { runRepositoryValidation } from '../src/validation-orchestrator.mjs';
import { validateReleaseGateTrace } from '../src/release-gate-trace.mjs';

const repoRoot=path.resolve('.');

test('T026 every declared release requirement resolves to registered evidence ids', () => {
  const validation=runRepositoryValidation(repoRoot);
  assert.equal(validation.result,'pass');
  const trace=validation.checks.find((check)=>check.id==='release-gate-trace');
  assert.equal(trace.status,'pass');
  assert.equal(trace.evidence.requirements,19);
  assert.equal(trace.evidence.traced,19);
  assert.ok(trace.evidence.evidenceLinks>=19);
  assert.ok(trace.evidence.ciEvidenceIds.includes('build-all'));
});

test('T026 release trace rejects a plausible-looking but unregistered evidence id', () => {
  const manifest=JSON.parse(
    fs.readFileSync(path.join(repoRoot,'design-source','specs','design-system-v1.json'),'utf8')
  );
  const validation=runRepositoryValidation(repoRoot);
  const ids=validation.checks
    .map((check)=>check.id)
    .filter((id)=>id!=='release-gate-trace');

  const candidate=structuredClone(manifest);
  candidate.releaseGates.evidenceTrace.contrastAuditRequired=[
    {kind:'validation',ids:['contrast-audit-looks-real-but-is-not']}
  ];
  const result=validateReleaseGateTrace(candidate,{validationIds:ids});
  assert.ok(
    result.errors.some((error)=>error.includes('contrast-audit-looks-real-but-is-not')),
  );
});
