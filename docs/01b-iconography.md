# Iconography — V1 RC2

Iconography is part of the company mobile Core, not a per-product decoration layer.

Machine contract: `contracts/iconography.json`.

## Default source

Generic UI icons use **Lucide** by default.

This is a source-library decision, not a license to copy Lucide names into Design Tokens. The Design System owns the visual language and usage contract; the implementation may map semantic icon intents to Lucide exports.

Why Lucide:

- consistent outline language
- broad generic UI coverage
- stable 24×24 source grid
- practical React / React Native consumption

Brand marks, partner logos, illustrations and genuinely domain-specific symbols are exceptions.

## Visual language

Core generic UI icons use:

- outline style
- 24×24 source grid
- 2px default stroke
- round line caps
- round line joins
- no fill by default
- optical centering inside the assigned slot

Stroke style is an **Icon Contract**, not a token. Components must not invent 1.5px, 1.75px or 2.5px variants merely to make one screen look different.

## Shared visual sizes

The previous RC repeated literal 16 / 20 / 24 icon geometry across multiple contracts. That repetition had become a real system semantic, so RC2 promotes only these stable icon sizes:

| Semantic | Value | Typical use |
| --- | ---: | --- |
| `semantic.shared.icon.size.small` | 16px | compact adornment, Tag icon/dismiss, compact segmented icon |
| `semantic.shared.icon.size.medium` | 20px | standard control, field/search adornment, menu/list disclosure, status icon |
| `semantic.shared.icon.size.large` | 24px | Top App Bar action, Bottom Navigation, large IconButton, Dialog system icon |

These values live in a theme-independent `semantic.shared` namespace. Dark Theme does not patch visual icon size.

A matching shared loading-indicator scale exists only because it already has multiple real consumers:

- `semantic.shared.indicator.size.inline = 16px`
- `semantic.shared.indicator.size.regular = 24px`

Loading indicator size is **not** an alias of icon size even when the numeric value happens to match.

## Color

There is no parallel `icon.primary / icon.secondary / icon.danger` color palette.

Icons consume existing Semantic Color roles according to context:

- normal hierarchy → Text semantics
- active navigation → Brand text semantic
- action emphasis → Action semantic
- status marker on a neutral surface → Status chroma only when the actual pairing passes contrast
- necessary graphic on a tinted status surface → corresponding `*Text` semantic by default
- inverse Toast surface → inverse foreground; status meaning remains in icon shape + message

The last two rules were tightened in RC2 after real component consumer-path contrast failures were found.

## Icon-only actions and hit area

Visible icon size and interactive hit area are separate concerns.

- iOS: platform touch target remains at least 44pt
- Android: platform touch target remains at least 48dp
- an icon may visually render at 16 / 20 / 24 while its containing action provides the platform hit target
- icon-only actions require an accessible name
- decorative icons are hidden from the accessibility tree

## Custom icon admission

A custom generic UI icon is allowed only when:

1. no semantically correct default-library icon exists;
2. reusing a similar icon would mislead the user; or
3. the symbol is an identity/domain asset rather than generic UI chrome.

When a custom UI icon enters Core it must match the system optical language: equivalent 24×24 grid, 2px-equivalent outline weight, compatible round caps/joins, assigned shared size and Semantic Color use.

Do not add a custom icon merely to make one product look more decorative.

## Explicit non-icon geometry

Numeric equality does not imply shared semantics.

Checkbox indicators, Radio geometry, Switch thumbs, Stepper nodes, Progress circles, Avatar sizes and illustrations are **not** automatically mapped to the icon scale just because some of them are also 20 or 24px.

That distinction is deliberate: Token promotion follows stable cross-component meaning, not repeated numbers.
