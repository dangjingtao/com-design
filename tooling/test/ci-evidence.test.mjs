import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildCiEvidence, writeCiEvidence } from '../src/ci-evidence.mjs';

function writeJson(root, relativePath, value) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n');
}

function writeText(root, relativePath, value = 'fixture\n') {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
}

function passingFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-ci-evidence-'));
  const sourceHash = 'a'.repeat(64);

  writeJson(root, 'dist/design-model-v2.json', { sourceHash });
  writeJson(root, 'dist/validation/evidence.json', {
    result: 'pass',
    source: { sourceSha256: sourceHash },
  });
  writeJson(root, 'dist/tailwind/adapter.json', { source: { sourceHash } });
  writeJson(root, 'dist/native-mobile/adapter.json', { source: { sourceHash } });
  writeJson(root, 'dist/wechat-mini-program/adapter.json', { source: { sourceHash } });
  writeText(root, 'dist/wechat-mini-program/tokens.js');
  writeJson(root, 'dist/agent/contract.json', { sourceHash });
  writeJson(root, 'penpot/build/manifest.json', { canonical: { sourceHash } });
  writeJson(root, 'dist/build-manifest.json', { canonicalSourceHash: sourceHash });

  return { root, sourceHash };
}

const allSuccess = {
  unitTests: 'success',
  validation: 'success',
  engineeringBuild: 'success',
  penpotBuild: 'success',
  acceptedReport: 'success',
};

test('T017 emits pass evidence only when deterministic gates and traced outputs agree', () => {
  const { root, sourceHash } = passingFixture();
  const evidence = buildCiEvidence(root, {
    repositorySha: 'repo-sha',
    headSha: 'head-sha',
    gateResults: allSuccess,
  });

  assert.equal(evidence.result, 'pass');
  assert.equal(evidence.source.repositorySha, 'repo-sha');
  assert.equal(evidence.source.headSha, 'head-sha');
  assert.equal(evidence.source.canonicalSourceHash, sourceHash);
  assert.equal(evidence.summary.failed, 0);
  assert.equal(evidence.summary.targets, 8);
  assert.ok(evidence.targets.some((target) => target.id === 'ios' && target.status === 'pass'));
  assert.ok(evidence.targets.some((target) => target.id === 'android' && target.status === 'pass'));
  assert.ok(evidence.checks.every((check) => check.hardGate === true));
});

test('T017 fails evidence when any workflow hard gate fails', () => {
  const { root } = passingFixture();
  const evidence = buildCiEvidence(root, {
    gateResults: { ...allSuccess, unitTests: 'failure' },
  });

  assert.equal(evidence.result, 'fail');
  assert.ok(
    evidence.checks.some((check) => check.id === 'unit-tests' && check.status === 'fail'),
  );
});

test('T017 fails evidence when a platform or consumer output drifts from canonical source', () => {
  const { root } = passingFixture();
  writeJson(root, 'dist/tailwind/adapter.json', {
    source: { sourceHash: 'b'.repeat(64) },
  });

  const evidence = buildCiEvidence(root, { gateResults: allSuccess });
  assert.equal(evidence.result, 'fail');
  assert.ok(
    evidence.checks.some(
      (check) => check.id === 'source-parity:web' && check.status === 'fail',
    ),
  );
});

test('T017 fails evidence when a required traced output is missing', () => {
  const { root } = passingFixture();
  fs.rmSync(path.join(root, 'penpot', 'build', 'manifest.json'));

  const evidence = buildCiEvidence(root, { gateResults: allSuccess });
  assert.equal(evidence.result, 'fail');
  assert.ok(
    evidence.checks.some(
      (check) => check.id === 'target-output:penpot' && check.status === 'fail',
    ),
  );
});

test('T017 writes a stable machine-readable evidence artifact', () => {
  const { root } = passingFixture();
  const evidence = buildCiEvidence(root, { gateResults: allSuccess });
  const relativePath = writeCiEvidence(root, evidence);

  assert.equal(relativePath, 'dist/ci/evidence.json');
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8')),
    evidence,
  );
});
