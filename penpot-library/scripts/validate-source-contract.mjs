#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const read = (p) => JSON.parse(fs.readFileSync(path.resolve(repo, p), 'utf8'));
const text = (p) => fs.readFileSync(path.resolve(repo, p), 'utf8');

const manifest = read('contracts/design-system-v1.json');
const catalog = read('penpot-library/catalog/component-catalog.json');
const propertyMap = read('penpot-library/catalog/visual-gate-properties.json');
const contracts = {
  actionsForms: read('contracts/actions-forms.json'),
  navigationInformation: read('contracts/navigation-information.json'),
  feedbackOverlayProgress: read('contracts/feedback-overlay-progress.json'),
  searchMenu: read('contracts/search-menu.json')
};
const patterns = read('contracts/core-patterns.json');
const pluginSource = text('penpot-library/plugin/plugin.js');

const errors = [];
const notes = [];
const fail = (code, detail) => errors.push({code, detail});

if (manifest.$metadata?.version !== catalog.designSystemVersion) {
  fail('VERSION_MISMATCH', {manifest: manifest.$metadata?.version, catalog: catalog.designSystemVersion});
}

const manifestIds = [];
for (const [familyId, ids] of Object.entries(manifest.componentCatalog ?? {})) {
  for (const id of ids) manifestIds.push({familyId, id});
}
const manifestIdSet = new Set(manifestIds.map((x) => x.id));
const catalogEntries = catalog.families.flatMap((family) => family.components.map((component) => ({familyId: family.id, id: component.id, name: component.name})));
const catalogIdSet = new Set(catalogEntries.map((x) => x.id));

if (manifestIds.length !== 33 || manifest.counts?.coreComponents !== 33) {
  fail('MANIFEST_COMPONENT_COUNT', {declared: manifest.counts?.coreComponents, actual: manifestIds.length});
}
if (catalogEntries.length !== 33 || catalog.counts?.coreComponents !== 33) {
  fail('CATALOG_COMPONENT_COUNT', {declared: catalog.counts?.coreComponents, actual: catalogEntries.length});
}
for (const id of manifestIdSet) if (!catalogIdSet.has(id)) fail('CATALOG_MISSING_COMPONENT', id);
for (const id of catalogIdSet) if (!manifestIdSet.has(id)) fail('CATALOG_EXTRA_COMPONENT', id);

for (const {familyId, id} of manifestIds) {
  const contract = contracts[familyId];
  if (!contract) fail('MISSING_FAMILY_CONTRACT', familyId);
  else if (!contract.components?.[id]) fail('CONTRACT_MISSING_COMPONENT', {familyId, id});
}

const canonicalPatternIds = Object.keys(patterns.patterns ?? {});
if (canonicalPatternIds.length !== 2 || manifest.counts?.corePatterns !== 2) {
  fail('PATTERN_COUNT', {declared: manifest.counts?.corePatterns, actual: canonicalPatternIds.length});
}
const catalogPatternIds = catalog.patterns.map((p) => p.id);
for (const id of canonicalPatternIds) if (!catalogPatternIds.includes(id)) fail('CATALOG_MISSING_PATTERN', id);
for (const pattern of catalog.patterns) if (pattern.countAsComponent !== false) fail('PATTERN_MISCLASSIFIED', pattern.id);
for (const id of canonicalPatternIds) if (catalogIdSet.has(id)) fail('PATTERN_COUNTED_AS_COMPONENT', id);

// Any property called "contract" in the visual-gate map must point to a field
// that actually exists on that component contract. Implementation properties
// are deliberately allowed but explicitly quarantined from Core semantics.
for (const [componentId, entry] of Object.entries(propertyMap.components ?? {})) {
  if (!manifestIdSet.has(componentId)) fail('PROPERTY_MAP_UNKNOWN_COMPONENT', componentId);
  const familyId = manifestIds.find((x) => x.id === componentId)?.familyId;
  const component = contracts[familyId]?.components?.[componentId];
  for (const [axis, source] of Object.entries(entry.contract ?? {})) {
    const acceptedFields = String(source).split('/');
    if (!acceptedFields.some((field) => component && component[field] != null)) {
      fail('PROPERTY_MAP_FALSE_CONTRACT_AXIS', {componentId, axis, source});
    }
  }
}

if (/['\"]primitive\./.test(pluginSource)) {
  fail('PLUGIN_DIRECT_PRIMITIVE_REFERENCE', 'plugin.js contains a primitive.* token reference');
}
if (/positionData/.test(pluginSource)) {
  fail('PLUGIN_FORBIDDEN_POSITION_DATA', 'plugin.js must not fabricate text positionData');
}
if (!/createComponent\(/.test(pluginSource)) fail('PLUGIN_NO_NATIVE_COMPONENT_API', 'createComponent not found');
if (!/createVariantFromComponents\(/.test(pluginSource)) fail('PLUGIN_NO_NATIVE_VARIANT_API', 'createVariantFromComponents not found');
if (!/applyToShapes\(|applyToken\(/.test(pluginSource)) fail('PLUGIN_NO_TOKEN_BINDING_API', 'native token application API not found');

const visualGateIds = new Set(Object.keys(propertyMap.components ?? {}));
for (const id of visualGateIds) {
  const marker = `id:'${id}'`;
  if (!pluginSource.includes(marker)) fail('VISUAL_GATE_COMPONENT_NOT_BUILT', id);
}

const status = errors.length ? 'FAIL' : 'PASS';
if (!errors.length) {
  notes.push('Canonical catalog matches manifest: 33 Core Components + 2 Core Patterns.');
  notes.push('Patterns remain separated from Component count.');
  notes.push('PenPot-specific implementation properties are explicitly quarantined from Core semantics.');
  notes.push('Visual-gate builder uses native Component/Variant/token APIs and contains no primitive.* token binding or fabricated positionData.');
  notes.push('This validates repository source only. It does NOT prove PenPot visual or round-trip gates.');
}

console.log(JSON.stringify({
  status,
  designSystemVersion: manifest.$metadata?.version,
  coreComponents: manifestIds.length,
  corePatterns: canonicalPatternIds.length,
  visualGateComponents: [...visualGateIds],
  errors,
  notes
}, null, 2));

process.exit(errors.length ? 2 : 0);
