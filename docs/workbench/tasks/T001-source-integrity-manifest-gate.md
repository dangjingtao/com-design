# T001 · Source Integrity + Manifest Gate

- Status: PASS
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

- Commit / PR: PR #14；review-fix head `2ddda0e`
- Changed paths: `design-source/specs/design-system-v1.json`, `tooling/src/source-integrity.mjs`, `tooling/test/source-integrity.test.mjs`, `tooling/bin/validate.mjs`, `tooling/bin/build.mjs`
- Notes: canonical source graph 已改为当前仓库真实入口；未来 / 旧声明显式降级为 planned / deferred / non-canonical；catalog 数量由真实 source 解析；四端 target 与当前 adapter maturity 分离；未施工 T003/T013 所属 schema / icon registry。

## Verification evidence

- CI: Design System Build run #103 (`33459366001`) — PASS on review-fix head `2ddda0e80cc69b211cdc064ee5970b1406beac21`.
- Test / Build: `npm test` PASS；`npm run build:all` PASS（包含 repository `validate`）；accepted human report unchanged gate PASS；engineering / Penpot artifact upload PASS。
- Other evidence: focused tests 覆盖 canonical source 缺失、JSON 无法解析、planned non-canonical source、手工 counts、必需 catalog mapping 缺失、绝对路径、仓库外 traversal，以及 foundation declaration 跟随 manifest；source containment 同时检查 lexical path 与 `realpath`，防止 symlink 逃逸；repository integration 从 source 实际解析 33 Core Components / 4 Core Composite Components / 6 Core Patterns。

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: 独立复核最初发现 2 个 P1（必需 catalog 可被删除、manifest foundation 与 build truth 可再次分叉）和 1 个 P2（canonical path 可逃出仓库）。三项均已在 PR #14 最新 head 修复并补回归测试，review threads 已逐项回复并 resolve；最新完整 CI 通过，未发现剩余 blocker，T001 验收通过。
- Follow-up: T003/T013 分别接管 component schema 与 icon registry/schema 的正式 canonical source；T005/T006 可按依赖继续消费 T001 的 Source Integrity 基线。
