# T022 · Incremental Loading / Infinite List Pattern

- Status: TODO
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

- [ ] 自动加载失败后存在明确手动 retry / Load More 路径。
- [ ] append error 不丢失已加载数据。
- [ ] duplicate / out-of-order append 有 guard 语义。
- [ ] cursor 模型不绑定某个后端字段名。
- [ ] detail return 可恢复集合与滚动上下文。
- [ ] contract / examples / tests 通过。

## Risks / Dependencies

- 前置：T003、T012。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- State-machine tests:
- Mini Program scroll evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
