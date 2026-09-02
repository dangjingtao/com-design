# T011 · Motion Foundation V2

- Status: PASS
- Target version: V2 first-stage
- Impact: Foundation / Motion
- Owner: -

## Background

V2 已确认 Motion 需要统一语义意图，而不是强迫四端使用完全相同的 CSS 物理参数。Reduced Motion 必须是一等能力。

## Goal

建立 `Motion Intent → Component/Pattern Contract → Platform Motion Adapter` 的机器可读基础。

## Must Read

- T002 任务卡及结果
- `design-source/v2-planning/motion-foundation.md`
- `design-source/v2-planning/v2-prd.md`
- 当前 motion tokens / adapter outputs

## Scope

- 定义 Micro、Enter/Exit、Expand/Collapse、Overlay、Navigation/Spatial、Collection Change、Continuous/Ambient 等语义类别。
- Reduced Motion first-class contract。
- 平台 mapping / interruption / reversibility / capability fields。
- schema、model、focused tests。

## Out of scope

- 不锁死所有 duration / easing 具体数值。
- 不让 Native contract 强制消费 CSS `cubic-bezier()` 字符串。
- 不在本卡改 T007/T008/T009 平台 adapter 文件。

## Acceptance

- [x] Motion intent 可机器读取。
- [x] Reduced Motion 有明确降级行为。
- [x] 四端可以映射不同物理实现但保持意图一致。
- [x] Mini Program contract 不要求高频 frame-by-frame `setData`。
- [x] focused tests 通过。

## Risks / Dependencies

- 前置：T002。
- T018 需要本卡作为 smoke 基线。

## Implementation record

- Commit / PR: PR #23; squash merge `3dd8487f51eca3197043c9067a6623de2770ae08`; formal review hardening PR #26, squash merge `1c5747dcc112edab6304e04c73c284c7d46c6d88`
- Changed paths: `design-source/schemas/motion-foundation-v2.schema.json`, `design-source/specs/motion-foundation-v2.json`, `design-source/specs/design-system-v1.json`, `tooling/src/motion-foundation.mjs`, `tooling/test/motion-foundation.test.mjs`
- Notes: 统一语义意图与 Reduced Motion contract；正式提升为 canonical source；不修改 T007/T008/T009 平台 adapter。

## Verification evidence

- Original CI: Design System Build run `33650167866` — success。
- Formal combined review CI: run `33652886819` — success；76 tests PASS，`build:all` PASS。
- Motion contract examples: `motion.transition.micro`, `motion.transition.overlay`, `motion.transition.navigation-spatial`, `motion.transition.continuous-ambient`。
- Reduced-motion evidence: decorative remove；large spatial cross-fade；essential progress simplify；ambient loop stop-by-default。
- Canonical evidence: manifest `sources.motionSchema` / `sources.motionContract` 已纳入 Canonical Design Model provenance。

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: UX / interaction review passed. Motion prioritizes state clarity, native host navigation/gesture behavior, interruption/reversibility, focus and collection-position stability over spectacle. Reduced Motion is first-class and Mini Program avoids frame-by-frame `setData`. The initial review found the motion contract was not yet canonical; PR #26 corrected that governance gap and the combined regression gate passed.
- Follow-up: T018 may consume this contract as its motion smoke baseline. Concrete duration/easing values remain subject to later real-device validation as intentionally scoped.
