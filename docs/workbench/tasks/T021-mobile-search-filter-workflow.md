# T021 · Mobile Search + Filter Workflow Contract

- Status: PASS
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

- [x] IME 组合态不会把拼音中间态当最终 query 提交。
- [x] filter dismiss 不提交 draft；Apply 才 commit。
- [x] Clear query 与 Cancel/Back 语义分离。
- [x] 返回详情后集合状态可恢复。
- [x] quick filter 不被错误实现成 Tabs。
- [x] contract / example / tests 通过。

## Risks / Dependencies

- 前置：T003、T010、T012。

## Implementation record

- Commit / PR: PR #42 (`task/T021-mobile-search-filter-workflow` → `dev`); reviewed implementation head before evidence-only REVIEW update: `0a62b831de12759f026844587b71150c4bfa0eff`.
- Changed paths:
  - `design-source/specs/mobile-search-filter-v2.json`
  - `design-source/schemas/mobile-search-filter-v2.schema.json`
  - `design-source/components/search-field.json`
  - `design-source/specs/core-patterns.json`
  - `design-source/specs/core-composites.json`
  - Pattern / Composite schemas for optional workflow refs
  - `design-source/specs/design-system-v1.json`
  - `design-source/library-consumption.json`
  - `tooling/src/mobile-search-filter.mjs`
  - Canonical Model / Agent Contract / validation orchestrator integration
  - focused + integration tests
- Notes:
  - No new Core Component, Composite or Pattern count. Existing 33 / 4 / 6 remain unchanged.
  - Canonical `CollectionQueryModel` separates pending query, committed query, committed filters, sort, continuation and restoration state under one collection owner.
  - IME composition never commits intermediate text; instant/debounced search begins debounce after composition end and explicit submit also suppresses commit while composing.
  - Filter draft is initialized from committed state; dismiss/Back discards draft; Apply commits and resets continuation; Reset is draft-only and does not clear query.
  - Clear query preserves active filters and search context; Cancel/Back owns exit semantics. When Filter Surface is open, Back closes/discards the draft before exiting the search context.
  - Query commits while a filter draft is open must explicitly choose `cancel-draft` or `rebase-draft`; silent stale-draft carry-over is rejected.
  - Quick filters are collection conditions, never peer-view navigation/Tabs.
  - Detail return restoration captures committed query, filters, sort, loaded data and scroll position. Continuation loading mechanics remain T022 scope.
  - iOS / Android / WeChat Mini Program mappings consume T010 keyboard/IME, Back, Safe Area, accessibility and host-chrome facts rather than hard-coded platform API names.
  - Canonical Design Model and T014 Agent Contract expose the workflow; `npm run validate` now includes the `mobile-search-filter` hard gate.

## Verification evidence

- CI: Design System Build #263 — success on `1dde7d945c87102f519b49b5cf0f6289be267f4f`; full repository tests PASS, V2 validation 12 checks / 0 warnings, engineering build, Penpot build, accepted-report guard, governance dry-run and T017 deterministic hard-gate enforcement all PASS.
- IME / draft tests: focused tests prove intermediate IME input cannot commit, composition-end enables commit, dismiss and Back cannot commit draft, Apply is the commit boundary, Reset stays draft-only, Clear preserves filters, open-draft query changes require explicit cancel/rebase strategy, and empty platform mapping hooks fail validation.
- Restore-state evidence: reference reducer captures/restores committed query, committed filters, sort, loaded data and scroll position after detail return; query/filter/sort commits invalidate continuation. Canonical Model rejects an invalid T021 workflow before emission, and Agent Contract exposes the accepted workflow with source provenance.

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: Independent acceptance passed. Final substantive head before evidence-only PASS commits is `1dde7d945c87102f519b49b5cf0f6289be267f4f`; Design System Build #263 passed after the final state-machine hardening. Review specifically checked IME composition boundaries, draft/committed separation, Back behavior with an open Filter Surface, explicit cancel/rebase handling when query changes under an open draft, Clear-vs-Cancel semantics, quick-filter non-navigation semantics, detail-return restoration, and T010/T012 platform-boundary ownership. No remaining path was found that can implicitly commit IME intermediate text or filter draft, turn Quick Filter into Tabs, or promote platform event details into Core semantics. CodeRabbit remained on an earlier head and produced no actionable finding; final acceptance therefore proceeds by independent review under the project rule.
- Follow-up: T022 may consume `CollectionQueryModel.continuation` and invalidation semantics for incremental loading, but must not reopen or redefine T021 query/filter ownership, IME, draft/apply, or restoration contracts.
