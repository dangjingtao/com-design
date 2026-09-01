#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokenModel, validateTokenModel } from '../src/token-model.mjs';
import { validateSourceIntegrity } from '../src/source-integrity.mjs';
import { buildCanonicalDesignModel, writeCanonicalDesignModel } from '../src/design-model.mjs';
import { writeRegisteredEngineeringOutputs } from '../src/adapters/registry.mjs';
import { writeMcpOutput } from '../src/mcp-adapter.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceIntegrity = validateSourceIntegrity(repoRoot);

if (sourceIntegrity.errors.length) {
  console.error('Com Design engineering build stopped: source integrity failed.');
  for (const error of sourceIntegrity.errors) console.error(`- ${error}`);
  process.exit(1);
}

const sourcePath = sourceIntegrity.evidence.canonicalSources.foundation?.resolvedPath;
if (!sourcePath) {
  console.error('Com Design engineering build stopped: canonical foundation source is unavailable.');
  process.exit(1);
}

const model = buildTokenModel(sourcePath);
const errors = validateTokenModel(model);

if (errors.length) {
  console.error('Com Design engineering build stopped: token validation failed.');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const designModel = buildCanonicalDesignModel(repoRoot);
const files = [
  writeCanonicalDesignModel(repoRoot, designModel),
  ...writeRegisteredEngineeringOutputs(repoRoot, model),
  ...writeMcpOutput(repoRoot, model),
];
console.log(
  `Generated ${files.length} engineering artifacts from ${model.consumer.length} consumer tokens and Canonical Design Model V2.`,
);
for (const file of files) console.log(`  ${file}`);
