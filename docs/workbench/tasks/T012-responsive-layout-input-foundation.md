# T012 · Responsive Layout + Input Modality Foundation

- Status: TODO
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

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Responsive examples:
- Input examples:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
