# 01 Foundations

## 设计方向

Com Design Mobile 面向大学生“三创赛全流程平台”。它不是教务系统的年轻皮肤，也不是消费社交 App。

目标气质：**年轻、科技、潮流、活泼、高效率**。

明确避免：
- 政务蓝 / 教务系统感
- 厚重企业 SaaS
- 电竞霓虹与赛博朋克
- 软萌、奶油化、幼稚卡通
- 满屏圆角 Card + Shadow

基础策略：**Compact-first、Flat-first、信息层级优先于装饰。**

---

## Color

### Brand — Electric Indigo

主色不使用常见模板蓝，V1 采用更年轻、稍偏电光感的 Indigo：

- Brand 500 `#5B5EF7`：主操作、关键选中、核心品牌识别
- Brand 600 `#494CE0`：文字链接、需要更强对比的品牌表达
- Brand 700 `#393BBE`：Pressed / 深色品牌文字
- Brand 50 / 100 / 200：选中背景、轻提示、柔和品牌层

主色不承担所有状态含义。一个页面通常只需要少量高纯度 Brand 点位。

### Accent — Cyan

Accent 500 `#16BFD3` 是节奏色，不与 Brand 平权。

适用：
- 比赛阶段节点
- 进度与活跃指示
- 数据可视化
- 小面积赛事事件高亮

不适用：
- 白底正文
- 大面积页面背景
- 主要 CTA
- 需要高可读性的细小文字

### Neutral

Neutral 刻意采用轻微冷调，而不是直接复制 Tailwind Gray。目标是让大量高信息密度业务界面保持轻、清楚，同时和 Electric Indigo 有统一冷感。

页面背景优先 `neutral.50`，内容 Surface 优先白色；通过分组、边界、留白和层级建立结构，不依赖阴影堆叠。

### Status

Success / Warning / Danger 各提供浅背景、主色、深文字三档。Info 复用 Brand 语义，不新增一套重复蓝色。

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

Density 是模式，不进入 Primitive 名字。组件只消费稳定语义或 Component Token。

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

Shadow 只用于真实悬浮关系，例如 Dropdown、Floating Action、Dialog、Sheet。普通 Card 默认不使用 Shadow。

Raised 是层级语义，不等于“换一个白色色值”；它由 Surface + Elevation 共同表达。

---

## Layout

移动端不使用 Web `max-width` 模型。

基础规则：
- 页面左右内容 inset：16px
- Safe Area 交给系统 / 平台适配层
- 宽屏、平板、折叠屏在后续 Platform / Adaptive 规范中处理
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

---

## “赛事感”如何出现

赛事感来自信息结构，而不是宣传装饰。

推荐语言：
- 阶段 Stage
- 节点 Node
- 轨道 Track
- 排名 Rank
- 编号 Number
- 状态 Status
- 进度 Progress
- 轻量方向性几何元素

避免把奖杯、火箭、灯泡、霓虹光效当作系统性视觉语言。

---

## Source of Truth

唯一机器真相：`tokens/tokens.json`。

Human-readable 文档解释“为什么与如何使用”；PenPot 负责视觉资产与检查；研发端可从同一 Token Source 映射到 iOS / Android / Web 实现。

任何修改需遵守：

`Primitive → Semantic → Component → Pattern`

组件不得直接消费 Primitive。Theme / Density / Platform 分别覆盖自己负责的语义，不生成组合模式爆炸。
