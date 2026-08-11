#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function run(label, relativeScript) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, [path.join(repoRoot, relativeScript)], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('Validate source', 'tooling/bin/validate.mjs');
run('Build engineering adapters', 'tooling/bin/build.mjs');
run('Build Penpot manifest', 'penpot/bin/build.mjs');

console.log('\nHuman acceptance reports were not regenerated or overwritten.');
console.log('A versioned human-doc builder will be added separately under the retention contract.');
