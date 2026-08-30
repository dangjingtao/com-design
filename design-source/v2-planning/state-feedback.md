# V2 Planning — Empty State & Result State

> Status: Confirmed planning direction  
> Scope: Com Design V2  
> Platforms: iOS / Android / WeChat Mini Program / Web / Desktop

## 1. Current V1 boundary

V1 已有正式 `Empty State` Core Component，当前 variants 包含：

- `first-use`
- `no-results`
- `no-data`
- `recoverable-error`

其中 `first-use / no-results / no-data` 属于典型空内容状态；`recoverable-error` 实际更接近错误 / 恢复反馈。V2 需要把这两个概念重新分清。

---

## 2. V2-EmptyState — Empty State refinement

**确定需求：** V2 保留并完善 `Empty State`，但它主要负责“内容不存在 / 尚未产生 / 当前条件下无结果”，不承担所有成功失败反馈。

建议正式 variants：

- `first-use`：首次使用 / 尚未创建内容；
- `no-data`：当前集合为空；
- `no-results`：搜索 / 筛选后无结果；
- `cleared / completed-empty`：内容因完成、清空等操作变为空时，可按产品场景决定是否需要单独文案，但不强制作为独立视觉 variant。

标准 anatomy：

```text
optional visual
→ title
→ supporting text
→ optional primary action
→ optional secondary action
```

要求：

- 默认最多一个 Primary Action；
- Visual 可为 Icon / illustration，但不能压过任务本身；
- `no-results` 必须保留 query / filter 上下文，不得伪装成“系统里什么都没有”；
- Empty State 不使用 Success / Danger 等强语义色作为默认装饰；
- 空状态应说明“为什么为空”以及“下一步能做什么”；
- iOS / Android / 小程序共享内容结构和状态语义，平台仅映射字号、safe area、touch target 等实现细节。

### V2 migration note

V1 的 `recoverable-error` SHOULD 从 Empty State 主语义中移出；为了兼容旧实现可以保留 migration alias，但 V2 新设计不再把错误态当作“空”。

---

## 3. V2-ResultState — Result / Outcome State

**确定需求：** V2 新增正式的 **Result State / Outcome State** 能力，用于表达一个任务、提交、流程或页面级操作的结果。

推荐标准名：

- 设计系统名称：`Result State`
- 中文：`结果状态 / 结果页`
- 不建议把组件直接命名为 `Success Page`、`Error Page`，成功与失败应是同一契约下的 semantic variants。

### Core semantic variants

建议至少支持：

- `success` — 操作 / 流程成功完成；
- `error` / `failure` — 操作失败，可恢复或不可恢复；
- `warning` — 已完成但存在风险 / 需注意后续动作；
- `info` — 中性结果 / 说明；
- `pending` / `processing` — 已提交但结果尚未完成。

以下状态与 Result State 视觉结构可能复用，但语义上需要保持区别：

- `offline` — 环境 / 网络阻断状态；
- `permission-denied` — 权限 / 资格阻断；
- `not-found` — 资源不存在；
- `maintenance / unavailable` — 服务不可用。

这些是否作为 Result State variants 还是更高层 `Blocking State`，在 V2 实施阶段根据 API 稳定性再定；先不要为了凑 variants 把所有异常都塞进一个枚举。

### Anatomy

```text
semantic visual / icon
→ title
→ supporting / result summary
→ optional detail / metadata
→ primary action
→ optional secondary action
```

要求：

- `success / error / warning / info / pending` 必须通过 icon / copy / structure 等共同表达，不能只靠颜色；
- 语义视觉消费 Com Design Icon Registry，不在 Result State 内绑定某套图标库；
- 一个结果面最多一个视觉 Primary Action；
- Error 若可恢复，Primary 通常是 Retry / Re-submit / Return to editable state；
- Success 的 Primary 应指向真实下一步，而不是机械放“确定”；
- Pending 必须说明用户是否可以离开、稍后回来、是否会自动刷新；
- Result State 默认不使用超大品牌插画，不把结果页做成营销 Hero；
- 页面级 Result 与局部 inline feedback 需要区分：字段错误用 Field Error，局部提示用 Alert / Snackbar / Toast，不要为了一个小错误跳整页 Result。

---

## 4. Empty vs Result vs Alert boundary

```text
没有内容 / 没搜索到       → Empty State
任务完成 / 提交结果        → Result State
页面局部提醒 / 风险提示    → Alert / Inline Banner
短暂操作反馈               → Toast / Snackbar
表单字段错误               → Field-level validation
系统阻断 / 无权限 / 离线    → Blocking State candidate
```

### Key rule

**Empty State 不是 Error State；Result State 也不是所有系统异常的垃圾桶。**

V2 应先按用户所处任务阶段划分，再选择视觉语义。

---

## 5. Cross-platform notes

### iOS

- Respect Safe Area / Dynamic Type；
- VoiceOver 能读出结果语义、标题、说明和下一步动作；
- Result 页出现后不自动把 focus 抢到装饰 Icon；
- Success / Error haptic 属于平台行为候选，不进入 Core visual contract。

### Android

- 支持 font scaling / TalkBack；
- 系统导航 inset 不遮挡底部 action；
- semantic color 不替代 icon / text；
- 是否使用 platform haptic / announcement 由 Adapter 决定。

### WeChat Mini Program

- 结果页必须能适配普通 Page 与自定义 Navigation Bar / Safe Area；
- 不依赖系统原生 Result 控件，Core 自己保持一致的结构契约；
- 网络失败 / 小程序宿主异常时，Retry 必须是显式 Action；
- 不因为小程序端实现方便就把 Toast 当成关键失败结果的唯一反馈。

---

## 6. Classification candidate

当前建议：

- `Empty State`：继续保留 **Core Component**，V2 收紧语义边界；
- `Result State`：**Core Component candidate**，因为 anatomy / semantic variants / action contract 足够稳定且跨产品复用价值高；
- `Blocking State`：先作为 **UX Pattern / Composite candidate**，待权限、离线、404、维护等真实场景进一步审查；
- V1 `recoverable-error`：迁移到 Result / Blocking 语义，Empty State 仅保留兼容映射。

## 7. V2 decision summary

V2 必须形成完整的状态反馈谱系：

`Loading → Content / Empty → Result / Error → Recovery / Next Action`

不能只补一个漂亮的空状态，却让成功、失败、警告、处理中各项目自己随手画。