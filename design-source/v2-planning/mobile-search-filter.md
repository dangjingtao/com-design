# V2 — Mobile Search & Filter

> Status: Confirmed V2 refinement  
> Scope: Search Field / Search Pattern / Filter Bar / Collection Filter  
> Platforms: iOS / Android / WeChat Mini Program  
> Counting rule: 当前不新增 Core Component 数量；优先完善现有 Search Field、Filter Bar 与 Search / Collection Filter Pattern。

## 1. Direction

V2 的目标不是再做两个“搜索框 / 筛选按钮”皮肤，而是提供可直接落地的移动端检索工作流：

```text
Search Field
→ Search Experience
→ Search Results
→ Filter Entry
→ Filter Draft
→ Apply / Reset
→ Result Feedback
→ Detail Return / State Restoration
```

统一原则：

- Search 负责“用户正在找什么”；Filter 负责“结果必须满足什么条件”；两者状态独立但可组合；
- Query、Filter、Sort、Pagination / Incremental Loading 必须由集合 owner 统一管理，不能各自维护一份真相；
- 移动端优先减少常驻控制项，复杂能力进入 Bottom Sheet / Full-screen surface；
- Search / Filter 的视觉默认 neutral-first，Brand 只用于 focus、selection、active condition 和明确动作；
- 所有状态必须在 iOS / Android / 微信小程序保持等价语义，不要求三端使用同一底层控件。

---

## 2. Search Field — V2 refinement

现有 Search Field 继续作为 Core Component，不另造 `Searcher` 组件。

### Anatomy

```text
leading search / loading icon
→ query or placeholder
→ optional clear action
→ optional one trailing product action
```

要求：

- 单行输入；长 query 水平滚动或由原生 text field 管理，不允许撑高 Search Field；
- 非空 query 必须提供 clear；clear 后保持输入焦点，除非产品明确结束搜索任务；
- loading 时保留 query，不把输入内容替换成 spinner；
- trailing slot 最多承担一个明确动作，不能演变成小工具栏；
- disabled 必须有明显视觉差异，但 Search 不应用 disabled 表达“无结果”；
- 触摸目标满足移动端平台 guidance；视觉高度与 hit area 可以分离。

### Input / IME contract

中文、日文等组合输入必须作为正式验收项：

- IME composition 期间不得把每个中间拼音 / 组合字符都当成 committed query；
- debounce search SHOULD 在 composition end 后生效；
- explicit-submit 模式下，键盘 Search / Enter / Confirm 才提交 committed query；
- instant-search 模式需要 debounce / cancellation / stale-response guard；
- 删除、clear、语音/系统输入等输入路径必须保持一致状态模型；
- 不依赖某一 Web `input` 事件语义作为跨端标准。

### Search modes

V2 正式支持两种提交模型：

1. **Instant / Debounced Search** — 用户停止输入后自动搜索；
2. **Explicit Submit Search** — 用户点击键盘 Search / 提交动作后搜索。

产品必须明确选择，不允许同一界面一会儿实时、一会儿还要求点击“搜索”。

---

## 3. Mobile Search Experience

`Search Field` 是控件，完整搜索过程属于 `Search Pattern`。

### Entry states

搜索进入后应明确区分：

- idle / pre-search；
- focused-empty；
- typing / composing；
- suggesting；
- searching；
- results；
- zero-results；
- recoverable-error。

Loading、Zero Result、Error 不得共用一张“暂无数据”页面。

### Pre-search content

Focused-empty 状态 MAY 提供：

- recent searches；
- product-provided suggestions / popular searches；
- scope / context hint。

规则：

- 历史搜索与系统推荐必须视觉区分；
- 历史记录 SHOULD 可单项删除；清空全部属于明确 destructive-ish maintenance action，不做品牌 Primary；
- Search History 是产品数据 / local state，不进入 Core 固定业务模型；
- 没有真实需求时不要为了“丰富页面”硬加热搜榜。

### Suggestions

- suggestion 与 result 必须区分；前者帮助形成 query，后者是检索结果；
- 点击 suggestion 后，是“填充 query”还是“立即提交”必须契约化；默认建议立即成为 committed query 并搜索；
- 异步 suggestion 需要 stale-response guard，不能旧关键词的建议覆盖新输入；
- 列表项需要足够 hit area，不做一排密集小字链接。

### Cancel / Back semantics

移动端 Search 必须定义取消行为：

- `Clear` 只清 query，不代表离开搜索任务；
- `Cancel / Back` 才结束当前搜索上下文或返回上一页；
- 如果搜索是页面内常驻能力，Back 不应无故清除 committed query；
- 如果搜索是独立 Search Screen / Search Overlay，退出后是否保留 query / history 由 task continuity 决定；
- 系统返回手势、Android Back、微信小程序返回必须映射到同一语义，而不是每端随手写。

---

## 4. Search result continuity

Search 结果页必须和 Collection Pattern 对齐：

- 进入 detail 再返回时，保留 committed query；
- SHOULD 恢复 filter、sort、loaded data 与 scroll position；
- 返回后不重新跳到顶部，除非结果数据已失效或产品明确刷新；
- query 变化后重置旧 continuation / page state；
- 新 query 搜索开始时可以保留旧结果直到新结果 ready，但必须有清晰 loading indication，不能让用户误以为旧结果属于新 query；
- 错误时保留可用的旧结果 / query，并提供 retry；
- Search 与 Incremental Loading 组合时，query / filter 改变必须取消旧 load-more continuation。

---

## 5. Mobile Filter — information architecture

V2 将筛选分成两级，而不是把所有条件都常驻在页面顶部。

### A. Quick Filter

适合：

- 1–3 个高频、低复杂度条件；
- 单选或很浅的状态切换；
- 用户需要频繁比较结果。

表现可使用：

- compact chips / segmented-like filter choices；
- filter trigger + active count；
- 少量可直接移除的 applied condition。

规则：

- Quick Filter 不等于 Tabs；如果选项改变的是过滤条件而不是 peer view，就不要伪装成导航；
- 不让一排 Filter Chip 全部 Brand fill；active 使用有限 selected treatment；
- 横向空间不足时优先收进 Filter Surface，不靠无限横向滚动堆十几个条件。

### B. Advanced Filter Surface

复杂筛选进入专门的 draft surface。

默认优先：

```text
Mobile Bottom Sheet
```

当条件很多、层级深、需要搜索候选项或编辑大量范围条件时，升级为：

```text
Full-screen Filter Page / Full-height Sheet
```

不能为了坚持 Bottom Sheet 把 10 个 section 塞进半屏小抽屉。

---

## 6. Filter Bar — V2 refinement

现有 `Filter Bar` 保留为 Core Composite Component。

建议 Anatomy：

```text
optional Search Field
→ optional quick filters
→ Filter Trigger
→ active-count / applied-condition summary
→ collection result feedback
```

要求：

- Search Field 与 Filter Trigger 同行时，Search Field flex-grow，Filter Trigger 保持稳定 hit area；
- Filter Trigger 在有 committed condition 时必须有明显 active cue，可用 count / dot / text，不仅靠颜色；
- active count 表达“当前生效条件数量”，不是内部 option 数量；
- Reset filter 默认不清 Search query；Clear query 默认不清 Filter；
- 条件很多时，不在主页面完整回显所有 chips；显示关键条件 + count / summary，防止结果区被 chrome 挤没；
- sticky Filter Bar 可以作为场景 variant，但必须尊重 Top App Bar / Safe Area，不形成双重 sticky 冲突。

---

## 7. Filter Draft / Commit contract

复杂筛选必须保持 `draft ≠ committed`。

```text
open filter
→ copy committed → draft
→ edit draft
→ Apply → committed
```

要求：

- 打开时 draft 从 committed 初始化；
- 修改 draft 不立刻污染结果集合；
- dismiss / back without Apply 不提交；
- Apply 是 Filter Surface 内唯一可成为 Primary 的动作；
- Reset 默认先重置 draft，再由用户 Apply；是否提供 `Reset & Apply` 作为快捷动作需产品明确；
- Apply 后关闭 Surface，并刷新 collection；
- 返回 Filter Surface 时，应展示当前 committed condition，而不是上一次未提交草稿；
- 如果产品确实要求实时过滤，必须明确使用 `live filter mode`，且此时不再伪装成 Apply-draft 模式。

### Apply feedback

- MAY 显示预计 / 当前 result count，例如“查看 24 个结果”；
- result count 正在计算时不能导致 Apply 大幅抖动或失去可点击性；
- 无结果时仍允许 Apply，但结果页需要明确 Zero Result + 调整条件入口；
- 不用 Disabled Apply 作为唯一的“没有变化”提示。

---

## 8. Filter control selection

Filter Surface 内部优先消费现有 Core Components：

- Radio — 单选；
- Checkbox — 多选；
- Switch — 立即语义明确的二元设置，但一般不作为多条件筛选首选；
- Select — 候选较短、选择行为稳定；
- Search Field + List Item — 大型可搜索候选集合；
- Input — 明确数值；
- Date / Range 等目前没有正式 Core Contract 时，不在 V2 文档中假装已具备，应另行审查。

避免：

- 用大量 Switch 表达普通 filter option；
- 用 Menu 承载复杂多选筛选；
- 为了省空间把 label 缩成只有 icon；
- 每个 filter section 再包一张 Card。

---

## 9. Platform mapping

### iOS

- Search keyboard 使用平台 search / return action，但 Core 不绑定 UIKit / SwiftUI API；
- 键盘弹出时 Search Field / suggestions / results 不能被遮挡；
- interactive back / swipe-back 的语义必须与 Cancel / return continuity 一致；
- Filter Sheet 处理 safe-area bottom inset；sticky Apply 不被 Home Indicator 遮挡；
- 原生 sheet detent 可由 Adapter 使用，但不能让不同 detent 改变 filter commit 语义；
- VoiceOver 能识别 search field、clear、active filters、filter count、Apply / Reset 与 result feedback。

### Android

- IME action `Search` / Enter 映射 committed submit；
- 系统 Back：键盘打开时优先按平台惯例 dismiss keyboard；再次 Back 再退出 Search Context / Filter Surface，具体状态机必须明确；
- Bottom Sheet / full-screen filter 根据内容复杂度选择，不强制一个组件包办；
- gesture navigation inset 不遮挡 sticky footer；
- TalkBack 获得与 iOS 等价的 query / active filter / result count 语义。

### WeChat Mini Program

小程序必须作为正式目标平台，而不是 H5 fallback。

Search Adapter 需要考虑：

- input composition / confirm 行为映射到小程序宿主事件；
- 键盘 `confirm-type="search"` 或等价宿主能力仅作为实现细节，不能写入 Core Contract；
- 页面滚动与输入 focus 时避免页面被键盘顶出错误位置；
- Search Screen 若是独立页面，返回必须恢复前一集合的 query / filter / scroll state。

Filter Adapter 需要考虑：

- 简单筛选可使用自定义 Bottom Sheet；复杂筛选 MAY 使用独立页面，避免超长 scroll-view 套 page scroll；
- Filter Surface 与宿主页面的 scroll ownership 必须明确；
- 底部 Apply / Reset 处理安全区 / 自定义 tab bar / 宿主 inset；
- 微信返回行为需要区分“关闭筛选面板”和“退出页面”；
- 不依赖浏览器 History API 作为唯一状态恢复机制。

---

## 10. Search + Filter coexistence

组合场景必须共享一个 Collection Query Model：

```text
CollectionQueryModel
├─ committedQuery
├─ committedFilters
├─ sort
├─ continuation
└─ restorationState
```

规则：

- Search / Filter / Sort 改变后，重新计算结果并重置 continuation；
- 对同一 Collection 不允许 Search Field、Filter Sheet 和 Result List 各维护独立 committed state；
- Filter Surface 打开期间，外部 Search query 若变化，需要明确 cancel / rebase draft 行为，避免 apply 旧草稿覆盖新上下文；
- 清除 Filter 后保留 Search；清除 Search 后保留 Filter，除非产品提供明确“全部重置”；
- Zero Result 页面必须告诉用户是 query 造成、filter 造成，还是两者组合造成，并给对应 recovery action；
- Detail Return 使用同一 restoration state 恢复 query / filter / result / scroll。

---

## 11. Visual direction

移动 Search / Filter 统一采用 Com Design 的 restrained / neutral / flat-first 方向：

- Search Field 使用 subtle neutral surface；focus 才增强 border / focus cue；
- Filter Trigger 默认 neutral；active 后增强 selected cue，但不直接变成大块 Primary Button；
- applied filter chip 保持轻量，不和 Primary CTA 争视觉；
- Filter Surface 用 spacing、Section、Divider 建立层级，避免 Card-in-Card；
- sticky Apply region 可有轻量 separation，不使用重阴影悬浮条；
- Loading / Empty / Error / Result Count 使用现有反馈系统，不各自造新视觉语言。

---

## 12. Required V2 preview / acceptance scenarios

施工时至少需要这些可交互 Preview / smoke scenarios：

1. Focused empty search：键盘 + recent / suggestion；
2. 中文 IME 输入 + debounced search，不出现拼音中间态误请求；
3. Search loading → results → detail → return，query / scroll 恢复；
4. Search zero result，与 error 明确不同；
5. Search + active filters，Filter Trigger 有 count，主页面不过度堆 chip；
6. Advanced Filter Bottom Sheet：修改 draft → dismiss，不污染 committed state；
7. Advanced Filter：修改 → Apply → result refresh；
8. Reset draft / Apply 行为明确；
9. 条件很多时升级 full-screen filter，而不是小 Sheet 塞爆；
10. iOS / Android / 微信小程序三端至少各有一套适配 smoke，验证 keyboard / back / safe-area / scroll restoration。

---

## 13. Classification

当前 V2 判断：

- `Search Field`：继续为 Core Component，完善 state / IME / submit contract；
- `Search Pattern`：继续为 Core UX Pattern，扩展 search lifecycle / suggestion / restoration；
- `Filter Bar`：继续为 Core Composite Component，完善 quick-filter / active-summary / responsive mobile anatomy；
- `Collection Filter`：继续为 Core UX Pattern，强化 draft / committed / reset / apply / result feedback；
- `Search Screen / Search Overlay`：暂不新增 Core Component；若多个产品验证 anatomy 和 API 稳定，再考虑 Composite；
- `Full-screen Filter Surface`：作为 Collection Filter 的 presentation strategy，暂不单独增加组件；
- Search / Filter 不增加新的 Core 数量，优先把现有能力真正做完整。
