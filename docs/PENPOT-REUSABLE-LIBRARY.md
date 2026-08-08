# PenPot Reusable Component Library — V1 RC Production Runbook

This document operationalizes the **Reusable Component Asset** gate from `docs/PENPOT-SYNC.md`.

It does not redefine tokens, component contracts, variants, states, patterns, or accessibility rules.

## 1. Current branch state

Branch: `phase5-penpot-library`

Current repository-side state: **IMPLEMENTATION_READY / VISUAL_GATE_NOT_RUN**.

That wording is intentional. The branch contains a native PenPot builder and audit tooling, but an actual PenPot import/open/re-export has not been evidenced in this repository yet.

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

## 3. Prepare generated assets

From repository root:

```bash
cd penpot-library
npm run prepare:penpot
```

Expected source validation:

- exactly 33 canonical Core Components
- exactly 2 canonical Core Patterns
- patterns excluded from Component count
- every component ID exists in the correct canonical contract
- PenPot implementation controls explicitly separated from Core contract axes
- no `primitive.*` binding in the component builder
- no fabricated `positionData`
- native PenPot Component / Variant / Token APIs are present in the builder

Generated files:

- `penpot-library/dist/com-design-mobile.tokens.json`
- `penpot-library/dist/motion-reference.json`

## 4. Create the PenPot source file

Use a **fresh PenPot file** for deterministic acceptance.

Do not import or duplicate the old RC Formal Spec Visual pages as the new library.

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

## 5. Install and run the builder

Serve the plugin folder:

```bash
python3 -m http.server 4173 --directory penpot-library/plugin
```

Install this manifest in PenPot Plugin Manager:

```text
http://localhost:4173/manifest.json
```

Run **Com Design Library Builder**.

The builder must create native PenPot library components through the supported Plugin API. It must not write `.penpot` ZIP internals.

## 6. Visual Gate — mandatory stop point

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

Inspect at 100% and at normal mobile-design zoom. Reject the batch if any systemic issue appears.

### Typography

- no stretched/compressed glyphs
- system-ui fallback is visually sane on the current PenPot host
- line height is natural
- labels do not collide in Compact
- multi-line information grows instead of clipping

### Geometry

- control heights follow active Density
- touch target semantics are not confused with visual height
- radius hierarchy remains Control < Container < Overlay
- no accidental default shadows on Button/Card/List/Navigation
- overlay elevation is reserved for overlays/floating surfaces

### Color / Theme

Toggle Light → Dark without swapping components.

Check:

- primary/secondary/destructive action hierarchy
- normal/selected/pressed surfaces
- border/focus/error roles
- text hierarchy
- status family
- menu/dialog/sheet surfaces and elevation

Dark acceptance is semantic-role acceptance, not merely “looks dark.”

### Density

Toggle Compact → Comfortable without changing the component identity.

Check:

- Button
- Input
- List Item single/two-line specimen
- Tabs
- Bottom Navigation
- Menu Item
- Search Field

Density must not shrink/change typography hierarchy.

## 7. Variant semantics

`penpot-library/catalog/visual-gate-properties.json` classifies builder properties into two classes:

- **contract** — directly backed by canonical `variants`, `states`, or `sizes`
- **implementation** — optional anatomy, bounded content configuration, or specimen data needed to make a useful reusable PenPot asset

Implementation properties are not permission to update Core contracts.

Examples:

- `Card / Border` is backed by canonical `optionalBorder`, but is not a new Core Card variant family.
- `Dialog / Actions` expresses canonical action-count/stacking constraints; it is not a new Dialog semantic state.
- `Progress / Value` is determinate specimen data; Core only declares `linear | circular` as variants.

## 8. Full catalog expansion

Do not expand the builder to the remaining Core catalog until the Visual Gate is accepted.

After Visual Gate acceptance, full catalog completion must remain exactly:

- Actions & Forms: 8
- Navigation & Information: 11
- Feedback, Overlay & Progress: 11
- Search & Menu: 3
- **Total Core Components: 33**
- **Core Patterns: 2, separate**

Patterns belong under `Patterns/*` and do not become library Components merely to satisfy a count.

## 9. Round-trip gate

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
     --round-trip \
     --out reports/penpot-reusable-roundtrip-audit.json
   ```

## 10. PASS language

`PenPot gate PASS` is allowed only when all are true:

- full 33-component catalog exists as real reusable assets
- 2 patterns remain separately classified
- native Component metadata exists in export
- native Variant metadata exists where expected
- token bindings survive export/import
- no Component → Primitive direct bindings
- actual PenPot visual inspection is recorded
- Light/Dark visual/semantic check passes
- Compact/Comfortable check passes
- source export audit passes
- re-import/open check passes
- round-trip re-export audit passes

Until then, report the narrower state that is actually proven.

## 11. Motion

`tokens/motion.json` remains canonical.

The current PenPot Design Token type surface does not natively model the Core duration/cubic-bezier axis used here, so Motion is carried as `motion-reference.json` and must be verified in prototype/implementation environments. Do not fabricate animation verification in a static PenPot file.
