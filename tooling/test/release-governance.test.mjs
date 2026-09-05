import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  evaluateReleaseGovernance,
  loadReleaseGovernancePolicy,
  resolveAiReviewRequirement,
  validateReleaseGovernancePolicy,
} from '../src/release-governance.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const { policy } = loadReleaseGovernancePolicy(repoRoot);

function hardGate(result = 'pass') {
  const passing = result === 'pass';
  return {
    schemaVersion: 1,
    id: 'com-design:ci-evidence:v1',
    result,
    source: { headSha: 'head-sha' },
    summary: {
      failed: passing ? 0 : 1,
      targetFailures: 0,
    },
    checks: [
      {
        id: 'fixture-hard-gate',
        hardGate: true,
        status: passing ? 'pass' : 'fail',
      },
    ],
  };
}

function aiReview(decision = 'pass') {
  return {
    schemaVersion: 1,
    reviewId: 'review-1',
    reviewer: { kind: 'ai', name: 'independent-reviewer', provider: 'configurable' },
    decision,
    findings: [],
    warnings: [],
    evidence: ['review-evidence'],
  };
}

function mira(decision = 'approve') {
  return {
    reviewer: 'Mira',
    decision,
    rationale: 'Recorded release judgment for governance test.',
    evidence: ['mira-review-evidence'],
  };
}

function request(overrides = {}) {
  return {
    release: { version: '2.1.0', changeLevel: 'minor', targetSha: 'head-sha' },
    change: {
      actorKind: 'human',
      riskLevel: 'low',
      forceAiReview: false,
      requiresConsumerCodeChange: false,
      breakingSurface: [],
      impactEvidence: [],
    },
    hardGate: hardGate(),
    aiReview: null,
    miraJudgment: mira(),
    ...overrides,
  };
}

test('T019 canonical policy fixes governance order, vendor neutrality, and pinned consumers', () => {
  assert.deepEqual(validateReleaseGovernancePolicy(policy), []);
  assert.equal(policy.aiReviewGate.vendorNeutral, true);
  assert.equal(policy.consumerVersionPolicy.defaultMode, 'pinned');
  assert.equal(policy.consumerVersionPolicy.autoUpgrade, false);
  assert.equal(policy.consumerVersionPolicy.explicitUpgradeRequired, true);
  assert.deepEqual(policy.pipeline, [
    'deterministic-hard-gates',
    'conditional-ai-review',
    'mira-judgment',
    'release-eligibility',
    'consumer-explicit-upgrade',
  ]);
});

test('T019 hard gate failure cannot be overridden by AI or Mira approval', () => {
  const result = evaluateReleaseGovernance(policy, request({
    hardGate: hardGate('fail'),
    aiReview: aiReview('pass'),
  }));

  assert.equal(result.hardCompliance, 'fail');
  assert.equal(result.miraJudgment.status, 'approve');
  assert.equal(result.releaseEligibility.eligible, false);
  assert.ok(result.releaseEligibility.blockers.includes('deterministic-hard-gate'));
});

test('T019 requires AI review for agent medium-plus risk without binding a vendor', () => {
  const requirement = resolveAiReviewRequirement(policy, {
    actorKind: 'agent',
    riskLevel: 'medium',
    forceAiReview: false,
  });
  assert.equal(requirement.required, true);
  assert.ok(requirement.matchedRules.includes('agent-medium-plus'));

  const result = evaluateReleaseGovernance(policy, request({
    change: {
      actorKind: 'agent',
      riskLevel: 'medium',
      forceAiReview: false,
      requiresConsumerCodeChange: false,
      breakingSurface: [],
      impactEvidence: [],
    },
    aiReview: null,
  }));
  assert.equal(result.aiReview.status, 'missing');
  assert.equal(result.releaseEligibility.eligible, false);
  assert.ok(result.releaseEligibility.blockers.includes('ai-review'));
});

test('T019 accepts compatible minor release only after required AI pass and Mira approve', () => {
  const result = evaluateReleaseGovernance(policy, request({
    change: {
      actorKind: 'agent',
      riskLevel: 'high',
      forceAiReview: false,
      requiresConsumerCodeChange: false,
      breakingSurface: [],
      impactEvidence: [],
    },
    aiReview: aiReview('pass'),
    miraJudgment: mira('approve'),
  }));

  assert.equal(result.hardCompliance, 'pass');
  assert.equal(result.aiReview.status, 'pass');
  assert.equal(result.miraJudgment.status, 'approve');
  assert.equal(result.compatibility.status, 'pass');
  assert.equal(result.releaseEligibility.eligible, true);
  assert.deepEqual(result.releaseEligibility.blockers, []);
});

test('T019 AI revise/reject cannot be ignored even when Mira approves', () => {
  for (const decision of ['revise', 'reject']) {
    const result = evaluateReleaseGovernance(policy, request({
      aiReview: aiReview(decision),
    }));
    assert.equal(result.aiReview.status, decision);
    assert.equal(result.releaseEligibility.eligible, false);
    assert.ok(result.releaseEligibility.blockers.includes('ai-review'));
  }
});

test('T019 Mira revise/reject formally blocks release', () => {
  for (const decision of ['revise', 'reject']) {
    const result = evaluateReleaseGovernance(policy, request({
      miraJudgment: mira(decision),
    }));
    assert.equal(result.miraJudgment.status, decision);
    assert.equal(result.releaseEligibility.eligible, false);
    assert.ok(result.releaseEligibility.blockers.includes('mira-judgment'));
  }
});

test('T019 patch/minor cannot hide a breaking consumer change', () => {
  for (const changeLevel of ['patch', 'minor']) {
    const result = evaluateReleaseGovernance(policy, request({
      release: {
        version: changeLevel === 'patch' ? '2.0.1' : '2.1.0',
        changeLevel,
        targetSha: 'head-sha',
      },
      change: {
        actorKind: 'human',
        riskLevel: 'low',
        forceAiReview: false,
        requiresConsumerCodeChange: true,
        breakingSurface: ['component:button.api'],
        impactEvidence: [],
      },
    }));
    assert.equal(result.compatibility.status, 'fail');
    assert.equal(result.releaseEligibility.eligible, false);
    assert.ok(result.releaseEligibility.blockers.includes('compatibility'));
  }
});

test('T019 major release requires breaking surface, migration and impact evidence', () => {
  const incomplete = evaluateReleaseGovernance(policy, request({
    release: { version: '3.0.0', changeLevel: 'major', targetSha: 'head-sha' },
    change: {
      actorKind: 'human',
      riskLevel: 'high',
      forceAiReview: true,
      requiresConsumerCodeChange: true,
      breakingSurface: ['adapter:web.api'],
      migration: null,
      impactEvidence: [],
    },
    aiReview: aiReview('pass'),
  }));
  assert.equal(incomplete.compatibility.status, 'fail');
  assert.equal(incomplete.releaseEligibility.eligible, false);

  const complete = evaluateReleaseGovernance(policy, request({
    release: { version: '3.0.0', changeLevel: 'major', targetSha: 'head-sha' },
    change: {
      actorKind: 'human',
      riskLevel: 'high',
      forceAiReview: true,
      requiresConsumerCodeChange: true,
      breakingSurface: ['adapter:web.api'],
      migration: {
        summary: 'Move consumer from old adapter API to the new versioned API.',
        steps: ['Pin current version', 'Apply migration', 'Run product smoke', 'Update version lock'],
      },
      impactEvidence: ['representative-consumer-build', 'migration-smoke'],
    },
    aiReview: aiReview('pass'),
    miraJudgment: mira('approve'),
  }));
  assert.equal(complete.compatibility.status, 'pass');
  assert.equal(complete.releaseEligibility.eligible, true);
  assert.ok(complete.evidence.some((entry) => entry.kind === 'impact'));
});

test('T019 records findings, warnings, evidence and decision status in one audit artifact', () => {
  const review = aiReview('pass');
  review.findings = [{ id: 'finding-1', severity: 'info' }];
  review.warnings = [{ id: 'warning-1', message: 'soft quality note' }];
  review.evidence = ['ai-evidence-1'];

  const result = evaluateReleaseGovernance(policy, request({ aiReview: review }));

  assert.equal(result.decisionStatus.hardCompliance, 'pass');
  assert.equal(result.decisionStatus.aiReview, 'pass');
  assert.equal(result.decisionStatus.mira, 'approve');
  assert.equal(result.decisionStatus.release, 'eligible');
  assert.deepEqual(result.findings, review.findings);
  assert.deepEqual(result.warnings, review.warnings);
  assert.ok(result.evidence.some((entry) => entry.kind === 'ai-review'));
  assert.ok(result.evidence.some((entry) => entry.kind === 'mira-judgment'));
});


test('T019 missing risk/authorship metadata cannot bypass conditional AI review', () => {
  const result = evaluateReleaseGovernance(policy, request({
    change: {
      forceAiReview: false,
      requiresConsumerCodeChange: false,
      breakingSurface: [],
      impactEvidence: [],
    },
  }));

  assert.equal(result.changeMetadata.status, 'fail');
  assert.equal(result.releaseEligibility.eligible, false);
  assert.ok(result.releaseEligibility.blockers.includes('change-metadata'));
});

test('T019 mixed agent-authored medium-risk change triggers independent AI review', () => {
  const requirement = resolveAiReviewRequirement(policy, {
    actorKind: 'mixed',
    riskLevel: 'medium',
    forceAiReview: false,
  });

  assert.equal(requirement.required, true);
  assert.ok(requirement.matchedRules.includes('agent-medium-plus'));
});

test('T019 rejects hollow T017 evidence even when id/result claim pass', () => {
  const result = evaluateReleaseGovernance(policy, request({
    hardGate: {
      schemaVersion: 1,
      id: 'com-design:ci-evidence:v1',
      result: 'pass',
      source: { headSha: 'head-sha' },
    },
  }));

  assert.equal(result.hardCompliance, 'fail');
  assert.equal(result.releaseEligibility.eligible, false);
  assert.ok(result.releaseEligibility.blockers.includes('deterministic-hard-gate'));
});

test('T019 AI pass requires auditable evidence and named reviewer', () => {
  const review = aiReview('pass');
  review.evidence = [];
  review.reviewer = { kind: 'ai' };

  const result = evaluateReleaseGovernance(policy, request({
    change: {
      actorKind: 'agent',
      riskLevel: 'medium',
      forceAiReview: false,
      requiresConsumerCodeChange: false,
      breakingSurface: [],
      impactEvidence: [],
    },
    aiReview: review,
  }));

  assert.equal(result.aiReview.status, 'invalid');
  assert.equal(result.releaseEligibility.eligible, false);
  assert.ok(result.releaseEligibility.blockers.includes('ai-review'));
});

test('T019 Mira approve requires cited evidence', () => {
  const judgment = mira('approve');
  judgment.evidence = [];

  const result = evaluateReleaseGovernance(policy, request({
    miraJudgment: judgment,
  }));

  assert.equal(result.miraJudgment.status, 'invalid');
  assert.equal(result.releaseEligibility.eligible, false);
  assert.ok(result.releaseEligibility.blockers.includes('mira-judgment'));
});


test('T019 rejects stale passing hard-gate evidence from a different release SHA', () => {
  const result = evaluateReleaseGovernance(policy, request({
    release: {
      version: '2.1.0',
      changeLevel: 'minor',
      targetSha: 'new-head-sha',
    },
    hardGate: hardGate('pass'),
  }));

  assert.equal(result.hardCompliance, 'fail');
  assert.equal(result.releaseEligibility.eligible, false);
  assert.ok(
    result.hardGate.errors.some((error) => error.includes('release.targetSha')),
  );
});

test('T019 enforces SemVer 2.0.0 grammar for formal versions', () => {
  const invalidVersions = [
    '01.0.0',
    '1.01.0',
    '1.0.01',
    '1.0.0-a..b',
    '1.0.0-01',
    '1.0',
    'v1.0.0',
  ];

  for (const version of invalidVersions) {
    const result = evaluateReleaseGovernance(policy, request({
      release: {
        version,
        changeLevel: 'patch',
        targetSha: 'head-sha',
      },
    }));
    assert.equal(result.compatibility.status, 'fail', version);
    assert.equal(result.releaseEligibility.eligible, false, version);
  }

  for (const version of [
    '1.0.0',
    '1.0.0-alpha',
    '1.0.0-alpha.1',
    '1.0.0+build.001',
    '1.0.0-rc.2+build.7',
  ]) {
    const result = evaluateReleaseGovernance(policy, request({
      release: {
        version,
        changeLevel: 'patch',
        targetSha: 'head-sha',
      },
    }));
    assert.equal(result.compatibility.status, 'pass', version);
  }
});
