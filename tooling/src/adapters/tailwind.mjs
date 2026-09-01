import { createTailwindPreset, createThemeCss } from './renderers.mjs';

export const tailwindAdapter = Object.freeze({
  id: 'web.tailwind',
  target: 'tailwind',
  family: 'web',
  outputPaths: Object.freeze([
    'dist/tailwind/preset.cjs',
    'dist/tailwind/theme.css',
  ]),
  build(model) {
    return new Map([
      ['dist/tailwind/preset.cjs', createTailwindPreset(model, 'Tailwind')],
      ['dist/tailwind/theme.css', createThemeCss(model)],
    ]);
  },
});
