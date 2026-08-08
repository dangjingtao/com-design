#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const src = path.resolve(root, 'plugin', 'src-v2');
const outputPath = path.resolve(root, 'plugin', 'plugin-v2.js');

const parts = [
  '01-core.jsfrag',
  '02-layout-core.jsfrag',
  '03-foundations-layout.jsfrag',
  '04-foundations-components.jsfrag',
  '05-components-main.jsfrag',
  '06-components-final.jsfrag'
];

const missing = parts.filter((name) => !fs.existsSync(path.resolve(src, name)));
if (missing.length) {
  throw new Error(`Missing PenPot V2 source fragments: ${missing.join(', ')}`);
}

const source = parts
  .map((name) => fs.readFileSync(path.resolve(src, name), 'utf8'))
  .join('');

if (!source.includes("const LAYOUT =")) {
  throw new Error('Curated layout table not found in generated plugin source.');
}
if (!source.includes("CURATED_ARCHIVE_V2")) {
  throw new Error('Curated layout version marker missing.');
}
if (/positionData/.test(source)) {
  throw new Error('Generated plugin must never fabricate PenPot positionData.');
}

fs.writeFileSync(outputPath, source, 'utf8');

console.log(JSON.stringify({
  status: 'OK',
  output: 'penpot-library/plugin/plugin-v2.js',
  parts,
  bytes: Buffer.byteLength(source),
  layout: 'CURATED_ARCHIVE_V2'
}, null, 2));
