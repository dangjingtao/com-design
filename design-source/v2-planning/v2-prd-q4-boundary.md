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

## Product Extension freedom

用户选择：**B — Product Extension 可以新增产品专属 Token / Component / Pattern，但必须基于 Core 语义，且不能反向污染或改写 Core。**

这意味着 Product Extension 不是只能“拼装现有组件”的薄层，而是拥有正式扩展能力：

- 可以定义产品专属 semantic token，例如会员身份、奖励价值、活动强调等产品语义；
- 可以定义领域专属 Component / Composite，只要其命名、状态、anatomy、accessibility 与平台适配方式仍遵循 Com Design contract；
- 可以定义产品专属 UX Pattern，例如某类业务资格判断、奖励领取、会员权益呈现等，但它们属于 Product scope，而不是因为存在就自动成为 Core Pattern；
- 可以拥有比 Core 更强的视觉表达和品牌资产，包括品牌图形、Mascot、特殊主题与活动视觉；
- 这些扩展仍应通过正式 namespace / source / validation 进入系统，使 AI / Agent 能区分 Core 与 Product 能力。

禁止的反向污染包括：

- 为了一个产品需求直接重定义 Core semantic token 的含义；
- 用 Product Component 静默覆盖同名 Core Component；
- 让 Product Pattern 改写 Core Pattern 的通用决策规则；
- 把领域状态、业务枚举或品牌词汇塞进 Core contract；
- 通过主题或 Adapter 改变 Success / Warning / Danger 等通用语义的含义。

理想关系是：

```text
Core provides stable semantics and contracts
→ Product Extension specializes them for a product domain
→ Product / Business Logic supplies real business state and rules
```

如果 Product Extension 中的能力经过多个真实产品长期验证，证明其已去业务化、结构和交互稳定、跨产品复用价值明确，才进入“是否晋升 Core”的独立评审，而不是自动上收。

### Current question

- Platform Adapter 应该只负责平台实现差异，还是也允许承载同一个 Component 在不同平台下的 presentation 选择与有限结构变化？
