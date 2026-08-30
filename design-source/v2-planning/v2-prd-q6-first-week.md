# Com Design V2 PRD — Q6 First-week Delivery Strategy

> Parent: `v2-prd.md`  
> Status: Discovery / Draft  
> Scope: Q6 — 9 月怎么打仗？

## Confirmed delivery posture

用户要求：**给 Mira 更多任务卡，把 V2 第一阶段压缩到第一周完成。**

这意味着 9 月不按“整月慢慢演进”的节奏推进，而采用高并行、细拆卡、短验收链路的施工方式。

任务卡数量不再受此前约 11 张主卡估算约束。正式派卡时，以“单一验收目标、低竞态、可并行、可回滚”为优先，允许拆成更多卡来换取第一周吞吐量。

## First-week target

第一周按 **9 月 1 日—9 月 7 日** 理解。

第一周末的完成标准不是“所有未来候选组件都做完”，而是 **V2 主干已经达到可正式消费、可继续扩展的状态**：

```text
Canonical Source Integrity
+ cross-platform model
+ machine-readable contracts
+ Android / iOS / Web usable adapters
+ WeChat Mini Program formal architecture position + minimum viable adapter path
+ Platform Adapter foundation
+ AI-executable / AI-verifiable consumption path
+ deterministic hard gates
+ review / evidence / version governance
+ Penpot as synchronized downstream consumer
```

这相当于把原本可能分散到 9 月前半段甚至整月的基础建设，集中在第一周完成。

## Priority order

### P0 — must land in week 1

1. Source Integrity / Manifest 修正与自动校验；
2. Canonical Design Model 与 platform / input / viewport / motion 等跨端轴；
3. Component Contract Schema + validator；
4. Android / iOS / Web Adapter 可真实消费；
5. WeChat Mini Program 的正式平台模型、最小 Adapter 路径与宿主约束接口；
6. Safe Area / Host Chrome / Back / Overlay / Navigation 等 Platform Adapter foundation；
7. Motion semantic foundation 与 reduced-motion contract；
8. AI-readable / AI-executable / AI-verifiable 入口；
9. deterministic CI hard gates + evidence 输出；
10. Penpot / Human Guide / Skill / library-consumption 与 canonical source 对齐；
11. representative component / pattern / cross-platform smoke 验证；
12. SemVer、显式升级、迁移说明与 Mira release judgment 规则。

### P1 — do in week 1 when parallel capacity allows

- Responsive / Layout foundation；
- Side Navigation / Rail / multi-level navigation；
- mobile search + filter + incremental loading；
- Alert / Banner、Result / Blocking State 等 feedback hardening；
- Switch、Timeline 等已发现 preview / implementation defects；
- Icon Registry / Provider / Adapter；
- V2 Button additions；
- Accordion / Index Bar 等已经确认或高证据候选能力。

## Card strategy

正式派卡时，不再追求“少卡看起来整洁”，而追求：

- 一张卡只承担一个清晰交付目标；
- Schema / Adapter / Docs / Preview / Validation 尽量拆开，减少多人 / 多 Agent 改同一文件；
- 可并行任务明确文件所有权与 merge 顺序；
- 共享 canonical files 由少数串行卡负责，避免竞态；
- 每张卡必须有 machine-checkable acceptance evidence；
- 需要国产 AI 施工的卡可额外进入 AI Review Gate；
- Mira 负责跨卡架构一致性、证据审查和最终放行。

因此第一周可接受比 11 张更多的卡；具体数量由依赖图决定，而不是预先为了数字好看硬凑。

## What may remain after week 1

第一周之后允许继续演进的主要是 **覆盖广度和产品验证深度**，而不是再补基础架构：

- 低优先级候选组件；
- 更完整的小程序 production maturity；
- 更多真实产品四端消费证据；
- 长尾 visual polish；
- 新 Product Extension；
- 经过真实项目证据后再决定是否晋升 Core 的能力。

换句话说：第一周以后可以继续“长肉”，但骨架不能再欠账。

## Q6 conclusion

> **9 月第一周完成 Com Design V2 的跨端工程主干；通过更多、更小、更可并行的任务卡提高吞吐量。第一周后继续扩展覆盖广度，但不再把 Source / Contract / Adapter / Validation / Governance 这些基础能力留作尾债。**
