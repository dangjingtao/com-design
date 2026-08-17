# 核心产业学院可交互原型

当前完成至 **T05：全量页面、交互回归与工程收口**，等待 R05 终审。

## 安装与运行

```bash
cd prototype/core-industry-college
npm install
npm run audit:routes
npm run build
npm run dev
```

默认入口：`/home`。

路由总表：`/dev/routes`。

生产预览：

```bash
npm run preview -- --host 127.0.0.1
```

静态路由审计 + TypeScript/Vite 构建：

```bash
npm run verify
```

浏览器母动线回归：

```bash
npx playwright install chromium
npm run verify:browser
```

GitHub Actions 的 `Core Industry College Verify` 会在本分支原型代码变化时执行安装、Chromium 安装、66 条语义路由审计、生产构建、5 条母动线 + 404 smoke，并上传生产构建与 Playwright 证据。

> 当前目录尚未提交 lockfile，因此暂用 `npm install`。最终交付若生成 lockfile，应在 CI / 验收环境改用 `npm ci` 做确定性安装。

## 产品结构

一级导航保持四项：

- 首页：参赛 + 就业 / 实习第一层心智。
- 赛事：公开发现、报名、赛事身份、赛事工作区。
- 机会：实习 / 校招 / 企业项目、企业资源关系、投递。
- 我的：长期账号资产、简历、经历、课程成果、证书、权益与通知。

支撑能力包括：

- 课程 `/courses`
- 权益 `/benefits`
- 长期资产 `/assets`
- 公告 `/news`
- 赛友风采 `/stories`
- 客服 `/support`
- 学力值 `/growth/score`

`/tasks` 因 D03 仍未明确，保持产品决策阻塞态；`/me/subjects` 因 D08 未明确，同样不猜业务 UI。

## 原型状态与场景

公共列表 / 首页：

- 页面右下角“原型状态”切换 `ready / loading / empty / error`。
- `/home?guest=1` 演示游客。
- 首页账号工具可切换“多赛事身份 / 无赛事身份”。

赛事工作区：

- 页面内“T03 生命周期状态”可切换赛事身份 `none / pending / rejected / active / revoked`。
- 可切换 lifecycle `notStarted / inProgress / ended`。
- 可切换 `permissionDenied`。

创赛工坊 Task Runtime：

- task 工具支持 `locked / ready / queued / running / failed / completed`。

长期状态通过同一会话内真实交互推进：

- 课程：未开始 → 学习中 → 完成 → 考试通过/失败 → 证书。
- 权益：资格 → 领取 → 使用 / 失效。
- 简历：可信事实选择 + 学生自己的表达。
- 赛后资产：赛事经历 / 结果 / 证书 / 学习成果继续保留。
- 投递记录可切换 `submitted / statusUnknown` 做状态回流检查。

## 路由与 dead-link

T01 的 66 条语义路由都在 `src/routes/registry.ts` 保留为真相源。

T05 正式 App 不再使用 `RouteProbe` 承接业务页面；未知路径进入明确 404/dead-link 页面，不会静默跳回首页。

```bash
npm run audit:routes
```

检查：

- registry 路由是否全部在 App 声明；
- App 是否仍引用 `RouteProbe`；
- 是否存在明确 `NotFoundPage`。

## 共享状态边界

- `PublicPlatformProvider`：长期 session、赛事 identities、applications、followedCompanies，以及列表搜索/筛选/滚动视图状态。
- `WorkshopRuntimeProvider`：赛事 lifecycle、permission、taskRuns、workshop results。
- `LongTermAssetsProvider`：课程学习记录、权益长期记录、证书 / 成绩、资料与简历 presentation。
- `SupportProvider`：通知、账号绑定、投稿等 T05 支撑页原型状态。

禁止再建立第二份 session / identities / lifecycle / applications 真相源。

## Com Design

视觉和组件真相源仍是仓库根目录：

```text
design.md
design-source/
```

原型消费 semantic token，不修改 Com Design Core。

当前生产构建仍会从 Core 的 `design-source/colors_and_type.css` 报两处 reduced-motion CSS minifier warning：`.motion-reduced,` 与后续 `@media (prefers-reduced-motion: reduce)` 的组合不是合法 CSS selector 结构。T05 不在产品线程复制或修改 Core 真相源；R05 应把它作为上游 Com Design 缺口单独判断。

## R05 必走母动线

Playwright 以 390×844 Chromium 独立浏览器上下文执行：

1. 新用户 / 游客 → 公共赛事 → 登录 → 回到赛事报名。
2. 无赛事身份 → 报名 → pending → approved → workspace。
3. workspace → 创赛工坊 → task answer/review/progress/result。
4. 机会 → 企业 → 返回机会 → 长期简历 → 编辑 → `returnTo` → 投递 → applications。
5. ended / revoked → 长期赛事经历 → 可信成绩。
6. 额外验证未知 URL 显式进入 404/dead-link。

R05 仍应以最新 HEAD 的 GitHub Actions 成功结果和评审线程的独立检查为最终 Gate；T05 实现线程不自行宣布 R05 PASS。
