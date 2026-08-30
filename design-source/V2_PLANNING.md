# Com Design V2 Planning Ledger

> Status: Planning  
> Branch: `dev`  
> Purpose: 记录 V2 组件 / Layout / Iconography 规划，不直接改写 V1 Core Contract。  
> Working rule: 组件审查阶段每新增一条明确意见，就同步写入本文件；聊天记录不作为唯一台账。

---

## 0. V2 direction

Com Design V2 将从当前 Mobile Core 继续向更完整的跨端 Design System 演进。

当前规划原则：

- V1 的 33 Core Components、4 Core Composite Components、6 Core UX Patterns 仍作为现行基线；
- V2 规划可以新增 variant、state、foundation 与扩展机制，但在正式实施前不把规划项伪装成已完成能力；
- Mobile-specific 能力需要在设计指引中明确标注，不让未来 Desktop 消费者误解为通用契约；
- Desktop 方向会逐步补齐对应 Layout / responsive 能力，但本文件当前先记录审查中已确认的问题与候选项。

---

## 1. Button

### V2-Button-01 — Pill / Capsule shape

**规划：** 为 Button 增加标准的 `Pill / Capsule` 形状 variant。

- 与现有普通 control radius 分离；
- 使用 full / pill radius 语义，而不是随手写超大 radius；
- shape variant 与 semantic / hierarchy variant 解耦，避免出现 `red-pill`、`green-pill` 这类混合枚举；
- 保留完整触摸目标，不因为视觉胶囊变小而缩小 Hit Area。

### V2-Button-02 — Semantic variants

**规划：** 审查并完善 Button 的语义 variant。

重点：

- Destructive / Danger 应有正式语义；
- Success / Warning 等是否应成为 Button variant，需要按真实动作语义和使用证据决定，不能把所有状态色机械映射成按钮皮肤；
- action hierarchy（Primary / Secondary / Tertiary）与 semantic intent（default / destructive 等）应是不同维度；
- Critical action 不能只靠颜色表达。

### V2-Button-03 — Loading state

**规划：** Button 必须有正式 `loading` state。

要求：

- Loading 时默认阻止重复提交 / 重复触发；
- Button 尺寸和布局保持稳定，不因文字替换为 spinner 导致宽高跳动；
- 默认优先 `spinner + label`，必要场景允许 spinner-only，但必须保留 accessible name；
- Loading 与 Disabled 在视觉 / 语义上区分；
- Web / 可访问实现补 `aria-busy` 或等价平台语义；
- 需要定义 loading + destructive / primary / secondary 等组合时的优先级与样式规则。

---

## 2. Iconography

### V2-Icon-01 — Extensible icon system

**现状问题：** 当前 Preview 大量使用 Lucide 风格 inline SVG；系统 manifest 已预留 iconography contract/source 入口，但正式 Iconography Contract / Registry 尚未完整落地。

**规划：** Lucide 保持默认图标来源，但 Com Design 不锁死 Lucide，建立正式扩展机制：

```text
Icon Registry
→ Icon Provider
→ Icon Adapter
```

要求：

- `Lucide` 作为 Default / Core Provider；
- 支持 Company / Product 自定义 SVG Provider；
- 产品优先消费稳定 icon name / semantic name，而不是直接耦合某个 SVG 文件；
- Core namespace 与 Product Extension namespace 分离；产品不得静默覆盖 Core icon；
- 自定义图标必须遵守统一的 16 / 20 / 24 visual size、stroke / visual weight、viewBox、alignment、accessible name 规范；
- 明确 missing icon 的 build-time validation 与 fallback policy，不能运行时无声空白；
- 品牌 / 吉祥物 / 业务特殊图形可进入 Product Extension provider，不污染 Core generic icon set；
- 修复 manifest 声明与实际 source contract 不一致的问题。

---

## 3. Layout Foundations

V2 开始明确 Layout 能力，为后续 Desktop 设计系统扩展留出干净边界。

### V2-Layout-01 — Stack

**标准命名建议：** `Stack`，而不是直接复制 Ant Mobile `Space`。

职责：

- horizontal / vertical arrangement；
- semantic gap；
- align / justify；
- optional wrap；
- 跨 Mobile / Desktop 通用。

`Space` 更适合作为 spacing concept；稳定布局原语使用 `Stack` 更清晰。

### V2-Layout-02 — Center

**标准命名建议：** `Center`，不沿用 `AutoCenter`。

职责：

- 在可用布局区域中进行水平 / 垂直居中；
- 支持单轴或双轴居中；
- 跨 Mobile / Desktop 通用；
- 不替代完整 Container / Page Layout。

### V2-Layout-03 — Grid

新增跨端 `Grid` Layout Foundation。

规划：

- Mobile 以少列、自适应、稳定 gap 为主；
- Desktop V2 后续扩展 column / responsive / minmax / breakpoint contract；
- 不把业务卡片排布规则写死进 Grid；
- Grid 负责几何布局，Card / Section / Composite 继续负责语义与内容结构。

### V2-Layout-04 — Safe Area

新增 `Safe Area`，但在设计指引中明确标记为：

**Mobile Platform Layout**

职责：

- iOS / Android top / bottom / inset / device cutout 等安全区域适配；
- 不要求 Desktop 消费者背负无意义的 Safe Area 概念；
- Safe Area 作为 platform adapter / layout contract，而不是业务页面自行 hard-code padding。

### Divider boundary

`Divider` 已经是现有 Core Component，V2 **不因为 Layout 分类而重复新增 Divider**。

---

## 4. Navigation & Indexed Content

### V2-Navigation-01 — Index Bar / Indexed List

**规划：** V2 必须支持 `Index Bar`，用于通讯录、城市、品牌、组织等按索引快速跳转的长列表。

标准能力边界：

- 推荐将完整能力定义为 `Index Bar + Indexed List`，而不是只做一条右侧字母栏；
- Index Bar 负责索引导航，Indexed List 负责 section / anchor / sticky section header 与滚动同步；
- 支持字母、数字、`#` 及产品自定义索引键，但 Core 不绑定具体业务数据；
- 点击或滑动 Index Bar 时，列表跳转到对应 section，并同步当前 active index；
- 长按 / 滑动快速索引时可显示当前索引的浮层反馈，但不能遮挡核心内容；
- Section header SHOULD 支持 sticky 行为，并与当前 active index 保持一致；
- 索引项视觉尺寸可以紧凑，但命中区域必须满足移动端 touch target；
- 对不存在内容的索引项要有明确 disabled / skip policy，不能跳到空白位置；
- 需要定义滚动驱动与手势驱动之间的同步规则，避免 active index 抖动或循环更新；
- 无障碍实现必须提供非纯手势路径，读屏用户可以按 section / heading 顺序导航；
- Desktop 可复用 Indexed List，但右侧垂直 Index Bar 是否保留应按输入设备与屏幕空间自适应，不强制照搬 Mobile 形态。

**归类候选：**

- `Index Bar`：Core Component candidate；
- `Indexed List`：Composite Component candidate（Index Bar + Section + List Item + sticky heading + scroll synchronization）。

正式施工前再根据 API 稳定性确认是否拆成 Component + Composite，当前先作为 V2 确认能力记录。

### V2-Navigation-02 — Top App Bar + WeChat Mini Program support

**确定需求：** V2 顶部导航必须支持微信小程序，但必须区分产品 UI、平台适配与原型 Chrome，不能把状态栏或微信胶囊错误地做成 Core Component。

采用三层模型：

```text
Top App Bar / Navigation Bar
→ Platform Navigation Adapter
→ Device / Platform Chrome
```

#### A. Top App Bar / Navigation Bar — Core Component

Core 只负责产品真正拥有的页面导航 UI：

- optional leading back / close action；
- centered title；
- extensible trailing icon actions / overflow；
- default / scrolled 等页面级状态；
- action hierarchy、touch target、title truncation 与 accessible name；
- 可被 Native App、H5、WebView、微信小程序等不同运行环境消费。

V2 继续沿用 V1 的边界：Safe Area 不由 Top App Bar 自己硬编码。

**V2 标题与 Action 细化：**

- Title 默认采用 **Centered Title** 布局；
- “居中”指在当前可用安全导航区域内保持视觉居中，不能因为左侧返回按钮或右侧 Action 数量不同而被简单 Flex 推偏；
- 当微信胶囊、系统 Reserved Region 等使物理屏幕中心不可安全使用时，由 Platform Adapter 给出可用区域，Top App Bar 在该安全区域中居中；
- Title 必须单行显示；超出可用宽度时使用 `overflow hidden + text-overflow: ellipsis + white-space: nowrap` 或等价平台实现，不换行、不挤压 Action；
- Title 的最大宽度必须同时考虑 leading action、trailing actions 与 Platform Reserved Region；
- 右侧提供正式 **Trailing Action Slot / Action List** 扩展机制，优先消费 Core `Icon Button` + Icon Registry，而不是在 Top App Bar 内写死具体图标；
- 支持 0 / 1 / 多个右侧 Icon Button，但视觉层默认保持克制；常规 Mobile 场景建议最多 2 个直接可见 Action，其余进入 Overflow；
- 微信小程序等 Reserved Region 已占据右侧空间时，可见 Action 数量需要由 Adapter / available width 进一步收缩，不能强行与胶囊抢空间；
- Icon-only Action 必须有 accessible name，且 Hit Area 满足平台 touch target；
- Action 的增删不得导致标题位置在页面状态切换中明显跳动。

#### B. Mini Program Navigation Adapter — Platform Adapter

微信小程序不新增一套 `WeChatNavBar` Core 视觉组件，而增加平台适配契约。

职责包括：

- 获取 / 接收微信宿主提供的顶部 inset 与胶囊区域信息；
- 计算 Top App Bar 可用 title / trailing action 空间；
- 保证自定义导航栏不会与右上角宿主胶囊冲突；
- 映射微信返回、首页等宿主行为时，不污染 Core Navigation API；
- 微信平台尺寸或宿主行为变化时，应修改 Adapter，而不是改写 Core Top App Bar。

#### C. Status Bar / Mini Program Capsule — Device / Platform Chrome

顶部状态栏、微信右上角胶囊、小程序宿主层等 **不属于 Core Component**。

它们主要用于：

- Penpot / Human Guide / Prototype 的真实环境展示；
- 设计验收时模拟真机 / 小程序宿主约束；
- 计算 Reserved Region / Platform Chrome Inset。

产品实现不得把模拟状态栏或模拟微信胶囊当成普通 UI Component 重复绘制。

#### D. Platform Reserved Region

虽然微信胶囊不是 Com Design 组件，但它真实占据布局空间，因此 V2 需要正式定义：

`Platform Reserved Region / Platform Chrome Inset`

Top App Bar 根据 Reserved Region 计算可用布局区域，而不是通过“画一个假胶囊”解决冲突。

#### Prototype policy

V2 的 Prototype Shell MAY 提供：

- iOS Status Bar simulation；
- Android Status Bar simulation；
- WeChat Mini Program Chrome simulation；
- platform reserved region visualization。

这些必须明确标注 `Prototype / Environment Chrome`，不能出现在 Core Component 计数中。

### V2-Navigation-03 — Side Navigation / Navigation Rail

**确定需求：** V2 必须补齐桌面端侧边导航能力。核心学院现有实现作为真实产品证据参考，但不直接复制其组件结构、业务路由判断或视觉样式。

核心学院已验证一套常见骨架确实存在：固定左侧导航、Icon + Label 一级入口、二级入口、可滚动主导航区、底部辅助入口以及内容区让位。V2 保留这些可复用结构经验，但重新定义为产品无关的导航契约。

#### Standard naming

- **Side Navigation**：展开态、Label-first 的持久侧边导航，是 Desktop 管理端 / 工作台的主要形态；
- **Navigation Rail**：紧凑的 Icon-first 侧边导航，可作为中等宽度或用户主动折叠后的候选形态；
- 不建议把导航组件本身泛称为 `Sidebar`。`Sidebar` 可以是任何次级面板；`Sidebar Layout / App Shell` 属于更上层 Layout 问题。

#### Recommended anatomy

```text
optional brand / context header
→ navigation groups
  → navigation item
    → optional nested navigation item(s)
→ flexible scroll region
→ optional auxiliary / footer actions
```

要求：

- Brand / Product identity 区域可选；其中的产品名、Logo、业务环境标签属于 Product Extension，不进入 Core 语义；
- Navigation Group 可选，Group Heading 保持低强调，不通过大量 Card / Divider 制造层级；
- Navigation Item 支持 optional icon + label + optional badge/count + optional expansion indicator；
- 图标必须消费 V2 Icon Registry，不在 Side Navigation 内直接绑定 Lucide import；
- **撤销 V2 早期“最多 2 层”的限制。Navigation Model 必须支持递归 nested children / groups，不在 Core API 层硬编码层级上限；**
- 设计指引 SHOULD 提醒 1–3 层是常见可读范围；超过该深度时需要审查信息架构，但不能因此让组件无法表达真实的多级后台导航；
- Parent 含 active descendant 时可以表达 `contains-active-destination`，但不能和真正 active destination 使用同等强度的选中样式；
- active destination 的 ancestor chain SHOULD 自动展开，使当前页面在导航中可见；用户手动折叠后，parent 仍需要保留 active-descendant 提示；
- expanded / collapsed state 支持 controlled model，并可由产品选择持久化用户折叠偏好；
- Label 单行显示，超长使用 ellipsis；Rail / 折叠态或截断态需要 Tooltip / accessible label；
- 主导航区域独立滚动，Header / Footer SHOULD 保持稳定；键盘聚焦或路由进入当前项时，应保证 active/focused item 可见；
- Auxiliary / Footer Action 与主目的地视觉分区，但不能在 Core 中写死具体业务快捷入口。

#### Visual direction

核心学院当前侧边栏的结构可以借鉴，但 V2 视觉需要更克制、更现代：

- Flat-first，不使用重阴影和大面积品牌色 Side Surface；
- Active destination 使用**单一最强选中信号**，推荐 Brand foreground + restrained selected surface / indicator，而不是多个层级同时铺浅紫；
- Hover / Focus / Pressed / Selected 必须分别定义，不把 hover 当 active；
- Group 间距和 typography 优先建立层级，减少“靠缩进 + 彩色底块”表达信息架构；
- 多级导航的层级缩进必须 token 化，不允许每深入一级随手增加 padding；深层级可结合 connector / typography / disclosure icon 控制层级感，避免无限向右漂移；
- Icon、Label、Badge 的视觉权重必须稳定，Badge 只表达真实数量 / 状态，不作为装饰；
- 展开态常规宽度可在约 `220–280` logical units 范围内由 density / product 决定，不把核心学院当前固定 `w-64` 当成 Core 常量；
- Rail 候选宽度约 `64–80` logical units，但正式值待 V2 Token / Desktop density 验证后确定。

#### Interaction and accessibility

- Side Navigation 必须支持 pointer + keyboard；不得依赖 hover 才能发现关键子导航；
- Focus ring / keyboard order 必须清晰，折叠/展开后焦点不能丢失；
- Parent item 若同时具备 destination 与 children，必须明确区分“进入父级目的地”和“展开/折叠子级”的 hit target / keyboard action；不能让一个点击区域承担两个不可预测动作；
- disclosure indicator 必须真实反映 expanded state，不能只作为装饰 chevron；
- 递归导航需要定义完整键盘遍历、展开/折叠与 focus restore 行为；Web 端采用 nested navigation semantics 还是 tree semantics 必须按最终交互模式选择，不能只为视觉像树就滥用 ARIA tree；
- Route state / selected destination 必须由共享 Navigation Model 决定，不能像产品代码一样在组件内部散布 pathname prefix 判断；
- Badge、collapsed state、expanded group state 的变化不应让主要目标产生明显位置抖动。

#### Responsive navigation mapping

V2 **不采用核心学院当前“窄屏直接变成顶部横向滚动主导航”作为默认规则**。

同一 Navigation Model 在不同空间下应通过 responsive adapter 映射：

```text
wide desktop     → Side Navigation
medium desktop   → Navigation Rail candidate
mobile / narrow  → Bottom Navigation / Top App Bar / Drawer or Sheet navigation
```

具体映射由目的地数量、层级和任务类型决定，而不是单纯按 CSS breakpoint 把所有侧边项横着排。

要求：

- destination / route truth 保持一份，视觉载体随平台变化；
- Mobile 若已有 3–5 个一级目的地，优先复用 Bottom Navigation；
- 层级较深或目的地较多时，使用 Drawer / Sheet 中的 **Multi-level Collapsible Navigation**，而不是横向滚动十几个导航项；
- Desktop App Shell 负责内容区域 offset / resize；页面本身不应 hard-code `padding-left` 去配合 Side Navigation。

#### Classification candidate

当前建议：

- `Side Navigation`：**Core Composite Component candidate**，因为它由 Icon / Label / Badge / Group / recursive nested item / scroll / footer 等形成稳定可实例化组合；
- `Navigation Rail`：先作为 Side Navigation 的 compact variant / peer candidate，施工前根据 API 稳定性决定是否独立；
- `App Shell / Sidebar Layout`：**Layout / Composite candidate**，负责 Side Navigation 与主内容区的空间关系，不和导航组件本身混为一体；
- 是否需要独立 `Navigation Item` Core Component，必须等跨 Side Navigation / Drawer / Menu 等复用证据出现后再决定，当前不为了拆 API 提前增加组件。

### V2-Navigation-04 — Multi-level Collapsible Navigation

**确定需求：** V2 必须正式支持多级折叠导航，不把它当 Side Navigation 的临时特例。

标准能力：

- Navigation Model 使用递归结构表达 `item → children[]`；
- 任意拥有 children 的节点都支持 expanded / collapsed state；
- 支持多个分支同时展开，也允许产品按场景选择 accordion-like single-branch mode，但 Core 默认不强制单开；
- active destination 自动展开 ancestor chain；
- parent、ancestor-with-active-descendant、active destination 三种状态必须有不同视觉层级；
- 每一级使用稳定 indentation token / density rule，不允许业务代码自行计算 `level * arbitrary px`；
- 支持 leading icon、label、badge/count、trailing disclosure indicator，并允许无 icon 的纯文字层级；
- 展开/折叠动画保持短促，并尊重 reduced-motion；大量节点场景不能因动画导致主导航滚动明显卡顿；
- 折叠状态可受控；Desktop 产品 MAY 持久化，Mobile Drawer / Sheet MAY 每次按当前 route 重建；
- 深层节点需要 scroll-into-view / active reveal；
- 需要明确定义叶子节点、父级 destination、纯分组节点三类语义，避免所有行都长得一样却行为不同；
- 如果 parent 本身也是可导航 destination，导航动作和 disclosure 动作必须分离；
- 支持 keyboard 与 screen reader，不能把层级只画成不同 padding；
- 多级导航可被 Side Navigation 与 Mobile Drawer / Sheet 共用同一 Navigation Model。

**设计指引：**

V2 不设硬性的 2 层上限。3 层以上应触发 IA 可读性提醒，但组件和数据契约仍必须可表达真实层级；设计系统的职责是治理复杂度，不是假装复杂度不存在。

---

## 5. Disclosure & Collapsible Content

### V2-Disclosure-01 — Accordion / Collapsible Panel

**确定需求：** V2 补正式折叠面板组件。标准名优先使用 **Accordion**；单个条目的展开/折叠行为可称 `Collapsible / Disclosure`。

建议结构：

```text
Accordion
→ Accordion Item
  → Trigger / Header
  → Collapsible Content
```

能力要求：

- 支持 `single` 与 `multiple` expansion mode；
- 支持 controlled / uncontrolled state、default expanded、disabled item；
- Trigger 至少支持 label + disclosure indicator，并可选 leading icon、辅助说明 / summary；
- Header 若提供 trailing extra action，必须和展开/折叠 trigger 分离 hit target，避免一次点击同时触发两种动作；
- Content 容器允许表单、说明、列表等通用内容，不把业务结构写死；
- 展开/折叠动画不改变内容宽度，不制造布局横向抖动，并尊重 reduced-motion；
- 支持嵌套 Accordion，但嵌套层级需要通过 spacing / heading hierarchy 管理，避免“卡片套卡片”；
- 默认视觉 flat-first，优先 Divider / spacing / subtle surface，而不是每个 item 一张重 Card；
- trigger 的整个主要行应有足够 pointer / touch target；
- Web 端 trigger 使用 button / `aria-expanded` / `aria-controls` 或等价可访问语义；键盘可操作并在折叠后维持合理 focus；
- 展开内容存在 validation error / active task 时，折叠 header SHOULD 能提供必要的摘要 / 状态提示，不能把关键信息完全藏掉。

**归类候选：**

- `Accordion`：Core Component candidate；
- `Collapsible / Disclosure`：先视为 Accordion 与 Multi-level Navigation 可共享的 behavior contract candidate，是否单独暴露 Core primitive 待施工期 API 复用证据确认。

---

## 6. Future Desktop boundary（暂记，不展开施工）

随着 Com Design 支持 Desktop，后续 Layout 可能需要审查：

- Container
- Responsive Grid
- Split Pane
- App Shell / Sidebar Layout
- Breakpoint / responsive contract

这些目前只作为方向，不视为已确认 V2 scope；其中 Side Navigation 与 Multi-level Collapsible Navigation 能力已确认进入 V2，但 App Shell / Sidebar Layout 仍需单独审查。

---

## 7. Control state defects

### V2-Switch-01 — Disabled visual differentiation

**确认问题：** 当前 Switch 的 disabled 视觉与正常态过于接近，属于视觉缺陷。现有 V1 Contract 已存在 `disabled-off` / `disabled-on`，因此 V2 不新增状态枚举，而是修正视觉层级与 Preview / token 映射。

验收要求：

- `disabled-on` 必须仍然清楚表达当前值为 On；
- `disabled-off` 必须仍然清楚表达当前值为 Off；
- 两个 disabled 状态都必须明显弱于对应 enabled 状态，用户不应需要点击后才发现不可用；
- 禁用态不能只依赖 cursor、事件拦截或交互失败表达；
- Track、Thumb、Border 与外部 Label / Helper Text 应共同形成 disabled hierarchy，不能只把某一个局部改灰；
- 不建议通过全组件粗暴 `opacity` 解决，因为这可能同时损坏 On / Off 的可辨识度和文本对比度；
- Disabled On 可以保留弱化后的 selected / brand semantic cue，但不得与正常 On 使用同强度品牌色；
- Disabled Off 使用 neutral disabled surface / border，同时需要和正常 Off 有足够差异；
- Preview / Human Guide 必须至少并排展示 `off / on / disabled-off / disabled-on` 四态进行视觉验收；
- iOS / Android / 微信小程序适配后仍需保持上述状态层级，不以平台原生控件差异作为跳过验收的理由；
- 可访问语义继续保留当前 checked value 与 disabled state，不能因为视觉弱化而丢失 On / Off 状态信息。

---

## 8. Review ledger rule

从本文件建立后：

1. 用户在组件审查中每确认一条新要求，立即同步到本文件；
2. 如果只是讨论候选而未形成判断，标记为 `Candidate`，不写成确定需求；
3. 名称不标准时，保留用户原意并转换为 Design System 标准术语；
4. 规划文档只记录 V2 决策 / 候选，不自动修改 V1 组件实现；
5. 等用户说“整合 / 派卡 / 开始施工”后，再从本台账拆实施任务。