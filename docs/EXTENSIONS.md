# Product / Domain Extension — V1

## 目标

公司级 Core 必须允许产品形成自己的业务表达，同时避免每个产品都复制一套 Button / Status / Token。

Extension 是**消费 Core 后的业务组合层**，不是“产品可以随便改 Core”的许可证。

---

## 1. Extension 可以做什么

产品可以：

- 组合多个 Core Component 成业务 Pattern
- 定义业务状态枚举，并映射到 Core Status Semantic
- 定义产品 IA / 页面结构
- 使用产品插画、品牌图形、活动主题资产
- 定义业务数据格式和内容规则
- 为特定业务 Pattern 指定 Accent 的使用位置
- 在不破坏 Core contract 的前提下选择平台原生能力

示例：

业务状态 `待审核 / 已通过 / 已驳回` 可以映射为 `warning / success / danger`，但这些中文状态名不进入 Core Token。

---

## 2. Extension 不可以做什么

禁止：

- 修改 Primitive 颜色只为适配一个产品
- 新建 `color.competition.*`、`color.school.*` 一类公司 Core Semantic
- 复制 Core Button 后改名成产品 Button
- 绕过 Density hard-code 另一套尺寸
- 绕过 Theme hard-code Dark 页面
- 降低 touch target / contrast / focus baseline
- 把业务页面结构伪装成 Core Component

---

## 3. 什么时候应该升入 Core

Extension 能力满足以下条件时才评估升入 Core：

1. 已在至少两个产品/业务域稳定复用，或明显属于基础移动交互能力。
2. 语义可以脱离原业务名称独立成立。
3. 现有 Core 组合无法清晰表达。
4. 可以给出稳定 role / anatomy / state / accessibility contract。
5. 升级不会要求 Core Token 携带业务语义。

“另一个页面也想这么画”不构成升入 Core 的充分理由。

---

## 4. Extension package 建议结构

```text
extensions/<product>/
  manifest.json
  patterns/
  docs/
  assets/
```

`manifest.json` 至少声明：

- extension name / version
- supported core version range
- consumed Core components
- business states → Core semantic mapping
- product-only assets
- patterns exported by extension

Extension 不复制 `tokens/tokens.json`。

---

## 5. Theme extension

产品主题可以增加：

- Hero / campaign illustration
- Product-specific chart series
- Decorative accent
- Seasonal assets

但 Core Component 的 action / text / status / surface 仍从公司 Theme 解析。

若产品确实需要 Brand override，应作为**产品品牌 Theme Layer**评审，不允许页面局部直接换色值。

---

## 6. Status mapping

业务状态必须先回答语义，再选颜色：

- Neutral：信息存在但无正负结论
- Info：需要注意 / 有信息更新
- Success：完成 / 正向结果
- Warning：需要关注 / 尚未失败
- Danger：失败 / 风险 / 阻断性错误

Ranking、Level、Stage、Membership 等不天然等于 Status；如果只是分类或等级，应优先用 Tag / Text / Product Pattern，不滥用 Warning / Danger。

---

## 7. Extension review

每个 Extension 至少检查：

- 是否重复造 Core Component
- 是否出现 Component → Primitive
- 是否把业务词写进 Core Semantic
- 是否违反 accessibility baseline
- 是否能够在 Light / Dark、Compact / Comfortable 下正确组合
- Extension 更新是否声明 Core version compatibility
