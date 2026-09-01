# T010 · Platform Environment Contract

- Status: PASS
- Target version: V2 first-stage
- Impact: Architecture / Platform
- Owner: -

## Background

跨端差异中有大量内容并不属于 Core Component：Safe Area、Host Chrome、Back、Keyboard / IME、Pointer、Gesture、Overlay dismissal 等必须有正式平台边界。

## Goal

建立四端共享的 Platform Environment Contract，让 Navigation、Overlay、Select 等强平台习惯组件在不改 Core 语义的前提下获得真实运行环境信息。

## Must Read

- T002 任务卡及结果
- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/four-platform-readiness-audit.md`
- `design-source/V2_PLANNING.md`

## Scope

- Safe Area / reserved region。
- system / host chrome，例如微信 Capsule。
- Back / focus / keyboard / IME / pointer / gesture。
- overlay dismissal / system-owned UI。
- accessibility / content-scale hooks。
- schema + examples for four platforms。

## Out of scope

- 不把微信 Capsule 做成 Core Component。
- 不实现具体 Top App Bar / Side Navigation，交给 T020。

## Acceptance

- [x] 四端都能表达环境差异。
- [x] Mini Program Capsule 被定义为 host/platform chrome。
- [x] Environment 不改变 Core Component 的任务结果、状态语义或 action hierarchy。
- [x] 强平台习惯组件可通过该 contract 选择 presentation。
- [x] schema tests 通过。

## Risks / Dependencies

- 前置：T002。
- T009、T014、T018、T020、T021 将消费本卡。

## Implementation record

- Commit / PR: PR #21 (`task/T010-platform-environment-contract` → `dev`); accepted implementation head `ef776de657a88524dbd2816d3fe907038bbebba0` before evidence-only task/ledger commits. Post-merge review hardening was completed by PR #22 (`fix/T010-platform-environment-review-gaps` → `dev`) and merged as `fb03950b12aed9ece4dec9a8c975e03ee0de8483`.
- Changed paths: `design-source/specs/platform-environment-v1.json`, `design-source/schemas/platform-environment-v1.schema.json`, `design-source/specs/design-system-v1.json`, `tooling/src/platform-environment.mjs`, `tooling/test/platform-environment.test.mjs`, `tooling/bin/validate.mjs`, plus this task and work ledger evidence.
- Notes: T010 now exposes adapter-consumable runtime geometry and capability facts for Safe Area / reserved region, system/host chrome, Back, focus, keyboard/IME, pointer, gesture, overlay dismissal, externally-owned UI and accessibility/content-scale hooks. Geometry uses adapter-normalized `layout-unit`, not physical pixels. T010 intentionally does not own T011 motion semantics, T012 responsive/input-state behavior or content-scale reflow, nor T020 concrete navigation components.

## Verification evidence

- CI: Design System Build run #139 (`33501008281`) completed all verification steps successfully on the accepted implementation head. PR #22 hardening passed `verify` on its final head (`33501806869`, head `117e9c0adb87ebae03d99b6d7da7628314df1a2b`). After merge, `dev` commit `fb03950b12aed9ece4dec9a8c975e03ee0de8483` passed `verify` (`33501863979`), `Build Human Guide` and `Publish Human Guide` (`33501863904`).
- Four-platform examples: canonical contract contains exactly one schema-valid runtime snapshot for iOS, Android, Web and WeChat Mini Program. Tests also prove platform identity does not infer pointer capability (`web + no pointer` and `wechat-mini-program + pointer` remain legal snapshots).
- Other evidence: schema rejects negative Safe Area values, unknown environment properties, invalid overlay dismissal values and Com Design-owned host/system chrome; validator checks chrome ↔ reserved-region ownership/reference integrity. WeChat Capsule is explicitly `owner=host`, `kind=host-capsule`, `comDesignOwned=false` and maps to a host-owned reserved region. Manifest promotes both environment contract and schema to canonical sources, and production `npm run validate` consumes them.
- Review hardening: PR #22 closes all three P2 findings left on PR #21 by rejecting duplicate reserved-region identifiers, rejecting `back.available=true` without an actionable mechanism, and hard-gating the canonical top-level environment schema required fields. Regression tests cover each failure mode.

## Review

- Reviewer: Mira
- Result: PASS (final)
- Final independent acceptance: 2026-09-01. Re-reviewed the merged `dev` implementation and PR #22 patch against T010 acceptance criteria instead of inheriting the earlier PASS. No blocking or follow-up defect remains inside T010 scope.
- Conclusion: T010 satisfies the platform-boundary acceptance criteria without widening Core semantics. Environment is a runtime-fact/capability contract consumed by Platform Adapters, not a second Component system. Strong platform-convention components may choose platform/host-appropriate presentation from Environment, while task result, authoritative state, state semantics and action hierarchy remain immutable. The hardening changes only strengthen executable validation; they do not alter the accepted four-platform contract or move T011/T012/T020 responsibilities into T010.
- Follow-up: T009, T014, T018, T020 and T021 may consume this contract as an accepted baseline. T011 and T012 retain their existing ownership boundaries.
