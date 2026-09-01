# T009 · WeChat Mini Program Minimum Viable Adapter

- Status: TODO
- Target version: V2 first-stage
- Impact: WeChat Mini Program / Adapter
- Owner: -

## Background

微信小程序是 V2 正式目标，但第一阶段成熟度可晚于 Android / iOS / Web。架构上不能继续只有“未来支持”说明，必须有真实生成路径。

## Goal

建立最小可用 Mini Program Adapter，使同一 canonical semantics 能生成可被小程序工程接入的正式产物。

## Must Read

- T002、T004、T005、T010 任务卡及结果
- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/four-platform-readiness-audit.md`
- T004 后 adapter registry

## Scope

- 增加专用 mini-program adapter target / module。
- 生成小程序工程可消费的 semantic tokens / platform metadata。
- 支持 Host Chrome / Safe Area hook、touch、reduced motion 等已定义平台能力。
- build manifest 如实记录 maturity。

## Out of scope

- 不要求本卡完成完整小程序 Core Component package。
- 不手工维护第二套 WXSS 真相源。
- 不复制 Tailwind / DOM / RN 假设。

## Acceptance

- [ ] 存在从 canonical source 自动生成的小程序消费产物。
- [ ] 产物带 platform/context 与 source revision。
- [ ] Host Chrome / Safe Area 等通过 adapter/environment contract 表达。
- [ ] build manifest 如实记录 mini-program 支持成熟度。
- [ ] tests、validate、build 通过。

## Risks / Dependencies

- 前置：T002、T004、T005、T010。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Generated output:
- Mini-program integration smoke:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
