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

### 成功标准

V2 达到“真正完成多端适配”的最低标准，不要求先证明一个产品已经同时上线四端，而要求设计系统本身已经形成统一、可消费的跨端契约：

```text
shared Token semantics
+ shared Component Contract
+ shared cross-platform architecture
+ platform-specific Adapter
```

也就是说，同一份设计意图不再依赖 Web Preview 作为事实来源，而能够被各目标平台通过正式 Adapter 解释并落地。

### 平台阶段优先级

目标平台仍然完整定义为：

```text
Android / iOS / Web / WeChat Mini Program
```

但 V2 第一阶段成熟度优先级不是机械的四端同步：

- Android：优先达到可真实消费；
- iOS：优先达到可真实消费；
- Web：优先达到可真实消费；
- 微信小程序：相对不急，但 V2 架构从第一天就必须为它保留正式位置，不能先设计成 Web / Native 三端封闭模型，未来再用补丁硬塞小程序。

因此，小程序在早期可以晚于前三端完成同等成熟的 engineering adapter / component implementation，但 Platform Model、Token 语义、Safe Area / Host Chrome、Navigation、Motion、Overlay、Input 等跨端契约不得排除它。

### 当前待确认

- V1 → V2 在兼容策略上，应优先保持现有消费方式可继续工作，还是允许为了真正跨端架构主动做 breaking change？
