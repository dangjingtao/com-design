import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {
  buildHumanGuideCurrentFacts,
  buildHumanGuideOverlay,
  validateHumanGuideCurrentFacts,
} from '../src/human-guide-overlay.mjs';

const repoRoot=path.resolve('.');

test('T026 Human Guide publishes current V2 facts without rewriting the accepted V1 report', () => {
  const facts=buildHumanGuideCurrentFacts(repoRoot);
  assert.equal(facts.coreComponents,34);
  assert.equal(facts.coreCompositeComponents,4);
  assert.equal(facts.corePatterns,7);
  assert.equal(facts.acceptedReport,'report/design-system-v1/');
  assert.equal(facts.acceptedReportRole,'retained-v1-acceptance-baseline');

  const result=validateHumanGuideCurrentFacts(repoRoot);
  assert.deepEqual(result.errors,[]);
});

test('T026 Human Guide overlay stays inside main and labels historical baseline explicitly', () => {
  const overlay=buildHumanGuideOverlay(repoRoot);
  assert.match(overlay,/main\.insertBefore\(banner,main\.firstChild\)/);
  assert.doesNotMatch(overlay,/anchor\.parentNode\.insertBefore/);
  assert.match(overlay,/Accepted V1 Human Guide · retained baseline/);
  assert.match(overlay,/不代表当前 catalog 数量/);
  assert.match(overlay,/34 Core Components/);
  assert.match(overlay,/7 Core UX Patterns/);
});

test('T026 live rail count follows canonical V2 catalog while retained body remains labeled V1', () => {
  const overlay=buildHumanGuideOverlay(repoRoot);
  assert.match(overlay,/railCount\.textContent=String\(facts\.coreComponents\)/);
  assert.match(overlay,/Accepted V1 Guide · historical baseline/);
  assert.match(overlay,/V1 验收基线/);
});
