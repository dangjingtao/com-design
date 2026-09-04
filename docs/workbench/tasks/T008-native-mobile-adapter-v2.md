# T008 · Native Mobile Adapter V2

- Status: PASS
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

- [x] iOS 与 Android 平台语义显式存在。
- [x] 44 / 48 touch policy 映射正确。
- [x] native contract 不强制 CSS `box-shadow` / `cubic-bezier()` 等表现字符串。
- [x] 现有 RN / NativeWind consumer 有清晰兼容或迁移路径。
- [x] tests、validate、build 通过。

## Risks / Dependencies

- 前置：T002、T004、T005。

## Implementation record

- Commit / PR: branch `task/T008-native-mobile-adapter-v2`; PR #30 against `dev`; reviewed code head `2c2324161c13156206276a84b015abef5e060d54`.
- Changed paths:
  - `tooling/src/adapters/native-mobile.mjs`
  - `tooling/src/adapters/registry.mjs`
  - `tooling/src/adapters/renderers.mjs`
  - `tooling/src/design-model.mjs`
  - `penpot/src/parse/css-vars.mjs`
  - `design-source/specs/design-system-v1.json`
  - focused adapter / canonical-model / token-scope regression tests
- Notes:
  - 新增 `native-mobile.contract`，iOS / Android 作为正式 platform/context；React Native / NativeWind 保留为兼容工程消费者，不再充当平台定义。
  - Shadow 转为 offset / blur / spread / RGBA 结构；Motion duration 转毫秒数、easing 转 control points；Typography 使用 platform-system role，不要求 CSS font-family stack。
  - Native adapter 直接消费 Canonical Design Model V2、T010 environment 与 canonical T011 Motion；Motion 在进入 canonical model 前执行 schema / semantic validation。
  - 施工期间发现并修复既有 named CSS scope parser 对“scope 前有注释”解析失败的问题。该缺陷此前使真实 `.platform-android` / `.density-comfortable` scope 为空，导致旧 React Native artifact 的 Android touchMin 实际错误输出为 44；修复后 Native contract 与现有 RN output 均为 48。

## Verification evidence

- CI: Design System Build run `33871358276` (#199) PASS at `2c2324161c13156206276a84b015abef5e060d54`; repository tests / validation / build / report-preservation gate / artifact uploads all passed.
- iOS / Android output sample: `dist/native-mobile/adapter.json` emits iOS `touch.minimum = 44` (`logical-point`) and Android `touch.minimum = 48` (`density-independent-pixel`); Android provenance resolves through canonical `platformAndroid/platform-touch-min`.
- Other evidence: engineering artifact `9936017101` contains native-mobile adapter output, React Native `touchMin: 48`, structured motion/typography/shadow values, and build manifest target `native-mobile`. Automated review raised three findings (Android 48 scope, maturity regression, canonical motion validation); all were fixed and review threads resolved.

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: Independent acceptance passed after fixing the three review findings. Native Mobile now has explicit iOS / Android platform contracts, correct 44/48 touch mapping, native-safe structured presentation values, canonical Motion validation, and a non-lock-in migration path for React Native / NativeWind. The shared CSS-scope fix also closes a pre-existing mismatch between documented Android 48 policy and generated RN artifacts.
- Follow-up: T016/T017/T018 may consume T008 as an accepted dependency. T009 remains the separate WeChat Mini Program adapter and must not reuse Native-specific assumptions.
