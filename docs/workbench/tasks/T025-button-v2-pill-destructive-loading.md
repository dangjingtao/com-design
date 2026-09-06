# T025 · Button V2: Pill / Destructive / Loading

- Status: PASS
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

- [x] Pill 与 ordinary radius 可机器区分且视觉可辨。
- [x] Destructive 仅用于 destructive / irreversible action，不取代普通 Primary。
- [x] Loading 不导致控件宽高跳变或重复提交。
- [x] spinner-only 有可访问名称 / busy state。
- [x] preview / contract / tests 通过，Primary 稀缺规则未回归。

## Risks / Dependencies

- 前置：T003。

## Implementation record

- Commit / PR: branch `task/T025-button-v2-pill-destructive-loading` from `dev`.
- Changed paths:
  - `design-source/components/button.json`
  - `design-source/preview/component-button.html`
  - `design-source/SKILL.md`
  - `design-source/README.md`
  - `tooling/test/button-v2.test.mjs`
- Notes:
  - Button axes are now independent: hierarchy = Primary / Secondary / Tertiary; semantic = default / destructive; shape = standard / pill; size = compact / large; state = default / pressed / loading / disabled.
  - Destructive is no longer a fourth hierarchy level. Primary destructive uses action-destructive fill; lower-fill destructive actions use danger-text semantic foreground.
  - Loading suppresses duplicate activation, preserves entering dimensions, defaults to spinner + label, supports spinner-only only with an accessible name, requires busy semantics, and is explicitly distinct from disabled.
  - Pill uses `radius-pill` without changing the 40 / 48px visual height contract or platform hit-target guidance.

## Verification evidence

- CI: Design System Build #318 — success on REVIEW-state head `7f16285bb55f1518a899090e06e3b800db2f5446`; 222/222 tests PASS, V2 validation 14 checks / 0 warnings, engineering build, Penpot build, accepted-report guard and T017 deterministic hard gate all PASS.
- Button state matrix: hierarchy = Primary / Secondary / Tertiary; semantic = default / destructive; shape = standard / pill; size = compact / large; state = default / pressed / loading / disabled. Focused regressions reject destructive in hierarchy and reject Success / Warning semantic expansion.
- Preview / visual evidence: standard vs pill uses the same 40px compact height; destructive semantic is demonstrated across Primary / Secondary / Tertiary; idle and spinner-label loading share an explicit locked width; spinner-only exposes `aria-busy` + accessible name; loading buttons suppress activation without the disabled attribute; destructive-loading preserves the resolved destructive treatment.
- Cross-platform / downstream evidence: T018 representative four-platform smoke was updated to trace Button semantic/shape/loading invariants and passes; Canonical Model, Agent contract and Penpot all consume the new axes.

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: Final acceptance passed. Button V2 now has orthogonal hierarchy / semantic / shape / size / state axes: Primary remains a scarce hierarchy signal; destructive is explicit semantic intent and composes with Primary / Secondary / Tertiary instead of replacing them; Success / Warning were not expanded without evidence. Loading is a busy, focusable state that suppresses repeated activation, locks entering dimensions, preserves resolved hierarchy/semantic/shape/size, supports spinner + label by default and spinner-only only with an accessible name, and remains distinct from disabled. Pill is an explicit shape variant using radius-pill while preserving the existing 40 / 48px visual size and platform hit-target guidance. Existing Button trait paths were preserved where possible to avoid unnecessary machine-consumer breakage. T018 four-platform smoke now traces these authoritative Button axes and passes. CodeRabbit produced no actionable review thread on the accepted head; Codex repository review was unavailable because its review quota is exhausted, so Mira completed independent final review.
- Follow-up: T026 may consume T025 as the final Button V2 contract. The existing generated-`components.css` extractor gap remains an integration concern and must not be hidden by hand-editing generated output.
