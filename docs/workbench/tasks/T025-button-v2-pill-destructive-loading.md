# T025 · Button V2: Pill / Destructive / Loading

- Status: TODO
- Target version: V2 first-stage
- Impact: Component / Action
- Owner: -

## Background

V2 已确认 Button 需要补三类能力：Pill/Capsule shape variant、正式 Destructive semantic、Loading contract。它们必须继续服从 Primary 稀缺与 action hierarchy，而不是把每种状态变成新的视觉噪音。

## Goal

在不破坏现有 Button hierarchy 的前提下补齐 V2 Button contract、实现与 preview evidence。

## Must Read

- T003 任务卡及结果
- `design-source/V2_PLANNING.md` Button section
- `design-source/components/button.json`
- `design-source/preview/component-button.html`
- `design-source/SKILL.md`

## Scope

- Pill / Capsule 作为明确 shape variant，与普通 radius 分离。
- Destructive / Danger 作为正式 semantic action；Success / Warning 不在无证据时扩张为 Button hierarchy。
- Loading：防重复提交、尺寸稳定、spinner + label、spinner-only accessibility、loading ≠ disabled、busy semantics。
- composition priority 与 Primary/Secondary/Tertiary hierarchy 保持一致。

## Out of scope

- 不把品牌色面积扩大成多个 Primary。
- 不把 Success / Warning Button 默认化。
- 不改变全局 Button 40 / 48px 基础尺寸合同，除非发现真实 contract 冲突并先报告。

## Acceptance

- [ ] Pill 与 ordinary radius 可机器区分且视觉可辨。
- [ ] Destructive 仅用于 destructive / irreversible action，不取代普通 Primary。
- [ ] Loading 不导致控件宽高跳变或重复提交。
- [ ] spinner-only 有可访问名称 / busy state。
- [ ] preview / contract / tests 通过，Primary 稀缺规则未回归。

## Risks / Dependencies

- 前置：T003。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Button state matrix:
- Preview / visual evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
