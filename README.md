# com-design

公司级移动端设计系统。`design-source/` 是唯一可编辑的设计真相源；Penpot、人类文档以及后续 Tailwind / NativeWind / React Native 工程配置都应由同一真相源构建或适配生成。

## 目录结构

```text
design-source/   设计系统真相源：颜色、字体、间距、圆角、组件契约、预览与规范
penpot/          已实现的 Node.js 编译同步器：design-source -> Penpot manifest -> MCP
report/          人类可读设计系统报告；历史版本见 report/archive/
dist/            规划中的工程构建产物：Tailwind / NativeWind / React Native（尚未实现）
```

## 当前状态

目前已经实现：

```text
design-source
-> penpot/bin/build.mjs
-> penpot/build/manifest.json
-> Penpot MCP sync
```

Tailwind、NativeWind、React Native tokens，以及“与工程配置同源生成的人类文档”属于下一阶段构建目标，**当前尚未实现**。

完整构建契约：`design-source/BUILD_PIPELINE.md`。

## 工作流

### 1. 修改真相源

设计系统改动统一进入 `design-source/`：

- `colors_and_type.css`：颜色、字体、间距、圆角、阴影、密度、平台尺寸等 token
- `components/*.json`：组件契约
- `specs/*.json`：结构化规范
- `preview/`、`ui_kits/`：组件预览与 UI kit

不要在生成产物中反向维护 token。

### 2. 当前 Penpot 构建

```bash
cd penpot
npm install
npm run build      # 输出 penpot/build/manifest.json
```

### 3. 同步到 Penpot

在 Penpot 中打开目标文件并通过 `File -> MCP Server -> Connect` 连接插件，然后：

```bash
cp .env.example .env   # 填入 PENPOT_MCP_URL
npm run sync:dry-run   # 预演
npm run sync           # 实际同步
```

同步是幂等的：每个资产按 `com-design` pluginData 中的 source-id 匹配，存在即更新，不存在才建。

### 4. 下一阶段统一构建

目标不是让“人类文档生成工程配置”，而是让它们成为同一次构建的兄弟产物：

```text
design-source
   |
   +-> human docs
   +-> Penpot manifest
   +-> Tailwind adapter
   +-> NativeWind adapter
   +-> React Native tokens
```

最终仓库级接口计划收敛为 `build:docs`、`build:penpot`、`build:tailwind`、`build:nativewind`、`build:react-native` 与 `build:all`。具体约束见 `design-source/BUILD_PIPELINE.md`。

## 人类文档与归档

当前人类报告：

```text
report/design-system-v1/
```

在统一构建管线实施前，旧报告已保存精确 Git 快照：

```text
archive/design-system-v1-pre-pipeline-2026-08-12
```

归档说明：

```text
report/archive/design-system-v1-pre-pipeline-2026-08-12/ARCHIVE.md
```

后续每次替换已发布的人类报告，都应先创建日期化快照，不覆盖旧归档。

## 分支

- `main`：稳定版本
- `dev`：设计真相源、工具链与构建适配器的集成分支
- `archive/*`：历史快照，不作为开发分支使用

## 相关文档

- `design-source/BUILD_PIPELINE.md`：统一构建、单位映射、工程适配与归档契约
- `design-source/PENPOT_MCP_PLAYBOOK.md`：Penpot MCP 操作手册
- `penpot/README.md`：现有 Penpot 编译同步器说明
- `report/README.md`：人类文档与归档说明
