# PenPot Reusable Library — Canonical Component Catalog

Source: `contracts/design-system-v1.json` · version `1.0.0-rc.1`

Status legend:

- **Visual Gate** — native PenPot builder recipe exists in the first acceptance batch; still requires actual PenPot visual inspection.
- **Deferred by Gate** — canonical component is intentionally not mass-generated until the Visual Gate is accepted.
- Patterns are listed separately and never count toward the 33 Component total.

| # | Family | Canonical ID | Library name | Contract | Current implementation |
|---:|---|---|---|---|---|
| 1 | Actions & Forms | `button` | Button | `actions-forms.json` | Visual Gate |
| 2 | Actions & Forms | `iconButton` | Icon Button | `actions-forms.json` | Deferred by Gate |
| 3 | Actions & Forms | `input` | Input | `actions-forms.json` | Visual Gate |
| 4 | Actions & Forms | `textarea` | Textarea | `actions-forms.json` | Deferred by Gate |
| 5 | Actions & Forms | `select` | Select | `actions-forms.json` | Deferred by Gate |
| 6 | Actions & Forms | `checkbox` | Checkbox | `actions-forms.json` | Deferred by Gate |
| 7 | Actions & Forms | `radio` | Radio | `actions-forms.json` | Deferred by Gate |
| 8 | Actions & Forms | `switch` | Switch | `actions-forms.json` | Deferred by Gate |
| 9 | Navigation & Information | `listItem` | List Item | `navigation-information.json` | Visual Gate |
| 10 | Navigation & Information | `tabs` | Tabs | `navigation-information.json` | Visual Gate |
| 11 | Navigation & Information | `segmentedControl` | Segmented Control | `navigation-information.json` | Deferred by Gate |
| 12 | Navigation & Information | `topAppBar` | Top App Bar | `navigation-information.json` | Deferred by Gate |
| 13 | Navigation & Information | `bottomNavigation` | Bottom Navigation | `navigation-information.json` | Visual Gate |
| 14 | Navigation & Information | `section` | Section | `navigation-information.json` | Visual Gate |
| 15 | Navigation & Information | `divider` | Divider | `navigation-information.json` | Deferred by Gate |
| 16 | Navigation & Information | `card` | Card | `navigation-information.json` | Visual Gate |
| 17 | Navigation & Information | `tag` | Tag | `navigation-information.json` | Visual Gate |
| 18 | Navigation & Information | `badge` | Badge | `navigation-information.json` | Deferred by Gate |
| 19 | Navigation & Information | `avatar` | Avatar | `navigation-information.json` | Deferred by Gate |
| 20 | Feedback, Overlay & Progress | `toast` | Toast | `feedback-overlay-progress.json` | Deferred by Gate |
| 21 | Feedback, Overlay & Progress | `snackbar` | Snackbar | `feedback-overlay-progress.json` | Deferred by Gate |
| 22 | Feedback, Overlay & Progress | `alert` | Alert | `feedback-overlay-progress.json` | Visual Gate |
| 23 | Feedback, Overlay & Progress | `dialog` | Dialog | `feedback-overlay-progress.json` | Visual Gate |
| 24 | Feedback, Overlay & Progress | `bottomSheet` | Bottom Sheet | `feedback-overlay-progress.json` | Visual Gate |
| 25 | Feedback, Overlay & Progress | `loadingIndicator` | Loading Indicator | `feedback-overlay-progress.json` | Deferred by Gate |
| 26 | Feedback, Overlay & Progress | `skeleton` | Skeleton | `feedback-overlay-progress.json` | Deferred by Gate |
| 27 | Feedback, Overlay & Progress | `emptyState` | Empty State | `feedback-overlay-progress.json` | Deferred by Gate |
| 28 | Feedback, Overlay & Progress | `progressIndicator` | Progress Indicator | `feedback-overlay-progress.json` | Visual Gate |
| 29 | Feedback, Overlay & Progress | `stepper` | Stepper | `feedback-overlay-progress.json` | Visual Gate |
| 30 | Feedback, Overlay & Progress | `timeline` | Timeline | `feedback-overlay-progress.json` | Deferred by Gate |
| 31 | Search & Menu | `searchField` | Search Field | `search-menu.json` | Visual Gate |
| 32 | Search & Menu | `menu` | Menu | `search-menu.json` | Visual Gate |
| 33 | Search & Menu | `menuItem` | Menu Item | `search-menu.json` | Visual Gate |

## Count check

| Category | Canonical count | Current classification |
|---|---:|---|
| Actions & Forms | 8 | 2 Visual Gate / 6 Deferred |
| Navigation & Information | 11 | 6 Visual Gate / 5 Deferred |
| Feedback, Overlay & Progress | 11 | 5 Visual Gate / 6 Deferred |
| Search & Menu | 3 | 3 Visual Gate / 0 Deferred |
| **Core Components** | **33** | **16 Visual Gate / 17 Deferred** |

## Core Patterns — separate catalog

| Pattern ID | Library classification | Count as Component? |
|---|---|---|
| `statusComposition` | `Patterns/Status Composition` | No |
| `searchPattern` | `Patterns/Search Pattern` | No |

**Core Patterns: 2. Core Components: 33. They are deliberately not added together as “35 components.”**

## Property boundary

The visual-gate builder sometimes exposes PenPot implementation controls needed for a usable design asset (for example Card border on/off, Dialog action arrangement, or a representative determinate Progress value). These are classified in `penpot-library/catalog/visual-gate-properties.json` and must not be interpreted as new Core variants/states.
