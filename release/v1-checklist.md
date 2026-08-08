# Com Design Mobile V1 — Release Candidate Checklist

Status: **RC author gate complete; independent review pending**

## Foundation

- [x] Primitive / Semantic / Component / Pattern boundary documented
- [x] Light Theme mapping exists
- [x] Dark Theme overlay exists
- [x] Compact / Comfortable Density exists
- [x] iOS / Android touch target modes exist
- [x] Standard / Reduced Motion exists

## Core Components

- [x] Actions & Forms complete
- [x] Navigation & Information complete
- [x] Feedback / Overlay / Progress complete
- [x] Search / Menu gaps closed
- [x] Core component catalog declared: 33 components
- [x] Core patterns declared: 2 patterns

## Accessibility

- [x] Touch target baseline documented
- [x] Focus baseline documented
- [x] Status cannot rely on color only
- [x] Modal focus entry / return rules documented
- [x] Reduced Motion mode defined
- [x] High-risk contrast pairs spot-checked
- [ ] Independent reviewer samples rendered iOS / Android typography and controls

## Machine Contract

- [x] Canonical manifest exists
- [x] Foundation token source referenced
- [x] Theme overlay referenced
- [x] Motion source referenced
- [x] Four component contract groups referenced
- [x] Manifest schema exists
- [x] Theme overlay schema exists
- [ ] Independent reviewer verifies all referenced files / refs / counts

## Human-readable

- [x] Foundation spec
- [x] Actions & Forms spec
- [x] Navigation & Information spec
- [x] Feedback / Overlay / Progress spec
- [x] Search / Menu spec
- [x] Systemization & Release spec
- [x] Design System assembly index

## Governance

- [x] Product / Domain Extension boundary
- [x] Versioning policy
- [x] Deprecation lifecycle
- [x] Migration rules
- [x] PenPot sync policy
- [x] Actual `.penpot` export audit requirements documented

## Visual Asset Release

- [ ] PenPot formal spec updated to V1 manifest
- [ ] PenPot Light / Dark specimen verified
- [ ] PenPot Compact / Comfortable specimen verified
- [ ] Reusable component asset status verified separately from spec visuals
- [ ] Exported `.penpot` audit passes overflow / hideInViewer / stale ref / duplicate / reusable metadata checks

## Stable release gate

Stable V1 requires all remaining unchecked items plus independent review.

Author self-review alone cannot mark this release Stable.
