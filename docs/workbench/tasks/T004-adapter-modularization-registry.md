# T004 · Adapter Modularization + Stable Registry

- Status: PASS
- Target version: V2 first-stage
- Impact: Tooling / Adapter
- Owner: -

## Background

当前 `tooling/src/adapters.mjs` 同时承载 Tailwind、NativeWind、RN token 和 build manifest。V2 若直接让多线程在该文件上扩展四端，会形成严重竞态。

## Goal

先拆出稳定 Adapter Registry 和平台模块边界，让 Web、Native Mobile、微信小程序后续可以独立施工且保持现有输出回归不变。

## Must Read

- `design-source/v2-planning/v2-prd.md`
- `design-source/BUILD_PIPELINE.md`
- `tooling/src/adapters.mjs`
- `tooling/bin/build.mjs`
- `tooling/bin/build-all.mjs`
- `tooling/test/*adapter*.test.mjs`

## Scope

- 拆分 `tooling/src/adapters.mjs` 为可独立扩展模块。
- 建稳定 adapter registry / build plumbing。
- 保持现有 Tailwind、NativeWind、React Native、build-manifest 输出兼容。
- 为 Web / native-mobile / mini-program 留明确扩展点。

## Out of scope

- 本卡不实现 T007/T008/T009 的平台语义变化。
- 不修改 canonical token 值。

## Acceptance

- [x] 当前所有 engineering targets 在拆分后仍可构建。
- [x] 平台模块可在不反复改同一中央函数的情况下增加。
- [x] registry 有清晰稳定 ID / target mapping。
- [x] 生成物仍可追溯 canonical source revision。
- [x] regression tests、`npm run build:all` 通过。

## Risks / Dependencies

- 前置：无。
- T007、T008、T009 必须基于本卡合入后的 adapter 边界施工。

## Implementation record

- Commit / PR: branch `task/T004-adapter-registry`; PR #18 against `dev`.
- Changed paths:
  - `tooling/src/adapters.mjs`
  - `tooling/src/adapters/*.mjs`
  - `tooling/bin/build.mjs`
  - `tooling/test/adapter-registry.test.mjs`
  - `docs/workbench/00-work-ledger.md`
  - this task card
- Notes:
  - `tooling/src/adapters.mjs` remains a compatibility facade for existing imports.
  - Stable built-in mapping is `web.tailwind → tailwind`, `native-mobile.nativewind → nativewind`, `native-mobile.react-native → react-native`, and `meta.build-manifest → build-manifest`.
  - `family` is adapter organization metadata only; it is intentionally not a replacement for the canonical T002 Platform Model axis.
  - MCP and Penpot keep their existing independent build boundaries; this card does not redefine their platform semantics.
  - Registry validation rejects duplicate IDs, duplicate targets, conflicting output ownership, and declared/emitted output drift.
  - Acceptance review found that registered adapter objects were externally mutable; registration now snapshots and freezes the adapter contract and its `outputPaths`, with a regression test proving post-registration mutation cannot alter stable mappings.

## Verification evidence

- CI: PR #18 Design System Build run `33481769688`, job `verify`, completed successfully after the acceptance-review fix.
- Regression tests: `tooling/test/adapter-registry.test.mjs` covers stable mapping, output compatibility, extension registration, immutable registered contracts and registry failure cases; existing adapter imports remain compatible through the facade.
- Build outputs: registry preserves the six existing engineering paths under `dist/tailwind`, `dist/nativewind`, `dist/react-native` and `dist/build-manifest.json`; manifest `sourceHash` remains populated from the canonical token model.
- Accepted-report protection: CI confirmed `report/design-system-v1/` remains untouched.

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: PASS. Adapter modules are independently extensible, central build plumbing no longer owns per-target output branching, stable ID/target/output ownership is enforced and immutable after registration, canonical-source traceability is preserved, and repository regression/build gates are green.
- Follow-up: T007/T008/T009 must register new adapter modules against this boundary rather than add target-specific branches back into central build plumbing.
