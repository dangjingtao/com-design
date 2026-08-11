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
        +-- report/design-system-v1/       Human documentation
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

Target:

```text
report/design-system-v1/
```

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
-> build human docs
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
3. Generated output may be committed when useful for downstream consumers, review, release, or static hosting.
4. CI must be able to rebuild the same semantic values from the same source revision.

## 8. Human-document archive policy

Before replacing a published human report, preserve an immutable snapshot of the previous report revision.

Preferred archive marker:

```text
report/archive/<report-name>-<reason>-YYYY-MM-DD/
```

An archive may reference an immutable Git commit/tree instead of duplicating every generated asset. Archived output is historical material only: it never feeds future builds and never becomes a source of truth.

`report/design-system-v1/` remains the live report until the new human-doc generator is implemented and verified.

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
-> publish human docs / package artifacts according to branch policy
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
- archived reports are never overwritten;
- CI detects stale or inconsistent generated artifacts;
- product projects can consume generated adapters without copying token values by hand.

Until those checks exist, Tailwind/NativeWind support should be described as **planned**, not complete.
