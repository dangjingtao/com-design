# Phase 3 Self Review — Navigation & Information

Status: **self-review passed with corrections applied**

This is an author self-check, not an independent second review. Independent review can be deferred until the full V1 system is assembled.

## Scope checked

- `docs/03-navigation-information.md`
- `contracts/navigation-information.json`
- Phase 2 Foundation / Semantic compatibility
- Navigation hierarchy: Tabs / Segmented / Top App Bar / Bottom Navigation
- Information hierarchy: List Item / Section / Divider / Card
- Supporting identity/status components: Tag / Badge / Avatar
- Brand vs Accent role discipline
- Compact density, touch area and text overflow assumptions
- Human-readable vs machine-readable consistency

## Blocking issues found and corrected

### 1. Card contract accidentally made border mandatory

Human spec says Card border is optional and only needed when containment requires reinforcement, but the first machine contract placed `color.border.subtle` directly in the default state.

Correction:

- Default Card now only requires `color.surface.default`.
- `color.border.subtle` moved to `optionalBorder` geometry.
- Flat-first remains the default; no Shadow is introduced.

### 2. Badge attention incorrectly borrowed Destructive Action semantics

The first machine contract used `color.action.destructive` for an attention Badge. That conflated “danger/attention status” with “destructive action”.

Correction:

- Attention Badge now uses `color.status.danger`.
- Destructive Action remains reserved for actions that destroy/remove data or state.

### 3. Text overflow rules were under-specified

High-density navigation fails quickly if labels wrap unpredictably or components silently shrink typography.

Correction:

The machine contract now defines shared overflow policy:

- Navigation labels are single-line and never shrink typography just to fit.
- List titles are single-line ellipsis by default.
- List descriptions allow up to two lines.
- Metadata remains single-line where possible.
- Tabs / Segmented labels stay single-line.
- Top App Bar title ellipsizes by default.

### 4. Bottom Navigation 56px could be misread as a cross-platform total height

Correction:

- 56px is explicitly the V1 **content band excluding safe area**.
- Platform layer may override it when the native platform pattern requires a different container geometry.
- Safe Area remains platform-owned.

### 5. Interactive Tag needed explicit hit-area policy

Tag may be visually 24–28px high, but a clickable filter Tag cannot inherit that as its interactive target.

Correction:

- Interactive Tag must expose role/state.
- Interactive Tag uses platform hit-area requirements independently from visual height.

### 6. Avatar accessibility was implicit

Correction:

Meaningful Avatar imagery must have an accessible name or adjacent identity text; decorative duplicate imagery should not create redundant announcements.

## Design checks that passed without Foundation changes

### Navigation hierarchy

Roles are intentionally separated:

- Bottom Navigation = top-level destinations
- Tabs = peer views inside one level
- Segmented Control = local mutually exclusive mode
- Top App Bar = current page hierarchy + small set of actions

No component is allowed to become a visual alias of another purely because it is convenient.

### Brand / Accent discipline

Global navigation uses Brand. Accent Cyan stays reserved for competition rhythm: stage, progress, event/activity and data emphasis.

This avoids two competing “primary colors” across the app.

### Section before Card

Section remains the default grouping primitive. Card is reserved for genuinely independent containment.

This keeps dense mobile pages from degrading into `Card → Card → Card` nesting.

### List Item density

Single-line interactive rows use the existing density large-control height. Multi-line rows are content-driven instead of receiving arbitrary fixed 64/72px heights.

No new Foundation size token was required.

## Non-blocking observations retained for later phases

- Bottom Navigation platform-native geometry should be verified again in Phase 5 Platform mapping rather than treated as a universal physical height.
- Scrollable Tabs need real device-width visual verification during PenPot synchronization.
- Avatar fallback color assignment needs a deterministic low-saturation mapping algorithm before engineering implementation; V1 only fixes the design rule.
- Badge placement offsets are component-composition details and should be defined where Badge is attached (e.g. Bottom Navigation / Avatar) rather than promoted prematurely.
- Text truncation and localization need final stress tests with Chinese + English long strings in Phase 5.

## Self-review result

**PASS after corrections.**

Phase 3 adds no new Foundation Token. The Navigation & Information contract is suitable to carry forward into Phase 4. Independent review remains deferred until full V1 assembly per project workflow.
