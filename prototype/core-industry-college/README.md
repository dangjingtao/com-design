# 核心产业学院可交互原型 — T01 工程骨架

本目录只完成 T01：语义路由、上下文边界、mock state 基线与 Route Lab。**没有开始 T02 页面 UI。**

## 运行

```bash
cd prototype/core-industry-college
npm install
npm run dev
```

打开 `/dev/routes` 可查看全部语义路由。所有业务路由暂时使用同一个 `RouteProbe`，用于验证 route/context/state 规划，避免在 T01 就复制大量页面。

## 约束

- 视觉/组件真相源仍是仓库根目录 `design.md` 与 `design-source/`。
- `src/styles.css` 直接引入 Core runtime token CSS，不复制 token。
- 公共赛事详情与赛事 workspace 分层。
- 创赛工坊所有 S1–S6 后续共用 Task Runtime。
- `/tasks` 仅保留冻结路由，等待产品定义。
- R01 通过前不要进入 T02。
