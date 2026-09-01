# T001 · Source Integrity + Manifest Gate

- Status: TODO
- Target version: V2 first-stage
- Impact: Architecture / Validation
- Owner: -

## Background

V2 readiness audit 已确认当前 manifest 存在声明与仓库现实不完全一致的问题。V2 第一周必须先让 canonical source 的入口可信，否则后续 Adapter / AI / Penpot 都会继承错误事实。

## Goal

让 design-system manifest 准确描述当前仓库，并让缺失 / 错误 source declaration 通过确定性门禁失败。

## Must Read

- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/four-platform-readiness-audit.md`
- `design-source/specs/design-system-v1.json`
- `design-source/BUILD_PIPELINE.md`

## Scope

- 修正 manifest 中不存在、过时或不准确的 source 声明。
- 增加 manifest / source-integrity schema 或 validator。
- 平台目标与当前 adapter maturity 分离表达，不能手写“已完成”冒充事实。
- 为缺失声明路径、无法解析 source 等情况补 focused tests。

## Out of scope

- 不修改平台 Adapter。
- 不重写 `tooling/bin/validate.mjs` 总编排，交给 T006。
- 不借机新增组件。

## Acceptance

- [ ] manifest 声明的 canonical source 均存在且可解析。
- [ ] 不存在的 iconography/schema/token source 被修正或明确标记为 planned / non-canonical。
- [ ] catalog count 等可从真实 source 解析的字段不依赖手工虚假值。
- [ ] 缺失声明路径的 focused test 会失败。
- [ ] `npm test`、`npm run validate`、`npm run build:all` 通过。

## Risks / Dependencies

- 前置：无。
- 与 T003/T013 在 schema/source 命名上存在潜在语义交叉；不得擅自覆盖对方文件所有权。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Test / Build:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
