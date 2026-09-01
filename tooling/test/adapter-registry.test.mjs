import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createAdapterRegistry,
  createEngineeringAdapterRegistry,
  engineeringAdapterRegistry,
  writeRegisteredEngineeringOutputs,
} from '../src/adapters/registry.mjs';

const emptyModel = () => ({
  byType: {},
  scopes: {
    densityComfortable: {},
    platformAndroid: {},
  },
  themes: {},
  sourceHash: 'fixture-source-revision',
  consumer: [],
});

test('built-in registry exposes stable adapter IDs and target mapping', () => {
  assert.deepEqual(
    engineeringAdapterRegistry.list().map(({ id, target, family, outputPaths }) => ({
      id,
      target,
      family,
      outputPaths,
    })),
    [
      {
        id: 'web.tailwind',
        target: 'tailwind',
        family: 'web',
        outputPaths: ['dist/tailwind/preset.cjs', 'dist/tailwind/theme.css'],
      },
      {
        id: 'native-mobile.nativewind',
        target: 'nativewind',
        family: 'native-mobile',
        outputPaths: ['dist/nativewind/preset.cjs', 'dist/nativewind/theme.css'],
      },
      {
        id: 'native-mobile.react-native',
        target: 'react-native',
        family: 'native-mobile',
        outputPaths: ['dist/react-native/tokens.ts'],
      },
      {
        id: 'meta.build-manifest',
        target: 'build-manifest',
        family: 'meta',
        outputPaths: ['dist/build-manifest.json'],
      },
    ],
  );

  assert.equal(engineeringAdapterRegistry.getByTarget('tailwind')?.id, 'web.tailwind');
  assert.equal(
    engineeringAdapterRegistry.getById('native-mobile.react-native')?.target,
    'react-native',
  );
});

test('registry preserves current engineering output paths and source revision evidence', () => {
  const files = createEngineeringAdapterRegistry().build(emptyModel());

  assert.deepEqual([...files.keys()], [
    'dist/tailwind/preset.cjs',
    'dist/tailwind/theme.css',
    'dist/nativewind/preset.cjs',
    'dist/nativewind/theme.css',
    'dist/react-native/tokens.ts',
    'dist/build-manifest.json',
  ]);

  const manifest = JSON.parse(files.get('dist/build-manifest.json'));
  assert.equal(manifest.sourceHash, 'fixture-source-revision');
  assert.deepEqual(manifest.targets, ['tailwind', 'nativewind', 'react-native', 'mcp']);
});

test('new platform adapter can be registered without changing central build plumbing', () => {
  const registry = createAdapterRegistry([
    {
      id: 'mini-program.fixture',
      target: 'wechat-fixture',
      family: 'mini-program',
      outputPaths: ['dist/mini-program/fixture.txt'],
      build() {
        return new Map([['dist/mini-program/fixture.txt', 'fixture\n']]);
      },
    },
  ]);
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-adapter-'));

  assert.deepEqual(writeRegisteredEngineeringOutputs(repoRoot, emptyModel(), registry), [
    'dist/mini-program/fixture.txt',
  ]);
  assert.equal(
    fs.readFileSync(path.join(repoRoot, 'dist/mini-program/fixture.txt'), 'utf-8'),
    'fixture\n',
  );
});

test('registry rejects ambiguous IDs, targets and output ownership', () => {
  const adapter = (id, target, outputPath) => ({
    id,
    target,
    family: 'web',
    outputPaths: [outputPath],
    build() {
      return new Map([[outputPath, 'fixture']]);
    },
  });

  assert.throws(
    () => createAdapterRegistry([
      adapter('web.a', 'a', 'dist/a'),
      adapter('web.a', 'b', 'dist/b'),
    ]),
    /adapter id is already registered/,
  );
  assert.throws(
    () => createAdapterRegistry([
      adapter('web.a', 'same', 'dist/a'),
      adapter('web.b', 'same', 'dist/b'),
    ]),
    /adapter target is already registered/,
  );
  assert.throws(
    () => createAdapterRegistry([
      adapter('web.a', 'a', 'dist/shared'),
      adapter('web.b', 'b', 'dist/shared'),
    ]),
    /adapter output is already claimed/,
  );
});

test('registry validates declared outputs at build time', () => {
  const missing = createAdapterRegistry([
    {
      id: 'web.missing',
      target: 'missing',
      family: 'web',
      outputPaths: ['dist/missing.txt'],
      build() {
        return new Map();
      },
    },
  ]);
  assert.throws(() => missing.build(emptyModel()), /did not emit declared output/);

  const undeclared = createAdapterRegistry([
    {
      id: 'web.extra',
      target: 'extra',
      family: 'web',
      outputPaths: ['dist/declared.txt'],
      build() {
        return new Map([
          ['dist/declared.txt', 'ok'],
          ['dist/extra.txt', 'not declared'],
        ]);
      },
    },
  ]);
  assert.throws(() => undeclared.build(emptyModel()), /emitted undeclared output/);
});
