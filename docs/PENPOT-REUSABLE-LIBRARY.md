# PenPot Reusable Component Library — V1 RC Production Runbook

This document operationalizes the **Reusable Component Asset** gate from `docs/PENPOT-SYNC.md`.

It does not redefine tokens, component contracts, variants, states, patterns, or accessibility rules.

## 1. Current branch state

Branch: `phase5-penpot-library`

Current repository-side state: **CURATED_LAYOUT_V2_READY / VISUAL_GATE_NOT_RUN**.

That wording is intentional. The repository now contains the native PenPot builder, curated page-layout system, token adapter and round-trip auditor. The new layout has passed repository build/syntax/contract validation, but an actual PenPot visual inspection and round-trip have not yet been evidenced.

## 2. Source order

Always resolve in this order:

1. `contracts/design-system-v1.json`
2. `tokens/tokens.json`
3. `tokens/theme-dark.json`
4. `tokens/motion.json`
5. the four component contract files
6. `contracts/core-patterns.json`
7. `penpot-library/catalog/component-catalog.json`
8. `penpot-library/catalog/visual-gate-properties.json`

Items 7-8 are adapters/catalogues. They are subordinate to items 1-6.

PenPot implementation difficulty is never permission to silently mutate Core semantics.

## 3. Prepare generated assets

From repository root:

```bash
cd penpot-library
npm run prepare:penpot
```

This performs, in order:

1. assemble the curated V2 PenPot plugin from `plugin/src-v2/*.jsfrag`;
2. validate canonical catalog and PenPot/Core boundaries;
3. generate the PenPot token adapter.

Generated files:

- `penpot-library/plugin/plugin-v2.js`
- `penpot-library/dist/com-design-mobile.tokens.json`
- `penpot-library/dist/motion-reference.json`

Expected source validation:

- exactly 33 canonical Core Components;
- exactly 2 canonical Core Patterns;
- patterns excluded from Component count;
- every component ID exists in the correct canonical contract;
- PenPot implementation controls explicitly separated from Core contract axes;
- no `primitive.*` binding in the component builder;
- no fabricated `positionData`;
- native PenPot Component / Variant / Token APIs are used;
- visual-gate components have explicit curated layout slots;
- the old `cursorY` / fixed-six-column layout algorithm cannot return.

## 4. Create the PenPot source file

Use a **fresh PenPot file** for deterministic acceptance.

Do not import or duplicate the old RC Formal Spec Visual pages as the new library. The old `.penpot` may only be used to research PenPot-native export/component/variant/token structure.

Import `penpot-library/dist/com-design-mobile.tokens.json` through the PenPot Design Tokens import flow.

Verify token sets/themes before running the component builder:

- `Foundation/Core`
- `Semantic/Light`
- `Semantic/Dark`
- `Density/Compact`
- `Density/Comfortable`
- `Platform/Canonical`
- `Platform/iOS`
- `Platform/Android`

Default active axes:

- Theme = Light
- Density = Compact
- Platform = iOS

The Platform iOS/Android active alias is a PenPot adapter convenience only. It is not a new Core token namespace.

## 5. Library visual organization — Curated Archive V2

The Reusable Library is a **working design asset archive**, not a presentation board and not a generated inventory table.

The page organization intentionally follows the mature mobile design-library pattern: a small number of large canvases, clear families, real reusable assets as the visual subject, and contextual specimens only where they improve judgment.

### Pages

V2 starts with two production pages:

- `00 Foundations`
- `01 Core Components · Visual Gate`

Do not recreate the previous `90 Reusable Component Library` vertical warehouse page.

After the Visual Gate passes, additional production pages may be introduced only when content scale justifies them. Page count is not a goal.

### Base composition

The component canvas uses:

- canvas width: **1728 px**;
- outer margin: **64 px**;
- principal gutter: **24 px** or larger;
- semantic page background;
- white/default semantic surfaces for component-family modules;
- restrained 1 px semantic borders;
- no decorative shadow on ordinary library modules.

These numbers control composition only. They are not new Core design tokens.

### Layout discipline

The library must look intentionally art-directed even at zoomed-out overview scale.

Required principles:

- **strict alignment, asymmetric composition** — modules share meaningful edges without becoming an equal-card dashboard;
- **weight follows complexity** — Button/List/Dialog receive more visual area than Tag or Menu Item;
- **large / medium / small rhythm** — adjacent modules must not all have equal dimensions;
- **family proximity** — related components read as a group before their labels are read;
- **whitespace separates concepts** — do not wrap every empty area with another container;
- **assets dominate annotations** — titles and metadata are quiet; reusable components are the visual subject;
- **overview must remain legible** — the page should still reveal structure at fit-to-screen zoom;
- **no filler specimens** — blank space is preferable to inventing business UI to fill a rectangle.

Forbidden layout shortcuts:

- one identical white card per component;
- one fixed column count for the entire page;
- `cursorY` accumulation as the page-composition algorithm;
- “six items per row” or similar mechanical placement independent of component dimensions;
- equal-width/equal-height tiles used merely because they are easy to generate;
- giant Design System poster / Spec Board masquerading as a library;
- copying Ant Design Mobile component styling. The reference is its **asset organization maturity**, not its brand appearance.

### Foundations composition

`00 Foundations` is concise and operational, divided into four weighted areas:

- Semantic Color — largest block;
- Typography — vertical hierarchy specimen;
- Shape & Spacing — compact geometry reference;
- Modes — Theme / Density / Platform and Motion reference state.

It is not a token encyclopedia. The canonical JSON remains the complete source of truth.

### Core Component composition

`01 Core Components · Visual Gate` uses explicitly curated module rectangles rather than one global auto-layout.

Current hierarchy:

- Button anchors the first row;
- Input and Search form the paired field column;
- List Item anchors the information area;
- Tabs / Bottom Navigation / Tag form the navigation rhythm;
- Alert / Section / Card create a mixed large-medium-small row;
- Dialog and Bottom Sheet receive dedicated overlay-scale space;
- Menu / Progress / Menu Item create the utility cluster;
- Stepper closes the page with a wide horizontal/vertical comparison area.

This structure is allowed to evolve after actual PenPot inspection, but any revision must preserve deliberate composition rather than revert to mechanical packing.

## 6. Install and run the builder

After `npm run prepare:penpot`, serve the plugin folder:

```bash
python3 -m http.server 4173 --directory penpot-library/plugin
```

Install this manifest in PenPot Plugin Manager:

```text
http://localhost:4173/manifest.json
```

The manifest points to generated `plugin-v2.js`.

Run **Com Design Library Builder**.

The builder must create native PenPot library components through the supported Plugin API. It must not write `.penpot` ZIP internals.

## 7. Visual Gate — mandatory stop point

The first builder pass intentionally covers the design-quality canaries before full-catalog expansion:

- Button
- Input
- Search Field
- List Item
- Tabs
- Bottom Navigation
- Section
- Card
- Dialog
- Bottom Sheet
- Menu / Menu Item
- Tag / Alert status family
- Progress Indicator
- Stepper

Inspect both the **page-level composition** and the **individual component quality**.

### Page-level acceptance

Inspect once at fit-to-screen / overview scale and once at 100%.

Reject the layout if:

- the page reads as a repetitive dashboard grid;
- large empty holes appear accidental rather than compositional;
- unrelated families visually fuse together;
- one region becomes visually noisy while another feels unfinished;
- module titles dominate the components;
- component groups appear to be arbitrary rows generated by an algorithm;
- the page loses a clear top-to-bottom visual rhythm.

### Typography

- no stretched/compressed glyphs;
- system-ui fallback is visually sane on the current PenPot host;
- line height is natural;
- labels do not collide in Compact;
- multi-line information grows instead of clipping.

### Geometry

- control heights follow active Density;
- touch target semantics are not confused with visual height;
- radius hierarchy remains Control < Container < Overlay;
- no accidental default shadows on Button/Card/List/Navigation;
- overlay elevation is reserved for overlays/floating surfaces.

### Color / Theme

Toggle Light → Dark without swapping components.

Check:

- primary/secondary/destructive action hierarchy;
- normal/selected/pressed surfaces;
- border/focus/error roles;
- text hierarchy;
- status family;
- menu/dialog/sheet surfaces and elevation;
- module chrome remains quiet in both themes.

Dark acceptance is semantic-role acceptance, not merely “looks dark.”

### Density

Toggle Compact → Comfortable without changing the component identity.

Check:

- Button;
- Input;
- List Item single/two-line specimen;
- Tabs;
- Bottom Navigation;
- Menu Item;
- Search Field.

Density must not shrink/change typography hierarchy.

## 8. Variant semantics

`penpot-library/catalog/visual-gate-properties.json` classifies builder properties into two classes:

- **contract** — directly backed by canonical `variants`, `states`, or `sizes`;
- **implementation** — optional anatomy, bounded content configuration, or specimen data needed to make a useful reusable PenPot asset.

Implementation properties are not permission to update Core contracts.

Examples:

- `Card / Border` is backed by canonical `optionalBorder`, but is not a new Core Card variant family;
- `Dialog / Actions` expresses canonical action-count/stacking constraints; it is not a new Dialog semantic state;
- `Progress / Value` is determinate specimen data; Core only declares `linear | circular` as variants.

## 9. Full catalog expansion

Do not expand the builder to the remaining Core catalog until the Visual Gate is accepted.

After Visual Gate acceptance, full catalog completion must remain exactly:

- Actions & Forms: 8
- Navigation & Information: 11
- Feedback, Overlay & Progress: 11
- Search & Menu: 3
- **Total Core Components: 33**
- **Core Patterns: 2, separate**

Patterns belong under `Patterns/*` and do not become library Components merely to satisfy a count.

When expanding to the remaining components, first assign their page/module composition deliberately; do not append them using a generic packing loop.

## 10. Round-trip gate

After the full library exists:

1. Insert instances of representative components onto a throwaway verification page.
2. Switch native Variants and confirm overrides survive.
3. Toggle Light/Dark and Compact/Comfortable.
4. Export the source file as `.penpot`.
5. Audit it:

   ```bash
   python3 penpot-library/scripts/audit-penpot-roundtrip.py \
     path/to/source-export.penpot \
     --expect-full-catalog \
     --expect-instances \
     --out reports/penpot-reusable-source-audit.json
   ```

6. Import that exported `.penpot` into PenPot as a new file.
7. Actually open it and repeat instance/variant/theme/density visual checks.
8. Export it again.
9. Audit the second export:

   ```bash
   python3 penpot-library/scripts/audit-penpot-roundtrip.py \
     path/to/round-trip-export.penpot \
     --expect-full-catalog \
     --expect-instances \
     --round-trip \
     --out reports/penpot-reusable-roundtrip-audit.json
   ```

The auditor checks documented PenPot v3 fields rather than guessed ZIP internals: native feature flags, Component metadata (`mainInstanceId`/`mainInstancePage`), shape component references (`componentId`/`componentFile`/`shapeRef`), exported `appliedTokens`, token sets/themes, and canonical catalog paths.

## 11. PASS language

`PenPot gate PASS` is allowed only when all are true:

- full 33-component catalog exists as real reusable assets;
- 2 patterns remain separately classified;
- native Component metadata exists in export;
- native Variant metadata exists where expected;
- reusable Instance references exist and work in PenPot;
- `appliedTokens` survive export/import;
- no Component → Primitive direct bindings;
- actual PenPot visual inspection is recorded;
- page-level composition is visually accepted;
- Light/Dark visual/semantic check passes;
- Compact/Comfortable check passes;
- source export audit passes;
- re-import/open check passes;
- round-trip re-export audit passes.

Until then, report the narrower state that is actually proven.

## 12. Motion

`tokens/motion.json` remains canonical.

The current PenPot Design Token type surface does not natively model the Core duration/cubic-bezier axis used here, so Motion is carried as `motion-reference.json` and must be verified in prototype/implementation environments. Do not fabricate animation verification in a static PenPot file.
