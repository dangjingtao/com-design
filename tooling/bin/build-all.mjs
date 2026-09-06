#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function run(label, relativeScript, args = []) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, [path.join(repoRoot, relativeScript), ...args], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('Check aggregated component CSS parity', 'tooling/bin/extract-components-css.mjs', ['--check']);
run('Validate source', 'tooling/bin/validate.mjs');
run('Build engineering adapters', 'tooling/bin/build.mjs');
run('Build Penpot manifest', 'penpot/bin/build.mjs');
run('Build Human Guide current facts overlay', 'tooling/bin/human-guide-overlay.mjs');

console.log('\nHuman acceptance reports were not regenerated or overwritten.');
console.log('A versioned human-doc builder will be added separately under the retention contract.');
