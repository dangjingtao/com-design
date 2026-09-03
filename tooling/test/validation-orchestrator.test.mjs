import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  buildValidationEvidence,
  runRepositoryValidation,
  writeValidationEvidence,
} from '../src/validation-orchestrator.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function copyDesignSourceFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-validation-'));
  fs.cpSync(
    path.join(repoRoot, 'design-source'),
    path.join(root, 'design-source'),
    { recursive: true },
  );
  return root;
}

test('runs the accepted deterministic V2 validation gates as one evidence-producing orchestration', () => {
  const evidence = runRepositoryValidation(repoRoot);

  assert.equal(evidence.result, 'pass');
  assert.equal(evidence.summary.failed, 0);
  assert.equal(evidence.summary.blockingErrors, 0);
  assert.equal(evidence.summary.checksRun, 8);
  assert.deepEqual(
    evidence.checks.map((check) => check.id),
    [
      'source-integrity',
      'token-model',
      'platform-model',
      'platform-environment',
      'motion-foundation',
      'component-contracts',
      'iconography',
      'canonical-design-model',
    ],
  );
  assert.ok(evidence.checks.every((check) => check.hardGate === true));
  assert.match(evidence.source.manifestSha256, /^[a-f0-9]{64}$/);
  assert.match(evidence.source.sourceSha256, /^[a-f0-9]{64}$/);
  assert.equal(evidence.checks.find((check) => check.id === 'component-contracts').evidence.componentCount, 33);
  assert.equal(evidence.checks.find((check) => check.id === 'canonical-design-model').evidence.platformCount, 4);
  assert.equal(JSON.stringify(evidence).includes(repoRoot), false);
});

test('produces deterministic evidence for unchanged canonical sources', () => {
  const first = runRepositoryValidation(repoRoot);
  const second = runRepositoryValidation(repoRoot);
  assert.deepEqual(second, first);
});

test('hard-gate failure is machine-readable and fails the overall result', () => {
  const fixture = copyDesignSourceFixture();
  const manifestPath = path.join(fixture, 'design-source', 'specs', 'design-system-v1.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.sources.foundation = '../missing-foundation.css';
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const evidence = runRepositoryValidation(fixture);
  assert.equal(evidence.result, 'fail');
  assert.ok(evidence.summary.blockingErrors > 0);
  assert.ok(
    evidence.errors.some(
      (entry) => entry.checkId === 'source-integrity'
        && entry.message.includes('sources.foundation points to missing path'),
    ),
  );
  assert.ok(evidence.checks.some((check) => check.id === 'token-model' && check.status === 'fail'));
});

test('warnings and blocking errors remain structurally distinct', () => {
  const evidence = buildValidationEvidence({
    checks: [
      {
        id: 'soft-fixture',
        hardGate: true,
        status: 'warn',
        errors: [],
        warnings: ['non-blocking fixture finding'],
        evidence: {},
      },
      {
        id: 'hard-fixture',
        hardGate: true,
        status: 'fail',
        errors: ['blocking fixture failure'],
        warnings: [],
        evidence: {},
      },
    ],
  });

  assert.equal(evidence.result, 'fail');
  assert.equal(evidence.summary.warnings, 1);
  assert.equal(evidence.summary.blockingErrors, 1);
  assert.deepEqual(evidence.warnings, [
    { checkId: 'soft-fixture', message: 'non-blocking fixture finding' },
  ]);
  assert.deepEqual(evidence.errors, [
    { checkId: 'hard-fixture', message: 'blocking fixture failure' },
  ]);
});

test('writes evidence to a stable generated artifact path', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-validation-output-'));
  const evidence = buildValidationEvidence({
    checks: [{
      id: 'fixture',
      hardGate: true,
      status: 'pass',
      errors: [],
      warnings: [],
      evidence: { ok: true },
    }],
    sourceSha256: 'a'.repeat(64),
  });

  const relativePath = writeValidationEvidence(fixture, evidence);
  assert.equal(relativePath, 'dist/validation/evidence.json');
  const written = JSON.parse(fs.readFileSync(path.join(fixture, relativePath), 'utf8'));
  assert.deepEqual(written, evidence);
});
