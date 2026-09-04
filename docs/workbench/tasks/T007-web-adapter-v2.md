# T007 · Web Adapter V2

- Status: PASS
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

- CI: final reviewed code head `8e0350337b650a8c8fe8b7e3ea02bcacd0b853ff` passed Design System Build run `33825084563` (#188): 101/101 tests PASS; validation 9 checks / 0 warnings; `build:all` PASS; accepted human report unchanged gate PASS; Engineering and Penpot artifact uploads PASS.
- Adapter snapshot: `dist/tailwind/adapter.json` emitted in engineering artifact `9919633706`; build produced 22 engineering artifacts from 138 consumer tokens and Canonical Design Model V2.
- Other evidence: focused Web tests prove Tailwind semantic token compatibility, explicit Web platform/context + pointer/keyboard/focus evidence, rejection of missing canonical/environment inputs, independence from component CSS/DOM strings, and direct propagation of future T012 responsive/input rule changes through `canonical-model.layoutInput`.

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: Independent acceptance completed. Review found two issues before PASS: one P1 test-regex defect that prevented the first CI run, and one substantive P2 consumption gap where Web was marked implemented/ready while only consuming T012 axis vocabulary rather than its responsive/input rules. The P1 was replaced with literal selector assertions. The P2 was fixed by exposing the validated T012 foundation with provenance in Canonical Design Model V2 and deriving Web `viewportRules`, `inputRules`, `interactionStatePolicy`, content-scale policy and modality mappings from that canonical field. Regression coverage proves future T012 guidance flows into `adapter.json` rather than being hard-coded. Both review threads are resolved, 101/101 tests and all repository gates pass, Web remains a downstream adapter rather than a cross-platform truth source, and T008/T009 ownership is untouched.
- Follow-up: T016/T017/T018 may consume T007 as an accepted dependency. T008/T009 must follow the same registry/canonical-consumer boundary without copying Web presentation semantics.
