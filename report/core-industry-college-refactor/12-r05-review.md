# R05 — T05 全量终审

> Review role: 评审线程  
> Branch: `core-industry-college-refactor`  
> Current branch HEAD at review start: `69096f648211d66db347aab40df065c622551211`  
> Verified product-code HEAD: `c1ef3a8b0b1ef13d025cbf23dfd596a0bb5b00cd`  
> Verification run: GitHub Actions `31992490414`  
> Gate result: **PASS**

## 结论

R05 通过。

本轮最终交付已经达到总纲定义的“可运行、可点击、可继续修改的移动端中保真前端原型项目”，不是静态散页集合。

当前 branch HEAD 相比已执行真实 CI / Chromium 验证的 `c1ef3a8...` 只新增 `11-t05-full-regression-implementation.md` 文档，没有产品代码变化，因此该次验证证据仍覆盖当前产品代码。

## 1. 全量路由 / 功能承接 — PASS

真实 CI route audit：

```text
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
```

判断：

- T01 66 条 semantic routes 已全部明确承接；
- 正式 App 不再依赖 generic `RouteProbe`；
- 未决 D03 `/tasks` 与 D08 `/me/subjects` 被明确标记为 decision-blocked，没有擅自补产品定义；
- wildcard 已变为明确 404 / dead-link，不再静默吞回首页；
- T05 新增 Support 路由没有复制 session / identity / lifecycle / applications 等上游真相源。

满足 R05 的旧→新覆盖、无明显孤岛页、路由可维护要求。

## 2. 五条母动线真实浏览器回归 — PASS

GitHub Actions `31992490414` 在 Chromium 390×844 真实执行 Playwright，结果：

```text
Running 7 tests using 1 worker
7 passed
```

其中五条母动线均是实际点击和状态推进，不是静态断言：

1. A 游客公共平台：guest 首页 -> 赛事 -> 详情 -> 登录 -> returnTo 回赛事报名。
2. B 三创赛报名：无赛事身份 -> 响应式报名 handoff -> pending -> approved -> workspace -> 当前赛事权益 -> 返回 workspace。
3. C 赛事陪跑：workspace -> task answer -> review -> queued -> running -> completed -> 当前 task 正确成果。
4. D 就业 / 实习：机会 -> 企业 -> 返回机会 -> 长期简历 -> 编辑 -> returnTo -> 投递 -> applications。
5. E 赛后资产：ended / revoked workspace -> 长期参赛经历 -> 详情 -> 可信赛事结果。

额外通过：

- 赛事筛选 -> 详情 -> 返回后筛选状态保持；
- 未知 URL 明确进入 404 / dead-link。

因此母动线、返回路径、赛事上下文和关键 cross-module handoff 达到终审要求。

## 3. 真实安装 / 构建 / 运行证据 — PASS

GitHub hosted runner 实际执行：

- Node 20.20.2 / npm 10.8.2；
- `npm install --no-audit --no-fund` 成功，安装 140 packages；
- `npm run audit:routes` PASS；
- `npm run build` = `tsc -b && vite build` PASS；
- production `dist/` 成功生成；
- Playwright 使用真实 `vite preview` server 完成浏览器回归；
- production build 与 browser evidence 均成功上传 artifact。

T05 第一次真实 build 曾抓出 T04 JSX 语法错误，修复后才获得上述 PASS，因此这不是“只写脚本没有执行”的形式验证。

README 已给出 install / audit / build / dev / preview / browser verification 的明确入口。

## 4. 状态与工程结构 — PASS

终审确认：

- `PublicPlatformProvider`：session / identities / applications / followedCompanies 与公共列表视图状态；
- `WorkshopRuntimeProvider`：competition lifecycle / permission / taskRuns / workshop results；
- `LongTermAssetsProvider`：课程、权益长期记录、证书/成绩、资料、简历 presentation；
- `SupportProvider`：通知、绑定、投稿等支撑页原型状态。

没有重新出现 T02/T03/T04 已修过的多套账号或赛事真相源。

关键状态可以通过真实 state/runtime 或 prototype controls 重现：guest、loading/empty/error、pending/rejected/active/revoked、notStarted/inProgress/ended、permissionDenied、locked/queued/running/failed/completed、课程/权益/证书/投递状态等。

虽然 feature-area 文件仍有一定体量，但没有出现一个大组件承载整个 App，也没有按旧 140 页复制大量近似静态页面。当前拆分足以继续维护，不要求为了行数再机械拆文件。

## 5. Com Design — PASS，存在一个非阻断上游缺陷

原型继续消费 `design-source/colors_and_type.css` semantic token，T05 没有复制或篡改 Com Design Core。

真实 Vite build 出现两条：

```text
Unexpected "@media" [css-syntax-error]
```

已定位为 Core 中 reduced-motion 写法把 selector 与 `@media (prefers-reduced-motion: reduce)` 非法组合。

### R05 判断

**不阻断本次核心产业学院原型验收。**

原因：

- TypeScript / Vite production build 实际成功；
- 五条母动线和产品交互不依赖这两条规则；
- 缺陷属于 Com Design Core 真相源，产品线程遵守“不修改 Core”边界是正确的；
- 当前实际影响主要是 reduced-motion 可访问性规则可能不能按预期生效，而不是页面结构、状态、业务流程或主视觉崩溃。

但它是一个真实 Core defect，不能因为 R05 PASS 就视为不存在。应在 Com Design Core 自己的修复线程中修正，并在 Core 发布/正式生产消费前消除 build warning。

## 6. 无 lockfile — 非阻断，但应作为工程后续项

当前 prototype 目录没有 committed lockfile，依赖使用 semver range，CI 因此使用 `npm install` 而非 `npm ci`。

### R05 判断

**不阻断本次中保真原型终审。**

理由：

- R05 既定完成标准要求“项目可安装、启动、构建”，没有把 lockfile 定义为 Gate；
- 已经存在全新 hosted runner 的真实 install + build + Chromium 证据；
- 当前交付性质仍是可继续修改的前端原型，而不是 production release package。

建议在进入长期协作、部署或版本发布前提交 lockfile，并把 CI 切到 `npm ci`，否则未来依赖解析可能漂移。

## 7. 最终 Gate

**R01 PASS -> R02 PASS -> R03 PASS -> R04 PASS -> R05 PASS。**

本轮 `core-industry-college-refactor` 重构任务完成。

最终评价不以“画了约 150 页”为依据，而以总纲标准判断：

**项目能跑、能点、能改；旧功能有去向；公共平台与赛事生命周期边界成立；五条母动线连续；关键状态可信；赛后资产保留；代码结构具备后续迭代基础；中保真视觉已回归 Com Design 基线。**

## 非阻断 follow-up

1. Com Design Core：修复 reduced-motion 非法 CSS 结构，并重新跑 consumer build。
2. Prototype engineering：生成并提交 lockfile，后续 CI 改用 `npm ci`。

以上两项不改变本次 **R05 PASS**。