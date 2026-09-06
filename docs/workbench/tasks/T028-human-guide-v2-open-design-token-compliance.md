# T028 · Human Guide V2 Open Design Visual Refresh + Token Compliance

- Status: DOING
- Target version: V2 documentation follow-up
- Impact: Human UI / Visual System / Token Compliance
- Owner: -

## Background

Human Guide 目前仍保留大量 V1 手写展示层样式。虽然 Core Component Preview、Result State、Button V2、Core UX Pattern 等新实现已经大量使用 Com Design token，但 Human Guide 外壳仍存在明显的展示层漂移：

- `culture.css`、`foundation.css`、`premium-gold.css`、`mobile-nav.css` 等存在大量直接 hex / one-off visual values。
- 旧 Human Guide 的视觉语言仍偏历史“报告页”，尚未形成已经确认要采用的 Open Design 风格方向。
- `core-composite-components.html` 等下游 Preview 仍存在较多 `var(--token, #fallback)` 与手写视觉值，需区分“语义 UI 值”与“证据专用尺寸 / 示例数据”后治理。
- T027 将先提供 canonical-driven 的 V2 Human Guide 结构；本卡只在该结构上完成视觉和 token 收口。

## Goal

把当前 V2 Human Guide 做成正式、现代、克制、产品化的设计系统人类入口：视觉方向吸收 Open Design 的高端技术文档 / 产品界面语言，但所有实际设计决策必须映射回 Com Design 自己的 semantic tokens、components 与 layout rules。Open Design 只作为视觉参考，不成为新的 token 或 source of truth。

## Must Read

- T027 Human Guide V2 Canonical Consumption + Versioned Current Entry
- T026 First-week Integration Acceptance / V2 RC Readiness
- `design-source/SKILL.md`
- `design-source/colors_and_type.css`
- `design-source/components.css`
- `design-source/themes/`
- `design-source/components/index.json`
- `design-source/specs/core-composites.json`
- `design-source/specs/core-patterns.json`
- T024 Switch + Timeline Visual Defect Repair
- T025 Button V2: Pill / Destructive / Loading
- T023 State Feedback + Alert/Banner Semantics
- accepted `report/design-system-v1/`（仅作为历史参考，不直接改造）

## Visual direction

- Open Design 是视觉语言参考，不是设计 token 来源。
- 目标气质：克制、现代、专业、轻快、技术感；避免后台 Dashboard 化和“报告 PPT 化”。
- 保持 Com Design 的中文优先、高信息密度、flat-first、Brand 稀缺原则。
- 页面层级优先通过 typography / spacing / neutral surface / divider 建立；不要依靠大面积品牌色、阴影或装饰卡片堆层级。
- Brand / Accent / Status 必须遵守 Com Design semantic meaning；Premium Gold 仅作为明确 opt-in theme / 示例场景，不污染默认 Human Guide shell。
- Open Design 参考中任何不符合 Com Design token / component / accessibility 规则的表现都必须舍弃或重新映射。

## Scope

- 在 T027 的 V2 Human Guide 上重做：
  - global shell / navigation
  - overview / principles / foundations
  - components catalogue + component inspector
  - composite catalogue
  - UX pattern catalogue
  - engineering / consumer / source-boundary sections
  - responsive mobile navigation
- 统一 Human Guide 自身视觉层为 Com Design semantic tokens；不得继续维护另一套手写品牌色、surface、border、text、status、radius、spacing 体系。
- 清理 Human Guide shell 中可由 canonical token 表达的 raw hex、任意 radius、任意 spacing、任意 typography、任意 elevation。
- 为 token compliance 增加可执行检查，至少区分：
  1. **UI semantic styling**：必须使用合法 token；
  2. **token documentation / swatch data**：允许展示真实 token 值；
  3. **evidence-only geometry**：例如 393×852 模拟器、QR、图形示意等，在无 semantic token 可替代时允许显式例外，并需有注释 / allowlist；
  4. **fallback values**：生产/当前 Human Guide shell 不应靠 `var(--token, #hex)` 隐性维护第二套视觉值。
- Human Guide 自身的 buttons / navigation / tags / alerts / selection / result presentation 优先复用或遵循现有 Core Component contract，不另造近似组件。
- Component Preview iframe / embedded evidence 不得因为外壳换风格而改写 canonical component semantics。
- Default / Premium Gold × Light / Dark 涉及 Human Guide 展示的关键 semantic combinations 必须通过现有或新增 contrast evidence。
- Desktop + mobile responsive 验收；窄屏不能只做缩放版桌面布局。
- 输出可重复 visual evidence（截图或 deterministic preview fixture）供 Mira review。

## Out of scope

- 不修改 T027 已确定的 canonical catalog 数量或 source authority。
- 不为了追求 Open Design 外观新增未审批的 Core token / Core Component。
- 不把所有 px 一刀切禁止：真实设备画布、命中区域、边框宽度、证据图形等需按 semantic / evidence 分类判断。
- 不把 Premium Gold 变成默认 Human Guide 主题。
- 不覆盖 accepted V1 report。

## Acceptance

- [ ] V2 Human Guide 视觉已完成 Open Design 方向的正式重构，同时保持明显的 Com Design 品牌与组件语言，而非直接复制外部设计系统。
- [ ] Human Guide shell 的颜色、surface、border、text、status、radius、spacing、type、elevation 可追溯到 Com Design token 或明确 allowlisted evidence-only exception。
- [ ] 不再存在用于正常 Human UI styling 的散落 raw brand/status hex 或隐式 `var(--token, #fallback)` 第二套视觉值。
- [ ] Token compliance 有 deterministic gate；违规可在 CI/validate 中被阻断，而不是靠人工肉眼记忆。
- [ ] Component / Composite / Pattern 页面视觉统一，新增 Result State、Button V2、Incremental Loading 等内容在新 shell 中无旧风格断层。
- [ ] Primary 稀缺、flat-first、Section-before-Card、feedback semantics 等既有 Com Design 规则未因“好看”被破坏。
- [ ] Desktop / mobile responsive visual evidence 通过；导航、目录、组件 Inspector 在窄屏仍可用。
- [ ] Default / Premium Gold × Light / Dark 的相关 Human Guide semantic contrast 检查无 hard failure。
- [ ] accepted V1 report 未修改，T027 current-entry / canonical-consumption gates 继续 PASS。
- [ ] `npm test`、`npm run validate`、Human Guide build / Pages build 通过。
- [ ] Mira 完成 visual + token final review 后方可 PASS。

## Risks / Dependencies

- 前置：T027。
- Open Design 参考不得凌驾于 `design-source/`；出现冲突时以 Com Design canonical contract / token / accessibility / platform rule 为准。
- 视觉整改范围较大，但不得顺手重构 canonical Component / Adapter / Platform contracts；若发现真实 contract bug，单独报告并决定是否派新卡。
- Human Guide token gate 必须允许合法“文档展示值”，否则容易误把 token swatch / code sample 当成 UI 漂移。

## Implementation record

- Commit / PR: branch `task/T028-human-guide-v2-open-design-token-compliance` → `dev`; PR pending.
- Changed paths:
  - `report/design-system-v2/index.html` — productized Human Guide shell with app bar, left navigation, overview/principles/foundations, component workspace + Inspector, composite/pattern lists, consumer map and authority flow.
  - `report/design-system-v2/styles.css` — Human Guide shell rebuilt on Com Design semantic tokens; no raw color, token fallback, ad-hoc radius/type/elevation.
  - `report/design-system-v2/app.js` — canonical contract Inspector, section navigation, responsive sidebar and opt-in Default / Premium Gold × Light / Dark controls.
  - `report/design-system-v2/visual-evidence.html` + `visual-evidence.css` — deterministic four-theme review fixture reusing existing Core Alert/Button presentation evidence.
  - `tooling/src/human-guide-token-compliance.mjs` + bin/test — deterministic token/style gate and machine-readable `dist/human-guide/token-compliance.json`.
  - validation/build/CI integration — Human Guide compliance becomes a repository hard check and retained evidence artifact.
- Notes:
  - Open Design is used only as the visual-language reference: quiet technical-doc/product shell, left navigation, high information density, restrained surfaces, flat-first hierarchy. No Open Design token/value is introduced.
  - Human Guide visual styling uses canonical semantic tokens. Two downstream CSS media-query breakpoints are explicitly allowlisted because CSS media queries cannot consume custom properties; the allowlist is context-scoped and regression-tested.
  - Premium Gold is opt-in and shares the same DOM/component structure; it does not become a parallel Human Guide or a new source of truth.
  - `report/design-system-v1/` remains untouched accepted evidence.
  - T027 canonical 34 Components / 4 Composites / 7 Patterns consumption is preserved; Result State is selected by default in the new Inspector and Incremental Loading remains canonical Pattern 07.

## Verification evidence

- CI:
- Token compliance:
- Visual evidence:
- Responsive evidence:
- Theme / contrast evidence:
- Accepted V1 guard:
- Other evidence:

## Review

- Reviewer: Mira
- Result:
- Conclusion:
