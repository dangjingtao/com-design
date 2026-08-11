# Com Design Build Pipeline Contract

Status: **Architecture contract / not fully implemented yet**  
Date: 2026-08-12

This document defines how Com Design should evolve from the current `design-source -> Penpot manifest` flow into a single-source, multi-target build system. It is a build contract, not a claim that every target already exists.

## 1. Core rule: one source, multiple outputs

`design-source/` is the only editable source of truth for design tokens and component contracts.

Human documentation, Penpot assets, Tailwind configuration, NativeWind configuration, and React Native token modules are all generated or adapted **from the same source**. None of those generated outputs may become an upstream source for another output.

```text
design-source/
  colors_and_type.css
  components/*.json
  specs/*.json
        |
        v
  Com Design build pipeline
        |
        +-- report/design-system-v1/       Human documentation / acceptance evidence
        +-- penpot/build/manifest.json     Penpot manifest
        +-- dist/tailwind/                 Tailwind adapter output
        +-- dist/nativewind/               NativeWind adapter output
        +-- dist/react-native/             React Native token output
```

The human report and engineering configuration are sibling outputs, not parent/child artifacts.

Do not create dependencies such as:

```text
human docs -> Tailwind config
Penpot export -> NativeWind config
Tailwind config -> design-source
```

## 2. Current state

Already implemented:

```text
design-source/colors_and_type.css
        + component contracts
        -> penpot/bin/build.mjs
        -> penpot/build/manifest.json
```

The existing compiler already parses consumer-facing token families such as color, spacing, radius, size, shadow, typography, light/dark sets, density, and platform touch targets.

Not implemented yet:

- unified repository-level `build:all`
- generated Tailwind adapter
- generated NativeWind adapter
- generated React Native TypeScript tokens
- generated human documentation from the same normalized token model
- cross-target consistency checks

These targets must be added without rewriting the existing design source.

## 3. Unit contract: `px` is a logical design unit

Com Design keeps `px` in its design source.

`px` in source tokens means **logical design scale**, not device physical pixels.

| Source | Web / Tailwind | React Native / NativeWind |
| --- | --- | --- |
| `16px` spacing | `16px` CSS layout unit | `16` RN density-independent layout unit |
| `8px` radius | `8px` | `8` |
| `40px` control height | `40px` | `40` |
| `44px` iOS touch target | `44px` | `44` |
| `48px` Android touch target | `48px` | `48` |

Do not multiply layout tokens by `PixelRatio`. Do not convert the source system to `rem` merely to support Tailwind or NativeWind.

Platform-specific exceptions belong in adapters:

- true hairline borders
- safe-area handling
- viewport/screen-relative layout
- platform-native shadows/elevation
- accessibility font scaling

## 4. Build targets

### 4.1 Human documentation

Human documentation is a **first-class acceptance artifact**. It is not disposable generated output.

The current live report remains:

```text
report/design-system-v1/
```

Future generated reports must be versioned so that every accepted or reviewed report remains available as historical evidence. A newer build may become the current entry point, but it must not delete or overwrite the previously accepted report.

Recommended shape:

```text
report/
  design-system-v1/             current accepted report
  versions/
    <version-or-date>/           retained report snapshot
  archive/
    ...                          additional immutable historical markers
```

A `current` or `latest` entry may point to the newest accepted report, but must be treated as a pointer/entry point rather than the sole copy of the report.

The human report should display the normalized values that the engineering adapters actually consume. Where useful it may show mapping examples such as:

```text
color.primary
#5B5EF7
Tailwind / NativeWind: bg-primary
React Native: tokens.color.primary
```

The report must never maintain a second hand-written token table that can drift from `design-source`.

### 4.2 Penpot

Keep the existing manifest target:

```text
penpot/build/manifest.json
```

The existing Penpot compiler remains an adapter of the common design source.

### 4.3 Tailwind

Planned target:

```text
dist/tailwind/
```

The adapter should expose semantic consumer tokens rather than force product code to use primitive palette names.

Preferred usage shape:

```text
bg-primary
text-text-primary
border-border
rounded-control
h-control
```

Primitive tokens may remain available for tooling/debugging, but application code should prefer semantic tokens.

### 4.4 NativeWind

Planned target:

```text
dist/nativewind/
```

NativeWind should consume the same semantic token vocabulary as Tailwind wherever the platform supports the same concept. Platform-only behavior is handled by the NativeWind/RN adapter rather than by mutating the design source.

### 4.5 React Native tokens

Planned target:

```text
dist/react-native/tokens.ts
```

This target exists for cases where a component needs raw RN values instead of utility classes, for example animation, gesture, imperative style, or platform API integration.

## 5. Component boundary

Token/config generation can be automatic.

Component implementation should **not** be blindly generated from the 33 component JSON contracts.

Component contracts may drive:

- variant names
- allowed states
- token references
- recipe/class mappings
- generated TypeScript types
- documentation tables
- contract tests

But behavior-heavy components still require explicit React Native implementation for accessibility, gestures, focus, controlled state, animation, overlays, safe areas, and platform differences.

## 6. Proposed commands

The final repository-level build interface should converge on:

```bash
npm run validate
npm run build:docs
npm run build:penpot
npm run build:tailwind
npm run build:nativewind
npm run build:react-native
npm run build:all
```

`build:all` should perform, in order:

```text
validate source
-> normalize token model
-> build a new versioned human report
-> build Penpot manifest
-> build Tailwind adapter
-> build NativeWind adapter
-> build React Native tokens
-> cross-target consistency checks
```

A target may be built independently during development, but CI should use the full build and consistency checks.

## 7. Generated-output policy

1. Never hand-edit generated Tailwind, NativeWind, RN-token, Penpot-manifest, or generated token-table output.
2. Fix `design-source` or the adapter/compiler instead.
3. Generated engineering output may be committed when useful for downstream consumers, review, release, or static hosting.
4. Human reports are retained acceptance artifacts and are explicitly exempt from cleanup rules that apply to disposable build output.
5. CI must be able to rebuild the same semantic values from the same source revision.

## 8. Human-document retention and archive policy

**Human reports must never be deleted as part of normal build, publish, cleanup, or migration workflows.** They are an important basis for design-system review and acceptance.

Rules:

1. Never delete an accepted human report.
2. Never overwrite an accepted report in place with materially different content.
3. Before promoting a new report as current, preserve the existing report as a versioned or immutable snapshot.
4. Preserve the exact Git commit/source revision associated with each retained report whenever practical.
5. A report may move from the current entry point into `versions/` or `archive/`, but that move must preserve its complete readable assets and historical traceability.
6. Archived/versioned reports never feed future builds and never become a design-system source of truth.
7. Automated cleanup jobs must exclude `report/design-system-v1/`, `report/versions/**`, and `report/archive/**` unless a human explicitly authorizes a specific deletion.

Preferred historical marker:

```text
report/archive/<report-name>-<reason>-YYYY-MM-DD/
```

An archive may reference an immutable Git commit/tree when that reference preserves the complete historical report. The existing `report/design-system-v1/` stays intact as acceptance evidence while the unified document generator is introduced.

## 9. CI trigger contract

When the implementation phase begins, changes under these source paths should trigger the multi-target build:

```text
design-source/colors_and_type.css
design-source/components/**
design-source/specs/**
```

Changes to generated output alone must not be treated as design-source changes.

Recommended CI responsibility:

```text
source change
-> validate
-> build:all
-> verify generated diff
-> preserve previous accepted human report
-> publish new versioned human report / package artifacts according to branch policy
```

Branch policy remains:

- `dev`: integration and verification
- `main`: stable design-system release

## 10. Definition of done for the implementation phase

The pipeline is considered complete only when:

- one source token change propagates to all enabled build targets;
- light/dark semantic values stay aligned across targets;
- spacing/radius/type/size values stay aligned across targets;
- `px` source values map correctly to RN numeric layout units;
- generated human docs show the same normalized values as engineering output;
- previously accepted human reports remain readable and traceable after new builds;
- no normal build or publish path can delete retained reports;
- CI detects stale or inconsistent generated artifacts;
- product projects can consume generated adapters without copying token values by hand.

Until those checks exist, Tailwind/NativeWind support should be described as **planned**, not complete.
