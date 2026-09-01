#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateComponentCatalog } from '../src/component-contract.mjs';
import { validateIconographyContract } from '../src/iconography.mjs';
import { validatePlatformEnvironmentContract } from '../src/platform-environment.mjs';
import { validatePlatformModel } from '../src/platform-context.mjs';
import { validateSourceIntegrity } from '../src/source-integrity.mjs';
import { buildTokenModel, validateTokenModel } from '../src/token-model.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifestPath = path.join(repoRoot, 'design-source', 'specs', 'design-system-v1.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const sourceIntegrity = validateSourceIntegrity(repoRoot, { manifestPath });
const foundationPath = sourceIntegrity.evidence.canonicalSources.foundation?.resolvedPath;
const platformModel = sourceIntegrity.evidence.canonicalSources.platformModel?.value;
const platformContextSchema = sourceIntegrity.evidence.canonicalSources.platformContextSchema?.value;
const platformEnvironment = sourceIntegrity.evidence.canonicalSources.platformEnvironment?.value;
const platformEnvironmentSchema = sourceIntegrity.evidence.canonicalSources.platformEnvironmentSchema?.value;
const componentIndexPath = sourceIntegrity.evidence.canonicalSources.componentIndex?.resolvedPath;
const componentSchemaPath = sourceIntegrity.evidence.canonicalSources.componentSchema?.resolvedPath;
const iconography = sourceIntegrity.evidence.canonicalSources.iconography?.value;
const iconographySchema = sourceIntegrity.evidence.canonicalSources.iconographySchema?.value;
let model = null;
let tokenErrors = [];
let platformErrors = [];
let environmentErrors = [];
let iconographyErrors = [];
let componentValidation = { errors: [], evidence: { componentCount: 0 } };

if (foundationPath) {
  model = buildTokenModel(foundationPath);
  tokenErrors = validateTokenModel(model);
}

if (!platformModel) platformErrors.push('canonical platformModel source is unavailable.');
if (!platformContextSchema) platformErrors.push('canonical platformContextSchema source is unavailable.');
if (platformModel && platformContextSchema) {
  platformErrors = validatePlatformModel(platformModel, platformContextSchema, manifest);
}

if (!platformEnvironment) environmentErrors.push('canonical platformEnvironment source is unavailable.');
if (!platformEnvironmentSchema) environmentErrors.push('canonical platformEnvironmentSchema source is unavailable.');
if (platformEnvironment && platformEnvironmentSchema && platformModel) {
  environmentErrors = validatePlatformEnvironmentContract(
    platformEnvironment,
    platformEnvironmentSchema,
    platformModel,
    manifest,
  );
}

if (!componentIndexPath) componentValidation.errors.push('canonical componentIndex source is unavailable.');
if (!componentSchemaPath) componentValidation.errors.push('canonical componentSchema source is unavailable.');
if (componentIndexPath && componentSchemaPath) {
  componentValidation = validateComponentCatalog(repoRoot, {
    catalogPath: componentIndexPath,
    schemaPath: componentSchemaPath,
  });
}

if (!iconography) iconographyErrors.push('canonical iconography source is unavailable.');
if (!iconographySchema) iconographyErrors.push('canonical iconographySchema source is unavailable.');
if (iconography && iconographySchema) {
  iconographyErrors = validateIconographyContract(iconography, iconographySchema);
}

const errors = [
  ...sourceIntegrity.errors,
  ...tokenErrors,
  ...platformErrors,
  ...environmentErrors,
  ...componentValidation.errors,
  ...iconographyErrors,
];

if (errors.length) {
  console.error(`Com Design validation failed (${errors.length}).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (!model) {
  console.error('Com Design validation failed: canonical foundation source is unavailable.');
  process.exit(1);
}

console.log(`Com Design validation passed: ${model.consumer.length} consumer tokens, source ${model.sourceHash.slice(0, 12)}.`);
const counts = sourceIntegrity.evidence.catalogCounts;
console.log(`Source integrity passed: ${Object.keys(sourceIntegrity.evidence.canonicalSources).length} canonical sources; catalogs ${counts.coreComponents} components / ${counts.coreCompositeComponents} composites / ${counts.corePatterns} patterns / ${counts.coreIcons} icons.`);
console.log(`Platform model passed: ${platformModel.axes.platform.values.length} platforms, 6 orthogonal context axes with manifest parity.`);
console.log(`Platform environment passed: ${platformEnvironment.examples.length} platform examples with safe area, chrome, interaction and accessibility capability parity.`);
console.log(`Component contracts passed: ${componentValidation.evidence.componentCount} catalog entries validated against component-contract-v2 schema with canonical contract/preview path and drift checks.`);
console.log(`Iconography passed: ${iconography.icons.length} Core icons; default provider ${iconography.defaultCoreProvider}; visual sizes ${iconography.visualSizes.join('/')} with explicit fallback ${iconography.fallback.stableName}.`);
