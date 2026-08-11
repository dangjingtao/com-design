# Com Design engineering adapters

This directory contains the first implemented phase of the multi-target build pipeline.

## Source of truth

Engineering adapters read only from:

```text
design-source/colors_and_type.css
```

They do not read token values back from the human report, Penpot output, Tailwind output, or NativeWind output.

## Commands

From the repository root:

```bash
npm test
npm run validate
npm run build:engineering
npm run build:penpot
npm run build:all
```

`build:all` deliberately does **not** regenerate or overwrite `report/design-system-v1/`. Accepted human reports are retained acceptance evidence and are handled by a separate versioned documentation pipeline.

## Generated engineering outputs

`npm run build:engineering` writes:

```text
dist/
  tailwind/
    preset.cjs
    theme.css
  nativewind/
    preset.cjs
    theme.css
  react-native/
    tokens.ts
  build-manifest.json
```

The generated files are disposable engineering artifacts: edit the design source or adapter code instead of hand-editing generated values.

## Tailwind consumption

Use the generated preset in the product's own Tailwind config. The product remains responsible for its own `content` paths and plugins.

```js
module.exports = {
  presets: [require('<com-design>/dist/tailwind/preset.cjs')],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
};
```

Import `dist/tailwind/theme.css` into the product CSS so semantic color variables and dark-mode overrides are available.

## NativeWind v4 consumption

NativeWind v4 still uses the Tailwind configuration model. Keep NativeWind's official preset first, then the Com Design consumer preset:

```js
module.exports = {
  presets: [
    require('nativewind/preset'),
    require('<com-design>/dist/nativewind/preset.cjs'),
  ],
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
};
```

Use `dist/nativewind/theme.css` as part of the NativeWind CSS input. It carries the same semantic color variables plus Com Design density and platform scopes.

Examples generated from current contracts include:

```text
bg-primary
bg-background
text-foreground
rounded-control
h-control
h-control-lg
min-h-touch-min
```

`h-control` follows `.density-comfortable` when that scope is active. `min-h-touch-min` follows `.platform-android` when that scope is active.

## React Native direct tokens

`dist/react-native/tokens.ts` is for cases where utility classes are not the right interface, such as animation, gesture code, imperative styles, or platform APIs.

Source `px` dimensions are emitted as 1:1 React Native density-independent numeric layout values. Do not multiply them by `PixelRatio`.

## Dark mode fix shared with Penpot

The shared parser now resolves root aliases against the dark table as well. Therefore a token such as `color-background` correctly changes when the primitive or semantic token it references is overridden in `.dark`, even when `color-background` itself is not redeclared in `.dark`.
