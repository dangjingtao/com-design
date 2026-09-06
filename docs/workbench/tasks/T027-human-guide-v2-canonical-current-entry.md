# T027 · Human Guide V2 Canonical Consumption + Versioned Current Entry

- Status: REVIEW
- Target version: V2 documentation follow-up
- Impact: Docs / Human Consumption / Pages
- Owner: -

## Background

T026 已完成 V2 first-stage RC 集成验收，但当前线上 Human Guide 仍以 `report/design-system-v1/` 的 accepted V1 页面为主体，通过 current-facts overlay 临时标注 V2 的 34 Core Components / 4 Core Composite Components / 7 Core UX Patterns。这个方案保证了历史验收证据不被覆盖，也避免了公开页面继续把旧数字当成当前事实，但它不是完整的 V2 Human Guide。

当前已确认的真实缺口包括：

- V1 页面主体仍存在 33 Components / 6 Patterns / Com Design Mobile 等历史文案。
- Composite 章节由运行时 JS 注入，不是当前 V2 Human Guide 的稳定结构。
- 第 7 个 Core UX Pattern（Incremental Loading / Infinite List）没有作为完整当前内容进入旧 Human Guide 主体。
- 当前 Pages 入口依赖 overlay 纠正事实，而不是直接发布一个 canonical-driven 的 versioned V2 Human Guide。
- `report/design-system-v1/` 是 accepted historical evidence，必须继续原样保留。

## Goal

建立一个真正面向当前 V2 的、版本化的人类可读入口。当前 catalog / composite / pattern / source authority 等事实直接来自 canonical source，不再依赖 overlay 去修正旧页面数字；同时保留 accepted V1 Human Guide 作为历史验收证据。

## Must Read

- `docs/workbench/00-work-ledger.md`
- T016 Human Guide / Skill / Library-consumption Consistency
- T022 Incremental Loading / Infinite List Pattern
- T023 State Feedback + Alert/Banner Semantics
- T026 First-week Integration Acceptance / V2 RC Readiness
- `design-source/v2-planning/v2-prd.md`
- `design-source/SKILL.md`
- `design-source/components/index.json`
- `design-source/specs/core-composites.json`
- `design-source/specs/core-patterns.json`
- `tooling/src/human-guide-overlay.mjs`
- `.github/workflows/pages.yml`
- `report/design-system-v1/`（只读 accepted evidence）

## Scope

- 新建版本化 V2 Human Guide current entry；不得原地覆盖 `report/design-system-v1/`。
- Human Guide 当前事实直接由 canonical source / build-time data 生成或读取：
  - 34 Core Components
  - 4 Core Composite Components
  - 7 Core UX Patterns
  - 当前 V2 version / canonical manifest / downstream authority
- 34 个 Core Component 均可从当前 Human Guide 被发现并进入对应 Preview / Contract；Result State 必须作为正式第 34 个组件出现。
- 4 个 Core Composite Component 必须作为当前 V2 的稳定章节存在，不再依赖旧 V1 页面上的临时 DOM 注入来成立。
- 7 个 Core UX Pattern 必须完整出现；Incremental Loading / Infinite List 不得遗漏。
- Current Human Guide 不再以“旧 V1 主体 + overlay 修事实”作为正常运行模式。
- Pages / current pointer 明确：
  - 当前入口指向 V2 Human Guide；
  - accepted V1 仍可访问，并明确标注 historical / accepted baseline；
  - current pointer / build record 可追踪到 canonical source revision。
- Human Guide、Preview、Penpot、UI Kits 继续是 downstream consumer，不得形成第二真相源。
- 为当前事实、版本入口、34/4/7 catalog、V1 immutable guard 增加 deterministic tests / validation evidence。

## Out of scope

- 本卡不做完整 Open Design 视觉重构；视觉与 token 收口由 T028 承担。
- 不借 Human Guide 重写 Core Component / Composite / Pattern contract。
- 不把 Preview DOM/CSS 提升为生产或 canonical truth。
- 不删除、重命名或原地修改 accepted `report/design-system-v1/` 以伪装成 V2。
- 不用手工复制 34/4/7 列表形成另一份长期维护的 catalog。

## Acceptance

- [ ] 当前 Human Guide 有独立、版本化的 V2 入口，不再把 accepted V1 页面伪装成当前 V2。
- [ ] 当前 Human Guide 的 34 Components / 4 Composites / 7 Patterns 均由 canonical source 驱动，并有 deterministic consistency gate。
- [ ] Result State 可在人类组件目录中被发现、查看 Preview 和 Contract。
- [ ] Incremental Loading / Infinite List 作为第 7 个 Core UX Pattern 完整出现。
- [ ] Composite 章节是 V2 当前结构的一部分，不依赖旧 V1 DOM 注入才存在。
- [ ] Current Pages pointer 指向 V2；accepted V1 仍完整可访问并保持 immutable guard PASS。
- [ ] 页面明确说明 canonical authority 与 downstream consumer 边界，不产生第二真相源。
- [ ] `npm test`、`npm run validate`、相关 Human Guide / Pages build 全部通过，并提供 current-entry + catalog evidence。
- [ ] Mira 完成 final review 后方可 PASS。

## Risks / Dependencies

- 前置：T026。
- 与 T028 串行：T027 先固定当前 V2 的信息结构、数据来源和发布入口；T028 不得在 T027 未稳定前自行复制/重建另一套数据结构。
- 若实现发现 current pointer / Pages pipeline 与 T019 release governance 有冲突，必须报告并按 governance 规则处理，不得绕过。

## Implementation record

- Commit / PR: PR #50 (`task/T027-human-guide-v2-canonical-current-entry` → `dev`); reviewed implementation head before REVIEW evidence update: `9ed8e8629405adcab62b1686b8cc301d60f7086a`.
- Changed paths:
  - `report/design-system-v2/` — current V2 Human Guide shell; component / composite / pattern catalogs are loaded from canonical JSON.
  - `tooling/src/human-guide-v2.mjs` + `tooling/bin/human-guide-v2.mjs` — canonical facts validator, versioned current metadata and root pointer builder.
  - `tooling/test/human-guide-v2.test.mjs` — 34/4/7, Result State, Incremental Loading, V1 retention and current-pointer coverage.
  - `.github/workflows/pages.yml` — `/ → /versions/<canonical-version>/`, V2 version page, `/accepted/v1/` retained baseline, same-revision canonical assets.
  - `design-source/library-consumption.json` + consumption validator/test — distinguish current V2 Human Guide from accepted V1 evidence while keeping both downstream.
  - `tooling/src/validation-orchestrator.mjs`, `build-all.mjs`, `package.json`, root/report README — current Human Guide validation/build/read-order documentation.
- Notes:
  - V2 Human Guide does not hard-code 34/4/7; it reads `components/index.json`, `core-composites.json` and `core-patterns.json` directly.
  - Result State appears through the canonical component catalog; Incremental Loading appears through the canonical pattern catalog.
  - `report/design-system-v1/` is untouched. The deployed accepted copy remains under `/accepted/v1/`; the legacy overlay is scoped there only and no longer drives the current root.
  - T027 intentionally keeps visual treatment minimal/structural; Open Design refresh and Human shell token cleanup remain T028.

## Verification evidence

- CI: Design System Build #351, run `34036032197` — PASS on implementation head `9ed8e8629405adcab62b1686b8cc301d60f7086a`.
- Repository tests: 246/246 PASS; deterministic validation 18/18 checks PASS with 0 warnings.
- Canonical catalog evidence: Human Guide builder reports `1.0.0-rc.2 · 34 components · 4 composites · 7 patterns`; Result State and Incremental Loading are asserted from canonical catalogs rather than handwritten Human data.
- Current-entry / Pages evidence: deterministic Human Guide validation confirms `report/design-system-v2/`, versioned `/versions/<canonical-version>/`, generated root pointer/current.json, and V1-only legacy overlay scope. Actual GitHub Pages deployment is intentionally verified after merge because Pages publishes on `dev` push.
- Accepted V1 guard: CI `Verify accepted report was not changed` PASS; `report/design-system-v1/` has no PR diff.
- Other evidence: T018 four-platform smoke 43/43 PASS; T017 deterministic hard gate 25 checks / 9 traced targets PASS. First CI #349 correctly failed because two compatibility tests regressed; both were repaired by preserving existing Human evidence fields and diagnostic wording rather than weakening tests.

## Review

- Reviewer: Mira
- Result: REVIEW
- Conclusion: Implementation review passes for merge-to-dev verification. V2 Human Guide is a downstream canonical consumer, current/versioned routing is build-derived, accepted V1 remains immutable, and T028 visual scope was not pulled into T027. Codex review is unavailable due quota; CodeRabbit has not produced an actionable review thread on the current implementation, so Mira completed independent review. Final PASS is held until the post-merge Pages deployment proves the current pointer and accepted V1 path in the real publishing workflow.
