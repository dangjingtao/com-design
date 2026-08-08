# Phase 5 Self Review — Systemization & Release

Status: **author self-review passed for Release Candidate; Stable release blocked by independent review + visual asset gates**

This is not an independent second review.

## Scope checked

- Company-level Core boundary
- Human entrypoint / Machine entrypoint consistency
- Theme / Density / Platform / Motion axis separation
- Dark Theme semantic mapping
- Motion / Reduced Motion behavior
- Component catalog and Pattern classification
- Accessibility / Touch / Focus / Contrast baseline
- PenPot sync and export audit policy
- Product / Domain Extension boundary
- Versioning / Deprecation / Migration
- Release status semantics

## Blocking issues found and corrected

### 1. The old “single token JSON is the whole Source of Truth” claim no longer held

Once Dark Theme, Motion and multiple Component Contracts existed, calling `tokens/tokens.json` the entire system truth became false.

Correction:

- Added canonical machine entrypoint `contracts/design-system-v1.json`.
- `tokens/tokens.json` remains the Foundation / Light / Density / Platform source.
- Manifest now resolves Theme, Motion, Component Contract and Core Pattern sources.
- Foundation and README wording were updated.

### 2. Dark Mode needed real semantic remapping, not inversion

A simple “dark background + same foreground tokens” would break hierarchy and several contrast relationships.

Correction:

- Added `tokens/theme-dark.json`.
- Added dark Primitive extensions only where real Semantic gaps existed: deep Neutral, Brand, Accent, Status backgrounds and dark elevations.
- Re-mapped text, surface, border, action, accent, status, scrim and elevation roles.
- High-risk pairs were contrast-checked in `reports/contrast-v1.md`.

### 3. Dark Theme compatibility with existing phase contracts was ambiguous

Earlier component contracts declare `semantic.light` as their logical namespace.

Correction:

V1 explicitly defines overlay resolution:

1. load Foundation
2. merge Dark primitive extensions
3. patch logical semantic paths
4. resolve component short refs

This keeps pre-release contracts stable without copying every component into separate Light/Dark files. The naming is documented as a V1 compatibility contract rather than pretending it is ideal forever.

### 4. Motion package initially claimed DTCG format while mixing behavior booleans

The first draft used DTCG schema while also storing `skeletonShimmer` / `parallax` behavior switches, which is not a clean pure-token document.

Correction:

- Added `schemas/motion-modes-v1.schema.json`.
- `tokens/motion.json` now uses the explicit Com Design schema.
- Primitive duration/easing remain token-shaped; mode behavior flags are intentionally machine-readable policy.

### 5. Core Pattern objects were historically stored under a `components` container

`statusComposition` and `searchPattern` were authored during earlier phases under the generic component contract schema. Counting raw object keys would produce 35 “components”, while the actual Core component count is 33.

Correction:

- Added canonical `contracts/core-patterns.json`.
- Added `schemas/pattern-contract-v1.schema.json`.
- Manifest classifies 33 Core Components + 2 Core Patterns.
- The two older embedded pattern entries are explicitly marked compatibility copies and must not be counted as Components.

### 6. Manifest schema drifted after adding compatibility metadata

The manifest gained `legacyEmbeddedPatternEntries`, but its schema initially rejected unknown top-level keys.

Correction:

- Updated `design-system-manifest-v1.schema.json` to allow the declared compatibility field.

### 7. PenPot “spec page” vs “real reusable asset” remained too easy to conflate

Correction:

`docs/PENPOT-SYNC.md` separates two release gates:

- Formal Spec Visual
- Reusable Component Asset

A pretty specification page cannot be reported as a reusable Component Library unless real component / variant metadata exists.

### 8. Release status needed a hard boundary

Correction:

- Added `candidate / release-candidate / stable / deprecated` lifecycle.
- Added `release/v1-checklist.md`.
- Author self-review can reach RC only.
- Stable requires independent review and remaining visual/platform gates.

## Contrast spot-check result

PASS for the high-risk canonical pairs checked in `reports/contrast-v1.md`, including:

- Light placeholder on white
- Light control border
- Brand primary button label
- Destructive button label
- Dark primary / secondary / placeholder text
- Dark default control border / focus border
- Dark status text on tinted status backgrounds

This does not authorize arbitrary Product Extension color combinations.

## Component coverage result

V1 canonical catalog:

- Actions & Forms: 8
- Navigation & Information: 11
- Feedback / Overlay / Progress: 11
- Search / Menu: 3
- Core Components total: **33**
- Core Patterns: **2**

No further component expansion is recommended before independent review unless a concrete cross-product blocker is found.

## Known RC limitations intentionally retained

These are not hidden as “complete”:

- PenPot V1 Formal Spec is not yet synced to the new Manifest in this branch.
- PenPot reusable component metadata has not yet been independently verified against the V1 catalog.
- Real device Dynamic Type / font scaling behavior requires implementation-level sampling.
- Platform-native picker/date/time behavior remains a platform/product integration decision using Core Trigger / State contracts.
- The historical logical namespace name `semantic.light` remains in V1 for contract compatibility; Theme overlay resolution makes it theme-capable, but a cleaner namespace rename can be considered only in a future major migration if the benefit justifies it.

## Self-review result

**PASS for 1.0.0-rc.1 design-system package.**

Do not mark Stable until the remaining release checklist items and independent review pass.
