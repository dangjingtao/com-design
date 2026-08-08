# Com Design Mobile — PenPot Reusable Component Library

> Branch scope: `phase5-penpot-library`
>
> Canonical source: `contracts/design-system-v1.json` (`1.0.0-rc.1`)

This directory implements the **Reusable Component Asset** gate defined by `docs/PENPOT-SYNC.md`.
It does not replace the machine source package, and it does not reuse the old Formal Spec Visual as a component library.

## Non-negotiable boundaries

1. `contracts/` and `tokens/` remain the only design truth.
2. PenPot is a rendering/reuse target. PenPot-specific adapters may map modes, but may not mutate Core semantics.
3. A Core Component must be a real PenPot Component. Where variants are declared, they must be real PenPot Variants rather than unrelated specimen frames.
4. Components bind semantic/mode token names. Direct Component → Primitive bindings are rejected by audit.
5. Canonical catalog is exactly **33 Core Components + 2 Core Patterns**. Patterns are catalogued separately and are never counted as components.
6. A generated file is not a PASS. `PenPot import → open/visual check → re-export → audit` is mandatory before the PenPot gate can pass.
7. The library canvas itself is a designed production asset. Mechanical equal-card grids and generic packing algorithms are not acceptable substitutes for composition.

## Implementation path

```text
contracts/design-system-v1.json
        +
tokens/tokens.json + theme-dark.json + motion.json
        +
4 component contracts + core-patterns.json
        │
        ├── scripts/build-penpot-token-adapter.mjs
        │      └── dist/com-design-mobile.tokens.json
        │
        ├── catalog/component-catalog.json
        │
        └── plugin/src-v2/*.jsfrag
               │
               ├── scripts/build-penpot-plugin-v2.mjs
               │      └── plugin/plugin-v2.js
               │
               └── PenPot native shapes
                    → native Components
                    → native Variants
                    → semantic/mode token bindings
                    → curated reusable Library
```

`plugin/plugin.js` is retained as the first implementation snapshot for comparison. The installable production entry is generated `plugin/plugin-v2.js` and is selected by `plugin/manifest.json`.

The builder uses the supported PenPot Plugin API (`library.local.createComponent`, `createVariantFromComponents`, shape token bindings). It never writes `.penpot` ZIP internals or fabricates `positionData`.

## Curated Archive V2

The V2 re-layout replaces the old `cursorY + fixed six-column` warehouse arrangement.

Initial pages:

- `00 Foundations`
- `01 Core Components · Visual Gate`

The component page uses a 1728 px canvas, 64 px outer margin and deliberately asymmetric component-family modules. Module weight follows component complexity rather than a global tile size.

The design objective is simple: at zoomed-out overview scale the file should read like a maintained mobile design library, not a generated dashboard. At 100% scale the same page must still be practical for selecting, inspecting and reusing real native Components and Variants.

Detailed composition rules live in `docs/PENPOT-REUSABLE-LIBRARY.md`.

## Token adapter model

PenPot resolves same-name tokens from active sets/themes. The adapter therefore keeps component-facing names stable and maps orthogonal modes with token sets:

- `Foundation/Core` — canonical primitive tokens, plus non-conflicting primitive extensions required by Dark.
- `Semantic/Light` — canonical semantic names (`color.*`, `typography.*`, `radius.*`, `border.*`, `elevation.*`).
- `Semantic/Dark` — the **same semantic names**, patched from `tokens/theme-dark.json`.
- `Density/Compact` / `Density/Comfortable` — the same `density.*` names with different values.
- `Platform/Canonical` — canonical `platform.ios.*` and `platform.android.*` values for traceability.
- `Platform/iOS` / `Platform/Android` — PenPot adapter alias `platform.touchTargetMin`, used only where a reusable hit-area specimen needs one active platform value.

Default axes: `Theme=Light`, `Density=Compact`, `Platform=iOS`.

The `Platform/iOS|Android` alias is an adapter-only mapping. It does not add a Core token and must never be referenced back into the machine contracts.

## Motion limitation

PenPot's native Design Token types used by this implementation do not expose the Core `duration` or `cubicBezier` axis. Therefore:

- `tokens/motion.json` remains canonical and is included as reference metadata;
- the builder does **not** pretend that Motion is natively token-bound;
- Standard/Reduced behavior is verified in implementation/prototype environments;
- this is a Tooling Limitation, not permission to change Core semantics.

## Library organization

Component library paths follow the contract families:

- `Actions & Forms/*`
- `Navigation & Information/*`
- `Feedback, Overlay & Progress/*`
- `Search & Menu/*`

Patterns live under `Patterns/*` as composition references and are excluded from Core Component count.

Shared layer names are anatomical (`container`, `label`, `leadingIcon`, `content`, etc.). Variant members preserve layer name/type/hierarchy wherever possible so designer overrides survive variant switching.

## Visual gate before broad acceptance

The first visual acceptance group is:

- Button
- Input
- Search Field
- List Item
- Tabs
- Bottom Navigation
- Section / Card
- Dialog
- Bottom Sheet
- Menu / Menu Item
- Status family (Tag / Alert)
- Progress Indicator / Stepper

If these fail visual review — including the page-level composition — stop and fix the recipes/layout before approving the rest of the catalog.

## Running locally

1. Prepare the installable plugin and token assets:

   ```bash
   cd penpot-library
   npm run prepare:penpot
   cd ..
   ```

2. Import `penpot-library/dist/com-design-mobile.tokens.json` into a fresh PenPot file.
3. Serve `penpot-library/plugin/`:

   ```bash
   python3 -m http.server 4173 --directory penpot-library/plugin
   ```

4. In PenPot Plugin Manager install:

   `http://localhost:4173/manifest.json`

5. Run **Com Design Library Builder**.
6. Inspect `00 Foundations` and `01 Core Components · Visual Gate` at overview scale and 100%.
7. Inspect the priority visual gate before accepting the full catalog.
8. Export the file as `.penpot`.
9. Run the source audit, then re-import/open/re-export and audit the round-trip file.

See `docs/PENPOT-REUSABLE-LIBRARY.md` for the exact commands and PASS criteria.

## Gate language

Allowed states:

- `CURATED_LAYOUT_V2_READY` — repo-side curated builder/auditor exists, but actual PenPot visual acceptance has not yet passed.
- `VISUAL_GATE_PASS` — priority assets and page composition inspected in PenPot and accepted.
- `ROUND_TRIP_PASS` — actual re-import/re-export audited with native Component/Variant/Instance metadata.
- `BLOCKED` — tooling/runtime issue recorded with evidence.

Do **not** use `PenPot PASS` unless the full visual and round-trip requirements are evidenced by the actual exported artifact and audit report.
