# Com Design V2 PRD — Q3 AI / Agent Consumer

> Parent: `v2-prd.md`  
> Status: Discovery / Draft  
> Scope: Q3 — 谁会使用 Com Design？

## Confirmed consumer priority

```text
1. AI / Agent
2. 研发
3. 设计师
```

## Confirmed AI / Agent role

用户选择：**C — AI / Agent 可以直接施工，并自行按照 Com Design 契约完成合规验收；人主要承担最终产品判断。**

这意味着 V2 的目标不止是 `AI-readable`，而是进一步达到：

```text
AI-readable
+ AI-executable
+ AI-verifiable
```

AI / Agent 应能够：

- 从 canonical machine source 读取 Token、Component、Composite、Pattern 与 Platform Adapter；
- 根据目标平台选择正确的实现路径，而不是从 Web Preview 猜测实现；
- 直接完成符合目标平台工程约束的生产代码施工；
- 在施工后依据 contract、state matrix、platform exception、validation rule 与生成证据自行做第一轮 Com Design 合规验收；
- 对无法自动判定的视觉、产品语义或平台体验问题明确升级给人，而不是自行猜测通过；
- 输出可审查的验收证据，让人知道“为什么它认为实现符合 Com Design”。

### Human responsibility

AI-first 不等于移除人类决策。

人主要负责：

- 产品目标与需求是否成立；
- 设计取舍是否符合真实用户体验；
- 平台例外是否值得接受；
- 品牌与审美质量是否达到上线标准；
- 最终产品验收与发布判断。

因此理想关系是：

```text
Com Design Contract
→ Agent implements
→ Agent validates compliance
→ Human judges product quality / exception / release
```

## Product implication

如果 V2 无法让 Agent 确定地回答“该用什么、如何实现、如何验证”，就还没有完成 AI-first 的消费目标。

机器可验证能力因此不是附属工具，而是 V2 的正式产品能力之一。
