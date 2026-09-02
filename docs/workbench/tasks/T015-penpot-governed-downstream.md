# T015 · Penpot as Governed Downstream Consumer

- Status: PASS
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

- Commit / PR: PR #25; squash merge `af2162fa56e34ed1353d61a46b5b212718c0d832`; formal review hardening PR #26, squash merge `1c5747dcc112edab6304e04c73c284c7d46c6d88`
- Changed paths: `penpot/bin/build.mjs`, `penpot/src/compile/canonical.mjs`, `tooling/test/penpot-canonical.test.mjs`
- Notes: Penpot build 先构建 Canonical Design Model V2；token、theme overlay、component、platform context 都携带可审计 provenance；保持现有 designer-facing token/theme 命名与可编辑工作流。

## Verification evidence

- Original CI: Design System Build run `33650394597` — success。
- Formal combined review CI: run `33652886819` — success；76 tests PASS，`build:all` PASS；Penpot manifest artifact 成功生成。
- Penpot manifest: canonical model id/sourceHash/authority/conflictPolicy、platform-context provenance、component sourceId/sourceRevision、token exact provenance。
- Token coverage evidence: current Penpot compiler explicitly represents 121/138 canonical consumer tokens；17 omitted IDs are density / platform / motion token classes not yet mapped by the Penpot token compiler. Omission is explicit and auditable rather than falsely reported as full coverage.
- UI/UX design-tool evidence: component state semantics fall back to `variantDimensions.state`; Button retains `pressed` / `disabled` and representative variants. Designer-facing Light/Dark/Premium Gold sets remain stable.

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: Formal review found traceability was initially too shallow and component state/platform semantics could be lost in the Penpot manifest. PR #26 corrected exact foundation/theme/token provenance, platform-context provenance, real platform presentation/exception refs, and component state/variant retention. This passes design-tool UX review: designers keep stable editable naming and theme behavior while machine audit metadata remains behind the scenes instead of polluting the workspace interaction model.
- Follow-up: 17 currently omitted density/platform/motion token IDs are an explicit non-blocking coverage gap for later Penpot token-type mapping; do not claim 100% token coverage until those mappings exist. T016/T017 may consume the governed manifest now.
