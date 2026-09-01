# T024 · Switch + Timeline Visual Defect Repair

- Status: TODO
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

- [ ] Switch enabled/disabled × on/off 四态一眼可区分，disabled 不等于状态消失。
- [ ] Timeline 竖向 rail 连续，不出现“彩色点 + 几截断线”。
- [ ] Timeline 长文本 / 不同 event 高度下 connector 仍正确。
- [ ] contract 与 preview 保持一致。
- [ ] `npm test`、validate、build 通过；提供 visual evidence。

## Risks / Dependencies

- 前置：T003。
- 只修已知缺陷，不借机扩大到其它组件视觉重构。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Switch four-state evidence:
- Timeline visual evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
