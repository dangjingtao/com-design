# V1 RC2 Foundation Hardening — P0

Status: **P0 author correction pass complete; P1 hardening remains**

This pass was triggered by reverse-auditing the 33 Core Component contracts instead of judging Foundation completeness by token-file shape alone.

## P0-1 — Source-of-Truth metadata

RC1 problem:

- `tokens/tokens.json` still declared `sourceOfTruth: true`, `0.4.0`, `candidate`.
- the aggregate Manifest already declared itself the canonical `1.0.0-rc.1` entrypoint.

Correction:

- aggregate Manifest advanced to `1.0.0-rc.2` and remains the only canonical entrypoint;
- `tokens/tokens.json` now explicitly declares itself a Foundation/Light/Density/Platform source, not the whole Design System Source of Truth;
- Foundation metadata points back to `contracts/design-system-v1.json`.

## P0-2 — Iconography and repeated component-local geometry

RC1 repeatedly hard-coded the same icon visual sizes across Button, IconButton, Select, List Item, Top App Bar, Bottom Navigation, Search and Menu.

That no longer met the contract rule that a literal is only acceptable while no stable cross-component semantic exists.

Correction:

- added theme-independent `semantic.shared.icon.size.small|medium|large` = 16 / 20 / 24;
- added `semantic.shared.indicator.size.inline|regular` = 16 / 24 because loading-indicator geometry already has multiple real consumers;
- updated component contracts to consume those shared semantics;
- added `contracts/iconography.json` plus schema and human spec;
- Lucide is the default generic UI source, but source library/stroke/cap/join/accessibility rules remain Icon Contract policy rather than design tokens;
- no parallel icon color palette was created.

Deliberately **not** promoted merely because of numeric equality:

- Checkbox / Radio geometry
- Switch geometry
- Stepper / Timeline nodes
- Progress Indicator geometry
- Avatar sizes

## P0-3 — Search placeholder consumer-path contrast

RC1 checked placeholder on `surface.default`, but Search Field actually uses placeholder on `surface.subtle` in its idle state.

RC1 real pairings:

- Light: Neutral 500 on Neutral 100 = ~4.31:1 → FAIL normal text
- Dark: Neutral 400 on Neutral 800 = ~4.37:1 → FAIL normal text

Correction:

- Light placeholder → Neutral 600; Search pairing = ~5.91:1
- Dark placeholder → Neutral 300; Search pairing = ~9.39:1

No Search-specific placeholder color token was added.

## P0-4 — Status graphic contrast

RC1 treated base status chroma as if it were a guaranteed foreground on the matching tinted status background. That assumption was false.

Examples in Light:

- Success 500 / Success 100 ≈ 2.34:1
- Warning 500 / Warning 100 ≈ 1.89:1

Correction:

- Alert status icons on tinted surfaces use the corresponding `*Text` semantic;
- shared Status Composition rules now distinguish marker chroma from foreground-on-tint semantics;
- Toast status icons on inverse surfaces use `color.text.inverse`, with status type carried by icon shape plus message rather than forcing low-contrast status chroma;
- contrast report now audits these actual component consumer paths.

## P0 acceptance result

P0 is complete when judged against the issues identified in the RC1 reverse audit:

- [x] one canonical Source-of-Truth entrypoint
- [x] real Icon Contract exists
- [x] stable icon size repetition promoted to shared semantics
- [x] repeated loading-indicator sizes promoted separately from icon sizes
- [x] core icon-bearing contracts reference shared sizes instead of repeated icon literals where a stable role exists
- [x] Search placeholder on its actual subtle surface passes in Light and Dark
- [x] tinted Alert status graphics use contrast-safe semantic foregrounds
- [x] inverse Toast status graphics no longer assume base status chroma is contrast-safe
- [x] contrast report records the failed RC1 consumer paths and corrected RC2 pairings

## Explicitly deferred to P1

Do not silently fold these into P0:

- destructive-action foreground vs Status Danger semantic separation
- `contentInset` / page / viewport / overlay layout-semantic disentangling
- Elevation two-level closure review
- stale/unused Primitive cleanup such as `font.size.20`, `font.weight.bold`, `opacity.scrim`
- `semantic.light` historical namespace decision before Stable
- full 33-component state/accessibility reverse audit beyond the P0 contrast defects fixed here
