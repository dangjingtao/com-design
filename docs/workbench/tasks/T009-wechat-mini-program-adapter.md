# T009 · WeChat Mini Program Minimum Viable Adapter

- Status: PASS
- Target version: V2 first-stage
- Impact: WeChat Mini Program / Adapter
- Owner: -

## Background

微信小程序是 V2 正式目标，但第一阶段成熟度可晚于 Android / iOS / Web。架构上不能继续只有“未来支持”说明，必须有真实生成路径。

## Goal

建立最小可用 Mini Program Adapter，使同一 canonical semantics 能生成可被小程序工程接入的正式产物。

## Must Read

- T002、T004、T005、T010 任务卡及结果
- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/four-platform-readiness-audit.md`
- T004 后 adapter registry

## Scope

- 增加专用 mini-program adapter target / module。
- 生成小程序工程可消费的 semantic tokens / platform metadata。
- 支持 Host Chrome / Safe Area hook、touch、reduced motion 等已定义平台能力。
- build manifest 如实记录 maturity。

## Out of scope

- 不要求本卡完成完整小程序 Core Component package。
- 不手工维护第二套 WXSS 真相源。
- 不复制 Tailwind / DOM / RN 假设。

## Acceptance

- [x] 存在从 canonical source 自动生成的小程序消费产物。
- [x] 产物带 platform/context 与 source revision。
- [x] Host Chrome / Safe Area 等通过 adapter/environment contract 表达。
- [x] build manifest 如实记录 mini-program 支持成熟度。
- [x] tests、validate、build 通过。

## Risks / Dependencies

- 前置：T002、T004、T005、T010。

## Implementation record

- Commit / PR: branch `task/T009-wechat-mini-program-adapter`; PR #33 against `dev`; accepted implementation head `52ef0cc7eb439d68fe200f90a6785f0bbe083a77` before evidence-only task/ledger commits.
- Changed paths:
  - `tooling/src/adapters/wechat-mini-program.mjs`
  - `tooling/src/adapters/registry.mjs`
  - `tooling/src/adapters/build-manifest.mjs`
  - `tooling/src/adapters/renderers.mjs`
  - `tooling/src/agent-contract.mjs`
  - `design-source/specs/design-system-v1.json`
  - focused Mini Program / adapter registry / agent-contract / maturity regression tests
- Notes:
  - 新增 `mini-program.wechat` 正式 adapter target，生成 `dist/wechat-mini-program/tokens.js` 与 `adapter.json`。
  - Token consumer 采用 CommonJS，可直接由小程序工程 `require()`；不生成第二套手工 WXSS 真相源，也不要求 Core 使用 `rpx`。
  - Safe Area、reserved region、微信 Capsule / Host Chrome、Back、IME、Pointer、Gesture、Overlay、Accessibility 均从 T010 Platform Environment Contract 暴露 runtime hook；示例 geometry 明确标为 `exampleOnly`，不是平台常量。
  - Reduced Motion 与小程序 motion constraints 直接消费 canonical T011；明确禁止高频 frame-by-frame `setData` animation。
  - T014 Agent Contract 同步接入 `mini-program` family；小程序 maturity 为 implemented 时会返回 `ready` 且 supporting output 为 `mini-program.wechat`，避免“状态 ready 但没有工程产物”。
  - Build Manifest 增加 `canonicalSourceHash`、`platformMaturity` 与 `wechat-mini-program` target。

## Verification evidence

- CI: Design System Build run `33895156705` (#207) PASS at `52ef0cc7eb439d68fe200f90a6785f0bbe083a77`; unit tests、真实 build、accepted report preservation、engineering/Penpot artifact upload 全部通过。
- Generated output: engineering artifact `9945427696` 包含 `wechat-mini-program/tokens.js`、`adapter.json` 与更新后的 `build-manifest.json`。真实产物记录 canonical source hash `f4cf589b9bbbffde37b8a44f8d5061d86fb421d1922aab96bfe1d09c8c705b69`，Mini Program maturity 为 `implemented`。
- Mini-program integration smoke: 对真实 artifact 的 `tokens.js` 执行 CommonJS `require()` 成功；Primary `#5B5EF7`、space.16 = 16、touch minimum = 44、comfortable control height = 44、Premium Gold primary `#D63D10` 均可读取。生成的小程序产物未泄漏 `cubic-bezier()`、`box-shadow`、CSS system font stack 或强制 `rpx` 表达。
- Runtime contract evidence: generated `adapter.json` 中 Safe Area / reserved region / Host Chrome runtime hooks 均由测试验证能在 T010 reference snapshot 中解析；微信 Capsule 保持 `owner=host`、`comDesignOwned=false`。
- AI review: CodeRabbit 对主实现 review 结论为 “No actionable comments” / Merge Risk Minimal；对最后 runtime-hook regression 增量 review 已触发。其 docstring coverage 为通用 warning，不是当前仓库 hard gate。Codex 已在 PR #33 上显式请求两次，但截至本次独立验收未返回 review，因此不虚构其结论，也不把它作为 T009 阻塞条件。

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: T009 满足第一阶段最小可用小程序 Adapter 的全部验收条件。小程序现在有真实、可消费、可追踪 source revision 的工程产物；平台/宿主差异通过 T010/T011 下游消费，不复制 Web / DOM / RN 假设，也没有建立第二套 WXSS 真相源。独立审查发现并修复了 T014 family 映射缺口，否则会出现 maturity=ready 但 supporting output 为空的问题。
- Follow-up: T016/T017/T018 现在可把 T009 作为 accepted dependency。完整 Mini Program Core Component package 仍明确不属于 T009 first-stage scope。
