# V2 Review — Switch

> Status: Confirmed V2 issue  
> Scope: Com Design V2  
> Component: Switch

## V2-Switch-01 — Disabled state must be visually distinct

**Observed bug:** 当前 Switch 已有 `disabled-off` / `disabled-on` 状态定义，但 Preview 中 disabled-off 与正常 off 的视觉差异过弱，用户很难快速判断控件是否可操作。

当前实现中：

- normal off track = `var(--color-surface-subtle)` + `var(--color-border)`；
- disabled off track = `var(--color-surface-subtle)` + `var(--color-border-subtle)`；
- 两者背景完全相同，主要只依赖较弱的 border 差异；
- row label/helper 虽会切到 `text-disabled`，但 Switch control 本体仍缺少足够明确的 disabled affordance。

这属于 **visual-state contrast bug**，不是缺少 disabled state。

### V2 requirement

Switch 必须同时表达两个彼此独立的维度：

```text
value:       off / on
availability: enabled / disabled
```

要求：

- disabled-off 与 enabled-off 必须一眼可区分；
- disabled-on 与 enabled-on 也必须一眼可区分；
- disabled 不能破坏原本的 on/off 状态识别——用户仍需要知道它是“被锁定为开”还是“被锁定为关”；
- 不允许只依赖 cursor、hover 缺失或文字颜色表达 disabled，因为移动端 / 小程序没有 hover/cursor 线索；
- 不允许仅靠极细微 border 色差作为 disabled 的主要信号；
- 推荐从 semantic disabled tokens 同时治理 `track / border / thumb / label`，而不是在业务实现里临时加 opacity；
- 若使用整体 opacity，必须保证 on/off 对比、文字可读性和 WCAG / 平台可访问性不会一起被压低；
- disabled state 不响应 press / toggle；仍保留正确的 accessibility disabled semantics；
- iOS / Android / 微信小程序三端应保持相同状态语义，但具体颜色映射可由平台 Adapter / token theme 调整。

### Visual direction candidate

优先考虑：

- `disabled-off`：更弱的 neutral track + disabled border + muted thumb；
- `disabled-on`：保留“on”的位置与结构，但使用 disabled-on semantic track，而不是正常 Brand primary；
- thumb 在 disabled 状态也应有轻微 muted treatment，避免 track 被弱化后 thumb 仍像正常可交互控件；
- 外部 label / helper 使用 disabled text token；若必须解释不可用原因，helper 保留足够可读性，不要把整行全部压成几乎看不见。

正式色值和 token 名称在 V2 Token 审查时确定，不在规划阶段写死。

### Acceptance check

在不依赖 hover / cursor 的静态截图中，用户应该能够同时判断：

1. 当前值是 on 还是 off；
2. 当前是否 disabled。

如果这两件事不能同时看出来，则状态设计不通过。
