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

## Compliance governance

用户选择：**B — 硬规则自动门禁，软规则输出 warning / evidence，由人做最终判断。**

V2 不应把所有设计问题都伪装成可机器二值判断的问题，也不应把本可确定验证的规则全部丢给 Agent 自由发挥。

因此合规治理分为两层：

### Hard gate

适合机器确定判断、违反即失败的规则，例如：

- canonical source / manifest / schema 引用完整性；
- Token、Component、Variant、State 等 contract 可解析且引用合法；
- 必需状态、必需 anatomy、平台 Adapter 映射存在；
- 明确的 accessibility / touch target / semantic constraints；
- 禁止使用的 literal value、非法 semantic mapping 或已声明 incompatible pattern；
- 生成物与 canonical source 的一致性；
- 可自动验证的 contract ↔ implementation / preview parity。

Hard gate 失败意味着 Agent 不能自行宣告 Com Design 合规。

### Soft review

无法可靠压缩成布尔规则、但仍应被结构化审查的问题，例如：

- 信息层级是否足够清楚；
- 品牌色使用面积是否克制；
- 某个平台例外是否真的比统一表现更自然；
- 动效节奏、视觉平衡、密度与审美质量；
- 是否出现虽然“规则合法”但产品体验明显别扭的组合；
- 新场景是否说明 Core / Composite / Pattern 需要演进。

Agent 对此必须输出 warning、观察与证据，而不是把主观判断伪装成自动通过。

理想验收结果不是单一 `pass / fail`，而更接近：

```text
hard compliance: pass | fail
soft findings: warning[]
evidence: evidence[]
exceptions: exception[]
human decision: accept | revise | reject
```

因此 V2 的 AI-first 治理原则是：

> **能确定的规则机器负责守住；需要判断的质量问题机器负责举证，人负责裁决。**

## Product implication

如果 V2 无法让 Agent 确定地回答“该用什么、如何实现、如何验证”，就还没有完成 AI-first 的消费目标。

机器可验证能力因此不是附属工具，而是 V2 的正式产品能力之一。
