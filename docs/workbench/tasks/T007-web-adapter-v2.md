# T007 · Web Adapter V2

- Status: TODO
- Target version: V2 first-stage
- Impact: Web / Adapter
- Owner: -

## Background

Web/Tailwind 目前是最成熟工程输出，但 V2 不允许它继续充当其它平台的隐式定义。

## Goal

让 Web 成为从 Canonical Design Model 派生的正式 Platform Adapter，同时保留 Com Design 视觉身份与现有 Tailwind 消费路径。

## Must Read

- T004、T005 任务卡及其实现结果
- `design-source/BUILD_PIPELINE.md`
- `tooling/src/adapters.mjs` / T004 后的新 adapter modules
- `design-source/v2-planning/v2-prd.md`

## Scope

- Web/Tailwind adapter 改为消费 canonical model。
- 明确 Web platform/context evidence。
- 支持 pointer / keyboard / focus 能力表达，不改 Core 语义。
- 清除 platform-neutral contract 中不必要的 CSS 字符串泄漏。

## Out of scope

- 不重写 Human Guide。
- 不替小程序 / Native Mobile 做映射。

## Acceptance

- [ ] Tailwind semantic token consumer path 继续可用。
- [ ] Web adapter 明确目标 platform/context。
- [ ] keyboard/focus/pointer 作为 context 能力而非 Core 分叉。
- [ ] canonical contract 不依赖 DOM/CSS 结构解释。
- [ ] tests、validate、build 通过。

## Risks / Dependencies

- 前置：T004、T005。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Adapter snapshot:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
