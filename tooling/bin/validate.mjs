#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokenModel, validateTokenModel } from '../src/token-model.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourcePath = path.join(repoRoot, 'design-source', 'colors_and_type.css');
const model = buildTokenModel(sourcePath);
const errors = validateTokenModel(model);

if (errors.length) {
  console.error(`Com Design validation failed (${errors.length}).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Com Design validation passed: ${model.consumer.length} consumer tokens, source ${model.sourceHash.slice(0, 12)}.`,
);
