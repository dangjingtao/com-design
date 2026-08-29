# Com Design — Design System Guide

> **Status:** Release Candidate (`1.0.0-rc.2`)  
> **Scope:** Company Mobile Core  
> **Platforms:** iOS / Android, with Tailwind / NativeWind / React Native consumers  
> **Last updated:** 2026-08-29

`design.md` is the canonical human-facing entry point for using Com Design correctly.

It summarizes the system's design language, architecture, usage rules, accessibility requirements, component model, and governance. It does **not** replace the structured source files under `design-source/`; when exact token values, component variants, or machine-readable contracts are needed, those source files remain authoritative.

---

## 1. Normative language

The words below are intentional:

- **MUST** — required for Core compliance.
- **MUST NOT** — prohibited in Core and product implementations.
- **SHOULD** — default practice; deviate only with a documented product or platform reason.
- **MAY** — optional and context-dependent.

When rules conflict, use this priority order:

1. Accessibility and platform safety.
2. User-task clarity and interaction correctness.
3. Semantic consistency with Com Design.
4. Platform convention.
5. Visual preference or decoration.

---

## 2. Purpose and scope

Com Design Mobile is the shared visual and interaction foundation for company mobile products. It is not owned by a single business application.

The system exists to make product UI:

- consistent across products;
- predictable across iOS and Android;
- fast to design and implement;
- accessible by default;
- maintainable through semantic tokens and explicit component contracts;
- consumable by designers, engineers, Penpot, build tooling, and AI agents from the same source of truth.

Product teams MAY extend Com Design for domain-specific needs, but **product extension MUST NOT mutate Core semantics or redefine existing Core tokens/components in place**.

---

## 3. Source of truth and authority

`design-source/` is the only editable design-system source of truth.

### 3.1 Authoritative sources

Use the following files according to their role:

| Need | Source |
| --- | --- |
| Design context, principles, usage narrative | `design-source/README.md` |
| Human-readable Core UX Pattern guidance | `design-source/UX_PATTERNS.md` |
| Structured token understanding | `design-source/css.json` |
| Runtime token variables, themes, density, platform and motion | `design-source/colors_and_type.css` |
| Component catalog | `design-source/components/index.json` |
| Exact component intent, anatomy, variants and restrictions | `design-source/components/{slug}.json` |
| Canonical Core UX Pattern contracts | `design-source/specs/core-patterns.json` |
| Structured system model and governance | `design-source/specs/design-system-v1.json` |
| Visual/DOM reference for a component | `design-source/preview/component-{slug}.html` |
| Penpot workflow | `design-source/PENPOT_MCP_PLAYBOOK.md` |
| Build/output contract | `design-source/BUILD_PIPELINE.md` |

Recommended read order for implementation work:

```text
design.md
-> design-source/README.md
-> design-source/css.json
-> design-source/colors_and_type.css
-> design-source/components/index.json
-> design-source/components/{slug}.json
-> design-source/UX_PATTERNS.md when multiple components/states/flows must compose
-> design-source/specs/core-patterns.json for exact Pattern contracts
-> design-source/preview/component-{slug}.html
```

### 3.2 Generated artifacts are never upstream sources

The following are downstream outputs or acceptance artifacts:

```text
Penpot assets / manifest
human reports
Tailwind preset/theme
NativeWind preset/theme
React Native tokens
```

They MUST NOT become upstream token sources.

Never create dependency chains such as:

```text
human docs -> Tailwind config
Penpot export -> NativeWind config
Tailwind config -> design-source
```

If a generated output is wrong, fix `design-source/` or its adapter/compiler.

---

## 4. Design character

Com Design is:

**Modern / Clear / Light / Efficient**

The default design posture is:

- **Compact-first** — information-dense mobile UI without cramped interaction targets.
- **Flat-first** — hierarchy comes from spacing, typography, color, border and surface before shadow.
- **Information hierarchy before decoration** — visual treatment serves comprehension and action.
- **Section before Card** — grouping does not automatically require a container.
- **Semantic before literal** — consume semantic roles instead of hard-coded primitive values.
- **Platform-aware, not platform-fragmented** — share semantics, adapt behavior and physical conventions where needed.

### 4.1 What Com Design should feel like

Interfaces SHOULD feel restrained, quick, structured and slightly technical rather than playful or ornamental.

Use whitespace to separate information, not to create oversized marketing layouts. Use color to identify action, status and emphasis, not to decorate every region.

**Brand color is a scarce hierarchy signal.** A screen MAY contain many actions, but it SHOULD contain very few brand-filled regions. Importance, clickability and brand-color area are separate decisions.

### 4.2 What Com Design is not

Core UI MUST NOT default to:

- gradients or glow effects;
- heavy glassmorphism;
- decorative shadows on ordinary cards/buttons/list items;
- oversized rounded containers around every content group;
- Cyan as a second global brand/active-navigation color;
- repeated brand-filled buttons merely because several actions are available;
- arbitrary one-off colors, radii, spacing or font sizes;
- visual states communicated by color alone.

---

## 5. System architecture

Com Design follows four design layers:

```text
Primitive -> Semantic -> Component -> Pattern -> Product Extension
```

### 5.1 Primitive

Raw design values such as palette steps, size values and base dimensions.

Primitive tokens exist to build the system. Product code SHOULD NOT consume them directly when a semantic token exists.

### 5.2 Semantic

Meaning-based roles such as:

```text
primary
background
foreground
surface
border
success
warning
danger
info
text-primary
text-secondary
```

Semantic tokens are the preferred product-facing interface.

### 5.3 Component

Component contracts combine semantic tokens with anatomy, states, variant dimensions and behavior expectations.

A component MUST reference semantic/component roles rather than reach directly into primitive palette values unless the source contract explicitly defines an exception.

### 5.4 Pattern

Patterns describe recurring multi-component solutions and interaction composition. They are not counted as components.

Current canonical Core patterns:

- `statusComposition`
- `searchPattern`
- `collectionFilter`
- `stateToAction`
- `intentContinuity`
- `contextualNextStep`

Their canonical machine source is `design-source/specs/core-patterns.json`; `design-source/UX_PATTERNS.md` is the human-readable guide.

A Pattern SHOULD be promoted to Core only when its intent and behavior remain reusable without product-domain names, page names or business-specific state enums.

### 5.5 Product extension

Product-specific components and tokens MAY be added above Core.

Extensions:

- MUST preserve existing Core meaning;
- MUST NOT silently alias a Core token to a different semantic purpose;
- SHOULD reuse Core component anatomy and interaction behavior where applicable;
- SHOULD introduce new tokens only when a stable reusable semantic role exists.

---

## 6. Mode axes

The system resolves design through four supported axes:

| Axis | Default | Supported |
| --- | --- | --- |
| Theme | light | light / dark |
| Density | compact | compact / comfortable |
| Platform | product-selected | iOS / Android |
| Motion | standard | standard / reduced |

Resolution conceptually follows:

```text
foundation
-> theme
-> density
-> platform
-> motion
-> component
-> pattern
-> product extension
```

Do not encode a mode difference by duplicating an entire component when a token or behavior override is sufficient.

---

## 7. Foundations

### 7.1 Color

#### Brand

Primary brand color:

```text
Electric Indigo #5B5EF7
```

Brand Indigo is used for:

- the highest-priority primary action;
- links and selected/active navigation;
- focus indication;
- brand text and selected-state emphasis;
- informational foreground emphasis where appropriate.

Brand Indigo SHOULD NOT be used as the default fill for every clickable control or informational container.

#### Accent

Accent Cyan:

```text
#16BFD3
```

Accent Cyan is **not a second primary color**. Reserve it for:

- local emphasis;
- progress;
- data visualization;
- small informational signals.

It MUST NOT replace Brand Indigo as the default active color for global navigation or primary actions.

#### Neutral and surfaces

The neutral palette is cool-toned and forms the basis of page, surface, border and text hierarchy.

Prefer semantic roles such as:

```text
--color-background
--color-surface
--color-surface-subtle
--color-text-primary
--color-text-secondary
--color-border
```

Default supporting actions and common informational containers MAY use neutral subtle surfaces so that brand color remains available for true hierarchy emphasis.

Do not hard-code palette steps in product screens when a semantic role exists.

#### Status

Status uses paired foreground/background semantics:

- Success
- Warning
- Danger
- Info

Info uses Brand Indigo as foreground emphasis, but its default container background is neutral-subtle rather than a second large brand-tinted region.

Critical state MUST NOT be communicated through color alone. Pair color with text and, when useful, an icon shape.

#### Dark mode

Dark mode is a semantic remapping, not a simple RGB inversion.

Every custom UI surface, text role, status role, border and interactive state MUST remain legible in both light and dark modes.

### 7.2 Typography

Base stack:

```text
system-ui, -apple-system, Segoe UI, Roboto, sans-serif
```

Com Design does not require a web font for Core UI.

Supported semantic roles:

| Role | Size / line height | Weight |
| --- | --- | --- |
| caption | 12 / 18 | 400 |
| label-small | 12 / 16 | 500 |
| body-small | 14 / 20 | 400 |
| label | 14 / 20 | 500 |
| body | 16 / 24 | 400 |
| heading-small | 16 / 22 | 600 |
| heading | 18 / 24 | 600 |
| title | 24 / 30 | 600 |
| display | 28 / 36 | 600 |

Rules:

- Body copy SHOULD use Regular 400.
- Labels SHOULD use Medium 500.
- Headings/titles SHOULD use SemiBold 600.
- Bold 700 is reserved; do not turn it into a default hierarchy layer.
- Do not invent intermediate font sizes without extending the token system.
- Do not use negative letter spacing as a default style.
- Text scaling MUST be tested in implementation; fixed visual mock dimensions must not prevent accessible text growth.

### 7.3 Spacing and layout

Base rhythm is a 4px-oriented grid with supported spacing values:

```text
0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32
```

Use:

- `12–16` for internal section grouping;
- `24–32` for separation between sections;
- `16` as the default content inset when the component/pattern does not specify otherwise.

Large whitespace SHOULD be composed from existing spacing roles rather than introducing arbitrary `40+` spacing tokens.

The source `px` unit is a **logical design unit**, not a physical screen pixel. Adapters map it to the appropriate layout unit for each target.

Do not multiply layout tokens by device `PixelRatio`.

### 7.4 Density and touch targets

Default density is `compact`:

- standard visual control height: `40px` logical units;
- large visual control height: `48px`;
- comfortable density raises control sizes/padding through density tokens.

Visual size and hit target are separate concepts.

Interactive hit targets MUST respect platform requirements:

- iOS: design toward a `44 x 44pt` default interaction region;
- Android: use at least a `48 x 48dp` touch target.

A control MAY look smaller than its platform touch target if the implementation safely expands the hit region without overlapping adjacent actions.

### 7.5 Radius

Semantic radius hierarchy:

```text
4px   small/detail
8px   controls
12px  containers
16px  overlays
pill  compact tags/badges/progress ends
```

Rules:

- ordinary controls SHOULD use `8px`;
- cards/containers SHOULD use `12px` or less;
- modal/overlay layers MAY use `16px`;
- pill radius is for naturally pill-shaped compact elements, not a universal style.

### 7.6 Borders

Core border widths:

```text
1px  normal control/container/divider
2px  focus emphasis
```

Use semantic border roles:

```text
subtle / default / strong / focused / error
```

The default light-theme border maps to the quieter neutral-300 level; use `strong` only when a boundary genuinely needs extra emphasis.

Do not use shadow as a substitute for a required boundary.

### 7.7 Elevation

Com Design is flat-first and has two primary elevation levels:

```text
floating
modal
```

Use elevation only when an element is genuinely lifted from the normal information flow.

Ordinary cards, buttons and list items MUST NOT receive default decorative shadows.

### 7.8 Iconography

Core icon visual sizes:

```text
16 / 20 / 24
```

Icons SHOULD:

- follow a consistent stroke/fill family within a product;
- inherit semantic foreground color;
- align with the surrounding text/control role;
- have an accessible label when the icon itself carries an action or meaning not already expressed by nearby text.

Do not mix unrelated icon styles on the same screen.

### 7.9 Motion

Standard motion tokens:

```text
fast      120ms
standard  220ms
slow      320ms
```

Motion SHOULD explain state change, spatial relation or feedback; it SHOULD NOT exist solely as decoration.

When reduced motion is active, nonessential transitions and animations MUST collapse or be replaced by a less motion-heavy treatment.

Avoid motion that blocks task completion, delays primary feedback, or creates unnecessary bounce/zoom.

---

## 8. Content design

Com Design UI copy is Chinese-first, professional, restrained and information-dense.

### 8.1 Voice

Copy SHOULD be:

- short;
- direct;
- action-oriented;
- neutral rather than promotional;
- understandable without depending on icon/color context.

### 8.2 Action labels

Prefer verb-first labels:

```text
确认提交
保存修改
查看详情
重新加载
```

Avoid vague labels such as:

```text
好的
知道了
点这里
立即体验
```

when a more specific action is available.

### 8.3 Errors and states

Error messages SHOULD tell the user what to do next, not merely announce failure.

Good:

```text
请输入有效的 11 位手机号
```

Weak:

```text
输入错误
```

Status text MUST be independently understandable, for example:

```text
已完成
待审核
当前无访问权限
```

### 8.4 Tone restrictions

Core product UI SHOULD NOT use:

- emoji as interface decoration;
- unnecessary exclamation marks;
- marketing landing-page language inside task flows;
- cute filler phrases that reduce clarity.

---

## 9. Component model

Com Design V1 contains **33 Core Components** and **6 Core UX Patterns**.

### 9.1 Actions & Forms — 8

```text
Button
Icon Button
Input / Text Field
Textarea
Select / Picker Trigger
Checkbox
Radio
Switch
```

### 9.2 Navigation & Information — 11

```text
List Item
Tabs
Segmented Control
Top App Bar
Bottom Navigation
Section
Divider
Card
Tag
Badge
Avatar
```

### 9.3 Feedback / Overlay / Progress — 11

```text
Toast
Snackbar
Alert / Inline Banner
Dialog
Bottom Sheet
Loading Indicator
Skeleton
Empty State
Progress Indicator
Stepper
Timeline
```

### 9.4 Search & Menu — 3

```text
Search Field
Menu
Menu Item
```

### 9.5 Core UX Patterns — 6

```text
Status Composition
Search Pattern
Collection Filter
State to Action
Intent Continuity / Handoff
Contextual Next Step
```

Patterns do **not** increase the Core Component count. They define reusable multi-component UX behavior and composition.

### 9.6 Pattern contract rules

Before inventing a product-local multi-component flow, read `design-source/UX_PATTERNS.md` and `design-source/specs/core-patterns.json`.

Promote a solution to Core Pattern only when:

- multiple products or domains can reuse the same intent and behavior;
- the pattern can be described without business-specific state enums or page names;
- existing Core Components already provide most of the anatomy;
- the real design problem is state, hierarchy, sequence, context or handoff rather than a missing independent control.

Do not create a new Core Component merely to hide a few lines of product composition.

### 9.7 Component contract rules

Before implementing or modifying a component, read its `design-source/components/{slug}.json` contract.

A mature component definition SHOULD cover:

- purpose / semantic role;
- anatomy;
- variants;
- sizes;
- interactive states;
- token references;
- content rules;
- usage guidance;
- accessibility behavior;
- prohibited invention / known unknowns.

Do not infer a new variant from visual convenience when the contract does not support it. Extend the contract first when a reusable new variant is genuinely needed.

### 9.8 State completeness

Interactive components SHOULD account for all relevant states, including where applicable:

```text
default
pressed / active
focused
selected / checked
loading
disabled
read-only
error
expanded / collapsed
```

Do not use `disabled` to represent `read-only`; they carry different interaction and accessibility semantics.

### 9.9 Primary action hierarchy

A view or action group SHOULD normally have one clear highest-priority primary action.

Primary is a **scarce hierarchy signal**, not the default style for every available action.

Use:

- **Primary** for the single strongest next step;
- **Secondary** for visible supporting actions that still need a control surface;
- **Tertiary / text action** for low-emphasis, navigational or auxiliary actions;
- **Destructive** only for destructive or difficult-to-recover actions.

Secondary uses a neutral subtle surface by default. Supporting actions MUST NOT become extra brand-filled blocks just to look equally actionable.

When several actions coexist, reduce visual competition before adding more color: choose one primary, demote support actions, and move overflow actions into an appropriate menu or sheet when the task does not require simultaneous visibility.

---

## 10. Composition and page patterns

### 10.1 Section before Card

Use `Section` as the default grouping mechanism.

Add a `Card` only when the content needs stronger containment, independent interaction, or visual separation from its surrounding surface.

Do not wrap every list group or text block in a card.

### 10.2 Information hierarchy

Build hierarchy in this order:

1. content order and grouping;
2. spacing;
3. typography;
4. semantic foreground/background color;
5. border;
6. elevation only when necessary.

Color density is part of hierarchy. Before adding a brand-tinted container, ask whether spacing, typography, neutral surface or a simple foreground accent already communicates the distinction.

Avoid stacking several simultaneous signals such as brand background + brand icon container + status tint + primary button in the same region unless each carries a distinct, necessary meaning.

### 10.3 Navigation

- Global active navigation uses Brand Indigo.
- Bottom navigation SHOULD contain 3–5 primary destinations.
- Tabs are for sibling views, not unrelated top-level destinations.
- Segmented Control is for short local mode/view switching, not primary app navigation.

### 10.4 Overlay discipline

Only one blocking modal layer SHOULD be active at a time.

Avoid Dialog-on-Dialog or Bottom-Sheet-on-Dialog stacks. Resolve the flow into a single clear step or replace the underlying modal first.

### 10.5 Loading, empty and error states

Choose feedback by meaning:

- short indeterminate wait -> Loading Indicator;
- content structure loading -> Skeleton;
- no content/results -> Empty State;
- recoverable inline problem -> Alert / field error;
- brief operation result -> Toast/Snackbar according to action requirements.

Do not use a generic empty state to hide a network or permission error.

### 10.6 Core UX Pattern application

Use the six Core UX Patterns when the design problem spans multiple components:

- **Status Composition** — state + explanation + optional evidence/recovery;
- **Search Pattern** — query + result state + intent preservation;
- **Collection Filter** — committed filter truth + draft editing + active condition feedback;
- **State to Action** — authoritative state determines the single strongest available action;
- **Intent Continuity / Handoff** — preserve the user's original task across login, authorization or external flows;
- **Contextual Next Step** — preserve active context and derive one meaningful next step from workflow state.

Detailed anatomy, rules and avoid-cases are defined in `design-source/UX_PATTERNS.md` and `design-source/specs/core-patterns.json`.

---

## 11. Accessibility baseline

Accessibility is a release requirement, not a later polish step.

Use **WCAG 2.2 Level AA as the cross-platform measurable baseline where applicable**, plus native iOS/Android accessibility conventions.

### 11.1 Perceivable

- Normal text SHOULD meet at least `4.5:1` foreground/background contrast.
- Large text MAY use the applicable `3:1` threshold.
- Important non-text UI boundaries/states SHOULD meet at least `3:1` against adjacent colors where required.
- Information MUST NOT rely on color alone.
- Light and dark themes MUST both be audited.

### 11.2 Operable

- Respect iOS/Android platform touch targets.
- Custom controls MUST provide visible pressed/selected feedback.
- Keyboard/focus-capable targets MUST expose a visible focus state where the platform supports it.
- Focus MUST NOT be obscured by sticky bars, overlays or sheets.
- Drag-only interactions SHOULD provide a non-drag alternative when practical.

### 11.3 Understandable

- Labels and instructions SHOULD be specific.
- Error text SHOULD identify the problem and suggest a correction when possible.
- Navigation and component behavior SHOULD remain consistent across screens.

### 11.4 Robust semantics

Interactive controls MUST expose the correct accessible role, name, state and value to the target platform.

Icon-only actions require an accessible name unless the surrounding component already provides an equivalent accessible label.

### 11.5 Reduced motion and text scaling

- Respect platform reduced-motion preferences.
- Text scaling MUST be tested without loss of critical content or function.
- Avoid fixed-height text containers that clip accessible font sizes.

A release MUST NOT claim accessibility compliance solely because its token colors were defined with accessibility in mind; actual rendered combinations and flows require testing.

---

## 12. Cross-platform implementation

Com Design shares semantic design intent across platforms while allowing platform-specific implementation.

### 12.1 Unit mapping

Source `px` values are logical design units:

| Source | Web / Tailwind | React Native / NativeWind |
| --- | --- | --- |
| `16px` spacing | `16px` CSS | `16` layout units |
| `8px` radius | `8px` | `8` |
| `40px` control | `40px` | `40` |

Do not convert the source system to `rem` merely to make Tailwind consumption possible.

### 12.2 Platform-specific concerns belong in adapters/implementation

Examples:

- safe-area handling;
- true hairline borders;
- native shadow/elevation mechanics;
- keyboard avoidance;
- system navigation behavior;
- accessibility font scaling;
- platform gestures and back behavior;
- viewport/screen-relative layout.

These differences SHOULD NOT force duplicate semantic token systems.

### 12.3 Generated engineering consumers

Engineering adapters expose semantic vocabulary such as:

```text
bg-primary
bg-background
text-foreground
border-border
rounded-control
h-control
```

Product code SHOULD prefer these consumer semantics over primitive palette classes.

---

## 13. Design tokens and external format compatibility

Com Design's current editable runtime source is repository-specific and already drives multiple targets.

When adding or exchanging structured token files with third-party tooling, new interchange work SHOULD align with the **Design Tokens Community Group (DTCG) Format Module 2025.10** where practical, especially for:

- typed token values;
- aliases/references;
- groups;
- cross-tool portability;
- resolver behavior.

Do **not** migrate or rewrite the current source merely to match an external file format unless the migration preserves existing semantics and the multi-target build contract.

---

## 14. Governance

### 14.1 Core modification rules

Core changes MUST be made in `design-source/` and validated before generated outputs are promoted.

The following policies are part of the current system contract:

- component-to-primitive references are forbidden by default;
- product extensions cannot mutate Core;
- critical state cannot be color-only;
- brand-filled area is a hierarchy resource and is not the default treatment for all clickable or informational surfaces;
- ordinary information surfaces do not receive default shadow;
- blocking modal stack depth is one;
- deprecation is required before removal;
- unused token creation is forbidden by default;
- literal geometry is retained only when no stable reusable semantic role exists.

### 14.2 Adding a token

Add a new token only when:

1. a real reusable design role exists;
2. existing semantic tokens cannot express it correctly;
3. the name describes meaning rather than one screen;
4. light/dark and relevant mode behavior are defined;
5. downstream adapter impact is understood.

Do not add tokens simply to avoid using an existing token whose value happens to differ from a mockup.

### 14.3 Adding or changing a component

A Core component change SHOULD include:

1. contract update;
2. token references;
3. representative visual/preview update;
4. relevant mode behavior;
5. accessibility behavior;
6. build/validation updates where required;
7. human-readable documentation update.

Behavior-heavy components MUST NOT be blindly generated from JSON contracts. Native accessibility, gestures, focus, controlled state, overlays and platform behavior still require explicit implementation.

### 14.4 Adding or changing a Core Pattern

A Core Pattern change SHOULD include:

1. reusable intent independent of one product domain;
2. explicit anatomy and participating components;
3. state/hierarchy/sequence rules;
4. avoid-cases that prevent over-styling or state duplication;
5. human-readable guidance in `design-source/UX_PATTERNS.md`;
6. machine-readable update in `design-source/specs/core-patterns.json`;
7. validation against at least one realistic multi-state flow before stable promotion.

Patterns MUST NOT be counted as Core Components or used to smuggle product-specific business objects into Core.

### 14.5 Deprecation and removal

Breaking removal requires a deprecation period.

A deprecation SHOULD state:

- what is deprecated;
- replacement guidance;
- migration impact;
- target removal version/date when known.

### 14.6 Versioning

`dev` is the integration and verification branch. `main` represents the stable design-system release.

Release candidates MUST pass the defined release gates before stable promotion.

---

## 15. Build and documentation policy

The system follows **one source, multiple sibling outputs**:

```text
design-source/
   |
   +-> human docs
   +-> Penpot manifest
   +-> Tailwind adapter
   +-> NativeWind adapter
   +-> React Native tokens
```

### 15.1 Human documentation

Human-readable reports are first-class acceptance evidence.

Accepted reports MUST NOT be silently overwritten or deleted by engineering builds. Historical reports must remain readable and traceable.

### 15.2 Generated output

Generated engineering output MUST NOT be hand-maintained as the source of truth.

If generated values differ across Tailwind, NativeWind, React Native or Penpot, treat that as a pipeline defect and resolve it upstream.

### 15.3 Repository validation

Current repository-level commands include:

```bash
npm test
npm run validate
npm run build:engineering
npm run build:penpot
npm run build:all
```

A design-system change is not complete merely because a preview looks correct; source validation and affected target builds must also succeed.

---

## 16. Definition of done for design work

Before considering a Core design change complete, verify:

- [ ] The change solves a real reusable design need.
- [ ] Existing semantic tokens/components were reused where appropriate.
- [ ] No product-specific value leaked into Core without a reusable semantic role.
- [ ] Light and dark modes were considered.
- [ ] Compact and comfortable density remain coherent where relevant.
- [ ] iOS and Android touch/platform differences were considered.
- [ ] Motion has a reduced-motion path where relevant.
- [ ] Component anatomy and states are complete.
- [ ] Multi-component UX uses an existing Core Pattern or documents why a new reusable Pattern is needed.
- [ ] Text, icons and color do not carry critical meaning through color alone.
- [ ] Primary/brand-filled treatment is limited to genuinely dominant actions or selected emphasis rather than repeated across ordinary actions.
- [ ] Contrast and rendered accessibility are testable.
- [ ] Product UI uses semantic rather than primitive values.
- [ ] No unnecessary gradient, glow, shadow, oversized card or invented radius was introduced.
- [ ] Structured source and component/pattern contract are updated before downstream artifacts.
- [ ] Validation/build checks pass.
- [ ] Human documentation remains consistent and historical accepted reports remain intact.

---

## 17. Fast decision rules

When unsure, use these defaults:

```text
Need grouping?            -> Section first, Card only if containment is needed.
Need primary action?      -> Brand Indigo, normally one dominant action per view/action group.
Need supporting action?   -> Secondary neutral surface; use Tertiary/text when less emphasis is enough.
Need local highlight?     -> Accent Cyan may be appropriate.
Need status?              -> Status Composition; semantic foreground + readable text, Info defaults to a neutral container.
Need search?              -> Search Pattern; preserve query intent and distinct result states.
Need mobile filtering?    -> Collection Filter; page owns committed state, sheet owns draft state.
Need state-dependent CTA? -> State to Action; explain the state and expose one strongest available action.
Need login/external hop?  -> Intent Continuity; preserve safe return target and map result back to existing state.
Need long workflow?       -> Contextual Next Step; preserve active context and derive one meaningful next step.
Need spacing?             -> Use existing spacing tokens; do not invent 10/14/18/etc.
Need radius?              -> 8 control / 12 container / 16 overlay.
Need depth?               -> Border/surface first; shadow only for floating/modal layers.
Need smaller visuals?     -> Keep platform hit target large enough.
Need dark mode?           -> Semantic remap, never naive inversion.
Need a new variant?       -> Extend the component contract before implementation.
Need a product-specific style? -> Extend above Core; do not mutate Core.
Need an engineering value? -> Consume generated semantic adapter output, not raw primitives.
```

---

## 18. References

Com Design is its own visual system; external standards are used as engineering and accessibility references rather than visual templates.

- Design Tokens Community Group — Format Module 2025.10: https://www.designtokens.org/TR/2025.10/format/
- W3C — Web Content Accessibility Guidelines (WCAG) 2.2: https://www.w3.org/TR/WCAG22/
- Apple Human Interface Guidelines — Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Apple Human Interface Guidelines — Dark Mode: https://developer.apple.com/design/human-interface-guidelines/dark-mode
- Android Developers — Accessibility: https://developer.android.com/guide/topics/ui/accessibility/apps

Repository-specific detailed contracts remain authoritative over generic external styling guidance.
