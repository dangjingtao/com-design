# Com Design V2 PRD — Q4 Responsibility Boundary

> Parent: `v2-prd.md`  
> Status: Discovery / Draft  
> Scope: Q4 — V2 要管到什么程度？

## Confirmed responsibility boundary

用户选择：**B — Com Design 管到 UX Pattern + Platform Adapter；Product Extension 可以接入，但具体业务本身不进入 Core。**

V2 的责任边界因此继续沿用并落实 V1 的分层思想：

```text
Primitive
→ Semantic
→ Component
→ Composite Component
→ UX Pattern
→ Platform Adapter
→ Product Extension
→ Product / Business Logic
```

其中：

- Core 负责设计语义、基础结构、组件、组合组件与可复用 UX 决策规则；
- Platform Adapter 负责把同一 Com Design 意图自然映射到 Android / iOS / Web / WeChat Mini Program；
- Product Extension 是正式扩展层，可以承载品牌活动、会员、奖励、业务专属组件与业务视觉；
- 具体产品流程、领域状态机、业务权限、业务数据模型、路由与业务规则不进入 Core；
- 当多个产品持续出现同一种业务外观或交互时，也不能直接因为“重复出现”就升级为 Core，仍需先验证其是否真的去业务化、稳定、跨产品可复用。

### Core 的职责

Core 应回答：

- 这个信息应该用什么语义层级表达？
- 这个状态应该如何反馈？
- 这个任务需要什么通用 Component / Composite / Pattern？
- 在不同平台上，哪些差异属于 Platform Adapter？
- Agent 如何确定地读取、实现和验证这些规则？

Core 不应回答：

- 某个产品的会员等级如何计算；
- 某个业务流程需要几步审批；
- 某个活动页的奖励规则；
- 某个产品专属领域对象的状态枚举；
- 某个业务页面必须长成固定模板。

### Product Extension 的位置

Product Extension 不是“Core 管不到的垃圾桶”，而是正式、受治理的扩展层。

它允许产品保留自己的业务身份，同时必须继续消费 Core 的 Token 语义、组件意图、UX Pattern 与 Platform Adapter。产品扩展可以比 Core 更具体、更有品牌性，也可以承载领域专属组件，但不能悄悄改写 Core 的通用语义。

因此 V2 的目标不是把所有产品设计都标准化，而是让产品在一个稳定、可机器消费、可跨端落地的共同基础上扩展。

### Current question

- Product Extension 对 Core 应拥有多大的扩展自由：只能组合现有能力，还是允许新增产品专属 Token / Component / Pattern，只要不污染 Core？
