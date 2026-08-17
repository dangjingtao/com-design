# T03 — 三创赛生命周期与创赛工坊实现报告

> Branch: `core-industry-college-refactor`  
> Gate: 完成后停在 R03，不进入 T04 / T05。

## 本次实现

- 将 T01 已登记的赛事上下文路由从 RouteProbe 替换为真实 React 页面：workspace、team、resources、resource detail、workshop、project、compute、skills、skill detail、task answer/review/progress、results/result detail。
- 保持 T01 `CompetitionAccountState / CompetitionContextState` 基础语义不变；T03 通过独立 Workshop runtime 增量记录赛事期 lifecycle、材料、task run 与成果状态，按 `competitionId` 隔离上下文。
- 报名仍为响应式报名 handoff：App 仅模拟跳入、提交回流、pending、rejected、approved 与身份授予，不重做复杂原生报名表单。
- Workspace 不做功能宫格，首先展示当前赛事、身份、项目/团队和最重要下一步，再进入团队、资料、工坊等赛事能力。
- 创赛工坊首页首先回答“我现在最该做什么”，展示当前项目/阶段、下一任务、缺失材料、上一次结果与继续执行入口。

## S1–S6 / Task Runtime

旧原型 S1–S6 业务内容保留为配置数据：

- S1 项目洞察：选品评分、方向研判、竞品、用户需求。
- S2 项目诊断：真实性、画像、市场可行性、商业模式、竞争分析。
- S3 平台运营：定位、文案、图文、短视频、直播、客服话术。
- S4 数据复盘：经营周报、漏斗、投放、用户行为、增长机会。
- S5 项目冲刺：评分预检、材料补缺、路演 PPT、答辩准备。
- S6 职业规划：职业顾问、面试、公司推荐、简历亮点。

所有任务统一走：

`skill/task config -> answer -> review -> queued/running/failed/completed -> result -> next task`

任务和成果通过 `taskId / resultId / competitionId` 显式绑定，不存在 S1 跳 S2、S3 跳 S5 或跨赛事复用成果的页面硬编码。

## 可演示状态

赛事身份：`none / pending / rejected / active / revoked`。

赛事期：`notStarted / inProgress / ended`，另有 `permissionDenied`。

Task Runtime：`locked / ready / queued / running / failed / completed`。

状态均来自共享 runtime / mock 数据，不通过复制静态页面表达。

## 赛后边界

赛事 `ended` 或身份 `revoked` 后，workspace 与工坊赛事期动作被阻止，页面提供：

- `/assets/experiences`
- `/assets/results`

作为 T04 handoff。本卡没有实现长期资产内部页面。

## 验证

- 对 T03 新增 TS/TSX 做 TypeScript strict 内部类型检查：PASS。
- 对 T03 新增文件及 App 路由改动做 TypeScript transpile 语法检查：0 diagnostics。
- 当前执行环境没有项目 `node_modules`，且 npm registry DNS 不可达，因此本线程无法完成真实 `npm run build` / browser walkthrough；R03 应在有依赖环境中继续执行真实构建与五条指定 T03 动线检查。

## 未进入

- 未修改 Com Design Core。
- 未修改 T01 `CompetitionAccountState / CompetitionContextState` 类型契约。
- 未实现 T04 课程、权益、可信成果、长期简历/资产深层逻辑。
- 未开始 T05 全量页面收口。
