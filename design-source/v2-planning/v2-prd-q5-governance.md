# Com Design V2 PRD — Q5 Governance

> Parent: `v2-prd.md`  
> Status: Discovery / Draft  
> Scope: Q5 — 落地与治理

## Confirmed governance direction

用户判断：**正式版本的主要评审 / 放行判断由 Mira 承担；机器硬门禁负责确定性约束；对于国产 AI 施工产生的提交，可以额外增加 AI Review Gate。**

因此 V2 的治理不是简单的“人批准”或“CI 全绿即发布”，而是分层治理：

```text
Deterministic hard gates
→ AI review gate when required
→ Mira review / release judgment
→ formal version
```

### 1. Deterministic hard gates

所有提交，无论由人、Mira、国产 AI 或其他 Agent 产生，都必须先通过可机器确定的基础门禁，例如：

- canonical source / manifest / schema 完整性；
- Token、Component、Composite、Pattern、Adapter contract 可解析；
- generated outputs 与 canonical source 一致；
- required states / platform mapping / accessibility constraints 完整；
- contract ↔ preview / implementation parity 中可自动验证的部分；
- build / validation / smoke checks。

这些属于事实性约束，不应由审查者主观放行。

### 2. AI Review Gate

对于由国产 AI 等 Agent 直接施工产生、且需要更强质量兜底的提交，可以增加独立 AI Review Gate。

AI Review Gate 的目标不是根据模型来源做价值判断，而是针对 **AI-generated change 的施工风险** 提供额外独立审查。它应检查：

- 是否正确理解 Com Design contract；
- 是否误把 Web 实现复制到其他平台；
- 是否产生 literal / semantic drift；
- 是否漏掉状态、异常路径、平台差异或 accessibility；
- 是否出现实现虽能 build，但与设计意图不一致；
- 是否提供足够 evidence 支撑“可合并 / 可发布”的判断。

未来可根据模型、Agent、历史稳定性和任务类型调整是否触发，而不必把额外门禁永久绑定某一厂商。

### 3. Mira as primary reviewer / release judge

V2 的正式治理中，Mira 是主要的 Design System review / release judgment 角色。

Mira 不替代确定性 CI，而是在硬门禁之后负责综合判断：

- 变更是否符合 V2 产品方向；
- 是否延续 V1 已成立的设计思想；
- breaking change 是否有真实跨端理由；
- Core / Product Extension / Platform Adapter 边界是否正确；
- soft findings 是否值得接受；
- evidence 是否足够；
- 当前版本是否具备进入正式版本的质量。

理想结果不是“AI 说通过就通过”，而是：

```text
hard compliance: pass | fail
AI review findings: finding[]
soft findings: warning[]
evidence: evidence[]
Mira decision: approve | revise | reject
```

## Mira final veto

用户选择：**A — Mira 拥有最终否决权。**

即使 deterministic CI 与额外 AI Review Gate 都已经通过，Mira 仍可以因为设计系统方向、架构边界、跨端语义、软质量判断或 evidence 不足而拒绝进入正式版本。

这意味着“全绿”只能证明已经满足当前可机器化与已配置审查规则，不能自动等价为“Com Design 设计系统判断已经通过”。

Mira 可以据此要求 `revise` / `reject`，典型理由包括：

- 变更在局部合法，但整体方向偏离 V2；
- 为解决单端问题破坏了共享 contract 或长期跨端能力；
- Core / Platform Adapter / Product Extension 责任边界放错；
- 虽然没有硬规则失败，但设计意图、状态语义或体验质量存在明显问题；
- breaking change 的收益与证据不足；
- review evidence 不足以支持正式版本承诺。

Mira 的否决不是替代 CI，也不能把已经失败的硬门禁主观改成通过。治理关系是单向的：

```text
hard gate fail → cannot release
hard gate pass + AI gate pass → eligible for Mira judgment
Mira reject → cannot release
Mira approve → eligible for formal release
```

因此最终治理原则是：

> **门禁决定“是否具备被评审的资格”，Mira 决定“是否值得进入正式版本”。**

### Governance principle

> **机器守住确定性底线，额外 AI 门禁用于审查 AI 施工风险，Mira 负责综合设计系统判断，并拥有正式版本最终否决权。**

### Current question

- 对已经进入正式版本的 Core contract / Token / Component，V2 是否需要明确的兼容策略：默认保持向后兼容，还是允许在 major 版本中主动 breaking？
