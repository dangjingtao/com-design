#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSourceIntegrity } from '../src/source-integrity.mjs';
import { buildTokenModel, validateTokenModel } from '../src/token-model.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceIntegrity = validateSourceIntegrity(repoRoot);
const foundationPath = sourceIntegrity.evidence.canonicalSources.foundation?.resolvedPath;
let model = null;
let tokenErrors = [];

if (foundationPath) {
  model = buildTokenModel(foundationPath);
  tokenErrors = validateTokenModel(model);
}

const errors = [...sourceIntegrity.errors, ...tokenErrors];

if (errors.length) {
  console.error(`Com Design validation failed (${errors.length}).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (!model) {
  console.error('Com Design validation failed: canonical foundation source is unavailable.');
  process.exit(1);
}

console.log(
  `Com Design validation passed: ${model.consumer.length} consumer tokens, source ${model.sourceHash.slice(0, 12)}.`,
);

const counts = sourceIntegrity.evidence.catalogCounts;
console.log(
  `Source integrity passed: ${Object.keys(sourceIntegrity.evidence.canonicalSources).length} canonical sources; catalogs ${counts.coreComponents} components / ${counts.coreCompositeComponents} composites / ${counts.corePatterns} patterns.`,
);
