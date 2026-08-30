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

> V2 是在 V1 基础上演进，或者说是 V1 思想的落实。

### 产品定义

V2 不是为了否定或替换 V1 的设计思想，而是把 V1 已经建立的设计系统思想进一步落实到真实多端工程。

更准确的关系是：

```text
V1：建立设计系统思想、语义、层级与移动端基线
→
V2：把这些思想落实为真正可被多端工程消费的体系
```

因此，V2 的首要目标不是增加组件数量，而是让 Com Design 真正面向 Android、iOS、Web、微信小程序使用。组件补齐仍然属于 V2 工作，但服从于跨端可消费、可实现、可验证这一更高优先级目标。

### V1 → V2 的连续性

V1 是 V2 的基础，而不是需要被推翻的旧系统。

V1 已经建立且 V2 应继续继承的核心资产包括：

- Primitive → Semantic → Component → Composite → Pattern → Product Extension 的分层；
- Semantic-first 的 Token 与组件表达；
- light / dark、density、iOS / Android touch target 等模式意识；
- 33 Core Components、4 Composite、6 Pattern 已形成的系统边界；
- `design-source` 作为单一编辑源，Penpot / engineering outputs 作为下游产物的方向；
- Flat-first、Primary 稀缺、Section before Card、状态非 color-only 等设计治理原则；
- Tailwind / NativeWind / React Native token 等已有工程适配实践。

V2 要解决的不是“V1 思想错了”，而是让这些思想从已经成立的设计基线继续走到完整的跨端实现：

```text
设计语义已经成立
→ 契约进一步机器化
→ 平台边界正式化
→ Adapter 完整化
→ 四端可以从同一设计意图可靠落地
```

V1 中目前发现的 manifest、schema、preview、adapter 等问题，应被定义为**实现闭环和工程成熟度缺口**，不能反推成对 V1 整体设计价值的否定。

### 成功标准

V2 达到“真正完成多端适配”的最低标准，不要求先证明一个产品已经同时上线四端，而要求设计系统本身已经形成统一、可消费的跨端契约：

```text
shared Token semantics
+ shared Component Contract
+ shared cross-platform architecture
+ platform-specific Adapter
```

同一份设计意图能够被各目标平台通过正式 Adapter 解释并落地，而不是依赖某一个 Preview 实现作为唯一事实来源。

### 平台阶段优先级

目标平台完整定义为：

```text
Android / iOS / Web / WeChat Mini Program
```

但 V2 第一阶段成熟度优先级不是机械的四端同步：

- Android：优先达到可真实消费；
- iOS：优先达到可真实消费；
- Web：优先达到可真实消费；
- 微信小程序：相对不急，但 V2 架构从第一天就必须为它保留正式位置。

因此，小程序早期可以晚于前三端达到同等成熟的 engineering adapter / component implementation，但 Platform Model、Token 语义、Safe Area / Host Chrome、Navigation、Motion、Overlay、Input 等跨端契约不得排除它。

### Breaking-change policy

选择：**B — 为了真正跨端，允许明确的 breaking change。**

这里的 breaking change 是 V1 向 V2 演进过程中对实现结构和消费接口的主动升级，而不是“推倒 V1”。

优先继承：

```text
Design principles
Semantic vocabulary
Component intent
Composite / Pattern boundaries
Validated visual decisions
```

允许调整：

```text
stale / inaccurate manifest contracts
platform assumptions that prevent real multi-platform use
incomplete schema model
adapter output representation
preview and production-consumption boundaries
outdated downstream consumption entrypoints
```

任何 breaking change 都应该能回答：

1. 它解决了哪个真实的多端问题？
2. 为什么现有结构不足以承载？
3. V1 的哪些思想、语义和设计资产被继续继承？

### 版本关系

V1 与 V2 不定义为两个长期独立演进的设计系统。

V2 是 V1 的下一阶段：**在 V1 的设计思想和资产上继续演进，并把 V1 的跨端意图落实为真实工程能力。**

因此后续 PRD 不采用“V1 是否被淘汰”的叙事，而采用“哪些 V1 能力直接继承、哪些需要在 V2 中实现完整、哪些实现接口允许升级”的迁移视角。

### Q1 conclusion

V2 的意义可以压缩为一句话：

> **Com Design V2 是 V1 思想的跨端工程落实：继承 V1 已建立的设计系统资产，并使同一套设计意图真正能够被 Android、iOS、Web 与微信小程序可靠消费。**
