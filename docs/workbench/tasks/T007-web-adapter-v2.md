# T007 · Web Adapter V2

- Status: REVIEW
- Target version: V2 first-stage
- Impact: Web / Adapter
- Owner: -

## Background

Web/Tailwind 目前是最成熟工程输出，但 V2 不允许它继续充当其它平台的隐式定义。

## Goal

让 Web 成为从 Canonical Design Model 派生的正式 Platform Adapter，同时保留 Com Design 视觉身份与现有 Tailwind 消费路径。

## Must Read

- T004、T005 任务卡及其实现结果
- `design-source/BUILD_PIPELINE.md`
- `tooling/src/adapters.mjs` / T004 后的新 adapter modules
- `design-source/v2-planning/v2-prd.md`

## Scope

- Web/Tailwind adapter 改为消费 canonical model。
- 明确 Web platform/context evidence。
- 支持 pointer / keyboard / focus 能力表达，不改 Core 语义。
- 清除 platform-neutral contract 中不必要的 CSS 字符串泄漏。

## Out of scope

- 不重写 Human Guide。
- 不替小程序 / Native Mobile 做映射。

## Acceptance

- [x] Tailwind semantic token consumer path 继续可用。
- [x] Web adapter 明确目标 platform/context。
- [x] keyboard/focus/pointer 作为 context 能力而非 Core 分叉。
- [x] canonical contract 不依赖 DOM/CSS 结构解释。
- [x] tests、validate、build 通过。

## Risks / Dependencies

- 前置：T004、T005。

## Implementation record

- Commit / PR: branch `task/T007-web-adapter-v2`; PR #29 against `dev`; substantive verified code head `5bbeda379b29cfb0eb779e57fe24c2cd3b6644ac`.
- Changed paths:
  - `tooling/src/adapters/tailwind.mjs`
  - `tooling/src/adapters/registry.mjs`
  - `tooling/src/design-model.mjs`
  - `tooling/bin/build.mjs`
  - `design-source/specs/design-system-v1.json`
  - focused adapter / canonical-model / agent-contract regression tests
- Notes:
  - T007 was replayed onto accepted T012 `dev` head `e23c503d6d4e774bc604ae921a71aebf4a7affb2` after `dev` advanced during construction.
  - `web.tailwind` now requires Canonical Design Model V2 and projects only canonical token data into the existing Tailwind renderers; NativeWind / React Native mappings remain owned by T008 and are not changed by this card.
  - `dist/tailwind/adapter.json` records Web target/platform axes plus T010-backed pointer, keyboard and focus capability evidence. Input modality never forks Core semantics.
  - Canonical token themes retain their Web selector metadata so the existing premium theme consumer path remains available after the adapter input migration.
  - Web adapter maturity is now `implemented`; responsive/input behavior is consumed from the accepted T012 foundation rather than redefined in T007.
  - Existing component contracts still contain some historical CSS-like trait/structure strings. T007 does not mass-migrate the 33 contracts; instead Web Tailwind generation is explicitly isolated from component contract / Preview DOM/CSS interpretation, with a regression test proving injected CSS/DOM strings cannot change preset/theme output.

## Verification evidence

- CI: Design System Build run `33820394112` (#185) — success on code head `5bbeda379b29cfb0eb779e57fe24c2cd3b6644ac`; 100/100 tests PASS; validation 9 checks / 0 warnings; `build:all` PASS; accepted human report unchanged gate PASS; Engineering and Penpot artifact uploads PASS.
- Adapter snapshot: `dist/tailwind/adapter.json` emitted in engineering artifact `9918051162`; build produced 22 engineering artifacts from 138 consumer tokens and Canonical Design Model V2.
- Other evidence: focused Web tests prove Tailwind semantic token compatibility, explicit Web platform/context + pointer/keyboard/focus evidence, rejection of missing canonical/environment inputs, and independence from component CSS/DOM strings.

## Review

- Reviewer: Mira (pending independent review)
- Result: REVIEW
- Conclusion: Builder implementation and deterministic repository gates are complete; no PASS is self-declared. Independent design-system acceptance remains required before merge.
- Follow-up: Review PR #29 against T007 acceptance and confirm the Web adapter boundary does not pre-empt T008/T009 or reintroduce Web as the implicit cross-platform definition.
