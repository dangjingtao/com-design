#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePlatformModel } from '../src/platform-context.mjs';
import { validateSourceIntegrity } from '../src/source-integrity.mjs';
import { buildTokenModel, validateTokenModel } from '../src/token-model.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceIntegrity = validateSourceIntegrity(repoRoot);
const foundationPath = sourceIntegrity.evidence.canonicalSources.foundation?.resolvedPath;
const platformModel = sourceIntegrity.evidence.canonicalSources.platformModel?.value;
const platformContextSchema = sourceIntegrity.evidence.canonicalSources.platformContextSchema?.value;
let model = null;
let tokenErrors = [];
let platformErrors = [];

if (foundationPath) {
  model = buildTokenModel(foundationPath);
  tokenErrors = validateTokenModel(model);
}

if (!platformModel) {
  platformErrors.push('canonical platformModel source is unavailable.');
}
if (!platformContextSchema) {
  platformErrors.push('canonical platformContextSchema source is unavailable.');
}
if (platformModel && platformContextSchema) {
  platformErrors = validatePlatformModel(platformModel, platformContextSchema);
}

const errors = [...sourceIntegrity.errors, ...tokenErrors, ...platformErrors];

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
console.log(
  `Platform model passed: ${platformModel.axes.platform.values.length} platforms, 6 orthogonal context axes.`,
);
