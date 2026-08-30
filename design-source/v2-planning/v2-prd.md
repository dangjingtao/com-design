# Com Design V2 PRD

> Status: **Ready for Task Breakdown**  
> Branch: `dev`  
> Target: Android / iOS / Web / WeChat Mini Program  
> Delivery target: **2026-09-01 → 2026-09-07 完成 V2 第一阶段工程主干**  
> Release judgment: **Mira**  
> Source of truth: **Canonical Design Source**

---

## 1. Executive Summary

Com Design V2 不是重做 V1，也不是把 Web Preview 扩成更多页面。

V2 的任务是把 V1 已经建立的设计系统思想真正落实成一个可以被 Android、iOS、Web、微信小程序共同消费的跨端工程系统。

核心目标是：

> **同一份设计意图，通过稳定、机器可读的契约与平台 Adapter，在四端可靠落地；允许必要的平台差异，但不允许四端逐渐演变成四套设计系统。**

V2 第一阶段优先解决 Source、Contract、Adapter、Validation、AI Consumption、Governance 六条主干，而不是追求组件数量 KPI。

第一周结束时，Com Design 应从“已经有较成熟设计系统思想与 Web / mobile 工程实践”进入：

```text
Canonical Source
→ Machine Contract
→ Platform Adapter
→ Android / iOS / Web / WeChat Mini Program
→ Validation / Evidence
→ AI / R&D / Penpot consumption
→ Versioned Release
```

---

## 2. Why V2 Exists

### 2.1 当前阶段判断

V1 已经完成了大量关键设计系统工作，包括：

- Primitive → Semantic → Component → Composite → Pattern → Product Extension 的分层；
- Semantic-first Token 与组件表达；
- 33 Core Components；
- 4 Core Composite Components；
- 6 Core UX Patterns；
- light / dark、density、touch target 等模式意识；
- Flat-first、Primary 稀缺、Section before Card、状态非 color-only 等设计规则；
- Penpot、Tailwind、NativeWind、React Native token 等消费实践。

V2 不把这些视为失败的旧架构。

V1 暴露出的 manifest、schema、preview、adapter、消费入口等问题，应定义为：

> **实现闭环和工程成熟度缺口。**

### 2.2 V1 → V2 的关系

```text
V1
建立设计系统思想、语义、层级与移动端基线

↓

V2
把这些思想落实为真正可被多端工程与 AI 消费的体系
```

优先继承：

- Design principles；
- Semantic vocabulary；
- Component intent；
- Composite / Pattern boundaries；
- 已验证的视觉与交互判断。

允许升级：

- 不准确或失真的 manifest；
- 阻碍跨端的单平台假设；
- 不完整 schema；
- adapter 输出表示；
- preview 与 production consumption 的边界；
- 过时的下游消费入口。

### 2.3 V2 成功定义

V2 第一阶段不要求某一个业务产品已经四端全部上线。

最低成功标准是设计系统本身具备：

```text
shared Token semantics
+ shared Component Contract
+ shared cross-platform architecture
+ platform-specific Adapter
+ machine validation
```

同一份设计意图不再依赖某个 Web Preview 或某段人工说明作为事实来源。

---

## 3. Product Goals

### G1 — 真正的四端设计系统

正式目标平台：

```text
Android
/iOS
/Web
/WeChat Mini Program
```

Android、iOS、Web 第一阶段优先达到真实消费成熟度。

微信小程序可以在 engineering maturity 上稍后追平，但从 V2 第一天开始必须进入正式 Platform Model，不允许先做成 Web / native 封闭架构后再补洞。

### G2 — 一套视觉身份，不是四套皮肤

四端默认共享：

- Color semantics；
- Typography hierarchy；
- Spacing rhythm；
- Radius language；
- Component intent / anatomy；
- State semantics；
- Action hierarchy；
- 品牌识别。

平台差异只在必要或明显改善可用性时进入 Adapter。

### G3 — AI-first consumption

消费者优先级：

```text
1. AI / Agent
2. R&D
3. Designer
```

这不是组织价值排序，而是 **Com Design 消费接口的设计优先级**。

V2 应达到：

```text
AI-readable
+ AI-executable
+ AI-verifiable
```

Agent 不应该靠截图、网页 Demo 或经验猜测 Com Design。

### G4 — 单一事实来源

所有正式消费面都必须来自同一 Canonical Design Source：

```text
Canonical Design Source
├─ Machine Contract / AI
├─ Engineering Adapter / R&D
├─ Penpot Adapter / Designer
├─ Human Guide
└─ Validation / Evidence
```

任何消费端都不能形成第二真相源。

### G5 — 可治理、可升级、可审查

Com Design 必须有明确版本、兼容策略、迁移方式、门禁与放行规则。

“CI 全绿”不等于“设计系统判断通过”。

---

## 4. Non-goals

V2 第一阶段明确不追求：

- 为了数字好看扩充大量 Core Component；
- 四端所有物理动画、系统手势、控件外观像素级完全一致；
- 把业务流程、领域状态机、产品权限或路由塞进 Core；
- 让 Penpot 成为新的主数据库；
- 一次性建设四套独立 production component library；
- 在第一周完成所有低优先级候选组件和长尾视觉抛光；
- 用 React Native 作为所有平台的统一答案。

---

## 5. Cross-platform Design Principle

### 5.1 默认顺序

```text
Com Design identity / hierarchy / interaction intent
→ platform convention
→ platform implementation detail
```

Com Design 默认优先。

不能仅因为“iOS 一般这样”“Android 原生这样”“Web 常见这样”，就覆盖 Com Design 自己的设计语言。

### 5.2 允许平台差异的情况

Adapter 可以因为以下原因改变 presentation：

- Safe Area / Status Bar / Home Indicator；
- Android Back / predictive back；
- iOS swipe-back；
- 微信宿主 Capsule / Host Chrome；
- Keyboard / IME；
- Pointer / Focus；
- Accessibility；
- Gesture；
- 系统或宿主强约束；
- Native Picker 等具有明显可用性优势的系统能力。

### 5.3 强平台习惯组件

以下能力允许在不同平台使用不同 presentation：

- Dialog；
- Sheet / Bottom Sheet；
- Menu / Popover；
- Navigation；
- Picker / Select；
- Overlay dismissal；
- Back behavior。

允许变化：

- placement；
- transition；
- system gesture；
- detent；
- positioning；
- focus / keyboard behavior；
- 有依据的有限 anatomy 调整。

原则上不可随意变化：

- 状态语义；
- 操作优先级；
- 业务结果；
- 核心 Component identity；
- 通用 semantic token 含义。

### 5.4 Interaction Equivalence

当四端无法提供完全相同的 interaction form 时，优先保证：

- 用户完成的是同一个任务；
- authoritative state 一致；
- Primary / Secondary / Destructive 层级一致；
- 提交 / 取消 / 返回 / 失败 / 重试结果语义一致；
- success / failed / pending / disabled / selected 等状态含义一致。

因此：

> **跨端一致的最小不可破坏单位是任务与状态语义，而不是像素级交互动作。**

---

## 6. Architecture and Responsibility Boundary

V2 正式责任层级：

```text
Primitive
→ Semantic
→ Foundation
→ Component
→ Composite Component
→ UX Pattern
→ Platform Adapter
→ Product Extension
→ Product / Business Logic
```

### 6.1 Core

Core 负责：

- 通用设计语义；
- Foundation；
- Component / Composite；
- 可复用 UX Pattern；
- 通用 accessibility / state / interaction contract；
- Agent 可读取与验证的规则。

Core 不负责：

- 会员等级计算；
- 审批流程；
- 活动奖励规则；
- 产品专属状态枚举；
- 产品权限模型；
- 路由与业务数据；
- 强制所有业务页面长成固定模板。

### 6.2 Platform Adapter

Platform Adapter 不是格式转换器，也不是第二套组件系统。

它可以负责：

- Token / type / motion / elevation / shadow 的平台工程表示；
- Safe Area / Host Chrome / Back / Focus / IME / Pointer / Gesture；
- 同一 Component 的 presentation 选择；
- 强平台习惯组件的有限结构变化；
- 平台自然的 interaction form。

Adapter 不可以：

- 改写 Core 语义；
- 改变操作优先级；
- 删除关键状态；
- 自己建立一套独立组件命名与状态模型；
- 塞入产品业务逻辑。

有限结构变化必须：

1. 有平台 / 宿主 / 输入方式依据；
2. 保持任务结果、状态语义与操作层级等价；
3. 能写进 machine-readable Adapter contract 并验证。

### 6.3 Product Extension

Product Extension 是正式扩展层，不是 Core 管不到的垃圾桶。

允许新增：

- Product semantic token；
- Product Component / Composite；
- Product UX Pattern；
- 品牌资产；
- Mascot；
- Product theme；
- 领域专属 presentation。

但不得：

- 重定义 Core semantic token 含义；
- 静默覆盖同名 Core Component；
- 改写 Core Pattern 的通用定义；
- 让 Product 业务枚举进入 Core；
- 重定义 Success / Warning / Danger 等通用语义。

### 6.4 Pattern 的约束级别

Core UX Pattern 是成熟默认答案，但不是业务产品不可违反的法律。

```text
Core hard contract / semantic invariant
= must comply

Core UX Pattern
= recommended default

Product UX
= may choose a better domain-specific solution
```

当 Product Extension 与 Core UX Pattern 冲突时，具体产品可以选择更适合真实业务的方案。

但 Product 仍不能绕过硬契约、semantic invariant、accessibility、touch target、schema 或合法 Adapter 边界。

---

## 7. Canonical Source Model

### 7.1 Desired flow

```text
Editable Canonical Design Source
→ Normalized Design Model
→ Platform-neutral Contracts
→ Platform Adapters
→ Generated / Synchronized Consumers
```

### 7.2 Source Integrity

V2 必须把 Source Integrity 变成 P0 gate：

- manifest 引用必须真实存在；
- schema 必须可解析；
- Token / Component / Composite / Pattern / Adapter catalog 必须可解析；
- source 与 generated output 必须可验证一致；
- release gate 不能依赖手写 `true`；
- stale docs / Skill / consumption index 必须能被检测。

### 7.3 Platform axes

V2 的跨端模型应至少能表达：

```text
platform = ios | android | web | wechat-mini-program
viewport = compact | medium | wide   // exact naming may be finalized during implementation
input = touch | pointer | keyboard | hybrid
motion = standard | reduced
color-scheme = light | dark
content-scale = standard | enlarged / platform-driven
```

不能通过 `web = hover`、`mini-program = no keyboard` 之类隐含假设推断交互能力。

---

## 8. AI / Agent Consumer Contract

### 8.1 Agent should be able to

Agent 应能够从 canonical machine source 确定地读取：

- Token；
- Component；
- Composite；
- Pattern；
- Variant；
- State；
- Anatomy；
- Platform Adapter；
- Platform exception；
- Prohibition；
- Validation rule。

并完成：

```text
read contract
→ choose platform path
→ implement production code
→ validate compliance
→ output evidence
```

### 8.2 Hard vs Soft review

Hard gate 适合机器确定判断：

- source / manifest / schema 完整性；
- 引用合法性；
- required state / anatomy；
- Adapter mapping；
- accessibility / touch target 等确定性约束；
- forbidden literals / semantic misuse；
- generated-source consistency；
- 可自动验证的 contract parity。

Soft review 由 Agent 输出 warning / evidence：

- 信息层级；
- 品牌色克制度；
- 平台例外是否自然；
- 视觉平衡；
- 动效质量；
- 密度；
- 虽合法但体验别扭的组合；
- 是否需要演进 Core / Pattern。

统一输出模型：

```text
hard compliance: pass | fail
AI review findings: finding[]
soft findings: warning[]
evidence: evidence[]
exceptions: exception[]
release judgment: approve | revise | reject
```

### 8.3 Penpot

Penpot 是正式消费端，但不是第二真相源：

```text
Canonical Design Source
→ Penpot Adapter / Sync
→ editable designer workspace
```

设计师可以在 Penpot 真实工作，但 Token / Component / Variant / State / Platform Context 应尽可能可追溯到 canonical source。

未来如需 Penpot → source 回写，应通过显式 proposal / review / sync workflow，不默认开放自由双向写入。

---

## 9. Validation and Release Governance

### 9.1 Governance chain

```text
Canonical Change
→ Deterministic Hard Gates
→ AI Review Gate when required
→ Mira Review / Veto
→ Versioned Release
→ Consumer Project Pins Version
→ Explicit Upgrade
```

### 9.2 Deterministic gate

所有提交，无论来自人、Mira 或其他 Agent，都必须通过确定性门禁。

至少包括：

```text
Token validation
→ Contract schema validation
→ Source integrity
→ Adapter validation
→ Contract ↔ Preview / Implementation parity
→ Build / Smoke / Representative checks
```

### 9.3 AI Review Gate

对于指定的 AI / Agent 施工提交，可根据施工风险增加独立 AI Review Gate。

它针对的是 AI-generated change 的风险，而不是对模型厂商做价值判断。

重点检查：

- 是否误解 contract；
- 是否把 Web 实现直接复制到其他平台；
- literal / semantic drift；
- 漏状态 / 异常路径 / accessibility；
- build 通过但设计意图错误；
- evidence 是否足够。

### 9.4 Mira release judgment

Mira 是主要 Design System reviewer / release judge，并拥有最终否决权。

即使 CI 与 AI Review Gate 全绿，以下情况仍可 `revise / reject`：

- 方向偏离 V2；
- 为单端需求破坏共享 contract；
- Core / Adapter / Product Extension 边界错误；
- 设计意图或体验明显不成立；
- breaking change 收益证据不足；
- evidence 不足以支撑正式版本。

原则：

> **门禁决定“是否具备被评审的资格”，Mira 决定“是否值得进入正式版本”。**

---

## 10. Versioning and Compatibility

采用 SemVer 基线：

```text
Patch
→ 修缺陷，默认不要求消费项目修改

Minor
→ 增兼容能力，默认不破坏现有消费接口

Major
→ 允许明确 breaking change，但必须承担迁移成本
```

Major 发布至少需要：

- breaking surface；
- breaking 原因；
- migration guide；
- 受影响 Token / Component / Pattern / Adapter / Product Extension；
- representative consumer evidence；
- Mira release judgment。

### Consumer version pinning

每个业务项目锁定自己的 Com Design 版本。

```text
Com Design publishes N
→ consumer remains on pinned version
→ project chooses upgrade
→ impact / migration / validation
→ update lock to N
```

禁止 Design System 发布后让所有消费项目自动漂移到最新版本。

---

## 11. Week-1 Delivery Plan

### 11.1 Delivery posture

2026 年 9 月第一周采用高并行、细拆卡、短验收链路。

不受此前约 11 张主卡估算限制。

正式派卡时可以拆成 **约 16–20 张更小任务卡**，具体数量由依赖图和文件竞态决定，而不是为了数字好看固定。

拆卡原则：

- 单卡单一验收目标；
- 可机器检查；
- 尽量低竞态；
- 明确文件 ownership；
- Schema / Adapter / Docs / Preview / Validation 尽量拆开；
- shared canonical files 只由少数串行卡修改；
- 可并行工作尽量并行；
- 每卡必须产出 evidence。

### 11.2 P0 — Week 1 必须完成

1. Source Integrity / Manifest 修正与自动校验；
2. Canonical Design Model 与 platform / input / viewport / motion / content-scale 轴；
3. Component Contract Schema + validator；
4. Android Adapter 可真实消费；
5. iOS Adapter 可真实消费；
6. Web Adapter 可真实消费；
7. WeChat Mini Program 正式 Platform Model + minimum viable Adapter path；
8. Safe Area / Host Chrome / Back / Overlay / Navigation Platform Foundation；
9. Motion semantic foundation + reduced motion；
10. AI-readable / AI-executable / AI-verifiable 消费入口；
11. deterministic hard gates + evidence model；
12. Penpot / Human Guide / Skill / library-consumption 与 canonical source 对齐；
13. representative component / pattern cross-platform smoke；
14. version / migration / release governance 可执行化。

### 11.3 P1 — 第一周有并行容量则完成

- Responsive / Layout foundation；
- Side Navigation / Rail / recursive navigation；
- Mobile Search + Filter + Incremental Loading；
- Alert / Banner / Result / Blocking State hardening；
- Switch / Timeline 已发现 implementation defects；
- Icon Registry / Provider / Adapter；
- V2 Button additions；
- Accordion / Index Bar 等高证据候选能力。

### 11.4 Week-1 completion definition

第一周末必须形成：

```text
Canonical Source Integrity
+ Cross-platform Model
+ Machine-readable Contracts
+ Android / iOS / Web usable Adapters
+ WeChat Mini Program formal architecture + minimum Adapter path
+ Platform Adapter Foundation
+ AI-executable / AI-verifiable path
+ Deterministic Gates
+ Evidence / Review / Version Governance
+ Penpot formal downstream path
```

第一周以后可以继续“长肉”，但 Source / Contract / Adapter / Validation / Governance 不能再作为基础尾债遗留。

---

## 12. Deferred After Week 1

允许后续继续演进：

- 低优先级候选 Component；
- 微信小程序更完整的 production maturity；
- 更多真实产品四端消费证据；
- 长尾 visual polish；
- 新 Product Extension；
- 经过多产品证据后决定是否晋升 Core 的能力；
- 更完整 Data Table / Pagination / Popover / Tooltip / Drawer / Breadcrumb / Date-Time / Upload / Combobox 等候选能力。

这些不应阻塞 V2 第一阶段主干成立。

---

## 13. Acceptance Criteria

V2 第一阶段进入“可正式消费”至少满足：

### Source

- Canonical manifest 与真实 source 一致；
- schema 引用存在且可解析；
- release gate 可计算，不依赖手写布尔状态。

### Contract

- Core Component 有 formal machine-readable contract schema；
- State / Variant / Anatomy / Platform exception 可读取；
- Product Extension 与 Core namespace 可区分。

### Platform

- Android / iOS / Web 有可真实消费的 Adapter path；
- WeChat Mini Program 已进入正式 Platform Model，并有最小 Adapter path；
- Adapter 可以表达 presentation 差异，不重新定义 Core 语义。

### AI

Agent 可以从 canonical source 确定：

- 用什么；
- 如何实现；
- 使用哪个平台路径；
- 如何验证；
- 为什么判定通过 / 不通过。

### Validation

- hard gates 自动执行；
- soft finding 可结构化输出；
- representative smoke 可执行；
- evidence 可审查。

### Governance

- SemVer policy 明确；
- Major migration 规则明确；
- consumer version pinning 可执行；
- Mira release judgment 进入正式流程。

### Design consumption

- Penpot / Human Guide / Skill / machine contract 不形成互相冲突的第二事实来源。

---

## 14. Key Risks

### R1 — 高并行导致 canonical file 竞态

Mitigation：共享 canonical 文件限制 ownership，主干串行，外围 Adapter / Validator / Preview 并行。

### R2 — 为赶第一周，把四端做成四套实现

Mitigation：先锁 Contract 与 Adapter responsibility，再写平台代码。

### R3 — AI-first 退化成“给 AI 多写点文档”

Mitigation：要求机器契约、validator、evidence，而不是只增加 prose。

### R4 — 小程序因为优先级较低再次被架构遗忘

Mitigation：第一周必须完成正式 Platform Model + minimum Adapter path，成熟度可以后补，架构位置不能后补。

### R5 — V2 breaking 伤害现有项目

Mitigation：Major-only breaking + migration guide + consumer pinning + representative evidence。

### R6 — Pattern 治理过强导致产品僵化

Mitigation：Pattern 作为推荐默认；Core hard semantic contract 才是强约束。

---

## 15. Product Decisions Summary

### Q1 — Why V2

> **V2 是 V1 思想的跨端工程落实，而不是否定 V1。**

### Q2 — Four-platform consistency

> **视觉身份尽量一致，Com Design 默认优先；必要的平台差异进入 Adapter，任务结果、状态语义和操作层级必须等价。**

### Q3 — Consumers

> **AI / Agent 第一，研发第二，设计师第三；AI 要可读、可执行、可验证；Penpot 是正式下游，不是第二真相源。**

### Q4 — Responsibility boundary

> **Core 管通用语义、Component / Composite 与默认 UX Pattern；Adapter 管平台化；Product Extension 可以正式扩展，并拥有具体产品 UX 的最终选择权，但不能改写 Core 硬语义。**

### Q5 — Governance

> **机器守确定性底线；需要时增加 AI Review Gate；Mira 负责综合设计系统判断并拥有最终否决权；消费项目锁版本并显式升级。**

### Q6 — September execution

> **9 月第一周完成 V2 跨端工程主干；用更多、更小、更可并行的卡提高吞吐量，第一周后继续扩展覆盖广度，但不再欠基础架构。**

---

## 16. Next Step

PRD 产品定义已经完成。

下一阶段不是继续扩写 PRD，而是：

```text
PRD
→ architecture work breakdown
→ dependency graph
→ 16–20 small task cards (estimated)
→ parallel execution
→ evidence-based review
→ V2 first-week milestone
```

只有在施工中发现新的真实平台证据、产品冲突或架构不可行性时，才回写 PRD；基础工程实现细节进入 Architecture / Task Card / Contract 文档，不继续膨胀 PRD。
