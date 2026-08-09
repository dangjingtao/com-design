# Com Design Mobile 设计系统

Com Design Mobile 是一套公司级的移动端 Design System（版本 `1.0.0-rc.2`），不归属于任何单一业务产品，而是作为集团移动应用的共同视觉与交互地基。三创赛系列 App 是首批消费方，但 token、组件契约与密度规则在落地到具体产品时不得被改写——产品侧只能在 Core 之上做扩展。系统的整体气质可以概括为 *"Modern / Clear / Light / Efficient"*，并在工程上坚持 *"Compact-first、Flat-first、信息层级优先于装饰"*。本文档基于 `com-design` phase5-foundation-hardening 的结构化 token 与组件契约重建，覆盖 Foundation tokens、12 个代表性核心组件以及一套移动端 UI kit，作为新加入设计师的入门 brief，而非 token 查阅手册。

> *"Compact-first、Flat-first、信息层级优先于装饰"*；*"Product extension does not mutate Core"*；*"Section before Card"*；*"Accent Cyan is not the default active color for global navigation; reserve it for local emphasis, progress, data"*。

## CONTENT FUNDAMENTALS

### Voice & tone

Com Design 的文案是**中文优先、专业、克制、信息密度高**的产品语言。句子短，动词前置，不使用感叹号和 emoji；状态不靠颜色单独传达，而是由"图标形状 + 文字标签"共同承担，以保证在暗色模式、色弱场景和低饱和屏幕上仍然可读。人称上默认第二人称省略（"请输入…"而不是"您请输入…"），错误信息直接给出可执行的修正动作，而不是只描述失败。数字与单位之间不留空，百分比、容量、计数都以紧凑形式呈现。

### Concrete copy examples

- 主操作按钮：*"确认提交"*
- 次要操作按钮：*"次要操作"*
- 输入校验错误：*"请输入有效的 11 位手机号"*
- 容量/进度描述：*"已使用 68%,共 128 GB。"*
- 流程终态：*"已完成"*
- 审核中状态：*"待审核"*
- 权限受阻：*"当前无访问权限"*

### When generating copy

- **先给动作，再给对象**：按钮写"确认提交"而不是"提交确认"；错误提示先告诉用户怎么改（"请输入有效的 11 位手机号"）。
- **状态必须可被文字独立读出**：标签文案（已完成 / 待审核）本身就要传达状态，颜色和图标只做强化，不承担唯一语义。
- **量化信息用紧凑格式**：百分比紧贴数字，容量句用全角逗号断句，如"已使用 68%,共 128 GB。"。
- **禁止 emoji 与营销腔**：界面内不出现表情符号、"哦"、"啦"等语气词，也不使用"立即体验"这类落地页话术。

## VISUAL FOUNDATIONS

### Color

品牌主色是 **Electric Indigo `#5B5EF7`**——一个偏冷的靛蓝紫，既不是纯蓝也不是纯紫，承担主按钮、链接、选中态、聚焦边框与品牌文字。色阶从 `--com-brand-50 #F0F1FF`（极浅容器底）经过 `100 #E3E5FF`、`200 #C9CDFF`、`400 #7B7EF8`、`500 #5B5EF7`（@primary）、`600 #494CE0`（按下态），到 `700 #393BBE`（深色文字/强压）；暗色模式额外延伸出 `800 #30326F` 与 `900 #25264D` 作为选中容器底。**Cyan `#16BFD3` 是强调色而非第二品牌色**，仅服务于局部强调、进度条、数据可视化和小范围信号，不用作全局导航的默认激活色——导航激活归 Brand Indigo。Cyan 阶有 `50 #E9FCFF`、`100 #CAF7FB`、`500 #16BFD3`、`600 #0E9FB3`，暗色下补 `900 #123E44` 作为 subtle 底。

中性色是 11 档灰度：`0 #FFFFFF` / `50 #F7F8FC`（页面底）/ `100 #F0F2F8`（卡片次底、按压）/ `200 #E2E6F0`（分割/禁用）/ `300 #CDD3E1` / `400 #8590A3`（默认边框）/ `500 #687288`（占位、三级文字）/ `600 #535D72`（二级文字）/ `700 #394156` / `800 #252B3D`（主文字）/ `900 #171B2A`（暗色卡片底）。注意这套中性色是**冷灰而非纯灰**，与靛蓝主色在色温上对齐。文字层级：主文字 `--com-text-primary`（neutral-800）、二级 neutral-600、三级/占位/禁用 neutral-500，反色为 neutral-0。

语义色采用"底 + 文"成对配置，避免纯饱和色直接铺大块：Success `#21B66F` 配 `#DDF8EA` 底与 `#147A4C` 文字；Warning `#F3A21B` 配 `#FFF2D6` 底与 `#9A6110` 文字；Danger `#D63E50` 配 `#FFE4E8` 底与 `#A92939` 文字；Info 直接复用 Brand 阶（`#5B5EF7` / `#F0F1FF` 底 / `#393BBE` 文字）。暗色下底色切到 900 档深色、文字切到 100 档浅色，保持对比度。遮罩统一为 `rgba(0,0,0,0.52)`（暗色 `0.6`）。整体色彩气质克制、偏冷、工程感，不使用默认渐变。

### Typography

字体栈为 **`system-ui, -apple-system, Segoe UI, Roboto, sans-serif`**——即 iOS 上落到 San Francisco (-apple-system)、Windows 上落到 Segoe UI、Android/旧设备回退 Roboto，不引入任何 web font，以保证移动端首屏速度与原生观感。权重仅使用 Regular 400、Medium 500、SemiBold 600 三档（Bold 700 保留但不用于正文层级）；**所有 label 类文字使用 Medium 500**，正文与说明使用 Regular，标题使用 SemiBold。

共 9 个语义角色，从 12px caption 到 28px display：`caption` 12/18 Regular、`label-small` 12/16 Medium、`body-small` 14/20 Regular、`label` 14/20 Medium、`body` 16/24 Regular（正文基准）、`heading-small` 16/22 SemiBold、`heading` 18/24 SemiBold（栏目标题）、`title` 24/30 SemiBold（页面主标题）、`display` 28/36 SemiBold（数据/空状态大数字）。行高被严格绑定：12px 配 16-18、14px 配 20、16px 配 22-24、18px 配 24、24px 配 30、28px 配 36，因此正文行宽即便拉满也不会出现松散行距。不使用负字距。

### Spacing

间距基准为 **4px 网格**，实际出 token 的档位为 `0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32`。注意刻意**不提供 40 以上的间距 token**——大块留白通过组合 32 + 16 实现，以避免设计师随手拉出不一致的大空白。组件密度默认 compact：控件高度 `--com-density-control-height: 40px`，大号控件 48px；触摸目标遵循 iOS 44px / Android 48px 的下限（`--com-size-touch-ios` / `--com-size-touch-android`），即视觉上可以是 40px，但命中区域必须外扩到 44/48px。图标尺寸三档：sm 16、md 20、lg 24，与 label 行高对齐。Section 内的分组靠 12-16px 间距完成，Section 之间才上 24-32px。

### Radius

圆角分四档语义：**控件 8px**（按钮、输入框、开关、菜单项）、**容器 12px**（卡片、sheet 区块）、**浮层 16px**（dialog、popover、bottom sheet 顶部圆角）、**pill 9999px**（标签、徽标、进度条轨道端点）。另保留 4px 用于次级小元素（tag 内部、checkbox）和 0 用于分割型容器。规则上"控件永远不超过 8、卡片不超过 12、只有遮罩型浮层才用 16"，这三级差异让用户能凭圆角直觉判断元素层级——圆角越大、离底层越远。

### Shadow / Elevation

**整个系统只有两档阴影**：floating `0 4px 12px 0 rgba(23,27,42,0.14)`（FAB、悬浮操作条、临时浮出的小卡）与 modal `0 8px 28px 0 rgba(23,27,42,0.18)`（dialog、bottom sheet、全屏弹层）。暗色下分别加深为 `0 4px 16px rgba(0,0,0,0.40)` 与 `0 10px 32px rgba(0,0,0,0.50)`。由于坚持 **flat-first**，普通卡片、列表项、按钮在 resting 态**没有默认阴影**，它们靠 1px 边框 + 背景色差建立层级；只有在元素真正脱离文档流时才上阴影。这是 Com Design 与 Material 风格最明显的视觉分野。

### Borders

边框宽度只有 `1px`（控件、卡片、分割线）与 `2px`（聚焦态外环）两种。颜色按语义分五档：`subtle` neutral-200（分割、弱描边）、`default` neutral-400（输入框默认）、`strong` neutral-500（强调边界）、`focused` brand-500（键盘聚焦）、`error` danger-500（校验失败）。禁止用阴影替代边框，也禁止使用 0.5px 以下的 hairline——在低密度移动屏上会发虚。

## COMPONENT PATTERNS

| Component | Preview | Contract | CSS Source | Key Facts | Key Insight |
|---|---|---|---|---|---|
| button | `preview/component-button.html` | `components/button.json` | `components.css` | compact 40px / large 48px；primary 用 brand-500、pressed brand-700；secondary 用 brand-50 底 + brand-700 字；destructive 走 danger 阶；圆角 8px；无默认阴影 | 主按钮在一屏内只出现一个；次要操作优先用 secondary 而非 tertiary 文字链 |
| input | `preview/component-input.html` | `components/input.json` | `components.css` | 高 40px、左右内边距 12px；默认 1px neutral-400 边框，focus 切 2px brand-500（注意宽度变化由 outline 承担不引发布局抖动）；错误态 border danger-500 + 下方 caption danger-700 | label 用 14/20 Medium；校验文案必须给修正动作，不写"输入有误" |
| list-item | `preview/component-list-item.html` | `components/list-item.json` | `components.css` | 最小高 48px（≥ Android 触摸下限）；左侧图标槽 24px、右槽可为 chevron/开关/数值；分割线左内缩 16px 与文字对齐，不顶满 | 列表整体属于 Section，**Section before Card**：优先用分组 + 分割，而非把每一项包成独立卡片 |
| card | `preview/component-card.html` | `components/card.json` | `components.css` | 容器圆角 12px；默认 1px neutral-200 边框 + neutral-0 底，无阴影；内边距 16px；可点按时 pressed 底切 neutral-100 | resting 态不上阴影；只有被拖起或悬浮时才借 floating 阴影，严格 flat-first |
| tag | `preview/component-tag.html` | `components/tag.json` | `components.css` | pill 9999px；语义色采用 tinted bg + 深色文字（success-100/success-700 等）；小尺寸高 20px、12px Medium 文字 | 标签是状态信号，不是按钮；不可点击的 tag 不应该有 hover/active 态 |
| bottom-navigation | `preview/component-bottom-navigation.html` | `components/bottom-navigation.json` | `components.css` | 高 56px；激活态用 brand-500 图标 + brand-600 文字（**不是 cyan**），未激活 neutral-500；图标 24px、label 12/16 Medium | Cyan 被刻意排除在全局导航之外，仅用于内容区局部强调/进度/数据 |
| checkbox | `preview/component-checkbox.html` | `components/checkbox.json` | `components.css` | 表单选择；20px 方框、4px 圆角、1px 边框；checked/indeterminate 均为 brand-500 实底 + inverse 标记，对勾与横杠分别表达全选/部分选中；indicator 与 label/helper 共享点击区 | 20px 方框,选中填充品牌主色配白色对勾;indeterminate 用横杠;指示器与文案共享点击区 |
| radio | `preview/component-radio.html` | `components/radio.json` | `components.css` | 表单选择；20px 圆环、1px 边框；选中为 brand-500 ring + 8px 同色实心点；组内纵向间距 12px，outer 与 label 共享 hit target | 20px 圆环,选中为主色环 + 8px 实心点;仅用于组内互斥单选 |
| switch | `preview/component-switch.html` | `components/switch.json` | `components.css` | 表单开关；44×24 pill 轨道、20px thumb、2px inset、行程 18px；on 为 brand-500 轨道、off 为 subtle 底；整行可点，轨道内无 ON/OFF 文案 | 44×24 胶囊轨道 + 20px 滑块,即时生效的二元设置;禁用态仍需保留开/关区分 |
| dialog | `preview/component-dialog.html` | `components/dialog.json` | `components.css` | 反馈浮层；52% scrim、容器宽 min(320px, 100%-48px)、16px 圆角、modal 阴影；纵向 icon/title/body/actions；至多一个 primary + 一个 cancel，危险确认主操作用 destructive | 阻断式决策,scrim + 16px 圆角 + modal 阴影;至多两个操作,危险确认用 destructive 按钮 |
| alert | `preview/component-alert.html` | `components/alert.json` | `components.css` | 反馈提示；inline/banner 两变体，info/success/warning/danger 四 tone；8px 圆角、12×8 padding、tinted bg + 对应 *Text 色图标文案；至多一个高频操作 | 持久化行内/横幅提示,色调背景 + 对应 *Text 色图标文案;至多一个高频操作 |
| toast | `preview/component-toast.html` | `components/toast.json` | `components.css` | 反馈轻提示；深色 inverse surface、8px 圆角、12×8 padding、底部 16px inset、floating 阴影；状态由图标形状 + 文案共同表达，带一个恢复操作时即 Snackbar 变体 | 瞬时非阻断,深色 inverse 胶囊,状态由图标形状 + 文案共同表达;至多一个恢复操作(Snackbar) |

## Index

- `README.md` — 本文档，面向设计师的品牌叙述与使用 brief
- `colors_and_type.css` — 颜色、字体、间距、圆角、阴影的 CSS 变量（含暗色模式 `.dark`）
- `css.json` — 上述 token 的结构化 JSON 表达，供程序化消费
- `components/` — 12 个代表性核心组件的契约 JSON（`index.json` + button / input / list-item / card / tag / bottom-navigation / checkbox / radio / switch / dialog / alert / toast）
- `preview/` — 每个组件的独立 HTML 预览页（`component-button.html`、`component-input.html`、`component-list-item.html`、`component-card.html`、`component-tag.html`、`component-bottom-navigation.html`、`component-checkbox.html`、`component-radio.html`、`component-switch.html`、`component-dialog.html`、`component-alert.html`、`component-toast.html`）
- `specs/` — 设计系统 v1 结构化规范（`design-system-v1.json`）
- `components.css` — 从预览页聚合的组件运行时样式，当前覆盖全部 12 个组件
- `SKILL.md` — AI 代理入口清单

## Caveats / 已知替换与缺口

1. **字体栈为 `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`，不引入任何 web font**。这是有意为之——首屏性能与原生感优先于跨设备字形完全一致；跨端截图时数字与拉丁字符字形会随平台变化，属于预期。
2. **图标在预览中以内联 SVG（Lucide 风格 outline 图标）渲染**，未引入 icon font 或图标包。线条粗细、24px 画布与 1.5-2px 描边是匹配 token 的，但实际生产库应替换为集团统一的 SVG sprite。
3. 本次仅生成 V1 计划中 **33 个核心组件里的 12 个代表件**（button、input、list-item、card、tag、bottom-navigation、checkbox、radio、switch、dialog、alert、toast）。新增表单控件（Checkbox / Radio / Switch）遵循已确立的 fieldFamily 约定：20px 选择器尺寸、14/20 label、14/20 helper、8px 指示器与文案间距、组级错误复用 Input 的 helper 表现；新增反馈组件（Dialog / Alert / Toast）遵循最小打断与单阻断浮层层级——Dialog 是唯一阻断式 modal，Alert 持久但不阻断，Toast 瞬时且不堆叠。其余组件遵循同一份 token 契约与密度规则，可按相同模式扩展，并非被遗漏；其中 select / textarea / icon-button，以及 tabs 与 dialog 邻近浮层（bottom sheet、Snackbar action 变体、loading / skeleton）仍保留给后续扩展。
4. Token 中已记录 comfortable 密度（控件 48px）与 iOS/Platform 模式变量，但**预览与组件契约当前默认展示 compact 密度**；切换到 comfortable 时主要影响控件高度与触摸外扩，色板与字号不变。
5. 动效契约（过渡时长、缓动、位移距离）在规范中被引用，但**预览页未做可视化**，目前只能从 specs 中读取数值。
6. 版本号 `1.0.0-rc.2` 表示仍在候选阶段，**RC2 的 P1 加固项（组件覆盖扩展、动效可视化、暗色模式回归）仍在上游计划中**，不在本次重建产出范围内。
7. Token 采用**双层命名**：`--com-*` 为保留的源命名（对齐 com-design 原始契约），`--color-*` / `--radius-*` / `--space-*` / `--type-*` 为可移植消费层，组件与预览只消费后者。两层在 `css.json` 中会投影出相同数值，属于有意保留的设计契约，而非重复定义。
