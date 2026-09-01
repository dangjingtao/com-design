# T003 · Core Component Contract V2 Schema

- Status: TODO
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

- [ ] 33 个现有 Core Component contract 全部通过 schema。
- [ ] duplicate ID / broken path / catalog drift 能确定性失败。
- [ ] 简单组件不被迫填写无意义字段。
- [ ] platform presentation 可以引用但不污染 Core 语义。
- [ ] focused tests + repository validation 通过。

## Risks / Dependencies

- 前置：无。
- 是 T005、T006、T014、T015、T020-T025 的基础依赖。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Schema / catalog tests:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
