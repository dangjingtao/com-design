---
name: com-design-design
description: Use this skill to generate branded mobile interfaces for Com Design Mobile — Electric Indigo, flat-first, compact core UI. Contains design guidelines, tokens, 33 Core Components, four Core Composite Components and six Core UX Patterns.
user-invocable: true
---

# Com Design Mobile Design Skill

Read `README.md` for brand context, then consume `css.json` for structured tokens and `colors_and_type.css` as the runtime CSS variable source. For stable multi-component assemblies, read `COMPOSITE_COMPONENTS.md` and `specs/core-composites.json` before inventing product-local wrappers. For multi-state / multi-page task logic, read `UX_PATTERNS.md` and `specs/core-patterns.json`. Use `preview/core-composite-components.html` and `preview/core-ux-patterns.html` as visual references. For production code, link the token CSS; for visual prototypes, copy preview structures and keep business semantics in Product Extension.

## Quick map

- `README.md` — brand narrative, foundations, component usage notes
- `COMPOSITE_COMPONENTS.md` — human-readable Composite Component guide and Component/Composite/Pattern boundary
- `UX_PATTERNS.md` — human-readable Core UX Pattern guide
- `colors_and_type.css` — runtime CSS variables for color, type, radius, spacing, elevation
- `css.json` — structured token understanding source
- `components.css` — aggregated Core Component CSS extracted from previews
- `components/index.json` — 33 Core Component index
- `components/button.json`, `components/input.json`, `components/list-item.json`, `components/card.json`, `components/tag.json`, `components/bottom-navigation.json` — Core Component contracts for intent and variants
- `preview/component-button.html`, `preview/component-input.html`, `preview/component-list-item.html`, `preview/component-card.html`, `preview/component-tag.html`, `preview/component-bottom-navigation.html` — DOM/CSS source; read preview first, component JSON for intent
- `preview/core-composite-components.html` — visual and interaction reference for 4 Core Composite Components
- `specs/core-composites.json` — canonical machine-readable Composite Component contracts
- `preview/core-ux-patterns.html` — visual composition reference for all six Core UX Patterns
- `specs/core-patterns.json` — canonical machine-readable Core UX Pattern contracts
- `specs/design-system-v1.json` — structured design-system manifest
- `library-consumption.json` — downstream read order

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
- When a screen starts growing local wrappers such as `MobileFilter`, `PageHeader`, `SettingsCard`, first map them against Core and Composite contracts. Reuse or promote only the part that is domain-neutral and stable across products.

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
