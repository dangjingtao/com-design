import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  buildHumanGuideCurrentFacts,
  buildHumanGuideOverlay,
  validateHumanGuideCurrentFacts,
} from '../src/human-guide-overlay.mjs';

const repoRoot=path.resolve('.');

test('T026 Human Guide current facts come from canonical source without rewriting accepted V1 evidence', () => {
  const facts=buildHumanGuideCurrentFacts(repoRoot);
  assert.equal(facts.coreComponents,34);
  assert.equal(facts.coreCompositeComponents,4);
  assert.equal(facts.corePatterns,7);
  assert.equal(facts.canonicalManifest,'design-source/specs/design-system-v1.json');
  assert.equal(facts.acceptedReport,'report/design-system-v1/');
  assert.equal(facts.previewReferenceOnly,true);

  const result=validateHumanGuideCurrentFacts(repoRoot);
  assert.deepEqual(result.errors,[]);
});

test('T026 Human Guide overlay publishes current V2 facts and canonical authority', () => {
  const overlay=buildHumanGuideOverlay(repoRoot);
  assert.match(overlay,/34 Core Components/);
  assert.match(overlay,/7 Core UX Patterns/);
  assert.match(overlay,/design-source\/specs\/design-system-v1\.json/);
  assert.match(overlay,/Preview \/ UI Kits \/ Human Guide/);
});

test('T026 Human Guide validation fails if Pages stops loading the current-facts overlay', () => {
  const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'com-design-human-guide-'));
  fs.cpSync(path.join(repoRoot,'design-source'),path.join(fixture,'design-source'),{recursive:true});
  fs.cpSync(path.join(repoRoot,'report'),path.join(fixture,'report'),{recursive:true});
  fs.mkdirSync(path.join(fixture,'.github','workflows'),{recursive:true});
  fs.writeFileSync(
    path.join(fixture,'.github','workflows','pages.yml'),
    'name: fixture\n',
  );

  const result=validateHumanGuideCurrentFacts(fixture);
  assert.ok(
    result.errors.some((error)=>error.includes('Pages deployment must generate and load')),
  );
});
