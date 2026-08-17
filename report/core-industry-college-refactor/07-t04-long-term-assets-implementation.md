# T04 — 长期资产与支撑系统实现报告

> Branch: `core-industry-college-refactor`  
> Base HEAD: `8884f5a2a384462617219321bd825deb4abf4f1b`  
> Gate: 完成后停止在 R04，不进入 T05。

## 1. T0 与共享契约

施工前按 `T0-construction-preflight.md` 对齐了 R03 PASS、T01 route registry、T02 PublicPlatform、T03 WorkshopRuntime、旧→新映射与 Com Design consumer token。

本卡没有建立新的账号 / 赛事身份 / application 真相源：

- `PublicPlatformProvider` 继续唯一持有 `session / identities[] / applications / followedCompanies`。
- `WorkshopRuntimeProvider` 继续唯一持有赛事 `lifecycle / permission / taskRuns / results`。
- T04 新增 `LongTermAssetsProvider`，只保存课程学习记录、权益状态、证书/成绩长期记录、个人资料与简历 presentation。
- T04 长期记录通过 `competitionId / courseId / resultId / companyId` 引用上游对象，不复制赛事、企业、投递对象。

## 2. 已实现页面与路由

将 T01 已登记路由从 RouteProbe / T02 boundary 替换为真实 React + TypeScript + Tailwind 页面：

- 我的：`/me`、`/me/profile`
- 长期简历：`/me/resume`、`/me/resume/strengths`、`/me/resume/education`
- 课程：`/courses`、`/courses/:courseId`、`/courses/:courseId/learn`、`/courses/:courseId/assessment`、`/courses/:courseId/achievement`
- 权益：`/benefits`、`/benefits/:benefitId`、`/benefits/wallet`
- 长期资产：`/assets`、`/assets/experiences`、`/assets/experiences/:experienceId`、`/assets/learning`、`/assets/results`、`/assets/results/:resultId`、`/assets/certificates`、`/assets/certificates/:certificateId`、`/assets/verification`

`/applications`、opportunity/company 与 competition/workshop 路由继续复用 T02/T03 现有实现。

## 3. 业务闭环

### 赛后长期资产

- 赛事身份直接读取公共账号 `identities[]`。
- 赛事阶段直接读取 T03 `WorkshopRuntime.lifecycle`。
- T03 `WorkspaceBlocked` 在 ended / revoked 时真实跳转 `/assets/experiences` 与 `/assets/results`。
- ended / revoked 后仍可查看经历、成绩、证书和赛事关联课程成果。
- 历史资产页不提供重新激活 workspace 的动作。
- 同账号可同时显示进行中的 `sanchuang-16` 与 ended/revoked 的 `sanchuang-15`，历史资产不覆盖当前赛事上下文。

### 课程

真实数据驱动状态：`notStarted -> inProgress -> completed -> assessment passed/failed -> certificate claimable/claimed`。

课程来源支持 platform / competition / company；需权益课程在详情页解释并跳转对应权益，不扩展商城。

### 权益

统一 platform / competition / company / activity 来源，支持：

`eligible -> claimed -> used`，以及 `ineligible / expired`。

权益详情解释资格来源、有效期与当前状态。

### 可信成果

- 赛事成绩保存为长期 result record，只存稳定上游 ID 与成绩事实。
- workshop 项目成果直接从 T03 runtime 派生，不复制一份 result store。
- 证书由统一 certificate records 管理并提供验真码。
- 简历只保存 `selectedFactKeys + strengths + education` 等 presentation，不允许反向改写赛事/课程/证书事实。

### 长期简历与投递

`/me/resume` 正式替换 T02 boundary；从机会详情带 `returnTo` 进入后，可整理可信事实并返回原机会，继续使用 T02 的同一 `submitApplication -> applications` 链。

T04 没有新增 application store。

## 4. Product Pattern

在不修改 Com Design Core 的前提下，仅新增产品组合层：

- `SourceLine`：表达平台 / 赛事 / 企业 / 活动来源。
- `FactCard`：长期事实卡片。
- `ProgressBar`：课程进度。
- `TrustNote`：统一解释“系统可信事实 vs 学生简历表达”。

底层继续复用现有 `PublicShell / PageHeader / Button / Card / Section / StatusTag` 与 Tailwind semantic token。

## 5. Task 专区

`/tasks` 继续由 T01 blocked route 保留，T04 未实现任务中心、企业任务或福利任务。

## 6. 提交前 T0 复核与验证

共享契约复核：

- T02 `PublicPlatform.tsx` blob SHA 仍为 `9fe70453d0bc6a7bf7ea504455c4d485ef9e3d95`，本卡未修改。
- T03 `competition-workspace/runtime.tsx` blob SHA 仍为 `5e35f31a63af98f09cbd7e8f746d2f73b3f9aad9`，本卡未修改。
- T01 `routes/registry.ts` 仍保留 `tasks.reserved / blockedByDecision`，`App.tsx` 未把它加入 implemented routes。
- 开始施工时 branch HEAD 与 R03 PASS 提交一致，为 `8884f5a2a384462617219321bd825deb4abf4f1b`；共享 `App.tsx` 改动前再次读取最新 SHA，再做最小 route wiring。

静态验证：

- T04 新增 TS/TSX 与 App route wiring 在施工草稿阶段执行 TypeScript `transpileModule` 语法检查，0 diagnostics。
- 静态检查 T03 ended/revoked 赛后出口可进入 T04 资产路由。
- 静态检查长期简历 `returnTo` 返回原 opportunity，不创建第二份 application state。
- 静态检查历史资产页不提供重新激活赛事 A workspace 的动作。

真实构建验证：

- 尝试从当前分支重新 clone 后执行依赖安装 / build，但当前施工容器 DNS 无法解析 `github.com`，clone 阶段即失败，因此没有执行成功的真实 `npm install && npm run build`。
- 没有声称执行真实浏览器 walkthrough；R04 应在有完整 checkout + npm 依赖的环境补跑 T04 五条指定动线。

## 7. Gate

T04 到此停止，等待 **R04**。

未进入 T05 全量页面、全局状态收口或最终五条母动线终审。
