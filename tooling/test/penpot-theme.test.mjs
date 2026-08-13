import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compileTokens } from '../../penpot/src/compile/tokens.mjs';

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-penpot-'));
  const source = path.join(dir, 'colors_and_type.css');
  fs.writeFileSync(
    source,
    `:root {
      --com-brand-500: #5B5EF7;
      --com-brand-600: #494CE0;
      --com-action-primary: var(--com-brand-500);
      --color-primary: var(--com-action-primary);
    }
    .dark {
      --com-action-primary: var(--com-brand-500);
    }`,
    'utf-8',
  );

  const themeDir = path.join(dir, 'themes');
  fs.mkdirSync(themeDir);
  fs.writeFileSync(
    path.join(themeDir, 'premium-gold.css'),
    `:root {
      --com-premium-300: #EDBC6C;
      --com-reward-default: var(--com-premium-300);
      --color-reward: var(--com-reward-default);
    }
    .theme-premium-gold {
      --com-brand-500: #ED4D1B;
      --com-brand-600: #D63D10;
      --com-action-primary: var(--com-brand-600);
    }`,
    'utf-8',
  );

  return source;
}

test('Penpot keeps default Light/Dark and adds Premium Gold as separate sets', () => {
  const manifest = compileTokens(fixture());
  const defaultPrimary = manifest.tokens.find(
    (token) => token.set === 'light' && token.name === 'color-primary',
  );
  const premiumPrimary = manifest.tokens.find(
    (token) => token.set === 'premium-gold-light' && token.name === 'color-primary',
  );
  const premiumReward = manifest.tokens.find(
    (token) => token.set === 'premium-gold-light' && token.name === 'color-reward',
  );

  assert.equal(defaultPrimary?.value, '#5B5EF7');
  assert.equal(premiumPrimary?.value, '#D63D10');
  assert.equal(premiumReward?.value, '#EDBC6C');
  assert.ok(manifest.themes.some((theme) => theme.name === 'Light'));
  assert.ok(manifest.themes.some((theme) => theme.name === 'Dark'));
  assert.ok(manifest.themes.some((theme) => theme.name === 'Premium Gold / Light'));
  assert.ok(manifest.themes.some((theme) => theme.name === 'Premium Gold / Dark'));
});
