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
      --com-brand-50: #F0F1FF;
      --com-brand-500: #5B5EF7;
      --com-brand-600: #494CE0;
      --com-brand-700: #393BBE;
      --com-neutral-50: #F7F8FC;
      --com-neutral-800: #252B3D;
      --com-action-primary: var(--com-brand-500);
      --com-surface-page: var(--com-neutral-50);
      --color-primary: var(--com-action-primary);
      --color-background: var(--com-surface-page);
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
    /* Real design source keeps explanatory comments immediately before named scopes. */
    .density-comfortable {
      --density-control-height: 44px;
      --density-control-height-lg: 56px;
    }
    /* Android platform override. */
    .platform-android {
      --platform-touch-min: 48px;
    }`,
    'utf-8',
  );

  const themeDir = path.join(dir, 'themes');
  fs.mkdirSync(themeDir);
  fs.writeFileSync(
    path.join(themeDir, 'premium-gold.css'),
    `:root {
      --com-premium-300: #EDBC6C;
      --com-premium-700: #7A4B12;
      --com-reward-default: var(--com-premium-300);
      --color-reward: var(--com-reward-default);
    }
    .theme-premium-gold {
      --com-brand-50: #FFF3EC;
      --com-brand-500: #ED4D1B;
      --com-brand-600: #D63D10;
      --com-brand-700: #AD2E0A;
      --com-action-primary: var(--com-brand-600);
      --com-surface-page: #FCF8F1;
    }
    .dark.theme-premium-gold {
      --com-surface-page: #15130F;
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

test('premium gold is additive and does not replace the default palette', () => {
  const model = buildTokenModel(fixture());
  const primary = model.table.find((token) => token.name === 'color-primary');
  const reward = model.table.find((token) => token.name === 'color-reward');

  assert.equal(primary.light, '#5B5EF7');
  assert.equal(reward.light, '#EDBC6C');
  assert.equal(model.themes.premiumGold.light['color-primary'], '#D63D10');
  assert.equal(model.themes.premiumGold.light['color-background'], '#FCF8F1');
  assert.equal(model.themes.premiumGold.dark['color-background'], '#15130F');
});

test('px maps 1:1 to React Native layout numbers', () => {
  assert.equal(pxToNumber('16px'), 16);
  assert.equal(pxToNumber('0'), 0);
});

test('adapters expose semantic utilities, optional themes and dynamic scopes', () => {
  const model = buildTokenModel(fixture());
  const preset = createTailwindPreset(model);
  const css = createThemeCss(model);
  const reactNative = createReactNativeTokens(model);

  assert.match(preset, /"primary": "var\(--cd-color-primary\)"/);
  assert.match(preset, /"reward": "var\(--cd-color-reward\)"/);
  assert.match(preset, /"control": "var\(--cd-density-control-height\)"/);
  assert.match(
    css,
    /\.theme-premium-gold,[\s\S]*--cd-color-primary: #D63D10/,
  );
  assert.match(css, /\[data-com-theme="premium-gold"\]/);
  assert.match(
    css,
    /\.density-comfortable[\s\S]*--cd-density-control-height: 44px/,
  );
  assert.match(css, /\.platform-android[\s\S]*--cd-platform-touch-min: 48px/);
  assert.match(reactNative, /"premiumGold"/);
  assert.match(reactNative, /"primary": "#D63D10"/);
  assert.match(reactNative, /"touchMin": 48/);
});
