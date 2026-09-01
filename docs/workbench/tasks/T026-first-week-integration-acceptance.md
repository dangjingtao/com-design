# T026 · First-week Integration Acceptance / V2 RC Readiness

- Status: TODO
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

- [ ] T001-T025 均已达到 REVIEW 或 PASS 所需的真实证据，未完成前置不能被静默跳过。
- [ ] 最终 HEAD 的 `npm test`、`npm run validate`、`npm run build:all` 全部通过。
- [ ] Android / iOS / Web / WeChat Mini Program 均有正式 Adapter / smoke evidence，成熟度陈述真实。
- [ ] AI-readable / executable / verifiable contract 可消费并输出合规证据。
- [ ] Penpot / Human Guide / Skill 与 canonical source 无第二真相源漂移。
- [ ] CI hard gate + governance / AI Review Gate 可执行。
- [ ] V1 accepted human report 保持完整可读。
- [ ] Mira 完成最终 `approve | revise | reject` 判断后才可把本卡改为 PASS。

## Risks / Dependencies

- 前置：T001-T025。
- 任何 hard-gate failure 都必须回到责任卡修复，不在本卡主观豁免。

## Implementation record

- Commit / PR:
- Final dev HEAD:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Full test / validate / build:
- Four-platform smoke:
- AI / MCP evidence:
- Penpot evidence:
- Release evidence package:

## Review

- Reviewer: Mira
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
