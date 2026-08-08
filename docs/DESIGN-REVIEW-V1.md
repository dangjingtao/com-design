# Com Design Mobile — Design System V1 Review

Version: **1.0.0-rc.1**  
Audience: **Design Lead / Project Lead**  
Purpose: **Design Review, not executive sales presentation**

> Canonical truth remains `contracts/design-system-v1.json` and the files it references. This review document explains the system for human judgement; it does not introduce new design rules.

## Review question

This review should make it possible to decide whether Com Design Mobile V1 is coherent enough to move from Release Candidate toward Stable.

The review is organized around six questions:

1. What does the system actually look and feel like?
2. Why is the language compact, flat and section-led?
3. Do common interaction patterns remain coherent when components are composed?
4. Does the system model scale across theme, density, platform and motion without duplicating components?
5. Do realistic mobile compositions still look like one design language?
6. What remains unresolved before Stable?

---

## 1. Visual language

### Direction

The intended tone is **Modern / Clear / Light / Efficient**, with a restrained younger character.

The system deliberately avoids:

- heavy enterprise SaaS blue-grey;
- government / education-system visual weight;
- neon gaming / cyberpunk styling;
- soft, creamy, childlike rounded-card styling;
- card-and-shadow as the default information architecture;
- product-domain metaphors leaking into company Core.

### Color roles

**Brand — Electric Indigo**

Brand is the primary identity and action family. The key Light value is Brand 500 `#5B5EF7`; Brand 600 `#494CE0` supports stronger text/link contrast; Brand 700 `#393BBE` handles pressed/deeper brand expression.

Brand owns:

- primary action;
- key selection;
- global navigation active identity;
- Info semantics where a separate duplicated blue family is unnecessary.

**Accent — Cyan**

Accent 500 `#16BFD3` is deliberately subordinate to Brand. It can support local emphasis, progress, data visualization and constrained product patterns. It is **not** the default CTA, global navigation active color or a fifth status family.

**Status**

Success / Warning / Danger each resolve through background, main signal and text semantics. Info reuses the Brand family. Color cannot be the only signal.

### Typography

V1 uses the system sans-serif stack. Brand character is not dependent on a custom font.

Core roles:

| Role | Size / line-height | Weight |
| --- | --- | --- |
| Caption | 12 / 18 | Regular |
| Label Small | 12 / 16 | Medium |
| Body Small | 14 / 20 | Regular |
| Label | 14 / 20 | Medium |
| Body | 16 / 24 | Regular |
| Heading Small | 16 / 22 | Semibold |
| Heading | 18 / 24 | Semibold |
| Title | 24 / 30 | Semibold |
| Display | 28 / 36 | Semibold, used sparingly |

High information density is not achieved by globally shrinking text. Hierarchy is produced by type role, color, spacing and grouping together.

### Spacing and density

Primitive spacing is intentionally finite: `0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32`.

Compact is the default mode:

- control: 40;
- large control / row baseline: 48;
- horizontal padding: 12;
- vertical padding: 8;
- internal gap: 8;
- page inset: 16;
- section gap: 20.

Comfortable increases geometry without changing component roles or color semantics:

- control: 44;
- large control / row baseline: 56;
- horizontal padding: 16;
- vertical padding: 12;
- section gap: 24.

### Radius and elevation

Shape follows role:

- Control: 8;
- Container: 12;
- Overlay / Sheet: 16;
- Pill: full.

The system is **Flat-first**. Ordinary information hierarchy should be built in this order:

1. typography;
2. spacing / grouping;
3. divider / border;
4. surface difference;
5. status / brand color.

Shadow is reserved for real floating relationships such as Menu, Dialog and Sheet. Card has no default shadow.

---

## 2. Design principles and their consequences

### Compact-first

Compact means efficient geometry, not reduced readability or smaller hit targets. Visual size and interactive hit area are independent. iOS uses a 44pt minimum touch target; Android uses 48dp.

**Consequence:** a 40px compact control can still satisfy the platform hit-target contract through an expanded interaction area.

### Flat-first

The system avoids using elevation as decoration.

**Consequence:** lists, sections and ordinary cards stay visually close to the page surface; elevation appears when a layer actually floats.

### Section-before-Card

Section is the default grouping mechanism. Card is used when content needs an independent container boundary.

**Consequence:** information-dense pages do not become a stack of rounded white boxes, and Card-inside-Card is prohibited by default.

### Brand / Accent / Status have different jobs

- Brand = identity, primary action, key selection, global navigation.
- Accent = local emphasis, progress/data, constrained product pattern use.
- Status = semantic outcome or risk.

**Consequence:** a cyan active tab, a warning-yellow category label and a red decorative divider are all suspect unless their semantic role justifies them.

### Core stays smaller than the vocabulary of UI

V1 intentionally does not include every familiar UI noun. Carousel, FAB, Data Table, Rich Text Editor and Navigation Rail are not Core simply because they exist elsewhere.

A new Core component must either be a clear foundational interaction or show stable cross-product reuse, and it must have a role / anatomy / states / accessibility / constraints contract.

---

## 3. System model

The canonical model is:

`Primitive → Semantic → Component → Pattern`

### Layer responsibilities

**Primitive** stores raw design values.  
**Semantic** gives stable cross-component roles such as `text.primary`, `surface.default`, `action.primary`, `status.warningText`.  
**Component** defines role, anatomy, states, geometry and constraints while consuming semantic roles rather than primitive values.  
**Pattern** composes components into repeatable interaction logic without mutating Core.

### Four orthogonal axes

**Theme** — Light / Dark  
Dark is a semantic overlay, not a second hand-maintained component set.

**Density** — Compact / Comfortable  
Changes geometry and rhythm, not semantic hierarchy.

**Platform** — iOS / Android  
Owns actual platform differences such as touch-target minimums, safe area and system dismissal conventions; it does not create two visual systems.

**Motion** — Standard / Reduced  
Motion communicates relationship and state. Reduced Motion removes non-essential animation and shimmer without removing state information.

### Resolution order

1. Foundation
2. Theme
3. Density
4. Platform
5. Motion
6. Component
7. Pattern
8. Product / Domain Extension

The system explicitly avoids combinatorial token sets such as `Dark-Compact-iOS-Reduced`.

---

## 4. Design patterns

### Form organization

Input / Textarea / Select share a Field Family structure:

`Label → Control → Helper / Error`

Field-level feedback is preferred. A field error does not become a Toast merely to attract attention. Read-only and Disabled remain distinct semantics.

V1 keeps one primary Input appearance: **Outlined / Flat**. Search deliberately does not inherit that appearance.

### Information hierarchy

List Item supports up to three information levels before restructuring is preferred. Leading / Content / Trailing establishes a stable reading rhythm. A row has at most one high-frequency trailing action.

Section is the normal grouping boundary. Divider is structural, not decorative. Card is reserved for independent containment.

### Navigation

- Bottom Navigation = top-level peer destinations, 3–5 items.
- Tabs = peer views within one information level; fixed 2–4, scrollable when more.
- Segmented Control = local mutually exclusive mode.
- Top App Bar = page hierarchy + a small number of high-frequency actions.
- Menu = contextual actions, not page IA.

Role differences come before visual differences.

### Search

Search Field is a query input, not an alias of generic Input.

It owns query entry, clear access and loading state. Recent queries, suggestions, result lists, no-results and recoverable errors belong to the Search Pattern.

Core keeps one trailing action slot by default, so loading cannot silently remove the user's ability to clear a non-empty query.

### Feedback hierarchy

From least to most interruptive:

`Field / Local Helper → Inline Alert → Banner → Toast / Snackbar → Dialog`

Feedback strength follows attention cost. Warning / Danger do not automatically imply modal blocking.

### Overlay

Only one blocking modal layer is allowed at a time. Dialog-on-Dialog and modal-Sheet-on-modal-Sheet are prohibited. A Menu closes before opening a blocking Dialog or Sheet.

### Loading / Empty / Error

- Loading Indicator = indeterminate work when structure or progress is unknown.
- Skeleton = known structure waiting for data; it mirrors real content rather than decorative bars.
- Empty State = zero-content or a recoverable state with an explicit next action.
- No Results = a Search-context state, not the whole-product empty state.

Existing usable content should normally be preserved during background refresh.

### Progress / Stepper / Timeline

- Progress Indicator = truthful determinate progress.
- Loading Indicator = indeterminate activity.
- Stepper = finite ordered task progression.
- Timeline = chronological event history.

These roles are intentionally not collapsed into one generic progress component.

### Status composition

Status is a pattern, not merely a colored pill.

It can compose text, icon, tag, dot, alert or section-level presentation. Business-specific names map into `neutral / info / success / warning / danger`; ranking, level, stage and category are not automatically status semantics.

---

## 5. Core catalogue

V1 declares **33 Core Components + 2 Core Patterns**.

### Actions & Forms — 8

Button / Icon Button / Input / Textarea / Select / Checkbox / Radio / Switch

### Navigation & Information — 11

List Item / Tabs / Segmented Control / Top App Bar / Bottom Navigation / Section / Divider / Card / Tag / Badge / Avatar

### Feedback / Overlay / Progress — 11

Toast / Snackbar / Alert / Dialog / Bottom Sheet / Loading Indicator / Skeleton / Empty State / Progress Indicator / Stepper / Timeline

### Search / Menu — 3

Search Field / Menu / Menu Item

### Core Patterns — 2

Status Composition / Search Experience

---

## 6. Composition review scenarios

The HTML review artifact uses neutral, non-business mobile compositions to judge whether the language survives assembly.

The scenarios are deliberately not product prototypes:

1. **Form** — section header, field family, inline error, primary / secondary action hierarchy.
2. **List / Search** — flat Search Field, result hierarchy, status/tag composition, no Card stack.
3. **Settings / Navigation** — Top App Bar, Section, List Item, Switch, Bottom Navigation.
4. **Feedback** — local Alert, Toast/Snackbar hierarchy and modal decision boundary.
5. **Dialog / Sheet / Menu** — real overlay elevation, restrained radius and single blocking-layer rule.
6. **Progress** — determinate progress, Stepper and Timeline shown as distinct semantic structures.
7. **Light / Dark** — same roles, different theme mappings rather than duplicated component logic.

The goal is not pixel-perfect implementation documentation. The goal is to expose whether the rules produce a coherent family under realistic composition.

---

## 7. Release Candidate: what is still imperfect

The current state is **Release Candidate**, not Stable.

### Must be resolved before Stable

According to the current release checklist, the remaining release blockers are:

- independent reviewer samples rendered iOS / Android typography and controls;
- independent verification of all manifest-referenced files, references and counts;
- PenPot Formal Spec updated to the V1 manifest;
- PenPot Light / Dark specimen verification;
- PenPot Compact / Comfortable specimen verification;
- reusable component asset status verified separately from spec visuals;
- exported `.penpot` audit passing overflow / `hideInViewer` / stale ref / duplicate / reusable metadata checks;
- independent review itself.

Author self-review cannot mark the release Stable.

### Known compromise / historical debt

The pre-release contracts historically use `semantic.light` as a logical namespace. V1 preserves that name for compatibility, and Dark applies an overlay before component resolution. This is an explicit compatibility contract rather than a statement that the system is Light-only.

This naming debt does not need to be churned immediately before Stable unless independent review finds that it creates real implementation ambiguity. It should remain visible rather than being disguised by the report.

### Not fully validated yet

- exhaustive real-device behavior across iOS / Android implementation environments;
- all dynamic-text enlargement scenarios beyond the documented baseline;
- adaptive behavior for tablet / foldable / wide layouts;
- every potential future product pattern using Accent or product brand overlays.

### Appropriate for later versions

- Carousel, FAB, Data Table, Rich Text Editor, Navigation Rail and other omitted capabilities, only after stable cross-product need is demonstrated;
- adaptive / pointer-platform expansion;
- migration away from the historical logical namespace if its benefit outweighs churn;
- additional Product / Domain Patterns that consume Core without changing it.

---

## 8. Review decision

A useful review should not ask whether the HTML looks polished enough. It should ask:

- Does the visual language remain recognizably one system across the composition scenarios?
- Are Compact-first and Flat-first helping information efficiency rather than making the UI feel cheap or cramped?
- Is Section-before-Card strong enough to prevent card inflation in product work?
- Are Brand / Accent / Status responsibilities clear enough to prevent local interpretation drift?
- Are navigation, feedback, overlay and progress roles semantically distinct enough for designers and engineers to use consistently?
- Is the four-axis model understandable enough to implement without duplicating components?
- Do the listed RC blockers represent verification work rather than unresolved design-language contradictions?

A Stable recommendation should only follow after the unchecked release gates are closed.

---

## Canonical sources used by this review

- `contracts/design-system-v1.json`
- `tokens/tokens.json`
- `tokens/theme-dark.json`
- `tokens/motion.json`
- `contracts/actions-forms.json`
- `contracts/navigation-information.json`
- `contracts/feedback-overlay-progress.json`
- `contracts/search-menu.json`
- `contracts/core-patterns.json`
- `docs/01-foundations.md`
- `docs/02-actions-forms.md`
- `docs/03-navigation-information.md`
- `docs/04-feedback-overlay-progress.md`
- `docs/04b-search-menu.md`
- `docs/05-systemization-release.md`
- `docs/DESIGN-SYSTEM.md`
- `docs/EXTENSIONS.md`
- `release/v1-checklist.md`

HTML review artifact: `report/design-system-v1/index.html`.