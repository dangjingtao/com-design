import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  buildResolvedTable,
  parseCssVariables,
  parseNamedScope,
  resolveValue,
} from '../../penpot/src/parse/css-vars.mjs';

const PREFIX_TYPES = [
  ['color-', 'color'],
  ['space-', 'spacing'],
  ['radius-', 'radius'],
  ['size-', 'size'],
  ['shadow-', 'shadow'],
  ['type-', 'typography'],
  ['font-size-', 'fontSize'],
  ['font-weight-', 'fontWeight'],
  ['line-height-', 'lineHeight'],
  ['density-', 'density'],
  ['motion-', 'motion'],
  ['platform-', 'platform'],
];

const THEME_DEFINITIONS = [
  {
    key: 'premiumGold',
    name: 'premium-gold',
    file: 'premium-gold.css',
    selector: '.theme-premium-gold',
    dataSelector: '[data-com-theme="premium-gold"]',
  },
];

export function tokenType(name) {
  const hit = PREFIX_TYPES.find(([prefix]) => name.startsWith(prefix));
  if (hit) return hit[1];
  if (name.startsWith('com-')) return 'primitive';
  return 'other';
}

export function tokenKey(name) {
  const hit = PREFIX_TYPES.find(([prefix]) => name.startsWith(prefix));
  return hit ? name.slice(hit[0].length) : name;
}

export function pxToNumber(value) {
  if (value === 0 || value === '0') return 0;
  const match = String(value ?? '').trim().match(/^(-?[\d.]+)px$/);
  return match ? Number(match[1]) : value;
}

export function parseTypography(value) {
  const match = String(value ?? '')
    .trim()
    .match(/^(\d+)\s+([\d.]+)px\/([\d.]+)px\s+(.+)$/);
  if (!match) return { raw: value };
  return {
    fontWeight: Number(match[1]),
    fontSize: Number(match[2]),
    lineHeight: Number(match[3]),
    fontFamily: match[4],
  };
}

function resolveNamedScope(root, raw) {
  const table = { ...root, ...raw };
  return Object.fromEntries(
    Object.entries(raw).map(([name, value]) => [name, resolveValue(value, table)]),
  );
}

function resolveFullScope(base, raw) {
  const table = { ...base, ...raw };
  const names = new Set([...Object.keys(base), ...Object.keys(raw)]);
  return Object.fromEntries(
    [...names].map((name) => [name, resolveValue(table[name], table)]),
  );
}

function groupByType(tokens) {
  return tokens.reduce((groups, token) => {
    (groups[token.type] ??= []).push(token);
    return groups;
  }, {});
}

function loadThemes(cssPath, parsed) {
  const themeDir = path.join(path.dirname(cssPath), 'themes');
  const themes = {};
  let root = { ...parsed.root };
  let dark = { ...parsed.dark };
  const sources = [];

  // Theme files may add new tokens at :root/.dark without changing any existing
  // default semantic. This is how reward/member vocabulary stays available to
  // the default palette while the visual theme itself remains opt-in.
  for (const definition of THEME_DEFINITIONS) {
    const file = path.join(themeDir, definition.file);
    if (!fs.existsSync(file)) continue;
    const source = fs.readFileSync(file, 'utf-8');
    const additive = parseCssVariables(file);
    root = { ...root, ...additive.root };
    dark = { ...dark, ...additive.dark };
    sources.push({ definition, file, source });
  }

  for (const { definition, file, source } of sources) {
    const lightRaw = parseNamedScope(source, definition.selector);
    const darkRaw = parseNamedScope(source, `.dark${definition.selector}`);
    const baseDark = { ...root, ...dark };
    themes[definition.key] = {
      ...definition,
      source: file,
      light: resolveFullScope(root, lightRaw),
      dark: resolveFullScope(baseDark, { ...lightRaw, ...darkRaw }),
    };
  }

  return { parsed: { root, dark }, themes, sources };
}

export function buildTokenModel(cssPath) {
  const source = fs.readFileSync(cssPath, 'utf-8');
  const parsedBase = parseCssVariables(cssPath);
  const loaded = loadThemes(cssPath, parsedBase);
  const parsed = loaded.parsed;
  const table = buildResolvedTable(parsed).map((row) => ({
    ...row,
    hasDarkOverride: row.dark !== undefined && row.dark !== row.light,
    type: tokenType(row.name),
    key: tokenKey(row.name),
  }));
  const consumer = table.filter(
    (token) => token.type !== 'primitive' && token.type !== 'other',
  );

  const sourceHash = crypto.createHash('sha256').update(source);
  for (const item of loaded.sources) {
    sourceHash.update('\0').update(item.source);
  }

  return {
    schemaVersion: 1,
    source: cssPath,
    sourceHash: sourceHash.digest('hex'),
    table,
    consumer,
    byType: groupByType(consumer),
    scopes: {
      densityComfortable: resolveNamedScope(
        parsed.root,
        parseNamedScope(source, '.density-comfortable'),
      ),
      platformAndroid: resolveNamedScope(
        parsed.root,
        parseNamedScope(source, '.platform-android'),
      ),
    },
    themes: loaded.themes,
  };
}

export function validateTokenModel(model) {
  const errors = [];

  for (const token of model.consumer) {
    if (token.light === undefined) errors.push(`${token.name}: missing light value`);
    if (String(token.light).includes('var(--')) {
      errors.push(`${token.name}: unresolved light var()`);
    }
    if (String(token.dark).includes('var(--')) {
      errors.push(`${token.name}: unresolved dark var()`);
    }
  }

  for (const [themeKey, theme] of Object.entries(model.themes ?? {})) {
    for (const token of model.consumer) {
      for (const mode of ['light', 'dark']) {
        const value = theme[mode]?.[token.name];
        if (value === undefined) {
          errors.push(`${themeKey}.${mode}.${token.name}: missing theme value`);
        }
        if (String(value).includes('var(--')) {
          errors.push(`${themeKey}.${mode}.${token.name}: unresolved theme var()`);
        }
      }
    }
  }

  const required = [
    'color-primary',
    'color-background',
    'color-text-primary',
    'space-16',
    'radius-control',
    'size-control-height',
    'type-body',
  ];
  const names = new Set(model.table.map((token) => token.name));
  for (const name of required) {
    if (!names.has(name)) errors.push(`required token missing: ${name}`);
  }

  return errors;
}
