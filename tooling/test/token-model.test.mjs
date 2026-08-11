import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildTokenModel,
  pxToNumber,
  validateTokenModel,
} from '../src/token-model.mjs';
import {
  createReactNativeTokens,
  createTailwindPreset,
  createThemeCss,
} from '../src/adapters.mjs';

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-'));
  const file = path.join(dir, 'tokens.css');
  fs.writeFileSync(
    file,
    `:root {
      --com-brand-500: #5B5EF7;
      --com-neutral-50: #F7F8FC;
      --com-neutral-800: #252B3D;
      --color-primary: var(--com-brand-500);
      --color-background: var(--com-neutral-50);
      --color-text-primary: var(--com-neutral-800);
      --space-16: 16px;
      --radius-control: 8px;
      --size-control-height: 40px;
      --density-control-height: 40px;
      --density-control-height-lg: 48px;
      --platform-touch-min: 44px;
      --type-body: 400 16px/24px system-ui;
    }
    .dark {
      --com-neutral-50: #10131E;
      --com-neutral-800: #F7F8FC;
    }
    .density-comfortable {
      --density-control-height: 44px;
      --density-control-height-lg: 56px;
    }
    .platform-android {
      --platform-touch-min: 48px;
    }`,
    'utf-8',
  );
  return file;
}

test('dark aliases resolve transitively through overridden primitives', () => {
  const model = buildTokenModel(fixture());
  const background = model.table.find((token) => token.name === 'color-background');
  assert.equal(background.light, '#F7F8FC');
  assert.equal(background.dark, '#10131E');
  assert.equal(background.hasDarkOverride, true);
  assert.deepEqual(validateTokenModel(model), []);
});

test('px maps 1:1 to React Native layout numbers', () => {
  assert.equal(pxToNumber('16px'), 16);
  assert.equal(pxToNumber('0'), 0);
});

test('adapters expose semantic utilities and dynamic density/platform variables', () => {
  const model = buildTokenModel(fixture());
  const preset = createTailwindPreset(model);
  const css = createThemeCss(model);
  const reactNative = createReactNativeTokens(model);

  assert.match(preset, /"primary": "var\(--cd-color-primary\)"/);
  assert.match(preset, /"control": "var\(--cd-density-control-height\)"/);
  assert.match(
    css,
    /\.density-comfortable[\s\S]*--cd-density-control-height: 44px/,
  );
  assert.match(css, /\.platform-android[\s\S]*--cd-platform-touch-min: 48px/);
  assert.match(reactNative, /"touchMin": 48/);
});
