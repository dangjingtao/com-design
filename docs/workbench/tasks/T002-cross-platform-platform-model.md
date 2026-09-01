# T002 · Cross-platform Platform Model + Axes

- Status: TODO
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

- [ ] 四个平台都能形成合法 context。
- [ ] viewport / input / motion / color scheme / content scale 可独立组合。
- [ ] 未知平台或非法轴值会被 schema 拒绝。
- [ ] Web 不被定义成 pointer-only，小程序不被永久定义成 touch-only。
- [ ] Core contract 不因平台差异复制四份。

## Risks / Dependencies

- 前置：无。
- T005、T008-T012、T014、T018 将消费本卡合同。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Schema tests:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
