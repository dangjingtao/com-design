import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  buildHumanGuideCurrentJson,
  buildHumanGuideRootIndex,
  buildHumanGuideV2Facts,
  validateHumanGuideV2,
} from '../src/human-guide-v2.mjs';

const repoRoot=path.resolve('.');

test('T027 Human Guide V2 facts come from canonical catalogs',()=>{
  const facts=buildHumanGuideV2Facts(repoRoot,{sourceRevision:'test-sha'});
  assert.equal(facts.counts.coreComponents,34);
  assert.equal(facts.counts.coreCompositeComponents,4);
  assert.equal(facts.counts.corePatterns,7);
  assert.ok(facts.componentSlugs.includes('result-state'));
  assert.ok(facts.patternIds.includes('incrementalLoading'));
  assert.equal(facts.downstreamAuthority,false);
  assert.equal(facts.sourceRevision,'test-sha');
});

test('T027 current pointer is versioned and accepted V1 remains separate',()=>{
  const facts=buildHumanGuideV2Facts(repoRoot);
  assert.equal(facts.currentPath,'versions/'+facts.version+'/');
  assert.equal(facts.acceptedV1Path,'accepted/v1/');
  const root=buildHumanGuideRootIndex(repoRoot);
  assert.match(root,new RegExp('versions/'+facts.version.replaceAll('.','\\.')+'/'));
  assert.ok(fs.existsSync(path.join(repoRoot,'report/design-system-v1/index.html')));
});

test('T027 current json records canonical authority and source revision',()=>{
  const current=JSON.parse(buildHumanGuideCurrentJson(repoRoot,{sourceRevision:'abc123'}));
  assert.equal(current.canonicalManifest,'design-source/specs/design-system-v1.json');
  assert.equal(current.sourceRevision,'abc123');
  assert.equal(current.downstreamAuthority,false);
});

test('T027 Human Guide V2 and Pages assembly pass deterministic validation',()=>{
  const result=validateHumanGuideV2(repoRoot);
  assert.deepEqual(result.errors,[]);
  assert.equal(result.evidence.resultStatePresent,true);
  assert.equal(result.evidence.incrementalLoadingPresent,true);
  assert.equal(result.evidence.acceptedV1Retained,true);
});
