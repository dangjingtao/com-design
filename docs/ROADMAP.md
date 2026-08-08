# Com Design System V1 — 5 期计划

## 目标

完成一套可长期演进、可供公司多个移动产品共同消费的 Design System。当前“三创赛”系列 App 是首批消费者之一，但业务主题不进入 Foundation / Core Component。

系统基线：**现代 / 清晰 / 轻快 / 高效率**，默认 **Compact-first + Flat-first**。产品自己的行业气质、活动主题和业务隐喻放在 Pattern / Extension 层处理。

设计资产采用四层模型：

`Primitive → Semantic → Component → Pattern`

Theme / Density / Platform / Motion 是正交模式，不制造组合模式爆炸。

---

## Phase 1 — Foundation & Token Contract ✅

已完成：
- Color / Typography / Spacing / Radius / Border / Size
- Light Theme
- Compact / Comfortable Density
- iOS / Android Touch Target
- Foundation Token Source
- Human-readable Foundation

## Phase 2 — Actions & Forms ✅

已完成：
- Button / Icon Button
- Input / Textarea
- Select / Picker Trigger
- Checkbox / Radio / Switch
- Field Family / validation / focus / touch rules
- Human + Machine contracts

关键决策：组件只消费 Semantic role；Density 不进入组件命名；固定几何按 lazy policy 保留在 Component Contract。

## Phase 3 — Navigation & Information ✅

已完成：
- List Item
- Tabs / Segmented Control
- Top App Bar
- Bottom Navigation
- Section / Divider / Card
- Tag / Badge / Avatar
- Human + Machine contracts

关键决策：Section-before-Card；导航层级角色分离；Brand 承担全局 active identity；Accent 只承担辅助强调。

## Phase 4 — Feedback, Overlay & Progress ✅

已完成：
- Toast / Snackbar
- Banner / Inline Alert
- Dialog / Bottom Sheet
- Loading / Skeleton / Empty State
- Progress / Stepper / Timeline
- Status Composition Pattern
- Search / Search Pattern
- Menu / Action Menu / Overflow Menu / Context Menu
- Overlay stacking / dismissal / interruption rules

关键决策：Feedback 按 interruption cost 分层；一个时刻只允许一个 Blocking Modal；Search 不是普通 Input；Menu 不承担页面导航；产品业务模式不污染公司级 Core。

## Phase 5 — Systemization & Release ✅ RC

已完成：
- Dark Theme overlay
- Standard / Reduced Motion modes
- Density / Platform / Theme / Motion resolution model
- Accessibility / Touch / Focus / Contrast baseline
- Human-readable Design System 总入口
- Canonical machine manifest `contracts/design-system-v1.json`
- Component catalog：33 Core Components + 2 Core Patterns
- PenPot sync / export audit policy
- Versioning / Deprecated / Migration policy
- Product / Domain Extension policy
- Contrast release spot-check
- V1 release checklist

关键决策：
- V1 的机器入口从“单一 token 文件”升级为 Manifest
- `tokens/tokens.json` 继续是 Foundation / Light / Density / Platform source
- Dark Theme 通过 overlay 在 Component tokenRef 解析前替换 Semantic values
- Motion 作为独立正交 Axis，不复制 Component
- Stable release 必须经过独立二审，作者自检只能到 Release Candidate

---

# V1 当前状态

**`1.0.0-rc.1` — 五期设计系统主体完成，进入统一独立二审前状态。**

Human entrypoint：`docs/DESIGN-SYSTEM.md`

Machine entrypoint：`contracts/design-system-v1.json`

Release gate：`release/v1-checklist.md`

Stable 前剩余主要事项：

- 独立二审
- PenPot Formal Spec / Reusable Component Asset 与 V1 Manifest 对齐并导出验收
- 真机 / 实现环境抽查动态字体、Focus、Motion、系统 inset 等平台行为
