# T05 — 全量页面、交互回归与工程收口实现报告

> Branch: `core-industry-college-refactor`  
> T0 base / R04 PASS HEAD: `a157d9338e94c663003b12a328c69bb7331f9e23`  
> Final verified code HEAD: `c1ef3a8b0b1ef13d025cbf23dfd596a0bb5b00cd`  
> Verification run: GitHub Actions `Core Industry College Verify` run `31992490414`  
> Gate: **T05 实现完成，停止并等待 R05 独立终审；本线程不自行宣布 R05 PASS。**

## 1. T0 与冻结契约

T05 开始前重新读取当前 branch HEAD、R04 最终评审、T01 140 页映射 / 66 条语义路由、T05 / R05 卡片、Com Design 真相源和 T02–T04 当前代码。

施工期间继续冻结以下上游事实：

- `PublicPlatformProvider` 继续是长期 `session / identities[] / applications / followedCompanies` 的唯一真相源。
- `WorkshopRuntimeProvider` 继续是赛事 `lifecycle / permission / taskRuns / workshop results` 的唯一真相源。
- `LongTermAssetsProvider` 只保存长期学习、权益记录、证书/成绩、资料与简历 presentation。
- T05 新增 `SupportProvider` 只保存通知、第三方账号绑定、投稿等支撑页面的原型状态，没有复制 session / identity / lifecycle / application。
- `/tasks` 的 D03 与 `/me/subjects` 的 D08 继续视为产品定义未决，不猜业务模型。
- 没有修改 `design-source/` 或其它 Com Design Core 真相源。

## 2. T01 140 页映射 / RouteProbe 收口

T05 施工前，66 条语义路由中 47 条已接真实页面，19 条仍落 RouteProbe，其中 `/tasks` 是有意冻结。

T05 完成后：

- T01 `src/routes/registry.ts` 的 **66 条语义路由全部在 App 中有明确 route 声明**。
- `RouteProbe` 不再被正式 App 使用，旧 `src/app/RouteProbe.tsx` 已删除。
- `/tasks` 改成明确的 `D03` decision-blocked 页面。
- `/me/subjects` 改成明确的 `D08` decision-blocked 页面。
- 未知路径不再 `Navigate /home` 静默吞掉，而是进入明确 `404 / dead-link` 页面。
- `RouteLab` 动态参数全部替换成当前真实 mock ID，避免 `company-1 / course-1 / result-1` 之类早期 fixture 制造假死链。

实际 `npm run audit:routes` 结果：

```text
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
```

其中 69 包含 `/`、`/dev/routes`、`*` 三条非 T01 registry 辅助路由。

## 3. T05 新补业务路由

新增 `features/platform-support/SupportPages.tsx`，承接原 RouteProbe 中已定义且不依赖未决业务模型的页面：

- onboarding：profile / survey / ready
- 公告资讯：list / detail
- 学力值
- 赛友风采：list / detail / submit
- 客服：home / chat / human requested state
- 第三方账号
- 通知：list / unread / read detail
- legal / privacy / about 信息架构入口
- D03 tasks 与 D08 subjects decision-blocked
- explicit NotFound

这些页面使用 `SupportProvider` 维护自身原型状态，但不建立第二套长期账号、赛事身份或 application store。

## 4. route / dead-link / 返回路径修复

### 列表返回状态

赛事、机会、企业的搜索 / 筛选状态从页面局部 state 提升到 `PublicPlatformProvider` 的 list view state，并记录列表滚动位置。

因此：

- 列表 -> 详情 -> 返回后，搜索 / 筛选不会重新初始化。
- Playwright 额外验证“赛事报名中筛选 -> 详情 -> 返回”，筛选结果保持不变。

### 机会 / 企业 / 简历

- opportunity -> company 带 `from`，企业详情返回原 opportunity。
- opportunity -> resume 带 `returnTo`。
- resume -> strengths / education / profile 都继续透传 `returnTo`。
- profile 保存后不再固定回 `/me`，而是回长期简历，再回原 opportunity。
- guest follow company 会先登录，不再直接修改账号关注状态。
- 企业资源关系没有 `to` 的项目改成非按钮信息行，消除“看起来能点但 no-op”的假交互。

### 赛事上下文

- workspace -> `/benefits?competition=:id` 后，权益列表真正消费 competition 参数，只展示当前赛事来源权益。
- 权益详情保留 competition query，返回可回到对应赛事 workspace。
- `permissionDenied` 不再误导去报名页。
- `RequireCompetitionAccess` 的 notStarted 返回改成确定路由，不再依赖 `window.history.back()`。

### dead-link

- wildcard 进入 `NotFoundPage`，显示实际未知 pathname。
- Playwright 已验证 `/definitely-not-a-route` 不会被吞回首页。

## 5. 状态覆盖收口

当前关键状态由三类机制真实复现，而不是复制静态页面：

### 公共平台视图状态

`PrototypeStateTools / ?view=`：

- ready
- loading
- empty
- error

用于公共列表、首页以及新增资讯 / 赛友列表等读取态。

### 赛事 / 工坊状态

`WorkspaceScenarioTools`：

- identity：none / pending / rejected / active / revoked
- lifecycle：notStarted / inProgress / ended
- permissionDenied

`TaskScenarioTools`：

- locked
- ready
- queued
- running
- failed
- completed

### 长期账号状态

由同一会话真实交互推进：

- course：notStarted -> inProgress -> completed -> assessment passed/failed -> certificate claimable/claimed
- benefit：ineligible / eligible -> claimed -> used，以及 expired seed
- application：submitted / statusUnknown
- verification：valid / invalid
- notification：unread -> read / all read
- story submit：editing -> success
- support chat：AI -> humanRequested

T05 没有为了 registry 中每个排列组合复制一张页面；R05 应按“关键状态可信、母动线连续”标准终审。

## 6. 重复组件 / 超大文件 / mock 收口

### 删除死代码

T02 `PublicPlatform.tsx` 中已被 T03/T04 正式接管的旧 boundary/page 已删除：

- CompetitionDetailPage
- MyCompetitionsPage
- RegistrationHandoffPage
- WorkspaceBoundaryPage
- ResumeBoundaryPage

### 共享状态与视图状态

`PublicPlatformProvider` 在不改变上游账号契约的前提下新增 list view / scroll state，避免赛事 / 机会 / 企业各自复制一套返回恢复逻辑。

`SupportProvider` 集中处理通知、账号绑定、投稿等新增支撑页状态，避免 page-local 假跨页状态。

### 仍保留的大 feature files

当前仍有 `PublicPlatform.tsx / WorkspacePages.tsx / AssetsPages.tsx / SupportPages.tsx` 等较大的 feature-area 文件，但没有出现一个组件承载全 App，也没有按旧 140 页复制页面。T05 没有为了追求行数指标继续机械拆文件；R05 若发现真实重复 pattern，再按 pattern 拆分。

## 7. Com Design 收口

产品继续直接消费 `design-source/colors_and_type.css` semantic token。

本卡修正：

- shared Button disabled 使用 `--color-disabled / --color-text-disabled`。
- secondary action 使用 `--color-secondary / --color-secondary-hover`。
- 清理部分 `text-xl / space-y-7` 等明显偏离语义字号 / 4px 节奏的用法。
- workspace 资料保存移除 browser `alert()`，改成页面内 success feedback。
- 清理正式产品视图中的 `T03 / T04 handoff` 等施工术语。
- 未修改 Com Design Core。

### 上游 Core warning（T05 不越界修）

真实 Vite build 仍给出 2 条 CSS minifier warning：

```text
Unexpected "@media" [css-syntax-error]
@media (prefers-reduced-motion: reduce)
```

已定位到 `design-source/colors_and_type.css`：

```css
.motion-reduced,
@media (prefers-reduced-motion: reduce) { ... }

.motion-reduced *,
@media (prefers-reduced-motion: reduce) { ... }
```

这是 Core 真相源中的非法 selector / at-rule 组合，不是 prototype 自己的 CSS。T05 遵守冻结边界，没有在产品侧复制修正版或直接修改 Core。R05 应把它作为上游 Com Design 缺口单独判断。

## 8. 真实 build：从失败到成功

T01–T04 由于施工环境网络限制一直没有真实 `npm install && npm run build` 证据。T05 新增专用 GitHub Actions：

`.github/workflows/core-industry-college-verify.yml`

第一轮真实 build 并没有假 PASS，而是抓到了 T04 遗留的真实 JSX 语法错误：`CoursesPages.tsx` assessment result Card 的 `className={...}` 少一个 `}`。

T05 修复后，最终 verified HEAD `c1ef3a8...` 在 GitHub hosted runner 实跑：

- Ubuntu 24.04
- Node `20.20.2`
- npm `10.8.2`
- `npm install --no-audit --no-fund`：PASS，安装 140 packages
- `npm run audit:routes`：PASS
- `tsc -b && vite build`：PASS
- 54 modules transformed
- production dist 成功生成并上传 artifact

构建仍保留上一节所述 Core reduced-motion CSS warning，但没有 TypeScript / Vite build error。

当前项目仍无 committed lockfile，因此验证使用 `npm install` 而非 `npm ci`；README 已明确记录这一点。

## 9. 真实 Chromium walkthrough

新增 Playwright 配置与 `tests/mother-flows.spec.ts`，使用 390 x 844 viewport、独立 browser context、真实 Vite preview。

最终 GitHub Actions run `31992490414`：

```text
Running 7 tests using 1 worker
7 passed (5.9s)
```

实走内容：

1. **A 新用户 / 游客**：guest home -> public competition -> login -> return to registration。
2. **B 报名与身份**：none identity -> registration -> external -> pending -> approve -> workspace -> competition-scoped benefits -> return workspace。
3. **C 创赛工坊**：workspace -> answer -> review -> queued -> running -> completed -> correct task result。
4. **D 就业 / 实习**：opportunity -> company -> return opportunity -> resume -> edit strengths -> returnTo -> opportunity -> submit -> applications。
5. **E 赛后资产**：ended/revoked workspace -> experiences -> experience detail -> trusted result。
6. **返回状态**：competition filter -> detail -> return，filter 保持。
7. **dead-link**：unknown path -> explicit 404。

生产 dist artifact 与 Playwright browser evidence artifact 均已上传，保留 14 天。

## 10. README / 工程入口

`prototype/core-industry-college/README.md` 已更新到 T05，包含：

```bash
npm install
npm run audit:routes
npm run build
npm run dev
npx playwright install chromium
npm run verify:browser
```

`package.json` 当前版本 `0.0.5-t05`，提供：

- `audit:routes`
- `build`
- `e2e`
- `verify`
- `verify:browser`
- `dev / preview`

## 11. T05 停止条件

### 已完成

- 66/66 semantic routes 明确承接。
- generic RouteProbe = 0。
- explicit 404 / dead-link。
- 5 条母动线 Chromium 实走成功。
- filter return 与 competition benefit context 额外回归成功。
- 真实 npm install / route audit / TypeScript / Vite build 成功。
- production + browser evidence artifact 生成。
- 共享账号 / lifecycle / application 契约未复制。
- D03 / D08 未擅自产品化。

### 留给 R05 独立判断

- Com Design Core reduced-motion CSS syntax warning 是否必须在 Core 线程先修后才能最终发布。
- 未提交 lockfile 是否作为最终交付前工程要求；当前不影响本次安装 / build / browser evidence。
- 新增支撑路由在正式产品首页 / “我的”里的最终运营入口排序仍可由产品信息架构继续调整；T05 没有改动 T01 已冻结的四项一级导航。

## 12. Gate

**T05 DONE。**

停止施工，交给 **R05 — T05 全量终审**。

R05 必须独立读取最新 HEAD、本文档、GitHub Actions 证据与 Com Design Core warning，再决定 PASS / CHANGES REQUIRED；不能把本文档的 T05 DONE 等同于 R05 PASS。
