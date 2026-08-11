import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  buildResolvedTable,
  parseCssVariables,
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

const DECL_RE = /--([\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/gm;

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

function parseNamedScope(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`));
  if (!match) return {};

  const output = {};
  const re = new RegExp(DECL_RE.source, 'gm');
  let declaration;
  while ((declaration = re.exec(match[1])) !== null) {
    output[declaration[1]] = declaration[2].trim();
  }
  return output;
}

function resolveNamedScope(root, raw) {
  const table = { ...root, ...raw };
  return Object.fromEntries(
    Object.entries(raw).map(([name, value]) => [name, resolveValue(value, table)]),
  );
}

function groupByType(tokens) {
  return tokens.reduce((groups, token) => {
    (groups[token.type] ??= []).push(token);
    return groups;
  }, {});
}

export function buildTokenModel(cssPath) {
  const source = fs.readFileSync(cssPath, 'utf-8');
  const parsed = parseCssVariables(cssPath);
  const table = buildResolvedTable(parsed).map((row) => ({
    ...row,
    hasDarkOverride: row.dark !== undefined && row.dark !== row.light,
    type: tokenType(row.name),
    key: tokenKey(row.name),
  }));
  const consumer = table.filter(
    (token) => token.type !== 'primitive' && token.type !== 'other',
  );

  return {
    schemaVersion: 1,
    source: cssPath,
    sourceHash: crypto.createHash('sha256').update(source).digest('hex'),
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
