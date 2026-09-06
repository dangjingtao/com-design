import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  createIncrementalLoadingState,
  reduceIncrementalLoadingState,
  validateIncrementalLoadingContract,
} from '../src/incremental-loading.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(repoRoot,p),'utf8'));

const contract = readJson('design-source/specs/incremental-loading-v2.json');
const schema = readJson('design-source/schemas/incremental-loading-v2.schema.json');
const patterns = readJson('design-source/specs/core-patterns.json');
const mobileSearchFilter = readJson('design-source/specs/mobile-search-filter-v2.json');
const platformEnvironment = readJson('design-source/specs/platform-environment-v1.json');
const layoutInputFoundation = readJson('design-source/specs/layout-input-foundation-v2.json');

const validate = (candidate=contract, overrides={}) => validateIncrementalLoadingContract(
  candidate,
  schema,
  { patterns, mobileSearchFilter, platformEnvironment, layoutInputFoundation, ...overrides },
);

function requestMore(state, id='r1', trigger='near-end') {
  return reduceIncrementalLoadingState(
    state,
    {type:'request-more', requestId:id, trigger},
    contract,
  );
}

test('T022 canonical contract promotes the seventh Core UX Pattern', () => {
  assert.deepEqual(validate(), []);
  assert.equal(patterns.patterns.length, 7);
  assert.ok(patterns.patterns.some((entry) => entry.id === 'incrementalLoading'));
});

test('T022 automatic append dedups stable keys and preserves incoming order', () => {
  let state=createIncrementalLoadingState({
    items:[{key:'a',value:1}],
    continuation:'opaque:c1',
  });
  const requested=requestMore(state,'r1');
  state=requested.state;
  const result=reduceIncrementalLoadingState(
    state,
    {
      type:'append-success',
      requestId:'r1',
      generation:requested.request.generation,
      items:[{key:'a',value:99},{key:'b',value:2},{key:'c',value:3}],
      nextContinuation:'opaque:c2',
      hasMore:true,
    },
    contract,
  );
  assert.deepEqual(result.state.items.map((item)=>item.key),['a','b','c']);
  assert.equal(result.appendedCount,2);
  assert.equal(result.state.continuation,'opaque:c2');
  assert.equal(result.state.phase,'appended');
});

test('T022 append error preserves existing items and exposes retry using failed continuation', () => {
  let state=createIncrementalLoadingState({
    items:[{key:'a'}],
    continuation:{opaque:'c1'},
  });
  const requested=requestMore(state,'r1');
  const failed=reduceIncrementalLoadingState(
    requested.state,
    {type:'append-error',requestId:'r1',generation:requested.request.generation},
    contract,
  );
  assert.deepEqual(failed.state.items,[{key:'a'}]);
  assert.equal(failed.state.phase,'append-error');
  assert.deepEqual(failed.state.failedContinuation,{opaque:'c1'});
  assert.ok(failed.effects.includes('manual-retry-available'));

  const retry=reduceIncrementalLoadingState(
    failed.state,
    {type:'retry-more',requestId:'r2'},
    contract,
  );
  assert.deepEqual(retry.request.continuation,{opaque:'c1'});
  assert.equal(retry.state.phase,'loading-more');
});

test('T022 suppresses duplicate in-flight requests and ignores stale/out-of-order responses', () => {
  let state=createIncrementalLoadingState({
    items:[{key:'a'}],
    continuation:'opaque:c1',
  });
  const first=requestMore(state,'r1');
  const duplicate=requestMore(first.state,'r2');
  assert.equal(duplicate.request,undefined);
  assert.ok(duplicate.effects.includes('request-suppressed-in-flight'));

  const stale=reduceIncrementalLoadingState(
    first.state,
    {
      type:'append-success',
      requestId:'old',
      generation:first.request.generation-1,
      items:[{key:'x'}],
      nextContinuation:'opaque:stale',
      hasMore:true,
    },
    contract,
  );
  assert.deepEqual(stale.state.items,[{key:'a'}]);
  assert.equal(stale.state.continuation,'opaque:c1');
  assert.ok(stale.effects.includes('stale-response-ignored'));
});

test('T022 exhausted state prevents any further load-more request', () => {
  let state=createIncrementalLoadingState({
    items:[{key:'a'}],
    continuation:'opaque:c1',
  });
  const requested=requestMore(state,'r1');
  const exhausted=reduceIncrementalLoadingState(
    requested.state,
    {
      type:'append-success',
      requestId:'r1',
      generation:requested.request.generation,
      items:[],
      hasMore:false,
    },
    contract,
  );
  assert.equal(exhausted.state.phase,'exhausted');
  const again=requestMore(exhausted.state,'r2');
  assert.equal(again.request,undefined);
  assert.ok(again.effects.includes('request-suppressed-exhausted'));
});

test('T022 query/filter/sort invalidation makes a late response stale', () => {
  let state=createIncrementalLoadingState({
    items:[{key:'a'}],
    continuation:'opaque:c1',
  });
  const requested=requestMore(state,'r1');
  const invalidated=reduceIncrementalLoadingState(
    requested.state,
    {type:'invalidate-continuation',reason:'committedFilters'},
    contract,
  );
  assert.equal(invalidated.state.continuation,null);
  assert.equal(invalidated.state.inFlight,null);

  const late=reduceIncrementalLoadingState(
    invalidated.state,
    {
      type:'append-success',
      requestId:'r1',
      generation:requested.request.generation,
      items:[{key:'b'}],
      nextContinuation:'opaque:c2',
      hasMore:true,
    },
    contract,
  );
  assert.deepEqual(late.state.items,[{key:'a'}]);
  assert.ok(late.effects.includes('stale-response-ignored'));
});

test('T022 detail return restores list continuation query filter sort and scroll context', () => {
  let state=createIncrementalLoadingState({
    items:[{key:'a'},{key:'b'}],
    continuation:'opaque:c2',
  });
  ({state}=reduceIncrementalLoadingState(
    state,
    {
      type:'capture-restoration',
      committedQuery:'设计',
      committedFilters:['type:doc'],
      sort:'relevance',
      scrollPosition:880,
    },
    contract,
  ));
  state.items=[];
  state.continuation=null;

  const restored=reduceIncrementalLoadingState(state,{type:'restore-detail-return'},contract);
  assert.deepEqual(restored.state.items.map((item)=>item.key),['a','b']);
  assert.equal(restored.state.continuation,'opaque:c2');
  assert.equal(restored.restoration.committedQuery,'设计');
  assert.deepEqual(restored.restoration.committedFilters,['type:doc']);
  assert.equal(restored.restoration.sort,'relevance');
  assert.equal(restored.restoration.scrollPosition,880);
});

test('T022 rejects backend-bound continuation and mixed pull-refresh/virtualization semantics', () => {
  const candidate=structuredClone(contract);
  candidate.stateModel.continuation.backendFieldNameBound=true;
  candidate.boundaries.pullToRefreshPartOfPattern=true;
  candidate.boundaries.virtualizationPartOfPattern=true;
  const errors=validate(candidate);
  assert.ok(errors.some((error)=>error.includes('opaque and backend-field-name neutral')));
  assert.ok(errors.some((error)=>error.includes('Pull-to-refresh')));
});

test('T022 Mini Program requires one scroll owner and batched node updates', () => {
  const candidate=structuredClone(contract);
  candidate.platformMappings['wechat-mini-program'].scrollOwnerRequired=false;
  candidate.platformMappings['wechat-mini-program'].highFrequencyNodeMutationAllowed=true;
  const errors=validate(candidate);
  assert.ok(errors.some((error)=>error.includes('Mini Program must choose one scroll owner')));
});


test('T022 rejects empty request identity before issuing a continuation request', () => {
  const state=createIncrementalLoadingState({
    items:[{key:'a'}],
    continuation:'opaque:c1',
  });
  assert.throws(
    () => reduceIncrementalLoadingState(
      state,
      {type:'request-more',requestId:''},
      contract,
    ),
    /requestId must be a non-empty string/,
  );
});

test('T022 rejects hasMore=true without the next opaque continuation', () => {
  const state=createIncrementalLoadingState({
    items:[{key:'a'}],
    continuation:'opaque:c1',
  });
  const requested=requestMore(state,'r1');
  assert.throws(
    () => reduceIncrementalLoadingState(
      requested.state,
      {
        type:'append-success',
        requestId:'r1',
        generation:requested.request.generation,
        items:[{key:'b'}],
        hasMore:true,
      },
      contract,
    ),
    /hasMore=true requires nextContinuation/,
  );
});


test('T022 rejects empty Web or native platform trigger mappings', () => {
  const webCandidate=structuredClone(contract);
  webCandidate.platformMappings.web={};
  const webErrors=validate(webCandidate);
  assert.ok(webErrors.some((error)=>error.includes('Web mapping must preserve')));

  const iosCandidate=structuredClone(contract);
  iosCandidate.platformMappings.ios={};
  const iosErrors=validate(iosCandidate);
  assert.ok(iosErrors.some((error)=>error.includes('ios mapping must define guarded near-end')));
});


test('T022 append-error blocks automatic near-end loops until explicit manual retry', () => {
  let state=createIncrementalLoadingState({
    items:[{key:'a'}],
    continuation:'opaque:c1',
  });
  const requested=requestMore(state,'r1','near-end');
  const failed=reduceIncrementalLoadingState(
    requested.state,
    {type:'append-error',requestId:'r1',generation:requested.request.generation},
    contract,
  );

  const automatic=reduceIncrementalLoadingState(
    failed.state,
    {type:'request-more',requestId:'r2',trigger:'near-end'},
    contract,
  );
  assert.equal(automatic.request,undefined);
  assert.equal(automatic.state.phase,'append-error');
  assert.ok(automatic.effects.includes('request-suppressed-append-error-auto'));

  const manual=reduceIncrementalLoadingState(
    failed.state,
    {type:'request-more',requestId:'r3',trigger:'manual'},
    contract,
  );
  assert.equal(manual.state.phase,'loading-more');
  assert.deepEqual(manual.request.continuation,'opaque:c1');

  const retry=reduceIncrementalLoadingState(
    failed.state,
    {type:'retry-more',requestId:'r4'},
    contract,
  );
  assert.equal(retry.state.phase,'loading-more');
  assert.deepEqual(retry.request.continuation,'opaque:c1');
});
