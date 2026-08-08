# Phase 2 Self Review — Actions & Forms

Status: **self-review passed with corrections applied**

This is an author self-check, not an independent second review. Independent review should still be done by Codex or another reviewer before merge.

## Scope checked

- `tokens/tokens.json`
- `docs/02-actions-forms.md`
- `contracts/actions-forms.json`
- Token → Semantic → Component reference discipline
- Density / Platform mode usage
- Button, Icon Button, Input, Textarea, Select, Checkbox, Radio, Switch state coverage
- Accessibility-critical contrast and hit-area assumptions
- Human-readable vs machine-readable consistency

## Blocking issues found and corrected

### 1. Form control boundary contrast was too weak

Previous `color.border.default` resolved to `neutral.300 (#CDD3E1)`, which was too faint against a white control surface for a control boundary that users need to perceive.

Correction:

- `neutral.400` adjusted to `#8590A3`
- `color.border.default` now maps to `neutral.400`
- `color.border.strong` maps to `neutral.500`

This intentionally makes form controls slightly more explicit while keeping separators on `border.subtle` light.

### 2. Placeholder / disabled text was too faint

Previous `neutral.400` was also used for placeholder and disabled text. That produced overly weak text on light surfaces.

Correction:

- `neutral.500` adjusted to `#687288`
- `color.text.placeholder` → `neutral.500`
- `color.text.disabled` → `neutral.500`

Placeholder and Disabled remain separate Semantic roles even though V1 currently resolves them to the same Primitive.

### 3. Filled destructive button contrast was insufficient

The previous Danger 500 (`#ED4C5C`) with inverse white label was not strong enough for normal-size button text.

Correction:

- `danger.500` adjusted to `#D63E50`
- Destructive button remains `color.action.destructive + color.text.inverse`

The new value preserves the energetic red direction while giving the primary destructive action enough visual/text contrast.

### 4. Focus width bypassed Semantic tokens

The contract used a hard-coded `2px` focus border even though the foundation already had Primitive border widths.

Correction:

- Added Semantic `border.focus` → `primitive.border.width.2`
- Shared focus and focused Input/Select now reference `border.focus`

### 5. Field spacing was described as Density behavior but hard-coded in the component contract

Correction:

Density modes now own:

- `fieldLabelGap`
- `fieldHelperGap`
- `fieldGap`

The Field Family consumes these through `modeRef` instead of duplicating compact/comfortable literal values.

### 6. Read-only Input was too close to Disabled

Correction:

Read-only now keeps normal text and default surface, uses a subtle border, remains copyable, and does not expose editable focus behavior. Disabled continues to use subtle surface + disabled text.

### 7. Several machine contracts were under-specified

Icon Button, Select, Checkbox, Radio, and Switch had names for variants/states without complete visual binding information.

Correction:

The component contract now defines concrete Semantic bindings for the relevant states, including selected, pressed, disabled and error/open behavior where applicable.

### 8. Accessibility requirements were implicit

Correction:

Machine contracts now explicitly record accessible-name / role / state requirements for actions, picker triggers, form controls and selection controls. Visual size remains independent of the platform hit target.

### 9. Component reference resolution was ambiguous

The machine contract used short refs such as `color.action.primary` and abstract mode refs such as `density.controlHeight`, but did not define resolution rules.

Correction:

`$metadata` now defines:

- `tokenNamespace = semantic.light`
- `modeNamespace = modes`
- resolver rules for `tokenRef`, `modeRef`, and component-local fixed geometry

A first JSON Schema is added at `schemas/component-contract-v1.schema.json`.

## Non-blocking observations retained for later phases

- Success / Warning main status colors are currently intended primarily for icon/border/status emphasis; text uses the darker `*Text` semantic roles. Phase 5 accessibility audit should verify every final usage context rather than forcing all status primitives to one contrast target now.
- Textarea maximum visible height is a V1 behavioral recommendation, not a hard platform invariant.
- Picker presentation (sheet/dialog/native picker) remains deliberately outside Phase 2; Phase 4 owns Overlay / Picker presentation patterns.
- No component-specific token matrix was created just to make the contract look complete. Fixed geometry remains component-local until reuse proves a Semantic role is warranted.

## Self-review result

**PASS after corrections.**

The Phase 2 contract is now suitable to hand to an independent reviewer. Merge should wait for that independent review if one is available.
