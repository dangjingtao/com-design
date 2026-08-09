#!/usr/bin/env node
// 读取 build/manifest.json，通过 Penpot 远程 MCP 同步到当前聚焦的 Penpot 文件。
// 用法：
//   node bin/sync.mjs              实际同步
//   node bin/sync.mjs --dry-run    只统计，不写入
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPenpotClient, executeCode, buildSyncScript } from '../src/sync/client.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const manifestPath = path.join(repoRoot, 'penpot', 'build', 'manifest.json');

const dryRun = process.argv.includes('--dry-run');

// 极简 .env 加载（不引入 dotenv 依赖）
function loadEnv() {
  const envPath = path.join(repoRoot, 'penpot', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const url = process.env.PENPOT_MCP_URL;
if (!url) {
  console.error('缺少 PENPOT_MCP_URL，请在 penpot/.env 中配置。');
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) {
  console.error('找不到 build/manifest.json，请先运行 npm run build。');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const code = buildSyncScript(manifest, { dryRun });

console.log(dryRun ? '预演模式（不写入）...' : '正在同步到 Penpot...');
const client = await createPenpotClient(url);
try {
  const report = await executeCode(client, code);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await client.close();
}
