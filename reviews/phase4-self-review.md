# Phase 4 Self Review — Feedback, Overlay & Progress

Status: **self-review passed with corrections applied**

This is an author self-check. Independent review remains deferred until the full V1 system is complete.

## Scope checked

- Company-level scope boundary vs product/domain-specific patterns
- `docs/01-foundations.md`
- `docs/04-feedback-overlay-progress.md`
- `docs/04b-search-menu.md`
- `tokens/tokens.json`
- `contracts/feedback-overlay-progress.json`
- `contracts/search-menu.json`
- Feedback hierarchy and interruption cost
- Dialog / Bottom Sheet stacking and dismissal rules
- Loading vs Skeleton vs Empty State role separation
- Progress vs Stepper vs Timeline role separation
- Search input vs Search Pattern boundary
- Menu / Overflow / Context action boundary
- Status semantics and accessibility
- Token reference discipline

## Blocking issues found and corrected

### 1. Core scope was still too tied to the first product family

Earlier wording described the design system as if it existed specifically for the “三创赛” product and treated competition rhythm as a core visual responsibility.

Correction:

- Foundation now defines Com Design Mobile as a company-level mobile design system.
- The current product family is documented as a consumer, not the owner of Foundation semantics.
- Domain-specific stages, ranking, scoring, themed progress and other business motifs are moved behind the Product / Domain Extension boundary.
- Roadmap Phase 4 was renamed from `Feedback, Overlay & Competition Patterns` to `Feedback, Overlay & Progress`.

### 2. Overlay components had no explicit elevation semantic

Dialog, Bottom Sheet and transient floating feedback need a real layer distinction, but the Foundation only described elevation conceptually.

Correction:

Added:

- `primitive.shadow.floating`
- `primitive.shadow.modal`
- `semantic.light.elevation.floating`
- `semantic.light.elevation.modal`

Ordinary Card / Section / List Item remain flat; this does not reintroduce generic surface shadows.

### 3. Transient feedback initially misused a text semantic as a background

The first machine contract used `color.text.primary` as the dark Toast / Snackbar surface. The resolved color looked acceptable, but the semantic role was wrong.

Correction:

Added `color.surface.inverse → primitive.color.neutral.800` and changed Toast / Snackbar to use the surface role. Text continues to use `color.text.inverse`.

### 4. Stepper Completed and Current were visually under-distinguished

Both initially used the same Brand-filled node, relying mostly on text to distinguish them.

Correction:

- Completed: Brand filled node + inverse check mark.
- Current: default surface + Brand border + Brand inner dot.
- Upcoming: neutral border.
- Error: Danger border + explicit error mark.

State is no longer color-only and current/completed remain distinguishable in dense layouts.

### 5. Feedback strength could easily drift into modal overuse

Correction:

The human and machine specs now encode an explicit interruption hierarchy:

`field/local → inline alert → banner → toast/snackbar → dialog`

Dialog is reserved for decisions/blocking short tasks, not generic importance.

### 6. Loading / Empty / Progress roles needed hard boundaries

Correction:

- Spinner = indeterminate work where structure/progress is not useful.
- Skeleton = known structure waiting for data.
- Empty State = zero-content / no-results / recovery state.
- Progress = truthful determinate progress only.
- Stepper = finite user task progression.
- Timeline = chronological event history.

This avoids one “loading/status” component growing into unrelated behaviors.

### 7. Search / Search Field was a missing Core component

A generic Input contract is insufficient for query-driven interfaces.

Correction:

- Added Search Field as a standalone Core component.
- Added Search Pattern composition for Recent / Suggestion / Results / No Results / Recoverable Error.
- Search uses a flat subtle surface rather than blindly inheriting outlined Input.
- No Results is a search-context state, not a disabled control or whole-product Empty State.

### 8. Search loading initially displaced Clear

The first gap-closure draft placed loading in the trailing slot ahead of Clear. That would make a non-empty query harder to cancel precisely while the request is active.

Correction:

- Loading uses the leading slot and replaces the Search icon.
- Clear remains available for a non-empty query.
- Keyboard / external-input focus explicitly uses `color.border.focused + border.focus`.
- Visual Search height and platform hit area remain independent.

### 9. Overflow had a trigger but no receiving component

Top App Bar already allowed Overflow, but the system had no Menu contract.

Correction:

- Added Menu family: Action Menu / Overflow Menu / Context Menu.
- Added Menu Item state contract.
- Destructive items use danger semantics without becoming filled red rows.
- Mobile default explicitly rejects cascading desktop-style multilevel menus.
- A blocking Dialog / Sheet opens only after the Menu closes.

## Accessibility checks

- Toast / Snackbar require assistive announcement; critical information cannot depend on auto-dismiss.
- Dialog / Bottom Sheet require modal reading/focus behavior and safe focus return.
- Skeleton blocks are hidden individually; the parent exposes busy/loading state.
- Progress exposes determinate value when determinate.
- Stepper and Status Composition cannot rely on color alone.
- Search Clear and icon-only Menu triggers require accessible names.
- Menu trigger exposes expanded / relationship state; selected/disabled items expose their state.
- Reduced Motion disables unnecessary skeleton shimmer; final motion values remain Phase 5 work.

## Contrast spot-checks

Current light-theme values provide strong contrast for inverse transient feedback:

- `color.text.inverse` (#FFFFFF) on `color.surface.inverse` (#252B3D): high contrast.
- Accent action (#16BFD3) on inverse surface: suitable for Snackbar action emphasis.
- Main status icon colors are treated as non-text visual signals and always have a text/accessible equivalent.

Full automated contrast matrix remains a Phase 5 release gate.

## Non-blocking items intentionally deferred to Phase 5

- Exact motion duration / easing / spring policy
- Reduced Motion token mapping
- Complete automated contrast matrix
- Dark theme elevation/scrim tuning
- Platform-specific overlay animation and native behavior mapping
- Final Product / Domain Extension package format
- Search debounce / ranking / suggestion algorithms remain implementation or product policy
- Menu placement algorithm remains implementation-owned as long as the placement contract is respected

## Self-review result

**PASS after corrections.**

Phase 4 Core remains company-level and can be consumed by different product families without importing one product's business model into the shared system. Search and Menu close two high-frequency V1 Core gaps without expanding into product-specific behavior.
