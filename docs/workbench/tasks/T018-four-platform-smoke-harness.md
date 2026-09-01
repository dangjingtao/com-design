# T018 · Representative Four-platform Smoke Harness

- Status: TODO
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

- [ ] Android、iOS、Web、小程序各至少有一个可重复 smoke path。
- [ ] 同一 contract 的关键状态、动作层级和结果语义跨端等价。
- [ ] 平台差异只来自 Adapter / Environment 声明。
- [ ] smoke 失败能明确指出 contract / adapter / platform context 层级。
- [ ] smoke 可在 CI 或本地自动复现。

## Risks / Dependencies

- 前置：T007、T008、T009、T010、T011、T012。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Android / iOS / Web / Mini results:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
