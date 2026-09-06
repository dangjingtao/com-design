import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { runRepositoryValidation } from '../src/validation-orchestrator.mjs';
import { validateReleaseGateTrace } from '../src/release-gate-trace.mjs';

const repoRoot=path.resolve('.');
const readJson=(relativePath)=>JSON.parse(
  fs.readFileSync(path.join(repoRoot,relativePath),'utf8')
);

test('T026 every declared release requirement resolves to registered and backed evidence ids', () => {
  const validation=runRepositoryValidation(repoRoot);
  assert.equal(validation.result,'pass');
  const trace=validation.checks.find((check)=>check.id==='release-gate-trace');
  assert.equal(trace.status,'pass');
  assert.equal(trace.evidence.requirements,19);
  assert.equal(trace.evidence.traced,19);
  assert.ok(trace.evidence.evidenceLinks>=19);
  assert.ok(trace.evidence.ciEvidenceIds.includes('build-all'));
  assert.equal(trace.evidence.miraJudgmentBacked,true);
  assert.ok(trace.evidence.governanceEvidenceIds.includes('mira-judgment'));
});

test('T026 release trace rejects a plausible-looking but unregistered evidence id', () => {
  const manifest=readJson('design-source/specs/design-system-v1.json');
  const releaseGovernance=readJson('design-source/specs/release-governance-v1.json');
  const validation=runRepositoryValidation(repoRoot);
  const ids=validation.checks
    .map((check)=>check.id)
    .filter((id)=>id!=='release-gate-trace');

  const candidate=structuredClone(manifest);
  candidate.releaseGates.evidenceTrace.contrastAuditRequired=[
    {kind:'validation',ids:['contrast-audit-looks-real-but-is-not']}
  ];
  const result=validateReleaseGateTrace(candidate,{
    validationIds:ids,
    releaseGovernance,
  });
  assert.ok(
    result.errors.some((error)=>error.includes('contrast-audit-looks-real-but-is-not')),
  );
});

test('T026 release trace rejects Mira evidence when T019 no longer requires Mira', () => {
  const manifest=readJson('design-source/specs/design-system-v1.json');
  const releaseGovernance=readJson('design-source/specs/release-governance-v1.json');
  const validation=runRepositoryValidation(repoRoot);
  const ids=validation.checks
    .map((check)=>check.id)
    .filter((id)=>id!=='release-gate-trace');

  releaseGovernance.miraJudgment.requiredForRelease=false;
  const result=validateReleaseGateTrace(manifest,{
    validationIds:ids,
    releaseGovernance,
  });
  assert.ok(
    result.errors.some((error)=>
      error.includes('independentReviewRequiredBeforeStableRelease')
      && error.includes('mira-judgment'),
    ),
  );
  assert.equal(result.evidence.miraJudgmentBacked,false);
});

test('T026 release trace rejects a CI evidence id outside the registered hard-gate vocabulary', () => {
  const manifest=readJson('design-source/specs/design-system-v1.json');
  const releaseGovernance=readJson('design-source/specs/release-governance-v1.json');
  const validation=runRepositoryValidation(repoRoot);
  const ids=validation.checks
    .map((check)=>check.id)
    .filter((id)=>id!=='release-gate-trace');

  const candidate=structuredClone(manifest);
  candidate.releaseGates.evidenceTrace.penpotSyncPolicyRequired=[
    {kind:'ci',ids:['penpot-build-looks-real-but-is-not']}
  ];
  const result=validateReleaseGateTrace(candidate,{
    validationIds:ids,
    releaseGovernance,
  });
  assert.ok(
    result.errors.some((error)=>error.includes('penpot-build-looks-real-but-is-not')),
  );
});
