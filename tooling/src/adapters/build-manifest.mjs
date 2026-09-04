import { createBuildManifest } from './renderers.mjs';

export const buildManifestAdapter = Object.freeze({
  id: 'meta.build-manifest',
  target: 'build-manifest',
  family: 'meta',
  outputPaths: Object.freeze(['dist/build-manifest.json']),
  build(model, context = {}) {
    return new Map([
      ['dist/build-manifest.json', createBuildManifest(model, context)],
    ]);
  },
});
