# Com Design Work Ledger

> 统一记录 Com Design V2 的任务、施工、评审与验收。CI 通过不等于设计系统验收通过；代码合并不等于任务 PASS。

## 当前基线

- V2 PRD：`design-source/v2-planning/v2-prd.md`
- V2 规划总账：`design-source/V2_PLANNING.md`
- 四端 readiness：`design-source/v2-planning/four-platform-readiness-audit.md`
- Build Pipeline：`design-source/BUILD_PIPELINE.md`
- 设计 Skill：`design-source/SKILL.md`
- 原 V2 依赖拆解稿：`design-source/v2-planning/v2-task-ledger.md`（仅作为历史拆解来源，不再作为正式派卡入口）
- 目标窗口：2026-09-01 → 2026-09-07
- 默认施工分支：`dev`
- 稳定发布分支：`main`
- 最终评审 / 放行判断：Mira

## 默认规则

1. 可执行工作使用稳定编号 `T001` 起；编号创建后永久保留，不复用。
2. 跨端、架构、Schema、Adapter、CI、独立验收工作必须有独立任务卡，位于 `docs/workbench/tasks/`。
3. 默认状态流：`TODO → DOING → REVIEW → PASS`；执行态可进入 `BLOCKED`，取消使用 `CANCELLED`。
4. AI / Builder 可以推进到 `REVIEW`；不得自行改成 `PASS`。Mira 负责设计系统层面的 approve / revise / reject。
5. 每次状态变化至少留下 commit / PR / CI / build evidence / review conclusion 中一种可追踪证据。
6. `design-source/` 是 canonical editable source；生成物不能反向成为上游真相源。
7. Android / iOS / Web / WeChat Mini Program 都是 V2 正式目标；不得把体系收窄成 Web + RN。
8. `report/design-system-v1/` 是验收证据，禁止删除或原地覆盖。
9. 并行以语义竞态判断，不以“文件不同”作为充分条件。共享 schema、canonical model、adapter registry、validator、CI 必须按前置关系施工。
10. 国内 AI 施工提交可进入额外 AI Review Gate；硬门禁失败不能由人工或 AI 主观放行。

## 总状态

| 卡片 | 主题 | 类型 | 状态 | 目标 | 前置 |
| --- | --- | --- | --- | --- | --- |
| T001 | Source Integrity + Manifest Gate | Architecture / Validation | PASS | V2 first-stage | - |
| T002 | Cross-platform Platform Model + Axes | Architecture | PASS | V2 first-stage | - |
| T003 | Core Component Contract V2 Schema | Contract / Validation | PASS | V2 first-stage | - |
| T004 | Adapter Modularization + Stable Registry | Tooling / Adapter | PASS | V2 first-stage | - |
| T005 | Canonical Design Model V2 | Architecture / Tooling | PASS | V2 first-stage | T001、T002、T003 |
| T006 | Validation Orchestrator + Evidence Output | Validation | PASS | V2 first-stage | T001、T003、T005 |
| T007 | Web Adapter V2 | Web / Adapter | REVIEW | V2 first-stage | T004、T005 |
| T008 | Native Mobile Adapter V2 | iOS / Android / Adapter | TODO | V2 first-stage | T002、T004、T005 |
| T009 | WeChat Mini Program Minimum Viable Adapter | Mini Program / Adapter | TODO | V2 first-stage | T002、T004、T005、T010 |
| T010 | Platform Environment Contract | Architecture / Platform | PASS | V2 first-stage | T002 |
| T011 | Motion Foundation V2 | Foundation / Motion | PASS | V2 first-stage | T002 |
| T012 | Responsive Layout + Input Modality Foundation | Foundation / Layout | PASS | V2 first-stage | T002 |
| T013 | Icon Registry → Provider → Adapter | Foundation / Icon | PASS | V2 first-stage | - |
| T014 | AI-readable / Executable / Verifiable Contract | AI / Contract | PASS | V2 first-stage | T003、T005、T010、T013 |
| T015 | Penpot as Governed Downstream Consumer | Penpot / Tooling | PASS | V2 first-stage | T003、T005 |
| T016 | Human Guide / Skill / Library-consumption Consistency | Docs / Consumption | TODO | V2 first-stage | T001、T007、T008、T009、T014、T015 |
| T017 | Deterministic CI Hard Gate + Evidence Artifact | CI / Validation | TODO | V2 first-stage | T006、T007、T008、T009、T014、T015 |
| T018 | Representative Four-platform Smoke Harness | QA / Cross-platform | TODO | V2 first-stage | T007、T008、T009、T010、T011、T012 |
| T019 | Release Governance + Conditional AI Review Gate | CI / Review | TODO | V2 first-stage | T017 |
| T020 | Navigation Foundation | Component / Navigation | TODO | V2 first-stage | T003、T010、T012、T013 |
| T021 | Mobile Search + Filter Workflow Contract | UX Pattern | TODO | V2 first-stage | T003、T010、T012 |
| T022 | Incremental Loading / Infinite List Pattern | UX Pattern | TODO | V2 first-stage | T003、T012 |
| T023 | State Feedback + Alert/Banner Semantics | Component / Pattern | TODO | V2 first-stage | T003 |
| T024 | Switch + Timeline Visual Defect Repair | QA / Component | TODO | V2 first-stage | T003 |
| T025 | Button V2: Pill / Destructive / Loading | Component | TODO | V2 first-stage | T003 |
| T026 | First-week Integration Acceptance / V2 RC Readiness | Integration / Review | TODO | V2 first-stage | T001-T025 |

## 推荐施工波次

### Wave A · 立即并行

- T001 Source Integrity
- T002 Platform Model
- T003 Component Schema
- T004 Adapter Modularization
- T013 Icon Registry

### Wave B · 核心模型与平台地基

T001-T004 的对应前置合入后推进 T005、T010、T011、T012，并在 T003 完成后可推进 T024。

### Wave C · Adapter / Consumer / UX 并行

按依赖放行 T006-T009、T014-T015、T020-T023、T025。

### Wave D · 门禁与总验收

T016-T019 完成消费一致性、CI、四端 smoke 与 Review Gate；最后 T026 做第一周总验收。

## 派卡规则

施工线程收到 `完成 Com Design Txxx` 后，必须先读取对应 `docs/workbench/tasks/Txxx-*.md`、V2 PRD、当前 `dev` HEAD 及卡片列出的 Must Read。仓库事实与任务卡冲突时停止施工并报告，不得自行脑补。
