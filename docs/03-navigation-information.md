# 03 Navigation & Information

## 本期范围

Phase 3 建立移动端导航与高信息密度信息呈现组件，不设计具体业务信息架构或页面：

- List Item
- Tabs / Segmented Control
- Top App Bar
- Bottom Navigation
- Section / Divider / Card
- Tag / Badge / Avatar

所有组件延续 Foundation：**Compact-first、Flat-first、现代清晰、高信息效率**。

本期的核心不是“把内容都装进 Card”，而是建立稳定的信息层级、导航层级和列表节奏。

---

# 1. Shared information rules

## 1.1 Hierarchy before decoration

高信息密度界面优先依靠：

1. Typography hierarchy
2. Spacing / Group
3. Divider / Border
4. Surface difference
5. Status / Brand color

Shadow 不作为常规信息分组手段。

## 1.2 Density

Compact 仍然是默认模式，但“紧凑”只压缩几何，不牺牲触控区域和文字层级。

- 单行交互 Row 最小视觉高度优先跟随 `density.controlHeightLarge`：Compact 48 / Comfortable 56
- 多行 Row 不设死高度，由文字行高 + 垂直 padding 决定
- 页面内容 inset 继续使用 `density.contentInset`
- Section 间距使用 `density.sectionGap`

## 1.3 Leading / Content / Trailing

信息组件统一使用三段式思考：

- Leading：身份、选择、图标、Avatar
- Content：主标题 + 辅助说明 + 可选 metadata
- Trailing：状态、数值、chevron、单个高频 action

不要同时把 Leading 和 Trailing 都塞满装饰元素。

## 1.4 Accent Cyan

Accent Cyan 是辅助强调色，用于局部进度、活跃状态、数据强调和受约束的产品层 Pattern。

它**不用于全局主导航 active state**。主导航仍使用 Brand，避免 Brand / Accent 两套主身份竞争。

---

# 2. List Item

## 角色

List Item 是高信息密度业务界面的基本信息单元。它既可以是静态信息，也可以是导航入口、选择项或带状态的业务条目。

## Anatomy

1. Container
2. Leading（optional）
3. Content
   - Title
   - Description（optional）
   - Metadata（optional）
4. Trailing（optional）

## Information patterns

### Single-line

用于名称、设置项、简单入口。

- Title：`typography.body`
- 最小视觉高度：`density.controlHeightLarge`
- 适合 Leading icon / Avatar + Trailing chevron

### Two-line

用于标题 + 描述。

- Title：`typography.headingSmall` 或 `typography.body`，取决于层级
- Description：`typography.bodySmall`
- 高度由内容 + vertical padding 自然撑开，不硬编码固定 64/72px Row

### Metadata-rich

用于项目、团队、任务、订单等更复杂条目。

允许最多三层信息：
- Primary title
- Secondary description
- Tertiary metadata/status

超过三层优先重构信息，而不是继续把字体缩小。

## Variants

- Static：纯展示
- Actionable：点击进入下一层，Trailing 使用 disclosure
- Selectable：整行可选择，配 Checkbox / Radio 或 selected surface
- Status-bearing：Trailing 或 metadata 区承载 Tag / Badge / Status

不要为每种业务状态建立新的 List Item Variant。

## States

- Default：`color.surface.default`
- Pressed：`color.surface.pressed`
- Selected：`color.surface.selected`
- Disabled：正常结构保留，文字用 disabled 语义

默认无 Shadow。

## Trailing rules

- disclosure icon：20px
- 一行最多一个高频 trailing action
- 如果同时需要状态 + action，优先把状态放入 metadata，action 保留 trailing
- 不在一行右侧并排 3–4 个小图标按钮

## Divider

列表 Divider 从 Content 起始位置对齐，而不是机械铺满到 Avatar/Icon 下方；完整分隔线仅用于强边界场景。

---

# 3. Tabs

## 角色

Tabs 用于同一信息层级下的并列视图切换，不用于跨模块主导航。

## Item count

- 2–4 项：优先 Fixed Tabs
- 5 项及以上：允许 Horizontal Scroll Tabs
- 不为了塞进屏幕把标签字体缩小到 12px

## Visual

- Label：`typography.label`
- Active：`color.text.brand`
- Inactive：`color.text.secondary`
- Indicator：Brand 500，默认 2px，高度克制
- Pressed：轻量 Surface feedback

Accent Cyan 不作为默认 Tab indicator，除非产品层 Pattern 对该局部强调有明确约束。

## Icon

V1 默认 Text-only。

只有当所有 Tab 的 Icon 都具备稳定、独立可识别含义时才使用 Icon + Text；不要给部分 Tab 随机加 icon。

## Constraints

- 不嵌套 Tabs inside Tabs
- 不把 Tabs 做成整排 Card
- 页面级 Tabs 与 Bottom Navigation 不表达同一层级

---

# 4. Segmented Control

## 角色

Segmented Control 用于**局部模式切换**，不是页面导航。

典型语义：列表/网格、日/周/月、全部/我的等局部互斥模式。

## Count

- 2–4 项
- 文案保持短；长标签优先改用 Tabs / Picker

## Visual

- Container：`color.surface.subtle`
- Selected segment：`color.surface.default` + Brand text
- Unselected：Secondary text
- Radius：`radius.control`
- 默认无 Shadow；Selected 不做悬浮胶囊卡片感

与 Tabs 的区别必须来自角色，而不是只靠长得不一样。

---

# 5. Top App Bar

## 角色

Top App Bar 表达当前页面层级、返回关系与少量高频操作。

## Anatomy

1. Leading：Back / Close / optional navigation action
2. Title
3. Trailing actions：0–2 个可见 action
4. Overflow（需要更多动作时）

## Geometry

- 内容区最小高度跟随 `density.controlHeightLarge`
- Safe Area 由 Platform 层追加
- Leading/Trailing 图标：20–24px，hit area 满足平台约束
- 页面标题优先 `typography.heading`；复杂大标题页面可在内容区使用 Title，而不是无限增高 App Bar

## Rules

- 同时可见的 trailing icon action 不超过 2 个
- 更多动作进入 Overflow
- 返回、关闭、保存等角色不能只靠颜色猜
- 默认 Surface 与页面保持 Flat，不主动加 Shadow
- 滚动后若需要区分，可使用 Divider / subtle surface，而不是重阴影

---

# 6. Bottom Navigation

## 角色

用于 App 最核心、同级的顶层目的地。

## Item count

**3–5 项。**

少于 3 项通常不需要 Bottom Navigation；超过 5 项应重新审视信息架构，而不是继续缩窄。

## Visual

- Icon：24px
- Label：`typography.labelSmall`
- Active：Brand 600 / Brand 500
- Inactive：`color.text.tertiary`
- 背景：`color.surface.default`
- 顶部分隔：`color.border.subtle`

V1 默认始终显示 Label，不采用“只有选中项才显示文字”的跳动式布局。

## Geometry

- 内容带建议最小高度 56px，Safe Area 由平台层追加
- 每个 destination 的 hit area 满足平台下限

## Rules

- Bottom Navigation 不使用 Accent Cyan 作为 active 主色
- 不使用 Floating Pill Navigation 作为 V1 默认样式
- Badge 可以叠加，但不能遮挡 icon 主轮廓
- 同一个 destination 不同时出现 Badge + Status Dot + Text count 三套提示

---

# 7. Section

## 角色

Section 是**默认的信息分组方法**，优先级高于 Card。

## Anatomy

- Header（optional）
  - Title
  - Supporting text（optional）
  - Trailing action（optional）
- Content
- Footer / Helper（optional）

## Typography

- Section title：`typography.headingSmall`
- Supporting：`typography.bodySmall`
- Trailing text action：`typography.label`

## Spacing

Section 与 Section 的距离使用 `density.sectionGap`。

Section 内部可以用 Divider 或小间距组织，不需要额外白卡。

---

# 8. Divider

## Types

- Full：跨容器宽度，强分隔
- Inset：与内容起点对齐，列表默认优先

## Visual

- `color.border.subtle`
- 1px

Divider 是结构线，不承担品牌装饰。不要用 Brand / Accent 作为普通 Divider。

---

# 9. Card

## 角色

Card 只在内容需要明确**独立容器边界**时使用，例如可独立点击的摘要、跨 Section 的独立实体、需要背景承载状态的模块。

## Visual

- Surface：`color.surface.default`
- Radius：`radius.container`
- Padding：跟随 Density horizontal padding，必要时内部用 12/16px 节奏
- 默认无 Shadow
- 需要边界时使用 `color.border.subtle`

## Rules

- Section 优先，Card 次之
- Card inside Card 默认禁止
- 不靠大圆角 + Shadow 制造“高级感”
- 可点击 Card 的整卡 hit area 明确，不在卡内再堆多个同权 CTA

---

# 10. Tag

## 角色

Tag 表达分类、筛选结果、轻量属性或短状态标签。

## Families

### Neutral / Brand classification

- Neutral：轻属性、分类
- Brand subtle：品牌相关、已选择分类

### Status Tag

使用对应 Status Semantic：Success / Warning / Danger / Info。

不要把 Accent Cyan 变成“第五种 Status”。Accent 是辅助强调色，不属于状态枚举。

## Geometry

- 高度内容驱动，视觉约 24–28px
- Horizontal padding：8px
- Radius：`radius.pill` 或小圆角，由语义决定；V1 分类 Tag 默认 pill
- Typography：`typography.labelSmall`

Tag 默认不是 Button。可点击筛选 Tag 若具备交互能力，应在可访问性层明确 role/state，并扩展 hit area。

---

# 11. Badge

## 角色

Badge 表达数量或极短的注意力提示，不承载复杂状态文案。

## Types

- Dot：只表达“有新内容”
- Count：1–99；超过 99 显示 `99+`

## Visual

- Count 使用 Danger / Brand，取决于业务语义
- 不默认使用 Accent Cyan
- 文字使用 inverse，高对比

Badge 是附属信息，不能成为页面主要视觉焦点。

---

# 12. Avatar

## Role

表达用户、团队或实体身份。Avatar 本身不承担在线/认证/业务状态等所有信息，应通过独立 Badge / Status indicator 组合。

## Sizes

V1 保留三个常用视觉尺寸：

- 24px：紧凑列表 metadata
- 32px：默认列表 / 评论
- 40px：强调身份行 / 小型 Profile header

更大的头像属于具体 Pattern，而不是基础信息组件。

## Fallback

优先级：
1. Image
2. Initials
3. Generic identity icon

Initials 使用稳定背景和高对比文字，不随机生成刺眼高饱和颜色。

---

# 13. Navigation accessibility

- 所有 icon-only action 必须有 accessible name
- Bottom Navigation 当前 destination 暴露 selected/current state
- Tabs 暴露 tab / tablist 语义与 selected state
- Segmented Control 暴露单选模式状态
- List Item 的整行点击与内部 action 不得形成不可区分的嵌套点击区域
- Badge 不应成为唯一传达关键状态的方法；必要时提供可读文本

---

# 14. Component contract policy

继续遵守：

`Primitive → Semantic → Component → Pattern`

Phase 3 不新增 Foundation Token，除非组件出现无法由现有语义正确表达的真实缺口。

本期固定几何（如 Bottom Navigation 24px icon、Avatar 24/32/40）保留在 Component Contract；只有被多组件稳定复用后才提升为 Semantic。

机器可读契约：`contracts/navigation-information.json`。
