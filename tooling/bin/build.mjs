#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokenModel, validateTokenModel } from '../src/token-model.mjs';
import { writeEngineeringOutputs } from '../src/adapters.mjs';
import { writeMcpOutput } from '../src/mcp-adapter.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourcePath = path.join(repoRoot, 'design-source', 'colors_and_type.css');
const model = buildTokenModel(sourcePath);
const errors = validateTokenModel(model);

if (errors.length) {
  console.error('Com Design engineering build stopped: token validation failed.');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const files = [
  ...writeEngineeringOutputs(repoRoot, model),
  ...writeMcpOutput(repoRoot, model),
];
console.log(
  `Generated ${files.length} engineering artifacts from ${model.consumer.length} consumer tokens.`,
);
for (const file of files) console.log(`  ${file}`);
