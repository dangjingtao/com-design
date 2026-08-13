// 把标准化 token model 分类为 Penpot token：
// - color      来自 --color-* 与带色值的 --com-* 原始色阶
// - spacing    来自 --space-* 与 --com-space-*
// - sizing     来自 --size-* / --com-size-* / --com-density-*
// - borderRadius 来自 --radius-* / --com-radius-*
// - shadow     来自 --shadow-* / --com-elevation-*
// - typography 来自 --type-*（复合值）
// - fontSize/fontWeight/lineHeight 原语
//
// 默认 Light/Dark 保持兼容；可选主题从同一 token model 追加独立 set，
// 不重写默认色系。

import { buildTokenModel } from '../../../tooling/src/token-model.mjs';

const COLOR_LIKE_PREFIXES = [
  'com-brand',
  'com-neutral',
  'com-accent',
  'com-success',
  'com-warning',
  'com-danger',
  'com-text',
  'com-surface',
  'com-border',
  'com-action',
  'com-status',
  'com-scrim',
  'com-warm',
  'com-ink',
  'com-premium',
  'com-reward',
  'com-member',
];

const CONSUMER_COLOR_PREFIXES = ['color-'];
const CONSUMER_SPACING_PREFIXES = ['space-'];
const CONSUMER_RADIUS_PREFIXES = ['radius-'];
const CONSUMER_SIZE_PREFIXES = ['size-'];
const CONSUMER_SHADOW_PREFIXES = ['shadow-'];
const CONSUMER_TYPE_PREFIXES = ['type-'];

/** 判断值是否为颜色（hex 或 rgba）。 */
function isColorValue(v) {
  if (!v) return false;
  const s = String(v).trim();
  return /^#[0-9a-f]{3,8}$/i.test(s) || /^rgba?\(/i.test(s);
}

function isColorToken(name, value) {
  return (
    CONSUMER_COLOR_PREFIXES.some((prefix) => name.startsWith(prefix)) ||
    (COLOR_LIKE_PREFIXES.some((prefix) => name.startsWith(prefix)) && isColorValue(value))
  );
}

/** 简易 CSS shorthand 转 Penpot shadow token 字符串。 */
function shadowToTokenValue(v) {
  // 形如 "0 4px 12px 0 rgba(23,27,42,0.14)"
  const m = String(v).trim().match(
    /^(-?[\d.]+px)\s+(-?[\d.]+px)\s+(-?[\d.]+px)(?:\s+(-?[\d.]+px))?\s+(rgba?\([^)]+\)|#[0-9a-f]+)$/i,
  );
  if (!m) return String(v);
  return JSON.stringify({
    offsetX: m[1],
    offsetY: m[2],
    blur: m[3],
    spread: m[4] || '0',
    color: m[5],
    style: 'drop-shadow',
  });
}

/**
 * 把 font shorthand "600 18px/24px system-ui, ..." 拆成 typography token 值。
 */
function typographyToTokenValue(v) {
  const s = String(v).trim();
  const m = s.match(/^(\d+)\s+(\d+)px\/(\d+)px\s+(.+)$/);
  if (!m) return s;
  return JSON.stringify({
    fontWeight: m[1],
    fontSize: m[2],
    lineHeight: m[3],
    fontFamily: m[4],
  });
}

function pxToNumber(v) {
  if (typeof v === 'number') return v;
  const m = String(v).match(/^(-?[\d.]+)px?$/);
  return m ? Number(m[1]) : v;
}

/**
 * @param {string} cssPath
 * @returns {import('../manifest-types.mjs').Manifest}
 */
export function compileTokens(cssPath) {
  const model = buildTokenModel(cssPath);
  const resolved = model.table;

  /** @type {import('../manifest-types.mjs').ManifestToken[]} */
  const tokens = [];
  /** @type {import('../manifest-types.mjs').ManifestLibraryColor[]} */
  const colors = [];

  for (const { name, light, dark } of resolved) {
    // ---- 消费层：颜色（light/dark 两套）----
    if (CONSUMER_COLOR_PREFIXES.some((prefix) => name.startsWith(prefix))) {
      if (light !== undefined) {
        tokens.push({ set: 'light', name, type: 'color', value: light, sourceId: name });
      }
      if (dark !== undefined) {
        tokens.push({ set: 'dark', name, type: 'color', value: dark, sourceId: name });
      }
      continue;
    }

    // ---- 原始色阶：建颜色样式 + color token ----
    if (COLOR_LIKE_PREFIXES.some((prefix) => name.startsWith(prefix)) && isColorValue(light)) {
      const group = name.split('-')[0].replace('com', '').replace(/^./, (c) => c.toUpperCase());
      colors.push({
        name: `${group}/${name.split('-').slice(1).join('-')}`,
        path: group,
        color: String(light).toUpperCase(),
        sourceId: name,
      });
      tokens.push({ set: 'light', name, type: 'color', value: light, sourceId: name });
      if (dark !== undefined && dark !== light) {
        tokens.push({ set: 'dark', name, type: 'color', value: dark, sourceId: name });
      }
      continue;
    }

    // ---- 非颜色 token 进 core ----
    let type = null;
    let value = light;
    if (
      CONSUMER_SPACING_PREFIXES.some((prefix) => name.startsWith(prefix)) ||
      name.startsWith('com-space-')
    ) {
      type = 'spacing';
      value = pxToNumber(light);
    } else if (
      CONSUMER_RADIUS_PREFIXES.some((prefix) => name.startsWith(prefix)) ||
      name.startsWith('com-radius-')
    ) {
      type = 'borderRadius';
      value = pxToNumber(light);
    } else if (
      CONSUMER_SIZE_PREFIXES.some((prefix) => name.startsWith(prefix)) ||
      name.startsWith('com-size-') ||
      name.startsWith('com-density-') ||
      name.startsWith('com-icon-size') ||
      name.startsWith('com-indicator-size')
    ) {
      type = 'sizing';
      value = pxToNumber(light);
    } else if (
      CONSUMER_SHADOW_PREFIXES.some((prefix) => name.startsWith(prefix)) ||
      name.startsWith('com-elevation-')
    ) {
      type = 'shadow';
      value = shadowToTokenValue(light);
    } else if (CONSUMER_TYPE_PREFIXES.some((prefix) => name.startsWith(prefix))) {
      type = 'typography';
      value = typographyToTokenValue(light);
    } else if (name.startsWith('com-font-size-') || name.startsWith('font-size-')) {
      type = 'fontSizes';
      value = pxToNumber(light);
    } else if (name.startsWith('com-font-weight-') || name.startsWith('font-weight-')) {
      type = 'fontWeights';
      value = Number(light);
    } else if (name.startsWith('com-line-height-') || name.startsWith('line-height-')) {
      type = 'dimension';
      value = pxToNumber(light);
    } else if (name.startsWith('com-border-')) {
      type = 'borderWidth';
      value = pxToNumber(light);
    }
    if (type && light !== undefined) {
      tokens.push({ set: 'core', name, type, value, sourceId: name });
    }
  }

  const themes = [
    { group: 'color-scheme', name: 'Light', sets: ['core', 'light'] },
    { group: 'color-scheme', name: 'Dark', sets: ['core', 'dark'] },
  ];

  // Optional color themes are full color sets. They replace only the active
  // color set inside Penpot and always keep the same core sizing/type tokens.
  for (const theme of Object.values(model.themes ?? {})) {
    const lightSet = `${theme.name}-light`;
    const darkSet = `${theme.name}-dark`;

    for (const token of resolved) {
      const light = theme.light?.[token.name];
      const dark = theme.dark?.[token.name];
      if (light !== undefined && isColorToken(token.name, light)) {
        tokens.push({
          set: lightSet,
          name: token.name,
          type: 'color',
          value: light,
          sourceId: token.name,
        });
      }
      if (dark !== undefined && isColorToken(token.name, dark)) {
        tokens.push({
          set: darkSet,
          name: token.name,
          type: 'color',
          value: dark,
          sourceId: token.name,
        });
      }
    }

    themes.push(
      {
        group: 'color-scheme',
        name: 'Premium Gold / Light',
        sets: ['core', lightSet],
      },
      {
        group: 'color-scheme',
        name: 'Premium Gold / Dark',
        sets: ['core', darkSet],
      },
    );
  }

  return {
    library: 'com-design',
    version: '1.0.0-rc.2',
    generatedAt: new Date().toISOString(),
    themes,
    tokens,
    colors,
    typographies: [],
    components: [],
  };
}
