# Com Design Mobile

公司级移动端 Design System。

当前版本：**1.0.0-rc.1**。

它不绑定某一个具体业务产品。当前“三创赛”系列 App 是首批消费者之一，但产品业务主题、活动视觉、排名/阶段等专有语义通过 Product / Domain Extension 表达，不进入公司级 Foundation / Core Component。

## Entry points

- Human-readable：`docs/DESIGN-SYSTEM.md`
- Machine-readable：`contracts/design-system-v1.json`
- Design Review HTML：`report/design-system-v1/index.html`
- Design Review source：`docs/DESIGN-REVIEW-V1.md`
- Review self-check：`review/phase5-human-report-self-check.md`
- Release gate：`release/v1-checklist.md`
- Changelog：`CHANGELOG.md`

### Design Review 使用方式

`report/design-system-v1/index.html` 是面向设计负责人 / 项目负责人的 V1 RC 评审入口，可直接用浏览器打开，不需要构建步骤或外部依赖。

该页面用于判断设计语言、设计模式、系统模型、真实组合与 RC 遗留问题，不是老板汇报版，也不是新的设计真相源。

真相优先级保持：

`Manifest / Token / Contract > Human-readable docs > Review presentation`

## System model

`Primitive → Semantic → Component → Pattern`

正交 Axis：

- Theme：Light / Dark
- Density：Compact / Comfortable
- Platform：iOS / Android
- Motion：Standard / Reduced

V1 Core：**33 Components + 2 Core Patterns**。

默认方向：Modern / Clear / Light / Efficient；Compact-first、Flat-first、信息层级优先于装饰。

## Status

五期设计系统主体已经完成作者自检，目前处于 Release Candidate。

Stable V1 仍需：

- 独立二审
- PenPot Formal Spec / Reusable Component Asset 与 V1 Manifest 对齐
- 导出 `.penpot` 实体审计
- 真机 / 实现环境抽查平台行为
