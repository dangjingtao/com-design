# 04B Search & Menu — Core Gap Closure

## 范围

补齐公司级移动 Design System V1 的两个高复用断口：

- Search / Search Field
- Menu / Action Menu / Overflow Menu

它们属于 Core Component，不绑定任何具体业务产品。

---

# 1. Search / Search Field

## 角色

Search Field 用于查询一个明确的数据域。它不是普通 Input 的换皮：

- Input 的目标是填写并提交字段值；
- Search 的目标是持续修改 query，并驱动结果集合变化。

Search Field 负责输入与搜索状态；Suggestion / Recent / Result / Empty 属于 Search Pattern，不能全部塞进输入框本体。

## Anatomy

1. Container
2. Leading slot
   - Search Icon
   - Loading Indicator
3. Query / Placeholder
4. Trailing slot
   - Clear
   - optional product action

Core 默认只提供 **一个 trailing action 槽位**。如果产品同时需要 Clear + Voice / Scan 等多个操作，应由 Product Pattern 决定优先级，不把 Search Field 右侧做成工具栏。

当 query 非空且正在请求时，Loading 默认占用 leading slot，Clear 仍保留在 trailing slot。用户不应因为请求进行中而失去快速清空 query 的能力。

## Appearance

V1 只保留一套 Flat Search：

- Background: `color.surface.subtle`
- Query: `color.text.primary`
- Placeholder: `color.text.placeholder`
- Icon: `color.text.tertiary`
- Radius: `radius.control`
- 默认无 Shadow

Search 不默认复制 Input 的 outlined appearance。只有当页面 Surface 对比不足时，才允许使用 `color.border.subtle` 强化边界。

## Geometry

- Height: `density.controlHeight`
- Horizontal padding: `density.paddingHorizontal`
- Internal gap: `density.internalGap`
- Search icon: 20px
- Loading indicator: 16px
- Clear icon: 20px visual size
- Query typography: `typography.body`
- Search Field 的视觉高度与平台 touch target 分离
- Clear / trailing hit area 独立满足平台 touch target

## States

### Idle
- query 为空
- 展示 Search icon + placeholder

### Focused
- 接受键盘输入
- 不使用 glow
- 键盘 / 外接输入环境下使用 `color.border.focused + border.focus` 提供明确 focus indicator
- 纯触屏进入编辑时不需要额外制造强烈视觉描边

### Query / Typing
- query 非空
- Clear action 出现
- debounce / request timing 属于实现策略，不写入视觉 Token

### Loading
- query 保留
- leading Search icon 可切换为 16px loading indicator
- Clear 继续可用
- 已有结果仍可使用时，不应清空页面再显示整页 spinner

### Disabled
仅当整个搜索能力不可用时使用；“暂无结果”不能通过 Disabled 表达。

## Clear 行为

Clear 是基础能力：

- 清空 query
- 默认保留焦点
- 结果回到产品定义的初始 / 推荐 / 最近状态
- Clear 必须有 accessible name

## Search Pattern

Search Experience 可组合：

- Recent Queries
- Suggestions / Autocomplete
- Result List
- Loading
- No Results
- Recoverable Error

核心规则：

- **No Results ≠ Empty State of the whole product**，它是搜索上下文状态；
- suggestion 与 result 必须有明确的信息层级；
- 高亮 query match 时不能只靠颜色；
- 输入变化不应导致页面结构剧烈跳动；
- 搜索请求失败时保留 query，提供重试或恢复路径。

---

# 2. Menu / Action Menu / Overflow Menu

## 角色

Menu 承接一个触发点后的短动作集合。典型入口：

- Top App Bar overflow
- List Item trailing more
- Card / content context action

Menu 不是页面导航，不用于放大量信息，也不是 Bottom Sheet 的别名。

## Family

### Action Menu

短动作集合，默认 2–6 项。

适合：编辑、分享、复制、移动、归档、删除等上下文动作。

### Overflow Menu

由 `More / Ellipsis` 触发的 Action Menu，是 Top App Bar 等组件的标准承接形式。

### Context Menu

长按或上下文触发的菜单。是否使用平台原生样式由 Platform 层决定；Core 复用相同 Action Item 契约。

## Menu Item Anatomy

1. Container
2. Leading Icon（optional）
3. Label
4. Trailing metadata / shortcut / checkmark（optional）

一个 Item 不同时堆 Leading icon + trailing icon + badge + description。复杂内容应升级为 Sheet / Page。

## Geometry

- Item min height: `density.controlHeightLarge`
- Horizontal padding: `density.paddingHorizontal`
- Icon: 20px
- Label: `typography.body`
- Menu radius: `radius.overlay`
- Menu surface: `color.surface.default`
- Floating elevation: `elevation.floating`
- Menu 内部可用 `color.border.subtle` 做 Group Divider

## Item States

- Default: primary text
- Pressed: `color.surface.pressed`
- Disabled: `color.text.disabled`
- Selected / Checked: Brand text or checkmark，不能只靠背景色
- Destructive: `color.status.dangerText` / danger icon

Destructive Action 不默认使用整行红底。只有明确的最终危险确认动作才使用 Filled Destructive Button。

## Grouping

菜单动作可按语义分组：

- Primary contextual actions
- Secondary / utility actions
- Destructive actions

Destructive group 默认放在最后，并通过 Divider / spacing 分隔。

不要为了“看起来丰富”给每 2 个动作都加分隔线。

## Placement

- 锚定触发点
- 不覆盖触发点到完全不可识别
- 尽量留在安全可视区
- 边缘空间不足时允许翻转方向
- 不被键盘 / Safe Area / 系统手势区域截断

具体 positioning algorithm 属于实现层，但这些约束属于 Design Contract。

## Dismissal

以下行为关闭 Menu：

- 选择一个 action
- 点击 / 触摸 Menu 外部
- 系统 Back / Escape（平台适用时）

如果 Item 触发二级阻塞任务，应先关闭 Menu，再打开 Dialog / Sheet；**禁止 Menu 上继续叠另一个 Menu 形成多级桌面式级联菜单作为移动端默认模式**。

## Accessibility

- Trigger 暴露 expanded / menu relationship
- Menu 容器和 Item 使用对应平台可访问语义
- Disabled Item 不可触发
- Selected / Checked Item 暴露状态
- Icon-only Trigger 必须有 accessible name
- 键盘 / 外接输入环境下需要有可预测的 focus 顺序与退出路径

---

# 3. Core boundary

Search 与 Menu 只定义公司级 Core 行为。

以下内容不进入 Core：

- 某业务专属搜索分类
- 热搜榜 / 推荐词算法
- 语音搜索业务策略
- 某产品特有的 Action Menu 项
- 某产品特殊的 Menu 品牌装饰

这些由 Product / Domain Pattern 消费 Core 后组合。

机器可读契约：`contracts/search-menu.json`。
