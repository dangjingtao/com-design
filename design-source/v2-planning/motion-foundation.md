# V2 Motion Foundation

> Status: Confirmed V2 direction / detailed values pending validation  
> Scope: Com Design V2  
> Platforms: iOS / Android / WeChat Mini Program / Web / Desktop  
> Principle: **统一动效意图与体验质量，不强制不同平台产生完全相同的物理运动。**

## 1. Why Motion belongs to Foundation

Com Design V2 必须具备正式动效能力，但动效不能被理解成一组随手可用的 CSS transition。

跨端 Design System 应统一：

- motion intent；
- state transition；
- hierarchy / spatial relationship；
- duration class；
- easing intent；
- interruption / cancellation；
- reduced-motion behavior；
- performance / accessibility constraints。

而具体动画 API、spring 参数、系统导航动画与渲染实现由 Platform Adapter 映射。

```text
Motion Intent / Semantic Token
→ Component / Pattern Motion Contract
→ Platform Motion Adapter
→ Native / Host Implementation
```

V2 不以“所有平台必须看起来一模一样”为目标。iOS、Android、微信小程序、Web / Desktop 的输入方式、系统导航、动画能力与用户预期不同；强行复制同一套参数，反而会让某些平台显得不自然或性能不稳定。

---

## 2. Core motion principles

### 2.1 Motion must explain change

动效必须至少承担一种职责：

- **Continuity**：说明元素从哪里来、到哪里去；
- **Hierarchy**：说明 overlay / page / sheet / nested content 的层级关系；
- **Feedback**：确认用户刚刚触发的动作；
- **Orientation**：避免导航、展开、列表变化让用户失去位置感；
- **Attention**：仅在必要时引导注意，不作为装饰常驻播放。

如果一个动画不能解释状态变化、空间关系或反馈，它默认不应存在。

### 2.2 Motion is secondary to state

- 动效不得成为唯一的状态表达；
- 动画结束前后都必须存在清晰可理解的静态状态；
- 用户不能因为动画未播放、被系统禁用或性能降级而失去关键信息；
- Success / Warning / Danger 等状态不能只通过“弹一下 / 抖一下”表达。

### 2.3 Restraint over spectacle

Com Design 延续 Modern / Clear / Light / Efficient：

- 默认短促、克制；
- 不做大范围无意义缩放、旋转、弹跳；
- 不在多个区域同时竞争性运动；
- 品牌表达不能靠无限循环动画堆存在感；
- 业务页面不得自行发明新的 easing / duration 作为“更有感觉”。

---

## 3. Semantic motion categories

V2 先统一语义类别，不在规划阶段过早锁死具体毫秒数。

### 3.1 Micro Feedback

用于：

- press / selection feedback；
- switch / checkbox / radio state change；
- icon state transition；
- small disclosure indicator。

原则：非常短；不能拖慢直接操作。

### 3.2 Enter / Exit

用于：

- Toast / Snackbar；
- Banner；
- lightweight popover / menu；
- transient feedback surface。

原则：进入帮助建立来源，退出更快；不能因为关闭动画阻碍下一步操作。

### 3.3 Expand / Collapse

用于：

- Accordion；
- Multi-level Collapsible Navigation；
- disclosure content。

原则：保持触发点与内容关系明确；折叠后 focus / scroll position 稳定；高度动画不得造成横向抖动。

### 3.4 Overlay / Sheet / Dialog

用于：

- Bottom Sheet；
- Dialog；
- Drawer / full-screen filter；
- platform overlay。

原则：强调层级变化；scrim 与 content motion 需要协调；不能为了统一视觉而覆盖平台成熟的原生交互物理。

### 3.5 Navigation / Spatial Transition

用于：

- page push / pop；
- drill-down / return；
- side navigation content change；
- tab / peer-view transition。

原则：方向必须与信息架构一致；不得让“进入子级”和“切换同级”使用同一种夸张空间运动。

系统拥有的导航动画 SHOULD 优先尊重系统行为，不由 Com Design 重绘一套假原生转场。

### 3.6 Collection Change

用于：

- filter / search results update；
- incremental loading；
- insert / remove / reorder；
- empty → content / content → empty。

原则：以位置稳定为优先；不得因为动画导致列表跳动、scroll restoration 失效或高频重排。

### 3.7 Continuous / Ambient Motion

用于：

- loading spinner；
- progress；
- carousel autoplay 等持续运动。

原则：严格限制；必须有停止条件；尊重 reduced motion；不得把持续运动当作页面装饰。

---

## 4. Motion tokens: semantic first

V2 SHOULD 建立 Motion Token，但 Token 不应只是一组 `120ms / 200ms / cubic-bezier(...)`。

推荐先定义语义层：

```text
motion.duration.instant
motion.duration.fast
motion.duration.standard
motion.duration.deliberate

motion.easing.standard
motion.easing.enter
motion.easing.exit
motion.easing.emphasized

motion.transition.micro
motion.transition.enter
motion.transition.exit
motion.transition.expand
motion.transition.overlay
motion.transition.navigation
```

具体数值进入实施阶段后，通过真机与三端验证再确定。

禁止：

- Component 各自硬编码随机 duration；
- 业务页面直接创建新的全局 easing；
- 为了让所有平台“数值一致”而牺牲平台自然度。

---

## 5. Platform mapping

## 5.1 iOS

- 优先尊重 iOS 原生 Navigation / Sheet / system gesture 的空间逻辑；
- 如果使用平台原生容器，Com Design 不应为了视觉一致而覆盖其成熟的 interactive transition；
- Swipe Back / interactive dismissal 时动画必须可交互中断，不是只能播完；
- Reduce Motion 开启后，减少大范围位移、视差、缩放；必要状态切换可退化为简短 cross-fade 或即时变化；
- Home Indicator / Safe Area 改变不能因为动画造成 content jump。

## 5.2 Android

- 尊重 Android 系统 Back / predictive back / platform navigation 行为；
- Material-style container transform / shared axis 等思想 MAY 作为平台映射参考，但 Com Design 不直接绑定某个 Material implementation；
- 系统返回手势可交互时，Com Design motion contract 不能假定 transition 只能从 0 播到 100%；
- Animator duration scale / accessibility setting 需要被尊重；
- 大列表 / Compose / Recycler 类界面优先稳定帧率与滚动，不为装饰动画牺牲性能。

## 5.3 WeChat Mini Program

小程序是正式目标平台，不应被当成“缩水 Web”。

- 不假定拥有 Web Animation API / CSS 能力的完整子集；
- motion contract 应允许由 WXSS transition / animation、宿主组件能力或 JS 驱动实现；
- 页面切换优先尊重微信宿主导航，不强行复刻 iOS / Android App page transition；
- 自定义 Bottom Sheet / Accordion / Filter 等组件使用统一 motion intent，但具体实现受小程序渲染层能力约束；
- 避免同时动画大量节点、复杂 filter / blur / box-shadow，防止低端机掉帧；
- 动画不能依赖频繁 `setData` 驱动逐帧更新；
- 页面隐藏 / 前后台切换后，不应恢复一段已经失去上下文的装饰动画。

## 5.4 Web / Desktop

- CSS transition / Web Animations 是实现手段，不是 Core Contract；
- pointer hover feedback 可以存在，但关键状态不得只在 hover 时出现；
- keyboard focus transition 必须即时清楚，不为“柔和”延迟 focus indication；
- `prefers-reduced-motion` 必须进入 Adapter；
- Desktop 高密度界面避免每次 row hover / table update 都产生明显位移或缩放。

---

## 6. Reduced Motion is a first-class contract

V2 不把 reduced motion 当施工结束后的补丁。

每个带 Motion 的 Component / Composite / Pattern 都必须回答：

1. 动画关闭后，状态是否仍然可理解？
2. 哪些动画可以直接取消？
3. 哪些空间动画需要降级为 fade / instant state change？
4. 持续动画是否停止？
5. focus / scroll / navigation 是否仍保持正确？

推荐原则：

- decorative motion → remove；
- large spatial motion / parallax → reduce or replace；
- essential progress feedback → retain simplified form；
- state confirmation → preserve non-motion cue；
- autoplay / ambient loop → stop by default or require explicit opt-in。

---

## 7. Interruption and reversibility

跨端动效最容易被忽略的是“动画正在播时用户又操作了”。

V2 要求：

- animation MUST NOT lock interaction longer than necessary；
- repeated toggle / expand / close 可以安全打断或反向；
- interactive navigation gesture 可以根据 gesture progress 驱动或由平台接管；
- interrupted animation 最终必须落到一个合法 state；
- 不允许出现视觉已关闭但 accessibility tree 仍打开，或反过来的状态错位；
- loading / async state 变化优先服从 authoritative state，不能等装饰动画播完才更新真状态。

---

## 8. Performance budget principle

V2 当前不提前承诺统一 FPS / frame-time 数字门槛，但设计指引必须明确：

**性能问题可以否决动效。**

- 低端 Android / 小程序尤其优先保证输入、滚动、点击响应；
- 大列表避免对大量 item 同时 layout animation；
- 优先使用 transform / opacity 类低成本属性（具体平台按实现能力映射）；
- blur、大面积 shadow、复杂 mask、连续 filter animation 默认谨慎；
- 验收必须包含真机，而不是只看浏览器 Demo。

---

## 9. Component motion governance

不是每个 Component 都需要自己的独立动画风格。

组件 Contract SHOULD 只引用语义 Motion：

```text
Switch → motion.transition.micro
Accordion → motion.transition.expand
Bottom Sheet → motion.transition.overlay
Dialog → motion.transition.overlay
Toast / Snackbar → motion.transition.enter / exit
Carousel → motion policy + user-controlled navigation
Side Navigation disclosure → motion.transition.expand
```

组件可以定义：

- animated property / spatial relationship；
- enter / exit direction；
- interruption behavior；
- reduced-motion fallback。

组件不应该自行定义一套品牌 easing。

---

## 10. Prototype and documentation policy

Human Guide / Penpot / Preview 中展示 Motion 时：

- 静态截图不能冒充 Motion Contract；
- 至少提供 motion intent、trigger、start/end state、reduced-motion behavior；
- 示例动画只是 reference，不代表所有平台必须逐帧相同；
- 标注平台拥有的 motion（如系统 page navigation / native sheet）与 Com Design 自己拥有的 motion；
- 对 iOS / Android / 微信小程序存在明显差异的行为，文档应并列说明，而不是只写一个 Web Demo。

---

## 11. Current V2 decision

**确认进入 V2：Motion Foundation。**

当前确认的是治理方向，不是最终数值表。

V2 实施阶段再通过 iOS / Android / 微信小程序 / Web 真机与真实组件验证确定：

- duration scale；
- easing curves；
- spring / physics 是否需要暴露语义层；
- platform-specific motion adapter 参数；
- 哪些组件沿用系统 motion，哪些由 Com Design 自己实现。

在这些验证完成前，设计指引不得把某套 Web cubic-bezier 或单个平台 spring 参数写成“Com Design 全平台标准”。