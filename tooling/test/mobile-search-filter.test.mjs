import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  createCollectionQueryState,
  reduceCollectionQueryState,
  validateMobileSearchFilterWorkflowContract,
} from '../src/mobile-search-filter.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));

const contract = readJson('design-source/specs/mobile-search-filter-v2.json');
const schema = readJson('design-source/schemas/mobile-search-filter-v2.schema.json');
const componentIndex = readJson('design-source/components/index.json');
const composites = readJson('design-source/specs/core-composites.json');
const patterns = readJson('design-source/specs/core-patterns.json');
const platformEnvironment = readJson('design-source/specs/platform-environment-v1.json');
const layoutInputFoundation = readJson('design-source/specs/layout-input-foundation-v2.json');

const validate = (candidate = contract, overrides = {}) => validateMobileSearchFilterWorkflowContract(
  candidate,
  schema,
  {
    componentIndex,
    composites,
    patterns,
    platformEnvironment,
    layoutInputFoundation,
    ...overrides,
  },
);

test('T021 canonical workflow validates against accepted Components, Patterns and platform foundations', () => {
  assert.deepEqual(validate(), []);
  assert.deepEqual(contract.scope.platforms, ['ios', 'android', 'wechat-mini-program']);
  assert.equal(contract.scope.addsCoreComponent, false);
  assert.equal(contract.scope.addsCorePattern, false);
});

test('T021 IME composition never commits intermediate query text', () => {
  let state = createCollectionQueryState({
    committedQuery: '',
    committedFilters: ['type:doc'],
    continuation: 'page-2',
  });

  ({ state } = reduceCollectionQueryState(state, { type: 'composition-start' }, contract));
  ({ state } = reduceCollectionQueryState(state, { type: 'search-input', value: 'ni' }, contract));
  let result = reduceCollectionQueryState(state, { type: 'debounce-commit' }, contract);
  state = result.state;

  assert.equal(state.pendingQuery, 'ni');
  assert.equal(state.committedQuery, '');
  assert.equal(state.continuation, 'page-2');
  assert.ok(result.effects.includes('commit-suppressed-during-composition'));

  ({ state } = reduceCollectionQueryState(state, { type: 'composition-end', value: '你好' }, contract));
  result = reduceCollectionQueryState(state, { type: 'debounce-commit' }, contract);
  assert.equal(result.state.committedQuery, '你好');
  assert.equal(result.state.continuation, null);
  assert.ok(result.effects.includes('refresh-collection'));
});

test('T021 filter dismiss discards draft while Apply is the only commit boundary', () => {
  let state = createCollectionQueryState({
    committedQuery: '设计',
    committedFilters: ['status:active'],
    continuation: 'cursor-2',
  });

  ({ state } = reduceCollectionQueryState(state, { type: 'filter-open' }, contract));
  ({ state } = reduceCollectionQueryState(
    state,
    { type: 'filter-set-draft', filters: ['status:active', 'region:gd'] },
    contract,
  ));
  ({ state } = reduceCollectionQueryState(state, { type: 'filter-dismiss' }, contract));

  assert.deepEqual(state.committedFilters, ['status:active']);
  assert.equal(state.committedQuery, '设计');
  assert.equal(state.continuation, 'cursor-2');

  ({ state } = reduceCollectionQueryState(state, { type: 'filter-open' }, contract));
  ({ state } = reduceCollectionQueryState(
    state,
    { type: 'filter-set-draft', filters: ['status:active', 'region:gd'] },
    contract,
  ));
  const applied = reduceCollectionQueryState(state, { type: 'filter-apply' }, contract);

  assert.deepEqual(applied.state.committedFilters, ['status:active', 'region:gd']);
  assert.equal(applied.state.committedQuery, '设计');
  assert.equal(applied.state.continuation, null);
  assert.ok(applied.effects.includes('filters-committed'));
});

test('T021 Reset changes draft only and Clear query preserves filters', () => {
  let state = createCollectionQueryState({
    committedQuery: 'token',
    committedFilters: ['type:doc'],
  });

  ({ state } = reduceCollectionQueryState(state, { type: 'filter-open' }, contract));
  ({ state } = reduceCollectionQueryState(
    state,
    { type: 'filter-reset-draft', defaultFilters: [] },
    contract,
  ));

  assert.deepEqual(state.committedFilters, ['type:doc']);
  assert.equal(state.committedQuery, 'token');

  ({ state } = reduceCollectionQueryState(state, { type: 'filter-dismiss' }, contract));
  const cleared = reduceCollectionQueryState(state, { type: 'clear-query' }, contract);

  assert.equal(cleared.state.committedQuery, '');
  assert.deepEqual(cleared.state.committedFilters, ['type:doc']);
  assert.ok(cleared.effects.includes('search-context-preserved'));
});

test('T021 Clear query and Cancel/Back remain distinct semantics', () => {
  const initial = createCollectionQueryState({
    committedQuery: 'Mira',
    committedFilters: ['kind:repo'],
  });
  const cleared = reduceCollectionQueryState(initial, { type: 'clear-query' }, contract);
  const backed = reduceCollectionQueryState(initial, { type: 'cancel-back' }, contract);

  assert.notDeepEqual(cleared.state, backed.state);
  assert.ok(cleared.effects.includes('query-cleared'));
  assert.ok(backed.effects.includes('exit-or-return-search-context'));
});

test('T021 detail return restores query filters sort loaded data and scroll', () => {
  let state = createCollectionQueryState({
    committedQuery: '设计规范',
    committedFilters: ['type:doc'],
    sort: 'relevance',
  });

  ({ state } = reduceCollectionQueryState(
    state,
    { type: 'capture-restoration', loadedData: ['r1', 'r2', 'r3'], scrollPosition: 640 },
    contract,
  ));

  state.committedQuery = 'mutated';
  state.committedFilters = [];
  state.sort = 'newest';

  const restored = reduceCollectionQueryState(state, { type: 'restore-detail-return' }, contract);
  assert.equal(restored.state.committedQuery, '设计规范');
  assert.deepEqual(restored.state.committedFilters, ['type:doc']);
  assert.equal(restored.state.sort, 'relevance');
  assert.deepEqual(restored.restoration.loadedData, ['r1', 'r2', 'r3']);
  assert.equal(restored.restoration.scrollPosition, 640);
});

test('T021 quick filter cannot become Tabs/peer-view navigation', () => {
  const candidate = structuredClone(contract);
  candidate.filter.quickFilter.peerViewNavigation = true;
  candidate.filter.quickFilter.semanticRole = 'peer-view-navigation';

  const errors = validate(candidate);
  assert.ok(errors.some((error) => error.includes('quick filter')));
});

test('T021 rejects filter dismissal that commits draft', () => {
  const candidate = structuredClone(contract);
  candidate.filter.advancedSurface.dismissCommits = true;

  const errors = validate(candidate);
  assert.ok(errors.some((error) => error.includes('dismiss must not commit')));
});

test('T021 rejects Reset semantics that clear the search query', () => {
  const candidate = structuredClone(contract);
  candidate.filter.advancedSurface.resetClearsQuery = true;

  const errors = validate(candidate);
  assert.ok(errors.some((error) => error.includes('must not clear the search query')));
});

test('T021 requires all three mobile platform mappings to be backed by T010 environment evidence', () => {
  const candidate = structuredClone(contract);
  delete candidate.platformMappings.android;

  const errors = validate(candidate);
  assert.ok(errors.some((error) => error.includes('platformMappings.android') || error.includes('missing platform mapping: android')));
});

test('T021 patterns and Filter Bar must explicitly consume the shared workflow contract', () => {
  const candidatePatterns = structuredClone(patterns);
  candidatePatterns.patterns.find((entry) => entry.id === 'collectionFilter').workflowContractRefs = [];

  const errors = validate(contract, { patterns: candidatePatterns });
  assert.ok(errors.some((error) => error.includes('collectionFilter must reference')));
});
