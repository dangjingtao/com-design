# T014 · AI-readable / Executable / Verifiable Contract

- Status: REVIEW
- Target version: V2 first-stage
- Impact: AI / Contract / Tooling
- Owner: -

## Background

V2 已确定 AI / Agent 是第一消费接口优先级，并允许 Agent 直接施工与自验证。现有 Skill / MCP 不能继续主要依赖 Web Preview 和人类说明推断实现。

## Goal

让 Agent 能从 canonical model 确定地回答“该用什么、怎么实现、怎么验证”，并输出可审计 evidence。

## Must Read

- T003、T005、T010、T013 任务卡及结果
- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/v2-prd-q3-ai-agent.md`
- `tooling/src/mcp-adapter.mjs`
- `design-source/SKILL.md`

## Scope

- machine contract 暴露 Token、Component、Composite、Pattern、Platform Adapter、Icon 能力。
- Agent 可选择目标 platform/context，不复制 Web implementation。
- 输出 hard compliance / warnings / evidence / exceptions 的结构化结果。
- MCP / machine entrypoint 与 canonical source 对齐。

## Out of scope

- 不让 Agent 自行决定最终产品审美 / release。
- 不把 soft quality 强行变成二值 hard gate。

## Acceptance

- [x] Agent 能读取一个目标平台的合法实现路径。
- [x] 能区分 Core / Product Extension / Platform Adapter。
- [x] 能产生结构化 compliance + evidence。
- [x] 无法自动判定的问题会升级为 warning / human decision，而不是伪装 PASS。
- [x] focused tests / sample agent consumption 通过。

## Risks / Dependencies

- 前置：T003、T005、T010、T013。
- T016、T017、T019 将消费本卡输出。

## Implementation record

- Commit / PR: PR #24; squash merge `44ef3922cdaba2456ca42de4e655d5d4c2a5f13f`
- Changed paths: `tooling/src/agent-contract.mjs`, `tooling/bin/build.mjs`, `tooling/test/agent-contract.test.mjs`
- Notes: machine contract 直接由 Canonical Design Model V2 生成，并附带 icon registry 与 platform adapter maturity；最终 release 决策仍留给人。

## Verification evidence

- CI: Design System Build run `33650310064` — success (`npm test` + `build:all`).
- Machine contract sample: `dist/agent/contract.json`，支持 target platform/context。
- Agent compliance sample: hardCompliance 与 warnings/evidence/exceptions 分离，humanDecision 固定要求人工裁决。

## Review

- Reviewer: Mira pending final review
- Result: REVIEW
- Conclusion: Implementation and CI evidence ready for design-system review.
- Follow-up: T016/T017/T019 may consume this output after PASS.
