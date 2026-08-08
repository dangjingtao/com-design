# 01 Foundations

## 设计方向

Com Design Mobile 是公司的移动端 Design System，不绑定某一个具体产品或业务域。当前“三创赛”系列 App 是第一批重要消费者之一，但业务主题、赛事符号和特定流程都不能反向侵入 Foundation。

系统目标气质：**现代、清晰、轻快、高效率，并保留适度年轻感**。

明确避免：
- 政务 / 教务系统式的沉重蓝灰
- 厚重企业 SaaS
- 电竞霓虹与赛博朋克
- 软萌、奶油化、幼稚卡通
- 满屏圆角 Card + Shadow
- 为单一业务域固化专属视觉隐喻

基础策略：**Compact-first、Flat-first、信息层级优先于装饰。**

---

## Color

### Brand — Electric Indigo

V1 使用偏年轻、清晰的 Electric Indigo 作为品牌主色：

- Brand 500 `#5B5EF7`：主操作、关键选中、核心品牌识别
- Brand 600 `#494CE0`：Light Theme 下的文字链接、需要更强对比的品牌表达
- Brand 700 `#393BBE`：Pressed / 深色品牌表达
- Brand 50 / 100 / 200：Light Theme 下的选中背景、轻提示、柔和品牌层

主色不承担所有状态含义。一个页面通常只需要少量高纯度 Brand 点位。

Dark Theme 不机械复用 Light 的每个具体档位；Semantic role 由 Theme Overlay 重新映射。

### Accent — Cyan

Accent 500 `#16BFD3` 是辅助强调色，不与 Brand 平权。

适用：
- 进度与活跃指示
- 数据可视化
- 局部强调和当前上下文中的次级高亮
- 产品层 Pattern 中经过约束的主题化节奏

不适用：
- 白底正文
- 大面积页面背景
- 主要 CTA
- 全局导航 active identity
- 需要高可读性的细小文字

### Neutral

Neutral 刻意采用轻微冷调，而不是直接复制 Tailwind Gray。目标是让大量高信息密度业务界面保持轻、清楚，同时和 Electric Indigo 有统一冷感。

Light 页面背景优先 `neutral.50`，内容 Surface 优先白色；Dark 由 Theme Overlay 映射到深色 Surface 层级。两种 Theme 都通过分组、边界、留白和层级建立结构，不依赖阴影堆叠。

### Status

Success / Warning / Danger 提供 Background / Main Signal / Text 三类语义。Info 复用 Brand family，不新增一套重复蓝色。

Status 是语义，不是固定色值；Light / Dark 使用各自映射。

---

## Typography

默认使用系统 sans-serif。V1 不依赖自定义字体制造品牌感，视觉性格来自色彩、结构、图标、状态和节奏。

核心角色：
- Caption: 12/18 Regular
- Label Small: 12/16 Medium
- Body Small: 14/20 Regular
- Label: 14/20 Medium
- Body: 16/24 Regular
- Heading Small: 16/22 Semibold
- Heading: 18/24 Semibold
- Title: 24/30 Semibold
- Display: 28/36 Semibold（少用）

原则：
- 高信息密度不等于全局小字号。
- 用字号 + 字重 + 色彩 + 间距共同表达层级。
- 14px 是高频辅助与控件文字；16px 是正文主力。
- 24/28px 仅用于页面标题或强场景，不进入普通业务卡片。
- Medium 500 是设计真相；工具暂不支持时只能 fallback，不能改规范。

---

## Spacing & Density

Primitive spacing 不是“所有 4 的倍数都生成”，而是保留真实需要的值：0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32。

### Compact（默认）
- 普通控件高度：40
- 大控件高度：48
- 水平 padding：12
- 垂直 padding：8
- 内部 gap：8
- 页面内容 inset：16
- Section gap：20

### Comfortable
- 普通控件高度：44
- 大控件高度：56
- 水平 padding：16
- 垂直 padding：12
- 内部 gap：8
- 页面内容 inset：16
- Section gap：24

Density 是模式，不进入 Primitive 名字。组件只消费稳定语义或 Component Contract。

Compact-first 的含义是提高信息效率，不是压缩点击区域、文字可读性或视觉层级。

---

## Radius & Shape

V1 采用“控件稍圆、容器克制、浮层更柔和”的层级：

- Control：8px
- Container：12px
- Overlay / Sheet：16px
- Pill：full

不要求所有容器必须圆角。Section、List、Divider 可以直接用平面分组。

避免 Card → Card → Card 的套娃结构。

---

## Surface & Elevation

**Flat-first。**

常规信息层级优先使用：
1. Surface 色差
2. Border / Divider
3. Spacing / Group
4. Typography hierarchy

Shadow 只用于真实悬浮关系，例如 Menu、Dialog、Sheet 等 Overlay。普通 Card 默认不使用 Shadow。

Elevation 是层级语义，不等于“换一个白色色值”；它由 Surface + Scrim + Shadow / Platform Layer 共同表达。Dark Theme 有独立的 Floating / Modal shadow 映射。

---

## Layout

移动端不使用 Web `max-width` 模型。

基础规则：
- 页面左右内容 inset：16px
- Safe Area 交给系统 / 平台适配层
- 宽屏、平板、折叠屏在 Platform / Adaptive 规范中处理
- 页面布局优先按内容层级组织，不机械套 12 列栅格

---

## Interaction & Accessibility

核心移动状态按真实组件需要选择：

`default / pressed / focused / selected / disabled / loading / error`

Hover 不属于 Mobile-first 核心状态，未来由桌面/指针平台扩展。

视觉尺寸与交互区域分离：
- iOS touch target 最小 44pt
- Android touch target 最小 48dp
- 小图标或紧凑视觉组件必须通过外部 hit area 满足平台约束

Disabled、Placeholder、Tertiary 是不同语义，即使当前可能解析到接近色值，也不能互相借用 Token。

V1 正式支持四个正交 Axis：

- Theme: Light / Dark
- Density: Compact / Comfortable
- Platform: iOS / Android
- Motion: Standard / Reduced

不生成组合模式 Token。

---

## Product / Domain Extension Boundary

Foundation 只定义跨产品稳定的视觉和交互语义。

具体产品可以在 Pattern / Extension 层表达自己的业务性格，例如：
- 阶段 / 流程 / 时间线
- 排名 / 评分 / 统计
- 行业状态与专属标签
- 特定业务数据可视化
- 主题化插图或活动视觉

但这些不能反向修改 Foundation 的 Brand、Status、Typography、Spacing 或基础组件语义。产品需要特殊表达时，应优先新增受约束的 Pattern / Extension，而不是把业务隐喻塞进全公司组件。

---

## Source of Truth

V1 的 **Canonical machine entrypoint** 是：

`contracts/design-system-v1.json`

它统一引用：

- `tokens/tokens.json` — Foundation / Light / Density / Platform
- `tokens/theme-dark.json` — Dark Theme Overlay
- `tokens/motion.json` — Standard / Reduced Motion
- Component Contracts

因此 `tokens/tokens.json` 仍是 Foundation Token 真相，但不再被错误地描述为“整个设计系统唯一文件”。Design System 的唯一机器入口是 Manifest。

Human-readable 文档解释“为什么与如何使用”；PenPot 负责视觉资产与检查；研发 / AI / Agent 从同一 Manifest 解析 Token + Contract。

任何修改需遵守：

`Primitive → Semantic → Component → Pattern`

组件不得直接消费 Primitive。Theme / Density / Platform / Motion 分别覆盖自己负责的语义，不生成组合模式爆炸。
