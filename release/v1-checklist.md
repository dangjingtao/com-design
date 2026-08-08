# Com Design Mobile V1 — Release Candidate Checklist

Status: **RC2 P0 Foundation Hardening complete; P1 + independent review pending**

## Foundation

- [x] Primitive / Semantic / Component / Pattern boundary documented
- [x] Light Theme mapping exists
- [x] Dark Theme overlay exists
- [x] Compact / Comfortable Density exists
- [x] iOS / Android touch target modes exist
- [x] Standard / Reduced Motion exists
- [x] Manifest is the single canonical machine entrypoint
- [x] Foundation token file no longer falsely claims to be the whole Source of Truth
- [x] Iconography Contract exists
- [x] Shared icon visual scale exists only for proven 16 / 20 / 24 cross-component consumers
- [x] Shared loading-indicator visual scale exists separately from icon semantics
- [ ] P1 layout / overlay / adaptive semantic hardening complete
- [ ] P1 destructive-action vs status semantic review complete
- [ ] P1 unused Primitive cleanup complete
- [ ] P1 historical `semantic.light` namespace decision complete

## Core Components

- [x] Actions & Forms complete
- [x] Navigation & Information complete
- [x] Feedback / Overlay / Progress complete
- [x] Search / Menu gaps closed
- [x] Core component catalog declared: 33 components
- [x] Core patterns declared: 2 patterns
- [x] P0 repeated icon literals promoted where stable cross-component meaning exists
- [ ] P1 full 33-component state/accessibility reverse audit complete

## Accessibility

- [x] Touch target baseline documented
- [x] Focus baseline documented
- [x] Status cannot rely on color only
- [x] Modal focus entry / return rules documented
- [x] Reduced Motion mode defined
- [x] Search placeholder checked on its actual subtle surface in Light and Dark
- [x] Tinted Alert status graphic foreground pairings checked
- [x] Inverse Toast status graphic rule corrected to avoid low-contrast status chroma
- [x] Contrast report records actual Core consumer-path corrections
- [ ] Independent reviewer samples rendered iOS / Android typography and controls

## Machine Contract

- [x] Canonical manifest exists
- [x] Foundation token source referenced
- [x] Theme overlay referenced
- [x] Motion source referenced
- [x] Iconography contract + schema referenced
- [x] Four component contract groups referenced
- [x] Manifest schema exists
- [x] Theme overlay schema exists
- [ ] Independent reviewer verifies all referenced files / refs / counts

## Human-readable

- [x] Foundation spec
- [x] Iconography spec
- [x] Actions & Forms spec
- [x] Navigation & Information spec
- [x] Feedback / Overlay / Progress spec
- [x] Search / Menu spec
- [x] Systemization & Release spec
- [x] Design System assembly index
- [x] P0 Foundation Hardening report

## Governance

- [x] Product / Domain Extension boundary
- [x] Versioning policy
- [x] Deprecation lifecycle
- [x] Migration rules
- [x] PenPot sync policy
- [x] Actual `.penpot` export audit requirements documented
- [x] Unused-token creation forbidden by default
- [x] Literal geometry retained only while no stable cross-component semantic exists

## Visual Asset Release

- [ ] PenPot formal spec updated to latest RC manifest
- [ ] PenPot Light / Dark specimen verified
- [ ] PenPot Compact / Comfortable specimen verified
- [ ] Reusable component asset status verified separately from spec visuals
- [ ] Exported `.penpot` audit passes overflow / hideInViewer / stale ref / duplicate / reusable metadata checks

## Stable release gate

Stable V1 requires all remaining unchecked items plus independent review.

Author self-review alone cannot mark this release Stable.
