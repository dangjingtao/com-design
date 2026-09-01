# T008 · Native Mobile Adapter V2

- Status: TODO
- Target version: V2 first-stage
- Impact: iOS / Android / Adapter
- Owner: -

## Background

当前 NativeWind / React Native 输出能消费 tokens，但 V2 需要把 iOS / Android 作为正式平台语义，而不是把 RN 当成平台本身；同时避免 CSS-shaped shadow / motion / font-family 值泄漏到原生 contract。

## Goal

建立 iOS / Android 共用语义、平台可自然实现的 Native Mobile Adapter，并保留现有 RN / NativeWind 作为工程消费者。

## Must Read

- T002、T004、T005 任务卡及结果
- `design-source/BUILD_PIPELINE.md`
- 当前 RN / NativeWind adapter 代码
- `design-source/v2-planning/v2-prd.md`

## Scope

- 显式 iOS / Android platform contexts。
- 44 / 48 touch policy 的平台映射。
- shadow / motion / typography 等转换为原生可消费结构。
- 保持 NativeWind / RN migration path。

## Out of scope

- 不把 React Native 定义成 Com Design 唯一移动实现。
- 不在本卡实现具体业务组件库。

## Acceptance

- [ ] iOS 与 Android 平台语义显式存在。
- [ ] 44 / 48 touch policy 映射正确。
- [ ] native contract 不强制 CSS `box-shadow` / `cubic-bezier()` 等表现字符串。
- [ ] 现有 RN / NativeWind consumer 有清晰兼容或迁移路径。
- [ ] tests、validate、build 通过。

## Risks / Dependencies

- 前置：T002、T004、T005。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- iOS / Android output sample:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
