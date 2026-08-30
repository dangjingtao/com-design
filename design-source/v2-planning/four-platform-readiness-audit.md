# Com Design V2 — Four-Platform Readiness Audit

> Status: Planning / architecture audit  
> Target platforms: Android / iOS / Web / WeChat Mini Program  
> Date: 2026-08-31  
> Scope: 仅记录当前 `dev` 的设计与架构风险，不自动修改 V1 Core implementation。

## Executive judgment

Com Design 当前已经具备较好的 Mobile V1 设计骨架、Token 语义和 Component / Composite / Pattern 分层，但如果 2026 年 9 月开始同时作为 Android、iOS、Web、微信小程序四端的设计系统使用，主要压力不来自 33 个组件数量，而来自：

1. canonical source / manifest 完整性；
2. platform model 从 iOS/Android 扩成四端；
3. Web-shaped token 值向 Native / Mini Program 的真实适配；
4. Component Contract 的 machine validation；
5. Preview 与 Contract 的视觉一致性；
6. responsive / input modality / accessibility foundations；
7. Mini Program adapter 与平台 Chrome / Safe Area 契约。

若目标是“V2 作为统一设计契约 + 各端 adapter 开始被项目消费”，9 月可控；若目标是“9 月内交付四套 production-grade Core Component library 并达到稳定版”，风险明显偏高。

---

# P0 — 四端开始消费前必须收口

## P0-01 — Canonical manifest 声明了不存在的 source / schema

### Observation

`design-source/specs/design-system-v1.json` 当前声明了：

- `../tokens/tokens.json`
- `../tokens/theme-dark.json`
- `../tokens/motion.json`
- `component-contract-v1.schema.json`
- `theme-overlay-v1.schema.json`
- `motion-modes-v1.schema.json`
- `iconography-contract-v1.schema.json`
- `iconography.json`
- `actions-forms.json`
- `navigation-information.json`
- `feedback-overlay-progress.json`
- `search-menu.json`

但当前 `design-source/schemas/` 实际只有 Composite 与 Pattern 两个 schema，`design-source/specs/` 也只有四个现存 spec 文件，且 `design-source/tokens/` 不存在。

Manifest 同时把 `motionStandardReducedMapped`、`iconographyContractMapped` 等 release gate 标为 `true`。

### Risk

- AI / tooling 会把不存在的路径当权威 source；
- release gate 失去可信度；
- V2 四端 adapter 很容易分别建立在不同“真相源”上；
- 未来 CI 很难判断“规范完整”还是“只是 token build 成功”。

### Required direction

V2 开工前先做 **Source Integrity Gate**：manifest 中每个 source 必须真实存在、schema 可解析、catalog 可定位；release gate 不允许手工写 `true` 而没有校验结果。

---

## P0-02 — 实际 build truth 与 canonical manifest 不是同一模型

### Observation

当前工程 pipeline 明确从：

```text
design-source/colors_and_type.css
```

构建 normalized token model；`validate.mjs` 也只验证该 CSS 解析后的 token model。

但 canonical manifest 描述的是一个不存在的 `tokens/*.json + schemas/*.json + specs/*.json` source graph。

### Risk

这相当于同时存在两套架构描述：

- “实际能 build 的 CSS parser architecture”；
- “manifest 声称存在的 structured source architecture”。

四端开始接入后，这种分叉会比视觉 bug 更危险。

### Required direction

V2 必须明确一条真正 canonical 的机器链：

```text
Editable Design Source
→ Normalized Design Model
→ Platform-neutral Contract
→ Platform Adapters
```

是否继续让 CSS 做 editable token source 可以讨论，但 manifest 必须描述**真实**链路，而不是未来设想。

---

## P0-03 — Platform axis 目前只有 iOS / Android

### Observation

当前 manifest platform axis 只声明：

```text
ios / android
```

Token model 也只有默认 iOS touch target 与 `.platform-android` override；engineering adapter 的 platform output 同样只有 `ios` / `android`。

### Risk

Web 与微信小程序如果直接消费现有 contract，会被错误地当成“非 Android = iOS”。

更深的问题是：`platform` 不能继续同时承担 viewport、input modality、host chrome 与 touch target 四种职责。

### Required direction

V2 四端模型建议拆开：

```text
platform      = ios | android | web | wechat-mini-program
viewport      = compact | medium | wide   (最终命名待 responsive contract)
input         = touch | pointer | keyboard | hybrid
motion        = standard | reduced
color-scheme  = light | dark
content-scale = standard | enlarged / platform-driven
```

不要用 `platform=web` 推导“有 hover”，也不要用 `platform=mini-program` 推导“永远没有键盘”。

---

## P0-04 — 目前没有 Mini Program engineering adapter

### Observation

当前 build outputs 为：

- Tailwind
- NativeWind
- React Native tokens
- MCP / Penpot

`build-manifest` target 也没有微信小程序。

### Risk

Mini Program 很可能会在产品项目里手抄 Token / WXSS / safe-area / motion / component state，从第一天就产生第五套事实来源。

### Required direction

9 月四端开始前至少需要最小 Mini Program adapter：

- semantic token output；
- theme mode policy；
- density / touch contract；
- Safe Area / Platform Reserved Region interface；
- motion semantic mapping；
- Core Component recipe / state metadata（不要求自动生成完整组件）。

不要为了赶进度复制一份 `colors_and_type.wxss` 后人工维护。

---

## P0-05 — 当前 React Native output 仍泄漏 CSS-shaped value

### Observation

当前 `createReactNativeTokens()` 会直接输出：

- CSS `box-shadow` 字符串；
- CSS `cubic-bezier(...)` motion value；
- 从 CSS shorthand 解析出的 font-family fallback 字符串。

这些并不是天然可直接执行的 React Native / Native platform contract。

### Risk

Token “生成成功”不等于“平台语义已适配”。四端若继续沿这个方向，会把 Web 实现细节伪装成跨端 Token。

### Required direction

建立 platform-neutral semantic model，例如：

```text
elevation.floating = { level / intent }
motion.easing.enter = semantic curve intent
typography.body = { role, size, lineHeight, weight }
```

然后由 Web / RN / Native / Mini Program adapter 生成各自合法的 representation。

**统一的是语义，不是 CSS 字符串。**

---

## P0-06 — Validator 只验 Token，不验 33 个 Component Contract / Preview

### Observation

当前 `npm run validate` 只执行 `buildTokenModel()` + `validateTokenModel()`。

现有 schemas 只有 Composite / Pattern；缺少当前 manifest 已引用的 Component Contract schema。

CI 也主要验证 unit test + build artifact，没有 component contract schema validation、preview DOM/CSS validation 或 visual regression。

最近已人工发现：

- Switch disabled state visual mismatch；
- Alert Banner 与 Inline Alert 无明显结构区别；
- Timeline connector 实现断裂。

### Risk

这说明当前 build green 不能证明 Design System component quality green。

### Required direction

四端前至少补四层 gate：

```text
Token validation
→ Contract schema validation
→ Contract ↔ Preview parity validation
→ Visual / interaction smoke regression
```

不要求一开始就做重型视觉测试平台，但核心状态矩阵必须可自动发现缺 variant / 缺 preview / stale preview。

---

## P0-07 — AI / downstream consumption entrypoints 已发生漂移

### Observation

`library-consumption.json` 的 `coreComponents` 当前只列出 6 个组件，但 README / components/index / manifest 明确是 33 Core Components。

Root README 仍写 Tailwind / NativeWind / RN token target “尚未实现”，而 `package.json`、BUILD_PIPELINE 与 tooling 已经实现这些 target。

`SKILL.md` 仍以 “Com Design Mobile” 和 DOM/CSS preview 为主要生产代码入口指导。

### Risk

对 AI coding / Penpot / downstream consumer 来说，这会产生非常实际的错误：

- 少读组件；
- 误判 build 能力；
- 在非 Web 平台复制 DOM/CSS 结构；
- 把旧文档当比代码更新的事实。

### Required direction

增加 `source-integrity` / `docs-consistency` gate：

- component count / index 单源生成；
- README current-state 不允许与 build manifest 冲突；
- Skill 按 Platform Adapter 分支指导，不让 iOS / Android / Mini Program 直接复制 Preview DOM。

---

# P1 — 9 月第一阶段应完成，否则四端体验会迅速分叉

## P1-01 — Responsive Foundation 还只是规划，不是正式 Contract

当前 Mobile foundation 已有 density / touch，但 Web 需要：

- Container / content width；
- breakpoint / responsive policy；
- Grid behavior；
- App Shell / Side Navigation relation；
- narrow ↔ wide component adaptation。

V2 已开始规划 Stack / Center / Grid / Side Navigation，但如果 9 月 Web 端是 Desktop / tablet 级界面，这部分应提前成为正式最小 contract，而不是等组件做完再补。

---

## P1-02 — Input modality state model 不完整

例如 Button Contract 当前 state 主要是：

```text
default / pressed / disabled
```

而 Preview CSS 已出现 `:hover` 与 `:focus-visible`。

这说明 **Contract 与 Web 实现已经存在 state vocabulary drift**。

V2 不应简单给所有组件新增 `hover` 枚举，而应该建立 Input Modality / Interaction State contract：

- touch: pressed / disabled；
- pointer: hover / pressed / disabled；
- keyboard: focus-visible / activation；
- hybrid: 状态优先级与组合规则。

---

## P1-03 — Typography 需要 Content Scale / Dynamic Type contract

当前 typography 使用固定 `px` size / line-height，BUILD_PIPELINE 虽然把 accessibility font scaling 写成 platform adapter exception，但没有正式设计契约。

四端至少要明确：

- 哪些语义字号允许系统放大；
- layout 在 enlarged text 下如何 reflow；
- 不允许固定高度截断正文 / label；
- iOS / Android / Web / Mini Program 各自由 Adapter 接系统字号机制。

重点不是四端字体数值完全一致，而是**内容层级与放大后的可用性一致**。

---

## P1-04 — Safe Area / Host Chrome / Back behavior 需要统一 Platform Adapter contract

V2 已规划：

- Safe Area；
- Top App Bar；
- WeChat capsule reserved region；
- system-owned page navigation；
- iOS / Android back gesture。

但当前 source / build 还没有正式承载这些 geometry / behavior contracts。

建议把它们统一进 `Platform Adapter`，避免每个组件自行感知微信胶囊、Home Indicator、Android gesture inset 等。

---

## P1-05 — Motion Foundation 方向正确，但现有 implementation 不能直接当四端基线

当前 CSS 中已有 duration / easing / keyframes，但：

- Web-shaped easing / keyframes 不能直接等价为 Native motion；
- engineering web theme output 当前并未系统暴露 motion token；
- reduced-motion CSS 需要做真实 CSS syntax / browser validation；
- component transition 里仍存在 `.15s` 这样的局部 literal。

V2 Motion Foundation 应成为 semantic contract，再映射各端；正式值应通过真机 / 小程序验证，不宜现在直接冻结。

---

## P1-06 — Interactive control state 应做全量状态矩阵审查

Switch 只是已经暴露出来的一例。

建议对所有 interactive components 做矩阵：

```text
default
hover (when applicable)
focus-visible (when applicable)
pressed
selected / checked / open
loading (when applicable)
disabled
error / invalid (when applicable)
```

检查：

- state 是否在 Contract 中存在；
- Preview 是否存在；
- disabled 是否仍保留原 value / selection；
- critical state 是否非 color-only；
- 四端 adapter 是否有等价语义。

---

## P1-07 — Preview / Human Guide 需要从 iPhone specimen 升级为 Platform Context Preview

当前大量 Human Guide Preview 使用 iPhone shell。这对于 Mobile V1 很直观，但四端后容易让人误解为：

- Android 只是 iPhone 换壳；
- 小程序状态栏 / 胶囊属于 Core UI；
- Web 也应该沿用移动端密度和 overlay presentation。

V2 建议一份 component contract，多种 context specimen：

```text
iOS
Android
WeChat Mini Program
Web / Desktop
```

只在平台有真实差异时展示不同 presentation，不复制四套规范正文。

---

# P2 — Coverage risk：按真实产品证据决定是否进入 V2

当前 Core 是成熟 Mobile baseline，不需要为了“组件数量齐全”盲目增加组件。但四端真实项目开始后，应尽早观察这些高概率缺口：

- Data Table / dense data view（Web/Desktop）；
- Pagination（需要稳定页边界的管理类集合）；
- Popover / Tooltip（pointer / keyboard environments）；
- Drawer（mobile / responsive navigation）；
- Breadcrumb / hierarchical location（Desktop deep IA）；
- Date / Time selection；
- File / Upload / Attachment；
- Combobox / searchable select（大数据选择）。

这些全部是 **evidence-driven candidate**，不是现在直接加进 Core 的 KPI。

---

# September readiness recommendation

## 如果目标是“9 月开始用”

建议先把四端最低公共底座做成：

```text
1. Source Integrity
2. Platform / Input / Responsive Foundation
3. Token Adapter：Web + Mobile + Mini Program
4. Component Contract Schema + state matrix
5. Platform Adapter：Safe Area / Navigation / Overlay / Motion
6. Preview QA gate
```

然后产品可以边使用边补 Components / Composite。

## 不建议的路线

```text
先把 40～50 个组件全部画出来
→ 再分别适配四个平台
```

这会把当前小的 contract 不一致放大四次。

## Pressure judgment

- 作为“统一设计契约 + adapter foundation”在 9 月启用：**中高压力，但可控**；
- Android / iOS 若共享成熟 mobile engineering consumer，压力会下降一档；
- 如果 Android / iOS 各自需要独立 Native component library，再加 Web component package 与 Mini Program component package，并要求 9 月内 production-stable：**高压力，不宜同时追求全量组件与稳定版**。

最重要的里程碑不是“新增多少组件”，而是：

> 同一个 semantic intent 在四端能被可靠解析，同时允许平台使用自己的自然表现。
