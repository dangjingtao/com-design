# T010 · Platform Environment Contract

- Status: TODO
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

- [ ] 四端都能表达环境差异。
- [ ] Mini Program Capsule 被定义为 host/platform chrome。
- [ ] Environment 不改变 Core Component 的任务结果、状态语义或 action hierarchy。
- [ ] 强平台习惯组件可通过该 contract 选择 presentation。
- [ ] schema tests 通过。

## Risks / Dependencies

- 前置：T002。
- T009、T014、T018、T020、T021 将消费本卡。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Four-platform examples:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
