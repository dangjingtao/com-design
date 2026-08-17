# R04 — T04 长期资产 / 支撑系统评审

> Review role: 评审线程  
> Initial reviewed HEAD: `16bd51a8b42d2af30669668c21d7da1a07a919d8`  
> Fix reviewed HEAD: `bdbfbf12dff6454514cf0105c9e41cd6d14c1230`  
> Gate result: **PASS**

## 最终结论

T04 通过 R04。

主体实现保持成立：

- 长期资产没有复制 T02 `applications / identities / followedCompanies` 或 T03 lifecycle / workshop result 真相源。
- 赛事经历直接读取共享账号赛事身份与 T03 lifecycle，ended / revoked 后资产仍可访问且不会重新激活 workspace。
- workshop 项目成果从 T03 runtime 派生；长期赛事结果只保存稳定 ID 与事实记录。
- 课程链已实现发现 -> 学习 -> 考试 -> 成果 -> 证书。
- 长期简历把可信事实与学生自己的 presentation 分开，并保留 `returnTo` 回机会继续投递。
- `/tasks` 继续冻结，没有擅自实现任务中心。

## R04 修正项复核

### R04-B1 — PASS：长期账号私有状态统一受 Account Guard 约束

已新增共享 `AccountRequired` / account action helper，并接入：

- `/assets/*`
- `/me/*`
- `/benefits/wallet`
- `/courses/:courseId/learn`
- `/courses/:courseId/assessment`
- `/courses/:courseId/achievement`

课程发现/详情与权益列表/详情仍可公共浏览，但游客不再读取 seeded 账号状态；需要写入账号状态的动作统一先检查共享 `PublicPlatformProvider.session`，并通过 `returnTo` 登录后回到原页面。

`guest=1` 仅作为调试入口，生成 `returnTo` 时会移除该参数，避免登录成功后再次被调试参数切回游客。

同时，长期资产 store 的课程学习、考试、证书领取、权益领取/使用、简历编辑、资料编辑等写方法也有 session 二次防护，不只依赖 UI 按钮隐藏。

### R04-B2 — PASS：赛事权益资格读取共享 identities[]

Benefit 增加轻量 `requiresCompetitionId`，没有复制赛事身份对象。

`benefitStatusFor()` 对赛事身份相关权益读取 `PublicPlatformProvider.identities[]`：

- 尚未领取的赛事专属权益，在没有对应 active identity 时为 `ineligible`；
- 满足对应 active identity 后可恢复可领取；
- `claimBenefit()` 自身再次校验资格，避免绕过 UI；
- 已领取 / 已使用 / 已过期作为长期记录继续保存。

因此“资格依据”与账号共享 identity 真相源保持一致，同时长期权益记录仍可跨赛事生命周期保存。

### R04-A1 — PASS：completed course CTA 与目标页一致

课程状态为 completed 时，“查看学习成果”直接进入：

`/courses/:courseId/achievement`

不再绕回 `/learn`。

## 已通过项

- 赛后经历、课程成果、成绩、证书继续属于长期账号。
- T03 ended / revoked 出口已接到真实 T04 页面。
- 同账号多赛事历史资产不会重新激活旧 workspace。
- 可信事实与简历 presentation 已分离。
- applications / company / competition / workshop result 没有第二份 store。
- 课程、权益仍处在参赛/就业的支撑层，没有反客为主。
- `/tasks` 继续 `blockedByDecision`。

## 验证边界

本次快速复核针对 R04 三项 blocking / alignment 做代码级验收，均已闭环。

当前施工环境仍无法完成真实 npm build / browser walkthrough；该项没有被冒充通过，继续留到 R05 全量终审执行真实构建与五条母动线回归。

**R04 PASS。可以进入 T05。**
