# 核心产业学院可交互原型

当前完成至 **T02：公共平台——首页 / 赛事发现 / 企业与机会**，等待 R02。

## 运行

```bash
cd prototype/core-industry-college
npm install
npm run dev
```

默认入口 `/home`。`/dev/routes` 仍保留 T01 Route Lab，用于查看完整语义路由。

## T02 已实现

- 首页：参赛 + 就业/实习首层心智、我的当前赛事、支撑层入口。
- 赛事：列表、搜索/筛选、详情、我的赛事、registration handoff、workspace 边界。
- 机会：列表、搜索/筛选、详情、长期简历检查接口、投递、投递记录。
- 企业：列表、详情、关注，以及赛事/权益/课程/活动/岗位资源关系。
- 状态：loading / empty / error 可通过页面右下角“原型状态”切换；首页可切换“多赛事身份 / 无赛事身份”账号场景；`/home?guest=1` 演示未登录浏览。

## 边界

- T01 的 `CompetitionAccountState / CompetitionContextState` 未修改。
- 公共赛事详情 `/competitions/:id` 与赛事 workspace `/competitions/:id/workspace` 分开。
- registration 只做响应式报名跳入/回流模拟，不重建复杂报名表单。
- workspace 只做 T03 handoff；长期简历只做 T04 接口，不实现内部深层能力。
- `/tasks` 继续冻结，不处理 D03。
- 视觉/组件真相源仍为仓库根目录 `design.md` 与 `design-source/`。
