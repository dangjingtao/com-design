# Com Design Mobile

公司级移动端 Design System。

当前版本：**1.0.0-rc.2**。

它不绑定某一个具体业务产品。当前“三创赛”系列 App 是首批消费者之一，但产品业务主题、活动视觉、排名/阶段等专有语义通过 Product / Domain Extension 表达，不进入公司级 Foundation / Core Component。

## Entry points

- Human-readable：`docs/DESIGN-SYSTEM.md`
- Machine-readable：`contracts/design-system-v1.json`
- Iconography contract：`contracts/iconography.json`
- Release gate：`release/v1-checklist.md`
- Changelog：`CHANGELOG.md`

## System model

`Primitive → Semantic → Component → Pattern`

正交 Axis：

- Theme：Light / Dark
- Density：Compact / Comfortable
- Platform：iOS / Android
- Motion：Standard / Reduced

V1 Core：**33 Components + 2 Core Patterns**。

默认方向：Modern / Clear / Light / Efficient；Compact-first、Flat-first、信息层级优先于装饰。

## RC2 Foundation Hardening

RC2 暂停扩充组件，先从 33 个 Core Component 反向审计 Foundation。

P0 已补强：

- Source-of-Truth 元数据统一：Manifest 是唯一 canonical entrypoint
- Iconography Contract：Lucide 为默认通用 UI 图标源
- Shared Icon visual size：16 / 20 / 24
- Shared Loading Indicator visual size：16 / 24
- Search placeholder 在实际 subtle surface 上的 Light / Dark 对比度修复
- Alert / Toast status graphic 的真实背景对比度修复

详见：`reports/foundation-hardening-p0.md`。

## Status

当前仍处于 Release Candidate。

Stable V1 仍需：

- 完成 P1 Foundation Hardening
- 独立二审
- PenPot Formal Spec / Reusable Component Asset 与最新 Manifest 对齐
- 导出 `.penpot` 实体审计
- 真机 / 实现环境抽查平台行为
