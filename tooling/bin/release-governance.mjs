#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildGovernanceDryRun,
  evaluateReleaseGovernance,
  loadReleaseGovernancePolicy,
  validateReleaseGovernancePolicy,
  writeReleaseGovernanceEvidence,
} from '../src/release-governance.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};

const { policy, policyPath } = loadReleaseGovernancePolicy(repoRoot);
const policyErrors = validateReleaseGovernancePolicy(policy);
if (policyErrors.length) {
  console.error('Release governance policy is invalid:');
  for (const error of policyErrors) console.error('- ' + error);
  process.exit(1);
}

const inputPath = valueAfter('--input');
const outputPath = valueAfter('--output') ?? path.join('dist', 'governance', 'evidence.json');
const enforceRelease = args.includes('--enforce-release');

let evidence;
if (inputPath) {
  const request = JSON.parse(fs.readFileSync(path.resolve(repoRoot, inputPath), 'utf8'));
  evidence = evaluateReleaseGovernance(policy, request);
} else {
  const hardGatePath = path.join(repoRoot, 'dist', 'ci', 'evidence.json');
  if (!fs.existsSync(hardGatePath)) {
    console.error('Governance dry-run requires dist/ci/evidence.json from T017.');
    process.exit(1);
  }
  const hardGate = JSON.parse(fs.readFileSync(hardGatePath, 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  evidence = buildGovernanceDryRun(policy, hardGate, {
    version: packageJson.version,
    repositorySha: process.env.GITHUB_SHA ?? null,
  });
}

const written = writeReleaseGovernanceEvidence(repoRoot, evidence, outputPath);
console.log(
  'Release governance '
    + (evidence.mode ?? 'evaluation')
    + ': '
    + evidence.decisionStatus.release
    + '; hard='
    + evidence.decisionStatus.hardCompliance
    + '; ai='
    + evidence.decisionStatus.aiReview
    + '; mira='
    + evidence.decisionStatus.mira
    + '. Evidence: '
    + written
    + '. Policy: '
    + path.relative(repoRoot, policyPath),
);

if (enforceRelease && !evidence.releaseEligibility.eligible) {
  console.error('Formal release is not eligible: ' + evidence.releaseEligibility.blockers.join(', '));
  process.exit(1);
}
