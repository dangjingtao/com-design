#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const outDir = path.resolve(here, '../dist');

const readJson = (p) => JSON.parse(fs.readFileSync(path.resolve(repo, p), 'utf8'));
const clone = (v) => JSON.parse(JSON.stringify(v));

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && !('$value' in value)) {
      target[key] ??= {};
      deepMerge(target[key], value);
    } else {
      target[key] = clone(value);
    }
  }
  return target;
}

function setByDottedPath(root, dotted, value) {
  const parts = dotted.split('.');
  let cursor = root;
  for (let i = 0; i < parts.length - 1; i += 1) {
    cursor[parts[i]] ??= {};
    cursor = cursor[parts[i]];
  }
  cursor[parts.at(-1)] = clone(value);
}

function collectRefs(value, refs = []) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\{([^}]+)\}/g)) refs.push(match[1]);
  } else if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, refs);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectRefs(item, refs);
  }
  return refs;
}

function flattenTokens(node, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(node ?? {})) {
    if (key.startsWith('$')) continue;
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && '$value' in value) out.set(name, value);
    else if (value && typeof value === 'object') flattenTokens(value, name, out);
  }
  return out;
}

const foundation = readJson('tokens/tokens.json');
const dark = readJson('tokens/theme-dark.json');
const motion = readJson('tokens/motion.json');
const manifest = readJson('contracts/design-system-v1.json');

if (manifest.$metadata?.version !== '1.0.0-rc.1') {
  throw new Error(`Unexpected manifest version: ${manifest.$metadata?.version}`);
}

const foundationCore = { primitive: clone(foundation.primitive) };
deepMerge(foundationCore.primitive, dark.primitiveExtensions ?? {});

const semanticLight = clone(foundation.semantic.light);
const semanticDark = clone(foundation.semantic.light);
for (const [tokenPath, value] of Object.entries(dark.patches ?? {})) {
  setByDottedPath(semanticDark, tokenPath, value);
}

const sets = {
  'Foundation/Core': foundationCore,
  'Semantic/Light': semanticLight,
  'Semantic/Dark': semanticDark,
  'Density/Compact': { density: clone(foundation.modes.density.compact) },
  'Density/Comfortable': { density: clone(foundation.modes.density.comfortable) },
  'Platform/Canonical': { platform: clone(foundation.modes.platform) },
  'Platform/iOS': { platform: { touchTargetMin: clone(foundation.modes.platform.ios.touchTargetMin) } },
  'Platform/Android': { platform: { touchTargetMin: clone(foundation.modes.platform.android.touchTargetMin) } }
};

const themeIds = {
  always: '7c96d2df-caf9-4bf7-a104-79109232f111',
  light: '5f2be443-e26b-468a-8da8-323c5c5022be',
  dark: 'b2b53c86-4d5e-46ea-9f05-5de94ce90b37',
  compact: '918444b7-4a08-4dbf-aaab-4965211a1df4',
  comfortable: 'a06b2629-2bcb-4421-83ca-af4570667593',
  ios: 'de020a7f-83fd-45d8-88dd-7337c4f3dd41',
  android: '32477d9e-01cf-4e84-a45b-fc77cb72d64c'
};

const themes = [
  {
    id: themeIds.always,
    name: 'Always-on',
    group: 'Global',
    description: 'Canonical primitives and platform traceability tokens.',
    selectedTokenSets: {'Foundation/Core':'enabled','Platform/Canonical':'enabled'}
  },
  {id:themeIds.light,name:'Light',group:'Theme',description:'Canonical light semantic mapping.',selectedTokenSets:{'Semantic/Light':'enabled'}},
  {id:themeIds.dark,name:'Dark',group:'Theme',description:'Dark overlay applied to the same semantic token names.',selectedTokenSets:{'Semantic/Dark':'enabled'}},
  {id:themeIds.compact,name:'Compact',group:'Density',description:'V1 default density.',selectedTokenSets:{'Density/Compact':'enabled'}},
  {id:themeIds.comfortable,name:'Comfortable',group:'Density',description:'Comfortable density.',selectedTokenSets:{'Density/Comfortable':'enabled'}},
  {id:themeIds.ios,name:'iOS',group:'Platform',description:'Adapter-only active platform hit-area alias.',selectedTokenSets:{'Platform/iOS':'enabled'}},
  {id:themeIds.android,name:'Android',group:'Platform',description:'Adapter-only active platform hit-area alias.',selectedTokenSets:{'Platform/Android':'enabled'}}
];

const output = {
  ...sets,
  $themes: themes,
  $metadata: {
    tokenSetOrder: Object.keys(sets),
    activeThemes: ['Global/Always-on', 'Theme/Light', 'Density/Compact', 'Platform/iOS'],
    activeSets: ['Foundation/Core','Platform/Canonical','Semantic/Light','Density/Compact','Platform/iOS']
  }
};

// Adapter integrity: every alias used by an active selectable set must exist in at least one set.
const allTokens = new Map();
for (const [setName, set] of Object.entries(sets)) {
  for (const [tokenName, token] of flattenTokens(set)) {
    if (!allTokens.has(tokenName)) allTokens.set(tokenName, []);
    allTokens.get(tokenName).push({setName, token});
  }
}

const dangling = [];
for (const [setName, set] of Object.entries(sets)) {
  for (const [tokenName, token] of flattenTokens(set)) {
    for (const ref of collectRefs(token.$value)) {
      if (!allTokens.has(ref)) dangling.push({setName, tokenName, ref});
    }
  }
}
if (dangling.length) {
  console.error(JSON.stringify({error:'dangling-token-alias', dangling}, null, 2));
  process.exit(2);
}

fs.mkdirSync(outDir, {recursive: true});
fs.writeFileSync(path.join(outDir, 'com-design-mobile.tokens.json'), JSON.stringify(output, null, 2) + '\n');

const motionReference = {
  $metadata: {
    designSystemVersion: manifest.$metadata.version,
    source: '../../tokens/motion.json',
    penpotNativeBinding: false,
    reason: 'PenPot native token types do not currently represent the Core duration/cubicBezier motion model. Reference only; verify in implementation/prototype.'
  },
  motion
};
fs.writeFileSync(path.join(outDir, 'motion-reference.json'), JSON.stringify(motionReference, null, 2) + '\n');

console.log(JSON.stringify({
  status: 'OK',
  designSystemVersion: manifest.$metadata.version,
  tokenSets: Object.keys(sets),
  themes: themes.map((t) => `${t.group}/${t.name}`),
  tokenNames: allTokens.size,
  output: path.relative(repo, path.join(outDir, 'com-design-mobile.tokens.json')),
  motion: 'reference-only'
}, null, 2));
