# T018 · Representative Four-platform Smoke Harness

- Status: REVIEW
- Target version: V2 first-stage
- Impact: QA / Cross-platform
- Owner: -

## Background

V2 第一阶段不要求一个真实产品同时上线四端，但必须用代表性 contract 证明同一设计意图能被 Android、iOS、Web、小程序通过正式路径解释。

## Goal

建立可重复的 four-platform smoke harness，以代表性 Component / Pattern / environment 组合验证架构闭环。

## Must Read

- T007、T008、T009、T010、T011、T012 的最终结果
- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/four-platform-readiness-audit.md`

## Scope

- 选取代表性 component contracts：Button、Select、Top App Bar、Dialog/Sheet、Search/Filter 等。
- 在四个平台 context 下生成 / 解析 adapter output。
- 验证 task result / state semantics / action hierarchy 等价。
- 覆盖 Safe Area / Host Chrome、pointer/keyboard/touch、reduced motion 等代表场景。

## Out of scope

- 不要求四套生产级组件库全部完成。
- 不以截图像素完全一致作为跨端通过标准。

## Acceptance

- [x] Android、iOS、Web、小程序各至少有一个可重复 smoke path。
- [x] 同一 contract 的关键状态、动作层级和结果语义跨端等价。
- [x] 平台差异只来自 Adapter / Environment 声明。
- [x] smoke 失败能明确指出 contract / adapter / platform context 层级。
- [x] smoke 可在 CI 或本地自动复现。

## Risks / Dependencies

- 前置：T007、T008、T009、T010、T011、T012。

## Implementation record

- Commit / PR: PR #39 (`task/T018-four-platform-smoke-harness` → `dev`); implementation head before evidence-only REVIEW update: `a1e2b5658ee492fa3904241f97ea119a8f6bed0d`.
- Changed paths:
  - `tooling/src/four-platform-smoke.mjs`
  - `tooling/bin/smoke-four-platform.mjs`
  - `tooling/test/four-platform-smoke.test.mjs`
  - `package.json`
  - this task card and work ledger
- Notes:
  - Representative cases: Button, Select, Top App Bar, Bottom Sheet, Search Field.
  - The harness treats T012's `coreSemanticsMutable=false`, `actionHierarchyMutable=false`, `taskResultMutable=false`, `authoritativeStateMutable=false`, and `semanticOrderMutable=false` as the cross-platform invariants rather than requiring pixel-identical output.
  - Each platform path must consume an adapter artifact tied to the same Canonical Design Model V2 source hash and declare `coreSemanticFork=false`.
  - Web covers hybrid pointer + keyboard/focus; iOS/Android cover touch, Safe Area, IME and native back behavior; WeChat covers host-owned Capsule, runtime Safe Area hooks and reduced-motion constraints.
  - Failure evidence is layer-labelled as `contract`, `adapter`, or `platform-context`.
  - `npm run smoke:four-platform` is the explicit local entrypoint; the real-repository smoke also runs inside `npm test`, so the existing T017 PR/dev CI executes it without changing T017's workflow contract.

## Verification evidence

- CI: Design System Build #232, run `33973868517` — success on `a1e2b5658ee492fa3904241f97ea119a8f6bed0d`; 136/136 tests PASS; 10 V2 validation checks PASS with 0 warnings; T017 deterministic CI hard gate PASS (21 checks / 8 traced targets).
- Android / iOS / Web / Mini results: all four representative platform paths PASS in the real-repository T018 test. Web verifies hybrid pointer+keyboard/focus; iOS resolves 44pt touch + Safe Area; Android resolves 48dp touch + predictive back; WeChat keeps Capsule host-owned and validates Safe Area/runtime hooks plus no high-frequency `setData` animation under its motion adapter path.
- Other evidence: focused negative tests intentionally break a Button contract invariant, Web adapter source revision, and Web platform context; failures are respectively localized to `contract`, `adapter`, and `platform-context`.

## Review

- Reviewer: Mira
- Result: REVIEW
- Conclusion: Construction and first CI verification complete. CodeRabbit is rate-limited on this PR, so final acceptance will use independent review plus repository evidence if no automated review becomes available.
- Follow-up: Final review should verify the equivalence proof is architectural (canonical invariants + source-parity + no semantic fork), not a tautological pixel/snapshot comparison.
