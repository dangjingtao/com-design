# T02 — 公共平台实现报告

> Gate: **等待 R02**。本卡完成后不进入 T03/T04。

## 页面与交互覆盖

已把以下 T01 语义路由从 `RouteProbe` 替换为真实 React + TypeScript + Tailwind 页面：

- `/home`
- `/competitions`
- `/competitions/mine`
- `/competitions/:competitionId`
- `/competitions/:competitionId/registration`
- `/competitions/:competitionId/workspace`（仅 T03 handoff 边界）
- `/opportunities`
- `/opportunities/:opportunityId`
- `/companies`
- `/companies/:companyId`
- `/applications`
- `/me/resume`（仅 T04 接口边界）
- `/auth/login`（T02 未登录动作边界）

首页第一层是“参赛 + 就业 / 实习”；课程、权益、可信成果保留为支撑入口。

## 已实接动线

1. `/home -> /competitions -> competition detail -> registration`
2. `/home -> /competitions/mine -> competition workspace handoff`
3. `/home -> /opportunities -> opportunity detail -> company detail`
4. `opportunity detail -> 长期简历检查 -> application -> /applications`
5. 首页“原型账号”可切换到**无赛事身份**；切换后仍可连续浏览赛事、机会、企业，只有 workspace 等赛事专属能力不被授予。

## 共享实现

- 新增 `src/components/ui.tsx`：Button / SecondaryButton / GhostButton / Card / Section / StatusTag / PageHeader / PublicShell / StateBlock / 原型状态开关。
- 新增 `src/features/public-platform/data.ts`：Competition / Opportunity / Company domain mock；企业显式关联赛事、权益、课程、活动、岗位。
- 新增 `src/features/public-platform/PublicPlatform.tsx`：共享 public domain state，包含关注、投递、无赛事身份场景。
- Tailwind 只增加 Com Design semantic alias；没有修改 `design-source/`。

## 状态覆盖

- loading / empty / error：页面右下角“原型状态”可切换。
- 未登录：`/home?guest=1`，报名/投递跳登录边界。
- 无赛事身份：首页切换“无赛事身份”账号场景。
- 无资格：`green-business-2026`。
- 已结束赛事：`sanchuang-15`。
- 已结束机会：`closed-1`。
- 已投递：完成一次机会投递后由共享 state 驱动，同一详情页不复制静态版本。

## 未决项处理

- D01：仍使用 T01 候选底栏 `首页 / 赛事 / 机会 / 我的`，仅作为可替换工程默认值。
- D02：registration 只实现响应式报名跳入/回流，不实现角色选择、成员、承诺书。
- D03：`/tasks` 继续冻结。
- D04/D05/D06/D07/D08/D09/D10：T02 不处理。
- D11：applications 只保证 `submitted / statusUnknown`，不虚构更细企业回流状态。

## 自检

- `src/state/model.ts` SHA 仍为 `f23d30886a699eb3a5f714c307defad53b43b2e7`，T01 的账号 / 多赛事身份 / CompetitionContext contract 未修改。
- 公共赛事详情与 workspace 使用不同路由；T02 workspace 页明确停止在 T03 handoff。
- 长期简历页仅承担投递返回接口，不进入 T04 深层资产实现。
- 对比 R01 基线，T02 变更集中在 prototype 的 App / UI / public-platform mock 与 Tailwind consumer 配置，没有修改 Com Design Core、任务卡或总纲。
- 当前执行环境无法解析外网 npm registry，因此没有伪造 `npm install && npm run build` 结果；运行命令和工程依赖保持在 README 中，R02 需在有 npm 网络的环境补一次真实 build/browser walkthrough。

**T02 到此停止，等待 R02。**
