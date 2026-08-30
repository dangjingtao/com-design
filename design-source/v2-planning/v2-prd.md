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

---

## Q2. 四端到底怎么统一？

### 用户选择

选择：**A — 四端视觉尽量一致，平台差异只做必要适配。**

### 当前产品定义

Com Design V2 的跨端统一，不采用“只统一语义、各端自由长相”的松散模型。

目标是让 Android、iOS、Web、微信小程序拥有明确、稳定、可辨认的同一套 Com Design 视觉身份：

```text
shared visual language
+ shared semantic structure
+ shared component intent
+ shared interaction hierarchy
+ necessary platform adaptation only
```

因此默认原则是：

- Color、Typography hierarchy、Spacing、Radius、Component anatomy、状态层级、Primary / Secondary hierarchy 尽量一致；
- 同一个 Core Component 在四端应优先保持相同视觉身份，而不是分别“Material 化 / Cupertino 化 / Web 化”；
- 平台原生能力可以被利用，但不得在没有必要的情况下覆盖 Com Design 自己的视觉语言；
- 平台差异必须有明确理由，例如系统 Chrome、Safe Area、Back gesture、键盘 / pointer、Accessibility、原生 Picker、宿主能力限制等；
- Adapter 的职责是解决平台约束，不是给每个平台重新设计一套 UI。

这意味着 V2 的目标不是四套皮肤共享 Token，而是：

> **一套 Com Design，在四种运行环境中自然地工作。**

### 必要适配边界

用户选择：**B — 除系统级差异外，平台习惯很强的组件也允许适度不同。**

因此 V2 将平台差异分为两层。

#### 1. System-owned / host-owned differences

这些差异由平台拥有，Com Design 不强行抹平：

- Status Bar / Home Indicator / Safe Area；
- iOS swipe-back、Android Back / predictive back、微信宿主返回；
- system keyboard / IME；
- accessibility service 与系统字号机制；
- 微信小程序 Capsule / Host Chrome；
- 平台提供且具有明显可用性优势的 Native Picker 等。

#### 2. Strong platform-convention components

对于平台习惯非常强的组件，允许保持同一 Com Design 语义与视觉身份，同时由 Adapter 调整 presentation / interaction。例如：

- Dialog；
- Bottom Sheet / Sheet；
- Menu / Popover；
- Navigation presentation；
- Picker / Select presentation；
- Overlay dismissal 与 Back 行为。

这里的“允许不同”不是给各端自由设计，而是：

```text
shared intent + shared hierarchy + shared brand language
→ platform-aware presentation
```

允许变化的通常包括：placement、transition、system gesture、sheet detent、popover positioning、back/dismiss behavior、focus/keyboard handling 等。

默认不应该因为平台不同而随意改变的包括：颜色语义、信息层级、操作优先级、状态含义、核心 anatomy、组件命名和业务结果。

### 冲突优先级

用户选择：**A — 默认 Com Design 优先，除非会明显伤害可用性。**

因此 V2 采用一个明确的默认顺序：

```text
Com Design identity / hierarchy / interaction intent
→ platform convention
→ platform implementation detail
```

当平台习惯与 Com Design 视觉或交互语言冲突时，不能仅以“iOS 一般这样”“Android 原生那样”为理由直接改掉组件。只有出现下列情况，Platform Adapter 才应覆盖 Core 默认表现：

- 坚持 Core 表现会明显降低任务可用性；
- 会破坏系统级导航、返回、键盘、焦点或手势行为；
- 会降低 Accessibility / assistive technology 可用性；
- Host 平台明确限制或禁止某种实现；
- 使用成熟系统控件能显著降低错误率或学习成本，而保持自定义表现没有足够产品收益。

平台适配后仍应尽可能保留 Com Design 的颜色语义、Typography hierarchy、Spacing rhythm、Action hierarchy、状态表达与品牌识别。

这条原则的目的不是与平台对抗，而是防止“跨端适配”逐渐变成四套独立 UI：

> **平台负责让 Com Design 自然运行，不负责重新定义 Com Design。**

### Interaction equivalence

用户选择：**A — 当某个平台不适合提供相同交互时，优先保证任务结果和状态语义等价。**

因此 V2 不把“手势、控件形态、弹出方向、系统动画完全一致”定义为跨端一致性的必要条件。跨端首先必须保证：

- 用户面对的是同一个任务；
- 相同前置状态得到相同可执行能力；
- Primary / Secondary / Destructive 等操作优先级一致；
- 提交、取消、返回、失败、重试等结果语义一致；
- authoritative state 的变化一致；
- 成功 / 失败 / pending / disabled / selected 等状态含义一致；
- 用户在任一端都能理解“发生了什么、现在是什么状态、下一步是什么”。

平台可根据输入方式、宿主能力和系统习惯改变 interaction form，例如同一 Select 在触屏端使用 Sheet / Native Picker，在宽屏 pointer 环境使用 anchored listbox；但它们必须消费同一 selection model，并产生同一 committed value semantics。

换句话说：

> **跨端一致的最小不可破坏单位是任务与状态语义，不是像素级交互动作。**

### Q2 conclusion

Com Design V2 的四端统一原则可以压缩为：

> **视觉身份尽量一致，Com Design 默认优先；平台差异只在必要或明显改善可用性时进入 Adapter。交互形式允许平台化，但任务结果、状态语义和操作层级必须等价。**

---

## Q3. 谁会使用 Com Design？

### 待确认

- V2 最重要的第一消费对象是谁，以及设计师、研发、AI / Agent、Penpot、产品项目之间应如何排序与分工？
