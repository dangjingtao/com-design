# Com Design System V1 — 5 期计划

## 目标

完成一套可长期演进、可供公司多个移动产品共同消费的 Design System。当前“三创赛”系列 App 是首批消费者之一，但业务主题不进入 Foundation / Core Component。

系统基线：**现代 / 清晰 / 轻快 / 高效率**，默认 **Compact-first + Flat-first**。产品自己的行业气质、活动主题和业务隐喻放在 Pattern / Extension 层处理。

设计资产采用四层模型：

`Primitive → Semantic → Component → Pattern`

Theme / Density / Platform 是正交模式，不制造 `Dark-Compact-iOS` 一类组合爆炸。

---

## Phase 1 — Foundation & Token Contract ✅

已完成：
- Color / Typography / Spacing / Radius / Border / Size 基础体系
- Light Theme 语义色
- Compact / Comfortable Density 映射
- iOS / Android Touch Target 约束
- Foundation Token Source `tokens/tokens.json`
- Foundation 人读规范 `docs/01-foundations.md`

验收：Foundation 层级稳定；Semantic 不包含具体组件名；设计方向可以被稳定复用。

## Phase 2 — Actions & Forms ✅

已完成：
- Button / Icon Button
- Input / Textarea
- Select / Picker Trigger
- Checkbox / Radio / Switch
- Field Family / validation / focus / touch 共同规则
- Human-readable spec: `docs/02-actions-forms.md`
- Machine-readable contract: `contracts/actions-forms.json`

关键决策：
- Button 只保留 Regular / Large 两个业务尺寸，Density 决定具体高度
- V1 Input 采用单一 Outlined / Flat 主外观，不同时维护 Filled 套系
- Select 是移动端 Picker Trigger，不伪装桌面网页 dropdown
- Checkbox / Radio 视觉紧凑，但 hit area 独立满足平台约束
- Switch 只用于立即生效的二元状态
- Error 优先绑定 Field，不用 Toast 替代表单错误

验收：组件颜色只消费 Semantic role；Density 不进入组件命名；组件固定几何按 lazy policy 保留在 Component Contract，不提前污染 Foundation。

## Phase 3 — Navigation & Information ✅

已完成：
- List Item
- Tabs / Segmented Control
- Top App Bar
- Bottom Navigation
- Section / Divider / Card
- Tag / Badge / Avatar
- Human-readable spec: `docs/03-navigation-information.md`
- Machine-readable contract: `contracts/navigation-information.json`

关键决策：
- Section 是默认分组方式，Card 只在需要独立容器边界时使用
- List Item 最多三层信息；多行高度由内容自然撑开，不靠固定巨型 Row
- Tabs 服务并列视图，Segmented Control 服务局部模式，Bottom Navigation 只服务顶层目的地
- 全局导航 active 使用 Brand；Accent 只承担局部强调 / 进度 / 数据等辅助角色
- Bottom Navigation 保持 3–5 项并始终显示 Label
- Badge 的 Attention 使用 Status Danger，不借用 Destructive Action 语义
- Avatar 只承担身份，不把认证 / 在线 / 业务状态全部塞进头像本体

验收：信息层级优先于装饰；导航层级之间角色清晰；常规信息组件默认无 Shadow；Card 不成为通用容器；无新增 Foundation Token。

## Phase 4 — Feedback, Overlay & Progress 🚧

计划完成：
- Toast / Snackbar
- Banner / Inline Alert
- Dialog / Bottom Sheet
- Loading Indicator / Skeleton / Empty State
- Progress / Stepper / Timeline
- Status Composition Pattern
- Overlay stacking / dismissal / interruption rules

本期只建立跨产品稳定的反馈、浮层和流程表达能力。具体行业流程、排名、赛事阶段等属于产品 Pattern / Extension，不进入 Core。

## Phase 5 — Systemization & Release

计划完成：
- Density 视觉验证与模式规范
- Dark Mode 架构与首轮映射（若实际需要则落地）
- Accessibility / Touch / Contrast / Motion 基线
- Human-readable Design System 文档总装
- Machine-readable Token + Component Contract 总装
- PenPot 同步包与检查清单
- Versioning / Deprecated / Migration / Changelog 规则
- Product / Domain Extension 接入规则

V1 完成标准：研发、设计、AI/Agent 可以消费同一套设计真相；新增组件不需要绕过 Token Contract；人读文档不是 Demo，也不是 Token 数据库；具体产品可以扩展 Pattern，而不污染公司级 Core。
