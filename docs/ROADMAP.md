# Com Design System V1 — 5 期计划

## 目标

完成一套可长期演进的移动端 Design System。它服务于大学生“三创赛全流程平台”，但本仓库只负责设计系统本身，不设计具体业务页面；“向上汇报”等业务界面由独立线程消费本系统完成。

视觉方向：**年轻 / 科技 / 潮流 / 活泼 / 高效率**。默认 **Compact-first + Flat-first**，避免教务/政务系统感、厚重企业 SaaS、电竞霓虹与幼稚卡通化。

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
- 全局导航 active 使用 Brand；Accent Cyan 继续只承担赛事节奏
- Bottom Navigation 保持 3–5 项并始终显示 Label
- Badge 的 Attention 使用 Status Danger，不借用 Destructive Action 语义
- Avatar 只承担身份，不把认证/在线/获奖等状态全部塞进头像本体

验收：信息层级优先于装饰；导航层级之间角色清晰；常规信息组件默认无 Shadow；Card 不成为通用容器；无新增 Foundation Token。

## Phase 4 — Feedback, Overlay & Competition Patterns ⏭ Next

计划完成：
- Toast / Banner / Alert
- Dialog / Bottom Sheet
- Loading / Skeleton / Empty State
- Progress / Step / Timeline
- Competition Stage / Ranking / Status Pattern

赛事感来自信息设计、阶段、进度、编号和状态，不依赖奖杯/火箭/灯泡等装饰。

## Phase 5 — Systemization & Release

计划完成：
- Density 视觉验证与模式规范
- Dark Mode 架构与首轮映射（若实际需要则落地）
- Accessibility / Touch / Contrast / Motion 基线
- Human-readable Design System 文档总装
- Machine-readable Token + Component Contract 总装
- PenPot 同步包与检查清单
- Versioning / Deprecated / Migration / Changelog 规则

V1 完成标准：研发、设计、AI/Agent 可以消费同一套设计真相；新增组件不需要绕过 Token Contract；人读文档不是 Demo，也不是 Token 数据库。
