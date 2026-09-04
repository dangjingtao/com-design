import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseCssVariables } from '../../penpot/src/parse/css-vars.mjs';
import { buildTokenModel, validateTokenModel } from './token-model.mjs';
import { validateSourceIntegrity } from './source-integrity.mjs';
import {
  validateComponentCatalog,
  validateJsonSchemaValue,
} from './component-contract.mjs';
import { validatePlatformModel } from './platform-context.mjs';
import { validateLayoutInputFoundationContract } from './layout-input-foundation.mjs';

const MODEL_SCHEMA_VERSION = 2;
const MODEL_ID = 'com-design:canonical-model:v2';
const MATURITY_STATUSES = new Set(['planned', 'partial', 'implemented', 'verified']);

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${filePath}: invalid JSON (${error.message})`);
  }
}

function toRepoPath(repoRoot, filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function sourceDescriptor(repoRoot, id, filePath, kind = 'canonical-source') {
  const raw = fs.readFileSync(filePath);
  return {
    id,
    kind,
    path: toRepoPath(repoRoot, filePath),
    sourceHash: sha256(raw),
  };
}

function provenance(source) {
  return {
    sourceId: source.id,
    sourcePath: source.path,
    sourceHash: source.sourceHash,
  };
}

function stableKey(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function referenceId(ownerId, relation, value) {
  return `reference:${ownerId}:${relation}:${stableKey(value)}`;
}

function createReferenceResolver(entries, aliasesFor) {
  const byLabel = new Map();
  for (const entry of entries) {
    for (const alias of aliasesFor(entry)) {
      if (typeof alias !== 'string' || !alias.trim()) continue;
      const key = alias.toLowerCase();
      const ids = byLabel.get(key) ?? new Set();
      ids.add(entry.id);
      byLabel.set(key, ids);
    }
  }
  return (value) => {
    const ids = byLabel.get(String(value).toLowerCase());
    return ids?.size === 1 ? [...ids][0] : null;
  };
}

function buildReferenceResolvers(components, composites, patterns) {
  const componentAliases = (entry) => [entry.name, entry.slug];
  const compositeAliases = (entry) => [entry.name, entry.sourceId];
  const patternAliases = (entry) => [entry.name, entry.sourceId];
  return {
    compositeUses: createReferenceResolver(components, componentAliases),
    patternUses: createReferenceResolver(
      [...components, ...composites],
      (entry) => ('slug' in entry ? componentAliases(entry) : compositeAliases(entry)),
    ),
    relatedPattern: createReferenceResolver(patterns, patternAliases),
  };
}

function normalizeReferences(ownerId, relation, values, resolve, sourceProvenance) {
  return (values ?? []).map((value) => {
    const targetId = resolve(value);
    return {
      id: referenceId(ownerId, relation, value),
      relation,
      sourceValue: value,
      targetId,
      resolved: targetId !== null,
      provenance: sourceProvenance,
    };
  });
}

function requireCanonicalSource(sourceIntegrity, key) {
  const source = sourceIntegrity.evidence.canonicalSources[key];
  if (!source) throw new Error(`canonical design model requires sources.${key}.`);
  return source;
}

function withoutSchemaAnnotation(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const { $schema: _schema, ...contract } = value;
  return contract;
}

function validateStructuredCatalog(sourceIntegrity, sourceKey, schemaKey, label) {
  const source = requireCanonicalSource(sourceIntegrity, sourceKey).value;
  const schema = requireCanonicalSource(sourceIntegrity, schemaKey).value;
  return validateJsonSchemaValue(withoutSchemaAnnotation(source), schema, label);
}

function validateRequiredInputs(repoRoot, sourceIntegrity, manifest) {
  const errors = [...sourceIntegrity.errors];
  if (errors.length) return errors;

  const componentResult = validateComponentCatalog(repoRoot, {
    catalogPath: requireCanonicalSource(sourceIntegrity, 'componentIndex').resolvedPath,
    schemaPath: requireCanonicalSource(sourceIntegrity, 'componentSchema').resolvedPath,
  });
  errors.push(...componentResult.errors.map((error) => `component contract: ${error}`));

  errors.push(
    ...validateStructuredCatalog(
      sourceIntegrity,
      'coreComposites',
      'compositeSchema',
      'coreComposites',
    ).map((error) => `composite contract: ${error}`),
  );
  errors.push(
    ...validateStructuredCatalog(
      sourceIntegrity,
      'corePatterns',
      'patternSchema',
      'corePatterns',
    ).map((error) => `pattern contract: ${error}`),
  );

  const platformModel = requireCanonicalSource(sourceIntegrity, 'platformModel').value;
  const platformSchema = requireCanonicalSource(sourceIntegrity, 'platformContextSchema').value;
  errors.push(
    ...validatePlatformModel(platformModel, platformSchema, manifest)
      .map((error) => `platform model: ${error}`),
  );

  const layoutInputFoundation = requireCanonicalSource(sourceIntegrity, 'layoutInputFoundation').value;
  const layoutInputSchema = requireCanonicalSource(sourceIntegrity, 'layoutInputSchema').value;
  errors.push(
    ...validateLayoutInputFoundationContract(
      layoutInputFoundation,
      layoutInputSchema,
      platformModel,
      manifest,
    ).map((error) => `layout/input foundation: ${error}`),
  );

  const foundationPath = requireCanonicalSource(sourceIntegrity, 'foundation').resolvedPath;
  const tokenModel = buildTokenModel(foundationPath);
  errors.push(...validateTokenModel(tokenModel).map((error) => `token model: ${error}`));

  return errors;
}

function buildSourceGraph(repoRoot, sourceIntegrity, componentIndex, manifestSource) {
  const sources = Object.entries(sourceIntegrity.evidence.canonicalSources)
    .map(([key, source]) => sourceDescriptor(repoRoot, `source:${key}`, source.resolvedPath))
    .sort((left, right) => left.id.localeCompare(right.id));
  const designSourceRoot = path.join(repoRoot, 'design-source');
  const componentContracts = componentIndex.components
    .map((entry) => {
      const contractPath = fs.realpathSync(path.resolve(designSourceRoot, entry.contract));
      return sourceDescriptor(
        repoRoot,
        `source:component-contract:${entry.slug}`,
        contractPath,
        'catalog-contract',
      );
    })
    .sort((left, right) => left.id.localeCompare(right.id));
  return [manifestSource, ...sources, ...componentContracts];
}

function aggregateSourceHash(sourceGraph, tokenSourceHash) {
  const hash = crypto.createHash('sha256');
  for (const source of sourceGraph) {
    hash.update(source.id).update('\0').update(source.path).update('\0').update(source.sourceHash).update('\n');
  }
  hash.update('derived:token-model\0').update(tokenSourceHash);
  return hash.digest('hex');
}

function buildTokenProvenanceResolver(repoRoot, tokenModel, foundationSource) {
  const sourceDefinitions = [];
  const foundationPath = path.join(repoRoot, foundationSource.path);
  const foundationParsed = parseCssVariables(foundationPath);
  sourceDefinitions.push({
    descriptor: foundationSource,
    names: new Set([
      ...Object.keys(foundationParsed.root),
      ...Object.keys(foundationParsed.dark),
    ]),
  });

  const seenOverlayPaths = new Set();
  for (const theme of Object.values(tokenModel.themes ?? {})) {
    const realPath = fs.realpathSync(theme.source);
    if (seenOverlayPaths.has(realPath)) continue;
    seenOverlayPaths.add(realPath);
    const parsed = parseCssVariables(realPath);
    const repoPath = toRepoPath(repoRoot, realPath);
    sourceDefinitions.push({
      descriptor: sourceDescriptor(
        repoRoot,
        `source:token-overlay:${stableKey(repoPath)}`,
        realPath,
        'token-overlay-source',
      ),
      names: new Set([
        ...Object.keys(parsed.root),
        ...Object.keys(parsed.dark),
      ]),
    });
  }

  return (tokenName) => {
    for (let index = sourceDefinitions.length - 1; index >= 0; index -= 1) {
      if (sourceDefinitions[index].names.has(tokenName)) {
        return provenance(sourceDefinitions[index].descriptor);
      }
    }
    return provenance(foundationSource);
  };
}

function normalizeTokens(repoRoot, tokenModel, foundationSource) {
  const resolveTokenProvenance = buildTokenProvenanceResolver(
    repoRoot,
    tokenModel,
    foundationSource,
  );
  return {
    schemaVersion: tokenModel.schemaVersion,
    sourceHash: tokenModel.sourceHash,
    entries: tokenModel.consumer.map((token) => ({
      id: `token:${token.name}`,
      name: token.name,
      key: token.key,
      type: token.type,
      light: token.light,
      dark: token.dark,
      hasDarkOverride: token.hasDarkOverride,
      provenance: resolveTokenProvenance(token.name),
    })),
    byType: Object.fromEntries(
      Object.entries(tokenModel.byType).map(([type, entries]) => [
        type,
        entries.map((token) => `token:${token.name}`),
      ]),
    ),
    scopes: tokenModel.scopes,
    themes: Object.fromEntries(
      Object.entries(tokenModel.themes ?? {}).map(([key, theme]) => [
        key,
        {
          id: `theme:${theme.name}`,
          name: theme.name,
          selector: theme.selector,
          dataSelector: theme.dataSelector,
          light: theme.light,
          dark: theme.dark,
          provenance: {
            sourceId: `source:token-overlay:${stableKey(toRepoPath(repoRoot, theme.source))}`,
            sourcePath: toRepoPath(repoRoot, theme.source),
            sourceHash: sha256(fs.readFileSync(theme.source)),
          },
        },
      ]),
    ),
  };
}

function normalizeComponents(repoRoot, componentIndex, componentIndexSource) {
  const designSourceRoot = path.join(repoRoot, 'design-source');
  return componentIndex.components.map((entry) => {
    const contractPath = fs.realpathSync(path.resolve(designSourceRoot, entry.contract));
    const contractSource = sourceDescriptor(
      repoRoot,
      `source:component-contract:${entry.slug}`,
      contractPath,
      'catalog-contract',
    );
    return {
      id: `component:${entry.slug}`,
      slug: entry.slug,
      name: entry.name,
      category: entry.category,
      contract: readJson(contractPath),
      provenance: {
        catalog: provenance(componentIndexSource),
        contract: provenance(contractSource),
      },
    };
  });
}

function normalizeComposites(sourceValue, source) {
  return sourceValue.composites.map((entry) => ({
    id: `composite:${entry.id}`,
    sourceId: entry.id,
    name: entry.name,
    contract: entry,
    provenance: provenance(source),
    references: {},
  }));
}

function normalizePatterns(sourceValue, source) {
  return sourceValue.patterns.map((entry) => ({
    id: `pattern:${entry.id}`,
    sourceId: entry.id,
    name: entry.name,
    contract: entry,
    provenance: provenance(source),
    references: {},
  }));
}

function normalizeLayoutInput(contract, source) {
  const { $schema: _schema, ...value } = contract;
  return {
    id: value.id,
    schemaVersion: value.schemaVersion,
    contract: value,
    provenance: provenance(source),
  };
}

function normalizePlatforms(platformModel, manifest, platformSource, schemaSource, manifestSource) {
  const platforms = platformModel.platforms.map((entry) => ({
    id: `platform:${entry.id}`,
    platform: entry.id,
    label: entry.label,
    maturity: manifest.platformStatus.adapterMaturity[entry.id],
    provenance: {
      model: provenance(platformSource),
      maturity: provenance(manifestSource),
    },
  }));
  const axes = Object.entries(platformModel.axes).map(([name, axis]) => ({
    id: `platform-axis:${name}`,
    name,
    required: axis.required === true,
    values: [...axis.values],
    owner: axis.owner ?? null,
    contractName: axis.contractName ?? null,
    note: axis.note ?? null,
    provenance: {
      model: provenance(platformSource),
      schema: provenance(schemaSource),
    },
  }));
  return {
    schemaVersion: platformModel.$metadata.version,
    principles: platformModel.principles,
    platforms,
    axes,
    uiOwnership: platformModel.uiOwnership,
    boundary: platformModel.boundary,
  };
}

function addCatalogReferences(components, composites, patterns) {
  const resolve = buildReferenceResolvers(components, composites, patterns);
  for (const composite of composites) {
    composite.references.components = normalizeReferences(
      composite.id,
      'uses',
      composite.contract.components,
      resolve.compositeUses,
      composite.provenance,
    );
    composite.references.relatedPatterns = normalizeReferences(
      composite.id,
      'related-pattern',
      composite.contract.relatedPatterns,
      resolve.relatedPattern,
      composite.provenance,
    );
  }
  for (const pattern of patterns) {
    pattern.references.components = normalizeReferences(
      pattern.id,
      'uses',
      pattern.contract.components,
      resolve.patternUses,
      pattern.provenance,
    );
  }
}

export function validateCanonicalDesignModel(model) {
  const errors = [];
  if (model?.schemaVersion !== MODEL_SCHEMA_VERSION) {
    errors.push(`canonical design model schemaVersion must be ${MODEL_SCHEMA_VERSION}.`);
  }
  if (model?.id !== MODEL_ID) errors.push(`canonical design model id must be ${MODEL_ID}.`);
  if (model?.$metadata?.editable !== false || model?.$metadata?.authority !== 'derived-build-artifact') {
    errors.push('canonical design model must declare itself as a non-editable derived build artifact.');
  }
  if (!/^[a-f0-9]{64}$/.test(model?.sourceHash ?? '')) {
    errors.push('canonical design model sourceHash must be sha256.');
  }

  const collections = [
    model?.tokens?.entries ?? [],
    model?.components ?? [],
    model?.composites ?? [],
    model?.patterns ?? [],
    model?.platform?.platforms ?? [],
    model?.platform?.axes ?? [],
  ];
  const ids = new Set();
  for (const collection of collections) {
    for (const entry of collection) {
      if (typeof entry?.id !== 'string' || !entry.id) errors.push('every normalized entry must carry a stable id.');
      else if (ids.has(entry.id)) errors.push(`duplicate normalized id: ${entry.id}`);
      else ids.add(entry.id);
      const entryProvenance = entry?.provenance;
      if (!entryProvenance || typeof entryProvenance !== 'object') {
        errors.push(`${entry?.id ?? '<unknown>'}: missing source provenance.`);
      }
    }
  }

  if (model?.layoutInput?.id !== 'com-design:layout-input-foundation:v2') {
    errors.push('canonical design model must expose the accepted layout/input foundation.');
  }
  if (!model?.layoutInput?.provenance || typeof model.layoutInput.provenance !== 'object') {
    errors.push('canonical layout/input foundation must carry source provenance.');
  }

  for (const platform of model?.platform?.platforms ?? []) {
    if (!MATURITY_STATUSES.has(platform.maturity?.status)) {
      errors.push(`${platform.id}: invalid adapter maturity status.`);
    }
  }
  return errors;
}

export function buildCanonicalDesignModel(repoRoot) {
  const sourceIntegrity = validateSourceIntegrity(repoRoot);
  const manifestPath = sourceIntegrity.evidence.manifestPath;
  let manifest;
  try {
    manifest = readJson(manifestPath);
  } catch (error) {
    throw new Error(`canonical design model cannot read manifest: ${error.message}`);
  }
  Object.defineProperty(manifest, '__path', { value: fs.realpathSync(manifestPath), enumerable: false });

  const inputErrors = validateRequiredInputs(repoRoot, sourceIntegrity, manifest);
  if (inputErrors.length) {
    throw new Error(`canonical design model input validation failed:\n- ${inputErrors.join('\n- ')}`);
  }

  const foundationEvidence = requireCanonicalSource(sourceIntegrity, 'foundation');
  const componentIndexEvidence = requireCanonicalSource(sourceIntegrity, 'componentIndex');
  const compositesEvidence = requireCanonicalSource(sourceIntegrity, 'coreComposites');
  const patternsEvidence = requireCanonicalSource(sourceIntegrity, 'corePatterns');
  const platformEvidence = requireCanonicalSource(sourceIntegrity, 'platformModel');
  const platformSchemaEvidence = requireCanonicalSource(sourceIntegrity, 'platformContextSchema');
  const layoutInputEvidence = requireCanonicalSource(sourceIntegrity, 'layoutInputFoundation');

  const manifestSource = sourceDescriptor(repoRoot, 'source:manifest', manifest.__path, 'manifest');
  const foundationSource = sourceDescriptor(repoRoot, 'source:foundation', foundationEvidence.resolvedPath);
  const componentIndexSource = sourceDescriptor(repoRoot, 'source:componentIndex', componentIndexEvidence.resolvedPath);
  const compositesSource = sourceDescriptor(repoRoot, 'source:coreComposites', compositesEvidence.resolvedPath);
  const patternsSource = sourceDescriptor(repoRoot, 'source:corePatterns', patternsEvidence.resolvedPath);
  const platformSource = sourceDescriptor(repoRoot, 'source:platformModel', platformEvidence.resolvedPath);
  const platformSchemaSource = sourceDescriptor(repoRoot, 'source:platformContextSchema', platformSchemaEvidence.resolvedPath);
  const layoutInputSource = sourceDescriptor(
    repoRoot,
    'source:layoutInputFoundation',
    layoutInputEvidence.resolvedPath,
  );

  const tokenModel = buildTokenModel(foundationEvidence.resolvedPath);
  const components = normalizeComponents(repoRoot, componentIndexEvidence.value, componentIndexSource);
  const composites = normalizeComposites(compositesEvidence.value, compositesSource);
  const patterns = normalizePatterns(patternsEvidence.value, patternsSource);
  addCatalogReferences(components, composites, patterns);

  const sourceGraph = buildSourceGraph(repoRoot, sourceIntegrity, componentIndexEvidence.value, manifestSource);
  const model = {
    schemaVersion: MODEL_SCHEMA_VERSION,
    id: MODEL_ID,
    $metadata: {
      name: 'Com Design Canonical Design Model V2',
      authority: 'derived-build-artifact',
      editable: false,
      sourceOfTruth: 'design-source/',
      productVersion: manifest.$metadata?.version ?? null,
    },
    sourceHash: aggregateSourceHash(sourceGraph, tokenModel.sourceHash),
    provenance: {
      manifest: provenance(manifestSource),
      canonicalSources: sourceGraph.map((source) => ({ ...source })),
      tokenSourceHash: tokenModel.sourceHash,
    },
    tokens: normalizeTokens(repoRoot, tokenModel, foundationSource),
    components,
    composites,
    patterns,
    layoutInput: normalizeLayoutInput(layoutInputEvidence.value, layoutInputSource),
    platform: normalizePlatforms(
      platformEvidence.value,
      manifest,
      platformSource,
      platformSchemaSource,
      manifestSource,
    ),
    governance: manifest.governance,
    nonCanonicalDeclarations: {
      plannedSources: manifest.plannedSources,
    },
  };

  const modelErrors = validateCanonicalDesignModel(model);
  if (modelErrors.length) {
    throw new Error(`canonical design model validation failed:\n- ${modelErrors.join('\n- ')}`);
  }
  return model;
}

export function writeCanonicalDesignModel(repoRoot, model = buildCanonicalDesignModel(repoRoot)) {
  const outputPath = path.join(repoRoot, 'dist', 'design-model-v2.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(model, null, 2)}\n`, 'utf8');
  return toRepoPath(repoRoot, outputPath);
}
