import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildTokenModel } from '../src/token-model.mjs';
import {
  collectMcpSourceFiles,
  createMcpManifest,
  createMcpPackageJson,
  createMcpServer,
  createMcpTokenData,
} from '../src/mcp-adapter.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const model = buildTokenModel(path.join(repoRoot, 'design-source', 'colors_and_type.css'));

test('MCP manifest is tied to the complete design source and component catalog', () => {
  const manifest = createMcpManifest(repoRoot, model);
  assert.equal(manifest.designSystem, 'Com Design Mobile');
  assert.equal(manifest.componentCount, 33);
  assert.equal(manifest.tokenSourceHash, model.sourceHash);
  assert.match(manifest.sourceHash, /^[a-f0-9]{64}$/);
  assert.deepEqual(manifest.themes, ['premium-gold']);
  assert.ok(
    collectMcpSourceFiles(repoRoot).some((file) =>
      file.endsWith(path.join('themes', 'premium-gold.css')),
    ),
  );
  assert.deepEqual(manifest.tools, [
    'com_list',
    'com_info',
    'com_doc',
    'com_preview',
    'com_token',
    'com_design_md',
    'com_semantic',
  ]);
});

test('MCP token snapshot exposes default and Premium Gold theme values', () => {
  const data = createMcpTokenData(model);
  assert.equal(data.sourceHash, model.sourceHash);
  assert.equal(data.tokens.length, model.consumer.length);
  assert.deepEqual(data.availableThemes, [
    'light',
    'dark',
    'premium-gold-light',
    'premium-gold-dark',
  ]);

  const primary = data.tokens.find((token) => token.name === 'color-primary');
  const reward = data.tokens.find((token) => token.name === 'color-reward');
  assert.equal(primary.light, '#5B5EF7');
  assert.equal(primary.themes['premium-gold-light'], '#D63D10');
  assert.equal(reward.themes['premium-gold-light'], '#EDBC6C');
  assert.ok(data.tokens.some((token) => token.name === 'size-touch-min'));
});

test('generated MCP package pins the production v1 SDK and server source parses', () => {
  const manifest = createMcpManifest(repoRoot, model);
  const pkg = createMcpPackageJson(manifest.version);
  assert.equal(pkg.dependencies['@modelcontextprotocol/sdk'], '1.30.0');
  assert.equal(pkg.dependencies.zod, '3.25.76');

  const serverSource = createMcpServer(manifest);
  assert.match(serverSource, /availableThemes/);
  assert.match(serverSource, /premium-gold-light|tokenData\.availableThemes/);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-mcp-'));
  const serverFile = path.join(tempDir, 'server.mjs');
  fs.writeFileSync(serverFile, serverSource, 'utf-8');
  const checked = spawnSync(process.execPath, ['--check', serverFile], { encoding: 'utf-8' });
  assert.equal(checked.status, 0, checked.stderr || checked.stdout);
  fs.rmSync(tempDir, { recursive: true, force: true });
});
