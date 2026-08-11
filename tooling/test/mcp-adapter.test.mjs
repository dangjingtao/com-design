import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildTokenModel } from '../src/token-model.mjs';
import {
  createMcpManifest,
  createMcpPackageJson,
  createMcpServer,
  createMcpTokenData,
} from '../src/mcp-adapter.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const model = buildTokenModel(path.join(repoRoot, 'design-source', 'colors_and_type.css'));

test('MCP manifest is tied to the design source and complete component catalog', () => {
  const manifest = createMcpManifest(repoRoot, model);
  assert.equal(manifest.designSystem, 'Com Design Mobile');
  assert.equal(manifest.componentCount, 33);
  assert.equal(manifest.tokenSourceHash, model.sourceHash);
  assert.match(manifest.sourceHash, /^[a-f0-9]{64}$/);
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

test('MCP token snapshot is generated from the normalized token model', () => {
  const data = createMcpTokenData(model);
  assert.equal(data.sourceHash, model.sourceHash);
  assert.equal(data.tokens.length, model.consumer.length);
  assert.ok(data.tokens.some((token) => token.name === 'color-primary'));
  assert.ok(data.tokens.some((token) => token.name === 'size-touch-min'));
});

test('generated MCP package pins the production v1 SDK and server source parses', () => {
  const manifest = createMcpManifest(repoRoot, model);
  const pkg = createMcpPackageJson(manifest.version);
  assert.equal(pkg.dependencies['@modelcontextprotocol/sdk'], '1.30.0');
  assert.equal(pkg.dependencies.zod, '3.25.76');

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-mcp-'));
  const serverFile = path.join(tempDir, 'server.mjs');
  fs.writeFileSync(serverFile, createMcpServer(manifest), 'utf-8');
  const checked = spawnSync(process.execPath, ['--check', serverFile], { encoding: 'utf-8' });
  assert.equal(checked.status, 0, checked.stderr || checked.stdout);
  fs.rmSync(tempDir, { recursive: true, force: true });
});
