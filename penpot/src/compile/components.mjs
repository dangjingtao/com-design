// 读取 design-source/components/index.json，输出组件清单。
// 组件的 Penpot shape 树由各组件的 .penpot.json 声明文件描述（待补）。
import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {string} sourceDir  design-source 目录
 * @returns {import('../manifest-types.mjs').ManifestComponent[]}
 */
export function compileComponents(sourceDir) {
  const indexPath = path.join(sourceDir, 'components', 'index.json');
  if (!fs.existsSync(indexPath)) return [];
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  return (index.components || []).map(c => {
    const declFile = path.join(sourceDir, 'components', `${c.slug}.penpot.json`);
    return {
      slug: c.slug,
      name: c.name,
      declarationFile: fs.existsSync(declFile) ? `components/${c.slug}.penpot.json` : undefined
    };
  });
}
