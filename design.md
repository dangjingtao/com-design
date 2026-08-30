# Com Design — Design System Guide

> **Status:** Release Candidate (`1.0.0-rc.2`)  
> **Scope:** Company Mobile Core  
> **Platforms:** iOS / Android, with Tailwind / NativeWind / React Native consumers  
> **Last updated:** 2026-08-30

`design.md` is the canonical human-facing entry point for using Com Design correctly.

It summarizes the system's design language, architecture, usage rules, accessibility requirements, component model, composite model, UX Pattern model, and governance. It does **not** replace the structured source files under `design-source/`; when exact token values, component variants, composite behavior, or machine-readable contracts are needed, those source files remain authoritative.

---

## 1. Normative language

- **MUST** — required for Core compliance.
- **MUST NOT** — prohibited in Core and product implementations.
- **SHOULD** — default practice; deviate only with a documented product or platform reason.
- **MAY** — optional and context-dependent.

When rules conflict, use this priority order:

1. Accessibility and platform safety.
2. User-task clarity and interaction correctness.
3. Semantic consistency with Com Design.
4. Platform convention.
5. Visual preference or decoration.

---

## 2. Purpose and scope

Com Design Mobile is the shared visual and interaction foundation for company mobile products. It is not owned by a single business application.

The system exists to make product UI:

- consistent across products;
- predictable across iOS and Android;
- fast to design and implement;
- accessible by default;
- maintainable through semantic tokens and explicit contracts;
- consumable by designers, engineers, Penpot, build tooling, and AI agents from the same source of truth.

Product teams MAY extend Com Design for domain-specific needs, but **Product Extension MUST NOT mutate Core semantics or redefine existing Core tokens/components/composites in place**.

---

## 3. Source of truth and authority

`design-source/` is the only editable design-system source of truth.

### 3.1 Authoritative sources

| Need | Source |
| --- | --- |
| Design context, principles, usage narrative | `design-source/README.md` |
| Structured token understanding | `design-source/css.json` |
| Runtime token variables, themes, density, platform and motion | `design-source/colors_and_type.css` |
| Core Component catalog | `design-source/components/index.json` |
| Exact Core Component contract | `design-source/components/{slug}.json` |
| Human-readable Core Composite Component guidance | `design-source/COMPOSITE_COMPONENTS.md` |
| Canonical Core Composite Component contracts | `design-source/specs/core-composites.json` |
| Composite visual / interaction reference | `design-source/preview/core-composite-components.html` |
| Human-readable Core UX Pattern guidance | `design-source/UX_PATTERNS.md` |
| Canonical Core UX Pattern contracts | `design-source/specs/core-patterns.json` |
| UX Pattern visual reference | `design-source/preview/core-ux-patterns.html` |
| Structured system model and governance | `design-source/specs/design-system-v1.json` |
| Visual/DOM reference for a Core Component | `design-source/preview/component-{slug}.html` |
| Penpot workflow | `design-source/PENPOT_MCP_PLAYBOOK.md` |
| Build/output contract | `design-source/BUILD_PIPELINE.md` |

Recommended read order for implementation work:

```text
design.md
-> design-source/README.md
-> design-source/css.json
-> design-source/colors_and_type.css
-> design-source/components/index.json
-> design-source/components/{slug}.json
-> design-source/COMPOSITE_COMPONENTS.md when a stable multi-component assembly is needed
-> design-source/specs/core-composites.json for exact Composite contracts
-> design-source/preview/core-composite-components.html for interaction reference
-> design-source/UX_PATTERNS.md when states / hierarchy / flow span multiple components or pages
-> design-source/specs/core-patterns.json for exact Pattern contracts
-> design-source/preview/component-{slug}.html
```

### 3.2 Generated artifacts are never upstream sources

The following are downstream outputs or acceptance artifacts:

```text
Penpot assets / manifest
human reports
Tailwind preset/theme
NativeWind preset/theme
React Native tokens
```

They MUST NOT become upstream token or contract sources. If generated output is wrong, fix `design-source/` or its adapter/compiler.

---

## 4. Design character

Com Design is:

**Modern / Clear / Light / Efficient**

The default posture is:

- **Compact-first** — information-dense mobile UI without cramped interaction targets.
- **Flat-first** — hierarchy comes from spacing, typography, color, border and surface before shadow.
- **Information hierarchy before decoration** — visual treatment serves comprehension and action.
- **Section before Card** — grouping does not automatically require a container.
- **Semantic before literal** — consume semantic roles instead of hard-coded primitive values.
- **Platform-aware, not platform-fragmented** — share semantics, adapt physical behavior where needed.

Interfaces SHOULD feel restrained, quick, structured and slightly technical rather than playful or ornamental.

**Brand color is a scarce hierarchy signal.** A screen MAY contain many actions, but it SHOULD contain very few brand-filled regions. Importance, clickability and brand-color area are separate decisions.

Core UI MUST NOT default to gradients, glow effects, heavy glassmorphism, decorative shadows on ordinary content, card-per-section layouts, repeated brand-filled actions, arbitrary one-off values, or critical states communicated by color alone.

---

## 5. System architecture

Com Design uses six design layers:

```text
Primitive -> Semantic -> Component -> Composite Component -> UX Pattern -> Product Extension
```

### 5.1 Primitive

Raw design values such as palette steps, base dimensions and size values. Product code SHOULD NOT consume Primitive directly when a Semantic role exists.

### 5.2 Semantic

Meaning-based roles such as `primary`, `background`, `surface`, `border`, `success`, `warning`, `danger`, `info`, `text-primary`, and `text-secondary`.

Semantic tokens are the preferred product-facing interface.

### 5.3 Core Component

A Core Component is an independent control or information unit with stable anatomy, states, variants and interaction semantics.

Examples: Button, Tabs, List Item, Dialog, Search Field.

A component MUST reference Semantic / Component roles rather than reach directly into primitive palette values unless its source contract explicitly defines an exception.

### 5.4 Core Composite Component

A Composite Component is a **stable, directly reusable assembly** built from Core Components.

It belongs in Core when:

- its anatomy is stable across products;
- interaction and state ownership can be explicitly contracted;
- it has a clear component identity / API / slots;
- products consume it as the same assembly rather than merely sharing an abstract UX rule;
- it does not require product-domain names, routes, business copy or business-specific state enums.

Current Core Composite Components:

- `carousel` — Carousel / 轮播
- `filterBar` — Filter Bar / 筛选栏
- `tabbedActionBar` — Tabbed Action Bar / 标签导航操作栏
- `groupedList` — Grouped List / 分组堆叠列表

Canonical source: `design-source/specs/core-composites.json`. Human guidance: `design-source/COMPOSITE_COMPONENTS.md`.

Composite Components **do not increase the 33 Core Component count**; they are tracked separately.

### 5.5 UX Pattern

UX Patterns describe recurring task, state, hierarchy, sequence, context and handoff rules. A Pattern may have more than one valid visual implementation.

Current Core UX Patterns:

- `statusComposition`
- `searchPattern`
- `collectionFilter`
- `stateToAction`
- `intentContinuity`
- `contextualNextStep`

Canonical source: `design-source/specs/core-patterns.json`. Human guidance: `design-source/UX_PATTERNS.md`.

A Pattern SHOULD be promoted to Core only when its intent and behavior remain reusable without product-domain names, page names or business-specific state enums.

### 5.6 Product Extension

Product-specific components, themes and compositions MAY be added above Core. Extensions MUST preserve existing Core meaning and MUST NOT silently redefine an existing Core contract.

### 5.7 Quick boundary test

```text
Is it an independent control / information unit?
  -> Core Component candidate

Is it a stable, directly reusable assembly with fixed-ish anatomy and interaction?
  -> Core Composite Component candidate

Is the real problem state / hierarchy / sequence / context / handoff, with multiple valid visual forms?
  -> UX Pattern candidate

Does it require business names, routes, domain states or product copy?
  -> Product Extension
```

---

## 6. Mode axes

| Axis | Default | Supported |
| --- | --- | --- |
| Theme | light | light / dark |
| Density | compact | compact / comfortable |
| Platform | product-selected | iOS / Android |
| Motion | standard | standard / reduced |

Resolution conceptually follows:

```text
foundation
-> theme
-> density
-> platform
-> motion
-> component
-> composite component
-> UX pattern
-> product extension
```

Do not duplicate an entire component/composite when a token or platform-behavior override is sufficient.

---

## 7. Foundations

### 7.1 Color

Primary brand color is **Electric Indigo `#5B5EF7`**. It is used for the highest-priority action, active navigation, focus, links and selected-state emphasis.

Accent Cyan `#16BFD3` is **not a second primary color**. Reserve it for local emphasis, progress, data visualization and small informational signals.

Secondary Action and common Info containers prefer neutral subtle surfaces so Brand remains available for true hierarchy emphasis. Default Border uses the quieter neutral hierarchy; Placeholder remains visually below secondary text.

Critical state MUST NOT be communicated through color alone. Pair status color with readable text and, when useful, icon shape.

Dark mode is a semantic remapping, not RGB inversion.

### 7.2 Typography

Base stack:

```text
system-ui, -apple-system, Segoe UI, Roboto, sans-serif
```

Supported roles:

| Role | Size / line height | Weight |
| --- | --- | --- |
| caption | 12 / 18 | 400 |
| label-small | 12 / 16 | 500 |
| body-small | 14 / 20 | 400 |
| label | 14 / 20 | 500 |
| body | 16 / 24 | 400 |
| heading-small | 16 / 22 | 600 |
| heading | 18 / 24 | 600 |
| title | 24 / 30 | 600 |
| display | 28 / 36 | 600 |

Body SHOULD use 400, labels 500, headings 600. Do not invent intermediate sizes without extending the token system.

### 7.3 Spacing and layout

Supported spacing values:

```text
0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32
```

Use `12–16` for internal grouping, `24–32` between sections, and `16` as the default content inset when no component/composite contract specifies otherwise.

### 7.4 Density and touch targets

Default visual density is compact: standard control height `40`, large control `48`. Visual size and hit target are separate concepts.

Interactive hit targets MUST respect platform expectations:

- iOS: design toward `44 x 44pt` interaction regions;
- Android: use at least `48 x 48dp` targets.

A visible 6px carousel indicator therefore MUST NOT become a 6px hit target.

### 7.5 Radius

```text
4px   small/detail
8px   controls
12px  containers
16px  overlays
pill  compact tags/badges/progress ends
```

### 7.6 Borders and elevation

Core border widths are `1px` normal and `2px` focus emphasis. Prefer semantic border roles.

Com Design is flat-first. Ordinary cards, buttons, list items and composite surfaces MUST NOT receive decorative default shadow. Elevation is reserved for genuinely floating or modal layers.

### 7.7 Iconography

Core icon visual sizes are `16 / 20 / 24`. Keep one icon family per product surface and give icon-only actions accessible names.

### 7.8 Motion

Standard motion:

```text
fast      120ms
standard  220ms
slow      320ms
```

Motion SHOULD explain state or spatial relation, not decorate. Reduced Motion MUST have a safe path.

---

## 8. Content design

Com Design UI copy is Chinese-first, professional, restrained and information-dense.

Prefer specific verb-first labels such as `确认提交`, `保存修改`, `查看详情`, `重新加载`.

Avoid vague labels when a specific action is available. Errors SHOULD tell users what to do next. Status text MUST be independently understandable.

Core UI SHOULD NOT use emoji as interface decoration, unnecessary exclamation marks, marketing language inside task flows, or cute filler phrases that reduce clarity.

---

## 9. Component model

Com Design V1 currently contains:

```text
33 Core Components
4 Core Composite Components
6 Core UX Patterns
```

### 9.1 Actions & Forms — 8

Button · Icon Button · Input / Text Field · Textarea · Select / Picker Trigger · Checkbox · Radio · Switch

### 9.2 Navigation & Information — 11

List Item · Tabs · Segmented Control · Top App Bar · Bottom Navigation · Section · Divider · Card · Tag · Badge · Avatar

### 9.3 Feedback / Overlay / Progress — 11

Toast · Snackbar · Alert / Inline Banner · Dialog · Bottom Sheet · Loading Indicator · Skeleton · Empty State · Progress Indicator · Stepper · Timeline

### 9.4 Search & Menu — 3

Search Field · Menu · Menu Item

### 9.5 Core Composite Components — 4

```text
Carousel
Filter Bar
Tabbed Action Bar
Grouped List
```

Before inventing a product-local wrapper such as `MobileFilter`, `SettingsCard`, `TabbedHeader` or `Carousel`, read `COMPOSITE_COMPONENTS.md` and `specs/core-composites.json`.

### 9.6 Core UX Patterns — 6

```text
Status Composition
Search Pattern
Collection Filter
State to Action
Intent Continuity / Handoff
Contextual Next Step
```

### 9.7 Contract rules

A mature Core Component definition SHOULD cover purpose, anatomy, variants, states, token references, content, accessibility and prohibited invention.

A mature Composite definition SHOULD additionally define participating Core Components, state ownership, interaction boundaries, responsive behavior, focus/touch behavior and relationship to UX Patterns.

A mature UX Pattern SHOULD define reusable intent, task state/hierarchy/sequence rules, avoid-cases and authoritative state boundaries without fixing every screen to one anatomy.

Do not add a new Core Component merely to hide a few lines of composition. Conversely, do not leave a proven stable assembly as a vague Pattern merely to keep counts small.

### 9.8 State completeness

Interactive UI SHOULD account for relevant states such as default, pressed, focused, selected, loading, disabled, read-only, error and expanded/collapsed.

Do not use `disabled` to mean `read-only`.

### 9.9 Primary action hierarchy

A view or action group SHOULD normally have one highest-priority Primary action.

Use:

- **Primary** — the strongest next step in the current action group;
- **Secondary** — visible supporting action with neutral subtle surface;
- **Tertiary / text** — low-emphasis or auxiliary action;
- **Destructive** — destructive or difficult-to-recover action only.

A nested action group may have its own Primary. Example: the page-level Filter Trigger is not Primary, but inside an open filter sheet the **Apply** action MAY be the sheet's single Primary while Reset remains Tertiary.

---

## 10. Composite and page composition

### 10.1 Section before Card

Use `Section` as the default grouping mechanism. Add a `Card` only when content needs stronger containment or independent interaction.

### 10.2 Grouped List

For settings, service entrances and related destinations, prefer **one shared Grouped List surface** over card-per-row layouts.

- Navigation row: whole row is the activation target; Chevron is direction feedback, not a tiny independent button.
- Switch row: do not also show a Chevron by default.
- Divider: subtle and may begin at the content column.
- Leading icon container: neutral by default; do not paint every row with Brand tint.
- Pressed / focus feedback belongs to the whole row surface.

### 10.3 Navigation and Tabbed Action Bar

- Global active navigation uses Brand Indigo.
- Bottom Navigation SHOULD contain 3–5 primary destinations.
- Tabs are for sibling views, not unrelated top-level destinations.
- Segmented Control is for short local mode switching.
- When sibling Tabs need local Search / Filter / More actions, use **Tabbed Action Bar** rather than creating a one-off toolbar.
- On common narrow mobile widths, keep at most **two local utility actions inline**. Move additional actions to Overflow or a more appropriate Top App Bar before shrinking Tab labels or touch targets.
- Global actions such as account-wide notifications SHOULD remain in Top App Bar rather than being repeated inside each local Tabs row.
- Tab selection updates immediately; async content loading belongs below the navigation row.

### 10.4 Filter Bar + Collection Filter

`Filter Bar` is the preferred stable Composite for many `Collection Filter` scenarios.

```text
optional query
+ filter trigger / active count
-> draft sheet
-> Apply
-> active condition feedback
-> result feedback
```

Committed filter truth belongs to the collection owner. A sheet/dialog may own temporary draft state. Dismissing without Apply MUST NOT mutate committed state.

### 10.5 Carousel

Carousel is manual-first:

- Autoplay is off by default.
- If enabled, use a slow interval (normally at least 5 seconds), pause after user interaction/focus, and provide stop/pause when continuing motion requires it.
- Reduced Motion collapses nonessential movement or autoplay.
- Swipe / scroll-snap MUST work without autoplay.
- Visual indicator size and hit target are separate.
- Overlay controls MUST NOT obscure meaningful slide content.
- Do not combine a full-card link with overlapping nested actions.

### 10.6 Overlay discipline

Only one blocking modal layer SHOULD be active at a time. Avoid Dialog-on-Dialog or Bottom-Sheet-on-Dialog stacks.

### 10.7 Loading, empty and error states

- short indeterminate wait -> Loading Indicator;
- known structure loading -> Skeleton;
- no content/results -> Empty State;
- recoverable inline problem -> Alert / field error;
- brief operation result -> Toast / Snackbar according to action requirements.

Do not use one generic empty state to hide network, permission and zero-result differences.

### 10.8 Core UX Pattern application

Use the six Core UX Patterns when the problem is primarily task behavior rather than one stable assembly:

- **Status Composition** — state + explanation + optional evidence/recovery;
- **Search Pattern** — query + result state + intent preservation;
- **Collection Filter** — committed truth + draft editing + active condition feedback;
- **State to Action** — authoritative state determines the strongest available action;
- **Intent Continuity / Handoff** — preserve original task across interruptions;
- **Contextual Next Step** — preserve context and derive one meaningful next step.

---

## 11. Accessibility baseline

Use **WCAG 2.2 Level AA as the cross-platform measurable baseline where applicable**, plus native iOS/Android conventions.

### 11.1 Perceivable

- Normal text SHOULD reach at least `4.5:1` contrast.
- Large text MAY use the applicable `3:1` threshold.
- Important non-text boundaries/states SHOULD reach applicable `3:1` contrast.
- Information MUST NOT rely on color alone.
- Light and dark themes require rendered audits.

### 11.2 Operable

- Respect platform touch targets.
- Custom controls provide pressed / selected feedback.
- Keyboard/focus-capable targets expose visible focus where supported.
- Sticky bars, overlays and sheets MUST NOT obscure focus.
- Drag-only interaction SHOULD provide a non-drag alternative where practical.
- Carousel navigation MUST have an alternative to dragging.

### 11.3 Understandable and robust

Controls expose correct accessible role, name, state and value. Labels/errors should be specific. Navigation behavior should remain consistent.

### 11.4 Reduced motion and text scaling

Respect reduced-motion preferences. Test text scaling without loss of critical content or function. Avoid fixed-height text containers that clip accessible sizes.

---

## 12. Cross-platform implementation

Source `px` values are logical design units. Adapters map them to CSS px, React Native layout units, platform-safe-area behavior and native interaction conventions.

Platform-specific concerns belong in adapters/implementation, including safe areas, native elevation, keyboard avoidance, back behavior, accessibility scaling and gestures.

Product code SHOULD prefer generated semantic vocabulary such as `bg-primary`, `bg-background`, `text-foreground`, `border-border`, `rounded-control`, and `h-control` over raw primitives.

---

## 13. Governance

### 13.1 Core modification rules

Core changes MUST be made in `design-source/` and validated before generated outputs are promoted.

Current policies include:

- Component-to-Primitive references forbidden by default;
- Product Extensions cannot mutate Core;
- critical state cannot be color-only;
- Brand-filled area is a hierarchy resource;
- ordinary surfaces receive no default shadow;
- blocking modal stack depth is one;
- deprecation required before removal;
- unused token creation forbidden by default;
- literal geometry retained only when no stable reusable semantic role exists.

### 13.2 Adding or changing a Core Component

A Core Component change SHOULD include contract update, token references, representative Preview, relevant mode behavior, accessibility behavior, build/validation impact and human-readable documentation.

Behavior-heavy components MUST NOT be blindly generated from JSON contracts.

### 13.3 Adding or changing a Core Composite Component

A Composite change SHOULD include:

1. proof that the assembly is reusable across products;
2. stable anatomy and participating Core Components;
3. explicit state ownership and interaction contract;
4. responsive / platform / touch / focus behavior where relevant;
5. avoid-cases preventing business leakage or ambiguous hit areas;
6. human-readable update in `design-source/COMPOSITE_COMPONENTS.md`;
7. machine-readable update in `design-source/specs/core-composites.json`;
8. interactive Preview when behavior matters;
9. validation against at least one realistic composition before stable promotion.

Composites MUST NOT encode product routes, page names, domain copy or business-specific state enums.

### 13.4 Adding or changing a Core UX Pattern

A Pattern change SHOULD include reusable intent, participating components/composites, task/state/hierarchy/sequence rules, avoid-cases, human and machine guidance, and realistic multi-state validation.

Patterns MUST NOT be counted as Core Components or used to smuggle product objects into Core.

### 13.5 Versioning

`dev` is the integration/verification branch. `main` represents stable design-system release. Release candidates MUST pass release gates before stable promotion.

---

## 14. Build and documentation policy

The system follows one source, multiple sibling outputs:

```text
design-source/
   +-> human docs
   +-> Penpot manifest
   +-> Tailwind adapter
   +-> NativeWind adapter
   +-> React Native tokens
```

Human-readable reports are first-class acceptance evidence and MUST NOT be silently deleted by engineering builds.

Current repository-level commands include:

```bash
npm test
npm run validate
npm run build:engineering
npm run build:penpot
npm run build:all
```

A design-system change is not complete merely because a Preview looks correct; source validation and affected target builds must also succeed.

---

## 15. Definition of done

Before considering a Core design change complete, verify:

- [ ] The change solves a real reusable design need.
- [ ] Existing Semantic Tokens / Core Components were reused where appropriate.
- [ ] A stable multi-component assembly uses an existing Composite or documents why a new Composite is needed.
- [ ] Multi-state / multi-page task logic uses an existing UX Pattern or documents why a new Pattern is needed.
- [ ] No product-specific route, page name, business copy or domain state leaked into Core.
- [ ] Light/dark, compact/comfortable and iOS/Android implications were considered where relevant.
- [ ] Motion has a Reduced Motion path where relevant.
- [ ] Component / Composite anatomy and interaction states are complete.
- [ ] Touch targets remain safe even when visual affordances are smaller.
- [ ] Text, icons and color do not carry critical meaning through color alone.
- [ ] Primary / Brand-fill is limited to genuinely dominant actions or selected emphasis.
- [ ] Product UI consumes semantic rather than primitive values.
- [ ] No unnecessary gradient, glow, shadow, oversized card or invented radius was introduced.
- [ ] Structured source and relevant contracts are updated before downstream artifacts.
- [ ] Validation/build checks pass.
- [ ] Human documentation remains consistent and historical accepted reports remain intact.

---

## 16. Fast decision rules

```text
Need grouping?                -> Section first; Card only when stronger containment is needed.
Need related settings/rows?   -> Grouped List; one shared surface, whole-row navigation, no Chevron+Switch ambiguity.
Need sibling Tabs + tools?    -> Tabbed Action Bar; narrow mobile keeps <=2 local utilities inline, overflow the rest.
Need a carousel?              -> Carousel; manual-first, autoplay off by default, large hit targets, Reduced Motion path.
Need search + mobile filters? -> Filter Bar + Collection Filter; collection owns committed truth, sheet owns draft.
Need primary action?          -> Brand Indigo, normally one dominant action per view/action group.
Need supporting action?       -> Secondary neutral surface; Tertiary/text when less emphasis is enough.
Need status?                  -> Status Composition; readable text first, semantic color reinforcement second.
Need search task logic?       -> Search Pattern; preserve query and distinguish loading/zero/error.
Need state-dependent CTA?     -> State to Action; explain state and expose one strongest available action.
Need login/external hop?      -> Intent Continuity; preserve safe return and map result back to existing state.
Need long workflow?           -> Contextual Next Step; preserve context and derive one meaningful next step.
Need spacing?                 -> Use existing spacing tokens; do not invent arbitrary intermediate values.
Need radius?                  -> 8 control / 12 container / 16 overlay.
Need depth?                   -> Border/surface first; shadow only for floating/modal layers.
Need smaller visuals?         -> Keep the platform hit target large enough.
Need dark mode?               -> Semantic remap, never naive inversion.
Need a product-specific UI?   -> Product Extension; do not mutate Core.
```

---

## 17. References

External standards are engineering/accessibility references rather than visual templates:

- Design Tokens Community Group — Format Module 2025.10: https://www.designtokens.org/TR/2025.10/format/
- W3C — WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Apple Human Interface Guidelines — Accessibility / Dark Mode
- Android Developers — Accessibility

Repository-specific Com Design contracts remain authoritative over generic external styling guidance.
