# 05 Systemization & Release

## 目标

Phase 5 不再扩张组件数量。它把前四期收束成一套公司可以长期消费、版本化和扩展的移动端 Design System V1。

本期回答四个问题：

1. **怎么切换 Theme / Density / Platform / Motion，而不复制一套组件。**
2. **怎么证明颜色、触控、状态、动效满足发布基线。**
3. **设计、研发、AI/Agent 如何消费同一套 Source of Truth。**
4. **产品如何扩展业务 Pattern，而不反向污染 Core。**

---

# 1. V1 system model

V1 的稳定层级仍然是：

`Primitive → Semantic → Component → Pattern`

四个正交 Axis：

- Theme：Light / Dark
- Density：Compact / Comfortable
- Platform：iOS / Android
- Motion：Standard / Reduced

禁止生成 `Dark-Compact-iOS-Reduced` 一类组合 Token Set。组件只声明自己消费的语义，运行时由各 Axis 独立解析。

## Resolution order

1. 加载 Foundation `tokens/tokens.json`
2. 选择 Theme；Dark 时应用 `tokens/theme-dark.json` overlay
3. 选择 Density mode
4. 选择 Platform mode
5. 选择 Motion mode
6. 解析 Component Contract
7. Product / Domain Extension 最后组合 Pattern，不允许回写 Core

---

# 2. Theme

## Light

Light 是 V1 的默认基础映射，由 `tokens/tokens.json` 提供。

## Dark

Dark 是正式支持模式，不是简单颜色反转。

原则：

- Page / Surface 保持明确层级，不使用纯黑 + 纯白硬切作为默认视觉。
- Brand 在深色界面中需要重新选择文字和边界映射，不机械复用 Light token value。
- Status 的背景使用深色 tinted surface，文字使用高对比浅色。
- Floating / Modal elevation 在暗背景下使用更强 shadow，同时依赖 surface contrast，不单靠 shadow。
- Placeholder 在 Input surface 上仍需满足正常文字可读性基线。
- Disabled 可以降低强调，但不能消失。

Dark overlay：`tokens/theme-dark.json`。

### V1 compatibility note

早期合同使用 `semantic.light` 作为逻辑 namespace。V1 为避免在发布前制造无收益的大规模文件迁移，Theme Overlay 在解析阶段替换该 namespace 的 Semantic value。

因此：

- Contract 的短引用仍写 `color.text.primary`
- Light 解析为基础 `semantic.light.color.text.primary`
- Dark 先对同一路径应用 overlay，再解析组件

这是 V1 的明确兼容契约，不代表 Theme 被硬编码为 Light。

---

# 3. Density

## Compact — default

适合高信息密度业务界面，是公司移动产品默认密度。

- controlHeight 40
- controlHeightLarge 48
- horizontal padding 12
- vertical padding 8
- section gap 20

Compact 只压缩视觉几何；平台 touch target 不随之缩小。

## Comfortable

用于更强调易点按、内容浏览、弱信息密度场景。

- controlHeight 44
- controlHeightLarge 56
- horizontal padding 16
- vertical padding 12
- section gap 24

## Density invariant

切换 Density 时以下内容不得改变：

- Semantic Color
- Typography role
- 状态含义
- Component role / hierarchy
- Accessibility name / role / state
- Product 信息架构

禁止产品自行造 `small / medium / large` 一套尺寸体系绕过 Density。

---

# 4. Platform

Platform 层只处理平台真实差异，不负责制造两套视觉系统。

## Core difference

- iOS touch target min：44pt
- Android touch target min：48dp
- Safe Area / System Insets：由平台实现层提供
- Back / Escape / system dismissal：遵守对应平台交互习惯
- Native Picker / Date / Time 等平台组件：允许由 Product 选择原生实现，但必须映射到 Core Trigger / Validation / State contract

视觉 Token 不按平台复制；只有真正的行为与系统边界进入 Platform mode。

---

# 5. Motion

Motion Source：`tokens/motion.json`。

## Standard

- Press feedback：120ms
- 普通 State change：180ms
- Overlay enter：260ms
- Overlay exit：180ms
- Emphasis upper bound：320ms

动效只用于解释关系、状态变化、空间进入/退出；不用于给静态页面“加活力”。

## Reduced Motion

Reduced mode：

- 非必要位移、缩放、parallax、shimmer 停止
- 普通状态立即切换
- 不能因为关闭动画而丢失结果、进度或状态提示
- Motion 永远不是成功、失败、选中、进度的唯一信号

Skeleton shimmer 在 Reduced mode 下关闭。

---

# 6. Accessibility release baseline

V1 最低发布基线：

## Touch

- iOS interactive target ≥ 44pt
- Android interactive target ≥ 48dp
- 视觉尺寸可以更小，但 hit area 必须独立扩展

## Text / Contrast

- 普通正文目标 ≥ 4.5:1
- 大文本目标 ≥ 3:1
- 必要的非文本 UI 边界/状态目标 ≥ 3:1
- Disabled 状态不以“完全不可读”为设计目标；关键内容即使 disabled 仍需理解

## Status

颜色不能是唯一状态信号。

Success / Warning / Danger / Selected / Current / Error 必须至少组合以下之一：

- 文案
- Icon / mark
- Shape / position
- Accessible state

## Focus

外接键盘、Switch Control、无障碍输入环境下：

- Focus 可见
- 顺序可预测
- Modal 打开后 focus 进入 Modal
- Modal 关闭后 focus 回到合理触发点
- Menu / Tabs / Selection Control 有可退出路径

## Dynamic text

V1 不承诺所有布局在任意系统字体倍率下完全不重排，但组件禁止以 fixed-height 截断关键正文。多行内容必须自然增高或进入明确滚动区域。

---

# 7. Component governance

一个新组件进入 Core 必须同时满足：

1. 至少两个产品/业务场景具有稳定复用价值，或属于明显基础交互能力。
2. 不能由已有组件 + Pattern 清晰组合解决。
3. 有明确 role / anatomy / states / accessibility / constraints。
4. 不携带某个业务域专有名词作为 Core API。
5. 不直接消费 Primitive。

如果只在一个产品出现，默认进入 Product / Domain Extension，而不是 Core。

---

# 8. Token governance

## Primitive

只表达原始设计值，不承担业务含义。

## Semantic

表达跨组件稳定角色，例如：

- text.primary
- surface.default
- border.focused
- action.primary
- status.warningText

## Component-local geometry

固定几何如果只属于一个组件，可先留在 Component Contract。只有跨多个组件稳定复用后才提升为 Semantic。

## Forbidden

- Component → Primitive
- Product Pattern → 修改 Primitive
- 新建语义只为了绕过已有规范
- 用色值相同作为“两个 Semantic 可以合并”的理由

---

# 9. Source of Truth package

V1 不再把一个 JSON 文件误称为整个设计系统。

**Canonical machine entrypoint：`contracts/design-system-v1.json`。**

它引用：

- Foundation: `tokens/tokens.json`
- Dark overlay: `tokens/theme-dark.json`
- Motion: `tokens/motion.json`
- Actions & Forms contract
- Navigation & Information contract
- Feedback / Overlay / Progress contract
- Search / Menu contract

Human-readable 文档负责解释“为什么、何时、如何使用”；Machine contract 负责可解析约束；PenPot 负责视觉资产。三者必须对齐，但不得各自维护一套独立真相。

---

# 10. PenPot source policy

PenPot 是正式视觉资产载体，但不是 Token 真相的另一份手工副本。

同步规则见：`docs/PENPOT-SYNC.md`。

核心原则：

- Token / Component naming 从机器契约进入 PenPot
- PenPot 导出必须可追溯到 Design System version
- Viewer 中正式规范不得依赖隐藏内部 Frame 才能读懂
- 正式页不允许 overflow / internal overlap / stale token reference
- 视觉规范页和 reusable component asset 分开验收

---

# 11. Product / Domain Extension

业务产品可以：

- 组合 Core Components
- 建立业务 Pattern
- 添加业务状态枚举
- 使用产品主题资产
- 引入特定数据结构 / IA

业务产品不可以：

- 修改 Core Primitive 值来“适配自己”
- 复制 Button / Input 后改成私有版本但仍冒充 Core
- 把业务名称写进公司级 Semantic Token
- 用 Extension 覆盖 accessibility / touch / contrast 基线

详细规范：`docs/EXTENSIONS.md`。

---

# 12. Versioning & migration

V1 发布后使用 Semantic Versioning：

- PATCH：不改变公开设计语义和 API 的修复
- MINOR：向后兼容新增组件、Pattern、Token role
- MAJOR：删除/重命名公开 Token、改变组件 role/state contract、不可兼容的 Theme/Density 行为

Deprecated 必须先标记、给替代方案和迁移期，再删除。

详细规则：`docs/VERSIONING.md`。

---

# 13. V1 release gate

V1 进入独立二审前必须满足：

- Foundation / Component / Pattern 边界清楚
- Light + Dark token mapping 完成
- Compact + Comfortable density mapping 完成
- iOS / Android touch target contract 完成
- Standard + Reduced Motion 完成
- Core component catalog 完整可查
- 所有 machine contract 有 manifest 入口
- 关键 contrast spot-check 通过
- PenPot 同步规范明确
- Extension 规则明确
- Versioning / Deprecated / Migration 明确
- Phase 1–5 作者自检记录齐全

独立二审在此 gate 之后执行，而不是每一期由作者自己假装第二审。
