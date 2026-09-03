#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runRepositoryValidation,
  writeValidationEvidence,
} from '../src/validation-orchestrator.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const evidence = runRepositoryValidation(repoRoot);
const evidencePath = writeValidationEvidence(repoRoot, evidence);

for (const check of evidence.checks) {
  const label = check.status.toUpperCase().padEnd(4);
  console.log(`[${label}] ${check.id}`);
  for (const warning of check.warnings) console.warn(`  warning: ${warning}`);
  for (const error of check.errors) console.error(`  error: ${error}`);
}

if (evidence.result === 'fail') {
  console.error(
    `Com Design validation failed: ${evidence.summary.blockingErrors} blocking error(s), `
      + `${evidence.summary.warnings} warning(s). Evidence: ${evidencePath}`,
  );
  process.exit(1);
}

console.log(
  `Com Design validation passed: ${evidence.summary.checksRun} checks, `
    + `${evidence.summary.warnings} warning(s), source ${evidence.source.sourceSha256.slice(0, 12)}. `
    + `Evidence: ${evidencePath}`,
);
