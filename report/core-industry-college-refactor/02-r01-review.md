# R01 — T01 页面总图 / 动线评审

> Review role: 评审线程
> Reviewed commit: `4631552ef55ec60c064a3d52c9a023ed18c82861`
> Gate result: **CHANGES REQUIRED（小修后通过）**

## 结论

T01 主体质量达标：140/140 旧页都有去向，公共平台 / 赛事 workspace 分层清楚，5 条母动线具备入口、主动作、下一步、返回和异常状态；旧原型错链没有被继承，任务专区等未决业务也没有被 UI 猜测。

R01 暂不直接放行的原因只有一个架构级问题：**代码中的状态模型尚未真正表达“一个长期账号可同时拥有多个赛事身份”。** 这需要在后续页面开始依赖状态模型前修正。

## Blocking — 必须修正

### R01-B1 多赛事身份不能用单一 competition state 表达

总纲要求：一个账号可关联多个赛事身份，当前赛事只是用户进入某个赛事 workspace 后的上下文。

当前 `src/state/model.ts` 只有：

- `currentCompetitionId?`
- 单个 `status`
- 单个 `identity`
- 单个 `registration`

这无法同时表示例如：

- 三创赛：进行中 / active
- 另一赛事：已报名 / pending
- 历史赛事：ended / revoked，但长期资产保留

修正方向：

```text
Account / CompetitionIdentity[]（或 keyed records）
  competitionId -> competitionStatus / identityStatus / registrationStatus

CompetitionContext
  currentCompetitionId
  team / permissions / workspace-local state
```

不要把 `currentCompetitionId` 与“用户全部赛事身份”继续揉在一个单体 `competition` 对象里。

验收：至少增加一个 mock scenario，能同时表示两个以上赛事身份，并证明 `/competitions/mine` 与进入某个 workspace 时的 current context 不冲突。

## Required alignment — 同一修正提交一起处理

### R01-A1 文档中的状态分层与实际代码保持一致

T01 报告声明了 `CompetitionContext / WorkshopState / OpportunityState / LearningState / BenefitState / AssetState` 等状态域，但当前 seed model 只实现了 session / competition / workshop / application / view 的极简子集。

不要求 T01 把 T04 的业务数据全实现，但必须二选一：

1. 在代码中补齐足够薄的 domain state/type 骨架，供后续线程共享；或
2. 在报告明确标注哪些只是规划、哪些已经实际落码。

目的：避免 T02/T03/T04 并行时各自发明 incompatible state shape。

## 非阻断项

- 当前环境无法访问 npm registry，因此未完成真实 `npm install && npm run build`，可以接受；T01 没有伪造 build 结果。
- 候选一级导航 `首页 / 赛事 / 机会 / 我的` 已明确只是默认候选，并未冒充产品拍板，处理正确。
- 任务专区冻结、原生复杂报名归档、S1–S6 收敛 Task Runtime 的方向均符合总纲。

## R01 复核标准

修正提交只需证明：

1. 多赛事身份与当前赛事上下文分离；
2. 至少一个 multi-competition mock scenario；
3. 报告与实际 state code 对齐。

满足后 **R01 PASS**，无需重做页面树、旧新映射或 5 条母动线。
