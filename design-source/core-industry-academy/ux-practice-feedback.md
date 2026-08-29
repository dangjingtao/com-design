# 核心产业学院 UX 实践回流观察

> Status: Field Note / Non-normative  
> Purpose: 记录真实业务原型对 Com Design 的验证、压力与候选回流方向；本文不直接修改 Core 规范。  
> Evidence baseline: `dangjingtao/core-industry-college-prototype@dev` `248bbd3372f12a5112acb24d69762a45bf0637c4`  
> Com Design baseline: `dangjingtao/com-design@dev` `6871847c579962926d9d978deddb789a065906d8`  
> Date: 2026-08-29

---

## 1. 为什么现在开始回流

核心产业学院最初是 Com Design 的 consumer / 业务验证项目，后来已经形成独立产品生命周期。当前移动端不再只是若干页面样例，而是有：

- 长期账号与多赛事身份；
- 公共平台与赛事空间；
- 报名、审核、赛事身份授予；
- 赛事工作区与 Task Runtime；
- 机会、企业、长期简历、投递；
- 赛事结束后的长期资产回流；
- 可信凭证、验真与外部 handoff；
- 可触发的 loading / empty / error / permission 等状态；
- Playwright 母动线和专项回归。

因此它已经具备作为 Com Design 第一批 field validation 证据的条件。

这里的“回流”不是把产业学院业务组件复制回 Core，而是回答三个问题：

1. Com Design 现有基础是否真的支撑复杂业务？
2. 哪些重复出现的交互结构已经超出单个组件，值得进入 Pattern / Guideline 层？
3. 哪些实现仍然只是产品特例，不应污染 Core？

---

## 2. 已被项目实践验证的基础方向

### 2.1 生命周期优先于页面目录

核心学院重构中最稳定的产品结构不是“页面分组”，而是业务时间轴：

```text
公共平台
→ 发现赛事 / 机会
→ 报名 / 审核
→ 获得赛事身份
→ 赛事工作区
→ 任务 / 结果
→ 赛事结束
→ 经历 / 成绩 / 证书进入长期账号
```

项目总纲明确要求“比赛会结束，账号和人的长期资产不会结束”。页面和功能必须放进时间关系里，而不是平铺成工具入口。

**对 Com Design 的启示：**

Com Design 的 Pattern 层需要能够描述“状态随时间变化，并改变可执行动作”的页面组合，而不仅是静态组件排列。

证据：

- `core-industry-college-prototype/docs/product/00-product-master-context.md`
- `core-industry-college-prototype/apps/mobile/src/features/competition-workspace/WorkspacePages.tsx`
- `core-industry-college-prototype/apps/mobile/tests/mother-flows.spec.ts`

---

### 2.2 长期主体与局部上下文必须分离

核心学院把以下概念拆开：

- 长期账号；
- 多个赛事身份；
- 当前赛事上下文；
- 赛事 Runtime；
- 长期资产。

深层页面保留 `competitionId`，当前赛事只代表“此刻正在操作哪个上下文”，不代表账号只能拥有一个赛事身份。

这种分离直接改善了 UX：用户从赛事 A 深页返回、切赛事、赛后进入长期资产时，不会因为“当前状态”被错误理解为“永久身份”而串线。

**对 Com Design 的启示：**

上下文连续性不只是路由工程问题，应进入 UX guideline：

> Context-scoped interaction MUST preserve the active entity identity until the user明确离开该上下文。

它可以适用于订单、项目、课程、审批、工单、赛事等所有有局部生命周期的产品。

---

### 2.3 状态不是标签，而是“状态 → 解释 → 可执行动作”

赛事详情与报名流程已经形成稳定结构：

```text
当前状态
→ 为什么是这个状态
→ 现在允许做什么
→ 执行动作后去哪里
```

例如同一赛事详情页，会根据：

- 是否登录；
- 报名窗口；
- 赛事 lifecycle；
- identityStatus；
- registrationStatus；
- eligibility；

决定主动作是：

- 登录后报名；
- 进入报名；
- 查看报名 / 审核状态；
- 进入赛事工作区；
- 查看赛后出口；
- 暂不可报名。

这比单独给一个 Success / Warning Tag 更接近真实 UX。

**候选回流：`State-to-Action Pattern`**

建议后续评估是否成为 Core Pattern。最小结构：

1. primary state；
2. optional reason / evidence；
3. primary available action；
4. optional recovery / secondary action；
5. terminal / blocked 状态说明。

注意：业务状态枚举仍属于 Product，不进入 Core。

证据：

- `apps/mobile/src/features/competition-workspace/WorkspacePages.tsx`
- `apps/mobile/src/features/auth/AuthPages.tsx`
- `apps/mobile/src/features/trust/TrustPages.tsx`

---

### 2.4 登录和外部流程不能打断用户原意

核心学院多条母动线都在实践 intent continuity：

```text
用户在机会 / 报名 / 企业等业务上下文发起动作
→ 需要登录或跳外部系统
→ 携带 returnTo / context
→ 完成验证或 handoff
→ 回到原业务上下文继续动作
```

登录页对 `returnTo` 做安全处理；赛事报名 handoff 还携带 `competitionId`、source、accountContext，并在回流时把 pending / rejected / approved 映射回同一赛事身份。

这已经不是单个 Auth 组件的能力，而是跨页面体验契约。

**候选回流：`Intent Return / Handoff Pattern`**

建议 Pattern 至少约束：

- 保存用户原始任务目的地；
- 只允许安全的内部 return target；
- 外部 handoff 携带最小必要上下文；
- 回流状态必须映射到已有业务主体，不重复创建第二份状态；
- 回流完成后清理一次性 callback 参数；
- 失败 / 拒绝 / 冲突必须有可恢复出口。

证据：

- `apps/mobile/src/features/auth/AuthPages.tsx`
- `apps/mobile/tests/mother-flows.spec.ts`
- `apps/mobile/tests/registration-handoff-cross-app.spec.ts`

---

### 2.5 筛选实践已经超出 Search Field 组件

`MobileFilter` 已形成一套完整的移动端集合筛选体验：

- 搜索关键词先作为 pending input；
- Enter / 打开筛选时提交关键词；
- 已提交关键词成为可删除 chip；
- 筛选按钮显示激活条件数量；
- Bottom Sheet 内使用 draft 状态；
- 重置 / 确定后才提交；
- 已激活分组选项回显为可删除 chip；
- 结果数量通过 `aria-live` 回报；
- 详情返回后筛选状态仍保持。

这证明 Com Design 当前 `searchPattern` 还不足以覆盖真实移动列表筛选。

**候选回流：扩展 `Search Pattern` 或新增 `Collection Filter Pattern`。**

建议先作为候选 Pattern，不急于增加 Core Component。

证据：

- `apps/mobile/src/components/MobileFilter.tsx`
- `apps/mobile/src/components/README.md`
- `apps/mobile/tests/mother-flows.spec.ts` 中 `competition list filter survives detail-return navigation`

---

### 2.6 聚合页应派生状态，不复制状态

任务中心同时聚合赛事、学习、权益、机会，但它没有建立第四套“任务状态数据库”；任务状态从既有 competition runtime、learning store、benefit status 等来源派生。

Playwright 也直接验证“task center derives status from existing competition, learning and benefit stores”。

**对 Com Design 的启示：**

这更接近信息架构 / UX 数据原则，而不是视觉规则：

> Aggregation surfaces SHOULD derive presentation state from authoritative domain state instead of duplicating lifecycle truth.

它值得进入 Pattern / product composition guidance，尤其适用于首页、任务中心、工作台、消息聚合、待办中心。

证据：

- `apps/mobile/src/features/task-center/TaskCenterPage.tsx`
- `apps/mobile/tests/mother-flows.spec.ts`

---

### 2.7 “关键状态可验证”本身是一条设计实践

核心学院项目规则要求关键页面尽量可触发：

```text
ready
loading
empty
error
permission
```

并允许通过 `?view=` / Prototype Runtime / scenario tools 切换。

这带来一个很实际的收益：设计评审不再只评 happy path。Empty State、Error、Permission、Ended、Rejected 等都可以作为真实页面状态被浏览器烟测。

**候选回流：`State Coverage Guideline`**

Com Design 已有 Loading Indicator、Skeleton、Empty State、Alert 等组件，但仍需要一条更高层规则：

- 组件存在不等于页面状态完整；
- 关键 Pattern / 页面应声明适用状态矩阵；
- Prototype / reference implementation 应能展示关键非 happy path；
- 自动化测试至少覆盖影响主任务的状态。

证据：

- `core-industry-college-prototype/AGENTS.md`
- `apps/mobile/src/components/ui.tsx`
- `apps/mobile/tests/`

---

### 2.8 Route coverage 不等于 Feature coverage

Legacy Mockplus audit 得出的最重要经验之一：

> “140/140 页面有去向”不等于“旧原型功能 100% 没缩水”。

旧页面合并成新结构后，仍发现 onboarding 字段、工商信息、可信验真、学力值经济等功能或业务语义发生缩水 / 替换。

因此项目把验证从 route audit 提升到 feature-level audit。

**对 Com Design 的启示：**

设计系统迁移 / 重构的验收不能只检查：

- 组件数量；
- 页面数量；
- route 对齐；
- build PASS；

还需要检查：

- 用户任务是否仍成立；
- 状态是否仍完整；
- 字段 / 二级动作是否有去向；
- 业务语义是否被视觉重构偷偷替换。

这更适合作为 `Migration / Adoption Guideline`，而不是 Core Component 规则。

证据：

- `docs/product/01-legacy-mockplus-audit.md`
- `docs/migrations/mobile-from-com-design.md`

---

## 3. 对现有 Com Design Foundation 的验证

核心学院当前实现仍大量消费 Com Design semantic token：

- text / surface / border / status；
- 4px-oriented spacing；
- control / container / overlay radius；
- compact visual control + mobile touch target；
- flat-first surface hierarchy；
- Section before Card；
- Brand / status semantic roles。

在已经形成大量复杂状态和母动线后，这套 foundation 没有出现必须整体推翻的证据。

因此当前不建议因为核心学院实践就大规模改：

- Primitive palette；
- Typography scale；
- Spacing scale；
- Radius hierarchy；
- 基础 touch target 方向。

本轮真正出现压力的是 **Component 之上的 Pattern / Composition / Adoption 层**。

证据：

- `apps/mobile/src/design-tokens.css`
- `apps/mobile/src/components/ui.tsx`
- `com-design/design.md`

---

## 4. 候选回流清单

以下仅为候选，不代表已经进入 Core。

| 候选 | 建议层级 | 当前证据 | 当前判断 |
| --- | --- | --- | --- |
| State-to-Action | Core Pattern candidate | 赛事 / 报名 / Auth / Trust | 强 |
| Intent Return / Handoff | Core Pattern candidate | 登录 returnTo / 报名跨端回流 / 简历回机会 | 强 |
| Collection Filter | Core Pattern candidate | MobileFilter + 返回保持 | 强 |
| Access / Eligibility Gate | Core Pattern candidate | 登录、资格、身份、赛事结束、权限 | 中强；需与 State-to-Action 去重 |
| State Coverage Matrix | Guideline / Pattern contract requirement | Prototype Runtime + tests | 强 |
| Aggregation derives state | Composition guideline | Task Center | 中强 |
| Long-lived asset handoff | Product/IA guideline | 赛后经历 / 成绩 / 证书 | 中；需要第二个项目验证通用性 |
| Feature-level migration audit | Adoption / migration guideline | Mockplus audit | 强 |

---

## 5. 暂不应倒灌进 Core 的内容

以下能力目前仍然具有明显领域语义，应继续留在 Product Extension：

- Competition Card；
- Workspace Next Step 的赛事文案与业务状态；
- Competition Identity 枚举；
- Task Runtime 的 S1–S6 业务配置；
- 徽章、签到、学力值经济；
- 企业工商字段；
- 证书 / 成绩可信验真的具体业务字段；
- Carousel 的赛事 / 活动内容规格；
- 赛事权益资格枚举；
- “创赛工坊”本身。

可以抽它们背后的交互结构，但不要把业务名词包装成 Core Component。

---

## 6. Consumer 侧暴露出的一个问题

核心学院已经遵守“不要复制 Core”的边界，但产品代码仍存在自己组合 / 包装基础能力的情况，例如：

- `ui.tsx` 自己提供 Button / Card / Section / StatusTag 等轻封装；
- `StateBlock` 自己组合 loading / empty / error；
- `ConfirmDialog` 存在产品侧组合实现；
- 同时项目又直接消费 shared `Dialog`。

这不一定说明 Core Component 缺失，更可能说明：

> **“组件合同存在”与“consumer 能低成本正确组合”之间还有一层 reference composition / adapter 缺口。**

后续应单独检查：

1. Core 是否需要提供更明确的 reference composition；
2. Tailwind / React consumer 是否需要官方轻量 adapter；
3. 哪些产品 wrapper 只是语法便利，不应进入 Core；
4. 哪些重复组合说明 Pattern 文档不足。

本 field note 暂不修改组件数量。

---

## 7. Com Design source integrity follow-up

当前 `design-source/specs/design-system-v1.json` 声明：

```json
"corePatterns": "./core-patterns.json"
```

并声明当前 Core Patterns 为：

```text
statusComposition
searchPattern
```

但在本次 `dev` 基线检查中，`design-source/specs/` 未找到 `core-patterns.json`。

这属于 source-of-truth integrity 问题，应在正式扩展 Pattern 层之前单独修复或确认真实 canonical path。

**本文只记录，不在本次 field note 中静默修复。**

---

## 8. 建议的下一轮验证方式

不要立刻把上面的候选全部升级为 Core。

建议按以下顺序：

1. 修复 / 确认 Core Pattern canonical source；
2. 为候选 Pattern 写最小 contract，而不是先写漂亮示例页；
3. 用核心学院现有页面做反向映射，确认 contract 没有丢失真实状态；
4. 再用至少一个非赛事场景验证通用性；
5. 只有跨两个以上业务场景仍保持稳定语义，才进入 Core；
6. 业务专属变量继续留在 Product Extension。

候选 Pattern 的验收问题应始终是：

> 如果把“赛事”两个字删掉，这个交互结构是否仍然成立？

如果答案是否定的，它大概率还不属于 Core。

---

## 9. 当前结论

核心产业学院对 Com Design 的第一轮反哺，暂时没有提供“必须重做 Foundation”的证据。

它真正提供的是另一种更有价值的压力：

> **Com Design 已经能支撑复杂页面，但复杂业务开始要求它从 Component System 继续长成 UX Pattern System。**

本轮最值得继续推进的不是增加第 34、35 个组件，而是把已经在真实母动线中反复出现的：

- 状态与动作；
- 登录 / 权限 / 资格 Gate；
- returnTo / handoff；
- 集合筛选；
- 非 happy path 状态覆盖；
- 迁移后的 feature-level audit；

整理成可验证、可复用、业务无关的 Pattern / Guideline。
