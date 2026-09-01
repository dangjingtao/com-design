# T002 · Cross-platform Platform Model + Axes

- Status: REVIEW
- Target version: V2 first-stage
- Impact: Architecture / Cross-platform
- Owner: -

## Background

V1 当前工程轴主要围绕 iOS / Android。V2 要把 Android、iOS、Web、微信小程序放进同一个正式平台模型，同时避免把平台名直接等同于输入方式或 viewport。

## Goal

建立四端共享的 machine-readable Platform Model，为后续 Environment、Motion、Layout 和 Adapter 提供稳定上下文轴。

## Must Read

- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/four-platform-readiness-audit.md`
- `design-source/V2_PLANNING.md`

## Scope

- 新增 `platform = ios | android | web | wechat-mini-program`。
- 正式定义 viewport、input modality、motion、color scheme、content scale 等正交轴。
- 区分 system/host-owned chrome 与 Com Design-owned UI。
- 建 schema 与有效 / 无效示例测试。

## Out of scope

- 不实现具体平台 Adapter。
- 不把 Safe Area / Back / IME 的完整行为合同塞进本卡，交给 T010。
- 不根据平台名硬推输入模式。

## Acceptance

- [x] 四个平台都能形成合法 context。
- [x] viewport / input / motion / color scheme / content scale 可独立组合。
- [x] 未知平台或非法轴值会被 schema 拒绝。
- [x] Web 不被定义成 pointer-only，小程序不被永久定义成 touch-only。
- [x] Core contract 不因平台差异复制四份。

## Risks / Dependencies

- 前置：无。
- T005、T008-T012、T014、T018 将消费本卡合同。

## Implementation record

- Commit / PR: PR #15; implementation/ledger head `1cac1becc02b5a7a4d8594edfedf2fd63685f1fb`; current branch `task/T002-cross-platform-platform-model`
- Changed paths: `design-source/specs/platform-model-v2.json`, `design-source/schemas/platform-context-v2.schema.json`, `design-source/specs/design-system-v1.json`, `tooling/src/platform-context.mjs`, `tooling/test/platform-context.test.mjs`, `tooling/bin/validate.mjs`, plus this task card and work-ledger status.
- Notes: canonical model now declares iOS / Android / Web / WeChat Mini Program plus six required orthogonal context axes. System chrome and host chrome are explicitly outside Com Design-owned UI. T010 retains detailed environment behavior; T011/T012 retain motion/layout/input behavior; platform adapters remain downstream tasks.

## Verification evidence

- CI: Design System Build run #110 (`33470342602`) — PASS on implementation/ledger head `1cac1becc02b5a7a4d8594edfedf2fd63685f1fb`. Unit tests, `build:all`, accepted-report unchanged check, engineering adapter artifact upload, and Penpot manifest upload all passed.
- Schema tests: `platform-context.test.mjs` covers all four platforms, all 576 legal Cartesian axis combinations, explicit `web + touch` and `wechat-mini-program + keyboard`, invalid enum rejection, unknown-axis rejection, and UI ownership separation.
- Other evidence: repository `validate` now requires canonical `platformModel` and `platformContextSchema` sources and validates model/schema parity before build succeeds; PR diff is limited to the T002 platform contract, validator/tests, manifest integration, and ledger/task evidence.

## Review

- Reviewer: Mira
- Result: REVIEW
- Conclusion: Implementation and deterministic CI evidence are complete. Independent design-system review is still required before PASS; builder does not self-approve.
- Follow-up: T005/T008-T012/T014/T018 may consume this contract after T002 review passes.
