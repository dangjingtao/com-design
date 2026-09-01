# T015 · Penpot as Governed Downstream Consumer

- Status: TODO
- Target version: V2 first-stage
- Impact: Penpot / Tooling / Design
- Owner: -

## Background

V2 已确认 Penpot 是正式设计消费端，但不是第二真相源。当前 Penpot compiler 已有 token / component manifest 能力，需要跟 V2 canonical model 对齐。

## Goal

让 Penpot 从 canonical source / normalized model 生成或同步可编辑设计资产，并保持可追溯、单向治理边界。

## Must Read

- T003、T005 任务卡及结果
- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/v2-prd-q3-ai-agent.md`
- `design-source/PENPOT_MCP_PLAYBOOK.md`
- `penpot/src/**`

## Scope

- Penpot compiler/sync 消费 V2 canonical contract。
- Token / Component / Variant / State / Platform Context 尽可能保留 traceability。
- 保持 Penpot editable workspace 能力。
- conflict resolution 明确回到 canonical source。

## Out of scope

- 不开放自由的 Penpot → canonical 双向写入。
- 不把 Penpot export 作为 engineering adapter 的上游。

## Acceptance

- [ ] Penpot build 来自 canonical source / normalized model。
- [ ] 设计资产可追溯到 contract / source revision。
- [ ] Penpot 与工程输出冲突时 canonical source 明确优先。
- [ ] 当前 Penpot build/sync 不回归。
- [ ] tests、validate、build:penpot / build:all 通过。

## Risks / Dependencies

- 前置：T003、T005。
- T016、T017 依赖本卡。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Penpot manifest:
- Sync / traceability evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
