# T006 · Validation Orchestrator + Evidence Output

- Status: TODO
- Target version: V2 first-stage
- Impact: Validation / Tooling
- Owner: -

## Background

当前 `npm run validate` 主要验证 token model。V2 要把 source integrity、Component schema、Platform Model 与 Canonical Model 纳入统一硬门禁。

## Goal

把 `npm run validate` 升级为 V2 deterministic hard-gate 入口，并输出机器可读 evidence。

## Must Read

- `docs/workbench/tasks/T001-source-integrity-manifest-gate.md`
- `docs/workbench/tasks/T003-core-component-contract-v2-schema.md`
- `docs/workbench/tasks/T005-canonical-design-model-v2.md`
- `tooling/bin/validate.mjs`
- `design-source/v2-planning/v2-prd.md`

## Scope

- 聚合 source integrity、token、component、platform、canonical-model checks。
- 区分 blocking errors 与 non-blocking warnings。
- 输出 source SHA、checks run、pass/fail summary 等 evidence。
- 增加 focused tests / fixture failures。

## Out of scope

- 不在本卡改 GitHub Actions，交给 T017。
- 不把视觉主观判断硬编码成 fail。

## Acceptance

- [ ] 一条 validate 命令覆盖 V2 确定性基础门禁。
- [ ] 任一硬门禁失败整体 exit non-zero。
- [ ] warning 与 error 可机器区分。
- [ ] evidence 可被 T017/T019/AI consumer 读取。
- [ ] `npm test`、`npm run validate`、`npm run build:all` 通过。

## Risks / Dependencies

- 前置：T001、T003、T005。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Negative fixtures:
- Evidence sample:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
