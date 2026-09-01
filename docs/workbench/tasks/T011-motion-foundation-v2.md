# T011 · Motion Foundation V2

- Status: TODO
- Target version: V2 first-stage
- Impact: Foundation / Motion
- Owner: -

## Background

V2 已确认 Motion 需要统一语义意图，而不是强迫四端使用完全相同的 CSS 物理参数。Reduced Motion 必须是一等能力。

## Goal

建立 `Motion Intent → Component/Pattern Contract → Platform Motion Adapter` 的机器可读基础。

## Must Read

- T002 任务卡及结果
- `design-source/v2-planning/motion-foundation.md`
- `design-source/v2-planning/v2-prd.md`
- 当前 motion tokens / adapter outputs

## Scope

- 定义 Micro、Enter/Exit、Expand/Collapse、Overlay、Navigation/Spatial、Collection Change、Continuous/Ambient 等语义类别。
- Reduced Motion first-class contract。
- 平台 mapping / interruption / reversibility / capability fields。
- schema、model、focused tests。

## Out of scope

- 不锁死所有 duration / easing 具体数值。
- 不让 Native contract 强制消费 CSS `cubic-bezier()` 字符串。
- 不在本卡改 T007/T008/T009 平台 adapter 文件。

## Acceptance

- [ ] Motion intent 可机器读取。
- [ ] Reduced Motion 有明确降级行为。
- [ ] 四端可以映射不同物理实现但保持意图一致。
- [ ] Mini Program contract 不要求高频 frame-by-frame `setData`。
- [ ] focused tests 通过。

## Risks / Dependencies

- 前置：T002。
- T018 需要本卡作为 smoke 基线。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Motion contract examples:
- Reduced-motion evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
