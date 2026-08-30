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

---

## 5. Future Desktop boundary（暂记，不展开施工）

随着 Com Design 支持 Desktop，后续 Layout 可能需要审查：

- Container
- Responsive Grid
- Split Pane
- Sidebar Layout
- Breakpoint / responsive contract

这些目前只作为方向，不视为已确认 V2 scope；待 Desktop 审查时逐项判断。

---

## 6. Review ledger rule

从本文件建立后：

1. 用户在组件审查中每确认一条新要求，立即同步到本文件；
2. 如果只是讨论候选而未形成判断，标记为 `Candidate`，不写成确定需求；
3. 名称不标准时，保留用户原意并转换为 Design System 标准术语；
4. 规划文档只记录 V2 决策 / 候选，不自动修改 V1 组件实现；
5. 等用户说“整合 / 派卡 / 开始施工”后，再从本台账拆实施任务。
