#!/usr/bin/env node
// 编译 canonical design model → Penpot governed manifest
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCanonicalDesignModel } from '../../tooling/src/design-model.mjs';
import { compileTokens } from '../src/compile/tokens.mjs';
import { compileTypographies } from '../src/compile/typographies.mjs';
import {
  assertPenpotCanonicalParity,
  compileCanonicalComponents,
  compileCanonicalTokenCoverage,
  compileCanonicalTrace,
  enrichCanonicalTokens,
} from '../src/compile/canonical.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const sourceDir = path.join(repoRoot, 'design-source');
const buildDir = path.join(repoRoot, 'penpot', 'build');

fs.mkdirSync(buildDir, { recursive: true });

const canonicalModel = buildCanonicalDesignModel(repoRoot);
const tokenManifest = compileTokens(path.join(sourceDir, 'colors_and_type.css'));
const tokens = enrichCanonicalTokens(tokenManifest.tokens, canonicalModel);
const canonical = {
  ...compileCanonicalTrace(canonicalModel),
  tokenCoverage: compileCanonicalTokenCoverage(tokens, canonicalModel),
};
const manifest = {
  ...tokenManifest,
  tokens,
  canonical,
  typographies: compileTypographies(),
  components: compileCanonicalComponents(canonicalModel),
};

const parityErrors = assertPenpotCanonicalParity(manifest, canonicalModel);
if (parityErrors.length) {
  console.error('Penpot build stopped: canonical parity failed.');
  for (const error of parityErrors) console.error(`- ${error}`);
  process.exit(1);
}

const outPath = path.join(buildDir, 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');

const tokenCount = manifest.tokens.length;
const colorCount = manifest.colors.length;
const compCount = manifest.components.length;
console.log(`manifest 已生成: ${outPath}`);
console.log(`  canonical source: ${manifest.canonical.sourceHash}`);
console.log(`  canonical token coverage: ${manifest.canonical.tokenCoverage.representedCanonicalTokenCount}/${manifest.canonical.tokenCoverage.canonicalTokenCount}`);
console.log(`  tokens: ${tokenCount}  colors: ${colorCount}  typographies: ${manifest.typographies.length}  components: ${compCount}`);
