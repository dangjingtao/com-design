# T004 · Adapter Modularization + Stable Registry

- Status: TODO
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

- [ ] 当前所有 engineering targets 在拆分后仍可构建。
- [ ] 平台模块可在不反复改同一中央函数的情况下增加。
- [ ] registry 有清晰稳定 ID / target mapping。
- [ ] 生成物仍可追溯 canonical source revision。
- [ ] regression tests、`npm run build:all` 通过。

## Risks / Dependencies

- 前置：无。
- T007、T008、T009 必须基于本卡合入后的 adapter 边界施工。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Regression tests:
- Build outputs:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
