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

## Compatibility and versioning

用户选择：**B — Minor / Patch 默认保持向后兼容；Major 可以明确 breaking，但必须提供迁移说明和影响证据。**

用产品消费视角表达：

```text
2.0.1 / patch
→ 修复缺陷，不应要求消费项目改代码

2.1.0 / minor
→ 增加兼容能力，不应主动破坏既有消费接口

3.0.0 / major
→ 允许明确的不兼容升级，但必须给出迁移路径与影响证据
```

这套策略约束的不是“版本号好看”，而是 Com Design 对下游项目作出的兼容承诺。

### Patch / Minor

默认不得无提示破坏已经发布的：

- canonical token / semantic naming；
- Core Component contract；
- state / variant / anatomy 中已承诺的消费接口；
- Platform Adapter 的稳定输出接口；
- Product Extension 依赖的公开 Core contract。

如果一个所谓 patch / minor 实际要求消费项目修改调用方式、重新解释语义或大范围重构，应升级为 major 或重新设计兼容方案。

### Major

Major 可以主动进行 V2 演进所需的 breaking change，但正式发布前至少需要：

- 明确列出 breaking surface；
- 说明为什么兼容层不足以解决问题；
- 给出旧 → 新的迁移方式；
- 给出受影响 Token / Component / Pattern / Adapter / Product Extension 范围；
- 提供 build / validation / representative-consumer evidence；
- 由 Mira 判断 breaking 的长期收益是否值得迁移成本。

因此 Major 不是“可以随便改”，而是拥有**被治理的 breaking 权利**。

### Compatibility principle

> **平时升级尽量不折腾现有项目；真正需要改变契约时，用 Major 明确承担迁移成本。**

## Consumer version policy

用户选择：**B — 每个消费项目锁定自己的 Com Design 版本；需要时显式升级，并在升级前查看影响与验收结果。**

默认治理策略：

- Android / iOS / Web / 微信小程序项目不得自动漂移到最新 Com Design；
- 每个项目明确记录当前消费版本；
- 升级由项目主动触发，而不是由 Design System 强制推送；
- 升级前读取 changelog、breaking surface、migration guide 与适配器变化；
- 执行项目自身 build / smoke / representative UI / contract checks；
- 对 Major 升级必须显式确认迁移影响；
- 对 Patch / Minor 可以提供自动化升级建议，但默认仍需项目侧接受后进入版本锁。

理想关系：

```text
Com Design publishes version N
→ consumer project stays on pinned version
→ project chooses upgrade
→ impact / migration / validation
→ project updates lock to version N
```

这保证 Design System 可以继续演进，同时不会让一个中央版本发布把多个正在运行的产品同时变成隐式测试场。

### Version-consumption principle

> **设计系统负责发布可升级的版本，产品项目负责决定何时升级；版本锁是稳定边界，不是阻碍演进。**

## Discovery decision rule

在后续 PRD discovery 中，成熟且低争议的工程治理问题默认由 Mira 直接给出方案并落文档，不再占用用户的产品追问额度，例如：

- SemVer 基础策略；
- consumer version pinning；
- changelog / migration guide；
- deterministic CI gate；
- source integrity / schema validation；
- 常规 rollback / deprecation 基线。

只有当一个问题会真实改变产品价值、组织权责、跨端设计自由度、Core / Product 边界或发布风险承受方式时，才继续向用户追问。

### Governance principle

> **机器守住确定性底线，额外 AI 门禁用于审查 AI 施工风险，Mira 负责综合设计系统判断，并拥有正式版本最终否决权。**

### Q5 conclusion

Com Design V2 的正式治理关系为：

```text
canonical change
→ deterministic hard gates
→ AI Review Gate when required
→ Mira review / veto
→ versioned release
→ consumer project pins version
→ explicit project upgrade with migration + evidence
```

Q5 已收口。
