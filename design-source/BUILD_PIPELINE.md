# Com Design Build Pipeline Contract

Status: **Phase 1 implemented / versioned human-doc builder pending**  
Date: 2026-08-12

This document defines the Com Design single-source, multi-target build contract and records the current implementation state.

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

## 2. Current implementation state

Phase 1 is implemented on `dev`.

Implemented:

- shared normalized token model in `tooling/src/token-model.mjs`;
- transitive light/dark alias resolution shared with the existing Penpot parser;
- repository-level validation and tests;
- generated Tailwind preset + theme variables;
- generated NativeWind v4 consumer preset + theme variables;
- generated React Native TypeScript tokens;
- compact/comfortable density mapping;
- iOS/Android minimum touch-target mapping;
- existing Penpot manifest build preserved;
- repository-level `build:all` for all non-report targets;
- GitHub Actions verification on `dev` and pull requests;
- CI artifacts for engineering adapters and Penpot manifest;
- CI guard proving `report/design-system-v1/` is not modified by the engineering build.

Still pending:

- versioned human-document generator from the normalized model;
- promotion/current-pointer flow for newly generated human reports;
- component-contract recipe/type generation from `components/*.json`;
- stronger cross-target snapshot checks beyond the current token/adapter tests;
- release/package distribution policy beyond GitHub Actions artifacts.

The engineering implementation must continue without rewriting the existing design source.

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

- true hairline borders;
- safe-area handling;
- viewport/screen-relative layout;
- platform-native shadows/elevation;
- accessibility font scaling.

## 4. Build targets

### 4.1 Human documentation

Human documentation is a **first-class acceptance artifact**. It is not disposable generated output.

The current accepted report remains:

```text
report/design-system-v1/
```

The Phase 1 engineering build does not touch this directory.

The next document phase must generate a new versioned report from the normalized token model while preserving every previously accepted report. A newer build may become the current entry point, but it must not delete or overwrite the previously accepted report.

Recommended shape:

```text
report/
  design-system-v1/             current accepted report
  versions/
    <version-or-date>/           retained report snapshot
  archive/
    ...                          immutable historical markers
```

A `current` or `latest` entry may point to the newest accepted report, but must be treated as a pointer/entry point rather than the sole copy of the report.

### 4.2 Penpot

Implemented target:

```text
penpot/build/manifest.json
```

The Penpot compiler continues to consume the same CSS-variable resolver. Dark aliases are now re-resolved against the dark token table, so aliases inherit dark primitive/semantic overrides even when the alias itself is not redeclared inside `.dark`.

### 4.3 Tailwind

Implemented target:

```text
dist/tailwind/
  preset.cjs
  theme.css
```

The adapter exposes semantic consumer tokens instead of forcing product code to use primitive palette names.

Representative usage:

```text
bg-primary
bg-background
text-foreground
border-border
rounded-control
h-control
```

Product projects remain responsible for their own Tailwind `content` paths and product-specific plugins.

### 4.4 NativeWind

Implemented Phase 1 target for NativeWind v4:

```text
dist/nativewind/
  preset.cjs
  theme.css
```

NativeWind consumes the same semantic vocabulary as Tailwind. The generated CSS also carries Com Design density and platform variables so `h-control` can follow the density scope and `min-h-touch-min` can follow the platform scope.

Product apps must still include NativeWind's own official preset/configuration in addition to the Com Design consumer preset.

### 4.5 React Native tokens

Implemented target:

```text
dist/react-native/tokens.ts
```

This target is for animation, gesture, imperative style, platform API, or other code paths where utility classes are not the right interface.

It emits source `px` dimensions as numeric RN layout values and includes light/dark colors, compact/comfortable density, platform touch minimums, typography, shadows, and motion tokens.

## 5. Component boundary

Token/config generation can be automatic.

Component implementation should **not** be blindly generated from the 33 component JSON contracts.

Component contracts may drive:

- variant names;
- allowed states;
- token references;
- recipe/class mappings;
- generated TypeScript types;
- documentation tables;
- contract tests.

Behavior-heavy components still require explicit React Native implementation for accessibility, gestures, focus, controlled state, animation, overlays, safe areas, and platform differences.

## 6. Commands

Implemented repository-level commands:

```bash
npm test
npm run validate
npm run build:engineering
npm run build:penpot
npm run build:all
```

Current `build:all` order:

```text
validate source
-> build Tailwind adapter
-> build NativeWind adapter
-> build React Native tokens
-> build Penpot manifest
-> leave accepted human report untouched
```

A future `build:docs` must be introduced only together with versioned report retention. It must not silently turn `build:all` into an overwrite operation against the accepted report.

## 7. Generated-output policy

1. Never hand-edit generated Tailwind, NativeWind, RN-token, Penpot-manifest, or generated token-table output.
2. Fix `design-source` or the adapter/compiler instead.
3. Generated engineering output may be committed when useful for downstream consumers, review, release, or static hosting.
4. Human reports are retained acceptance artifacts and are explicitly exempt from cleanup rules that apply to disposable build output.
5. CI must be able to rebuild semantic values from the same source revision.
6. GitHub Actions may publish generated engineering files as artifacts; those artifacts do not become the source of truth.

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

The existing `report/design-system-v1/` stays intact as acceptance evidence while the versioned document generator is introduced.

## 9. CI trigger contract

The implemented workflow is:

```text
.github/workflows/design-system-build.yml
```

Changes to design source, tooling, Penpot compiler code, or build configuration trigger:

```text
unit tests
-> validate
-> build engineering adapters
-> build Penpot manifest
-> assert accepted report is unchanged
-> upload engineering artifact
-> upload Penpot manifest artifact
```

Branch policy remains:

- `dev`: integration and verification;
- `main`: stable design-system release.

## 10. Definition of done

### Phase 1 engineering pipeline — done

- one source token model drives Tailwind, NativeWind, RN, and Penpot builds;
- transitive dark aliases resolve correctly;
- `px` source values map correctly to RN numeric layout units;
- density and platform touch-target scopes are represented;
- CI executes tests and the real repository build;
- accepted human report is protected from engineering build writes;
- generated engineering artifacts are available from CI.

### Full pipeline — pending

The full pipeline is complete only when:

- new human docs are generated from the same normalized model;
- every accepted human report remains readable and traceable after new builds;
- report promotion is versioned rather than overwrite-based;
- component contracts can generate validated recipe/type metadata where appropriate;
- stronger cross-target snapshot checks detect stale or inconsistent generated artifacts;
- product projects have a stable distribution/consumption path without copying token values by hand.
