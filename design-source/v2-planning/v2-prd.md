# Com Design V2 PRD

> Status: Discovery / Draft  
> Branch: `dev`  
> Target: Android / iOS / Web / WeChat Mini Program  
> Method: 通过 6 个固定大题完成产品定义；每个大题最多追问 3 次。

## PRD discovery outline（locked）

1. V2 为什么存在：目标、成功标准、V1 → V2 的边界
2. 四端到底怎么统一：Android / iOS / Web / 小程序的共性与平台自由度
3. 谁会使用 Com Design：设计、研发、AI、Penpot、产品项目如何消费
4. V2 要管到什么程度：Token / Foundation / Component / Pattern / Adapter / Product Extension 的责任边界
5. 落地与治理：版本、兼容、验收、CI、设计变更如何进入四端
6. 9 月怎么打仗：范围、优先级、阶段目标、可延后内容

---

## Q1. V2 为什么存在？

### 用户原始判断

> 多端真正意义上的适配。组件要补，但现在要把它从 web 原型基础升级到多端真正能用。

### 当前产品定义

V2 的首要目标不是增加组件数量，而是完成 Com Design 的定位升级：

```text
Web / prototype-oriented design system
→
production-usable multi-platform design system
```

V2 必须让 Com Design 真正面向 Android、iOS、Web、微信小程序四端使用。组件补齐仍然属于 V2 工作，但它服从于跨端可消费、可实现、可验证这一更高优先级目标。

### 当前边界判断

- V1 的价值继续保留：已有 Token、33 Core Components、Composite、Pattern 与设计原则仍是基线；
- V2 不应把“Preview 能展示”误认为“平台已经支持”；
- V2 的关键变化是从视觉/原型参考升级为可驱动真实工程实现的跨端契约；
- 四端不要求物理表现完全一致，但必须共享可解释的语义、状态、行为和治理来源。

### 待确认

- V2 的最低完成 / 成功标准是什么？
