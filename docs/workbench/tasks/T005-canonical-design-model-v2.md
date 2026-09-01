# T005 · Canonical Design Model V2

- Status: PASS
- Target version: V2 first-stage
- Impact: Architecture / Tooling
- Owner: -

## Background

V2 需要一个 build-time normalized model，把 Token、Platform Model、Component contracts 与更高层 catalog 汇成下游统一消费接口。它不是新的 editable truth。

## Goal

建立 Canonical Design Model V2，让 Adapter / AI / Penpot 不再分别解析 Web Preview、散落 JSON 或 CSS 细节。

## Must Read

- `docs/workbench/tasks/T001-source-integrity-manifest-gate.md`
- `docs/workbench/tasks/T002-cross-platform-platform-model.md`
- `docs/workbench/tasks/T003-core-component-contract-v2-schema.md`
- `tooling/src/token-model.mjs`
- `design-source/v2-planning/v2-prd.md`

## Scope

- 新增 normalized design model builder，例如 `tooling/src/design-model.mjs`。
- 聚合 source hash、Token semantics、Component catalog、platform contexts、Composite / Pattern references。
- 输出稳定 schemaVersion / IDs / source provenance。
- focused model tests。

## Out of scope

- 不把生成 JSON 变成新的 editable source。
- 不在本卡实现具体平台 Adapter。

## Acceptance

- [x] model 能从 canonical sources 重建。
- [x] 下游无需解析 Preview DOM/CSS 即可获得必要 contract。
- [x] 所有条目带稳定 ID 与 source provenance。
- [x] platform maturity 不虚报实现状态。
- [x] model tests、validate、build 通过。

## Risks / Dependencies

- 前置：T001、T002、T003。
- 上述任一卡 contract 变化后，本卡必须 rebase / replay 并重跑测试。

## Implementation record

- Commit / PR: PR #19；accepted code head `4fe0b7e0cb1d64e99920ec27381abddc64a85595`
- Changed paths: `tooling/src/design-model.mjs`, `tooling/test/design-model.test.mjs`, `tooling/bin/build.mjs`, plus task / ledger evidence.
- Notes: 新增 non-editable derived Canonical Design Model V2，统一输出 Token semantics、33 Core Component contracts、4 Core Composite Components、6 Core Patterns、四端 Platform Model / axes / adapter maturity，并为 normalized entries 提供稳定 ID 与 source provenance。整体 `sourceHash` 覆盖 manifest、canonical source graph、33 个 component contracts 与 Token source hash；Preview 文件只继续接受 T003 的存在性 / canonical path gate，不读取或散列 Preview DOM/CSS 内容。平台成熟度直接继承 manifest，保持 iOS / Android / Web=`partial`、WeChat Mini Program=`planned`，不根据现有输出推断为 implemented。独立 review 后补充 Composite / Pattern schema gate、relation-scoped reference resolution，以及 foundation / theme overlay 的逐 token 实际来源 provenance。

## Verification evidence

- CI: Design System Build run #145 (`33501679965`) — PASS on accepted code head `4fe0b7e0cb1d64e99920ec27381abddc64a85595`; unit tests、`build:all`、acceptance-report unchanged gate、Engineering artifact upload 与 Penpot artifact upload 全部通过。
- Model tests: focused tests 覆盖 canonical source 重建、33/4/6 catalog 聚合、稳定 ID / provenance、platform maturity truthfulness、deterministic output、Preview DOM/CSS independence、canonical component contract 改动触发 source hash 变化、Composite / Pattern schema-invalid source 拒绝、relation namespace collision、overlay-defined token provenance、Composite / Pattern reference resolution 与 generated artifact round-trip。
- Review evidence: PR review 最初发现 3 个 P2：高层 catalog 未按 schema 验证、reference resolver 可跨 namespace 覆盖、overlay-only token provenance 错指 foundation。三项均在 `4fe0b7e` 修复、补回归测试，并已回复 / resolve review threads。
- Sample output: `dist/design-model-v2.json`（build-time generated artifact；`$metadata.authority=derived-build-artifact`, `editable=false`, `sourceOfTruth=design-source/`）。

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: 独立验收完成。Canonical Design Model 能从已接受的 T001/T002/T003 canonical contract 重建，并把 Token、Component、Composite、Pattern 与 Platform context 汇成单一 build-time consumer model；Preview DOM/CSS 不成为事实输入，所有 normalized 核心条目具备稳定 ID 与可追溯 provenance，平台成熟度保持 manifest 事实，不虚报 implementation。初审发现的 3 个 P2 已全部修复并由 focused regression + CI #145 证明。未发现剩余 blocker，T005 验收通过。
- Follow-up: T006-T009 / T014-T015 可把 T005 作为 accepted dependency 消费；后续若 T001/T002/T003 canonical contract 变化，必须 replay T005 并重跑 model tests / validate / build。
