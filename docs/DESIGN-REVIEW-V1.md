# Com Design Mobile — Design System V1 Review

Version: **1.0.0-rc.1**  
Audience: **Design Lead / Project Lead**  
Purpose: **Design Review, not executive sales presentation**

> Canonical truth remains `contracts/design-system-v1.json` and referenced Token / Contract files. This document explains and reviews the system; it does not create a second source of truth.

## 0. Current state

- **33 Core Components**: specification and machine-readable contracts are defined.
- **2 Core Patterns**: Status Composition / Search Experience.
- **PenPot reusable assets**: still require V1 alignment and final validation.
- **Iconography**: current V1 gap; component contracts define icon sizes in many places but the shared icon language is not yet formally specified.

---

# 1. Brand character

The system direction in current Foundation is **Modern / Clear / Light / Efficient**, with restrained youthful character.

For review, that translates into four concrete traits:

### Clear
Information hierarchy comes before decoration. Text, secondary information, action and status keep stable visual roles.

**Visual consequence:** system sans-serif, explicit typography hierarchy, low-noise surfaces, limited saturated color.

### Light
High information density should not make the interface visually heavy.

**Visual consequence:** cool Neutral palette, Flat-first surfaces, light borders and spacing rather than routine shadows.

### Efficient
Compact is the default density for high-frequency mobile business interfaces.

**Visual consequence:** 40px regular controls / 48px large controls in Compact, while platform hit targets remain independent.

### Young
Youthfulness comes from Electric Indigo plus restrained Cyan rhythm, not neon, giant gradients, soft cartoon cards or excessive roundness.

**Visual consequence:** strong Brand color appears selectively; Accent never competes with Brand for primary identity.

**Short description:** calm without heaviness; young without playfulness becoming childish; compact without crowding.

---

# 2. Global Styles

## 2.1 Color

### Brand — Electric Indigo

- Brand 500 `#5B5EF7`: primary action, key selection, primary brand identity.
- Brand 600 `#494CE0`: stronger brand text / link expression in Light.
- Brand 700 `#393BBE`: pressed / deeper expression.
- Brand 50 / 100 / 200: selected and subtle brand surfaces.

Global navigation active identity uses Brand.

### Accent — Cyan

Accent 500 `#16BFD3` is subordinate to Brand.

Use for local emphasis, progress, data visualization and constrained product patterns. Do not use it as the default CTA, global navigation identity or a fifth status family.

### Neutral

Cool Neutral supports dense information without producing heavy enterprise blue-grey. Light page uses `neutral.50`; default content Surface uses white.

### Status

Success / Warning / Danger provide background / signal / text semantics. Info reuses Brand. Color may reinforce status but may never be the only status signal.

## 2.2 Typography

System sans-serif. Brand character does not depend on a custom font.

| Role | Size / Line Height | Weight |
| --- | --- | --- |
| Caption | 12 / 18 | Regular |
| Label Small | 12 / 16 | Medium |
| Body Small | 14 / 20 | Regular |
| Label | 14 / 20 | Medium |
| Body | 16 / 24 | Regular |
| Heading Small | 16 / 22 | Semibold |
| Heading | 18 / 24 | Semibold |
| Title | 24 / 30 | Semibold |
| Display | 28 / 36 | Semibold |

High information density is not achieved by globally shrinking text.

## 2.3 Iconography — V1 gap

Current contracts already contain icon visual sizes, but V1 has no formal shared icon style / source specification. This should be closed before Stable.

**Proposal: use Lucide as the default system icon source.**

Proposed baseline for review:

- Outline icon style.
- Default stroke weight: 2px.
- Visual sizes: 16 / 20 / 24px.
- Icon color consumes Semantic Color only.
- Visual size and interactive hit area stay independent; iOS 44pt / Android 48dp remain the interaction baseline.
- Use a Custom Icon only when the default library has no semantically correct option; custom icons must preserve the same visual weight and geometry discipline.
- The same system meaning should map to a stable icon rather than arbitrary near-synonyms per page.

This proposal is **not yet canonical V1 truth** until it is added to the Design System contract / documentation / PenPot and implementation consumption path.

## 2.4 Spacing & Density

Primitive spacing: `0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32`.

Compact — default:
- control 40
- large control 48
- horizontal padding 12
- vertical padding 8
- content inset 16
- section gap 20

Comfortable:
- control 44
- large control 56
- horizontal padding 16
- vertical padding 12
- content inset 16
- section gap 24

Compact-first increases information efficiency; it does not shrink readable type or platform interaction targets.

## 2.5 Radius & Shape

- Control: 8px
- Container: 12px
- Overlay: 16px
- Pill: full

Not every container needs a radius. Section, List and Divider are allowed to remain fully flat.

## 2.6 Surface & Elevation

Normal information hierarchy prefers:

1. spacing / grouping;
2. typography hierarchy;
3. divider / border;
4. surface difference;
5. status / brand emphasis.

Shadow is reserved for real floating relationships such as Menu, Dialog and Sheet. Card has no default shadow.

## 2.7 Theme

Light / Dark are mappings of the same Semantic roles, not duplicated component systems. Dark is applied through the current theme overlay contract.

## 2.8 Motion

Standard motion communicates relationship or state. Reduced Motion removes non-essential spatial animation and Skeleton shimmer. Motion is never the only signal for success, error, selection or progress.

---

# 3. Design Patterns

## 3.1 Information grouping

**Section-before-Card.** Start with typography, spacing and Divider. Use Card only when content needs a real independent container boundary. Card-in-Card is prohibited by default.

## 3.2 Forms

Keep a stable Label → Control → Helper / Error anatomy. Field-level error is preferred. Read-only and Disabled remain semantically and visually distinct.

## 3.3 Navigation

- Bottom Navigation: top-level destinations.
- Tabs: peer views at the same information level.
- Segmented Control: local mode switch.

The three roles must not substitute for each other merely because their visuals can look similar.

## 3.4 Search

Search is not generic Input. Query, Clear and usable previous results should be preserved through loading and recoverable failure when possible. No Results is contextual to the current query.

## 3.5 Feedback hierarchy

`Field / Helper → Inline Alert → Banner → Toast / Snackbar → Dialog`

Interruption cost increases along the hierarchy. Importance alone is not a reason to use a Dialog.

## 3.6 Overlay

Only one blocking modal layer at a time. Close Menu before opening Dialog / Sheet. Do not stack Dialog-on-Dialog or Sheet-on-Sheet.

## 3.7 Loading / Empty / Error

- Known structure: Skeleton.
- Unknown wait: Loading Indicator.
- Zero content: Empty State.
- Failed request: Error / Recovery state.

Background refresh should preserve usable existing content when possible.

## 3.8 Progress / Stepper / Timeline

- Progress Indicator: truthful determinate progress.
- Stepper: finite ordered task progression.
- Timeline: chronological event history.

These roles are intentionally separate.

## 3.9 Status Composition

Status is a composition rule, not a universal colored pill. Text / icon / tag / dot / alert may compose a status; color cannot be the only signal.

---

# 4. Core Component scope

**33 Core Components are defined in V1.**

### Actions & Forms — 8
Button / Icon Button / Input / Textarea / Select / Checkbox / Radio / Switch

### Navigation & Information — 11
List Item / Tabs / Segmented Control / Top App Bar / Bottom Navigation / Section / Divider / Card / Tag / Badge / Avatar

### Feedback / Overlay / Progress — 11
Toast / Snackbar / Alert / Dialog / Bottom Sheet / Loading Indicator / Skeleton / Empty State / Progress Indicator / Stepper / Timeline

### Search & Menu — 3
Search Field / Menu / Menu Item

V1 deliberately does not yet promote Carousel, FAB, Data Table, Rich Text Editor, Navigation Rail and similar capabilities into Core without stable cross-product demand.

---

# 5. Composition review

The HTML review artifact shows neutral mobile compositions for:

- Form
- Search / List
- Settings / Navigation
- Feedback
- Dark Theme
- Progress / Stepper

These are design-language specimens, not product prototypes.

---

# 6. System model

`Primitive → Semantic → Component → Pattern`

Orthogonal axes:

- Theme: Light / Dark
- Density: Compact / Comfortable
- Platform: iOS / Android
- Motion: Standard / Reduced

The system resolves axes independently rather than creating combination-token sets such as `Dark-Compact-iOS-Reduced`.

---

# 7. RC gaps before Stable

## Must close before Stable

- Formal Iconography specification and asset/implementation path; Lucide is the current proposal.
- PenPot Formal Spec aligned to V1 Manifest.
- PenPot Light / Dark specimen validation.
- PenPot Compact / Comfortable specimen validation.
- Reusable Component Asset verification.
- Exported `.penpot` audit.
- Independent Manifest / reference / 33 + 2 verification.
- Independent iOS / Android typography and control sampling.
- Independent design review.

## Compatibility debt

Current V1 retains historical `semantic.light` as a logical namespace and applies Dark Theme through overlay replacement before component resolution.

## Later versions

Adaptive / tablet / foldable / pointer-platform expansion and additional Core Components should be driven by real product demand rather than 1.0 completeness theatre.

---

## Review conclusion

The V1 design language is substantially formed, but **Iconography, PenPot formal assets and independent review are not yet closed**. The correct status remains **1.0.0-rc.1**.