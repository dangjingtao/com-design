# T003 · Core Component Contract V2 Schema

- Status: REVIEW
- Target version: V2 first-stage
- Impact: Contract / Validation
- Owner: -

## Background

当前 33 个 Core Component 已有 JSON contract，但 `dev` 只有 Composite / Pattern schema，缺少统一的 Component schema 验证闭环。

## Goal

为 33 Core Components 建立 V2 machine-validatable schema 与 catalog validator，不改变既有 Core 数量边界。

## Must Read

- `design-source/v2-planning/v2-prd.md`
- `design-source/components/index.json`
- `design-source/components/button.json`
- `design-source/components/select.json`
- `design-source/components/top-app-bar.json`
- `design-source/schemas/composite-contract-v1.schema.json`
- `design-source/schemas/pattern-contract-v1.schema.json`

## Scope

- 新增 `component-contract-v2.schema.json`。
- 能表达 intent、anatomy、variants、states、interaction、accessibility、platform presentation/exception refs。
- 为 components catalog 增加 duplicate id、broken path、catalog drift 验证。
- 必要时对现有 component JSON 做最小规范化。

## Out of scope

- 不为了 schema 方便发明第 34 个 Core Component。
- 不重做所有组件视觉。
- 不实现 T020-T025 的具体 V2 能力。

## Acceptance

- [x] 33 个现有 Core Component contract 全部通过 schema。
- [x] duplicate ID / broken path / catalog drift 能确定性失败。
- [x] 简单组件不被迫填写无意义字段。
- [x] platform presentation 可以引用但不污染 Core 语义。
- [x] focused tests + repository validation 通过。

## Risks / Dependencies

- 前置：无。
- 是 T005、T006、T014、T015、T020-T025 的基础依赖。

## Implementation record

- Commit / PR: original PR #16; integrated after T002 via PR #17 because both cards modify shared manifest / validator files.
- Changed paths: `design-source/schemas/component-contract-v2.schema.json`, `design-source/specs/design-system-v1.json`, `tooling/src/component-contract.mjs`, `tooling/test/component-contract.test.mjs`, `tooling/bin/validate.mjs`, plus this task card and work-ledger status.
- Notes: Component V2 schema uses a required common identity/anatomy spine plus optional richer capability blocks. Existing 33 component contracts were not bulk-rewritten and no visual/component-count change was made. `componentSchema` is canonical alongside T002's platform model sources. Catalog validation checks duplicate catalog/internal slugs, duplicate contract paths, broken contract/preview paths, filename/slug/name drift, orphan contracts, schema compliance and repository-contained real paths. Review fixes include order-independent `uniqueItems` equality and canonical preview enforcement under `design-source/preview/component-<slug>.html`.

## Verification evidence

- CI: integration Design System Build run #120 (`33478385306`) — PASS with T002 + T003 enabled together.
- Schema / catalog tests: integrated suite 36/36 PASS. T003 coverage includes all 33 indexed contracts, optional capability posture, malformed schema rejection, duplicate ids/paths, broken paths, catalog drift, orphan contracts, deep `uniqueItems`, and canonical preview path/filename rejection.
- Other evidence: integrated repository validation reports `Source integrity passed: 9 canonical sources; catalogs 33 components / 4 composites / 6 patterns`, `Platform model passed: 4 platforms, 6 orthogonal context axes with manifest parity`, and `Component contracts passed: 33 catalog entries validated against component-contract-v2 schema with canonical contract/preview path and drift checks.` Engineering/Penpot artifact upload passed and Penpot remains at 33 components.

## Review

- Reviewer: Mira
- Result: REVIEW
- Conclusion: T003 implementation is integrated with the already-merged T002 baseline and deterministic evidence is green. The remaining PR #16 preview-path P2 was fixed in the integration branch. Per work-ledger rule, merge does not itself imply PASS.
- Follow-up: T005/T006/T014/T015/T020-T025 may consume the component contract only after formal PASS. T002/T003 shared manifest/validator conflict is resolved by PR #17 integration.
