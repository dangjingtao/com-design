# Com Design V2 Planning Index

> Primary ledger: `../V2_PLANNING.md`  
> Purpose: 给 V2 专项规划建立统一入口，避免讨论内容散落后再次失去上下文。

`V2_PLANNING.md` 仍是主台账；当某个主题需要较长的跨平台 / 架构说明时，细节写入本目录，并从本索引统一发现。专项文档不是新的独立真相源，最终施工拆卡仍需回看主台账与对应专项。

## Current specialized notes

- `four-platform-readiness-audit.md` — Android / iOS / Web / 微信小程序四端 readiness、Source Integrity、Platform Adapter 与 9 月启用风险。
- `motion-foundation.md` — 跨端 Motion Foundation、semantic motion、platform mapping、reduced motion。
- `mobile-search-filter.md` — 移动端 Search / Filter 完整工作流、IME、draft/committed、三端映射。
- `incremental-loading.md` — Incremental Loading / Infinite List candidate、virtualization 边界与三端触发策略。
- `state-feedback.md` — Empty State 与 Result / Outcome / Blocking State 边界。
- `alert-banner.md` — Inline Alert 与 Banner 的结构 / 语义边界修正。
- `timeline.md` — Timeline connector / alignment / long-history visual acceptance。
- `switch.md` — Switch disabled visual differentiation 专项说明；主台账也记录了对应验收项。

## Governance

1. 新的简短确定需求仍直接写 `../V2_PLANNING.md`；
2. 专项内容过长时可以创建本目录文档，但必须加入本索引；
3. 专项文档必须标注 Confirmed / Candidate / Defect，不允许把讨论假装成已完成实现；
4. `整合 / 派卡 / 开始施工` 前，专项文档只规划，不直接修改 V1 Core implementation；
5. 四端相关决策优先检查 `four-platform-readiness-audit.md`，避免单个平台的实现细节反向污染 Core。
