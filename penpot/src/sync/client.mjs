// Penpot 远程 MCP 客户端。
// 通过 streamable HTTP 连接，调用 execute_code 工具执行同步脚本。
//
// 注意：这是骨架。execute_code 的具体调用参数与返回结构以实际 MCP 服务端为准，
// 真正联调时按 Penpot MCP 的工具描述调整 callTool 的参数名。

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

/**
 * @param {string} url  Penpot 远程 MCP URL（含 userToken）
 */
export async function createPenpotClient(url) {
  const client = new Client({ name: 'com-design-sync', version: '0.1.0' });
  const transport = new StreamableHTTPClientTransport(new URL(url));
  await client.connect(transport);
  return client;
}

/**
 * 在 Penpot 插件上下文执行一段 JS 代码。
 * @param {Client} client
 * @param {string} code
 * @returns {Promise<unknown>}
 */
export async function executeCode(client, code) {
  const result = await client.callTool({
    name: 'execute_code',
    arguments: { code }
  });
  // MCP 返回 content 数组，取其中文本
  const text = result.content?.find(c => c.type === 'text')?.text;
  if (!text) return result;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * 生成一段在 Penpot 里执行的同步脚本。
 * 脚本接收 manifest 字面量，按幂等规则写入 token / colors / typographies。
 *
 * @param {import('../manifest-types.mjs').Manifest} manifest
 * @param {{ dryRun?: boolean }} options
 * @returns {string}
 */
export function buildSyncScript(manifest, { dryRun = false } = {}) {
  // 注意：这里把 manifest 序列化进脚本，Penpot 端没有文件系统访问。
  const data = JSON.stringify(manifest);
  return `
const manifest = ${data};
const dryRun = ${dryRun ? 'true' : 'false'};
const lib = penpot.library.local;
const report = { created: [], updated: [], skipped: [], dryRun };

function findBySourceId(collection, sourceId) {
  return collection.find(item => {
    try { return item.getPluginData('com-design') === sourceId; } catch { return false; }
  });
}

// 1. token sets & themes
const cat = lib.tokens;
for (const setName of ['core','light','dark']) {
  let set = cat.sets.find(s => s.name === setName);
  if (!set && !dryRun) set = cat.addSet({ name: setName, active: setName === 'core' });
}
for (const theme of manifest.themes) {
  let t = cat.themes.find(x => x.group === theme.group && x.name === theme.name);
  if (!t && !dryRun) {
    t = cat.addTheme({ group: theme.group, name: theme.name });
    for (const sn of theme.sets) {
      const s = cat.sets.find(x => x.name === sn);
      if (s) t.addSet(s);
    }
  }
}

// 2. tokens
for (const tok of manifest.tokens) {
  const set = cat.sets.find(s => s.name === tok.set);
  if (!set) { report.skipped.push('missing-set:' + tok.set + ':' + tok.name); continue; }
  const existing = set.tokens.find(t => t.name === tok.name);
  if (existing) {
    report.updated.push(tok.set + '/' + tok.name);
  } else {
    if (!dryRun) set.addToken({ type: tok.type, name: tok.name, value: tok.value });
    report.created.push(tok.set + '/' + tok.name);
  }
}

// 3. colors
for (const c of manifest.colors) {
  const existing = findBySourceId(lib.colors, c.sourceId);
  if (existing) {
    report.updated.push('color/' + c.sourceId);
  } else {
    if (!dryRun) {
      const nc = lib.createColor();
      nc.name = c.name;
      nc.path = c.path;
      nc.color = c.color;
      if (c.opacity !== undefined) nc.opacity = c.opacity;
      nc.setPluginData('com-design', 'source-id', c.sourceId);
    }
    report.created.push('color/' + c.sourceId);
  }
}

// 4. typographies
for (const t of manifest.typographies) {
  const existing = findBySourceId(lib.typographies, t.sourceId);
  if (existing) {
    report.updated.push('typo/' + t.sourceId);
  } else {
    if (!dryRun) {
      const nt = lib.createTypography();
      nt.name = t.name;
      nt.fontFamily = t.fontFamily;
      nt.fontSize = t.fontSize;
      nt.fontWeight = t.fontWeight;
      nt.lineHeight = t.lineHeight;
      if (t.letterSpacing) nt.letterSpacing = t.letterSpacing;
      nt.setPluginData('com-design', 'source-id', t.sourceId);
    }
    report.created.push('typo/' + t.sourceId);
  }
}

return report;
`;
}
