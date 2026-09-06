import { validateJsonSchemaValue } from './component-contract.mjs';

const CONTRACT_ID = 'com-design:state-feedback:v2';

function sameSet(actual, expected) {
  return JSON.stringify([...new Set(actual ?? [])].sort())
    === JSON.stringify([...new Set(expected ?? [])].sort());
}

function componentBySlug(components, slug) {
  return components?.[slug] ?? null;
}

function hasAll(values, required) {
  return required.every((value) => (values ?? []).includes(value));
}

export function resolveFeedbackSurface(input, contract) {
  const kind = input?.kind;

  if (kind === 'absence') {
    return { surface: contract.selection.absence };
  }
  if (kind === 'task-outcome') {
    return { surface: contract.selection.taskOutcome };
  }
  if (kind === 'persistent') {
    if (input.scope === 'local') return { surface: contract.selection.localPersistent };
    if (input.scope === 'page' || input.scope === 'region') {
      return { surface: contract.selection.pagePersistent };
    }
    throw new Error('persistent feedback requires local, page, or region scope.');
  }
  if (kind === 'transient') {
    return {
      surface: input.actionable
        ? contract.selection.transientActionable
        : contract.selection.transientAcknowledgement,
    };
  }
  if (kind === 'field-error') {
    return { surface: contract.selection.fieldError };
  }
  if (kind === 'external-block') {
    if (!contract.blockingState.causes.includes(input.cause)) {
      throw new Error('unknown blocking-state cause: ' + input.cause);
    }
    return {
      surface: contract.selection.externalBlock,
      requiredContent: [...contract.blockingState.requiredContent],
      nextActions: [...(contract.blockingState.nextActions?.[input.cause] ?? [])],
    };
  }

  throw new Error('unknown feedback semantic kind: ' + kind);
}

export function validateStateFeedbackContract(
  contract,
  schema,
  {
    componentIndex,
    components,
    patterns,
    previews,
  } = {},
) {
  const errors = validateJsonSchemaValue(contract, schema, 'stateFeedback');

  if (contract?.id !== CONTRACT_ID) {
    errors.push('state feedback contract must use the T023 canonical id.');
  }

  if (
    contract?.scope?.addsCoreComponent !== true
    || contract?.scope?.coreComponentAdded !== 'result-state'
    || contract?.scope?.addsCorePattern !== false
  ) {
    errors.push('T023 must add Result State as one Core Component without promoting Blocking State to a Core Pattern.');
  }

  const indexed = new Set((componentIndex?.components ?? []).map((entry) => entry.slug));
  for (const slug of contract?.references?.components ?? []) {
    if (!indexed.has(slug)) errors.push('state feedback references unknown Core Component: ' + slug);
  }
  if (!indexed.has('result-state')) {
    errors.push('Result State must be a canonical indexed Core Component.');
  }

  const empty = componentBySlug(components, 'empty-state');
  if (!empty) {
    errors.push('canonical Empty State contract is required.');
  } else {
    const variants = empty.variantDimensions?.variant ?? [];
    if (!sameSet(variants, ['first-use','no-data','no-results'])) {
      errors.push('Empty State variants must be exactly first-use / no-data / no-results.');
    }
    if (JSON.stringify(empty).includes('recoverable-error')) {
      errors.push('Empty State must not retain recoverable-error semantics in the V2 contract.');
    }
    if (
      empty.semanticTypeCandidates?.includes('recovery-state')
      || JSON.stringify(empty.structurePatterns ?? []).match(/danger|error/i)
    ) {
      errors.push('Empty State must remain absence-oriented and neutral, not an error/recovery surface.');
    }
  }

  const result = componentBySlug(components, 'result-state');
  if (!result) {
    errors.push('canonical Result State contract is required.');
  } else {
    const tones = result.variantDimensions?.tone ?? [];
    if (!sameSet(tones, ['success','error','warning','info','pending'])) {
      errors.push('Result State must expose success/error/warning/info/pending semantic tones.');
    }
    if (!hasAll(result.anatomy, ['semanticVisual','title','supportingText'])) {
      errors.push('Result State must expose semantic visual, title and supporting text anatomy.');
    }
    if (!(result.interactionContract ?? []).some((rule) => /At most one visually Primary/.test(rule))) {
      errors.push('Result State must constrain each outcome to at most one visual Primary action.');
    }
    if (!(result.interactionContract ?? []).some((rule) => /Field-level validation/.test(rule))) {
      errors.push('Result State must keep field validation out of page-level outcome semantics.');
    }
    if (!(result.accessibilityContract ?? []).some((rule) => /color is never the only carrier/i.test(rule))) {
      errors.push('Result State must prohibit color-only result meaning.');
    }
  }

  const alert = componentBySlug(components, 'alert');
  const inline = alert?.presentationContract?.inline;
  const banner = alert?.presentationContract?.banner;
  if (!alert || !inline || !banner) {
    errors.push('Alert must expose explicit Inline Alert and Banner presentation contracts.');
  } else {
    if (
      inline.scope !== 'local-context'
      || inline.placement !== 'inside-normal-content-flow'
      || inline.geometry !== 'contained-radius-and-local-width'
    ) {
      errors.push('Inline Alert must remain local, content-flow and contained.');
    }
    if (
      banner.scope !== 'page-or-region'
      || banner.placement !== 'defined-notification-slot-below-header-or-at-affected-region-edge'
      || banner.geometry !== 'flatter-edge-or-inset-aware-region-surface'
    ) {
      errors.push('Banner must use page/region structural placement and distinct flatter geometry.');
    }
    if (inline.geometry === banner.geometry || inline.placement === banner.placement) {
      errors.push('Inline Alert and Banner cannot differ by width alone.');
    }
  }

  const statusPattern = (patterns?.patterns ?? []).find((entry) => entry.id === 'statusComposition');
  if (!statusPattern?.workflowContractRefs?.includes(CONTRACT_ID)) {
    errors.push('Status Composition must reference the T023 state feedback contract.');
  }
  if (!statusPattern?.components?.includes('Result State')) {
    errors.push('Status Composition must recognize Result State as a feedback component.');
  }

  for (const slug of ['input','textarea','select']) {
    const field = componentBySlug(components, slug);
    const stateValues = field?.variantDimensions?.state ?? [];
    if (!stateValues.includes('error')) {
      errors.push(slug + ' must retain field-level error state ownership.');
    }
  }
  if (
    contract?.fieldValidationBoundary?.owner !== 'field-or-form-validation'
    || contract?.fieldValidationBoundary?.globalFeedbackMayReplaceFieldError !== false
  ) {
    errors.push('field errors must remain owned by field/form validation and cannot be replaced by global feedback.');
  }

  const blocking = contract?.blockingState;
  if (
    blocking?.promotedToCorePattern !== false
    || !sameSet(blocking?.requiredContent, ['cause','scope','next-action'])
  ) {
    errors.push('Blocking State must remain a non-promoted semantic capability with cause/scope/next-action.');
  }
  for (const cause of blocking?.causes ?? []) {
    if (!Array.isArray(blocking.nextActions?.[cause]) || blocking.nextActions[cause].length === 0) {
      errors.push('Blocking State cause must expose at least one next-action semantic: ' + cause);
    }
  }

  if (
    contract?.transientFeedback?.criticalFailureToastOnlyAllowed !== false
    || contract?.selection?.transientAcknowledgement !== 'toast'
    || contract?.selection?.transientActionable !== 'snackbar'
  ) {
    errors.push('Toast/Snackbar must stay transient and cannot be the only critical failure feedback.');
  }

  const alertPreview = previews?.alert ?? '';
  if (
    !alertPreview.includes('data-evidence-sample="warning-inline-titleless"')
    || !alertPreview.includes('data-evidence-sample="warning-banner-titleless"')
    || !alertPreview.includes('alert-inline')
    || !alertPreview.includes('alert-banner')
    || !alertPreview.includes('page-header')
    || !alertPreview.includes('section-card')
  ) {
    errors.push('Alert preview must visibly compare titleless warning Inline Alert vs Banner in distinct local/page contexts.');
  }

  const emptyPreview = previews?.emptyState ?? '';
  if (emptyPreview.includes('recoverable-error') || /加载失败/.test(emptyPreview)) {
    errors.push('Empty State preview must not present generic recoverable error.');
  }
  for (const sample of ['first-use','no-data','no-results']) {
    if (!emptyPreview.includes('data-evidence-sample="' + sample + '"')) {
      errors.push('Empty State preview missing absence sample: ' + sample);
    }
  }

  const resultPreview = previews?.resultState ?? '';
  for (const sample of ['success','error','pending']) {
    if (!resultPreview.includes('data-evidence-sample="' + sample + '"')) {
      errors.push('Result State preview missing outcome sample: ' + sample);
    }
  }

  const examples = new Map((contract?.examples ?? []).map((entry) => [entry.id, entry]));
  for (const id of [
    'empty-no-results',
    'task-submit-success',
    'local-sync-warning',
    'page-session-expired',
    'saved-acknowledgement',
    'undo-delete',
    'field-required',
    'offline-block',
    'permission-block',
  ]) {
    if (!examples.has(id)) errors.push('T023 feedback contract missing acceptance example: ' + id);
  }

  return errors;
}
