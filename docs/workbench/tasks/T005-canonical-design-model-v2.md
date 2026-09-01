# T005 · Canonical Design Model V2

- Status: TODO
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

- [ ] model 能从 canonical sources 重建。
- [ ] 下游无需解析 Preview DOM/CSS 即可获得必要 contract。
- [ ] 所有条目带稳定 ID 与 source provenance。
- [ ] platform maturity 不虚报实现状态。
- [ ] model tests、validate、build 通过。

## Risks / Dependencies

- 前置：T001、T002、T003。
- 上述任一卡 contract 变化后，本卡必须 rebase / replay 并重跑测试。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Model tests:
- Sample output:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
