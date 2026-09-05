import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const EVIDENCE_SCHEMA_VERSION = 1;
const EVIDENCE_ID = 'com-design:ci-evidence:v1';
const DEFAULT_OUTPUT_PATH = path.join('dist', 'ci', 'evidence.json');

function readJsonIfPresent(repoRoot, relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256IfPresent(repoRoot, relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function normalizeOutcome(value) {
  return value === 'success' ? 'success' : 'failure';
}

function gateCheck(id, outcome) {
  const normalized = normalizeOutcome(outcome);
  return {
    id,
    hardGate: true,
    status: normalized === 'success' ? 'pass' : 'fail',
    evidence: { outcome: normalized },
    errors: normalized === 'success' ? [] : [id + ' did not complete successfully.'],
  };
}

function parityCheck(id, actual, expected) {
  const ok = Boolean(actual) && Boolean(expected) && actual === expected;
  return {
    id,
    hardGate: true,
    status: ok ? 'pass' : 'fail',
    evidence: { expected, actual },
    errors: ok ? [] : [id + ' source revision does not match the canonical source revision.'],
  };
}

function targetEvidence(repoRoot, definition, canonicalSourceHash) {
  const outputs = definition.outputPaths.map((relativePath) => ({
    path: relativePath,
    sha256: sha256IfPresent(repoRoot, relativePath),
    exists: fs.existsSync(path.join(repoRoot, relativePath)),
  }));
  const payload = definition.jsonPath
    ? readJsonIfPresent(repoRoot, definition.jsonPath)
    : null;
  const sourceRevision = payload ? definition.readSourceRevision(payload) : null;
  const outputsPresent = outputs.every((entry) => entry.exists);
  const sourceMatches = sourceRevision === canonicalSourceHash;
  return {
    id: definition.id,
    kind: definition.kind,
    status: outputsPresent && sourceMatches ? 'pass' : 'fail',
    sourceRevision,
    outputs,
  };
}

const FORMAL_TARGETS = Object.freeze([
  {
    id: 'validation',
    kind: 'validation',
    jsonPath: 'dist/validation/evidence.json',
    outputPaths: ['dist/validation/evidence.json'],
    readSourceRevision: (payload) => payload?.source?.sourceSha256 ?? null,
  },
  {
    id: 'web',
    kind: 'platform-adapter',
    jsonPath: 'dist/tailwind/adapter.json',
    outputPaths: ['dist/tailwind/adapter.json'],
    readSourceRevision: (payload) => payload?.source?.sourceHash ?? null,
  },
  {
    id: 'ios',
    kind: 'platform-adapter',
    jsonPath: 'dist/native-mobile/adapter.json',
    outputPaths: ['dist/native-mobile/adapter.json'],
    readSourceRevision: (payload) => payload?.source?.sourceHash ?? null,
  },
  {
    id: 'android',
    kind: 'platform-adapter',
    jsonPath: 'dist/native-mobile/adapter.json',
    outputPaths: ['dist/native-mobile/adapter.json'],
    readSourceRevision: (payload) => payload?.source?.sourceHash ?? null,
  },
  {
    id: 'wechat-mini-program',
    kind: 'platform-adapter',
    jsonPath: 'dist/wechat-mini-program/adapter.json',
    outputPaths: [
      'dist/wechat-mini-program/adapter.json',
      'dist/wechat-mini-program/tokens.js',
    ],
    readSourceRevision: (payload) => payload?.source?.sourceHash ?? null,
  },
  {
    id: 'ai-contract',
    kind: 'ai-consumer',
    jsonPath: 'dist/agent/contract.json',
    outputPaths: ['dist/agent/contract.json'],
    readSourceRevision: (payload) => payload?.sourceHash ?? null,
  },
  {
    id: 'penpot',
    kind: 'design-consumer',
    jsonPath: 'penpot/build/manifest.json',
    outputPaths: ['penpot/build/manifest.json'],
    readSourceRevision: (payload) => payload?.canonical?.sourceHash ?? null,
  },
  {
    id: 'engineering-build-manifest',
    kind: 'build-manifest',
    jsonPath: 'dist/build-manifest.json',
    outputPaths: ['dist/build-manifest.json'],
    readSourceRevision: (payload) => payload?.canonicalSourceHash ?? null,
  },
]);

export function buildCiEvidence(repoRoot, {
  repositorySha = null,
  headSha = null,
  gateResults = {},
} = {}) {
  const canonicalModel = readJsonIfPresent(repoRoot, 'dist/design-model-v2.json');
  const canonicalSourceHash = canonicalModel?.sourceHash ?? null;

  const checks = [
    gateCheck('unit-tests', gateResults.unitTests),
    gateCheck('v2-validation', gateResults.validation),
    gateCheck('engineering-build', gateResults.engineeringBuild),
    gateCheck('penpot-build', gateResults.penpotBuild),
    gateCheck('accepted-report-unchanged', gateResults.acceptedReport),
  ];

  const targets = FORMAL_TARGETS.map((definition) =>
    targetEvidence(repoRoot, definition, canonicalSourceHash),
  );

  for (const target of targets) {
    const outputsPresent = target.outputs.every((output) => output.exists);
    checks.push({
      id: 'target-output:' + target.id,
      hardGate: true,
      status: outputsPresent ? 'pass' : 'fail',
      evidence: {
        target: target.id,
        outputs: target.outputs,
      },
      errors: outputsPresent ? [] : ['Required target output is missing for ' + target.id + '.'],
    });
    checks.push(parityCheck(
      'source-parity:' + target.id,
      target.sourceRevision,
      canonicalSourceHash,
    ));
  }

  const failed = checks.filter((check) => check.status === 'fail');
  return {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    id: EVIDENCE_ID,
    $metadata: {
      authority: 'derived-build-artifact',
      editable: false,
      sourceOfTruth: 'design-source/',
    },
    result: failed.length ? 'fail' : 'pass',
    source: {
      repositorySha,
      headSha,
      canonicalSourceHash,
    },
    summary: {
      hardGates: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
      targets: targets.length,
      targetFailures: targets.filter((target) => target.status === 'fail').length,
    },
    checks,
    targets,
  };
}

export function writeCiEvidence(repoRoot, evidence, relativePath = DEFAULT_OUTPUT_PATH) {
  const outputPath = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(evidence, null, 2) + '\n', 'utf8');
  return relativePath.replaceAll('\\', '/');
}
