# T001 · Source Integrity + Manifest Gate

- Status: REVIEW
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

- [x] manifest 声明的 canonical source 均存在且可解析。
- [x] 不存在的 iconography/schema/token source 被修正或明确标记为 planned / non-canonical。
- [x] catalog count 等可从真实 source 解析的字段不依赖手工虚假值。
- [x] 缺失声明路径的 focused test 会失败。
- [x] `npm test`、`npm run validate`、`npm run build:all` 通过。

## Risks / Dependencies

- 前置：无。
- 与 T003/T013 在 schema/source 命名上存在潜在语义交叉；不得擅自覆盖对方文件所有权。

## Implementation record

- Commit / PR: `683a8d0` + `bcb98a3` / PR #14
- Changed paths: `design-source/specs/design-system-v1.json`, `tooling/src/source-integrity.mjs`, `tooling/test/source-integrity.test.mjs`, `tooling/bin/validate.mjs`
- Notes: canonical source graph 已改为当前仓库真实入口；未来 / 旧声明显式降级为 planned / deferred / non-canonical；catalog 数量由真实 source 解析；四端 target 与当前 adapter maturity 分离；未施工 T003/T013 所属 schema / icon registry。

## Verification evidence

- CI: Design System Build run #98 (`33458825697`) — PASS on implementation head `bcb98a31`.
- Test / Build: `npm test` PASS；`npm run build:all` PASS（包含 repository `validate`）；accepted human report unchanged gate PASS。
- Other evidence: source-integrity focused tests 覆盖 canonical source 缺失、JSON 无法解析、planned non-canonical source、手工 counts；repository integration 从 source 实际解析 33 Core Components / 4 Core Composite Components / 6 Core Patterns。

## Review

- Reviewer: -
- Result: REVIEW
- Conclusion: Implementation 与确定性 CI 门禁已完成，等待设计系统独立评审；按台账规则不由施工线程自标 PASS。
- Follow-up: Review 通过后再更新为 PASS；后续 T003/T013 分别接管 component schema 与 icon registry/schema 的正式 canonical source。
