# T026 · First-week Integration Acceptance / V2 RC Readiness

- Status: PASS
- Target version: V2 first-stage
- Impact: Integration / Review / Release Readiness
- Owner: -

## Background

V2 第一周目标不是“组件越多越好”，而是 Source → Contract → Adapter → Validation → AI Consumption → Governance 主干闭环。所有前置卡完成后必须在同一个最终 `dev` HEAD 上重新做一次集成验收，不能把分散线程各自的绿灯简单相加。

## Goal

整合 T001-T025，解决 catalog / contract / adapter / docs / CI 的最后边缘冲突，并形成交给 Mira 的 V2 first-stage RC evidence package。

## Must Read

- `docs/workbench/00-work-ledger.md`
- T001-T025 Implementation record / Verification evidence / Review
- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/four-platform-readiness-audit.md`
- `design-source/v2-planning/v2-prd-q5-governance.md`

## Scope

- 在最新 `dev` HEAD 重跑全部 repository tests / validate / build。
- 对账 manifest、schemas、canonical model、四端 adapters、AI/MCP、Penpot、Human/Skill consumer entrypoints。
- 执行 T018 four-platform smoke。
- 检查 accepted V1 human report 未被删除 / 覆盖。
- 汇总 hard compliance、soft findings、evidence、exceptions。
- 给 Mira 提交 `approve | revise | reject` 所需完整证据。

## Out of scope

- 不在总验收卡临时塞入大规模新功能。
- 不把未完成能力改名为“已支持”来凑 RC。
- 不因为 CI 全绿自动标记 PASS。

## Acceptance

- [x] T001-T025 均已达到 REVIEW 或 PASS 所需的真实证据，未完成前置不能被静默跳过。
- [x] 最终 HEAD 的 `npm test`、`npm run validate`、`npm run build:all` 全部通过。
- [x] Android / iOS / Web / WeChat Mini Program 均有正式 Adapter / smoke evidence，成熟度陈述真实。
- [x] AI-readable / executable / verifiable contract 可消费并输出合规证据。
- [x] Penpot / Human Guide / Skill 与 canonical source 无第二真相源漂移。
- [x] CI hard gate + governance / AI Review Gate 可执行。
- [x] V1 accepted human report 保持完整可读。
- [x] Mira 完成最终 `approve | revise | reject` 判断后才可把本卡改为 PASS。

## Risks / Dependencies

- 前置：T001-T025。
- 任何 hard-gate failure 都必须回到责任卡修复，不在本卡主观豁免。

## Implementation record

- Commit / PR: PR #47, branch `task/T026-first-week-integration-acceptance` from final predecessor `dev@1e836b63b9c82403a237a92fe648d09144db3133`.
- Final dev HEAD: predecessor integration baseline `1e836b63b9c82403a237a92fe648d09144db3133`; current RC candidate head `91d809e832e052f51ebd2fe1317a61d56bf77b78`.
- Changed paths:
  - release requirement → executable evidence trace and tests
  - semantic contrast audit + Premium Gold light action-text correction
  - deterministic component CSS extractor / 34-component parity gate / regenerated downstream aggregate
  - Human Guide current-V2-facts overlay while retaining the accepted V1 report unchanged
  - explicit `build:all` and four-platform smoke CI hard-gate outcomes
  - MCP target/source-parity evidence
  - RC integration evidence/docs/tests
- Notes:
  - Predecessor baseline already had T001-T025 PASS, Design System Build #321 success and Human Docs #177 success on the same SHA.
  - RC audit found and closed real integration blockers instead of waiving them: stale `components.css`, missing executable ownership for manifest release requirements, no explicit contrast gate, Human Guide current/baseline ambiguity, and CI not directly treating `build:all` as a first-class hard gate.
  - `design-source/components.css` is now explicitly downstream/non-canonical and reproducible from marked Preview CSS blocks; current aggregate independently rechecked 34/34 against the component catalog.
  - Premium Gold low-fill brand action text was raised from brand-600 to brand-700 so the audited Secondary action pairing meets normal-text contrast.
  - Manifest release requirements carry explicit validation / CI / governance evidence ownership; all 19 declared requirements resolve to registered, T019-backed evidence IDs.
  - Human Pages keep `report/design-system-v1/` immutable as the accepted V1 baseline while a generated overlay publishes current V2 RC facts (34 Components / 4 Composites / 7 Patterns) and canonical-source authority.
  - No new Core Component, Composite, UX Pattern, platform target, or product feature is introduced by T026.

## Verification evidence

- CI: Design System Build #337 — success on exact REVIEW-state head `6e3fb5a384de2373b1d649e38f15ae6c167b80ba`; predecessor substantive Build #335 was also fully green.
- Full test / validate / build: 242/242 repository tests PASS; deterministic validation 18/18 checks PASS with 0 warnings; `build:all` PASS; component CSS parity 34/34 PASS; 25 CI hard checks / 9 traced targets PASS.
- Four-platform smoke: T018 `smoke:four-platform` PASS, 43/43 checks across Web / iOS / Android / WeChat Mini Program; platform adapter/source-parity evidence remains hard-gated.
- AI / MCP evidence: Canonical Design Model V2 builds successfully; Agent contract generated; MCP manifest/tokens/package tests PASS and MCP is now a traced CI target tied to the canonical engineering source revision.
- Penpot evidence: governed Penpot manifest build PASS with canonical authority/source revision; artifact `com-design-penpot-ed5444a3af28ef05c6f83fcc4cfa672e849eda56` (artifact 9981107508).
- Release evidence package: `com-design-evidence-ed5444a3af28ef05c6f83fcc4cfa672e849eda56` (artifact 9981106820) contains CI/governance/validation/model/adapters/Agent/MCP/smoke/Human overlay/Penpot evidence; engineering artifact 9981107187. Release governance dry-run reports `hard=pass`, `ai=not-required`, `mira=pending`, which is expected before this card's final Mira judgment.
- Human evidence: accepted `report/design-system-v1/` unchanged guard PASS; Human Guide current-facts tests PASS and clearly label the V1 body as retained baseline rather than current V2 catalog.
- Hard compliance: no blocking failure remains on the candidate head; every declared release requirement has executable evidence ownership.
- Soft / first-stage residuals (non-blocking): versioned next-generation Human Doc generator/current-pointer flow, component recipe/type generation, stronger future cross-target snapshots, and stable package distribution beyond GitHub Actions artifacts remain explicitly pending in `BUILD_PIPELINE.md`. WeChat Mini Program full Core Component package remains outside first-stage adapter scope.
- Exception semantics: `governance:dry-run` remains release-blocked solely because it intentionally has no final Mira approval input; T026 REVIEW does not reinterpret that pending judgment as a hard-gate failure.

## Review

- Reviewer: Mira
- Result: PASS
- Decision: `approve`
- Conclusion: V2 first-stage RC readiness is approved. T001-T025 all carry real Mira/PASS evidence; the final integrated branch closes the RC-level drift found during T026 rather than waiving it. Source → Contract → Canonical Model → Adapter → Validation → AI/MCP/Penpot/Human consumers → CI evidence → release governance is mechanically traceable on one candidate lineage. The four formal platforms retain truthful first-stage Adapter/smoke evidence; accepted V1 Human Guide evidence remains immutable while the live Human page clearly publishes current V2 facts. No hard-compliance failure or unresolved review thread remains. CodeRabbit produced no actionable review finding before final judgment; Codex repository review was unavailable because its quota is exhausted, so Mira completed the independent final review.
- Follow-up: Approval is scoped to V2 first-stage RC readiness. Versioned next-generation Human Doc generation/promotion, component recipe/type generation, stronger future cross-target snapshots, and stable package distribution remain explicit non-blocking roadmap work and must not be advertised as complete. Stable release still follows T019 release governance and consumer explicit-upgrade policy.
