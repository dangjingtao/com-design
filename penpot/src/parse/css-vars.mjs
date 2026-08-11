// 解析 colors_and_type.css 中的 CSS 变量，解析 var() 引用链，输出扁平 token 表。
// 支持 :root 与 .dark 两个作用域。
import fs from 'node:fs';
import path from 'node:path';

/**
 * @typedef {Object} CssVar
 * @property {string} name      变量名，不含 --，如 com-brand-500
 * @property {string} value     原始值字符串，如 "#5B5EF7" 或 "var(--com-neutral-800)"
 * @property {string} scope     ":root" | ".dark"
 */

const VAR_DECL_RE = /--([\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/gm;
const SCOPE_RE = /(:root|\.dark)\s*\{([\s\S]*?)\}/g;

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

  let scopeMatch;
  while ((scopeMatch = SCOPE_RE.exec(css)) !== null) {
    const scope = scopeMatch[1];
    const body = scopeMatch[2];
    const target = scope === '.dark' ? dark : root;
    let declMatch;
    const re = new RegExp(VAR_DECL_RE.source, 'gm');
    while ((declMatch = re.exec(body)) !== null) {
      target[declMatch[1]] = declMatch[2].trim();
    }
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
