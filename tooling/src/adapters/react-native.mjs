import { createReactNativeTokens } from './renderers.mjs';

export const reactNativeAdapter = Object.freeze({
  id: 'native-mobile.react-native',
  target: 'react-native',
  family: 'native-mobile',
  outputPaths: Object.freeze(['dist/react-native/tokens.ts']),
  build(model) {
    return new Map([
      ['dist/react-native/tokens.ts', createReactNativeTokens(model)],
    ]);
  },
});
