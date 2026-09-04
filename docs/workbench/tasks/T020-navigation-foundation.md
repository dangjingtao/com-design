# T020 · Navigation Foundation

- Status: PASS
- Target version: V2 first-stage
- Impact: Navigation / Component / Cross-platform
- Owner: -

## Background

V2 已确认 Top App Bar、Side Navigation / Rail、递归多级导航需要共享一个跨端导航模型；微信小程序 Capsule / Host Chrome 不进入 Core。

## Goal

建立能映射 wide Web、compact mobile 与 Mini Program host constraints 的 Navigation Foundation。

## Must Read

- T003、T010、T012、T013 任务卡及结果
- `design-source/V2_PLANNING.md` navigation sections
- `design-source/components/top-app-bar.json`
- `design-source/components/bottom-navigation.json`
- `design-source/v2-planning/v2-prd.md`

## Scope

- Top App Bar 与 Platform Reserved Region / Host Chrome 的正式关系。
- Side Navigation expanded、Rail compact 的 responsive mapping。
- recursive `children[]` 多级导航模型，不硬限制两层。
- active destination / active ancestor / expansion state 分离。
- wide→medium→mobile mapping contract。
- icon action 消费 T013 registry。

## Out of scope

- 不把 App Shell 所有布局职责塞入 Navigation Component。
- 不把微信 Capsule 画成 Core Component。
- 不复制 Academy 产品业务结构；其代码只作为 read-only evidence。

## Acceptance

- [x] recursive nav model 支持真实多级结构。
- [x] parent destination 与 disclosure hit target 可分离。
- [x] Side Nav / Rail / mobile destination mapping 有明确规则。
- [x] Top App Bar 可在微信 host reserved region 下保持安全标题 / action 区域。
- [x] keyboard / touch / a11y 规则可由 platform/input context 消费。
- [x] focused tests / preview evidence 通过。

## Risks / Dependencies

- 前置：T003、T010、T012、T013。

## Implementation record

- Commit / PR: PR #34 (`task/T020-navigation-foundation` → `dev`); accepted implementation head `c01cf735e3eedb356cdd0f43e42b43abaeed2295` before evidence-only task/ledger commits.
- Changed paths:
  - `design-source/specs/navigation-foundation-v2.json`
  - `design-source/schemas/navigation-foundation-v2.schema.json`
  - `design-source/components/top-app-bar.json`
  - `design-source/components/bottom-navigation.json`
  - `design-source/preview/navigation-foundation.html`
  - `design-source/specs/design-system-v1.json`
  - `tooling/src/navigation-foundation.mjs`
  - `tooling/src/design-model.mjs`
  - `tooling/src/validation-orchestrator.mjs`
  - `tooling/src/agent-contract.mjs`
  - focused Navigation / Canonical Model / Validation Orchestrator regression tests
- Notes:
  - 建立 canonical `com-design:navigation-foundation:v2`，Navigation Model 使用 recursive `children[]`，不恢复旧的“两层上限”。
  - `activeDestinationId`、derived `activeAncestorIds` 与 `expandedNodeIds` 分别表达 destination / ancestor / disclosure；可导航 parent 可以在 active 的同时保持 expanded，destination 与 disclosure hit target 始终分离。
  - responsive contract：wide → expanded Side Navigation；medium → Navigation Rail compact candidate；compact 下 3–5 稳定一级目的地优先 Bottom Navigation，深层/大量目的地进入 Drawer / Sheet multi-level navigation。
  - 未为了完成卡片新增 `side-navigation` Core Component；现有 33 Core Component catalog 保持不变。Side Navigation / Rail 当前是 Navigation Foundation presentation / composite candidate，App Shell 仍保持独立布局职责。
  - Top App Bar 通过 T010 Platform Environment 消费 Safe Area / reserved region / Host Chrome；微信 Capsule 保持 `owner=host`、`comDesignOwned=false`，不是 Core anatomy。
  - Navigation icon action 只接受 T013 stable icon names，并用 strict resolution 拒绝缺失 icon，不允许 canonical 引用静默 fallback 到 `core.help`。
  - keyboard / touch / focus-visible / accessible-label 规则消费 T012 input contract；Agent Contract 仅按 explicit viewport 选择 navigation presentation，不以 platform identity 猜布局。
  - Preview 深层级缩进使用 token 组合，不以随手 literal 递增。

## Verification evidence

- CI: Design System Build #215 (run `33898297456`) PASS at accepted head `c01cf735e3eedb356cdd0f43e42b43abaeed2295`; unit tests、build、accepted report preservation、engineering/Penpot artifact upload 全部通过。
- Engineering artifact: `9946606493`。真实 `design-model-v2.json` 暴露 Navigation Foundation id/schema/provenance；`validation/evidence.json` 为 10/10 hard gates PASS、0 warning，其中 `navigation-foundation` hard gate PASS，sample tree depth=4，Host Chrome Core ownership=false；Agent catalog 同步暴露 `com-design:navigation-foundation:v2`。
- Wide / mobile / mini examples:
  - wide Web / keyboard → `side-navigation-expanded`
  - medium Web / hybrid → `navigation-rail-compact`
  - compact iOS / touch → Bottom Navigation + Drawer/Sheet multi-level
  - compact WeChat / reduced motion → host-aware Top App Bar + Drawer/Sheet multi-level；引用真实 T010 `wechat-mini-program-runtime` 与 `wechat-capsule-region`
- Accessibility evidence: focused tests证明 touch 不依赖 hover；keyboard/hybrid 保留 focus-visible；parent destination/disclosure 可分别操作；Rail icon-only item 需要 accessible label；Top App Bar action 通过 T013 interactive accessible-name gate。
- Review fixes:
  - CI #211 暴露 manifest 漏写 `navigationFoundationMapped` release gate，已修复。
  - CI #212 暴露 T013 默认 fallback 会让错误 canonical icon 逃过验证，已改 strict resolution；同时 validation-orchestrator 从 9 个 hard gate 正式扩展为 10 个。
  - Codex review 提出 3 项：release gate、strict icon、active parent 可保持 expanded。三项均确认有效并完成修复，review threads 已 resolve。
  - CodeRabbit 对 PR #34 最终给出 4 条 actionable comments：active parent + expanded state 与 sample-tree depth 两项在 review 返回前已于 accepted head 修复；preview 语义控件与 invalid T013 dependency error composition 两项由 follow-up PR #35 修复并新增 regression。

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: T020 满足全部验收条件，并经 PR #35 完成 CodeRabbit follow-up hardening。Navigation Foundation 已成为 canonical machine contract，并进入 Canonical Design Model、Validation Evidence 与 Agent Contract；递归、多端 presentation、Host Chrome 边界及 input/a11y 均有真实 machine evidence。Preview 交互证据现使用可键盘操作的 link/button，且 validator 在 T013 dependency 非法时仍返回可组合错误。实现没有把微信 Capsule、App Shell 或未经验证的 Side Navigation API 误升为 Core Component。
- Follow-up: T026 总验收应把 Navigation Foundation 纳入 V2 RC readiness；后续若 Side Navigation / Rail 在多个产品形成稳定 anatomy/API，再按 composite promotion rule 决定是否提升为独立 Core Composite。
