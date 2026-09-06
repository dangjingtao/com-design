# T022 · Incremental Loading / Infinite List Pattern

- Status: PASS
- Target version: V2 first-stage
- Impact: UX Pattern / Collection / Cross-platform
- Owner: -

## Background

V2 已规划 Incremental Loading：自动 near-end 加载 + 手动 Load More + retry fallback。它需要共享 loading / append-error / cursor / restore 语义，并与 pull-to-refresh、virtualization 分离。

## Goal

形成正式的 Incremental Loading / Infinite List UX Pattern contract，为 Web、Mobile、小程序提供同一状态语义与平台触发策略。

## Must Read

- T003、T012 任务卡及结果
- `design-source/v2-planning/incremental-loading.md`
- `design-source/v2-planning/v2-prd.md`
- existing collection/filter patterns

## Scope

- auto near-end + manual Load More + retry fallback。
- idle / loading / appended / exhausted / append-error 状态。
- append error 保留已有数据，不清空集合。
- cursor / dedup / ordering guard 的平台中立 contract。
- 返回时恢复 list/filter/scroll。
- Mini Program 明确 scroll owner，避免高频节点更新。

## Out of scope

- Pull-to-refresh 单独处理，不混入同一 contract。
- Virtualization 是实现优化，不等于本 Pattern。
- 不绑定具体后端 pagination 方案。

## Acceptance

- [x] 自动加载失败后存在明确手动 retry / Load More 路径。
- [x] append error 不丢失已加载数据。
- [x] duplicate / out-of-order append 有 guard 语义。
- [x] cursor 模型不绑定某个后端字段名。
- [x] detail return 可恢复集合与滚动上下文。
- [x] contract / examples / tests 通过。

## Risks / Dependencies

- 前置：T003、T012。

## Implementation record

- Commit / PR: PR #43 (`task/T022-incremental-loading-infinite-list` → `dev`); reviewed implementation head before evidence-only REVIEW update: `55a462670819f9125345ab54fbd9ee7b6ea4c86b`.
- Changed paths:
  - `design-source/specs/incremental-loading-v2.json`
  - `design-source/schemas/incremental-loading-v2.schema.json`
  - `design-source/specs/core-patterns.json`
  - `design-source/specs/design-system-v1.json`
  - `design-source/library-consumption.json`
  - public README / design-source README / SKILL pattern count facts
  - `tooling/src/incremental-loading.mjs`
  - Web / Native Mobile / WeChat Mini Program adapters
  - Canonical Design Model / Agent Contract / validation orchestrator integration
  - focused and integration tests
- Notes:
  - Incremental Loading is promoted from V2 candidate to the 7th Core UX Pattern. Core counts are now 33 Components / 4 Composites / 7 Patterns.
  - Shared states are `idle / loading-initial / ready / loading-more / appended / append-error / exhausted`.
  - Continuation is opaque to UI, backend-field-name neutral, and invalidated by committed query/filter/sort or collection identity changes.
  - In-flight request guard prevents duplicate threshold requests; request identity + generation reject stale/out-of-order responses.
  - Stable item keys deduplicate append while preserving accepted batch order.
  - Append error preserves existing data. Automatic near-end triggers are suppressed while in `append-error`; only explicit manual Load More or retry resumes continuation, preventing request/error loops.
  - `hasMore=true` requires a valid next continuation; exhausted state suppresses subsequent continuation requests.
  - Detail return restores loaded items, continuation, T021 committed query/filters/sort and scroll position.
  - Pull-to-refresh and virtualization remain separate, composable capabilities; Core does not bind a backend pagination protocol.
  - Web / iOS / Android / WeChat Mini Program all carry explicit platform trigger mappings. Formal adapters consume those mappings rather than maintaining a second truth.
  - Mini Program adapter evidence requires page-or-contained scroll ownership, forbids nested owners/high-frequency node mutation, requires request guard and batched append.
  - T016 public-fact consistency now resolves 7 Core UX Patterns; `npm run validate` includes `incremental-loading` as the 13th deterministic check.

## Verification evidence

- CI: Design System Build #274 — success on REVIEW-state head `3b4815f7a453a284bcb189d27247ae375303d8a0`; 194/194 repository tests PASS; V2 validation 13 checks / 0 warnings; engineering build, Penpot build, accepted-report guard, governance dry-run and T017 deterministic hard-gate enforcement all PASS.
- State-machine tests: automatic append success, stable-key dedup/order, append-error data retention, explicit retry continuation reuse, in-flight suppression, stale/out-of-order rejection, exhausted suppression, query/filter/sort invalidation, detail-return restoration, non-empty request identity, required next continuation, and append-error automatic-loop suppression all have focused regression coverage.
- Mini Program scroll evidence: generated `dist/wechat-mini-program/adapter.json` carries T022 semantic source, page/contained scroll-owner vocabulary, `scrollOwnerRequired=true`, `nestedScrollOwnersForbidden=true`, request-in-flight guard, `highFrequencyNodeMutationAllowed=false`, `batchAppendRequired=true`, and virtualization/recycling composability. Web and Native adapter tests also prove their platform mappings are consumed.

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: Final acceptance passed. Codex P1/P2 findings were fixed and resolved: append-error now blocks automatic near-end retry loops until explicit manual/retry recovery, and Web/iOS/Android/Mini Program mapping shapes are encoded in both schema and custom validation. Independent review additionally required non-empty request identities, rejected `hasMore=true` without a next continuation, verified stale responses cannot revive invalidated continuation, and confirmed exhausted state suppresses all further continuation requests. Review-state Design System Build #274 passed after all fixes. CodeRabbit produced no actionable finding on the hardened patch.
- Follow-up: T026 may consume T022 as the formal long-collection continuation contract. Pull-to-refresh and virtualization remain separate future capabilities and must not be inferred as accepted by T022.
