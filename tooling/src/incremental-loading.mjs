import { validateJsonSchemaValue } from './component-contract.mjs';

const CONTRACT_ID = 'com-design:incremental-loading:v2';
const ALL_PLATFORMS = Object.freeze(['ios','android','web','wechat-mini-program']);
const REQUIRED_STATES = Object.freeze([
  'idle','loading-initial','ready','loading-more','appended','append-error','exhausted',
]);
const REQUIRED_RESTORE_FIELDS = Object.freeze([
  'loadedItems','continuation','committedQuery','committedFilters','sort','scrollPosition',
]);

function sameSet(actual, expected) {
  return JSON.stringify([...new Set(actual ?? [])].sort())
    === JSON.stringify([...new Set(expected ?? [])].sort());
}

function cloneItems(items) {
  return Array.isArray(items) ? structuredClone(items) : [];
}

function itemKey(item) {
  const key = item?.key;
  if (typeof key !== 'string' || key.length === 0) {
    throw new Error('incremental-loading items require a non-empty stable key.');
  }
  return key;
}

function appendDeduped(existing, incoming) {
  const seen = new Set(existing.map(itemKey));
  const appended = [];
  for (const item of incoming) {
    const key = itemKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    appended.push(structuredClone(item));
  }
  return [...existing, ...appended];
}

function requireRequestId(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('incremental-loading requestId must be a non-empty string.');
  }
  return value;
}

function continuationFromSuccess(event) {
  if (typeof event.hasMore !== 'boolean') {
    throw new Error('incremental-loading success response must declare hasMore boolean.');
  }
  if (event.hasMore === false) return null;
  if (event.nextContinuation === null || event.nextContinuation === undefined) {
    throw new Error('incremental-loading hasMore=true requires nextContinuation.');
  }
  return structuredClone(event.nextContinuation);
}

export function createIncrementalLoadingState(seed = {}) {
  const items = cloneItems(seed.items);
  items.forEach(itemKey);
  return {
    phase: seed.phase ?? (items.length ? 'ready' : 'idle'),
    items,
    continuation: seed.continuation ?? null,
    inFlight: null,
    failedContinuation: seed.failedContinuation ?? null,
    requestGeneration: Number.isInteger(seed.requestGeneration) ? seed.requestGeneration : 0,
    restorationState: seed.restorationState ? structuredClone(seed.restorationState) : null,
  };
}

export function reduceIncrementalLoadingState(state, event, contract) {
  const next = structuredClone(state);
  const effects = [];
  const type = event?.type;

  if (type === 'invalidate-continuation') {
    next.requestGeneration += 1;
    next.continuation = null;
    next.inFlight = null;
    next.failedContinuation = null;
    next.phase = next.items.length ? 'ready' : 'idle';
    effects.push('continuation-invalidated');
    return { state: next, effects };
  }

  if (type === 'request-initial') {
    if (next.inFlight) {
      effects.push('request-suppressed-in-flight');
      return { state: next, effects };
    }
    next.requestGeneration += 1;
    next.inFlight = {
      requestId: requireRequestId(event.requestId),
      continuation: null,
      generation: next.requestGeneration,
      trigger: 'initial',
    };
    next.phase = 'loading-initial';
    effects.push('request-initial');
    return { state: next, effects, request: structuredClone(next.inFlight) };
  }

  if (type === 'request-more' || type === 'retry-more') {
    if (next.phase === 'exhausted') {
      effects.push('request-suppressed-exhausted');
      return { state: next, effects };
    }
    if (
      next.phase === 'append-error'
      && type === 'request-more'
      && event.trigger !== 'manual'
    ) {
      effects.push('request-suppressed-append-error-auto');
      return { state: next, effects };
    }
    if (next.inFlight) {
      effects.push('request-suppressed-in-flight');
      return { state: next, effects };
    }
    const continuation = type === 'retry-more'
      ? next.failedContinuation
      : next.continuation;
    if (continuation === null || continuation === undefined) {
      effects.push('request-suppressed-no-continuation');
      return { state: next, effects };
    }
    next.requestGeneration += 1;
    next.inFlight = {
      requestId: requireRequestId(event.requestId),
      continuation: structuredClone(continuation),
      generation: next.requestGeneration,
      trigger: event.trigger ?? (type === 'retry-more' ? 'retry' : 'manual'),
    };
    next.phase = 'loading-more';
    effects.push('request-more');
    return { state: next, effects, request: structuredClone(next.inFlight) };
  }

  if (type === 'initial-success' || type === 'append-success') {
    const request = next.inFlight;
    if (
      !request
      || request.requestId !== event.requestId
      || request.generation !== event.generation
    ) {
      effects.push('stale-response-ignored');
      return { state: next, effects };
    }

    const incoming = cloneItems(event.items);
    const beforeCount = next.items.length;
    next.items = type === 'initial-success'
      ? appendDeduped([], incoming)
      : appendDeduped(next.items, incoming);
    next.continuation = continuationFromSuccess(event);
    next.failedContinuation = null;
    next.inFlight = null;

    if (event.hasMore === false) {
      next.phase = 'exhausted';
      effects.push('end-reached');
    } else if (type === 'append-success') {
      next.phase = 'appended';
      effects.push('items-appended');
    } else {
      next.phase = 'ready';
      effects.push('initial-items-loaded');
    }
    effects.push('dedup-applied');
    return {
      state: next,
      effects,
      appendedCount: next.items.length - beforeCount,
    };
  }

  if (type === 'initial-error') {
    if (
      !next.inFlight
      || next.inFlight.requestId !== event.requestId
      || next.inFlight.generation !== event.generation
    ) {
      effects.push('stale-response-ignored');
      return { state: next, effects };
    }
    next.inFlight = null;
    next.phase = next.items.length ? 'ready' : 'idle';
    effects.push('initial-load-failed');
    return { state: next, effects };
  }

  if (type === 'append-error') {
    const request = next.inFlight;
    if (
      !request
      || request.requestId !== event.requestId
      || request.generation !== event.generation
    ) {
      effects.push('stale-response-ignored');
      return { state: next, effects };
    }
    next.failedContinuation = structuredClone(request.continuation);
    next.inFlight = null;
    next.phase = 'append-error';
    effects.push('append-failed','existing-items-preserved','manual-retry-available');
    return { state: next, effects };
  }

  if (type === 'settle-appended') {
    if (next.phase === 'appended') next.phase = 'ready';
    return { state: next, effects };
  }

  if (type === 'capture-restoration') {
    next.restorationState = {
      loadedItems: cloneItems(next.items),
      continuation: structuredClone(next.continuation),
      committedQuery: event.committedQuery ?? '',
      committedFilters: structuredClone(event.committedFilters ?? []),
      sort: event.sort ?? null,
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
    next.items = cloneItems(snapshot.loadedItems);
    next.continuation = structuredClone(snapshot.continuation);
    next.inFlight = null;
    next.failedContinuation = null;
    next.phase = next.continuation === null ? 'exhausted' : (next.items.length ? 'ready' : 'idle');
    effects.push('collection-restored');
    return {
      state: next,
      effects,
      restoration: {
        committedQuery: snapshot.committedQuery,
        committedFilters: structuredClone(snapshot.committedFilters),
        sort: snapshot.sort,
        scrollPosition: snapshot.scrollPosition,
      },
    };
  }

  throw new Error('unknown incremental-loading event: ' + type);
}

export function validateIncrementalLoadingContract(
  contract,
  schema,
  {
    patterns,
    mobileSearchFilter,
    platformEnvironment,
    layoutInputFoundation,
  } = {},
) {
  const errors = validateJsonSchemaValue(contract, schema, 'incrementalLoading');

  if (contract?.id !== CONTRACT_ID) errors.push('incremental loading contract must use the T022 canonical id.');
  if (!sameSet(contract?.scope?.platforms, ALL_PLATFORMS)) {
    errors.push('T022 scope must contain iOS, Android, Web and WeChat Mini Program.');
  }
  if (!sameSet(contract?.stateModel?.states, REQUIRED_STATES)) {
    errors.push('incremental loading must expose the complete shared state vocabulary.');
  }
  if (
    contract?.stateModel?.continuation?.opaqueToUI !== true
    || contract?.stateModel?.continuation?.backendFieldNameBound !== false
  ) {
    errors.push('continuation must stay opaque and backend-field-name neutral.');
  }
  if (!sameSet(
    contract?.stateModel?.continuation?.invalidatedBy,
    ['committedQuery','committedFilters','sort','collectionIdentity'],
  )) {
    errors.push('continuation invalidation must cover query/filter/sort/collection identity.');
  }

  if (
    contract?.triggerPolicy?.nearEnd?.adapterOwned !== true
    || contract?.triggerPolicy?.nearEnd?.rawPixelMagicNumberForbidden !== true
    || contract?.triggerPolicy?.nearEnd?.requestInFlightGuard !== true
  ) {
    errors.push('near-end threshold must be semantic, adapter-owned and request-guarded.');
  }
  if (
    contract?.triggerPolicy?.manualFallback?.availableAfterAutomaticFailure !== true
    || contract?.triggerPolicy?.manualFallback?.retryFocusable !== true
  ) {
    errors.push('automatic failure must expose a focusable manual retry/load-more fallback.');
  }
  if (
    contract?.triggerPolicy?.underfilledViewport?.maxConsecutiveRequestsRequired !== true
    || !sameSet(
      contract?.triggerPolicy?.underfilledViewport?.stopOn,
      ['viewport-filled','append-error','exhausted','guard-limit'],
    )
  ) {
    errors.push('underfilled viewport auto-fill must be bounded and have explicit stop conditions.');
  }

  const append = contract?.appendPolicy ?? {};
  if (
    append.retainExistingDataOnError !== true
    || append.dedupByStableItemKey !== true
    || append.ignoreStaleRequest !== true
    || append.preserveBatchOrder !== true
    || append.appendDoesNotStealFocus !== true
    || append.endReachedStopsRequests !== true
  ) {
    errors.push('append policy must preserve old data, dedup/order, ignore stale responses, preserve focus and stop at end.');
  }

  if (!sameSet(contract?.restoration?.fields, REQUIRED_RESTORE_FIELDS)) {
    errors.push('T022 restoration must include items, continuation, T021 query/filter/sort and scroll position.');
  }
  if (
    contract?.boundaries?.pullToRefreshPartOfPattern !== false
    || contract?.boundaries?.virtualizationPartOfPattern !== false
    || contract?.boundaries?.virtualizationComposable !== true
    || contract?.boundaries?.backendPaginationProtocolBound !== false
  ) {
    errors.push('Pull-to-refresh, virtualization and backend pagination protocol must remain outside T022 Core semantics.');
  }

  const pattern = (patterns?.patterns ?? []).find((entry) => entry.id === 'incrementalLoading');
  if (!pattern) {
    errors.push('T022 must promote incrementalLoading to a formal Core UX Pattern.');
  } else if (!pattern.workflowContractRefs?.includes(CONTRACT_ID)) {
    errors.push('incrementalLoading Pattern must reference the T022 workflow contract.');
  }

  if (mobileSearchFilter?.id !== 'com-design:mobile-search-filter:v2') {
    errors.push('T022 restoration/invalidation integration requires accepted T021 CollectionQueryModel.');
  } else {
    const fields = mobileSearchFilter.collectionQueryModel?.fields ?? [];
    for (const field of ['committedQuery','committedFilters','sort','continuation','restorationState']) {
      if (!fields.includes(field)) errors.push('T021 CollectionQueryModel is missing required T022 field: ' + field);
    }
  }

  if (layoutInputFoundation?.id !== 'com-design:layout-input-foundation:v2') {
    errors.push('T022 must consume the accepted T012 layout/input foundation.');
  }

  const environments = new Map(
    (platformEnvironment?.examples ?? []).map((entry) => [entry.platform, entry.snapshot]),
  );
  for (const platform of ALL_PLATFORMS) {
    if (!contract?.platformMappings?.[platform]) errors.push('T022 missing platform mapping: ' + platform);
    if (!environments.has(platform)) errors.push('T010 missing platform environment for T022: ' + platform);
  }

  for (const platform of ['ios','android']) {
    const mapping = contract?.platformMappings?.[platform];
    if (
      typeof mapping?.nearEndTrigger !== 'string'
      || mapping.nearEndTrigger.length === 0
      || mapping?.overscrollMayDuplicateTrigger !== false
      || mapping?.preserveViewportOnAppend !== true
      || typeof mapping?.tailInset !== 'string'
      || !sameSet(
        mapping?.accessibilityAnnouncements,
        ['loading-more','append-error','exhausted'],
      )
    ) {
      errors.push(platform + ' mapping must define guarded near-end, stable viewport, inset and accessible loading states.');
    }
  }

  const web = contract?.platformMappings?.web;
  if (
    typeof web?.nearEndTrigger !== 'string'
    || web.nearEndTrigger.length === 0
    || web?.keyboardAndScreenReaderReachabilityRequired !== true
    || web?.criticalFooterPolicy !== 'prefer-manual-or-hybrid-when-auto-loading-blocks-footer'
    || web?.preserveViewportOnAppend !== true
  ) {
    errors.push('Web mapping must preserve keyboard/screen-reader reachability, footer access and viewport stability.');
  }

  const mini = contract?.platformMappings?.['wechat-mini-program'];
  if (
    mini?.scrollOwnerRequired !== true
    || !sameSet(mini?.scrollOwnerKinds, ['page','contained'])
    || mini?.nestedScrollOwnersForbidden !== true
    || typeof mini?.nearEndTrigger !== 'string'
    || mini.nearEndTrigger.length === 0
    || mini?.requestInFlightGuard !== true
    || mini?.highFrequencyNodeMutationAllowed !== false
    || mini?.batchAppendRequired !== true
    || mini?.virtualizationOrRecyclingComposable !== true
  ) {
    errors.push('Mini Program must choose one scroll owner, guard requests, batch append and remain virtualization-composable.');
  }

  const examples = new Set((contract?.examples ?? []).map((entry) => entry.id));
  for (const id of [
    'automatic-append-success',
    'automatic-failure-manual-retry',
    'dedup-and-stale-response',
    'detail-return-restoration',
    'mini-program-scroll-owner',
  ]) {
    if (!examples.has(id)) errors.push('T022 missing acceptance example: ' + id);
  }

  return errors;
}
