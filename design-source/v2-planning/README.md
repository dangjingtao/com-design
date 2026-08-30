# Com Design V2 Planning Index

> Primary planning ledger: `../V2_PLANNING.md`  
> Formal PRD: `v2-prd.md`  
> Dispatched execution ledger: `v2-task-ledger.md`  
> Purpose: 给 V2 专项规划、产品定义与施工任务建立统一入口，避免上下文再次散落。

`V2_PLANNING.md` 保留规划历史；`v2-prd.md` 是当前 V2 产品定义；进入施工后，以 `v2-task-ledger.md` 的 Task Contract + 当前仓库事实作为执行入口。专项文档提供长篇设计/架构依据，但不能覆盖更新后的 PRD、任务合同或当前代码事实。

## Execution

- `v2-prd.md` — V2 正式 PRD：跨端目标、消费者、责任边界、治理与第一周完成标准。
- `v2-task-ledger.md` — 第一周 26 张已派任务卡、依赖图、并行批次、文件所有权与验收规则。

## Current specialized notes

- `four-platform-readiness-audit.md` — Android / iOS / Web / 微信小程序四端 readiness、Source Integrity、Platform Adapter 与 9 月启用风险。
- `motion-foundation.md` — 跨端 Motion Foundation、semantic motion、platform mapping、reduced motion。
- `mobile-search-filter.md` — 移动端 Search / Filter 完整工作流、IME、draft/committed、三端映射。
- `incremental-loading.md` — Incremental Loading / Infinite List candidate、virtualization 边界与三端触发策略。
- `state-feedback.md` — Empty State 与 Result / Outcome / Blocking State 边界。
- `alert-banner.md` — Inline Alert 与 Banner 的结构 / 语义边界修正。
- `timeline.md` — Timeline connector / alignment / long-history visual acceptance。
- `switch.md` — Switch disabled visual differentiation 专项说明；主台账也记录了对应验收项。
- `v2-prd-q3-ai-agent.md` — AI / Agent 第一消费者、hard gate / soft review、Penpot downstream 角色。
- `v2-prd-q4-boundary.md` — Core / Platform Adapter / Product Extension 责任边界。
- `v2-prd-q5-governance.md` — Mira review / veto、版本兼容、项目版本锁、条件 AI Review Gate。
- `v2-prd-q6-first-week.md` — 9 月第一周高并行交付策略。

## Governance

1. 新的简短确定需求仍先记录进 `../V2_PLANNING.md`；
2. 专项内容过长时可以创建本目录文档，但必须加入本索引；
3. `v2-prd.md` 已收口的产品决策优先于早期 Candidate 讨论；
4. 已派任务必须读取 `v2-task-ledger.md` 对应 Task Contract，并在施工前重新核对当前 `dev` HEAD；
5. 任务卡不能覆盖更新后的仓库事实；冲突必须先报告，不得脑补施工；
6. 四端相关决策优先检查 `four-platform-readiness-audit.md` 与 Platform Adapter contracts，避免单个平台实现反向污染 Core；
7. 并行以语义竞态为准，不以“文件不同”作为充分条件；共享 schema / adapter registry / validator / CI / token source 必须遵守任务卡文件所有权；
8. Mira 负责跨卡架构一致性、证据审查和最终 approve / revise / reject；CI 全绿是必要条件，不是自动放行。
