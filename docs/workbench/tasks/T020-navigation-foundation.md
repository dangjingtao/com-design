# T020 · Navigation Foundation

- Status: TODO
- Target version: V2 first-stage
- Impact: Navigation / Component / Cross-platform
- Owner: -

## Background

V2 已确认 Top App Bar、Side Navigation / Rail、递归多级导航需要共享一个跨端导航模型；微信小程序 Capsule / Host Chrome 不进入 Core。

## Goal

建立能映射 wide Web、compact mobile 与 Mini Program host constraints 的 Navigation Foundation。

## Must Read

- T003、T010、T012、T013 任务卡及结果
- `design-source/V2_PLANNING.md` navigation sections
- `design-source/components/top-app-bar.json`
- `design-source/components/bottom-navigation.json`
- `design-source/v2-planning/v2-prd.md`

## Scope

- Top App Bar 与 Platform Reserved Region / Host Chrome 的正式关系。
- Side Navigation expanded、Rail compact 的 responsive mapping。
- recursive `children[]` 多级导航模型，不硬限制两层。
- active destination / active ancestor / expansion state 分离。
- wide→medium→mobile mapping contract。
- icon action 消费 T013 registry。

## Out of scope

- 不把 App Shell 所有布局职责塞入 Navigation Component。
- 不把微信 Capsule 画成 Core Component。
- 不复制 Academy 产品业务结构；其代码只作为 read-only evidence。

## Acceptance

- [ ] recursive nav model 支持真实多级结构。
- [ ] parent destination 与 disclosure hit target 可分离。
- [ ] Side Nav / Rail / mobile destination mapping 有明确规则。
- [ ] Top App Bar 可在微信 host reserved region 下保持安全标题 / action 区域。
- [ ] keyboard / touch / a11y 规则可由 platform/input context 消费。
- [ ] focused tests / preview evidence 通过。

## Risks / Dependencies

- 前置：T003、T010、T012、T013。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Wide / mobile / mini examples:
- Accessibility evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
