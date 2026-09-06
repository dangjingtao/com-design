# T023 · State Feedback + Alert/Banner Semantics

- Status: PASS
- Target version: V2 first-stage
- Impact: Component / UX Pattern / Feedback
- Owner: -

## Background

V2 已确认 Empty State 不能继续承担 generic failure；Inline Alert 与 Banner 也不能只靠“宽一点”区分。反馈层需要重新明确语义、结构与 placement。

## Goal

把 Empty / Result / Blocking State 与 Inline Alert / Banner 的责任边界正式化，并修正对应 contract / preview 表达。

## Must Read

- T003 任务卡及结果
- `design-source/v2-planning/state-feedback.md`
- `design-source/v2-planning/alert-banner.md`
- `design-source/components/empty-state.json`
- `design-source/components/alert.json`
- related previews

## Scope

- Empty State 仅表示 absence / no-results / no-data。
- Result / Outcome 用于 success/error/warning/info/pending outcome。
- Blocking State 作为 system block/offline/permission 等候选能力，按现有证据决定 contract 形式。
- Inline Alert = local contextual feedback；Banner = page/region-level persistent notification。
- Banner 在 placement、layout、actions、dismiss、geometry 上与 Inline Alert 有可见差异。

## Out of scope

- 不把短时成功反馈改成 Banner；Toast/Snackbar 继续承担短反馈。
- 不用 color-only 区分状态。
- 不把宿主系统通知混进 content Banner。

## Acceptance

- [x] Empty State 不再作为 generic recoverable-error 容器。
- [x] Inline Alert / Banner 在无 title 时仍可从结构与 placement 清楚区分。
- [x] 字段错误继续归 validation，不被全局 feedback 组件抢走。
- [x] system block / offline / permission 的下一步动作语义明确。
- [x] contract / preview / focused tests 或 visual evidence 通过。

## Risks / Dependencies

- 前置：T003。

## Implementation record

- Commit / PR: PR #44 (`task/T023-state-feedback-alert-banner` → `dev`); final substantive implementation head before evidence-only REVIEW update: `426425c54512e7afff60b644f028d8837156beef`.
- Changed paths:
  - `design-source/components/empty-state.json`
  - `design-source/components/result-state.json` + preview + catalog entry
  - `design-source/components/alert.json` + preview
  - `design-source/specs/state-feedback-v2.json` + schema
  - `design-source/specs/core-patterns.json`
  - manifest / library read order / human docs / SKILL catalog facts
  - `tooling/src/state-feedback.mjs`
  - Canonical Design Model / validation orchestrator integration
  - focused, Agent, Penpot, source-integrity and downstream count tests
- Notes:
  - Result State is promoted from V2 candidate to the 34th Core Component. Current formal catalog: 34 Components / 4 Composites / 7 Patterns.
  - Empty State is absence-only: first-use / no-data / no-results. Generic recoverable failure is explicitly excluded.
  - Feedback selection is deterministic: absence → Empty; task outcome → Result; local persistent → Inline Alert; page/region persistent → Banner; transient acknowledgement → Toast; transient actionable → Snackbar; field error → field/form validation; external block → Blocking State semantics.
  - Blocking State is intentionally NOT promoted to an 8th Core Pattern. It remains a shared semantic capability requiring cause + scope + next action for system-block/offline/permission/unavailable/maintenance/not-found.
  - Inline Alert and Banner share tone vocabulary but differ by scope, structural placement, geometry, action layout and dismiss policy; same-tone titleless warning previews prove the distinction.
  - Preview markup remains downstream visual evidence and is deliberately excluded from Canonical Design Model source/hash validation.
  - `components.css` is a generated downstream artifact marked DO NOT EDIT MANUALLY; its extractor is not present in the repository, so T023 does not hand-edit it or falsely claim production component-library generation.

## Verification evidence

- CI: Design System Build #293 — success on final substantive head `2a143256d7e730c5857a3a8adc2b5a4c4a5aecb1`; repository tests, V2 validation 14 checks / 0 warnings, engineering build, Penpot build, accepted-report guard, governance dry-run and T017 deterministic hard-gate enforcement all PASS.
- Preview / visual result: Empty State preview contains only first-use/no-data/no-results; Result State preview covers success/error/pending; Alert preview compares titleless warning Inline Alert inside local content flow against titleless warning Banner below a page header, with visibly distinct geometry/action placement. Preview evidence is checked by repository validation, not Canonical Model construction.
- Contract evidence: the 14th hard gate `state-feedback` validates feedback selection, Result State contract, field-validation ownership, Blocking next actions, Inline/Banner structural separation and preview evidence. Acceptance examples are executable against the resolver rather than ID-only fixtures. Agent and Penpot tests prove Result State/feedback semantics flow to downstream consumers.

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: Final design-system acceptance passed. Result State has a stable cross-product outcome anatomy and is justified as the 34th Core Component; it does not absorb field/form validation or environment/system blocking. Empty State is now absence-only. Banner selection is driven by page/region scope rather than severity, while Inline Alert remains local contextual feedback. Blocking State has shared cause/scope/next-action semantics but insufficient evidence for a new Core Pattern, so the catalog correctly remains at 7 Patterns. Codex's three valid findings were fixed and resolved. CodeRabbit's valid undefined-token and stale-SKILL findings were fixed; its requirement-ID finding was reviewed against accepted governance and rejected because manifest requirement names are declarative rather than check IDs. Final substantive build #293 passed after schema tightening and review fixes.
- Follow-up: T026 should audit generalized `releaseGates.requirements → validator/review evidence` traceability across all accepted requirements (not only T023) and record the existing generated-`components.css` extractor gap without treating that downstream artifact as canonical.
