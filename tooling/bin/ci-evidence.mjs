#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCiEvidence, writeCiEvidence } from '../src/ci-evidence.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const evidencePath = path.join(repoRoot, 'dist', 'ci', 'evidence.json');
const enforce = process.argv.includes('--enforce');

if (enforce) {
  if (!fs.existsSync(evidencePath)) {
    console.error('CI hard gate evidence is missing: dist/ci/evidence.json');
    process.exit(1);
  }
  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  if (evidence.result !== 'pass') {
    console.error(
      'Com Design deterministic CI hard gate failed: '
        + evidence.summary.failed
        + ' blocking check(s).',
    );
    for (const check of evidence.checks.filter((entry) => entry.status === 'fail')) {
      console.error('- ' + check.id);
    }
    process.exit(1);
  }
  console.log(
    'Com Design deterministic CI hard gate passed: '
      + evidence.summary.hardGates
      + ' checks, '
      + evidence.summary.targets
      + ' traced targets.',
  );
  process.exit(0);
}

const evidence = buildCiEvidence(repoRoot, {
  repositorySha: process.env.GITHUB_SHA ?? null,
  headSha: process.env.GITHUB_HEAD_SHA ?? process.env.GITHUB_SHA ?? null,
  gateResults: {
    unitTests: process.env.GATE_UNIT_TESTS,
    validation: process.env.GATE_VALIDATION,
    engineeringBuild: process.env.GATE_ENGINEERING_BUILD,
    penpotBuild: process.env.GATE_PENPOT_BUILD,
    acceptedReport: process.env.GATE_ACCEPTED_REPORT,
  },
});
const relativePath = writeCiEvidence(repoRoot, evidence);

console.log(
  'Wrote CI evidence: '
    + relativePath
    + ' ('
    + evidence.result
    + ', '
    + evidence.summary.failed
    + ' blocking failure(s)).',
);
