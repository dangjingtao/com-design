# T04 — R04 小修说明

> Base review: `375b37939fde1d33083f1efd61ff680f291b9942`  
> Scope: 仅修 R04-B1 / R04-B2 / R04-A1，不进入 T05。

## 1. Account Guard

- 新增统一 `AccountRequired`，只读取 `PublicPlatformProvider.session`。
- 私有路由统一保护：`/assets/*`、`/me` / profile / resume、`/benefits/wallet`、course learn / assessment / achievement。
- course / benefit 公共发现与详情仍可浏览，但游客不展示 seeded 账号进度/权益状态。
- 课程开始、权益领取/使用等公开页账号动作统一通过 `useAccountAction()`；未登录跳 `/auth/login?returnTo=...`。
- `returnTo` 会移除 T02 的 `guest=1` 调试参数，避免登录后再次被切回游客。
- LongTermAssets store 的写动作同时做 session no-op 防线，避免仅靠 UI guard。

## 2. 赛事权益资格

- `Benefit` 增加轻量 `requiresCompetitionId`。
- `LongTermAssetsProvider.benefitStatusFor()` 对尚未领取的赛事身份权益直接读取共享 `identities[]`，只把对应 `active` identity 视为当前可领取资格。
- `claimBenefit()` 本身再次校验共享身份派生资格。
- `claimed / used / expired` 继续作为长期账号记录保留，不复制赛事身份对象。
- 切换到无赛事身份时，赛事专属尚未领取权益变为 `ineligible`；恢复 active identity 后恢复原可领取状态。

## 3. Completed course CTA

- `CourseDetailPage` 的 completed 状态“查看学习成果”现在直接进入 `/courses/:courseId/achievement`，不再跳 `/learn`。

## 4. 边界复核

- 未修改 T02 `PublicPlatformProvider` 真相源结构。
- 未修改 T03 `WorkshopRuntimeProvider` lifecycle / result runtime。
- 未建立第二份 applications / identities / competition store。
- `/tasks` 继续由 T01 registry 保持 `blockedByDecision`。
- 未进入 T05。

## 5. 验证

已做静态复核：

1. 游客直达私有长期资产路由 -> AccountRequired -> 登录 -> returnTo 原路由。
2. 无赛事身份 -> 赛事专属未领取权益不可新领取；恢复 active identity 后资格恢复。
3. 已领取/已使用/过期权益不会因身份切换被删除。
4. completed course -> achievement。

真实 `npm install / npm run build` 再次尝试，但当前执行环境仍无法解析 `github.com` DNS，未伪造构建结果。

**T04 小修完成，停止等待 R04 快速复核。**
