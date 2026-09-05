# T017 · Deterministic CI Hard Gate + Evidence Artifact

- Status: DOING
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

- [ ] PR/dev CI 运行 V2 deterministic gates。
- [ ] 任一硬门禁失败 workflow 失败。
- [ ] evidence artifact 包含 source SHA、checks、targets、pass/fail。
- [ ] `report/design-system-v1/` 保护继续有效。
- [ ] 四端 adapter / Penpot / AI machine outputs 可追溯同一 source revision。

## Risks / Dependencies

- 前置：T006、T007、T008、T009、T014、T015。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI run:
- Evidence artifact:
- Negative gate run:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
