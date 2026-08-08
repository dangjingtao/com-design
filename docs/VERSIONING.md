# Versioning / Deprecation / Migration — V1

Com Design Mobile 在 Stable V1 之后使用 Semantic Versioning。

## 1. Version meaning

### PATCH

不改变公开设计语义和 API 的兼容修复，例如：

- 文档纠错
- 不影响 role/state 的视觉细节修正
- Contrast 修复但不改变 Semantic 名称
- PenPot stale binding 修复

### MINOR

向后兼容扩展，例如：

- 新增 Core Component
- 新增可选 Variant / State
- 新增 Semantic role，旧 role 保持有效
- 新增 Product Extension schema capability

### MAJOR

不兼容改变，例如：

- 删除 / 重命名公开 Token
- 改变 Component role 或关键 state contract
- 改变 Theme / Density mode 的公开解析规则
- 删除已发布组件
- 改变 Machine Manifest contract

---

## 2. Deprecation lifecycle

公开资产不得直接删除。

生命周期：

`active → deprecated → migration-window → removed-in-next-major`

Deprecated 必须附带：

- 原名称
- 替代名称 / 替代方案
- Deprecated version
- Earliest removal version
- Migration note

---

## 3. Rename rule

禁止“直接改名然后全仓搜替换”作为发布后的迁移方式。

正确流程：

1. 新 role / component 进入 MINOR
2. 旧项标记 deprecated
3. 文档和机器 Manifest 同时给 alias / replacement
4. Product migration 完成
5. 下一个 MAJOR 才允许移除旧项

---

## 4. Token migration

Token 迁移必须判断**语义**，不能只判断色值。

两个 token 当前解析到相同 value，不代表可以合并。

例如：

- placeholder
- disabled
- tertiary

即使某个 Theme 下颜色相同，也仍然是不同 role。

---

## 5. Component migration

Component Contract 发生变化时必须说明：

- anatomy 是否变化
- state 是否变化
- accessibility 是否变化
- layout / hit area 是否变化
- Product Pattern 是否需要同步

只写“新版样式已更新”不算 Migration Note。

---

## 6. Theme / Density migration

Theme / Density 是系统 Axis。

若某产品此前绕过 Axis 自己 hard-code：

- 先迁移到 Semantic / Mode Ref
- 再启用新 Theme / Density

禁止通过复制一套 Dark Component 或 Compact Component 继续叠债。

---

## 7. Changelog

每个发布版本至少分：

- Added
- Changed
- Fixed
- Deprecated
- Removed
- Migration

只记录会影响设计、研发或 Product Consumer 的内容；内部整理不需要伪装成产品变更。

---

## 8. Release states

- `candidate`：期内设计产物
- `release-candidate`：五期完成、自检通过，等待独立二审
- `stable`：独立二审与发布 Gate 通过
- `deprecated`：仍兼容但计划退出

作者自检不能把状态从 release-candidate 直接改为 stable。
