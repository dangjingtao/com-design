import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validatePlatformContext, validatePlatformModel } from '../src/platform-context.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const model = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'specs', 'platform-model-v2.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'schemas', 'platform-context-v2.schema.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'specs', 'design-system-v1.json'), 'utf8'));

function makeContext(overrides = {}) {
  return {
    schemaVersion: 2,
    platform: 'ios',
    viewport: 'compact',
    input: 'touch',
    motion: 'standard',
    colorScheme: 'light',
    contentScale: 'platform-driven',
    ...overrides,
  };
}

test('repository platform model, schema and manifest stay aligned', () => {
  assert.deepEqual(validatePlatformModel(model, schema, manifest), []);
});

test('all four platforms form valid contexts', () => {
  for (const platform of model.axes.platform.values) {
    assert.deepEqual(validatePlatformContext(makeContext({ platform }), schema), []);
  }
});

test('platform context axes remain independently composable', () => {
  let combinations = 0;
  for (const platform of model.axes.platform.values) {
    for (const viewport of model.axes.viewport.values) {
      for (const input of model.axes.input.values) {
        for (const motion of model.axes.motion.values) {
          for (const colorScheme of model.axes.colorScheme.values) {
            for (const contentScale of model.axes.contentScale.values) {
              combinations += 1;
              assert.deepEqual(
                validatePlatformContext(
                  { schemaVersion: 2, platform, viewport, input, motion, colorScheme, contentScale },
                  schema,
                ),
                [],
                `unexpected invalid combination: ${platform}/${viewport}/${input}/${motion}/${colorScheme}/${contentScale}`,
              );
            }
          }
        }
      }
    }
  }
  assert.equal(combinations, 576);
});

test('Web is not pointer-only and Mini Program is not touch-only', () => {
  assert.deepEqual(validatePlatformContext(makeContext({ platform: 'web', input: 'touch' }), schema), []);
  assert.deepEqual(
    validatePlatformContext(makeContext({ platform: 'wechat-mini-program', input: 'keyboard' }), schema),
    [],
  );
});

test('unknown platform and invalid axis values are rejected', () => {
  const invalidCases = [
    ['platform', 'desktop'],
    ['viewport', 'desktop'],
    ['input', 'mouse'],
    ['motion', 'full'],
    ['colorScheme', 'sepia'],
    ['contentScale', 'huge'],
  ];

  for (const [axis, value] of invalidCases) {
    const errors = validatePlatformContext(makeContext({ [axis]: value }), schema);
    assert.ok(errors.some((error) => error.startsWith(`${axis} must be one of:`)), `${axis} should reject ${value}`);
  }
});

test('unknown axes are rejected', () => {
  const errors = validatePlatformContext({ ...makeContext(), hover: true }, schema);
  assert.ok(errors.includes('hover is not allowed.'));
});

test('UI ownership distinguishes system chrome, host chrome and Com Design UI', () => {
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(model.uiOwnership).map(([key, value]) => [key, [value.owner, value.comDesignOwned]]),
    ),
    {
      systemChrome: ['system', false],
      hostChrome: ['host', false],
      comDesignUi: ['com-design', true],
    },
  );
});
