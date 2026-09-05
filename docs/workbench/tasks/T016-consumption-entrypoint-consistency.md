# T016 · Human Guide / Skill / Library-consumption Consistency

- Status: REVIEW
- Target version: V2 first-stage
- Impact: Docs / Consumption / AI
- Owner: -

## Background

当前 README / SKILL / library-consumption 等入口仍有 Mobile/Web-only 或过时 catalog 信息。V2 machine contracts 稳定后必须消除“不同消费者看到不同 Com Design”的漂移。

## Goal

让 Human Guide、Skill、AI read order、Library consumption 与 V2 canonical contracts / adapters 一致。

## Must Read

- T001、T007、T008、T009、T014、T015 的最终结果
- `design-source/SKILL.md`
- `design-source/library-consumption.json`
- `design-source/README.md`
- root `README.md`
- `design-source/v2-planning/v2-prd.md`

## Scope

- 更新四端定位与 platform adapter 读取路径。
- 组件 / Composite / Pattern 数量从真实 catalog 派生或保持可验证一致。
- AI 指引优先读 canonical machine contract，而非复制 Preview。
- Human Guide / Penpot / Engineering 输出明确为同源下游消费者。

## Out of scope

- 不重做 V1 人类报告视觉。
- 不删除历史 accepted report。
- 不在本卡修改 adapter 语义。

## Acceptance

- [x] README / SKILL / library-consumption 不再把 Com Design 写成 Mobile-only。
- [x] 33 Core / 4 Composite / 6 Pattern 等公开事实与 catalog 一致。
- [x] AI / 研发 / 设计读取路径与 PRD 的 C→B→A consumer priority 不冲突。
- [x] 不再建议生产实现从 Preview DOM/CSS 反推其它平台。
- [x] docs links、validate、build 通过。

## Risks / Dependencies

- 前置：T001、T007、T008、T009、T014、T015。

## Implementation record

- Commit / PR: PR #41 (`task/T016-consumption-entrypoint-consistency` → `dev`); reviewed implementation head before evidence-only REVIEW update: `add8e9e251ebfaf1de68b37127272519f4ef03b9`.
- Changed paths:
  - `README.md`
  - `design-source/README.md`
  - `design-source/SKILL.md`
  - `design-source/library-consumption.json`
  - `tooling/src/consumption-consistency.mjs`
  - `tooling/src/validation-orchestrator.mjs`
  - `tooling/test/consumption-consistency.test.mjs`
  - `tooling/test/validation-orchestrator.test.mjs`
  - this task card and work ledger
- Notes:
  - Root README, design-source README and Skill now describe Com Design as Android / iOS / Web / WeChat Mini Program, not Mobile-only.
  - `library-consumption.json` is upgraded to `com-design:library-consumption:v2` and references canonical catalogs instead of duplicating a partial hand-maintained 6-component list.
  - Consumer priority is explicit: AI / Agent → Engineering / R&D → Design.
  - Platform contracts are explicit: Web `dist/tailwind/adapter.json`; iOS/Android `dist/native-mobile/adapter.json`; WeChat Mini Program `dist/wechat-mini-program/adapter.json`.
  - AI generated contract is `dist/agent/contract.json`, while authority remains `design-source/`.
  - Preview is reference-only and cannot be a production source. Non-Web platforms are explicitly forbidden from copying Preview DOM/CSS as implementation truth.
  - Penpot and Human Guide are encoded and validated as governed downstream consumers with `upstreamAuthority=false`.
  - A new `consumption-consistency` deterministic hard gate is part of `npm run validate`; it checks public catalog facts, four-platform adapter registry paths, canonical read-order links, AI/Human read-order entrypoints and downstream authority boundaries.

## Verification evidence

- CI: Design System Build #253, run `33975366296` — success on `add8e9e251ebfaf1de68b37127272519f4ef03b9`; 160/160 tests PASS; V2 validation 11 checks / 0 warnings; engineering build, Penpot build, accepted-report guard, T019 governance dry-run and T017 deterministic hard-gate enforcement all PASS.
- Link / catalog consistency: repository gate resolves real canonical counts as 33 Core Components / 4 Core Composite Components / 6 Core UX Patterns; expands every `components/{slug}.json` read-order template against the real component catalog; validates static canonical/human links; validates all four Platform Adapter contract paths against the registered engineering adapter outputs.
- Other evidence: focused negative tests reject partial hand-maintained catalogs, Preview promoted to production source, invalid platform adapter paths, Mobile-only public wording, stale public count claims, broken canonical read-order paths, and Penpot/Human Guide promoted to upstream authority. The first PR run #250 failed only because the stale-count negative fixture replaced one of multiple valid 33-count occurrences; the fixture was corrected, not the product rule, and subsequent #251/#253 runs are green.

## Review

- Reviewer: Mira
- Result: REVIEW
- Conclusion: Construction and deterministic verification complete. Codex reviewed the initial head without actionable findings. CodeRabbit is processing the hardened current head; per project rule, final acceptance may proceed by independent review if no actionable automated finding arrives.
- Follow-up: Final review should confirm public facts derive from canonical catalogs, four-platform implementation paths resolve through registered adapters, and no downstream consumer/Preview can become upstream truth.
