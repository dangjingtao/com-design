# Com Design Core Composite Components

> Status: Release Candidate / Core  
> Scope: Company Mobile Core  
> Canonical machine source: `specs/core-composites.json`  
> Composite count: 4  
> Core Component count remains: 33

Com Design 增加 **Composite Component（组合组件）** 层，用来收纳那些已经有稳定结构、稳定交互和明确消费方式，但本质上由多个 Core Component 组合而成的 UI。

它解决一个此前容易混淆的问题：

```text
Core Component    = 一个独立控件 / 信息单元
Composite         = 一套稳定、可直接实例化的组合
UX Pattern        = 一套任务规则，允许多种视觉实现
Product Extension = 带业务语义的产品实现
```

因此当前系统层级为：

```text
Primitive → Semantic → Component → Composite Component → UX Pattern → Product Extension
```

Composite 不是“更大的 Card”，也不是把某个业务页面直接搬进 Core。它必须满足：

- 跨产品仍然保持同一组件身份；
- anatomy 和 interaction 可以稳定定义；
- 可以形成清晰 API / props / slots；
- 不依赖业务页面名、状态枚举或领域文案；
- 由现有 Core Component 组成，不修改下层语义。

---

## 1. Carousel｜轮播

用于少量同级内容的横向浏览。

### 结构

```text
viewport
→ track
→ slide
→ optional previous / next
→ position indicator
→ accessible status
```

### 设计

- 默认保持内容主导，Carousel 外壳不额外制造强品牌底色或阴影。
- 容器建议使用 `12px` 级别圆角；不同 slide 高度应稳定，避免页面上下跳动。
- 指示点可以视觉上很小，但点击区域不能跟着缩小。
- 移动端优先支持原生滑动 / scroll-snap；左右箭头是补充，不是主入口。

### 交互

- **Autoplay 默认关闭。**
- 启用 Autoplay 时建议间隔至少 5 秒，并在用户触摸、聚焦或主动切换后暂停。
- Reduced Motion 下停止自动轮播或取消平滑位移动画。
- 连续运动超过 5 秒时必须提供暂停 / 停止能力。
- 用户主动切换可以播报当前位置；自动播放不要持续打扰读屏。

### 不要

- 2 秒一跳的广告轮播；
- 只能靠自动播放发现内容；
- 8px 指示点同时也是 8px 点击区域；
- 箭头挡住标题、价格、按钮；
- 一整张 slide 可点击，同时里面又塞多个重叠操作区。

---

## 2. Filter Bar｜筛选栏

这是 `Collection Filter` Pattern 的推荐 Composite 实现之一。

### 结构

```text
optional Search Field
+ filter trigger / active count
→ optional active conditions
→ draft Bottom Sheet / Dialog
→ Apply
→ result feedback
```

### 状态所有权

必须区分：

```text
pending query / draft filters
≠
committed query / committed filters
```

集合页面仍然持有 committed truth。Filter Bar 可以持有输入中的 query 和浮层 draft，但 **Apply 之后不再维护第二份业务真相**。

### 交互

- Filter Trigger 在有条件时显示 active count，但仍然是工具动作，不升级成页面 Primary。
- 打开筛选浮层时，用 committed state 初始化 draft。
- 未 Apply 直接关闭：不修改 committed state。
- 在筛选浮层这个独立 action group 内，**Apply 可以成为唯一 Primary**；Reset 使用 Tertiary / text treatment。
- 生效条件需要时可以回显为可单独移除的条件项。
- Apply 后应通过结果数量或状态区域明确告诉用户结果已经更新。
- 进入详情再返回，只要筛选任务仍然连续，就保留 committed state。

### 不要

- 用户点一个选项就偷偷提交一次，导致多条件比较困难；
- 页面和 Sheet 各自维护一份“已提交筛选”；
- Trigger、Chip、Footer 全部铺成品牌色；
- 用一个灰掉的 Apply 按钮代替状态反馈。

---

## 3. Tabbed Action Bar｜标签导航操作栏

用于“同级视图 Tabs + 少量当前上下文工具动作”的稳定组合。

它对应的是一类常见移动页面：左侧是同级内容切换，右侧可能有 Search / Filter / More 等局部工具。

### 结构

```text
Tabs
+ optional local utilities
+ optional overflow
```

### 设计改进

- Tabs 始终是主结构；右侧工具只是辅助。
- 360–430px 常见手机宽度下，建议最多保留 **2 个局部工具动作**在同一行。
- 第三个及以后优先进入 Overflow，或回到更合适的 Top App Bar。
- 像“全局消息通知”这类跨 Tab 的动作，通常属于 Top App Bar，而不是每个局部 Tabs 行。
- Tab 使用正常文字 + `2px` Indicator，不把每个 Tab 都做成品牌填充胶囊。
- 标签不换行；空间不足先切换 scrollable tabs，再考虑缩减文案。

### 交互

- 点击 Tab 后选中态应立即稳定，不等待网络请求结束才亮起。
- 内容 Loading 放在导航下方，不让导航自己闪烁、回跳。
- Web / 桌面 WebView 使用标准 tablist 键盘行为；移动端保证完整触摸目标。
- Action Badge 出现时不能改变 Tabs 顺序或导致指示器位置跳动。

### 不要

- 三个 Tab 旁边再硬挤三个同等级 Icon Button；
- Search、Filter、Notification 全部塞进一个窄行当默认模板；
- 为了“显眼”把 Tabs 和工具按钮一起染成品牌实底；
- 用缩小点击区来换空间。

---

## 4. Grouped List｜分组堆叠列表

适用于设置、服务入口、账户信息、功能入口等多个相关 List Item 的稳定分组。

这是对“卡片套卡片”的直接替代方案之一。

### 结构

```text
optional Section heading
→ one group surface
  → List Item
  → inset Divider
  → List Item
  → inset Divider
  → List Item
```

### 视觉

- 一组相关条目共用一个 Surface，不给每一行再套 Card。
- 行高建议约 `52–56` logical units，同时保证 iOS / Android 的触摸目标要求。
- Divider 保持 subtle，可从内容列开始，不必切穿左侧 icon 区域。
- Leading icon 可以有轻量容器，但**默认 Neutral Surface**；不要每一行都塞浅紫 icon block。
- Brand tint 只在 selected / identity / meaningful emphasis 时出现。

### Trailing accessory 规则

- `Chevron`：整行跳转。
- `Switch`：整行用于设置切换时，不再默认同时出现 Chevron。
- `Value`：展示当前值，可与 Chevron 组合表示进入详情修改。
- `Badge`：只表达真实未读 / 状态，不作为装饰。

如果整行是导航，**整行都应该可点击**，Chevron 只是方向提示，不是一个 20px 的独立按钮。

### 交互

- Pressed / Focus 状态作用于整行 Surface。
- 避免“点文字跳转、点箭头才跳转”的不一致热区。
- 危险动作放在组尾或独立 Section，并使用 Danger text；默认不铺红色背景。
- 多组列表之间使用 Section spacing 建立层级，不靠越来越重的 Card / shadow。

---

## 和 UX Pattern 的关系

Composite 可以成为 Pattern 的**推荐实现**，但两者不是一一对应：

- `Filter Bar` 是 `Collection Filter` 的一个稳定实现；Pattern 仍允许别的实现。
- `Tabbed Action Bar` 可以参与 Search / Collection Filter，但它本身不是搜索流程。
- `Grouped List` 可以承载 `State to Action` 或 `Contextual Next Step`，但业务状态仍由 Pattern 决定。
- `Carousel` 是直接可实例化的组合，不需要为了存在而发明一个 “Carousel Pattern”。

因此不要把层级倒过来：

```text
Pattern 决定任务逻辑
Composite 提供稳定组合
Core Component 提供基础控件
```

详细机器契约以 `specs/core-composites.json` 为准，视觉与交互参考见 `preview/core-composite-components.html`。
