# Changelog

## 1.0.0-rc.2 — 2026-08-08

### Added

- Iconography Contract with Lucide as the default generic UI icon source
- Shared theme-independent icon visual sizes: 16 / 20 / 24
- Shared loading-indicator visual sizes: 16 / 24
- Iconography schema and human-readable icon foundation spec
- P0 Foundation Hardening audit report

### Changed

- `tokens/tokens.json` no longer claims to be the whole Design System Source of Truth; the Manifest remains the single canonical machine entrypoint
- Light placeholder semantic moved from Neutral 500 to Neutral 600 so Search placeholder passes on its real subtle surface
- Dark placeholder semantic moved from Neutral 400 to Neutral 300 for the same real consumer path
- Core icon-bearing component contracts now consume shared icon size semantics where stable cross-component meaning exists
- Button/Search loading geometry and Loading Indicator now consume shared indicator-size semantics rather than repeated literals
- Tinted Alert status graphics now use corresponding `*Text` foreground semantics
- Inverse Toast status icons use inverse foreground; status meaning is carried by icon shape plus message instead of forcing potentially low-contrast status chroma
- Contrast report now audits actual component consumer paths, not only isolated palette pairs

### Explicitly not changed yet

- Destructive-action foreground vs Status Danger semantic separation
- Layout/contentInset/overlay viewport semantic disentangling
- Elevation two-level closure review
- Unused Primitive cleanup
- Historical `semantic.light` namespace decision
- Full 33-component state/accessibility reverse audit

These remain P1 Foundation Hardening items and are not silently folded into the P0 pass.

### Release status

Release Candidate only. Stable release remains blocked by P1 hardening, independent review, PenPot release gates and real-device checks.

---

## 1.0.0-rc.1 — 2026-08-08

### Added

- Company-level mobile Design System foundation
- Light Theme
- Dark Theme overlay
- Compact / Comfortable Density modes
- iOS / Android touch target modes
- Standard / Reduced Motion modes
- 33 Core Components
- 2 Core Patterns
- Canonical machine manifest `contracts/design-system-v1.json`
- Product / Domain Extension policy
- PenPot sync / export audit policy
- Versioning / Deprecation / Migration policy
- Contrast release spot-check report

### Changed

- Reframed Com Design Mobile from a single-product-oriented system into a company-level Core Design System
- Product-specific competition / ranking / stage semantics moved behind Product / Domain Extension boundary
- Source of Truth model upgraded from a single-token-file claim to a canonical manifest that resolves Token + Theme + Motion + Component Contracts

### Fixed

- Form control boundary and placeholder contrast
- Destructive action text contrast
- Focus width bypassing Semantic role
- Read-only vs Disabled ambiguity
- Card default containment over-specification
- Badge attention semantic misuse
- Toast / Snackbar surface semantic misuse
- Stepper current vs completed ambiguity
- Search loading replacing Clear action
- Missing formal receiver for Top App Bar overflow actions

### Deprecated

- Treating `tokens/tokens.json` as the complete Design System entrypoint. It remains the Foundation / Light / Density / Platform source, but consumers should enter through `contracts/design-system-v1.json`.

### Removed

- Product-specific visual personality from Core Foundation semantics
- Assumption that a Formal Spec visual page implies a reusable component asset exists

### Migration

- Consumers should resolve the Design System through `contracts/design-system-v1.json`.
- Dark Theme consumers apply `tokens/theme-dark.json` before component token resolution.
- Product-specific patterns should move to an Extension package instead of modifying Core Token / Component Contract.

### Release status

Release Candidate only. Stable release requires independent review and PenPot visual asset release gates.
