#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runFourPlatformSmoke,
  writeFourPlatformSmokeEvidence,
} from '../src/four-platform-smoke.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const evidence = runFourPlatformSmoke(repoRoot);
const output = writeFourPlatformSmokeEvidence(repoRoot, evidence);

for (const platform of evidence.platforms) {
  console.log(
    '[' + platform.result.toUpperCase() + '] '
      + platform.platform
      + ' — '
      + platform.checks.length
      + ' checks',
  );
}
console.log(
  'T018 four-platform smoke '
    + evidence.result
    + ': '
    + evidence.summary.passed
    + '/'
    + evidence.summary.checks
    + ' checks passed. Evidence: '
    + output,
);

if (evidence.result === 'fail') {
  for (const failure of evidence.failures) {
    console.error('- [' + failure.layer + '] ' + failure.id + ': ' + failure.errors.join(' '));
  }
  process.exit(1);
}
