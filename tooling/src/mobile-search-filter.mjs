import {
  validateJsonSchemaValue,
} from './component-contract.mjs';

const WORKFLOW_ID = 'com-design:mobile-search-filter:v2';
const MOBILE_PLATFORMS = Object.freeze(['ios', 'android', 'wechat-mini-program']);
const REQUIRED_QUERY_FIELDS = Object.freeze([
  'pendingQuery',
  'committedQuery',
  'committedFilters',
  'sort',
  'continuation',
  'restorationState',
]);
const REQUIRED_RESTORE_FIELDS = Object.freeze([
  'committedQuery',
  'committedFilters',
  'sort',
  'loadedData',
  'scrollPosition',
]);

function uniqueSorted(values) {
  return [...new Set(values ?? [])].sort();
}

function sameSet(actual, expected) {
  return JSON.stringify(uniqueSorted(actual)) === JSON.stringify(uniqueSorted(expected));
}

function findById(items, id) {
  return (items ?? []).find((entry) => entry?.id === id) ?? null;
}

function componentSlugs(componentIndex) {
  return new Set((componentIndex?.components ?? []).map((entry) => entry?.slug).filter(Boolean));
}

function cloneFilters(filters) {
  return Array.isArray(filters) ? structuredClone(filters) : [];
}

export function createCollectionQueryState(seed = {}) {
  return {
    pendingQuery: seed.pendingQuery ?? seed.committedQuery ?? '',
    committedQuery: seed.committedQuery ?? '',
    committedFilters: cloneFilters(seed.committedFilters),
    sort: seed.sort ?? null,
    continuation: seed.continuation ?? null,
    restorationState: seed.restorationState ? structuredClone(seed.restorationState) : null,
    composing: false,
    filterSurfaceOpen: false,
    filterDraft: null,
  };
}

export function reduceCollectionQueryState(state, event, contract) {
  const next = structuredClone(state);
  const effects = [];
  const type = event?.type;

  if (type === 'composition-start') {
    next.composing = true;
    return { state: next, effects };
  }

  if (type === 'search-input') {
    next.pendingQuery = String(event.value ?? '');
    return { state: next, effects };
  }

  if (type === 'composition-end') {
    next.composing = false;
    next.pendingQuery = String(event.value ?? next.pendingQuery);
    effects.push('composition-ended');
    return { state: next, effects };
  }

  if (type === 'debounce-commit' || type === 'explicit-submit') {
    if (next.composing && contract.search.ime.commitWhileComposing === false) {
      effects.push('commit-suppressed-during-composition');
      return { state: next, effects };
    }
    next.committedQuery = next.pendingQuery;
    next.continuation = null;
    effects.push('query-committed', 'refresh-collection');
    return { state: next, effects };
  }

  if (type === 'clear-query') {
    next.pendingQuery = '';
    next.committedQuery = '';
    next.continuation = null;
    effects.push('query-cleared', 'search-context-preserved', 'refresh-collection');
    return { state: next, effects };
  }

  if (type === 'cancel-back') {
    effects.push('exit-or-return-search-context');
    return { state: next, effects };
  }

  if (type === 'filter-open') {
    next.filterSurfaceOpen = true;
    next.filterDraft = cloneFilters(next.committedFilters);
    effects.push('filter-draft-initialized');
    return { state: next, effects };
  }

  if (type === 'filter-set-draft') {
    if (!next.filterSurfaceOpen) throw new Error('filter draft cannot change while filter surface is closed.');
    next.filterDraft = cloneFilters(event.filters);
    return { state: next, effects };
  }

  if (type === 'filter-reset-draft') {
    if (!next.filterSurfaceOpen) throw new Error('filter draft cannot reset while filter surface is closed.');
    next.filterDraft = cloneFilters(event.defaultFilters);
    effects.push('filter-draft-reset');
    return { state: next, effects };
  }

  if (type === 'filter-dismiss') {
    next.filterSurfaceOpen = false;
    next.filterDraft = null;
    effects.push('filter-draft-discarded');
    return { state: next, effects };
  }

  if (type === 'filter-apply') {
    if (!next.filterSurfaceOpen) throw new Error('filter apply requires an open filter surface.');
    next.committedFilters = cloneFilters(next.filterDraft);
    next.filterDraft = null;
    next.filterSurfaceOpen = false;
    next.continuation = null;
    effects.push('filters-committed', 'refresh-collection', 'filter-surface-closed');
    return { state: next, effects };
  }

  if (type === 'sort-set') {
    next.sort = event.sort ?? null;
    next.continuation = null;
    effects.push('sort-committed', 'refresh-collection');
    return { state: next, effects };
  }

  if (type === 'capture-restoration') {
    next.restorationState = {
      committedQuery: next.committedQuery,
      committedFilters: cloneFilters(next.committedFilters),
      sort: next.sort,
      loadedData: structuredClone(event.loadedData ?? []),
      scrollPosition: event.scrollPosition ?? 0,
    };
    effects.push('restoration-captured');
    return { state: next, effects };
  }

  if (type === 'restore-detail-return') {
    const snapshot = next.restorationState;
    if (!snapshot) {
      effects.push('restoration-unavailable');
      return { state: next, effects };
    }
    next.pendingQuery = snapshot.committedQuery;
    next.committedQuery = snapshot.committedQuery;
    next.committedFilters = cloneFilters(snapshot.committedFilters);
    next.sort = snapshot.sort;
    effects.push('collection-restored');
    return {
      state: next,
      effects,
      restoration: {
        loadedData: structuredClone(snapshot.loadedData),
        scrollPosition: snapshot.scrollPosition,
      },
    };
  }

  throw new Error('unknown mobile search/filter workflow event: ' + type);
}

export function validateMobileSearchFilterWorkflowContract(
  contract,
  schema,
  {
    componentIndex,
    composites,
    patterns,
    platformEnvironment,
    layoutInputFoundation,
  } = {},
) {
  const errors = validateJsonSchemaValue(contract, schema, 'mobileSearchFilter');

  if (contract?.id !== WORKFLOW_ID) {
    errors.push('mobile search/filter workflow must use the canonical T021 id.');
  }
  if (!sameSet(contract?.scope?.platforms, MOBILE_PLATFORMS)) {
    errors.push('mobile search/filter scope must contain exactly iOS, Android and WeChat Mini Program.');
  }
  if (!sameSet(contract?.collectionQueryModel?.fields, REQUIRED_QUERY_FIELDS)) {
    errors.push('CollectionQueryModel must expose pending/committed query, filters, sort, continuation and restoration state.');
  }
  if (!sameSet(
    contract?.collectionQueryModel?.continuationInvalidation,
    ['committedQuery', 'committedFilters', 'sort'],
  )) {
    errors.push('query/filter/sort commits must all invalidate continuation.');
  }
  if (!sameSet(
    contract?.collectionQueryModel?.filterDraft?.externalQueryChangePolicy,
    ['cancel-draft', 'rebase-draft'],
  )) {
    errors.push('filter draft must expose explicit cancel/rebase policies when external query changes.');
  }

  const lifecycle = contract?.search?.lifecycleStates ?? [];
  for (const state of [
    'focused-empty',
    'typing',
    'composing',
    'searching',
    'results',
    'zero-results',
    'recoverable-error',
  ]) {
    if (!lifecycle.includes(state)) errors.push('search lifecycle is missing state: ' + state);
  }

  if (
    contract?.search?.ime?.commitWhileComposing !== false
    || contract?.search?.ime?.debounceStartsAfterCompositionEnd !== true
    || contract?.search?.submissionModes?.['instant-debounced']?.debounceAfterCompositionEnd !== true
  ) {
    errors.push('IME composition must suppress query commit and start debounce only after composition end.');
  }

  if (
    contract?.search?.semantics?.clearQuery === contract?.search?.semantics?.cancelBack
    || contract?.search?.semantics?.clearQuery !== 'clear-query-keep-search-context'
  ) {
    errors.push('Clear query must remain semantically distinct from Cancel/Back.');
  }

  if (
    contract?.filter?.quickFilter?.peerViewNavigation !== false
    || contract?.filter?.quickFilter?.semanticRole !== 'collection-condition'
  ) {
    errors.push('quick filter must remain a collection condition, never peer-view navigation/Tabs.');
  }
  if (!sameSet(contract?.filter?.quickFilter?.recommendedVisibleCount, [1, 2, 3])) {
    errors.push('quick filter should expose the confirmed 1-3 visible-condition guidance.');
  }

  if (
    contract?.collectionQueryModel?.filterDraft?.dismissWithoutApply !== 'discard-draft'
    || contract?.filter?.advancedSurface?.dismissCommits !== false
    || contract?.filter?.advancedSurface?.applyIsCommitBoundary !== true
  ) {
    errors.push('advanced filter dismiss must not commit; Apply must be the commit boundary.');
  }
  if (
    contract?.collectionQueryModel?.filterDraft?.reset !== 'reset-draft-only'
    || contract?.filter?.advancedSurface?.resetClearsQuery !== false
  ) {
    errors.push('Reset must affect filter draft only and must not clear the search query.');
  }

  if (!sameSet(contract?.restoration?.fields, REQUIRED_RESTORE_FIELDS)) {
    errors.push('detail return restoration must include query, filters, sort, loaded data and scroll position.');
  }

  const components = componentSlugs(componentIndex);
  for (const slug of contract?.references?.components ?? []) {
    if (!components.has(slug)) errors.push('workflow references unknown Core Component: ' + slug);
  }
  const compositeIds = new Set((composites?.composites ?? []).map((entry) => entry.id));
  for (const id of contract?.references?.composites ?? []) {
    if (!compositeIds.has(id)) errors.push('workflow references unknown Composite: ' + id);
  }
  const patternIds = new Set((patterns?.patterns ?? []).map((entry) => entry.id));
  for (const id of contract?.references?.patterns ?? []) {
    if (!patternIds.has(id)) errors.push('workflow references unknown Pattern: ' + id);
  }

  for (const id of ['searchPattern', 'collectionFilter']) {
    const pattern = findById(patterns?.patterns, id);
    if (!pattern?.workflowContractRefs?.includes(WORKFLOW_ID)) {
      errors.push(id + ' must reference the T021 workflow contract.');
    }
  }
  const filterBar = findById(composites?.composites, 'filterBar');
  if (!filterBar?.workflowContractRefs?.includes(WORKFLOW_ID)) {
    errors.push('filterBar must reference the T021 workflow contract.');
  }

  const searchField = (componentIndex?.components ?? []).find((entry) => entry.slug === 'search-field');
  if (!searchField) errors.push('Search Field must remain an indexed Core Component.');

  if (layoutInputFoundation?.id !== 'com-design:layout-input-foundation:v2') {
    errors.push('T021 must consume the accepted T012 layout/input foundation.');
  }

  const environmentExamples = new Map(
    (platformEnvironment?.examples ?? []).map((entry) => [entry.platform, entry.snapshot]),
  );
  for (const platform of MOBILE_PLATFORMS) {
    const mapping = contract?.platformMappings?.[platform];
    const snapshot = environmentExamples.get(platform);
    if (!mapping) {
      errors.push('missing platform mapping: ' + platform);
      continue;
    }
    if (!snapshot) {
      errors.push('T010 has no environment example for T021 platform: ' + platform);
      continue;
    }
    if (snapshot.keyboardIme?.composition !== true) {
      errors.push(platform + ' mapping requires T010 IME composition capability.');
    }
    if (snapshot.back?.available !== true) {
      errors.push(platform + ' mapping requires T010 back capability.');
    }
    if (!snapshot.geometry?.safeAreaInsets) {
      errors.push(platform + ' mapping requires T010 safe-area geometry.');
    }
    if (!snapshot.accessibility) {
      errors.push(platform + ' mapping requires T010 accessibility hooks.');
    }
    if (platform === 'wechat-mini-program') {
      const hasHostChrome = (snapshot.chrome ?? []).some((entry) => entry.owner === 'host');
      if (!hasHostChrome) errors.push('Mini Program mapping requires host-owned chrome evidence.');
    }
  }

  const exampleIds = new Set((contract?.examples ?? []).map((entry) => entry.id));
  for (const id of [
    'ime-instant-search',
    'filter-dismiss-does-not-commit',
    'filter-apply-commits',
    'detail-return-restores-collection',
  ]) {
    if (!exampleIds.has(id)) errors.push('T021 contract is missing acceptance example: ' + id);
  }

  return errors;
}
