# R02 — T02 公共平台评审

> Review role: 评审线程  
> Reviewed branch HEAD: `29f89897ef72d1a4f19b24df1e5b79fcf3ee2cac`  
> Gate result: **CHANGES REQUIRED（小修后通过）**

## 结论

T02 主体方向正确，可以保留现有 UI 与路由实现：

- 首页第一层已明确“参赛 + 就业 / 实习”。
- 赛事发现、详情、我的赛事、机会、企业、投递记录均已替换为真实 React 页面。
- 企业详情表达了赛事 / 权益 / 课程 / 活动 / 岗位关系，不再只是招聘公司名录。
- 公共赛事与 workspace 边界、T04 长期简历边界均守住，没有提前侵入 T03/T04。
- 搜索、筛选、loading / empty / error、无资格、已结束、已投递等状态已有可演示基础。

R02 暂不放行的原因不是视觉，而是 **两条关键动线的状态连续性还没有真正闭环**；另有一处赛事状态数据需对齐，避免 T03 接手时出现同一赛事两种生命周期。

## Blocking — 必须修正

### R02-B1 游客 / 登录状态跨路由丢失

当前 `useGuest()` 只读取当前 URL 的 `?guest=1`。从 `/home?guest=1` 点击赛事、机会或底部导航后，目标 URL 不再携带该参数，于是页面会自动恢复成“已登录”语义。

影响：

- “游客可连续浏览公共平台”并没有真正成立；
- 游客浏览到赛事详情 / 机会详情后，报名和投递登录门槛可能被绕过；
- 登录状态实际上由某个页面 URL 决定，而不是账号/session 状态。

修正要求：

- 把 `loggedIn / guest` 放进共享 prototype session state（或等价的 provider state），跨路由保持；
- `?guest=1` 可以继续作为调试场景入口，但不能成为登录状态本身；
- 实走：游客首页 -> 赛事列表 -> 赛事详情，仍为游客；游客首页 -> 机会 -> 详情，仍需“登录后投递”。

不要修改 T01 的多赛事身份 / `CompetitionContext` contract。

### R02-B2 报名回流没有写回赛事身份集合

`RegistrationHandoffPage` 当前只用页面内 `useState("ready" | "external" | "pending")` 模拟流程。点击“模拟提交并回流 App”后再进入 `/competitions/mine`，账号的 `identities[]` 没有新增/更新 pending 身份。

因此页面文案说“报名已提交，等待审核”，但“我的赛事”仍可能显示没有赛事身份，母动线 B 在这里断开。

修正要求：

- 在 T02 共享 prototype state 中增加对 `CompetitionAccountState.identities[]` 的增量更新能力；
- 报名回流 pending 时，upsert 当前 `competitionId` 的 `identityStatus=pending` / `registrationStatus=pending`；
- `/competitions/mine` 必须立即读到该状态；
- 不要因此授予 workspace 权限，只有 active identity 才能进入赛事 workspace。

## Required alignment — 同一修正提交处理

### R02-A1 同一赛事的全局赛事状态保持一致

当前 `sanchuang-16` 在公共赛事 mock 中是 `registrationOpen`，而 multi-competition account scenario 中是 `inProgress`。这会导致同一赛事在“赛事详情”和“我的赛事”出现不同生命周期标签。

允许“用户身份状态”和“赛事全局状态”不同，但同一个 `competitionStatus` 不应由两套 mock 各自给出冲突值。

修正方向二选一即可：

1. 公共赛事对象作为赛事全局状态唯一来源，identity 只保存身份/报名状态；或
2. 保留当前类型，但保证同一 competitionId 的 competitionStatus 数据一致。

## 非阻断项

- `/me/resume` 返回机会后目前会重新出现一次“使用长期简历投递”按钮，略多一步，但没有形成死路；可在 T04 接入时进一步顺滑。
- `/me` 仍是后续卡的 RouteProbe 边界，可接受。
- 当前环境无法完成真实 npm install/build，不作为本轮阻断项；不要伪造构建结果。

## R02 复核标准

只需证明：

1. 游客/session 状态跨路由连续；
2. 报名 pending 回流会写入账号赛事身份集合，`/competitions/mine` 立即可见；
3. 同一赛事全局 `competitionStatus` 不再互相冲突。

满足后 **R02 PASS**。不需要重做首页、赛事、机会、企业或现有中保真视觉。