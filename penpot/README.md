# Penpot 编译同步器

把 `../design-source/`（com-design 真相源）编译成 Penpot 可读的 manifest，再通过 Penpot 远程 MCP 同步到目标 Penpot 文件。

## 架构

```
design-source/              真相源（唯一可写入口，TraeDesign 维护）
  colors_and_type.css       CSS 变量（含 .dark 覆盖）
  components/*.json         组件契约
penpot/
  src/parse/css-vars.mjs    解析 CSS 变量与 var() 引用链
  src/compile/              把解析结果编译成 Penpot manifest
    tokens.mjs              token sets / themes
    colors.mjs              颜色样式
    typographies.mjs        字体样式
    components.mjs          组件 shape 树（读 .penpot.json 声明）
  src/sync/
    client.mjs              MCP 客户端（streamable HTTP）
    upsert.mjs              按 pluginData source-id 幂等写入
  bin/build.mjs             生成 build/manifest.json
  bin/sync.mjs              读 manifest，通过 MCP 同步
build/                      编译产物（不入库）
```

## 用法

```bash
npm install

# 1. 解析真相源，生成 build/manifest.json
npm run build

# 2. 在 Penpot 里打开目标文件，File → MCP Server → Connect
# 3. 把 Penpot 远程 MCP URL 填到 .env
cp .env.example .env
# 编辑 .env，填入 PENPOT_MCP_URL

# 先预演，不写入
npm run sync:dry-run

# 实际同步
npm run sync
```

## 环境变量

见 `.env.example`。

## 幂等保证

每个写入 Penpot 的资产都会设置 pluginData：
- namespace: `com-design`
- key: `source-id`
- value: 真相源里的变量名或组件 slug（如 `com-brand-500`、`button`）

同步时按 source-id 匹配：存在即更新，不存在才建，源里已删除的标记归档，不产生重复。

## 状态

当前为骨架阶段：
- [x] CSS 变量解析器
- [x] Foundation token manifest 生成
- [ ] 颜色样式 / 字体样式写入
- [ ] 组件 `.penpot.json` 声明格式与编译器
- [ ] MCP 同步器实现
