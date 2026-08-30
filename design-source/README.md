# Com Design Mobile 设计系统

Com Design Mobile 是一套公司级移动端 Design System（`1.0.0-rc.2`），不归属于任何单一业务产品，而是作为公司移动应用共同的视觉、交互与组合地基。

当前 Core 由三类可消费契约组成：

```text
33 Core Components
4 Core Composite Components
6 Core UX Patterns
```

系统整体气质：**Modern / Clear / Light / Efficient**。

工程和设计原则：**Compact-first、Flat-first、信息层级优先于装饰、Section before Card、Semantic before literal**。

> Brand color is a scarce hierarchy signal. Product extension does not mutate Core.

完整系统层级：

```text
Primitive
→ Semantic
→ Core Component
→ Core Composite Component
→ Core UX Pattern
→ Product Extension
```

- **Core Component**：独立控件或信息单元，例如 Button、Tabs、List Item、Dialog。
- **Core Composite Component**：结构和交互已稳定、可以直接实例化的组合，例如 Filter Bar、Grouped List。
- **Core UX Pattern**：跨组件 / 跨状态 / 跨页面的任务规则，允许多种合法视觉实现。
- **Product Extension**：业务领域专属的组件、内容、路由和状态表达，不反写 Core。

---

## CONTENT FUNDAMENTALS

### Voice & tone

Com Design 文案中文优先、专业、克制、信息密度高。句子短，动词前置；状态不能只靠颜色传达；错误信息优先告诉用户下一步怎么修正。

默认：

- 不使用 emoji 作为界面装饰；
- 不用营销落地页口吻写任务流；
- 主动作使用明确动词，例如“确认提交”“保存修改”“重新加载”；
- 状态文字本身必须可理解，例如“已完成”“待审核”“当前无访问权限”。

---

## VISUAL FOUNDATIONS

### Color

品牌主色：**Electric Indigo `#5B5EF7`**。

它用于最高优先级 Primary、链接、选中态、全局导航激活、Focus 与少量品牌识别。

**品牌色面积本身就是层级信号。** 不要因为多个控件都能点击，就把它们全部处理成品牌填充。

Secondary 默认使用中性浅底；Info 默认使用中性容器 + Brand foreground，从而避免 Selected、Info、Secondary 同时铺成一片浅紫。

Accent Cyan `#16BFD3` 是局部强调色，不是第二品牌色。它用于进度、数据、小范围信息信号，不替代全局导航和 Primary。

常用中性层级：

- Background：neutral-50
- Secondary / Info surface：neutral-100
- Divider / disabled：neutral-200
- Default border：neutral-300
- Placeholder / tertiary：neutral-500
- Secondary text：neutral-600
- Primary text：neutral-800

状态色继续使用 Success / Warning / Danger / Info 的语义配对；Critical State 不得只靠颜色表达。

### Typography

字体栈：

```text
system-ui, -apple-system, Segoe UI, Roboto, sans-serif
```

语义字号从 `12/18 caption` 到 `28/36 display`。正文优先 400，Label 500，Heading 600。不要随手发明中间字号或负字距。

### Spacing

基础间距：

```text
0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32
```

- Section 内通常 `12–16`
- Section 之间通常 `24–32`
- 默认页面 edge inset 为 `16`

### Density / touch

默认 Compact：标准控件视觉高度 `40`，大号 `48`。

视觉尺寸和命中区域必须分离考虑：

- iOS 设计目标约 `44 × 44pt`
- Android 至少 `48 × 48dp`

一个 6px 的轮播指示点绝不能同时只有 6px 的点击区域。

### Radius

```text
4   detail
8   control
12  container
16  overlay
pill tag / badge / progress end
```

### Shadow / elevation

Flat-first。普通 Card、Button、List Item、Grouped List 等静态 Surface 默认无阴影。

只保留 Floating 与 Modal 两类真实浮层 elevation。

---

## CORE COMPONENTS

V1 仍为 **33 个 Core Components**，数量没有因为 Composite / Pattern 增加而膨胀。

### Actions & Forms — 8

Button · Icon Button · Input · Textarea · Select · Checkbox · Radio · Switch

### Navigation & Information — 11

List Item · Tabs · Segmented Control · Top App Bar · Bottom Navigation · Section · Divider · Card · Tag · Badge · Avatar

### Feedback / Overlay / Progress — 11

Toast · Snackbar · Alert · Dialog · Bottom Sheet · Loading Indicator · Skeleton · Empty State · Progress Indicator · Stepper · Timeline

### Search & Menu — 3

Search Field · Menu · Menu Item

核心组件原则：

- Primary 是稀缺层级信号；
- Secondary 默认中性浅底；
- Card 默认无阴影，只有真正需要收纳时才加强边界；
- Section before Card；
- 状态色必须有文字语义；
- Bottom Navigation 3–5 个主要目的地；
- Tabs 用于同级视图，不承担 App 一级导航。

完整契约：`components/index.json` 与 `components/*.json`。

---

## CORE COMPOSITE COMPONENTS — 4

Composite 用于已经形成稳定 anatomy、interaction 和直接消费身份的组合。

Canonical machine source：`specs/core-composites.json`  
Human guide：`COMPOSITE_COMPONENTS.md`  
Interactive preview：`preview/core-composite-components.html`

### 1. Carousel｜轮播

Manual-first：

- Autoplay 默认关闭；
- 启用后通常至少 5 秒，用户交互 / focus 后暂停；
- Reduced Motion 下停止或降低非必要位移动效；
- swipe / scroll-snap 不依赖 autoplay；
- 指示点视觉可以小，Hit Area 不可以小；
- 控制按钮不得遮挡内容；
- 避免整卡链接和内部操作区互相嵌套。

### 2. Filter Bar｜筛选栏

用于集合页的 `query + filter trigger + active state + draft sheet + result feedback`。

关键状态边界：

```text
pending query / draft filters
≠
committed query / committed filters
```

集合页面持有 committed truth；Sheet 只持 draft。

关闭而未 Apply 不提交。Filter Trigger 只是工具动作；在 Sheet 内，Apply 可以成为该 action group 的唯一 Primary，Reset 使用 Tertiary / text。

### 3. Tabbed Action Bar｜标签导航操作栏

适用于同级 Tabs 旁需要少量当前上下文 Search / Filter / More 工具动作的页面。

- Tabs 始终是主结构；
- 常见窄屏建议最多 2 个 local utilities inline；
- 额外动作进入 Overflow 或 Top App Bar；
- 全局通知等跨 Tab 动作优先放 Top App Bar；
- 不能通过缩小 Tab label / touch target 换空间；
- Tab selection 立即稳定，异步 loading 在内容区反馈。

### 4. Grouped List｜分组堆叠列表

用于设置、服务入口、账户信息和相关功能入口。

```text
optional Section heading
→ one group surface
  → List Item
  → inset Divider
  → List Item
```

- 一组相关条目共享一个 Surface，不做 Card-per-row；
- 导航行整行可点，Chevron 只是方向提示；
- Switch 行默认不再叠 Chevron；
- Divider subtle，可从内容列开始；
- Leading icon 默认 Neutral Surface，不给每行都铺品牌浅底；
- Pressed / Focus 作用于整行。

---

## CORE UX PATTERNS — 6

Pattern 解决任务规则，而不是固定视觉 anatomy。

1. **Status Composition** — 状态 + 必要解释 + 可选证据 / 恢复动作
2. **Search Pattern** — Query + Loading / Zero / Error + Detail Return 意图保持
3. **Collection Filter** — committed truth + draft editing + active conditions + result feedback
4. **State to Action** — 从权威状态推导当前最强可执行动作
5. **Intent Continuity / Handoff** — 登录 / 授权 / 外部系统打断后回到原任务
6. **Contextual Next Step** — 长流程持续回答“我现在该做什么”

`Filter Bar` 是 `Collection Filter` 的推荐 Composite 实现之一，但 Pattern 不被某一个 Composite 锁死。

Canonical source：`specs/core-patterns.json`  
Human guide：`UX_PATTERNS.md`  
Preview：`preview/core-ux-patterns.html`

---

## COMPONENT / COMPOSITE / PATTERN DECISION

```text
独立控件 / 信息单元？
→ Component

稳定、可直接实例化的多组件组合？
→ Composite Component

核心难点是状态、动作层级、回流、上下文和顺序？
→ UX Pattern

必须依赖业务页面名、领域文案、路由、业务枚举？
→ Product Extension
```

不要为了减少几行产品代码新增 Core Component；也不要为了维持“组件数量好看”，把已经稳定的组合永远留成抽象 Pattern。

---

## ACCESSIBILITY BASELINE

- WCAG 2.2 AA 作为可测量的跨端基线之一；
- 正文对比度通常至少 `4.5:1`；
- 重要非文字边界 / 状态按适用标准至少 `3:1`；
- Color 不能是唯一信息载体；
- Icon-only action 需要 accessible name；
- Focus 不能被 Sticky / Overlay 遮挡；
- Drag-only 交互尽量提供非拖拽替代；
- Reduced Motion 与 Text Scaling 必须真实测试。

---

## INDEX

- `README.md` — 本文档，设计语境与快速入口
- `colors_and_type.css` — runtime token variables
- `css.json` — structured token view
- `components.css` — Core Component aggregated CSS
- `components/` — 33 个 Core Component contracts
- `COMPOSITE_COMPONENTS.md` — 4 个 Core Composite Component 人类指南
- `specs/core-composites.json` — Composite machine contracts
- `preview/core-composite-components.html` — Composite interactive reference
- `UX_PATTERNS.md` — 6 个 Core UX Pattern 人类指南
- `specs/core-patterns.json` — Pattern machine contracts
- `preview/core-ux-patterns.html` — Pattern composition reference
- `preview/component-*.html` — Core Component previews
- `specs/design-system-v1.json` — system manifest
- `SKILL.md` — AI / Agent design entry
- `library-consumption.json` — downstream recommended read order
- `ui_kits/mobile/` — curated mobile composition kit

---

## CAVEATS

1. 字体使用系统字体，不引入 web font；跨平台字形差异属于预期。
2. 预览图标以 Lucide 风格 inline SVG 为主；生产应映射到公司统一图标资产。
3. Core Component = 33，Composite = 4，UX Pattern = 6；三者分层计数，不为了 KPI 互相吞并。
4. Comfortable density 和平台触摸差异存在于 Token / Contract 层；默认 Preview 仍以 compact 为主。
5. 动效必须有 Reduced Motion 路径；Carousel 等行为型 Composite 不允许只靠静态稿验收。
6. `1.0.0-rc.2` 仍是候选版本；Stable 前需要继续做 Light / Dark、跨平台、可访问性和行为烟测。
7. Product Extension 可以组合和扩展 Core，但不得反写 Core 语义。
