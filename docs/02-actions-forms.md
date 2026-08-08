# 02 Actions & Forms

## 本期范围

Phase 2 只建立高频操作与表单组件，不设计具体业务页面：

- Button
- Icon Button
- Input
- Textarea
- Select / Picker Trigger
- Checkbox
- Radio
- Switch

所有组件延续 Foundation：**Compact-first、Flat-first、年轻科技、高信息效率**。组件视觉必须服从同一套 Token 与交互规则，不以“组件数量完整”为目标。

---

## 1. Shared interaction rules

### Density

默认 Compact：
- 普通控件高度 40px
- Large 控件高度 48px
- 水平 padding 12px
- 垂直 padding 8px
- 内部 gap 8px

Comfortable：
- 普通控件高度 44px
- Large 控件高度 56px
- 水平 padding 16px
- 垂直 padding 12px

Density 影响几何与节奏，不改变颜色语义、组件层级或状态语义。

### Touch target

视觉尺寸与交互区域分离：
- iOS 最小 44pt
- Android 最小 48dp
- 小型 Icon Button / Checkbox / Radio 不得因视觉紧凑而缩小 hit area

### State model

移动端核心状态按组件实际需要使用：

`default / pressed / focused / selected / disabled / loading / error`

不机械给每个组件凑齐所有状态。Hover 仅作为未来 pointer platform extension。

### Focus

Focus 是键盘、辅助输入、无障碍与部分 Android 场景的重要状态，但不是默认移动触屏视觉主角。

- 默认边框 1px
- Focus indicator 可提升为 2px
- Error + Focus 时保留 Error 语义，不用品牌蓝覆盖错误状态

---

# 2. Button

## 角色

Button 用于明确触发动作。V1 不用形状、渐变或阴影制造“高级感”，主要通过层级、颜色和留白区分动作优先级。

## Variants

### Primary

用于当前区域最主要动作。

- Default: `color.action.primary`
- Pressed: `color.action.primaryPressed`
- Label: `color.text.inverse`
- Disabled: `color.action.disabled` + `color.text.disabled`

一个局部操作区域避免并排出现多个同权 Primary。

### Secondary

用于次级但仍需要明显入口的动作。

- Background: `color.action.secondary`
- Label: `color.text.brand`
- Pressed: `color.action.secondaryPressed`

### Outline

用于需要边界但不希望大面积填色的动作。

- Background: `color.surface.default`
- Border: `color.border.default`
- Label: `color.text.brand`
- Pressed: `color.surface.selected`

Outline 不应比 Primary 更抢眼。

### Ghost

用于列表、工具栏、局部低层级动作。

- Background: transparent
- Label/Icon: `color.text.brand`
- Pressed: `color.surface.selected`

### Destructive

只用于明确危险动作。

- Default: `color.action.destructive`
- Pressed: `color.action.destructivePressed`
- Label: `color.text.inverse`

普通“取消”“返回”不能因为语义消极就使用 Danger。

## Sizes

只保留两个业务尺寸：

- Regular：跟随当前 Density 的 `controlHeight`
- Large：跟随当前 Density 的 `controlHeightLarge`

不建立 32px 可点击 Button。若视觉上需要更小入口，应使用 Icon Button / Text Action，但 hit area 仍满足平台约束。

## Typography

Button Label 使用 `typography.label`：14px / Medium / 20px。

不使用全大写，不通过 Bold 700 制造强调。

## Icon

- 默认图标视觉尺寸 20px
- 图标与文字 gap 8px
- Leading / Trailing 二选一为主，避免两侧同时堆装饰图标
- 纯 Icon Action 使用 Icon Button，不用空 Label 的 Button

## Loading

Loading 不改变 Button 宽度，避免布局跳动。

- Primary 可用 16px spinner
- 默认保留动作语义；若隐藏 label，容器宽度仍锁定
- Loading 时不可重复触发

## Do / Don't

Do:
- 一个区域只保留一个最明显的 Primary
- 长操作使用 Loading
- Compact 模式仍保持足够 hit area

Don't:
- 用 Shadow 把普通 Button 做成立体按钮
- 同时堆 Primary + Primary + Primary
- 让 Disabled 只靠降低 opacity 到难以辨识

---

# 3. Icon Button

## 角色

用于返回、关闭、更多、收藏、删除等图标可独立表达的短动作。

## Geometry

- Container 跟随 Density controlHeight
- 图标默认 20px；Large 可 24px
- 视觉容器可紧凑，但 hit area 需满足平台下限
- Radius 使用 `radius.control`

## Variants

- Ghost：默认工具栏 / 行内操作
- Subtle：选中或需要轻背景时使用
- Destructive：删除等高风险动作；不默认常驻红底

若图标语义不直观，必须提供 accessibility label；复杂业务动作优先使用带文字 Button。

---

# 4. Form Field anatomy

Input / Textarea / Select 共享 Field Family 结构：

1. Label（可选，但业务表单默认建议显示）
2. Control Container
3. Leading（可选）
4. Value / Placeholder
5. Trailing Action / Indicator（可选）
6. Helper / Error Message（可选）

Label、Placeholder、Disabled、Helper Text 是不同语义，不互借 Token。

推荐字段间距：
- Label → Control：6px（Compact）/ 8px（Comfortable）
- Control → Helper：6px
- Field → Field：16px（Compact）/ 20px（Comfortable）

同一表单中 Label 位置保持一致，不混用左侧 Label 与顶部 Label。

---

# 5. Input

## Appearance

V1 只保留一个主外观：**Outlined / Flat**。

不同时维护 Outlined + Filled 两套视觉体系，避免设计语言分裂。未来若真实业务需要无边框 Search / Inline Edit，再作为独立组件或变体扩展。

## States

### Empty
- Border: `color.border.default`
- Surface: `color.surface.default`
- Placeholder: `color.text.placeholder`

### Value
- Text: `color.text.primary`

### Focused
- Border: `color.border.focused`
- Focus width: 2px
- 不使用 Shadow glow

### Error
- Border: `color.border.error`
- Helper: `color.status.dangerText`
- Error + Focus 仍保持 Danger 语义
- 不把整个输入框染成红色背景

### Disabled
- Surface: `color.surface.subtle`
- Text: `color.text.disabled`
- 禁止输入，同时保持内容可辨识

### Read-only
Read-only 与 Disabled 不同：内容仍使用正常正文色，容器降低可编辑暗示，但应允许复制。

## Geometry

- 高度跟随 Density controlHeight
- Radius: `radius.control`
- Horizontal padding 跟随 Density
- 默认文字：`typography.body`
- Label：`typography.labelSmall`
- Helper：`typography.caption`

Trailing action 最多一个高频操作（例如 clear / password visibility）。

---

# 6. Textarea

Textarea 与 Input 同属 Field Family，但不是“无限变高的 Input”。

## Geometry

Compact：
- 最小高度 88px
- 建议 3 行起

Comfortable：
- 最小高度 96px

建议最大可视高度约 160–176px，再进入内部滚动，避免长文本编辑吞掉整个移动页面。

## Counter

字符计数仅在确有长度约束时出现，使用 `typography.caption + color.text.tertiary`。接近上限再提升 Warning / Danger，不默认制造焦虑。

---

# 7. Select / Picker Trigger

Select 在移动端首先是“选择入口”，不是桌面网页下拉框。

## Trigger

视觉上与 Input 同属 Field Family：
- 相同高度、Radius、Label、Helper
- Placeholder 使用 `color.text.placeholder`
- Selected Value 使用 `color.text.primary`
- Trailing 使用 20px chevron / disclosure indicator

但它不可呈现文本光标，也不伪装成可编辑 Input。

## States

- Empty
- Value
- Pressed / Open
- Error
- Disabled

Open 时可使用 focused border，但真正的 Picker 展现形式属于 Platform / Overlay Pattern，在 Phase 4 定义。

---

# 8. Checkbox

## Use

用于多选、独立布尔选择、同意条款等。

## Visual

- Indicator: 20×20px
- Radius: 4px（组件固定几何，不上升为全局 Shape）
- Checked: Brand fill + inverse check
- Unchecked: Surface default + Border default
- Indeterminate: Brand fill + short bar

## Interaction

- Indicator + Label 构成同一个点击区域
- hit area 满足平台约束
- Pressed 通过轻量 selected/pressed surface 或局部反馈表达，不使用强阴影

Error 通常属于 Checkbox Group / Helper，而不是把每一个未选框都染红。

---

# 9. Radio

## Use

用于同一组互斥选择。只有一个选项时不要用 Radio。

## Visual

- Outer: 20×20px circle
- Selected inner dot: 8px
- Selected color: Brand
- Disabled 使用 Disabled Text / Border 语义

Radio 点击已选项通常不取消选择；若业务允许“无选择”，应提供明确的“无/不限”选项。

---

# 10. Switch

## Use

用于立即生效的二元状态，例如通知开关、自动保存、权限偏好。若操作需要“提交/保存”才生效，不优先使用 Switch。

## Geometry

Compact：
- Track 44×24px
- Thumb 20px

Comfortable：
- Track 48×28px
- Thumb 24px

## State

### Off
- Track: `color.surface.subtle` / neutral border
- Thumb: white

### On
- Track: `color.action.primary`
- Thumb: white

### Pressed
轻微位置/表面反馈即可，不加入 glow。

### Disabled
保留 On / Off 可识别性，再降低交互强调；不能把两种状态都变成同一灰块。

Track 内不放“ON/OFF”文字。Label 放在组件外部。

---

# 11. Form validation & messaging

错误信息写“发生了什么 + 如何修复”，避免只写“错误”。

优先级：
1. Field-level helper
2. Section-level summary（多个错误）
3. Toast 只用于无法绑定具体字段的失败

不要用 Toast 替代表单字段错误。

必填项标记统一；不要同一页面一会儿用 `*`、一会儿写“必填”、一会儿靠红色边框猜。

---

# 12. Component contract policy

Phase 2 组件只在真实需要时创建 Component Token / 固定几何。

规则：
- 颜色永远引用 Semantic role，不直接引用 Primitive 色值
- Density 通过 `modes.density.*` 解析，不把 compact / comfortable 写进组件 Token 名
- 组件固定几何（例如 Radio inner dot）可以留在 Component Contract；只有被多个组件稳定复用后才提升为 Semantic
- Platform touch target 不写死在组件视觉尺寸里
- 不为未来不存在的 Variant 提前建 Token Matrix

机器可读契约：`contracts/actions-forms.json`。
