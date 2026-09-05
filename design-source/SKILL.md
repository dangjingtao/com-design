---
name: com-design-design
description: Use this skill to consume Com Design V2 for Android, iOS, Web and WeChat Mini Program. Start from canonical machine contracts, select the target Platform Adapter, and verify implementation evidence. Contains 33 Core Components, 4 Core Composite Components and 6 Core UX Patterns.
user-invocable: true
---

# Com Design V2 Consumption Skill

Com Design V2 is a four-platform system: Android / iOS / Web / WeChat Mini Program. For production work, start from `specs/design-system-v1.json` and the canonical machine contracts. If generated artifacts are available, `../dist/agent/contract.json` is the AI-executable consumer contract, but authority remains in `design-source/`.

Select the target platform/context before implementation. Consume the corresponding Platform Adapter instead of inferring another platform from Web Preview or CSS. Preview files are visual/interaction references only; never treat Preview DOM/CSS as production truth.

## Quick map

- `specs/design-system-v1.json` — canonical manifest and source graph
- `library-consumption.json` — governed consumer priority, read order and four-platform adapter map
- `components/index.json` — canonical 33 Core Components catalog; read `components/{slug}.json` for a component contract
- `specs/core-composites.json` — canonical 4 Core Composite Components
- `specs/core-patterns.json` — canonical 6 Core UX Patterns
- `specs/platform-model-v2.json` — Android / iOS / Web / WeChat Mini Program platform axes
- `specs/platform-environment-v1.json` — Safe Area / Host Chrome / Back / Focus / IME / Pointer / Gesture environment facts
- `specs/layout-input-foundation-v2.json` — responsive / input / content-scale foundation
- `specs/navigation-foundation-v2.json` — shared navigation semantics and platform-context presentation rules
- `specs/motion-foundation-v2.json` — shared motion intent and reduced-motion contract
- `specs/iconography.json` — governed icon registry/provider contract
- `specs/release-governance-v1.json` — hard gate → conditional AI review → Mira judgment → release eligibility
- `../dist/agent/contract.json` — generated AI-readable / executable / verifiable consumer contract
- `../penpot/build/manifest.json` — generated governed Penpot consumer
- `preview/**` — visual reference only; never an upstream or production implementation source

## Platform implementation path

| Target | Contract / consumer path | Rule |
|---|---|---|
| Web | `../dist/tailwind/adapter.json` | Tailwind output is the Web adapter, not a cross-platform definition |
| iOS | `../dist/native-mobile/adapter.json` | NativeWind / React Native may consume the contract but do not define iOS semantics |
| Android | `../dist/native-mobile/adapter.json` | Use explicit Android context and 48dp policy; do not infer from iOS/RN defaults |
| WeChat Mini Program | `../dist/wechat-mini-program/adapter.json` + `tokens.js` | Respect host-owned Capsule / Safe Area / runtime hooks; do not copy Web DOM or RN assumptions |

For AI / Agent implementation, the order is: canonical contract → target platform/context → Platform Adapter → implementation → `npm run validate` / relevant smoke → evidence. Human Guide and Penpot are sibling downstream consumers of the same source.

## Essentials at a glance

- Brand primary `#5B5EF7` Electric Indigo drives the highest-priority actions, active navigation, focus, links and selected state; accent `#16BFD3` is reserved for local emphasis, progress, and data highlights rather than a fifth status color.
- **Brand color is a scarce hierarchy signal, not a generic clickable-state fill.** Secondary actions use neutral subtle surfaces by default; informational containers also prefer neutral surfaces with brand-colored foreground, so repeated actions/status blocks do not turn the screen into one large brand tint.
- Primary Button normally appears once per view or action group for the highest-priority next step. Visible supporting actions use Secondary; low-emphasis actions use Tertiary/text treatment. Do not create several brand-filled buttons merely because several actions are available.
- Radius is `4 / 8 / 12 / 16` plus pill: controls use `8px`, containers use `12px`, overlays use `16px`; pill appears only on compact tags/chips.
- Compact-first density: default control height `40px`, large controls `48px`, bottom navigation `56px`, and spacing tokens are `0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32`.
- Typography uses `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`; scale runs from caption `12px/18px` to display `28px/36px`, with semibold (`600`) reserved for headings, title, and display.
- Flat-first surfaces: components have no default shadow; only two elevations exist (`--com-elevation-floating`, `--com-elevation-modal`) for transient floating layers and modals.
- Cards default to borderless, shadowless grouping containers; add a border only when extra containment is needed, and use sections before cards in list layouts.
- Voice is Chinese-first, professional, neutral, high information density; UI copy is short and direct, with no emoji and status expressed through icon shape plus text.
- **Do not collapse Component, Composite and Pattern into one bucket.** Core Component = independent control/information unit; Composite = stable directly reusable assembly; Pattern = task/state/flow rule that may have more than one valid visual implementation.
- When a product starts growing local wrappers such as `MobileFilter`, `PageHeader`, or `SettingsCard`, first map them against Core and Composite contracts. Reuse or promote only the domain-neutral, cross-product part; platform presentation differences belong in the Platform Adapter.

## Core Composite Components

| Id | Name | Use when |
|---|---|---|
| `carousel` | Carousel | 少量同级内容需要稳定横向浏览、指示与可访问控制 |
| `filterBar` | Filter Bar | 集合页需要 query + filter trigger + draft sheet + active conditions + result feedback |
| `tabbedActionBar` | Tabbed Action Bar | 同级 Tabs 旁需要少量局部 Search / Filter / More 工具动作 |
| `groupedList` | Grouped List | 设置 / 服务入口等多个相关 List Item 需要共享一个安静的堆叠 Surface |

Composite 视觉参考：`preview/core-composite-components.html`。

关键交互约束：

- Carousel 默认不自动播放；启用后至少 5 秒、可暂停、Reduced Motion 下停止或降级。
- Filter Bar 的 committed truth 属于集合页面；Sheet 只持 draft。Sheet 内 Apply 可以是该 action group 的唯一 Primary，Filter Trigger 仍是工具动作。
- Tabbed Action Bar 在窄屏通常最多保留 2 个局部工具动作；额外动作进入 Overflow 或更合适的 Top App Bar，不能靠缩小 Tabs 点击区硬挤。
- Grouped List 的导航行整行可点击；Switch 行不要再默认叠 Chevron；Leading icon 默认中性，不给每一行都铺品牌浅底。

## Core UX Patterns

| Id | Name | Use when |
|---|---|---|
| `statusComposition` | Status Composition | 状态需要解释、证据或恢复动作，而不仅是一个 Tag |
| `searchPattern` | Search Pattern | 搜索任务需要查询、结果状态和返回保持 |
| `collectionFilter` | Collection Filter | 移动集合需要关键词、筛选浮层、已生效条件和结果反馈；优先检查 `Filter Bar` Composite |
| `stateToAction` | State to Action | 权限、资格、生命周期、审核等状态决定当前可执行动作 |
| `intentContinuity` | Intent Continuity / Handoff | 登录、授权、跨系统流程会暂时打断原任务 |
| `contextualNextStep` | Contextual Next Step | 长流程需要明确当前上下文、进度和唯一下一步 |

## Components

| Slug | Name | Insight |
|---|---|---|
| button | Button | 主操作使用 Electric Indigo；Secondary 默认中性浅底；40px 紧凑，无阴影，Primary 作为稀缺层级信号 |
| input | Input | 描边输入框，字段级校验优先，readonly 与 disabled 语义分离 |
| list-item | List Item | 信息行，48px 最小高，section-before-card；多行相关入口优先组合成 Grouped List，而不是每行套 Card |
| card | Card | 默认无边框无阴影容器，边框仅在需要强化收纳时使用 |
| tag | Tag | 色调药丸标签，Accent Cyan 不充当第五种状态色 |
| bottom-navigation | Bottom Navigation | 56px 底栏，Brand 为激活色，3-5 个目的地 |
