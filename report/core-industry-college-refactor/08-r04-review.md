# R04 — T04 长期资产 / 支撑系统评审

> Review role: 评审线程  
> Reviewed HEAD: `16bd51a8b42d2af30669668c21d7da1a07a919d8`  
> Gate result: **CHANGES REQUIRED（小修后通过）**

## 结论

T04 主体方向正确，现有课程 / 权益 / 长期资产 / 简历 UI 与数据结构不需要推翻：

- 长期资产没有复制 T02 `applications / identities / followedCompanies` 或 T03 lifecycle / workshop result 真相源。
- 赛事经历直接读取共享账号赛事身份与 T03 lifecycle，ended / revoked 后资产仍可访问且不会重新激活 workspace。
- workshop 项目成果从 T03 runtime 派生；长期赛事结果只保存稳定 ID 与事实记录。
- 课程链已实现发现 -> 学习 -> 考试 -> 成果 -> 证书。
- 长期简历把可信事实与学生自己的 presentation 分开，并保留 `returnTo` 回机会继续投递。
- `/tasks` 继续冻结，没有擅自实现任务中心。

R04 暂不放行有两个原因，均属于账号/资格状态边界，不是视觉问题。

## Blocking — R04-B1 长期账号私有状态没有统一 session guard

当前只有 `/me` 首页显式检查 `session.loggedIn`，但多条长期账号路由可以被游客直接访问：

- `/assets/*` 可直接读取 seeded learning / certificates / competitionResults；
- `/me/resume*` 可直接读取并修改 profile / resume presentation，并直接读取公共 provider 中的 `identities[]`；
- `/benefits/*` / wallet 可直接读取账号权益状态并执行领取 / 核销；
- `/courses/:id/learn`、assessment、achievement 可直接修改长期学习记录。

这会产生真实回归：游客虽然在首页被定义为“只浏览公共赛事/机会/企业”，但只要直接进入这些路由，就可以看到或修改一份长期账号资产。

### 修正要求

建立一个轻量、可复用的 **AccountRequired / LongTermAccountGuard**（名称不限），统一读取 `PublicPlatformProvider.session`：

- `/assets/*`、`/me/profile`、`/me/resume*`、`/benefits/wallet` 必须要求登录；
- 权益领取/使用必须要求登录；权益公共列表若要保留公开浏览，可以只展示公共信息，账号状态/动作登录后再读取；
- 课程发现/详情可以继续公共浏览，但写入学习进度、考试、成果/证书的动作必须要求登录；
- 登录后应使用 `returnTo` 回到原页面，不另建 session 真相源。

不要在每个页面各写一套不同的游客判断。

## Blocking — R04-B2 身份相关权益资格目前是固定 seed，与共享账号身份脱节

`LongTermAssetsProvider` 当前直接用 `Benefit.initialStatus` 初始化全部权益状态。例如赛事权益 `benefit-sanchuang-course` 固定为 `eligible`，而“北辰美妆校园体验权益”固定为 `claimed`。

因此当公共账号切成“无赛事身份”或游客时，权益仍可能继续显示可领取/已领取；资格文案却写着“当前账号具备三创赛相关学生身份”。

这违反 T04 的原则：权益状态可以长期保存，但**资格依据不能复制或脱离共享 identity 真相源**。

### 修正要求

- 对明确依赖赛事身份的权益，资格判断必须读取 `PublicPlatformProvider.identities[]`（或等价共享账号事实）。
- 可以在 Benefit 数据上增加轻量的 eligibility requirement，例如 `requiresCompetitionId` / rule key；不要复制赛事身份对象。
- 已领取 / 已使用 / 已过期属于长期记录，可继续保存在 `LongTermAssetsProvider`；但“是否当前有资格领取”必须与共享账号状态一致。
- 切换到无赛事身份时，不应还能新领取赛事身份专属权益；切回满足资格后可以恢复可领取能力。

不要求设计完整规则引擎。

## Required alignment — R04-A1 课程已完成 CTA 与目标页一致

`CourseDetailPage` 中课程已完成时按钮文案为“查看学习成果”，但当前统一 `begin()` 仍跳 `/learn`。请在同一小修中让 completed 直接进入 achievement（或调整为一致的行为），避免主动作与下一步不一致。

## 已通过项

- 赛后经历、课程成果、成绩、证书继续属于长期账号。
- T03 ended / revoked 出口已接到真实 T04 页面。
- 同账号多赛事历史资产不会重新激活旧 workspace。
- 可信事实与简历 presentation 已分离。
- applications / company / competition / workshop result 没有第二份 store。
- 课程、权益仍处在参赛/就业的支撑层，没有反客为主。
- `/tasks` 继续 blockedByDecision。
- 当前环境未完成真实 npm build / browser walkthrough，不作为 R04 本次状态边界问题的替代证据；完整构建和五条母动线仍在 R05 终审执行。

## R04 快速复核标准

只需证明：

1. 游客不能读取/修改长期账号私有资产，登录 `returnTo` 连续；
2. 课程学习/考试、权益领取/核销等写操作受统一账号 guard 约束；
3. 赛事身份相关权益资格读取共享 `identities[]`，无身份时不能新领取；
4. completed course 的主 CTA 与目标页一致。

满足后 **R04 PASS**。不需要重做 T04 页面或视觉。