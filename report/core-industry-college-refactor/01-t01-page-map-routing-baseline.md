# T01 — 页面总图、动线与工程基线

> Branch: `core-industry-college-refactor`  
> Gate: 提交后停在 R01，不进入 T02。  
> 功能真相源：Mockplus 离线包；结构约束：`00-master-outline.md` / 正式评审稿；呈现约束：Com Design。

## 0. 结论

- 直接解析旧 Mockplus `data/project.js` 与 `data/pages/*.js`，确认 **140 个页面/状态**、**604 条 page action**、**74 条 component action**。
- 发现 **12 个悬空 target ID**；报名链与创赛工坊还存在明确跨业务错链。
- 140/140 旧页都已建立新去向：**保留 40 / 合并 83 / 拆分 5 / 归档 12**。完整映射见 `01-t01-old-new-map.tsv`。
- 新工程按 **语义路由 + 业务对象 + 状态模型 + 通用 Task Runtime** 组织，不复制 140–150 张页面。
- 公共平台与赛事上下文在路由和状态模型上分层；赛事结束后长期资产仍在公共账号层。
- 候选一级入口暂设 `首页 / 赛事 / 机会 / 我的`，只是工程默认值，不是产品拍板；“学院是否占一级导航”等仍进入 R01 待决策。

## 1. 旧原型盘点与风险证据

盘点来源：

```text
data/project.js          -> 页面节点、层级、画板信息
data/pages/*.js          -> 页面组件、文本、表单、interaction
interaction.page.target  -> 页面跳转关系
interaction.component    -> 组件状态动作
```

关键证据：

1. `报名答题 -> 可领取成就`：报名链串到课程成就。
2. 创赛工坊 S1/S3/S4/S5/S6 多处跳到 S2 或 S5 的确认/进度/成果，属于复制后串线。
3. `赛事资料 / 下载保存 -> 成绩详情‘` 存在跨域错链。
4. “任务专区”为空页；企业任务、福利日常/核心任务又是不同任务概念。
5. 12 个悬空 target：`P0OqBOdbkQ4`、`iLRGFnB9yiD`、`zP16-vku_`、`CftJZpuEN`、`O-gkpsD6cLG`、`DLkx-qBDFq0`、`tdPzSF2I7Jl`、`OqsQ8FTHpp3`、`ERLO-JhLCS9`、`L83StxIhT`、`3M2ahnmIf`、`VDSzBucKSmR`。

旧页逐页去向、保留/合并/拆分/归档以及所有归档理由见 `01-t01-old-new-map.tsv`。旧原型原始 interaction 仍是后续实现的功能核对依据；**不得直接继承旧跳转关系**。

## 2. 新页面树

```text
ROOT
├─ Auth / Onboarding
│  ├─ /auth/login
│  └─ /onboarding/{profile,survey,ready}
├─ Public Platform
│  ├─ /home
│  ├─ Competitions
│  │  ├─ /competitions
│  │  ├─ /competitions/mine
│  │  ├─ /competitions/:competitionId
│  │  └─ /competitions/:competitionId/registration
│  ├─ Opportunities / Applications
│  │  ├─ /opportunities
│  │  ├─ /opportunities/:opportunityId
│  │  └─ /applications
│  ├─ Companies / Content
│  │  ├─ /companies[/ :companyId]
│  │  └─ /news[/ :contentId]
│  ├─ Courses
│  │  └─ /courses[/ :courseId] -> learn / assessment / achievement
│  ├─ Benefits / Growth
│  │  ├─ /benefits[/ :benefitId]
│  │  ├─ /benefits/wallet
│  │  └─ /growth/score
│  ├─ Long-term Assets
│  │  ├─ /assets
│  │  ├─ /assets/experiences[/ :experienceId]
│  │  ├─ /assets/learning
│  │  ├─ /assets/results[/ :resultId]
│  │  ├─ /assets/certificates[/ :certificateId]
│  │  └─ /assets/verification
│  ├─ Stories
│  │  └─ /stories[/ :storyId] + /stories/submit
│  └─ Support
│     └─ /support + /support/chat
├─ Competition Context (identity/lifecycle gated)
│  └─ /competitions/:competitionId/workspace
│     ├─ /team
│     ├─ /resources[/ :resourceId]
│     └─ /workshop
│        ├─ /project
│        ├─ /compute
│        ├─ /skills[/ :skillId]
│        ├─ /tasks/:taskId/{answer,review,progress}
│        └─ /results[/ :resultId]
├─ My / Account
│  ├─ /me
│  ├─ /me/profile
│  ├─ /me/resume -> strengths / education
│  ├─ /me/accounts
│  ├─ /me/subjects                  # 语义待 D08
│  └─ /me/notifications[/ :notificationId]
├─ Legal / About
│  └─ /legal/user-agreement + /legal/privacy + /about
└─ Frozen
   └─ /tasks                        # D03 未决，不实现业务 UI
```

`[/ :id]` 仅表达列表 + 对象详情的树关系；精确 path 以 `src/routes/registry.ts` 为准。当前 registry 共 **66 条唯一语义路由**。

### 公共平台与赛事上下文边界

```text
PUBLIC / ACCOUNT
/competitions/:competitionId          公开赛事详情，无赛事身份也可访问
/opportunities/* /companies/*         就业/企业
/courses/* /benefits/* /assets/*      支撑与长期资产

COMPETITION CONTEXT
/competitions/:competitionId/workspace/*
  team / resources / workshop
```

只有 `workspace/*` 自动携带赛事上下文。公开赛事详情不因为“已报名/已结束”复制新页面，而由状态驱动。赛事结束后 workspace 可进入 `ended/permissionRevoked`，但 `/assets/*` 长期可访问。

## 3. 五条母动线 Flow Map

### A. 新用户公共平台

| 节点 | 主动作 -> 下一步 | 返回路径 | 异常状态 |
|---|---|---|---|
| `/auth/login` | 登录 -> onboarding 或 `/home` | 关闭留在登录入口 | 登录失败、资料未完善 |
| `/home` | 发现赛事/机会 -> `/competitions` 或 `/opportunities` | 一级入口 | 无数据、未登录、加载失败 |
| 赛事/机会详情 | 报名/投递/看企业 -> 对应链路 | 回原列表并保留筛选/滚动 | 下线、无资格 |
| 支撑模块 | 学习/领取/关注/看资产 -> 详情/结果 | 回来源模块或首页 | 空、过期、权限不足 |

### B. 三创赛参赛

| 节点 | 主动作 -> 下一步 | 返回路径 | 异常状态 |
|---|---|---|---|
| `/competitions` | 查看赛事 -> `/:competitionId` | 赛事一级入口 | 筛选无结果 |
| 赛事详情 | 报名 -> `/registration` | 回列表保留上下文 | 未登录、未开始、关闭 |
| `/registration` | 跳入响应式报名 -> external | 取消/失败回同一赛事详情 | 跳转失败、用户取消 |
| 报名回流 | 看审核状态 -> approved 进入 workspace | pending/rejected 可回赛事详情 | submitted/pending/rejected/failed |
| workspace | 进入赛事能力 -> team/resources/workshop | 回 `/competitions/mine` 或赛事详情 | 无身份、权限回收 |

### C. 赛事陪跑

| 节点 | 主动作 -> 下一步 | 返回路径 | 异常状态 |
|---|---|---|---|
| `/competitions/mine` | 进入当前赛事 -> workspace | 回赛事一级入口 | 无进行中赛事 |
| workspace | 看当前项目/下一步 -> workshop | 回我的赛事，不跨赛事 | 审核中、已结束 |
| workshop | 执行下一步 -> task answer | 回当前 workspace | 无权限、任务锁定 |
| answer | 确认输入 -> review | 回 workshop，保留填写 | 资料不足、校验失败 |
| review | 确认生成 -> progress | 修改回同 task answer | 算力不足、取消、失败 |
| progress | 看运行状态 -> result | 只回当前 task/workshop | queued/running/failed |
| result | 采纳/编辑/下一步 -> workshop/next task | 回成果列表/workshop | 结果不可用、赛事结束 |
| ended | 看成绩/证书 -> `/assets/*` | 回我的赛事 | 权限回收但资产可用 |

### D. 就业 / 实习

| 节点 | 主动作 -> 下一步 | 返回路径 | 异常状态 |
|---|---|---|---|
| `/home` 或 `/opportunities` | 看机会 -> opportunity detail | 一级机会入口/首页 | 无结果 |
| opportunity detail | 看企业/投递 -> company 或投递准备 | 回列表保留筛选/滚动 | 岗位关闭、已投递 |
| company detail | 看企业资源关系 -> 回机会或关联资源 | 优先回原机会 | 主体数据缺失 |
| `/me/resume` | 确认长期简历 -> 返回原机会 | `returnTo=opportunity` | 简历空/不完整 |
| 投递 | 提交 -> `/applications` | 失败回当前机会 | 提交失败、重复投递 |
| `/applications` | 看状态 -> 机会详情/继续找机会 | 回 `/me` 或来源 | 状态源未回流 |

### E. 赛后长期资产

| 节点 | 主动作 -> 下一步 | 返回路径 | 异常状态 |
|---|---|---|---|
| workspace `ended` | 看结果 -> `/assets` | 回我的赛事 | 赛事权限回收 |
| `/assets` | 看经历/成绩/证书/学习成果 -> 子资产 | 回 `/me` 或赛事结束态 | 部分资产未同步 |
| 结果/证书 | 看详情/验真 -> detail/verification | 回对应资产列表 | 失效、撤销、待发放 |
| `/me/resume` | 学生确认可信经历表达 -> 保存 | 回资产或我的 | 未确认、保存失败 |

### 全局返回约束

- 列表 -> 详情：恢复 filter/search/scroll。
- 外部报名必须保存 `returnTo + competitionId`；成功回正确赛事，不落首页。
- workspace 深层页只回当前赛事上下文，不跨赛事。
- workshop 固定 `answer -> review -> progress -> result`，不允许 S1–S6 互相硬跳。
- 简历前置检查保存 opportunity `returnTo`，编辑后继续原投递。
- 赛事结束时关闭赛事期动作，但必须提供长期资产出口。

## 4. React + Tailwind 工程基线

```text
prototype/core-industry-college/
├─ src/
│  ├─ app/          # App / route probe
│  ├─ routes/       # 单一 route registry
│  ├─ state/        # domain state types
│  ├─ mock/         # scenario fixtures / mock data
│  ├─ features/     # T02+ 按业务对象增量实现
│  ├─ components/   # 产品组合组件，不复制 Core
│  └─ dev/          # Route Lab
├─ package.json
└─ README.md
```

T01 所有业务路由暂复用 `RouteProbe`，只验证路由/context/state，不铺业务 UI。

### 状态分层

T01 **已经实际落码**的共享 state contract：

```text
SessionState
  loggedIn / profileComplete

CompetitionAccountState
  identities: CompetitionIdentityState[]

CompetitionIdentityState
  competitionId
  competitionStatus
  identityStatus
  registrationStatus

CompetitionContextState
  currentCompetitionId
  teamId?
  permissions[]

Workshop seed state
  currentTaskId? / taskRun

Application seed state
  currentOpportunityId? / status

ViewState
  ready / loading / empty / error / permission / disabled / expired / success
```

关键边界：

- `CompetitionAccountState.identities[]` 表示**长期账号关联的全部赛事身份集合**；`/competitions/mine` 从这里读取，不依赖当前 workspace。
- `CompetitionContextState.currentCompetitionId` 只表示**此刻进入的赛事 workspace**，不会覆盖或代表账号的全部赛事身份。
- 同一账号可以同时存在多个不同生命周期的赛事身份，例如：三创赛 `inProgress/active`、另一赛事 `registrationOpen/pending`、历史赛事 `ended/revoked`。
- 公开赛事目录/详情中的赛事对象及其状态属于赛事 mock/domain data，不要求用户先拥有赛事身份。

以下是 **T02–T04 的规划状态域，不是 T01 已实现代码 contract**；后续并行线程应在上述共享边界上增量定义，禁止各自重新发明账号/赛事上下文模型：

```text
Workshop domain         currentProject / nextTask / taskRuns / results / compute
Opportunity domain      opportunities / applicationRecords
Learning domain         enrollment / progress / assessment / achievement
Benefit domain          eligibility / claim / redeem / expiry
Asset domain            experiences / results / certificates / learningAchievements
```

原则：**状态决定页面，不用复制页面表达状态；赛事身份集合与当前赛事上下文必须分离。**

Mock scenario 基线：`guest`、`newUser`、`registrationPending`、`competitionActive`、`workshopTaskRunning`、`competitionEnded`、`multiCompetitionAccount`、`applicationSubmitted`、`errorNetwork`、`emptyData`、`permissionDenied`。

其中 `multiCompetitionAccount` 明确同时包含 3 个赛事身份：一个进行中、一个待审核、一个历史已结束；`currentCompetitionId` 仅指向其中当前打开的赛事，以验证 `/competitions/mine` 与 workspace context 不冲突。

### Com Design 复用

直接复用：`Bottom Navigation`、`Top App Bar`、`Tabs`、`Segmented Control`、`Search Field/Search Pattern`、`List Item`、`Section`、`Card`、`Tag/Badge`、`Button/Icon Button`、表单控件、`Dialog/Bottom Sheet`、`Alert`、`Empty State`、`Loading/Skeleton`、`Progress Indicator`、`Stepper/Timeline`。

只在产品层新增 Pattern，不改 Core：

- `CompetitionContextHeader / CompetitionGate`
- `ExternalRegistrationHandoff`
- `CompetitionStatusSummary`
- `OpportunityApplicationFlow`
- `CompanyResourceRelations`
- `WorkshopNextAction`
- `WorkshopTaskRuntime`
- `LongTermAssetEvidence`

## 5. 待决策项

| ID | 待确认 |
|---|---|
| D01 | 一级导航最终结构/标签；“机会”是否独立一级，“学院”是否继续一级。 |
| D02 | 报名中角色选择、团队信息、成员管理、承诺书哪些仍需 App 原生。 |
| D03 | 平台任务 / 赛事任务 / 企业任务 / 运营活动任务的业务对象与关系。 |
| D04 | 无赛事身份时创赛工坊隐藏、锁定展示还是转化入口。 |
| D05 | 学校/省份/赛道精确赛事节点是否有稳定数据源。 |
| D06 | “教育部认证/法律效力”等可信认证文案的正式授权范围。 |
| D07 | 注册、报名、问卷、工坊是否已有统一学生主数据。 |
| D08 | 旧“主体管理”具体业务含义及与赛事身份/可信身份关系。 |
| D09 | 旧“我的卡包”实际对象及与权益系统关系。 |
| D10 | S6 职业规划继续属于三创赛工坊，还是未来公共就业能力；T01 不迁移。 |
| D11 | 投递状态能否从企业/运营侧回流更细状态；当前只保证 submitted/statusUnknown。 |

## 6. R01 自检与验证

- [x] 140/140 旧页全部有去向；所有归档项有理由。
- [x] 页面树、公共/赛事边界、66 条语义路由已落工程。
- [x] 5 条母动线都有入口、主动作、下一步、返回、异常。
- [x] 工坊 S1–S6 收敛到通用 Task Runtime。
- [x] 未定义任务专区冻结，不用 UI 猜产品。
- [x] Core 复用与 Product Pattern 缺口明确，不修改 Core。
- [x] 多赛事身份集合与 current competition context 已在 state model 中分离。
- [x] `multiCompetitionAccount` 同时覆盖进行中 / 待审核 / 历史结束赛事身份。
- [x] 报告已区分 T01 实际落码 contract 与 T02–T04 规划状态域。
- [x] `routes/state/mock` 无 React 依赖部分已通过 TypeScript 编译检查。
- [ ] 当前执行环境无法连接 npm registry，因此不能在此环境完成依赖安装后的 Vite build；工程已提供标准 `npm install && npm run build` 配置，R01/有网环境需补一次真实安装构建验收。

**T01 修正到此停止；等待 R01 复核。**
