# Com Design System V1 — 5 期计划

## 目标

完成一套可长期演进的移动端 Design System。它服务于大学生“三创赛全流程平台”，但本仓库当前只负责设计系统本身，不设计具体业务页面；“向上汇报”等业务界面在独立线程处理。

视觉方向：**年轻 / 科技 / 潮流 / 活泼 / 高效率**。默认 **Compact-first + Flat-first**，避免教务/政务系统感、厚重企业 SaaS、电竞霓虹与幼稚卡通化。

设计资产采用四层模型：

`Primitive → Semantic → Component → Pattern`

Theme / Density / Platform 是正交模式，不制造 `Dark-Compact-iOS` 一类组合爆炸。

---

## Phase 1 — Foundation & Token Contract

完成：
- Color / Typography / Spacing / Radius / Border / Size 基础体系
- Light Theme 语义色
- Compact / Comfortable Density 映射
- iOS / Android Touch Target 约束
- 唯一机器真相 `tokens/tokens.json`
- Foundation 人读规范

验收：Token 无越层引用；Semantic 不包含具体组件名；设计方向可以通过基础样本被识别。

## Phase 2 — Actions & Forms

完成核心交互组件：
- Button / Icon Button
- Input / Textarea
- Select / Picker
- Checkbox / Radio / Switch

重点：状态、可点击区域、错误/禁用、键盘/焦点、密度切换；按真实需求 lazy-create Component Tokens。

## Phase 3 — Navigation & Information

完成：
- List Item
- Tabs / Segmented Control
- Navigation Bar / Top App Bar
- Bottom Navigation
- Card / Section / Divider
- Tag / Badge / Avatar

重点：高信息密度、层级、Leading/Trailing、Flat-first，不把一切装进 Card。

## Phase 4 — Feedback, Overlay & Competition Patterns

完成：
- Toast / Banner / Alert
- Dialog / Bottom Sheet
- Loading / Skeleton / Empty State
- Progress / Step / Timeline
- Competition Stage / Ranking / Status pattern

赛事感来自信息设计、阶段、进度、编号和状态，不依赖奖杯/火箭/灯泡等装饰。

## Phase 5 — Systemization & Release

完成：
- Density 视觉验证与模式规范
- Dark Mode 架构与首轮映射（若实际需要则落地）
- Accessibility / Touch / Contrast / Motion 基线
- Human-readable Design System 文档
- Machine-readable Token + Component Contract
- PenPot 同步包与检查清单
- Versioning / Deprecated / Migration / Changelog 规则

V1 完成标准：研发、设计、AI/Agent 可以消费同一套设计真相；新增组件不需要绕过 Token Contract；人读文档不是 Demo，也不是 Token 数据库。
