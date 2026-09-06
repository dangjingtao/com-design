import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { buildTokenModel } from '../src/token-model.mjs';
import { auditContrast, contrastRatio } from '../src/contrast-audit.mjs';

test('T026 WCAG contrast math matches known black/white baseline', () => {
  assert.equal(contrastRatio('#000000','#FFFFFF'),21);
  assert.equal(contrastRatio('#FFFFFF','#000000'),21);
  assert.equal(contrastRatio('not-a-color','#FFFFFF'),null);
});

test('T026 accepted semantic text/background pairs pass across default and Premium Gold light/dark', () => {
  const model=buildTokenModel(path.resolve('design-source/colors_and_type.css'));
  const result=auditContrast(model);
  assert.deepEqual(result.errors,[]);
  assert.equal(result.evidence.scopeCount,4);
  assert.equal(result.evidence.pairCount,11);
  assert.equal(result.evidence.checks,44);
  assert.ok(result.evidence.minimumRatio>=4.5);
});

test('T026 contrast audit fails a semantic pair below the required threshold', () => {
  const model=buildTokenModel(path.resolve('design-source/colors_and_type.css'));
  const candidate=structuredClone(model);
  const token=candidate.consumer.find((entry)=>entry.name==='color-text-primary');
  token.light='#FFFFFF';
  const result=auditContrast(candidate);
  assert.ok(result.errors.some((error)=>error.includes('default.light text-primary-on-surface')));
});
