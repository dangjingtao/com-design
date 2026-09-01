# T023 · State Feedback + Alert/Banner Semantics

- Status: TODO
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

- [ ] Empty State 不再作为 generic recoverable-error 容器。
- [ ] Inline Alert / Banner 在无 title 时仍可从结构与 placement 清楚区分。
- [ ] 字段错误继续归 validation，不被全局 feedback 组件抢走。
- [ ] system block / offline / permission 的下一步动作语义明确。
- [ ] contract / preview / focused tests 或 visual evidence 通过。

## Risks / Dependencies

- 前置：T003。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Preview / visual result:
- Contract evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
