# T021 · Mobile Search + Filter Workflow Contract

- Status: TODO
- Target version: V2 first-stage
- Impact: UX Pattern / Mobile / Collection
- Owner: -

## Background

V2 已确认移动搜索与筛选是一条完整集合任务流：Search Field → Results → Filter Draft → Apply/Reset → Feedback → restore。IME composition、query/filter 独立状态与返回恢复不能由业务各自临场实现。

## Goal

把已确认的 Search + Filter 规则正式化为可复用 V2 UX contract，不通过新增大量 Core Component 来解决。

## Must Read

- T003、T010、T012 任务卡及结果
- `design-source/v2-planning/mobile-search-filter.md`
- `design-source/specs/core-patterns.json`
- `design-source/specs/core-composites.json`
- `design-source/components/search-field.json`

## Scope

- `CollectionQueryModel`：query / filter / sort 独立但同属集合状态。
- 中文 / 日文 IME composition，`compositionend` 后再 debounce / commit。
- quick filters 与 Tabs 语义分离。
- advanced filter draft / committed state、Apply / Reset。
- detail return 时恢复 query / filters / sort / data / scroll。
- iOS / Android / Mini Program presentation mapping hooks。

## Out of scope

- 不把 Reset 定义成清空搜索词。
- 不为了流程新增无证据 Core Component。
- 不实现业务搜索后端。

## Acceptance

- [ ] IME 组合态不会把拼音中间态当最终 query 提交。
- [ ] filter dismiss 不提交 draft；Apply 才 commit。
- [ ] Clear query 与 Cancel/Back 语义分离。
- [ ] 返回详情后集合状态可恢复。
- [ ] quick filter 不被错误实现成 Tabs。
- [ ] contract / example / tests 通过。

## Risks / Dependencies

- 前置：T003、T010、T012。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- IME / draft tests:
- Restore-state evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
