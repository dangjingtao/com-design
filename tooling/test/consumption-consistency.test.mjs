import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateConsumptionConsistency } from '../src/consumption-consistency.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'com-design-consumption-'));
  fs.cpSync(path.join(repoRoot, 'design-source'), path.join(root, 'design-source'), { recursive: true });
  fs.cpSync(path.join(repoRoot, 'README.md'), path.join(root, 'README.md'));
  fs.mkdirSync(path.join(root, 'report'), { recursive: true });
  fs.cpSync(
    path.join(repoRoot, 'report', 'design-system-v1'),
    path.join(root, 'report', 'design-system-v1'),
    { recursive: true },
  );
  return root;
}

function mutateLibrary(root, mutate) {
  const filePath = path.join(root, 'design-source', 'library-consumption.json');
  const value = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  mutate(value);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

test('T016 repository consumption entrypoints match V2 canonical catalogs and four-platform adapters', () => {
  const result = validateConsumptionConsistency(repoRoot);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.evidence.catalogCounts, {
    coreComponents: 33,
    coreCompositeComponents: 4,
    corePatterns: 6,
  });
  assert.deepEqual(result.evidence.consumerPriority, ['ai-agent', 'engineering', 'design']);
  assert.deepEqual(result.evidence.platforms, [
    'android',
    'ios',
    'web',
    'wechat-mini-program',
  ]);
  assert.equal(result.evidence.previewReferenceOnly, true);
  assert.equal(result.evidence.previewProductionSource, false);
  assert.equal(result.evidence.generatedAgentContract, 'dist/agent/contract.json');
});

test('T016 rejects a hand-maintained partial component catalog in library-consumption', () => {
  const root = fixture();
  mutateLibrary(root, (value) => {
    value.coreComponents = ['button', 'input'];
  });

  const result = validateConsumptionConsistency(root);
  assert.ok(result.errors.some((error) => error.includes('must not duplicate the coreComponents catalog')));
});

test('T016 rejects Preview promoted to production implementation truth', () => {
  const root = fixture();
  mutateLibrary(root, (value) => {
    value.previewPolicy.referenceOnly = false;
    value.previewPolicy.productionSource = true;
  });

  const result = validateConsumptionConsistency(root);
  assert.ok(result.errors.some((error) => error.includes('Preview must remain reference-only')));
});

test('T016 rejects a platform path that is not owned by the engineering adapter registry', () => {
  const root = fixture();
  mutateLibrary(root, (value) => {
    value.platformAdapters['wechat-mini-program'].contract = 'design-source/preview/component-button.html';
  });

  const result = validateConsumptionConsistency(root);
  assert.ok(result.errors.some((error) => error.includes('not a registered engineering output')));
});

test('T016 rejects Mobile-only public entrypoint wording', () => {
  const root = fixture();
  fs.writeFileSync(
    path.join(root, 'README.md'),
    '# com-design\n\n公司级移动端设计系统。\n',
  );

  const result = validateConsumptionConsistency(root);
  assert.ok(result.errors.some((error) => error.includes('Mobile-only')));
});

test('T016 rejects stale public catalog counts', () => {
  const root = fixture();
  const skillPath = path.join(root, 'design-source', 'SKILL.md');
  const skill = fs.readFileSync(skillPath, 'utf8').replace('33 Core Components', '6 Core Components');
  fs.writeFileSync(skillPath, skill);

  const result = validateConsumptionConsistency(root);
  assert.ok(result.errors.some((error) => error.includes('33 Core Components')));
});
