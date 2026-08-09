#!/usr/bin/env node
// 编译 design-source → build/manifest.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileTokens } from '../src/compile/tokens.mjs';
import { compileTypographies } from '../src/compile/typographies.mjs';
import { compileComponents } from '../src/compile/components.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const sourceDir = path.join(repoRoot, 'design-source');
const buildDir = path.join(repoRoot, 'penpot', 'build');

fs.mkdirSync(buildDir, { recursive: true });

const manifest = {
  ...compileTokens(path.join(sourceDir, 'colors_and_type.css')),
  typographies: compileTypographies(),
  components: compileComponents(sourceDir)
};

const outPath = path.join(buildDir, 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');

const tokenCount = manifest.tokens.length;
const colorCount = manifest.colors.length;
const compCount = manifest.components.length;
console.log(`manifest 已生成: ${outPath}`);
console.log(`  tokens: ${tokenCount}  colors: ${colorCount}  typographies: ${manifest.typographies.length}  components: ${compCount}`);
