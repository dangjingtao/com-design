# Com Design V2 — First-week Task Ledger

> Status: **Dispatched**  
> Target window: **2026-09-01 → 2026-09-07**  
> Repo: `dangjingtao/com-design`  
> Target branch: `dev`  
> Planning base: `d61359edbeab4a14e895dd8d113d484124ddf54e`  
> Final reviewer / release judgment: **Mira**

This ledger is the execution contract for the first Com Design V2 delivery wave. It is derived from `v2-prd.md`, not from the old V1 implementation shape alone.

## Dispatch rule

Each Builder must start by fetching the **current** `dev` HEAD and reading the listed Must Read files. The planning base above is the common architecture snapshot used to split work; it is **not** permission to ignore newer repository facts.

If current code conflicts with a card, stop at the conflict and report it. Do not silently reinterpret the card.

### Common Must Read

- `design-source/v2-planning/v2-prd.md`
- `design-source/v2-planning/four-platform-readiness-audit.md`
- `design-source/BUILD_PIPELINE.md`
- `design-source/SKILL.md`
- the task-specific planning note listed on the card

### Common hard constraints

- `design-source/` remains the canonical editable source; generated outputs cannot become upstream truth.
- V2 is the engineering realization of V1 design-system thinking, not a rewrite that discards validated V1 assets.
- Target platforms are Android / iOS / Web / WeChat Mini Program. Do not reduce the architecture to Web + React Native.
- React Native / NativeWind may remain supported consumers, but they are not the universal platform model.
- Product Extension may add product-specific Token / Component / Pattern, but cannot silently redefine Core semantics.
- Platform Adapter may choose presentation and limited structure, but cannot invent product semantics or change task-result meaning.
- Do not modify `dangjingtao/core-industry-college-prototype`; it is read-only field evidence.
- Do not delete or overwrite `report/design-system-v1/`; accepted human reports are retained acceptance evidence.
- Do not hand-edit generated `dist/**` or `penpot/build/**` as the source of a fix.
- Do not do unrelated refactors.
- Any Builder using a domestic AI model is eligible for the extra AI Review Gate defined by V2 governance.
- Hard-gate failure cannot be overridden by review judgment; hard-gate pass does not force Mira approval.

### Common validation baseline

Run the relevant subset and report actual output:

```bash
npm test
npm run validate
npm run build:all
```

Cards adding schemas, adapters or validators must add focused tests. Docs-only changes must still keep repository build/validation green if they touch machine-readable files.

## Parallelism

Parallelism is allowed only when file ownership and semantic contracts do not collide. Same-wave Builders should branch from the same coordinator-selected `dev` SHA; after a dependency merges, dependent cards must rebase/replay and rerun validation.

**Initial parallel slots:** `V2-001`, `V2-002`, `V2-003`, `V2-004`, `V2-013`.

Do not start a blocked card merely because its files look separate; schema / adapter / canonical-model dependencies are semantic dependencies.

---

## Dependency map

```text
V2-001 Source Integrity ───────────────┐
V2-002 Platform Model ─────┬───────────┼────→ V2-005 Canonical Design Model
V2-003 Component Schema ───┘           │                 │
V2-004 Adapter Modularization ─────────┼────→ V2-007 Web Adapter
                                      │     → V2-008 Native Mobile Adapter
V2-002 ─→ V2-010 Platform Environment ┼────→ V2-009 WeChat Mini Adapter
V2-002 ─→ V2-011 Motion Foundation    │
V2-002 ─→ V2-012 Layout/Input          │
V2-013 Icon Registry ──────────────────┤
                                      ├────→ V2-014 AI / MCP Contract
V2-003 + V2-005 ───────────────────────┴────→ V2-015 Penpot Downstream

V2-001 + 003 + 005 ─→ V2-006 Validation Orchestrator
V2-006 + adapters + AI + Penpot ─→ V2-017 Deterministic CI / Evidence
V2-007..012 ─────────────────────→ V2-018 Cross-platform Smoke
V2-017 ──────────────────────────→ V2-019 Governance / AI Review Gate

V2-003 + platform foundations ───→ V2-020..025 Product/quality hardening

V2-001..025 ─────────────────────→ V2-026 First-week Integration Acceptance
```

---

# P0 — architecture and consumption mainline

## V2-001 — Source Integrity + Manifest Gate

**Status:** READY  
**Branch:** `feat/v2-001-source-integrity`  
**Goal:** make the design-system manifest describe repository reality and make false/missing source declarations fail deterministically.

**Must Read:** `specs/design-system-v1.json`, `four-platform-readiness-audit.md`, `BUILD_PIPELINE.md`.

**Owned entry points:**
- `design-source/specs/design-system-v1.json`
- new manifest/source-integrity schema under `design-source/schemas/`
- new source-integrity validator module under `tooling/src/`
- focused tests

**Do not edit:** `tooling/bin/validate.mjs`, CI workflow, platform adapters.

**Acceptance:**
- every declared canonical source exists and parses;
- manifest distinguishes target platforms from currently implemented adapter maturity instead of hand-claiming completion;
- stale references to nonexistent iconography/schema/token files are removed or made explicitly non-canonical/planned;
- catalog counts resolve from real sources rather than copied numbers where practical;
- source-integrity test fails on a missing declared path.

**Depends on:** None.

---

## V2-002 — Cross-platform Platform Model + Axes

**Status:** READY  
**Branch:** `feat/v2-002-platform-model`  
**Goal:** formalize the platform/context axes that all four targets consume.

**Must Read:** `four-platform-readiness-audit.md`, `v2-prd.md` sections 3/4.

**Owned entry points:**
- new `design-source/specs/platform-model-v2.json`
- new platform-model schema
- optional focused human-readable platform-model note
- schema tests

**Contract must cover:**
- `platform = ios | android | web | wechat-mini-program`
- viewport class without hardwiring it to platform
- input modality = touch / pointer / keyboard / hybrid
- motion = standard / reduced
- color scheme = light / dark
- content scale / platform-driven enlarged text
- host/system-owned chrome distinction

**Hard constraint:** do not infer input mode from platform (`web != pointer-only`, mini program != touch-only forever).

**Acceptance:** valid examples for all four platforms; invalid unknown axis values fail schema validation; platform differences remain adapter concerns rather than duplicated Core specs.

**Depends on:** None.

---

## V2-003 — Core Component Contract V2 Schema

**Status:** READY  
**Branch:** `feat/v2-003-component-schema`  
**Goal:** give all 33 Core Component contracts a formal machine-validatable schema and catalog validator.

**Must Read:** `components/index.json`, representative contracts `button.json`, `select.json`, `top-app-bar.json`, existing Composite/Pattern schemas.

**Owned entry points:**
- new `design-source/schemas/component-contract-v2.schema.json`
- `design-source/components/*.json` only when minimal normalization is required
- component catalog validator under `tooling/src/`
- focused tests

**Acceptance:**
- all 33 current Core Component contracts validate;
- schema can represent intent, anatomy, variants, states, interaction/accessibility constraints and platform presentation/exception references without forcing every field on every simple component;
- duplicate IDs / catalog drift / broken component paths fail;
- no 34th component is invented merely to make schema design easier.

**Depends on:** None.

---

## V2-004 — Adapter Modularization + Stable Registry

**Status:** READY  
**Branch:** `feat/v2-004-adapter-modules`  
**Goal:** split the current monolithic adapter implementation so Web, native-mobile and mini-program work can proceed without editing one shared function body.

**Must Read:** `tooling/src/adapters.mjs`, `tooling/bin/build*.mjs`, adapter tests.

**Owned entry points:**
- `tooling/src/adapters.mjs`
- new `tooling/src/adapters/**`
- adapter registry/build plumbing
- regression tests

**Acceptance:**
- current Tailwind, NativeWind, React Native and build-manifest targets still build before platform behavior is changed;
- registry contains explicit extension points for Web, native-mobile and WeChat Mini Program;
- platform-specific modules can be developed independently without editing the same central logic;
- generated outputs continue to declare their canonical source revision.

**Depends on:** None.

---

## V2-005 — Canonical Design Model V2

**Status:** BLOCKED  
**Branch:** `feat/v2-005-canonical-model`  
**Goal:** create one normalized machine model that joins tokens, platform axes, component contracts and higher-level catalogs before adapters consume them.

**Must Read:** outputs of `V2-001/002/003`, `tooling/src/token-model.mjs`.

**Owned entry points:**
- new `tooling/src/design-model.mjs`
- model schema/version metadata
- focused model tests

**Hard constraint:** do not replace the editable source with generated JSON; the normalized model is a build-time representation of canonical source.

**Acceptance:** model exposes stable IDs, source hashes, Token semantics, Component catalog and platform contexts; downstream adapters can consume this model without parsing Web preview DOM/CSS; model contains no false “implemented” platform claim.

**Depends on:** `V2-001`, `V2-002`, `V2-003`.

---

## V2-006 — Validation Orchestrator + Evidence Output

**Status:** BLOCKED  
**Branch:** `feat/v2-006-validation-orchestrator`  
**Goal:** turn `npm run validate` from token-only validation into the deterministic V2 hard-gate entry point.

**Must Read:** `tooling/bin/validate.mjs`, outputs of `V2-001/003/005`.

**Owned entry points:**
- `tooling/bin/validate.mjs`
- validation aggregation helpers
- package scripts only if required
- machine-readable validation evidence under generated output
- focused tests

**Acceptance:** one command validates source integrity, token model, component contracts, platform model and canonical model; output distinguishes errors from non-blocking warnings; evidence includes source SHA / checks run / pass-fail summary.

**Depends on:** `V2-001`, `V2-003`, `V2-005`.

---

## V2-007 — Web Adapter V2

**Status:** BLOCKED  
**Branch:** `feat/v2-007-web-adapter`  
**Goal:** make Web/Tailwind a first-class adapter from the canonical model, not the implicit definition of every other platform.

**Must Read:** `tooling/src/adapters.mjs`, output of `V2-004/005`.

**Owned entry points:** Web adapter module created by `V2-004`, Web/Tailwind adapter tests.

**Acceptance:** semantic tokens remain stable; pointer/keyboard/focus capabilities can be represented without changing Core semantics; adapter evidence states target platform/context; no Web CSS string leaks into platform-neutral contract.

**Depends on:** `V2-004`, `V2-005`.

---

## V2-008 — Native Mobile Adapter V2 (iOS / Android)

**Status:** BLOCKED  
**Branch:** `feat/v2-008-native-mobile-adapter`  
**Goal:** normalize iOS/Android outputs so semantic intent is shared while engineering representations are native-consumable.

**Must Read:** current RN token output in `adapters.mjs`, `BUILD_PIPELINE.md`, platform model.

**Owned entry points:** native-mobile adapter module created by `V2-004`, its tests.

**Hard constraints:**
- do not treat RN/NativeWind as the definition of iOS/Android;
- preserve current RN/NativeWind as supported engineering consumers;
- stop emitting CSS-shaped values where native semantics need structured representation (e.g. shadow/motion/font-family representation).

**Acceptance:** iOS/Android platform contexts are explicit; 44/48 touch policy maps correctly; shadow/motion/type data has structured native-consumable form; existing consumer outputs remain migratable.

**Depends on:** `V2-002`, `V2-004`, `V2-005`.

---

## V2-009 — WeChat Mini Program Minimum Viable Adapter

**Status:** BLOCKED  
**Branch:** `feat/v2-009-wechat-mini-adapter`  
**Goal:** give Mini Program a real generated consumption path in V2 instead of a future note.

**Must Read:** platform model, `V2-010` environment contract when merged, current build adapter structure.

**Owned entry points:** mini-program adapter module/outputs/tests under a dedicated `dist/wechat-mini-program/` target (exact generated file split may follow repository conventions).

**Acceptance:**
- output is generated from canonical semantics, not a hand-maintained WXSS copy;
- platform metadata includes touch, host chrome/safe-area hooks and reduced-motion capability where applicable;
- output is machine-consumable by a mini-program build integration even if full production component library is later work;
- no DOM / Tailwind / RN assumption leaks into its contract;
- build manifest lists mini-program adapter maturity truthfully.

**Depends on:** `V2-002`, `V2-004`, `V2-005`, `V2-010`.

---

## V2-010 — Platform Environment Contract

**Status:** BLOCKED  
**Branch:** `feat/v2-010-platform-environment`  
**Goal:** formalize the non-visual platform boundary used by navigation, overlays and strong platform-convention components.

**Must Read:** `four-platform-readiness-audit.md`, V2 Top App Bar / Mini Program planning in `V2_PLANNING.md`.

**Owned entry points:** new environment contract/spec + schema; no product component redesign.

**Must cover:** Safe Area, Host Chrome / reserved region, Back, focus, keyboard/IME, pointer, gesture, overlay dismissal, system-owned UI, accessibility/content-scale hooks.

**Acceptance:** all four platform contexts can express environment differences without mutating Core Component meaning; Mini Program Capsule is modeled as host/platform chrome, not a Core component.

**Depends on:** `V2-002`.

---

## V2-011 — Motion Foundation V2

**Status:** BLOCKED  
**Branch:** `feat/v2-011-motion-foundation`  
**Goal:** turn motion from CSS-shaped values into shared motion intent + platform mapping + reduced-motion contract.

**Must Read:** `v2-planning/motion-foundation.md`, current motion tokens and adapters.

**Owned entry points:** new motion contract/schema/model and focused tests. Avoid editing platform adapter modules owned by 007/008/009; expose data they can consume.

**Core principle:** “统一动效意图与体验质量，不强制不同平台产生完全相同的物理运动。”

**Acceptance:** semantic motion categories are machine-readable; reduced motion is first-class; platform mapping may differ while intent remains stable; no forced CSS cubic-bezier string in native contract.

**Depends on:** `V2-002`.

---

## V2-012 — Responsive Layout + Input Modality Foundation

**Status:** BLOCKED  
**Branch:** `feat/v2-012-layout-input`  
**Goal:** formalize the layout/responsive/input foundation required for real Web desktop/tablet without making Web a separate design system.

**Must Read:** layout/navigation sections in `V2_PLANNING.md`, readiness audit.

**Owned entry points:** new layout/input specs/schemas and focused tests.

**Must include:** Stack, Center, Grid foundations; viewport classes; input modality rules; compact-to-wide adaptation contract; hooks for Container/App Shell/Side Nav without prematurely forcing those as Core components.

**Acceptance:** layout decisions are based on viewport/input context rather than platform name; narrow/wide examples remain compatible with the same semantic components.

**Depends on:** `V2-002`.

---

## V2-013 — Icon Registry → Provider → Adapter

**Status:** READY  
**Branch:** `feat/v2-013-icon-registry`  
**Goal:** close the current iconography-source gap with a provider-agnostic, machine-readable icon contract.

**Must Read:** iconography section in `V2_PLANNING.md`, manifest source audit.

**Owned entry points:** new icon registry/schema/provider mapping/tooling/tests under `design-source/` + `tooling/`; do not modify product mascot assets.

**Contract:** Lucide may be the default Core provider; Product SVG providers are separate namespaces; Product cannot silently override Core names.

**Acceptance:** stable icon IDs, namespace/provider mapping, size/stroke/viewBox/alignment/a11y metadata and missing-icon fallback are machine-validatable; no font files or third-party binary bundle is committed.

**Depends on:** None.

---

## V2-014 — AI-readable / Executable / Verifiable Contract

**Status:** BLOCKED  
**Branch:** `feat/v2-014-ai-contract`  
**Goal:** make AI / Agent the first formal consumer of the canonical model.

**Must Read:** `v2-prd-q3-ai-agent.md`, `tooling/src/mcp-adapter.mjs`, outputs of 003/005/010/013.

**Owned entry points:** MCP/machine-consumption adapter, its tests, generated machine catalog/evidence if needed. Do not edit `SKILL.md` (owned by V2-016).

**Acceptance:** an Agent can deterministically discover Token, Component, Composite, Pattern, Platform Adapter, required states/variants, platform exceptions and prohibitions by stable IDs; response identifies canonical source revision; no requirement to scrape previews.

**Depends on:** `V2-003`, `V2-005`, `V2-010`, `V2-013`.

---

## V2-015 — Penpot as Governed Downstream Consumer

**Status:** BLOCKED  
**Branch:** `feat/v2-015-penpot-v2`  
**Goal:** update Penpot compilation/sync so V2 canonical contracts remain upstream and Penpot is a real editable downstream design surface.

**Must Read:** `PENPOT_MCP_PLAYBOOK.md`, `penpot/src/**`, PRD Q3.

**Owned entry points:** `penpot/src/**`, `penpot/bin/build.mjs`, Penpot tests/build manifest.

**Acceptance:** Penpot manifest can carry V2 platform/component metadata as appropriate; Token / Component / Variant / State references remain traceable to canonical source; no default free Penpot → canonical writeback path is introduced; current build remains reproducible.

**Depends on:** `V2-003`, `V2-005`.

---

## V2-016 — Human Guide / Skill / Library-consumption Consistency

**Status:** BLOCKED  
**Branch:** `docs/v2-016-consumption-consistency`  
**Goal:** remove stale Mobile/Web-only guidance after the machine contracts and adapters stabilize.

**Must Read:** current `README.md`, `design-source/README.md`, `SKILL.md`, `library-consumption.json`, `BUILD_PIPELINE.md` plus merged adapter/AI/Penpot work.

**Owned entry points:**
- root `README.md`
- `design-source/README.md`
- `design-source/SKILL.md`
- `design-source/library-consumption.json`
- `design-source/BUILD_PIPELINE.md`

**Hard constraint:** preserve human report as acceptance evidence; do not generate/overwrite `report/design-system-v1/` in this card.

**Acceptance:** docs name all 33 components via generated/validated catalog instead of stale six-component maps; AI guidance selects Platform Adapter rather than copying Web preview; platform targets and build outputs match reality; Penpot is described as downstream, not second truth.

**Depends on:** `V2-001`, `V2-007`, `V2-008`, `V2-009`, `V2-014`, `V2-015`.

---

## V2-017 — Deterministic CI Hard Gate + Evidence Artifact

**Status:** BLOCKED  
**Branch:** `ci/v2-017-hard-gates`  
**Goal:** make PR/dev CI run the real V2 deterministic gates and publish evidence that reviewers/Agents can consume.

**Must Read:** `.github/workflows/design-system-build.yml`, V2 governance PRD, output of V2-006 and platform adapters.

**Owned entry points:** `.github/workflows/design-system-build.yml` and new CI-only helper files if necessary. Do not rewrite validators owned by V2-006.

**Acceptance:** CI runs unit tests → V2 validate → real builds → cross-target consistency checks available at this stage; accepted report remains protected; engineering/Penpot/evidence artifacts are uploaded; hard failure prevents “compliant” status.

**Depends on:** `V2-006`, `V2-007`, `V2-008`, `V2-009`, `V2-014`, `V2-015`.

---

## V2-018 — Representative Four-platform Smoke Harness

**Status:** BLOCKED  
**Branch:** `test/v2-018-cross-platform-smoke`  
**Goal:** prove the architecture with representative contracts rather than waiting for a full product launch on four platforms.

**Must Read:** merged adapters + Platform Environment + Motion + Layout contracts.

**Owned entry points:** new smoke fixtures/tests under `tooling/test/**`; no production contract edits unless a real defect is first reported.

**Representative coverage:** Button, Select, Top App Bar/navigation environment, one overlay, one state-feedback composition; at least one compact touch context, one Web pointer/keyboard context, one Mini Program host-chrome context.

**Acceptance:** tests prove same semantic intent produces valid target-specific representations; platform differences are explicit; failures identify contract vs adapter vs fixture layer.

**Depends on:** `V2-007`, `V2-008`, `V2-009`, `V2-010`, `V2-011`, `V2-012`.

---

## V2-019 — Release Governance + Conditional AI Review Gate

**Status:** BLOCKED  
**Branch:** `ci/v2-019-release-governance`  
**Goal:** encode the Q5 governance model without pretending an AI review replaces deterministic CI or Mira judgment.

**Must Read:** `v2-prd-q5-governance.md`, merged V2 CI.

**Owned entry points:** new governance/release checklist + migration template; create a separate AI-review workflow/config if implemented so it does not race V2-017's main workflow.

**Rules to encode:**
- patch/minor backward-compatible by default;
- major may break with migration + impact evidence;
- consumer projects pin versions and explicitly upgrade;
- AI-generated changes may trigger extra AI Review Gate (domestic-AI Builder should be supported as a trigger/policy input, not as a quality stereotype);
- Mira retains final veto after all gates pass.

**Acceptance:** governance can produce `hard compliance`, `AI review findings`, `soft findings`, `evidence`, `Mira decision`; no workflow can auto-override a failed hard gate or auto-approve a formal release.

**Depends on:** `V2-017`.

---

# P1 — week-one product and quality hardening

These cards are intended to run in parallel once the Component/Platform foundations they depend on are stable. They are part of the first-week target, but they must not block foundational cards by creating shared-file churn.

## V2-020 — Navigation Foundation: Top App Bar / Side Navigation / Rail / Recursive Nav

**Status:** BLOCKED  
**Branch:** `feat/v2-020-navigation-foundation`  
**Goal:** establish one navigation model that can map to wide Web, compact mobile and Mini Program host constraints.

**Must Read:** navigation sections in `V2_PLANNING.md`, `top-app-bar.json`, Platform Environment/Layout/Icon outputs.

**Owned entry points:** navigation-specific V2 specs/contracts and related component files only after V2-003 schema exists.

**Acceptance:** recursive `children[]` model with no arbitrary 2-level cap; parent destination vs disclosure action separated; active ancestor vs active destination distinct; wide Side Nav / medium Rail / mobile Bottom Nav or Drawer/Sheet mapping defined; Mini Program reserved chrome honored; Core semantics do not contain WeChat capsule geometry.

**Depends on:** `V2-003`, `V2-010`, `V2-012`, `V2-013`.

---

## V2-021 — Mobile Search + Filter Workflow Contract

**Status:** BLOCKED  
**Branch:** `feat/v2-021-search-filter`  
**Goal:** formalize the confirmed mobile search/filter flow as a reusable V2 UX contract without bloating Core Component count.

**Must Read:** `v2-planning/mobile-search-filter.md`, existing Search Field, Filter Bar and Collection Filter contracts.

**Owned entry points:** dedicated V2 search/filter spec/pattern files and tests; avoid shared `core-patterns.json` churn until V2-026 promotion/integration.

**Acceptance:** query and filters share a CollectionQueryModel but remain independent; IME composition does not commit pinyin; draft vs committed filter state is explicit; Reset does not imply clear query; detail-return restores query/filter/sort/data/scroll; platform presentations preserve task semantics.

**Depends on:** `V2-003`, `V2-010`, `V2-012`.

---

## V2-022 — Incremental Loading / Infinite List Pattern

**Status:** BLOCKED  
**Branch:** `feat/v2-022-incremental-loading`  
**Goal:** implement the confirmed incremental-loading pattern contract with auto-near-end + manual fallback + retry semantics.

**Must Read:** `v2-planning/incremental-loading.md`.

**Owned entry points:** dedicated V2 pattern spec/tests; do not conflate virtualization or pull-to-refresh into this card.

**Acceptance:** cursor backend-agnostic; append error keeps existing data; dedupe/order guards specified; manual Load More/retry fallback exists; list/filter/scroll restore contract defined; Mini Program scroll ownership/node-growth constraints are explicit.

**Depends on:** `V2-003`, `V2-012`.

---

## V2-023 — State Feedback + Alert/Banner Semantics

**Status:** BLOCKED  
**Branch:** `feat/v2-023-state-feedback`  
**Goal:** stop using Empty State as a generic failure surface and make Inline Alert/Banner structurally distinct.

**Must Read:** `state-feedback.md`, `alert-banner.md`, current `alert.json`, `empty-state.json`.

**Owned entry points:** feedback-specific contracts/previews/specs; do not edit unrelated component CSS.

**Acceptance:** Empty = absence/no-results/no-data; Result/Outcome handles terminal success/error/warning/info/pending; Blocking State covers system block/offline/permission where appropriate; Inline Alert is local contextual feedback; Banner is page/region-level persistent placement and must look structurally different from “wider rounded Alert”; ephemeral success remains Toast/Snackbar by default.

**Depends on:** `V2-003`.

---

## V2-024 — Switch + Timeline Visual Defect Repair

**Status:** BLOCKED  
**Branch:** `fix/v2-024-switch-timeline`  
**Goal:** repair two known implementation/preview defects without reopening their validated contract direction.

**Must Read:** `v2-planning/switch.md`, `v2-planning/timeline.md`, corresponding component JSON + preview files.

**Owned entry points:**
- `components/switch.json`, `preview/component-switch.html`
- `components/timeline.json`, `preview/component-timeline.html`
- only directly required shared CSS

**Acceptance:** Switch disabled-on remains visibly On and disabled-off visibly Off while both are weaker than enabled; no crude whole-control opacity solution. Timeline connector is continuous current→next, aligns through variable-height events and omits/fades only the final connector. Both previews pass side-by-side visual-state acceptance and component schema validation.

**Depends on:** `V2-003`.

---

## V2-025 — Button V2: Pill / Semantic Destructive / Loading

**Status:** BLOCKED  
**Branch:** `feat/v2-025-button-v2`  
**Goal:** complete the confirmed V2 Button additions while preserving action hierarchy.

**Must Read:** Button section in `V2_PLANNING.md`, current `button.json` + preview.

**Owned entry points:** Button contract/preview/tests only.

**Acceptance:** Pill/Capsule is an explicit shape variant separate from normal radius; Destructive/Danger is formal and not conflated with hierarchy; Success/Warning button semantics are only added if existing evidence justifies them; loading prevents duplicate action, preserves dimensions, distinguishes loading from disabled, supports spinner+label and accessible spinner-only use; Primary remains scarce.

**Depends on:** `V2-003`, `V2-011`.

---

# Integration

## V2-026 — First-week Integration Acceptance / V2 RC Readiness

**Status:** BLOCKED  
**Branch:** `chore/v2-026-week1-integration`  
**Goal:** integrate the first-week cards, resolve catalog/promotion edges, and produce the evidence package for Mira's formal V2 first-stage judgment.

**Must Read:** all merged V2 cards, `v2-prd.md`, governance PRD.

**Owned entry points:** integration-only catalog/index/manifest updates that could not safely be owned by parallel cards; no feature redesign.

**Acceptance evidence must include:**
- Source Integrity pass;
- Component + Platform + canonical-model schemas pass;
- Android/iOS/Web usable adapter evidence;
- Mini Program generated minimum adapter path;
- Platform Environment, Motion, Layout/Input contracts;
- AI machine consumption path;
- Penpot downstream build;
- deterministic CI evidence artifact;
- representative cross-platform smoke;
- navigation/search/filter/loading/feedback/Button hardening cards merged and validated;
- `npm test`, `npm run validate`, `npm run build:all` green from final integration HEAD;
- accepted human report unchanged;
- known residuals explicitly separated into post-week-one backlog, not hidden as “done”.

**Release rule:** successful evidence makes the branch **eligible** for Mira judgment. It does not auto-release or auto-merge to `main`.

**Depends on:** `V2-001` through `V2-025`.

---

## Coordinator notes

### Recommended parallel batches

**Batch A — start immediately (5 lanes)**

`V2-001`, `V2-002`, `V2-003`, `V2-004`, `V2-013`.

**Batch B — after first foundations merge**

`V2-005`, `V2-010`, `V2-011`, `V2-012`, then `V2-024` when V2-003 lands.

**Batch C — platform/consumer fan-out**

`V2-006`, `V2-007`, `V2-008`, `V2-009`, `V2-014`, `V2-015`, `V2-020`, `V2-021`, `V2-022`, `V2-023`, `V2-025` as their dependencies clear.

**Batch D — gates and integration**

`V2-016`, `V2-017`, `V2-018`, `V2-019`, then `V2-026`.

### Merge/race policy

- Never let two active Builders own `tooling/src/adapters.mjs`, `tooling/bin/validate.mjs`, `.github/workflows/design-system-build.yml`, `design-source/SKILL.md`, or the same component JSON/preview.
- After a schema/model card merges, downstream work must rebase and rerun its focused validation before review.
- A Builder may add a missing test fixture outside its owned path when necessary, but must report the extra file before merge if another active card also owns that area.
- Generated output diffs are evidence, not the place to hand-fix behavior.
- Mira reviews observations/evidence first, then decides approve/revise/reject; CI green is necessary but not sufficient.

## Deferred from first-stage blocking scope

Accordion, Index Bar and other lower-priority confirmed/candidate additions remain valid V2 backlog, but they do **not** block `V2-026` unless a first-week consumer proves they are required for the core cross-platform architecture. This preserves the PRD rule: finish the skeleton first; continue adding coverage after it can be safely consumed.
