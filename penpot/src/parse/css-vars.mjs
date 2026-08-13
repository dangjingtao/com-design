// 解析 design-source CSS 变量，解析 var() 引用链，输出扁平 token 表。
// 基础解析支持 :root 与 .dark；命名 scope 供可选主题/密度等兼容层使用。
import fs from 'node:fs';
import path from 'node:path';

/**
 * @typedef {Object} CssVar
 * @property {string} name      变量名，不含 --，如 com-brand-500
 * @property {string} value     原始值字符串，如 "#5B5EF7" 或 "var(--com-neutral-800)"
 * @property {string} scope     CSS scope
 */

const VAR_DECL_RE = /--([\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/gm;
const SCOPE_RE = /(:root|\.dark)\s*\{([\s\S]*?)\}/g;
const BLOCK_RE = /([^{}]+)\{([^{}]*)\}/g;

/**
 * @param {string} body
 * @returns {Record<string,string>}
 */
export function parseDeclarations(body) {
  const output = {};
  const re = new RegExp(VAR_DECL_RE.source, 'gm');
  let declaration;
  while ((declaration = re.exec(body)) !== null) {
    output[declaration[1]] = declaration[2].trim();
  }
  return output;
}

/**
 * 从 CSS 源码读取一个精确 selector 的变量声明。
 * 支持逗号分隔 selector，例如：.a, .b { ... }。
 *
 * @param {string} source
 * @param {string} selector
 * @returns {Record<string,string>}
 */
export function parseNamedScope(source, selector) {
  const output = {};
  const re = new RegExp(BLOCK_RE.source, 'g');
  let block;
  while ((block = re.exec(source)) !== null) {
    const selectors = block[1].split(',').map((item) => item.trim());
    if (!selectors.includes(selector)) continue;
    Object.assign(output, parseDeclarations(block[2]));
  }
  return output;
}

/**
 * @param {string} cssPath
 * @returns {{ root: Record<string,string>, dark: Record<string,string> }}
 */
export function parseCssVariables(cssPath) {
  const css = fs.readFileSync(cssPath, 'utf-8');
  /** @type {Record<string,string>} */
  const root = {};
  /** @type {Record<string,string>} */
  const dark = {};

  const scopeRe = new RegExp(SCOPE_RE.source, 'g');
  let scopeMatch;
  while ((scopeMatch = scopeRe.exec(css)) !== null) {
    const scope = scopeMatch[1];
    const body = scopeMatch[2];
    Object.assign(scope === '.dark' ? dark : root, parseDeclarations(body));
  }
  return { root, dark };
}

/**
 * 递归把 var(--xxx) 引用解析为具体值。
 * @param {string} value
 * @param {Record<string,string>} table
 * @param {Set<string>} [resolving]
 * @returns {string}
 */
export function resolveValue(value, table, resolving = new Set()) {
  if (typeof value !== 'string') return value;
  return value.replace(/var\(--([\w-]+)(?:,\s*([^)]+))?\)/g, (_, name, fallback) => {
    if (resolving.has(name)) {
      // 循环引用，回退
      return fallback ? fallback.trim() : `var(--${name})`;
    }
    const raw = table[name];
    if (raw === undefined) {
      return fallback ? fallback.trim() : `var(--${name})`;
    }
    resolving.add(name);
    const resolved = resolveValue(raw, table, resolving);
    resolving.delete(name);
    return resolved;
  });
}

/**
 * 把 root/dark 两张表解析成具体值，并以 dark 覆盖 root 中同名变量。
 * dark 主题不仅解析 .dark 中直接声明的 token，也会重新解析 root alias，
 * 因此 color-background -> com-surface-page -> neutral 等引用链能正确继承暗色覆盖。
 *
 * @param {{ root: Record<string,string>, dark: Record<string,string> }} parsed
 * @returns {Array<{ name: string, light: string, dark?: string }>}
 */
export function buildResolvedTable(parsed) {
  const names = new Set([...Object.keys(parsed.root), ...Object.keys(parsed.dark)]);
  const darkTable = { ...parsed.root, ...parsed.dark };
  const out = [];
  for (const name of names) {
    const lightRaw = parsed.root[name];
    const darkRaw = parsed.dark[name];
    const light = lightRaw !== undefined ? resolveValue(lightRaw, parsed.root) : undefined;
    // 如果 alias 本身没有在 .dark 重写，也要用 dark table 重算它引用的 primitive/semantic。
    const darkSource = darkRaw !== undefined ? darkRaw : lightRaw;
    const dark = darkSource !== undefined ? resolveValue(darkSource, darkTable) : undefined;
    out.push({ name, light, dark });
  }
  return out;
}

// 直接运行时打印解析结果
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const cssPath = process.argv[2] || path.resolve(process.cwd(), '../design-source/colors_and_type.css');
  const parsed = parseCssVariables(cssPath);
  const table = buildResolvedTable(parsed);
  console.log(JSON.stringify({ count: table.length, sample: table.slice(0, 5) }, null, 2));
}
