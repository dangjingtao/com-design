# T017 · Deterministic CI Hard Gate + Evidence Artifact

- Status: REVIEW
- Target version: V2 first-stage
- Impact: CI / Validation / Evidence
- Owner: -

## Background

当前 GitHub Actions 已执行 unit tests + build + report protection，但 V2 需要完整运行 deterministic hard gates，并把结果作为 Agent / Reviewer 可消费 evidence。

## Goal

把 V2 validation、四端 adapters、AI contract、Penpot build 纳入 PR/dev CI，生成结构化 evidence artifact。

## Must Read

- T006-T009、T014、T015 的最终结果
- `.github/workflows/design-system-build.yml`
- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/v2-prd-q5-governance.md`

## Scope

- CI 执行完整 `npm test` / V2 validate / build targets。
- 保留 accepted human report unchanged guard。
- 上传 validation / adapter / Penpot / AI contract evidence。
- hard gate failure 阻止进入可评审状态。

## Out of scope

- 不让 CI 自动替代 Mira 最终放行。
- 不在本卡定义条件 AI Review 策略，交给 T019。

## Acceptance

- [x] PR/dev CI 运行 V2 deterministic gates。
- [x] 任一硬门禁失败 workflow 失败。
- [x] evidence artifact 包含 source SHA、checks、targets、pass/fail。
- [x] `report/design-system-v1/` 保护继续有效。
- [x] 四端 adapter / Penpot / AI machine outputs 可追溯同一 source revision。

## Risks / Dependencies

- 前置：T006、T007、T008、T009、T014、T015。

## Implementation record

- Commit / PR: PR #38 (`task/T017-deterministic-ci-evidence` → `dev`); reviewed implementation head before evidence-only docs update: `f2a353b4b46810e2720e5a41e896556935254a62`.
- Changed paths:
  - `.github/workflows/design-system-build.yml`
  - `package.json`
  - `tooling/src/ci-evidence.mjs`
  - `tooling/bin/ci-evidence.mjs`
  - `tooling/test/ci-evidence.test.mjs`
  - this task card and work ledger
- Notes:
  - Unit tests, V2 validation, engineering build, governed Penpot build and accepted-report protection are explicit hard-gate outcomes. Steps may continue only so CI can still emit failure evidence; the final enforcement step fails the job when any recorded gate fails.
  - `dist/ci/evidence.json` records the tested GitHub SHA, PR head SHA, canonical source hash, per-check pass/fail, target output hashes and source revision parity.
  - Formal traced targets are Validation, Web, iOS, Android, WeChat Mini Program, AI Contract, Penpot and the engineering build manifest.
  - Accepted V1 report protection now compares the actual base SHA → head SHA range with full git history. The previous clean-worktree diff could not prove a PR had not changed the accepted report.
  - T018 behavioral four-platform smoke semantics and T019 conditional AI review/release governance remain out of scope.

## Verification evidence

- CI run: Design System Build #227, run `33971812500` — success at PR merge-test SHA `371ed04969c3f4da0cc20228512b751183222be5`; 128/128 tests PASS; 10 V2 validation checks PASS with 0 warnings; engineering build emitted 25 artifacts; Penpot build PASS; accepted-report base→head guard PASS.
- Evidence artifact: `com-design-evidence-371ed04969c3f4da0cc20228512b751183222be5`, artifact ID `9971140975`; CI evidence result `pass`, 21 hard-gate checks, 8 traced targets, 0 blocking failures. Engineering artifact ID `9971141276`; Penpot artifact ID `9971141514`.
- Negative gate run: focused T017 tests prove the evidence becomes `fail` when a workflow hard gate fails, a platform/consumer source revision drifts, or a required traced output is missing. These negative cases passed inside the 128-test CI suite.

## Review

- Reviewer: Mira
- Result: REVIEW
- Conclusion: Construction complete; awaiting final independent review after the evidence-only task/ledger update reruns CI on the final PR head.
- Follow-up: T019 remains blocked until T017 reaches PASS.
