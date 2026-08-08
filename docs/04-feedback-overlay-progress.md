# 04 Feedback, Overlay & Progress

## 本期范围

Phase 4 建立跨产品稳定的反馈、浮层和流程表达能力，不设计任何具体业务页面，也不把某一产品的行业流程写进 Core：

- Toast / Snackbar
- Banner / Inline Alert
- Dialog
- Bottom Sheet
- Loading Indicator / Skeleton
- Empty State
- Progress Indicator
- Stepper
- Timeline
- Status Composition Pattern

所有组件继续遵守：**Compact-first、Flat-first、语义优先、打断最小化。**

---

# 1. Feedback hierarchy

反馈强度必须和用户需要承担的注意力成本匹配。

从低到高：

1. Field / local helper：只影响当前字段或局部控件
2. Inline Alert：影响一个 Section / 局部任务
3. Banner：影响当前页面或当前会话
4. Toast / Snackbar：短暂、非阻塞的结果反馈
5. Dialog：需要立即确认或阻止继续操作

不要因为“重要”就默认弹 Dialog。能在原位置解释的问题，优先原位置解释。

错误反馈也遵守同一原则：字段错误不升级成 Toast；网络失败若只影响一个模块，不升级成整页阻塞。

---

# 2. Toast / Snackbar

## Toast

用于无需用户立即操作的短暂结果，例如：
- 已保存
- 已复制
- 已加入收藏
- 后台动作完成

Anatomy：
- Container
- Optional status icon
- Message

规则：
- 单条信息，避免标题 + 正文双层结构
- 不承载关键说明、表单错误或必须阅读的风险
- 默认不放按钮
- 连续事件优先合并或替换，不在屏幕上堆成消息墙

## Snackbar

当短暂反馈确实需要**一个**恢复 / 撤销动作时使用。

Anatomy：
- Message
- Optional action（最多 1 个）

典型：`已删除项目 · 撤销`

规则：
- Action 必须短且明确
- 不同时放 Close + Action + 第二个 Action
- Destructive 操作如果不可逆，不能用 Snackbar 假装“可撤销”

## Placement

移动端默认靠近底部，但必须避开：
- Bottom Navigation
- Home Indicator / Safe Area
- Keyboard
- 关键底部 CTA

具体偏移由布局 / 平台层处理，不写死为单一绝对坐标。

## Visual

Toast / Snackbar 是真实浮层：允许使用 `elevation.floating`，但不使用夸张 glow。

默认 Surface 使用高对比中性浮层；Status icon 可以使用 status semantic，不能把整个容器染成高饱和状态色。

---

# 3. Banner / Inline Alert

## Role

用于需要持续可见、但不需要模态阻塞的信息。

### Inline Alert

绑定 Section / 表单 / 模块上下文。

### Banner

绑定当前页面或当前会话上下文，通常位于页面内容顶部或 App Bar 下方。

## Variants

- Info
- Success
- Warning
- Danger

每种状态使用对应 `color.status.*Bg / *Text`，必要时配状态 icon。

## Anatomy

1. Status icon（optional）
2. Content
   - Title（optional）
   - Message
3. Action（optional，最多 1 个高频动作）
4. Dismiss（仅当允许忽略时）

规则：
- 颜色不能成为唯一状态信号
- Warning / Danger 不自动等于阻塞
- 不允许同时塞 2–3 个同权 CTA
- 如果信息不可忽略，就不要给看似可关闭的 Dismiss

---

# 4. Dialog

## Role

Dialog 用于**需要用户在继续之前做出决定**的短任务。

适用：
- 确认不可逆操作
- 明确授权 / 同意
- 少量关键输入或选择
- 当前任务无法继续的阻塞信息

不适用：
- 长表单
- 长篇说明
- 普通成功反馈
- 为“显得重要”而弹窗

## Anatomy

1. Container
2. Optional icon
3. Title
4. Body
5. Optional supporting content
6. Actions

## Actions

- 默认 1–2 个
- Primary / Secondary 角色清楚
- 危险确认使用 Destructive Action 语义
- 不把“取消”做成 Danger
- 文案过长或空间不足时，移动端优先垂直排列而不是把按钮硬挤成两列

## Dismissal

- 点击 Scrim 是否可关闭，取决于任务是否安全可丢弃
- 有未保存输入时不能靠误触 scrim 无提示丢失
- Back / system dismissal 与 scrim dismissal 遵守同一损失规则

## Visual

- Surface：`color.surface.default`
- Radius：`radius.overlay`
- Scrim：`color.scrim`
- Elevation：`elevation.modal`
- 默认不做玻璃拟态 / 霓虹 glow

---

# 5. Bottom Sheet

## Role

Modal Bottom Sheet 用于移动端的补充任务、选择、操作集合或短表单，适合比 Dialog 更丰富、但仍不值得跳转整页的内容。

典型：
- Picker / Filter
- Action list
- 简短详情
- 二级设置
- 轻量编辑

## Anatomy

1. Sheet container
2. Optional drag handle
3. Header / title
4. Content
5. Optional sticky actions
6. Safe Area

## Height

- 内容驱动，不为所有 Sheet 固定一个百分比
- 短内容自然高度
- 中长内容允许受约束的最大高度 + 内部滚动
- 接近整屏的复杂任务，应重新评估是否应该使用独立页面

## Dismissal

Swipe-down / scrim tap / back 可以作为关闭方式，但只有在不会静默丢失重要输入时允许。

## Visual

- Surface：`color.surface.default`
- Top radius：`radius.overlay`
- Scrim：`color.scrim`
- Elevation：`elevation.modal`

不默认做浮空圆角“胶囊 Sheet”；Sheet 应与屏幕底部形成稳定关系。

---

# 6. Overlay stacking rules

Overlay 是最容易失控的区域，V1 明确：

- 同一时间只允许一个 Blocking Modal Layer（Dialog 或 Modal Sheet）
- 不在 Bottom Sheet 上再弹第二层 Bottom Sheet
- 不在 Dialog 上再叠 Dialog
- 必须出现二级任务时，优先替换当前 overlay 内容或进入独立页面
- Toast / Snackbar 可以与 Modal 共存，但不能遮挡 Modal action
- Keyboard 出现时优先保证输入字段和主要 action 可见
- Scrim 只表达模态层级，不作为装饰

---

# 7. Loading Indicator

## Role

表示耗时操作正在进行，但无法稳定预估结构或进度。

## Forms

### Inline Spinner

用于 Button、List Item 局部 action、小区域刷新。

### Section / Page Loading

用于内容尚不可展示，且 Skeleton 不适合的场景。

规则：
- Spinner 不等于“页面什么都不显示”
- 已有内容刷新时优先保留旧内容 + 局部 loading，不清空整个页面
- Button loading 应锁定宽度，沿用 Phase 2 规则
- 可取消长任务时应提供明确取消入口，而不是只让 spinner 无限转

---

# 8. Skeleton

## Role

当内容结构已知、数据尚未返回时，用 Skeleton 保持布局稳定。

规则：
- Skeleton 应近似真实内容结构，不做随机长短条纹装饰
- 不为每个小图标都生成一块骨架，避免视觉噪音
- 不显示真实文案 + Skeleton 混杂的“半加载”假象
- 页面已有可用内容时，后台刷新不强制切回 Skeleton
- 动效必须克制；Reduced Motion 下可静态展示

Skeleton 是加载占位，不是空状态。

---

# 9. Empty State

## Types

### First-use

用户尚未创建任何内容。重点解释“这里能做什么”。

### No results

搜索 / 筛选没有结果。重点提供调整条件或清除筛选。

### No data

当前确实没有可展示数据，但不一定要求用户行动。

### Recoverable error

请求失败且当前区域无可用内容时，可以复用 Empty State 的布局骨架，但语义必须明确为 Error，并提供 Retry / 修复入口。

## Anatomy

1. Optional visual / icon
2. Title
3. Supporting text
4. Optional Primary action
5. Optional Secondary text action

规则：
- 一屏空状态最多一个明显 Primary CTA
- 插图是辅助，不是必选项
- 不用“这里空空如也”之类无信息文案替代真正说明
- Empty State 不应用大面积 Brand 插画压过任务本身

---

# 10. Progress Indicator

## Determinate

当进度可以真实计算时使用。

### Linear

用于上传、处理、流程整体进度。

### Circular

仅在空间受限或与圆形对象强关联时使用；不要为了“科技感”把普通进度全部变成仪表盘。

规则：
- 真实 45% 才显示 45%，不伪造平滑进度
- 百分比只有在用户真的需要判断剩余量时才展示
- 默认 Progress 使用 Brand；Accent 可以在具体产品 Pattern 中作为受约束的局部强调，但不是第二套默认进度身份

## Indeterminate

无法估算时使用 Loading Indicator，而不是假装 determinate progress。

---

# 11. Stepper

## Role

表示有限、明确、有顺序的任务步骤。

状态：
- Completed
- Current
- Upcoming
- Error（只在对应步骤确实失败时）

## Mobile layout

- 3–5 个短步骤：可使用紧凑 Horizontal Stepper
- 标签较长或步骤较多：优先 Vertical Stepper
- 水平空间不足时，不把每个 label 缩成 10–12px
- Current Step 必须同时由位置 / 文字 / 状态表达，不能只靠颜色

Stepper 表达“将要完成的流程”，不是历史记录。

---

# 12. Timeline

## Role

表达已经发生 / 正在发生的事件序列或历史记录。

V1 默认 Vertical Timeline。

Anatomy：
- Node
- Connector
- Timestamp / metadata
- Title
- Supporting content
- Optional status

规则：
- 时间顺序必须明确
- Node 颜色可引用 Status Semantic，但不要给每个普通事件随机上彩色
- 大量记录优先按日期 / 阶段分组，而不是无限延长单条视觉轨道
- Timeline 不承担流程操作；需要用户逐步完成任务时使用 Stepper

---

# 13. Status Composition Pattern

Status 不是一个“彩色胶囊组件”，而是一套组合规则。

可用表达：
- Status text
- Status Tag
- Icon + text
- Dot + text
- Section / Alert level status

原则：
- 状态必须有文本或可访问文本等价物
- Color 只增强，不单独传递含义
- Success / Warning / Danger / Info 使用已有 Semantic
- Neutral 状态使用 `surface.subtle + text.secondary`，不新增“灰色 status primitive”只为了凑齐枚举
- 业务域特有状态名称映射到这套语义，不反过来新增全局颜色

---

# 14. Accessibility & interruption

- Modal 打开后焦点 / screen reader reading order 进入当前 overlay；关闭后返回合理触发点
- Dialog / Sheet 必须有可访问标题或等价描述
- Toast / Snackbar 的关键内容需要被辅助技术感知；自动消失不能快到来不及阅读
- 关键错误不能只靠 transient feedback
- Progress 对辅助技术暴露 determinate value 或 indeterminate state
- Skeleton 不应被逐块朗读；容器暴露 loading / busy 语义
- Reduced Motion 下取消不必要的 shimmer / bounce / overshoot

---

# 15. Product extension boundary

Phase 4 Core 只提供跨产品通用的反馈、浮层、状态、进度、步骤和时间线。

某个产品需要：
- 专属阶段模型
- 排名 / 评分
- 行业流程节点
- 活动主题化进度
- 特定状态组合

应建立在 `Progress / Stepper / Timeline / Status` 之上的 Product Pattern / Extension，而不是修改 Core Component Contract。

机器可读契约：`contracts/feedback-overlay-progress.json`。
