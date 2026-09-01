import { createTailwindPreset, createThemeCss } from './renderers.mjs';

export const nativeWindAdapter = Object.freeze({
  id: 'native-mobile.nativewind',
  target: 'nativewind',
  family: 'native-mobile',
  outputPaths: Object.freeze([
    'dist/nativewind/preset.cjs',
    'dist/nativewind/theme.css',
  ]),
  build(model) {
    return new Map([
      [
        'dist/nativewind/preset.cjs',
        createTailwindPreset(model, 'NativeWind v4 consumer'),
      ],
      ['dist/nativewind/theme.css', createThemeCss(model)],
    ]);
  },
});
