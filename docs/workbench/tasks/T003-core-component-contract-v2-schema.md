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

- Commit / PR: PR #16；review-fix implementation head `f8e05523977cc6b0efee4e261e203d775d2a7d3c`；branch `task/T003-core-component-contract-v2-schema`。
- Changed paths: `design-source/schemas/component-contract-v2.schema.json`, `design-source/specs/design-system-v1.json`, `tooling/src/component-contract.mjs`, `tooling/test/component-contract.test.mjs`, `tooling/bin/validate.mjs`, plus this task card and work-ledger status.
- Notes: Component V2 schema uses a required common identity/anatomy spine plus optional richer capability blocks. Existing 33 component contracts were not bulk-rewritten and no visual/component-count change was made. `componentSchema` is promoted from planned to canonical manifest source. Catalog validation checks duplicate catalog/internal slugs, duplicate contract paths, broken contract/preview paths, filename/slug/name drift, orphan component contract files, schema compliance and repository-contained real paths. Review found and fixed object `uniqueItems` equality so property order cannot bypass duplicate detection.

## Verification evidence

- CI: Design System Build run #116 (`33477782656`) — PASS on review-fix head `f8e05523977cc6b0efee4e261e203d775d2a7d3c`. `npm test`, `npm run build:all`, accepted-report unchanged check, engineering artifact upload and Penpot manifest upload all passed.
- Schema / catalog tests: 9 focused T003 tests PASS. They cover repository-wide indexed contract validation; lightweight component optional capability posture; intent/state/interaction/accessibility/platform-ref expression; deep `uniqueItems`; malformed identity/duplicate variant rejection; duplicate catalog id/path; broken contract/preview path; index↔contract identity drift; and unlisted/orphan contract drift.
- Other evidence: CI repository validation reports `Source integrity passed: 7 canonical sources; catalogs 33 components / 4 composites / 6 patterns` and `Component contracts passed: 33 catalog entries validated against component-contract-v2 schema with contract/preview path and drift checks.` Penpot build still reports 33 components. The validator derives catalog coverage from source and filesystem rather than hard-coding 33 as a permanent release KPI.

## Review

- Reviewer: Mira
- Result: REVIEW
- Conclusion: Implementation and deterministic evidence are complete. Builder-side diff review found one `uniqueItems` object-equality weakness; it was fixed with canonical deep serialization and regression coverage, and the final implementation CI passed. Per work-ledger rule, builder does not self-mark PASS; independent design-system approval is still required.
- Follow-up: After T003 PASS, T005/T006/T014/T015/T020-T025 may consume this component contract baseline. T002 and T003 were intentionally built independently from the same `dev` base and both touch manifest/validator integration; whichever merges second must preserve both contracts during semantic conflict resolution.
