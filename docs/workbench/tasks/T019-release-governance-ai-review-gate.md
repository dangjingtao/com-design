# T019 · Release Governance + Conditional AI Review Gate

- Status: DOING
- Target version: V2 first-stage
- Impact: CI / Review / Governance
- Owner: -

## Background

V2 已确认：确定性规则由机器硬门禁守住；国产 AI 等 Agent 施工的提交可增加额外 AI Review Gate；Mira 负责综合设计系统判断并拥有最终否决权。

## Goal

把这套治理模型落实为可执行、可审计的 release/review contract，而不是只留在 PRD 文本里。

## Must Read

- T017 任务卡及结果
- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/v2-prd-q5-governance.md`
- `docs/workbench/00-work-ledger.md`

## Scope

- 明确 hard gate → optional AI review → Mira judgment → release eligibility 顺序。
- 定义 AI Review Gate 触发 / 输出接口，可根据 Agent / 任务风险配置，不永久绑定厂商。
- review 输出至少包含 findings、warnings、evidence、decision status。
- 明确 Patch/Minor 兼容、Major breaking migration evidence、consumer version pinning。

## Out of scope

- 不让 AI Review 覆盖 deterministic hard gate。
- 不让 CI 全绿自动等于 PASS / release。
- 不自动升级下游项目版本。

## Acceptance

- [ ] hard gate fail 时不能进入 release eligible。
- [ ] 条件 AI Review Gate 有明确触发和 evidence contract。
- [ ] Mira approve / revise / reject 作为正式 release judgment 被记录。
- [ ] breaking change 需要 migration + impact evidence。
- [ ] consumer 项目默认锁定版本并显式升级。

## Risks / Dependencies

- 前置：T017。
- 本卡完成不等于 V2 RC 通过，最终由 T026 集成验收。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Governance dry-run:
- AI review evidence sample:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
