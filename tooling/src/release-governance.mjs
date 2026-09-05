import fs from 'node:fs';
import path from 'node:path';

const POLICY_ID = 'com-design:release-governance:v1';
const CI_EVIDENCE_ID = 'com-design:ci-evidence:v1';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function semverLike(value) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(String(value ?? ''));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function loadReleaseGovernancePolicy(repoRoot) {
  const manifestPath = path.join(repoRoot, 'design-source', 'specs', 'design-system-v1.json');
  const manifest = readJson(manifestPath);
  const relativePath = manifest.sources?.releaseGovernance;
  if (!relativePath) {
    throw new Error('Manifest must declare sources.releaseGovernance.');
  }
  const policyPath = path.resolve(path.dirname(manifestPath), relativePath);
  return {
    policy: readJson(policyPath),
    policyPath,
    manifest,
  };
}

export function validateReleaseGovernancePolicy(policy) {
  const errors = [];
  if (!isObject(policy)) return ['release governance policy must be an object.'];
  if (policy.schemaVersion !== 1 || policy.id !== POLICY_ID) {
    errors.push('release governance policy must use schemaVersion 1 and the canonical policy id.');
  }

  const expectedPipeline = [
    'deterministic-hard-gates',
    'conditional-ai-review',
    'mira-judgment',
    'release-eligibility',
    'consumer-explicit-upgrade',
  ];
  if (JSON.stringify(policy.pipeline) !== JSON.stringify(expectedPipeline)) {
    errors.push('governance pipeline order must be hard gate → AI review → Mira → eligibility → consumer upgrade.');
  }

  const hard = policy.deterministicHardGate;
  if (
    hard?.requiredEvidenceId !== CI_EVIDENCE_ID
    || hard?.requiredResult !== 'pass'
    || hard?.canBeOverridden !== false
  ) {
    errors.push('deterministic hard gate must require T017 pass evidence and must not be overridable.');
  }

  const ai = policy.aiReviewGate;
  if (ai?.vendorNeutral !== true || ai?.defaultMode !== 'optional' || ai?.passingDecision !== 'pass') {
    errors.push('AI Review Gate must be vendor-neutral, conditional, and require a pass decision when active.');
  }
  if (!nonEmptyArray(ai?.triggerRules)) {
    errors.push('AI Review Gate must declare at least one configurable trigger rule.');
  }
  const requiredAiFields = [
    'schemaVersion',
    'reviewId',
    'reviewer',
    'decision',
    'findings',
    'warnings',
    'evidence',
  ];
  if (
    ai?.evidenceContract?.schemaVersion !== 1
    || !requiredAiFields.every((field) => ai?.evidenceContract?.requiredFields?.includes(field))
  ) {
    errors.push('AI Review evidence contract must require findings, warnings, evidence, reviewer and decision status.');
  }

  const mira = policy.miraJudgment;
  if (
    mira?.role !== 'Mira'
    || mira?.requiredForRelease !== true
    || mira?.finalVeto !== true
    || JSON.stringify(mira?.decisions) !== JSON.stringify(['approve', 'revise', 'reject'])
  ) {
    errors.push('Mira must be the required final release judge with approve/revise/reject and veto authority.');
  }

  const versioning = policy.versioning;
  if (versioning?.strategy !== 'semver') {
    errors.push('release governance must use SemVer.');
  }
  for (const level of ['patch', 'minor']) {
    if (
      versioning?.levels?.[level]?.breakingAllowed !== false
      || versioning?.levels?.[level]?.consumerCodeChangeExpected !== false
    ) {
      errors.push(level + ' releases must remain backward compatible by default.');
    }
  }
  if (
    versioning?.levels?.major?.breakingAllowed !== true
    || !['breakingSurface', 'migration', 'impactEvidence'].every(
      (field) => versioning?.majorRequirements?.includes(field),
    )
  ) {
    errors.push('major releases must allow governed breaking changes and require migration + impact evidence.');
  }

  const consumer = policy.consumerVersionPolicy;
  if (
    consumer?.defaultMode !== 'pinned'
    || consumer?.autoUpgrade !== false
    || consumer?.explicitUpgradeRequired !== true
    || consumer?.upgradeEvidenceRequired !== true
    || consumer?.majorImpactConfirmationRequired !== true
  ) {
    errors.push('consumer projects must pin Com Design and upgrade explicitly with evidence.');
  }

  return errors;
}

function triggerMatches(match, change) {
  if (!isObject(match)) return false;
  const predicates = [];

  if (Array.isArray(match.forceAiReview)) {
    predicates.push(match.forceAiReview.includes(change.forceAiReview === true));
  }
  if (Array.isArray(match.actorKinds)) {
    predicates.push(match.actorKinds.includes(change.actorKind));
  }
  if (Array.isArray(match.riskLevels)) {
    predicates.push(match.riskLevels.includes(change.riskLevel));
  }

  return predicates.length > 0 && predicates.every(Boolean);
}

export function resolveAiReviewRequirement(policy, change = {}) {
  const matchedRules = (policy.aiReviewGate?.triggerRules ?? [])
    .filter((rule) => triggerMatches(rule.match, change))
    .map((rule) => rule.id);
  return {
    required: matchedRules.length > 0,
    matchedRules,
  };
}

export function validateAiReviewEvidence(policy, review) {
  const errors = [];
  if (!isObject(review)) return ['AI review evidence must be an object.'];

  for (const field of policy.aiReviewGate?.evidenceContract?.requiredFields ?? []) {
    if (!Object.hasOwn(review, field)) {
      errors.push('AI review evidence is missing required field: ' + field + '.');
    }
  }
  if (review.schemaVersion !== 1) errors.push('AI review schemaVersion must be 1.');
  if (typeof review.reviewId !== 'string' || review.reviewId.length === 0) {
    errors.push('AI review reviewId must be a non-empty string.');
  }
  if (!isObject(review.reviewer)) {
    errors.push('AI review reviewer must be an object.');
  } else if (
    !policy.aiReviewGate.evidenceContract.reviewerKinds.includes(review.reviewer.kind)
  ) {
    errors.push('AI review reviewer.kind is not allowed by the evidence contract.');
  }
  if (!policy.aiReviewGate.evidenceContract.decisions.includes(review.decision)) {
    errors.push('AI review decision must be pass, revise, or reject.');
  }
  if (!Array.isArray(review.findings)) errors.push('AI review findings must be an array.');
  if (!Array.isArray(review.warnings)) errors.push('AI review warnings must be an array.');
  if (!Array.isArray(review.evidence)) errors.push('AI review evidence must be an array.');

  return errors;
}

function compatibilityEvaluation(policy, request) {
  const release = request.release ?? {};
  const change = request.change ?? {};
  const errors = [];
  const level = release.changeLevel;

  if (!['patch', 'minor', 'major'].includes(level)) {
    errors.push('release.changeLevel must be patch, minor, or major.');
  }
  if (!semverLike(release.version)) {
    errors.push('release.version must be SemVer-compatible.');
  }

  const breakingSurface = Array.isArray(change.breakingSurface) ? change.breakingSurface : [];
  const requiresConsumerCodeChange = change.requiresConsumerCodeChange === true;

  if (level === 'patch' || level === 'minor') {
    if (breakingSurface.length > 0 || requiresConsumerCodeChange) {
      errors.push(level + ' release cannot contain a breaking surface or require consumer code changes.');
    }
  }

  if (level === 'major') {
    if (breakingSurface.length === 0) {
      errors.push('major release requires explicit breakingSurface evidence.');
    }
    if (
      !isObject(change.migration)
      || typeof change.migration.summary !== 'string'
      || change.migration.summary.length === 0
      || !nonEmptyArray(change.migration.steps)
    ) {
      errors.push('major release requires a migration summary and non-empty migration steps.');
    }
    if (!nonEmptyArray(change.impactEvidence)) {
      errors.push('major release requires non-empty impactEvidence.');
    }
  }

  return {
    status: errors.length ? 'fail' : 'pass',
    level,
    errors,
    breakingSurface,
    migration: change.migration ?? null,
    impactEvidence: Array.isArray(change.impactEvidence) ? change.impactEvidence : [],
  };
}

function hardGateEvaluation(policy, hardGate) {
  const pass = hardGate?.id === policy.deterministicHardGate.requiredEvidenceId
    && hardGate?.result === policy.deterministicHardGate.requiredResult;
  return {
    status: pass ? 'pass' : 'fail',
    evidenceId: hardGate?.id ?? null,
    evidenceResult: hardGate?.result ?? null,
    errors: pass
      ? []
      : ['deterministic hard gate evidence must be T017 evidence with result=pass.'],
  };
}

function miraEvaluation(policy, judgment) {
  if (!isObject(judgment)) {
    return {
      status: 'pending',
      decision: null,
      reviewer: null,
      rationale: null,
      evidence: [],
      errors: ['Mira release judgment is required before release eligibility.'],
    };
  }

  const errors = [];
  if (judgment.reviewer !== policy.miraJudgment.role) {
    errors.push('release judgment reviewer must be Mira.');
  }
  if (!policy.miraJudgment.decisions.includes(judgment.decision)) {
    errors.push('Mira decision must be approve, revise, or reject.');
  }
  if (typeof judgment.rationale !== 'string' || judgment.rationale.length === 0) {
    errors.push('Mira judgment must record a rationale.');
  }
  if (!Array.isArray(judgment.evidence)) {
    errors.push('Mira judgment evidence must be an array.');
  }

  return {
    status: errors.length ? 'invalid' : judgment.decision,
    decision: judgment.decision ?? null,
    reviewer: judgment.reviewer ?? null,
    rationale: judgment.rationale ?? null,
    evidence: Array.isArray(judgment.evidence) ? judgment.evidence : [],
    errors,
  };
}

export function evaluateReleaseGovernance(policy, request) {
  const policyErrors = validateReleaseGovernancePolicy(policy);
  if (policyErrors.length) {
    throw new Error('Invalid release governance policy:\n- ' + policyErrors.join('\n- '));
  }

  const hardGate = hardGateEvaluation(policy, request.hardGate);
  const compatibility = compatibilityEvaluation(policy, request);
  const aiRequirement = resolveAiReviewRequirement(policy, request.change ?? {});

  let aiReview;
  if (!request.aiReview) {
    aiReview = {
      required: aiRequirement.required,
      triggeredBy: aiRequirement.matchedRules,
      status: aiRequirement.required ? 'missing' : 'not-required',
      decision: null,
      reviewer: null,
      findings: [],
      warnings: [],
      evidence: [],
      errors: aiRequirement.required ? ['AI Review Gate is required but evidence is missing.'] : [],
    };
  } else {
    const errors = validateAiReviewEvidence(policy, request.aiReview);
    aiReview = {
      required: aiRequirement.required,
      triggeredBy: aiRequirement.matchedRules,
      status: errors.length ? 'invalid' : request.aiReview.decision,
      decision: request.aiReview.decision ?? null,
      reviewer: request.aiReview.reviewer ?? null,
      findings: Array.isArray(request.aiReview.findings) ? request.aiReview.findings : [],
      warnings: Array.isArray(request.aiReview.warnings) ? request.aiReview.warnings : [],
      evidence: Array.isArray(request.aiReview.evidence) ? request.aiReview.evidence : [],
      errors,
    };
  }

  const aiSatisfied = aiReview.status === 'not-required' || aiReview.status === 'pass';
  const mira = miraEvaluation(policy, request.miraJudgment);
  const miraApproved = mira.status === 'approve';

  const blockers = [];
  if (hardGate.status !== 'pass') blockers.push('deterministic-hard-gate');
  if (compatibility.status !== 'pass') blockers.push('compatibility');
  if (!aiSatisfied) blockers.push('ai-review');
  if (!miraApproved) blockers.push('mira-judgment');

  const eligible = blockers.length === 0;

  return {
    schemaVersion: 1,
    id: 'com-design:release-governance-evidence:v1',
    $metadata: {
      authority: 'derived-review-artifact',
      editable: false,
      sourceOfTruth: 'design-source/',
      policyId: policy.id,
    },
    release: {
      version: request.release?.version ?? null,
      changeLevel: request.release?.changeLevel ?? null,
    },
    change: {
      actorKind: request.change?.actorKind ?? null,
      riskLevel: request.change?.riskLevel ?? null,
      forceAiReview: request.change?.forceAiReview === true,
    },
    hardCompliance: hardGate.status,
    hardGate,
    compatibility,
    aiReview,
    miraJudgment: mira,
    consumerVersionPolicy: policy.consumerVersionPolicy,
    decisionStatus: {
      hardCompliance: hardGate.status,
      aiReview: aiReview.status,
      mira: mira.status,
      release: eligible ? 'eligible' : 'blocked',
    },
    findings: aiReview.findings,
    warnings: aiReview.warnings,
    evidence: [
      {
        kind: 'deterministic-hard-gate',
        id: hardGate.evidenceId,
        result: hardGate.evidenceResult,
      },
      ...aiReview.evidence.map((entry) => ({ kind: 'ai-review', value: entry })),
      ...mira.evidence.map((entry) => ({ kind: 'mira-judgment', value: entry })),
      ...compatibility.impactEvidence.map((entry) => ({ kind: 'impact', value: entry })),
    ],
    releaseEligibility: {
      eligible,
      status: eligible ? 'eligible' : 'blocked',
      blockers,
      rule: 'hard gate pass + required AI review pass + compatible version evidence + Mira approve',
    },
  };
}

export function buildGovernanceDryRun(policy, hardGate, {
  version = '0.0.0',
  repositorySha = null,
} = {}) {
  const evidence = evaluateReleaseGovernance(policy, {
    release: {
      version,
      changeLevel: 'patch',
    },
    change: {
      actorKind: 'human',
      riskLevel: 'low',
      forceAiReview: false,
      requiresConsumerCodeChange: false,
      breakingSurface: [],
      impactEvidence: [],
    },
    hardGate,
    aiReview: null,
    miraJudgment: null,
  });

  return {
    ...evidence,
    mode: 'ci-dry-run',
    source: {
      repositorySha,
      hardGateHeadSha: hardGate?.source?.headSha ?? null,
    },
    dryRunExpectation: {
      releaseEligible: false,
      expectedBlocker: 'mira-judgment',
      note: 'CI may prove governance is executable, but cannot self-approve a formal release.',
    },
  };
}

export function writeReleaseGovernanceEvidence(repoRoot, evidence, relativePath = path.join('dist', 'governance', 'evidence.json')) {
  const outputPath = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(evidence, null, 2) + '\n', 'utf8');
  return relativePath.replaceAll('\\', '/');
}
