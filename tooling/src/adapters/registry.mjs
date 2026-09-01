import fs from 'node:fs';
import path from 'node:path';
import { tailwindAdapter } from './tailwind.mjs';
import { nativeWindAdapter } from './nativewind.mjs';
import { reactNativeAdapter } from './react-native.mjs';
import { buildManifestAdapter } from './build-manifest.mjs';

const ADAPTER_KEY = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

function assertAdapter(adapter) {
  if (!adapter || typeof adapter !== 'object') {
    throw new TypeError('adapter must be an object.');
  }
  for (const key of ['id', 'target', 'family']) {
    if (typeof adapter[key] !== 'string' || !ADAPTER_KEY.test(adapter[key])) {
      throw new TypeError(`adapter ${key} must be a stable lowercase key.`);
    }
  }
  if (!Array.isArray(adapter.outputPaths) || adapter.outputPaths.length === 0) {
    throw new TypeError(`adapter ${adapter.id} must declare outputPaths.`);
  }
  if (new Set(adapter.outputPaths).size !== adapter.outputPaths.length) {
    throw new TypeError(`adapter ${adapter.id} declares duplicate outputPaths.`);
  }
  for (const outputPath of adapter.outputPaths) {
    if (
      typeof outputPath !== 'string' ||
      outputPath.length === 0 ||
      path.isAbsolute(outputPath) ||
      outputPath.split(/[\\/]/).includes('..')
    ) {
      throw new TypeError(`adapter ${adapter.id} has an invalid output path: ${outputPath}`);
    }
  }
  if (typeof adapter.build !== 'function') {
    throw new TypeError(`adapter ${adapter.id} must provide build(model).`);
  }
}

function freezeRegisteredAdapter(adapter) {
  return Object.freeze({
    ...adapter,
    outputPaths: Object.freeze([...adapter.outputPaths]),
  });
}

function publicDescriptor(adapter) {
  return Object.freeze({
    id: adapter.id,
    target: adapter.target,
    family: adapter.family,
    outputPaths: Object.freeze([...adapter.outputPaths]),
  });
}

export function createAdapterRegistry(initialAdapters = []) {
  const adapters = [];
  const byId = new Map();
  const byTarget = new Map();
  const claimedOutputs = new Map();

  const registry = {
    register(adapter) {
      assertAdapter(adapter);
      const registered = freezeRegisteredAdapter(adapter);

      if (byId.has(registered.id)) {
        throw new Error(`adapter id is already registered: ${registered.id}`);
      }
      if (byTarget.has(registered.target)) {
        throw new Error(`adapter target is already registered: ${registered.target}`);
      }
      for (const outputPath of registered.outputPaths) {
        if (claimedOutputs.has(outputPath)) {
          throw new Error(
            `adapter output is already claimed by ${claimedOutputs.get(outputPath)}: ${outputPath}`,
          );
        }
      }

      adapters.push(registered);
      byId.set(registered.id, registered);
      byTarget.set(registered.target, registered);
      for (const outputPath of registered.outputPaths) {
        claimedOutputs.set(outputPath, registered.id);
      }
      return registry;
    },

    getById(id) {
      return byId.get(id) ?? null;
    },

    getByTarget(target) {
      return byTarget.get(target) ?? null;
    },

    list() {
      return adapters.map(publicDescriptor);
    },

    build(model) {
      const files = new Map();

      for (const adapter of adapters) {
        const built = adapter.build(model);
        if (!(built instanceof Map)) {
          throw new TypeError(`adapter ${adapter.id} build(model) must return a Map.`);
        }

        const declared = new Set(adapter.outputPaths);
        for (const [relativePath, content] of built) {
          if (!declared.has(relativePath)) {
            throw new Error(
              `adapter ${adapter.id} emitted undeclared output: ${relativePath}`,
            );
          }
          if (files.has(relativePath)) {
            throw new Error(`duplicate adapter output emitted: ${relativePath}`);
          }
          if (typeof content !== 'string') {
            throw new TypeError(
              `adapter ${adapter.id} output must be UTF-8 text: ${relativePath}`,
            );
          }
          files.set(relativePath, content);
        }

        for (const relativePath of declared) {
          if (!built.has(relativePath)) {
            throw new Error(
              `adapter ${adapter.id} did not emit declared output: ${relativePath}`,
            );
          }
        }
      }

      return files;
    },
  };

  for (const adapter of initialAdapters) registry.register(adapter);
  return registry;
}

export const builtInEngineeringAdapters = Object.freeze([
  tailwindAdapter,
  nativeWindAdapter,
  reactNativeAdapter,
  buildManifestAdapter,
]);

export function createEngineeringAdapterRegistry(additionalAdapters = []) {
  return createAdapterRegistry([
    ...builtInEngineeringAdapters,
    ...additionalAdapters,
  ]);
}

export const engineeringAdapterRegistry = createEngineeringAdapterRegistry();

export function writeRegisteredEngineeringOutputs(
  repoRoot,
  model,
  registry = engineeringAdapterRegistry,
) {
  const files = registry.build(model);

  for (const [relativePath, content] of files) {
    const target = path.join(repoRoot, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf-8');
  }

  return [...files.keys()];
}
