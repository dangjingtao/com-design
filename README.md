# com-design

公司级移动端设计系统，含可同步到 Penpot 的工具链。

## 目录结构

```
design-source/   TraeDesign 维护的设计系统真相源（颜色、字体、组件契约、预览）
penpot/          Node.js 编译同步器：把真相源编译成 Penpot manifest，经 MCP 同步到 Penpot
```

## 工作流

### 1. 修改真相源

设计系统的所有改动都在 `design-source/` 中进行（由 TraeDesign 维护），包括：
- `colors_and_type.css`：颜色、字体、间距、圆角、阴影 token
- `components/*.json`：组件契约
- `preview/`、`ui_kits/`：组件预览与 UI kit

### 2. 编译为 Penpot manifest

```bash
cd penpot
npm install
npm run build      # 输出 penpot/build/manifest.json
```

### 3. 同步到 Penpot

在 Penpot 中打开目标文件并通过 `File → MCP Server → Connect` 连接插件，然后：

```bash
cp .env.example .env   # 填入 PENPOT_MCP_URL
npm run sync:dry-run   # 预演
npm run sync           # 实际同步
```

同步是幂等的：每个资产按 `com-design` pluginData 中的 source-id 匹配，存在即更新，不存在才建。

### 4. 换机恢复

```bash
git clone <repo>
cd penpot && npm install && npm run build && npm run sync
```

## 分支

- `main`：稳定版本
- `dev`：开发分支，工具链和真相源的迭代在此合并

## 文档

- `design-source/PENPOT_MCP_PLAYBOOK.md`：Penpot MCP 操作手册（新会话读取此文件即可恢复操作能力）
- `penpot/README.md`：编译同步器说明
