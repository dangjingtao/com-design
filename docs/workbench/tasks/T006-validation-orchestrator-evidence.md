# T006 · Validation Orchestrator + Evidence Output

- Status: PASS
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

- [x] 一条 validate 命令覆盖 V2 确定性基础门禁。
- [x] 任一硬门禁失败整体 exit non-zero。
- [x] warning 与 error 可机器区分。
- [x] evidence 可被 T017/T019/AI consumer 读取。
- [x] `npm test`、`npm run validate`、`npm run build:all` 通过。

## Risks / Dependencies

- 前置：T001、T003、T005。

## Implementation record

- Commit / PR: PR #27，分支 `task/T006-validation-orchestrator-evidence`。
- Changed paths: `tooling/src/validation-orchestrator.mjs`、`tooling/src/motion-foundation.mjs`、`tooling/bin/validate.mjs`、`tooling/test/validation-orchestrator.test.mjs`。
- Notes: 保留并复用已有 validator，不复制 canonical 规则；统一编排 source integrity、token、platform model/environment、motion、component、iconography 与 Canonical Design Model 共 8 个确定性检查。机器证据固定写入 `dist/validation/evidence.json`，包含 source SHA-256、per-check status/evidence、summary、blocking errors 与 non-blocking warnings。未修改 GitHub Actions，未把视觉主观判断写入硬门禁。

## Verification evidence

- CI: Design System Build run `33819486243` — success；83/83 tests PASS；`build:all` PASS；acceptance report unchanged gate PASS；engineering / Penpot artifact upload PASS。CI 的 `build:all` 执行与 `npm run validate` 相同的 `tooling/bin/validate.mjs` 入口。
- Negative fixtures: 缺失 canonical foundation 会同时产生 source-integrity / token-model blocking failure并令 overall result=fail；manifest 改指向无效 motion contract 会由 canonical-selected motion gate 拒绝；同一 malformed source 在不同 checkout root 生成完全一致、仅仓库相对路径的 failure evidence；另有 warning/error 结构分离、deterministic evidence、稳定 artifact path 回归测试。
- Evidence sample: 8 checks PASS / 0 warnings；Canonical source SHA-256 `304f7390cf06e33c05204d05b54969bc0e6fb1e0916a670594c402a3c035a32b`；输出 `dist/validation/evidence.json`，随 engineering artifact 上传（artifact ID `9917499047`）。

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: 独立验收发现并修复 1 个 P1 与 1 个 P2：motion gate 原先未跟随 manifest-selected canonical source；failure evidence 原先可能泄露 checkout 绝对路径并破坏跨环境确定性。两项均补定向回归测试，最终 83/83 tests 与完整 build 全绿。统一 validate 现覆盖既有确定性基础门禁，并输出可供后续 CI / AI / release governance 消费的机器证据；未发现剩余 blocker。
- Follow-up: T017 可消费 `dist/validation/evidence.json` 作为 deterministic CI evidence artifact，并负责失败 run 的 upload / retention 行为。
