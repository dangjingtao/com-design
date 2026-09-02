# T015 · Penpot as Governed Downstream Consumer

- Status: REVIEW
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

- [x] Penpot build 来自 canonical source / normalized model。
- [x] 设计资产可追溯到 contract / source revision。
- [x] Penpot 与工程输出冲突时 canonical source 明确优先。
- [x] 当前 Penpot build/sync 不回归。
- [x] tests、validate、build:penpot / build:all 通过。

## Risks / Dependencies

- 前置：T003、T005。
- T016、T017 依赖本卡。

## Implementation record

- Commit / PR: PR #25; squash merge `af2162fa56e34ed1353d61a46b5b212718c0d832`
- Changed paths: `penpot/bin/build.mjs`, `penpot/src/compile/canonical.mjs`, `tooling/test/penpot-canonical.test.mjs`
- Notes: Penpot build 先构建 Canonical Design Model V2；组件资产直接从 canonical model 生成并携带 sourceId/sourceRevision/contractPath；现有 token/theme compiler 保持兼容。

## Verification evidence

- CI: Design System Build run `33650394597` — success (`npm test` + `build:all`).
- Penpot manifest: 写入 canonical model id/sourceHash/authority/conflictPolicy。
- Sync / traceability evidence: component sourceId 与 contract sourceRevision parity gate；writeBack 为 proposal-only。

## Review

- Reviewer: Mira pending final review
- Result: REVIEW
- Conclusion: Implementation and CI evidence ready for design-system review.
- Follow-up: T016/T017 may consume this output after PASS.
