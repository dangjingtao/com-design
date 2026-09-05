# com-design

Com Design 是公司级 **Android / iOS / Web / WeChat Mini Program** 四端设计系统。V2 以 `design-source/` 为唯一可编辑设计真相源，通过 Canonical Design Model、Machine Contract 与 Platform Adapter 向 AI / Agent、研发、设计工具和人类文档提供同源消费路径。

当前消费优先级：

```text
1. AI / Agent
2. Engineering / R&D
3. Design
```

这不是组织价值排序，而是接口建设优先级：机器消费者必须先能确定地读 contract、选择平台路径并验证结果，随后工程与设计工具消费同一来源。

## V2 架构

```text
design-source/                         Canonical editable source
  specs/design-system-v1.json         Canonical manifest
  components/*.json                   Core Component contracts
  specs/core-composites.json          Composite contracts
  specs/core-patterns.json            UX Pattern contracts
  specs/platform-*.json               Platform / Environment contracts
        |
        v
Canonical Design Model V2
        |
        +-- dist/agent/contract.json               AI / Agent consumer
        +-- dist/tailwind/                         Web adapter
        +-- dist/native-mobile/adapter.json        iOS / Android adapter contract
        +-- dist/nativewind/ + react-native/       compatible native engineering consumers
        +-- dist/wechat-mini-program/              WeChat Mini Program adapter
        +-- penpot/build/manifest.json             governed Penpot consumer
        +-- report/design-system-v1/               accepted human-guide evidence
```

**生成物和下游工作区都不是第二真相源。** Penpot、Human Guide、Preview、Tailwind、NativeWind、React Native 与 Mini Program 输出发生冲突时，回到 canonical source 修正。

## 当前事实

当前 V2 canonical catalog 由验证器从真实 source 解析：

```text
33 Core Components
4 Core Composite Components
6 Core UX Patterns
```

正式目标平台：

```text
Android
iOS
Web
WeChat Mini Program
```

当前第一阶段已有正式 Platform Adapter 路径：

- Web：`dist/tailwind/adapter.json`
- iOS / Android：`dist/native-mobile/adapter.json`
- WeChat Mini Program：`dist/wechat-mini-program/adapter.json`
- AI / Agent：`dist/agent/contract.json`
- Penpot：`penpot/build/manifest.json`

React Native / NativeWind 是可继续使用的工程消费者，但**不是 iOS / Android 平台语义本身**。

## 消费规则

生产实现先读 machine contract，再选择目标 Platform Adapter：

```text
canonical contract
→ target platform/context
→ Platform Adapter
→ production implementation
→ validation / evidence
```

`design-source/preview/` 只用于视觉和交互参考。它不是生产实现源，尤其不能把 Web Preview 的 DOM/CSS 直接复制成 iOS、Android 或微信小程序实现。

统一消费地图：`design-source/library-consumption.json`。

AI / Agent 详细入口：`design-source/SKILL.md`。

## 常用命令

```bash
npm test
npm run validate
npm run build:engineering
npm run build:penpot
npm run build:all
npm run smoke:four-platform
npm run governance:dry-run
```

其中：

- `validate`：执行 V2 deterministic validation，包括 source / contract / platform / consumption consistency。
- `build:engineering`：生成 Web、Native Mobile、NativeWind、React Native、Mini Program 与 AI contract 等工程输出。
- `build:penpot`：生成受治理的 Penpot manifest。
- `smoke:four-platform`：执行四端代表性语义 smoke。
- `governance:dry-run`：验证 release governance 可执行，但不会替 Mira 自动放行正式版本。

## Human Guide 与历史证据

当前 accepted human report：

```text
report/design-system-v1/
```

它是验收证据，不能被工程 build 删除或原地覆盖。历史报告和归档也不能成为未来构建的上游 source。

## 分支

- `dev`：V2 施工、集成与验证
- `main`：稳定发布
- `archive/*`：历史快照，不参与正常施工

## 相关文档

- `design-source/README.md`：设计语言与 V2 消费入口
- `design-source/SKILL.md`：AI / Agent 消费指南
- `design-source/library-consumption.json`：机器可读消费地图
- `design-source/BUILD_PIPELINE.md`：构建与生成物边界
- `design-source/v2-planning/v2-prd.md`：V2 产品定义
- `design-source/PENPOT_MCP_PLAYBOOK.md`：Penpot MCP 操作手册
- `report/README.md`：Human Guide 与归档说明
