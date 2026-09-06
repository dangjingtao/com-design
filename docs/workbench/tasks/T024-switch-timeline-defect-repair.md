# T024 · Switch + Timeline Visual Defect Repair

- Status: PASS
- Target version: V2 first-stage
- Impact: QA / Component / Preview
- Owner: -

## Background

V2 规划已确认两处真实实现 / Preview 缺陷：Switch disabled-on/off 层级不够清楚；Timeline connector CSS ownership 导致竖线断裂。两者都不需要推翻现有 contract 方向。

## Goal

修复 Switch 与 Timeline 的已知视觉实现缺陷，并补可重复的验收证据。

## Must Read

- T003 任务卡及结果
- `design-source/v2-planning/switch.md`
- `design-source/v2-planning/timeline.md`
- `design-source/components/switch.json`
- `design-source/components/timeline.json`
- corresponding preview files

## Scope

- Switch：disabled-on 仍明显为 On，disabled-off 仍明显为 Off；两者均弱于 enabled，但不用粗暴整体 opacity 抹平状态。
- Timeline：connector 从 current item 连向 next item；最后一项不继续；长文本 / 可变高度保持连续对齐。
- 补四态 Switch 对照与 Timeline 多高度事件的 visual acceptance。

## Out of scope

- 不重新设计 Switch state model。
- 不修改 Timeline 的业务语义。
- 不强行 Card 化 Timeline。

## Acceptance

- [x] Switch enabled/disabled × on/off 四态一眼可区分，disabled 不等于状态消失。
- [x] Timeline 竖向 rail 连续，不出现“彩色点 + 几截断线”。
- [x] Timeline 长文本 / 不同 event 高度下 connector 仍正确。
- [x] contract 与 preview 保持一致。
- [x] `npm test`、validate、build 通过；提供 visual evidence。

## Risks / Dependencies

- 前置：T003。
- 只修已知缺陷，不借机扩大到其它组件视觉重构。

## Implementation record

- Commit / PR: branch `task/T024-switch-timeline-defect-repair` from `dev`.
- Changed paths:
  - `design-source/components/switch.json`
  - `design-source/preview/component-switch.html`
  - `design-source/components/timeline.json`
  - `design-source/preview/component-timeline.html`
  - `tooling/test/switch-timeline-visual.test.mjs`
- Notes:
  - Switch keeps value and availability as independent dimensions; disabled-on uses right-side thumb + muted brand-container treatment, while disabled-off uses neutral disabled treatment. Disabled thumb is muted in both values; no whole-row opacity.
  - Timeline connector ownership moves from the following item to the current non-final event. Inter-event spacing is current-event padding, while the rail stretches with actual content height and continues into the next node.
  - Preview includes four-state Switch comparison, mixed-status variable-height Timeline, clean final termination and reduced-color readability evidence.

## Verification evidence

- CI: Design System Build #306 — success on final substantive head `5b028bf6376cb36f38c1e3e46cb6dc65ab723f78`; 214/214 tests PASS, V2 validation 14 checks / 0 warnings, engineering build, Penpot build, accepted-report guard and T017 deterministic hard gate all PASS.
- Switch four-state evidence: Preview explicitly separates enabled and disabled groups and includes `on`, `off`, `disabled-on`, `disabled-off` evidence samples. Disabled-on retains right-side thumb + muted brand-container track; disabled-off uses neutral disabled track; both use muted thumbs and disabled text without whole-row opacity.
- Timeline visual evidence: Preview uses current-event-owned `::after` connector, stretchable rail, current content padding for inter-event spacing, variable-height long text, clean final termination, and a reduced-color readability sample. No Card wrapper is implied.

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: Final acceptance passed. Switch preserves `off / on` independently from `enabled / disabled`: disabled-off uses a neutral disabled track, disabled-on uses a muted brand-container track, both use disabled text/thumb treatment, and neither relies on whole-row opacity or hover/cursor cues. Timeline now assigns the outgoing connector to each current non-final event; the rail stretches against content height including inter-event spacing, long wrapped content cannot cut the rail, and the final event terminates cleanly. No Switch state-model redesign, Timeline business-semantic change, or Card requirement was introduced. Codex's two valid findings were fixed and resolved. CodeRabbit produced no current actionable finding before final acceptance; Mira independently reviewed the final head.
- Follow-up: The repository still lacks the declared generator for `design-source/components.css`; T024 does not hand-edit that generated downstream artifact. T026 should keep this existing pipeline gap visible during integration acceptance.
