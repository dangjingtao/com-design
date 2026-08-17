# R03 — T03 三创赛生命周期 / 创赛工坊评审

> Review role: 评审线程  
> Reviewed HEAD: `28ac5d2f90096b31ffdbb31d7a54b4fd1bdff570`  
> Gate result: **PASS**

## 结论

T03 通过 R03。

本轮复核仅检查上一版 R03 的两个 blocking，均已闭环；Workspace / Workshop / S1–S6 UI 与 Task Runtime 不需要重做。

## Blocking 复核

### R03-B1 — PASS：账号级 session / identities 已恢复唯一真相源

- `PublicPlatformProvider` 继续持有唯一的 `session + identities[]`。
- `WorkshopRuntimeProvider` 已删除自己的账号身份集合，只保留赛事局部 runtime：lifecycle / permission / materials / taskRuns / results。
- T03 的 `identityFor / setIdentityScenario` 直接读取、更新公共账号状态。
- 游客不会读取赛事身份；pending / rejected / active / revoked 会写回同一账号身份集合。
- `/competitions/mine`、报名、首页和 workspace 因此读取同一身份状态。

母动线 B 的状态连续性恢复：

`公共赛事 -> 报名回流 -> 账号赛事身份 -> 我的赛事 -> 当前 workspace`

### R03-B2 — PASS：赛事 lifecycle 已统一为赛事期能力真相源

- `competition.status` 仅表达公开报名窗口。
- `WorkshopRuntime.lifecycle` 统一表达 `notStarted / inProgress / ended` 赛事执行阶段。
- 赛事详情、我的赛事、报名、workspace、workshop 均以同一 lifecycle source 判断赛事期能力。
- `ended` 会立即关闭报名/赛事期 CTA，并转向赛后出口；不再出现“详情报名中，但 workspace 已结束”的矛盾。

## 已通过项继续成立

### Workspace / 动线

- Workspace 优先表达当前赛事、当前项目/团队与当前最重要下一步，不是功能宫格。
- pending / rejected / noIdentity / permissionDenied 均阻止赛事期能力。
- ended / revoked 有长期资产 handoff，不留死页。

### 创赛工坊

- 首页首先回答“我现在最该做什么”。
- S1–S6 数据驱动，共用 `answer -> review -> queued/running/failed/completed -> result -> next task`。
- task / result / competitionId 显式绑定，未继承旧原型串线。
- 材料缺失、task locked、失败重试、成果查看均由共享 runtime 状态驱动。

### 工程边界

- 未修改 Com Design Core。
- 未进入 T04 长期资产内部实现。
- 真实 `npm run build` / 浏览器全量 walkthrough 仍未在当前无依赖环境执行；该项继续留到具备依赖环境时补验，并在 R05 做最终工程回归。

## Gate

**R03 PASS。**

可以进入 T04；后续施工线程继续先执行 T0，并沿用当前唯一账号状态与赛事 lifecycle 边界，禁止再次建立平行真相源。