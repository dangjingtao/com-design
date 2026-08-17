# R03 — T03 三创赛生命周期 / 创赛工坊评审

> Review role: 评审线程  
> Reviewed HEAD: `f2671e9cd08ebccbeb756c461024fa2f6131350a`  
> Gate result: **CHANGES REQUIRED（架构小修后通过）**

## 结论

T03 主体实现方向正确，现有 Workspace / Workshop / Task Runtime UI 不需要推翻：

- Workspace 已以“当前赛事 / 当前项目 / 当前下一步”为核心，而不是功能宫格。
- S1–S6 已数据驱动，共用 `answer -> review -> progress -> result` runtime，task / result / competitionId 绑定清楚。
- `none / pending / rejected / active / revoked`、`notStarted / inProgress / ended / permissionDenied` 与 task 状态已有真实可切换实现。
- ended / revoked 会关闭赛事期能力并提供 `/assets/experiences`、`/assets/results` handoff。
- T03 文件已按 workspace / workshop / task runtime / data / shared 拆分，没有退化成单个超大组件。

R03 暂不放行的原因有两个，均属于**状态真相源连续性**，不是视觉问题。

## Blocking — 必须修正

### R03-B1 T03 又建立了一套独立账号赛事身份状态，切断了 T02 已通过的 session / identities 母动线

当前 App 同时挂载：

```text
PublicPlatformProvider
  session / identities / applications ...

WorkshopRuntimeProvider
  identities / lifecycle / task runtime ...
```

其中 `WorkshopRuntimeProvider` 自己从 `scenarios.multiCompetitionAccount` 初始化并维护 `identities[]`，T03 的赛事详情、我的赛事、报名、workspace 都读取这套 identities，而不是 T02 已经通过 R02 的共享账号状态。

这会产生真实回归：

1. T02 游客 session 与 T03 不相认。游客进入 T03 接管后的 `/competitions/mine`、赛事详情、报名页时，T03 仍可能看到自己的预置赛事身份。
2. T02 报名回流写入的 `PublicPlatformProvider.identities[]` 不会自动进入 T03；反过来，T03 审核通过/拒绝也不会回写 T02 首页和公共平台账号状态。
3. `/competitions/mine` 在 T02 已经通过“长期账号身份全集”验收，但现在路由被 T03 页面接管后改读另一套身份集合。

这违反 T0 的共享状态纪律，也破坏母动线 B：

`公共赛事 -> 报名回流 -> 账号赛事身份 -> 我的赛事 -> 当前 workspace`

### 修正要求

- **账号级状态只能有一套真相源。** `session / CompetitionAccountState.identities[]` 必须由 T02/T03 共用。
- `WorkshopRuntimeProvider` 只保留赛事局部 runtime：lifecycle、materials、taskRuns、results、permission 等；不要再拥有第二套账号 identities。
- T03 的 `identityFor / setIdentityScenario` 改为读取/更新共享账号身份集合，或将账号状态提升成一个公共 provider 供 T02/T03 共用。
- T03 接管的 `/competitions/mine`、赛事详情、报名页必须继续遵守 shared session：游客只能浏览公共信息，报名/我的赛事/workspace 仍要求登录。
- 不要求修改 T01 `CompetitionAccountState / CompetitionContextState` 类型语义。

复核至少实证：

```text
游客首页 -> 赛事详情 -> 报名：仍要求登录
T02/T03 报名 pending -> /competitions/mine：看到同一个 pending 身份
审核 active -> 首页 / 我的赛事 / workspace：三处读取同一身份
切换无赛事身份 -> T03 页面不能凭自己的 seed 又冒出赛事身份
```

## Blocking — 必须修正

### R03-B2 赛事生命周期存在第二套可变真相源，赛事详情与 workspace 可互相矛盾

当前：

- 公共赛事详情主要读取 `public-platform/data.ts` 的 `competition.status`；
- workspace gate 读取 T03 runtime 的 `lifecycle`；
- `WorkspaceScenarioTools` 修改 `lifecycle` 时，不会同步公共赛事对象。

因此可以出现：

```text
赛事详情：报名中 / 可进入工作区
runtime lifecycle：ended
workspace：赛事已经结束 / 赛事期操作关闭
```

或者 `notStarted` / `inProgress` 与详情页标签、CTA 不一致。

### 修正要求

不要求强行把“报名窗口”与“赛事执行阶段”合成一个字段，但必须明确并统一消费规则：

- 如果二者是两个维度，就明确命名为例如 `registrationWindow` 与 `competitionLifecycle`，详情页与 workspace 都从同一 lifecycle source 判断赛事期能力；
- `ended` 必须在赛事详情、我的赛事、workspace、workshop 上得到一致行为；
- 状态工具切 lifecycle 后，不允许前一页仍表现成另一个赛事阶段。

不要通过复制一套 ended 页面解决，仍应保持状态驱动。

## 已通过项

### Workspace / 动线

- 当前赛事、项目、团队、下一步均有明确表达。
- pending / rejected / noIdentity / permissionDenied 会阻止赛事期能力。
- ended / revoked 有长期资产出口，不留死页。

### 创赛工坊

- 首页优先回答“我现在最该做什么”。
- 材料缺失会锁定任务并提供补材料路径。
- queued / running / failed / completed 可真实推进。
- S1–S6 使用数据配置，不复制六套页面。
- task/result 以明确 ID 绑定，旧原型 S1–S6 串线问题没有被继承。

### 工程边界

- 未修改 Com Design Core。
- 未进入 T04 长期资产内部实现。
- 真实 npm build / 浏览器 walkthrough 当前没有执行，不作为这次两个 blocking 的替代证据；完整安装/构建仍可留到 R05 总回归。

## R03 复核标准

只需证明：

1. T02/T03 共用同一套 session + 账号赛事身份集合，T03 不再维护第二套 identities；
2. 报名 pending / approved / rejected 在公共平台、我的赛事和 workspace 间连续；
3. 赛事生命周期的详情页 / workspace / workshop 行为统一，不再存在两个相互矛盾的赛事阶段真相源。

满足后 **R03 PASS**。现有 Workspace、Workshop、S1–S6 UI 与 Task Runtime 不需要重做。
