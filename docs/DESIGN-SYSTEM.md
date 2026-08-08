# Com Design Mobile — Design System V1

Com Design Mobile 是公司级移动端 Design System。它提供稳定的 Foundation、Core Component、Core Pattern 与扩展边界，供不同产品共同消费。

当前版本：**1.0.0-rc.2**。

本文件是 **Human-readable 入口**。机器入口见 `contracts/design-system-v1.json`。

---

## 1. Foundation

见 `docs/01-foundations.md`。

核心原则：

- Modern / Clear / Light / Efficient
- Compact-first
- Flat-first
- Hierarchy before decoration
- Semantic role before literal value
- Product extension does not mutate Core

系统层级：

`Primitive → Semantic → Component → Pattern`

正交模式：Theme / Density / Platform / Motion。

RC2 在 Foundation 内新增 theme-independent `semantic.shared`，只承载已被多个 Core Component 证明稳定复用的共享语义。目前只进入：

- Icon visual size：16 / 20 / 24
- Loading Indicator visual size：16 / 24

这不是“通用数字仓库”。Checkbox、Radio、Switch、Stepper、Progress、Avatar 等即使出现相同数值，也不会因为数值一样就错误共享 Icon Token。

### Iconography

见 `docs/01b-iconography.md` 与 `contracts/iconography.json`。

Generic UI icon 默认来源为 Lucide；Core 统一 Outline、24×24 source grid、2px stroke、round cap/join。图标颜色继续消费既有 Semantic Color，不建立平行的 Icon Color Palette。

Icon-only action 的视觉尺寸与平台 hit area 分离。

---

## 2. Actions & Forms

见 `docs/02-actions-forms.md`。

Core：

- Button
- Icon Button
- Input
- Textarea
- Select / Picker Trigger
- Checkbox
- Radio
- Switch

重点：可点击区域与视觉尺寸分离；Field-level validation 优先；Input / Read-only / Disabled 语义分离。

---

## 3. Navigation & Information

见 `docs/03-navigation-information.md`。

Core：

- List Item
- Tabs
- Segmented Control
- Top App Bar
- Bottom Navigation
- Section
- Divider
- Card
- Tag
- Badge
- Avatar

重点：Section-before-Card；导航层级不可互相冒充；高信息密度不靠缩字和 Card 套娃实现。

---

## 4. Feedback, Overlay & Progress

见 `docs/04-feedback-overlay-progress.md`。

Core：

- Toast
- Snackbar
- Inline Alert / Banner
- Dialog
- Bottom Sheet
- Loading Indicator
- Skeleton
- Empty State
- Progress Indicator
- Stepper
- Timeline

Pattern：Status Composition。

重点：Feedback 按 interruption cost 分层；一个时刻最多一个 blocking modal；Progress / Stepper / Timeline 角色严格分开。

RC2 进一步明确：Base Status chroma 是 marker semantic，不是所有背景上的万能 foreground。Tinted status surface 上的必要图形默认使用对应 `*Text` semantic；inverse Toast surface 使用 inverse foreground，由图标形状 + 文案共同表达状态。

---

## 5. Search & Menu

见 `docs/04b-search-menu.md`。

Core：

- Search Field
- Menu
- Menu Item

Pattern：Search Experience。

Search 不是普通 Input 的别名；Menu 承接上下文动作，不承担页面 IA。

RC2 修复了 Search idle placeholder 在 `surface.subtle` 上的真实 Light / Dark 对比度，而不是只检查 placeholder 在白底上的孤立 Token 对比度。

---

## 6. Systemization & Release

见 `docs/05-systemization-release.md`。

V1 正式支持：

- Theme：Light / Dark
- Density：Compact / Comfortable
- Platform：iOS / Android
- Motion：Standard / Reduced

Canonical machine entrypoint：`contracts/design-system-v1.json`。

---

## 7. Component catalog

V1 Core 共 **33 个组件 + 2 个 Core Pattern**。

### Actions & Forms — 8

Button / Icon Button / Input / Textarea / Select / Checkbox / Radio / Switch

### Navigation & Information — 11

List Item / Tabs / Segmented Control / Top App Bar / Bottom Navigation / Section / Divider / Card / Tag / Badge / Avatar

### Feedback / Overlay / Progress — 11

Toast / Snackbar / Alert / Dialog / Bottom Sheet / Loading Indicator / Skeleton / Empty State / Progress Indicator / Stepper / Timeline

### Search / Menu — 3

Search Field / Menu / Menu Item

### Core Patterns — 2

Status Composition / Search Experience

V1 不追求“所有 UI 名词都有组件”。Carousel、FAB、Data Table、Rich Text Editor、Navigation Rail 等必须在真实跨产品需求出现后再评估进入 Core。

---

## 8. Source package

机器消费从 `contracts/design-system-v1.json` 开始，按 manifest 加载：

- `tokens/tokens.json` — Foundation / Light / Density / Platform + theme-independent shared semantics
- `tokens/theme-dark.json` — Dark Theme Overlay
- `tokens/motion.json` — Standard / Reduced Motion
- `contracts/iconography.json` — Icon source / visual language / accessibility / custom-icon admission
- 四组 Component Contract
- `contracts/core-patterns.json` — canonical Core Pattern contract

`tokens/tokens.json` **不是整套 Design System 的单文件 Source of Truth**。Canonical machine entrypoint 只有 Manifest。

设计人员消费 Human-readable spec + PenPot Visual Asset；研发和 Agent 消费 Manifest + Token + Contract。

任何一方不得维护一套脱离 manifest 的“自己的设计系统真相”。

---

## 9. PenPot

同步与验收见 `docs/PENPOT-SYNC.md`。

PenPot 的职责：

- Formal Spec Visual
- Reusable Component Asset
- State / Variant visual verification
- Theme / Density visual specimen

PenPot 不负责重新发明 Token 命名。

当前 PenPot 批量实现应等待 RC Foundation Hardening 收口后再与最新 Manifest 对齐，避免把旧的 literal geometry 和错误 contrast pairing 固化进资产库。

---

## 10. Product / Domain Extension

见 `docs/EXTENSIONS.md`。

产品可以组合 Core 建业务 Pattern，但不允许把业务状态、活动主题、行业词汇写回公司级 Primitive / Semantic / Core Component API。

---

## 11. Versioning / RC Hardening

见 `docs/VERSIONING.md`。

RC2 P0 修正记录：`reports/foundation-hardening-p0.md`。

Stable V1 发布前仍需：

- P1 Foundation Hardening
- 统一独立二审
- PenPot round-trip / reusable metadata gate
- 真机平台行为抽查

Release Candidate 不因作者自检而自动成为 Stable。
