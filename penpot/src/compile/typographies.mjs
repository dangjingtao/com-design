// 从 9 个语义字体角色生成 Penpot 字体样式。
// 字族/字号/字重/行高来自 CSS 变量，按 com-design 契约固定映射。

const TYPO_ROLES = [
  { name: 'Display',       varName: 'type-display',       size: '28', weight: '600', lineHeight: '36' },
  { name: 'Title',         varName: 'type-title',         size: '24', weight: '600', lineHeight: '30' },
  { name: 'Heading',       varName: 'type-heading',       size: '18', weight: '600', lineHeight: '24' },
  { name: 'Heading Small', varName: 'type-heading-small', size: '16', weight: '600', lineHeight: '22' },
  { name: 'Body',          varName: 'type-body',          size: '16', weight: '400', lineHeight: '24' },
  { name: 'Label',         varName: 'type-label',         size: '14', weight: '500', lineHeight: '20' },
  { name: 'Body Small',    varName: 'type-body-small',    size: '14', weight: '400', lineHeight: '20' },
  { name: 'Label Small',   varName: 'type-label-small',   size: '12', weight: '500', lineHeight: '16' },
  { name: 'Caption',       varName: 'type-caption',       size: '12', weight: '400', lineHeight: '18' }
];

const FONT_FAMILY = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

/**
 * @returns {import('../manifest-types.mjs').ManifestLibraryTypography[]}
 */
export function compileTypographies() {
  return TYPO_ROLES.map(r => ({
    name: r.name,
    fontFamily: FONT_FAMILY,
    fontSize: r.size,
    fontWeight: r.weight,
    lineHeight: r.lineHeight,
    letterSpacing: '0',
    sourceId: r.varName
  }));
}
