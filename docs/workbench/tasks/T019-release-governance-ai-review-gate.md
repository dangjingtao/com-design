# T019 · Release Governance + Conditional AI Review Gate

- Status: REVIEW
- Target version: V2 first-stage
- Impact: CI / Review / Governance
- Owner: -

## Background

V2 已确认：确定性规则由机器硬门禁守住；国产 AI 等 Agent 施工的提交可增加额外 AI Review Gate；Mira 负责综合设计系统判断并拥有最终否决权。

## Goal

把这套治理模型落实为可执行、可审计的 release/review contract，而不是只留在 PRD 文本里。

## Must Read

- T017 任务卡及结果
- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/v2-prd-q5-governance.md`
- `docs/workbench/00-work-ledger.md`

## Scope

- 明确 hard gate → optional AI review → Mira judgment → release eligibility 顺序。
- 定义 AI Review Gate 触发 / 输出接口，可根据 Agent / 任务风险配置，不永久绑定厂商。
- review 输出至少包含 findings、warnings、evidence、decision status。
- 明确 Patch/Minor 兼容、Major breaking migration evidence、consumer version pinning。

## Out of scope

- 不让 AI Review 覆盖 deterministic hard gate。
- 不让 CI 全绿自动等于 PASS / release。
- 不自动升级下游项目版本。

## Acceptance

- [x] hard gate fail 时不能进入 release eligible。
- [x] 条件 AI Review Gate 有明确触发和 evidence contract。
- [x] Mira approve / revise / reject 作为正式 release judgment 被记录。
- [x] breaking change 需要 migration + impact evidence。
- [x] consumer 项目默认锁定版本并显式升级。

## Risks / Dependencies

- 前置：T017。
- 本卡完成不等于 V2 RC 通过，最终由 T026 集成验收。

## Implementation record

- Commit / PR: PR #40 (`task/T019-release-governance-ai-review-gate` → `dev`); reviewed implementation head before evidence-only REVIEW update: `ab48b46c24b46fc09fd78e3db001a3269c238501`.
- Changed paths:
  - `design-source/specs/release-governance-v1.json`
  - `design-source/schemas/release-governance-v1.schema.json`
  - `design-source/specs/design-system-v1.json`
  - `tooling/src/release-governance.mjs`
  - `tooling/bin/release-governance.mjs`
  - `tooling/test/release-governance.test.mjs`
  - `.github/workflows/design-system-build.yml`
  - `package.json`
  - this task card and work ledger
- Notes:
  - Canonical governance order is deterministic hard gates → conditional AI review → Mira judgment → release eligibility → consumer explicit upgrade.
  - AI Review Gate is vendor-neutral and policy-driven. Current triggers cover explicit review requests, medium+ Agent/mixed-Agent changes, and all critical-risk changes; reviewer evidence is AI/service based and requires a named reviewer plus non-empty evidence.
  - Missing `actorKind`, `riskLevel`, or explicit `forceAiReview` is itself release-blocking so callers cannot bypass conditional review by omitting risk metadata.
  - T017 evidence is structurally re-checked: canonical evidence id/result, tested head SHA, zero failed summary, and only passing hard-gate checks are required.
  - Mira `approve` requires rationale plus cited evidence. `revise` / `reject` are recorded and block release.
  - Patch/Minor reject breaking surfaces or required consumer code changes. Major requires breaking surface + migration summary/steps + impact evidence.
  - Consumer policy is pinned-by-default, no automatic upgrade, explicit upgrade + evidence required; Major additionally requires explicit impact confirmation.
  - CI dry-run intentionally remains `release=blocked` with `mira=pending`; CI proves governance execution but cannot self-approve a release.
  - T016's stale consumption/Skill wording remains intentionally untouched and in T016 scope.

## Verification evidence

- CI: Design System Build #243, run `33974683807` — success on `ab48b46c24b46fc09fd78e3db001a3269c238501`; full repository suite PASS, V2 validation/build/Penpot/report guard PASS, T017 deterministic hard gate PASS, governance dry-run artifact generated and uploaded.
- Governance dry-run: `hard=pass; ai=not-required; mira=pending; release=blocked`. This proves CI green does not imply formal release eligibility.
- AI review evidence sample: focused tests cover required AI review for Agent/mixed-Agent medium+ risk, AI `pass/revise/reject`, named reviewer + non-empty evidence, and unified findings/warnings/evidence/decisionStatus output. Negative tests also cover hard-gate override attempts, missing risk metadata, hollow T017 evidence, Mira approve without evidence, hidden Patch/Minor breaking changes, and incomplete Major migration evidence.

## Review

- Reviewer: Mira
- Result: REVIEW
- Conclusion: Construction and deterministic verification complete. CodeRabbit began review on an earlier head but had not produced actionable findings on the hardened final head at the time of this review; final acceptance proceeds by independent review per project rule.
- Follow-up: Final review must confirm no path can turn CI green, missing AI evidence, invalid version evidence, or non-approve Mira judgment into release eligibility.
