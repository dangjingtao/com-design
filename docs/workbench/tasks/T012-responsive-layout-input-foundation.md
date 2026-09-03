# T012 · Responsive Layout + Input Modality Foundation

- Status: REVIEW
- Target version: V2 first-stage
- Impact: Foundation / Layout / Input
- Owner: -

## Background

V2 需要真正支持 Web desktop/tablet，同时不能把 Web 变成第二套设计系统。布局和输入应由 viewport / modality 驱动，而不是简单按平台名分叉。

## Goal

建立 Responsive Layout + Input Modality Foundation，覆盖 Stack、Center、Grid 与 compact→wide 适配规则。

## Must Read

- T002 任务卡及结果
- `design-source/V2_PLANNING.md`
- `design-source/v2-planning/four-platform-readiness-audit.md`
- `design-source/v2-planning/v2-prd.md`

## Scope

- Stack、Center、Grid foundation contracts。
- viewport classes / responsive policy。
- input modality = touch / pointer / keyboard / hybrid。
- compact / medium / wide 的适配钩子，命名如需调整必须保持语义清晰。
- Container / App Shell / Side Navigation 的上层 hook，不提前把所有候选固化成 Core Component。

## Out of scope

- 不实现完整 App Shell / Side Navigation，交给 T020。
- 不以 `web` 直接等同 `wide + pointer`。

## Acceptance

- [ ] 同一 semantic component 可在窄屏 / 宽屏共享合同。
- [ ] layout decision 由 viewport / input context 驱动。
- [ ] Stack / Center / Grid 有明确机器可读 contract。
- [ ] keyboard / pointer / touch 状态不被平台名硬编码。
- [ ] schema / examples / tests 通过。

## Risks / Dependencies

- 前置：T002。
- T018、T020-T022 依赖本卡。

## Implementation record

- Commit / PR: PR #28 (`task/T012-responsive-layout-input-foundation` → `dev`); initial implementation head `b605fbea99044dde5a9d671e68e55655ebb1afe6`; replayed onto T006-enabled dev baseline `63306b2f4944e864a80497cb077dde1b13564bf5` during independent review.
- Changed paths:
  - `design-source/specs/layout-input-foundation-v2.json`
  - `design-source/schemas/layout-input-foundation-v2.schema.json`
  - `design-source/specs/design-system-v1.json`
  - `tooling/src/layout-input-foundation.mjs`
  - `tooling/test/layout-input-foundation.test.mjs`
  - `tooling/bin/validate.mjs`
  - this task card and work ledger
- Notes: T012 consumes T002 viewport/input/content-scale vocabulary and T010 runtime capability/content-scale hooks. It does not infer layout from platform identity, implement adapters, or promote Container/App Shell/Side Navigation into Core.

## Verification evidence

- Preflight: candidate contract/schema passed an isolated mirror of the repository's current `validateJsonSchemaValue` behavior.
- Focused preflight: 8/8 T012 tests passed before repository write.
- CI: initial Design System Build #172 succeeded before T006 landed. Final replayed-head verification pending.
- Responsive examples: compact touch Web and Mini Program resolve the same Stack layout; wide keyboard Web and iOS resolve the same Grid layout; enlarged wide Web reflows to one-track Stack without changing the semantic task.
- Input examples: touch forbids hover dependency; pointer/hybrid may add hover; keyboard/hybrid require focus-visible; authoritative selected/checked/open state remains modality-independent.

## Review

- Reviewer: Mira
- Result: REVIEW
- Conclusion: independent review found one P2 planning-coverage gap (Stack align/justify, Center dual-axis, Grid adaptive/stable-gap responsibilities) and a concurrent T006 validation-orchestrator integration requirement. Both are corrected on the replayed branch; final gates pending.
- Follow-up: T018 / T020 / T021 / T022 may consume this contract only after T012 reaches PASS.
