# T016 · Human Guide / Skill / Library-consumption Consistency

- Status: TODO
- Target version: V2 first-stage
- Impact: Docs / Consumption / AI
- Owner: -

## Background

当前 README / SKILL / library-consumption 等入口仍有 Mobile/Web-only 或过时 catalog 信息。V2 machine contracts 稳定后必须消除“不同消费者看到不同 Com Design”的漂移。

## Goal

让 Human Guide、Skill、AI read order、Library consumption 与 V2 canonical contracts / adapters 一致。

## Must Read

- T001、T007、T008、T009、T014、T015 的最终结果
- `design-source/SKILL.md`
- `design-source/library-consumption.json`
- `design-source/README.md`
- root `README.md`
- `design-source/v2-planning/v2-prd.md`

## Scope

- 更新四端定位与 platform adapter 读取路径。
- 组件 / Composite / Pattern 数量从真实 catalog 派生或保持可验证一致。
- AI 指引优先读 canonical machine contract，而非复制 Preview。
- Human Guide / Penpot / Engineering 输出明确为同源下游消费者。

## Out of scope

- 不重做 V1 人类报告视觉。
- 不删除历史 accepted report。
- 不在本卡修改 adapter 语义。

## Acceptance

- [ ] README / SKILL / library-consumption 不再把 Com Design 写成 Mobile-only。
- [ ] 33 Core / 4 Composite / 6 Pattern 等公开事实与 catalog 一致。
- [ ] AI / 研发 / 设计读取路径与 PRD 的 C→B→A consumer priority 不冲突。
- [ ] 不再建议生产实现从 Preview DOM/CSS 反推其它平台。
- [ ] docs links、validate、build 通过。

## Risks / Dependencies

- 前置：T001、T007、T008、T009、T014、T015。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Link / catalog consistency:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
