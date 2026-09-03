import fs from 'node:fs';
import path from 'node:path';
import { validateJsonSchemaValue } from './component-contract.mjs';

const REQUIRED_FOUNDATIONS = ['stack', 'center', 'grid'];
const REQUIRED_INTERACTION_STATES = ['hover', 'focus-visible', 'pressed', 'disabled', 'selected-checked-open'];
const REQUIRED_HOOKS = ['layout.container', 'layout.app-shell', 'layout.side-navigation'];
const REQUIRED_ACTIVATION_MODES = Object.freeze({
  touch: ['direct-touch'],
  pointer: ['pointer-activation'],
  keyboard: ['keyboard-activation'],
  hybrid: ['direct-touch', 'pointer-activation', 'keyboard-activation'],
});
const REQUIRED_FOUNDATION_CAPABILITIES = Object.freeze({
  stack: ['vertical', 'horizontal', 'align', 'justify', 'wrap', 'semantic-gap'],
  center: ['inline-center', 'block-center-when-safe', 'both-axis-center'],
  grid: ['single-track-fallback', 'multi-track', 'adaptive-track-count', 'semantic-gap'],
});

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sameArray(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function sameKeySet(value, expected) {
  return isObject(value)
    && sameArray(Object.keys(value).sort(), [...expected].sort());
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  if (isObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function loadLayoutInputFoundation(repoRoot) {
  const contractPath = path.join(repoRoot, 'design-source', 'specs', 'layout-input-foundation-v2.json');
  const schemaPath = path.join(repoRoot, 'design-source', 'schemas', 'layout-input-foundation-v2.schema.json');
  return {
    contractPath,
    schemaPath,
    contract: readJson(contractPath),
    schema: readJson(schemaPath),
  };
}

export function validateLayoutInputFoundationContract(contract, schema, platformModel, manifest = null) {
  const errors = [];

  if (!isObject(contract)) return ['layout/input foundation contract must be an object.'];
  if (!isObject(schema)) return ['layout/input foundation schema must be an object.'];
  if (!isObject(platformModel)) return ['platform model must be an object.'];

  const { $schema: _schema, ...schemaValue } = contract;
  errors.push(...validateJsonSchemaValue(schemaValue, schema, 'layoutInputFoundation'));

  if (contract.schemaVersion !== 2 || contract.id !== 'com-design:layout-input-foundation:v2') {
    errors.push('layout/input foundation must declare schemaVersion 2 and canonical id.');
  }
  if (contract.metadata?.owner !== 'T012') {
    errors.push('layout/input foundation metadata owner must be T012.');
  }

  const axisPairs = [
    ['viewport', platformModel.axes?.viewport?.values],
    ['input', platformModel.axes?.input?.values],
    ['contentScale', platformModel.axes?.contentScale?.values],
  ];
  for (const [axis, modelValues] of axisPairs) {
    if (!sameArray(contract.axes?.[axis], modelValues)) {
      errors.push(`layout/input axis ${axis} must match the canonical platform model exactly.`);
    }
  }
  if (platformModel.axes?.viewport?.owner !== 'T012' || platformModel.axes?.input?.owner !== 'T012') {
    errors.push('canonical platform model must keep viewport and input ownership assigned to T012.');
  }
  if (!String(platformModel.axes?.contentScale?.owner ?? '').includes('T012')) {
    errors.push('canonical platform model contentScale ownership must include T012.');
  }

  const foundationKinds = (contract.foundations ?? []).map((entry) => entry?.kind);
  if (!sameArray(foundationKinds, REQUIRED_FOUNDATIONS)) {
    errors.push('layout/input foundations must declare Stack, Center and Grid exactly once in canonical order.');
  }
  for (const foundation of contract.foundations ?? []) {
    if (foundation?.id !== `layout.${foundation?.kind}`) {
      errors.push(`layout foundation ${foundation?.kind ?? '<unknown>'} must use stable id layout.${foundation?.kind ?? '<unknown>'}.`);
    }
    for (const capability of REQUIRED_FOUNDATION_CAPABILITIES[foundation?.kind] ?? []) {
      if (!(foundation?.capabilities ?? []).includes(capability)) {
        errors.push(`layout foundation ${foundation?.kind ?? '<unknown>'} must preserve confirmed capability ${capability}.`);
      }
    }
  }

  if (!sameKeySet(contract.viewportRules, platformModel.axes?.viewport?.values ?? [])) {
    errors.push('viewportRules must cover exactly the canonical viewport axis values.');
  }
  if (!sameKeySet(contract.inputRules, platformModel.axes?.input?.values ?? [])) {
    errors.push('inputRules must cover exactly the canonical input axis values.');
  }
  if (!sameKeySet(contract.contentScaleRules, platformModel.axes?.contentScale?.values ?? [])) {
    errors.push('contentScaleRules must cover exactly the canonical contentScale axis values.');
  }
  if (!sameKeySet(contract.interactionStatePolicy, REQUIRED_INTERACTION_STATES)) {
    errors.push('interactionStatePolicy must cover hover, focus-visible, pressed, disabled and selected/checked/open semantics.');
  }

  if (contract.inputRules?.touch?.hoverMayAffectPresentation !== false) {
    errors.push('touch input must not depend on hover presentation.');
  }
  if (contract.inputRules?.pointer?.hoverMayAffectPresentation !== true
      || contract.inputRules?.hybrid?.hoverMayAffectPresentation !== true) {
    errors.push('pointer and hybrid input must explicitly allow additive hover presentation.');
  }
  if (contract.inputRules?.keyboard?.focusVisibleRequired !== true
      || contract.inputRules?.hybrid?.focusVisibleRequired !== true) {
    errors.push('keyboard and hybrid input must require focus-visible treatment.');
  }
  if (!sameArray(contract.interactionStatePolicy?.hover?.appliesToInput, ['pointer', 'hybrid'])) {
    errors.push('hover state must apply only to pointer and hybrid input contexts.');
  }
  if (!sameArray(contract.interactionStatePolicy?.['focus-visible']?.appliesToInput, ['keyboard', 'hybrid'])) {
    errors.push('focus-visible state must apply to keyboard and hybrid input contexts.');
  }
  for (const [input, expectedModes] of Object.entries(REQUIRED_ACTIVATION_MODES)) {
    if (!sameArray(contract.inputRules?.[input]?.activationModes, expectedModes)) {
      errors.push(`inputRules.${input}.activationModes must equal: ${expectedModes.join(', ')}.`);
    }
  }

  for (const contentScale of platformModel.axes?.contentScale?.values ?? []) {
    const rule = contract.contentScaleRules?.[contentScale];
    if (rule?.reflowRequired !== true || rule?.criticalContentMayClip !== false) {
      errors.push(`contentScaleRules.${contentScale} must reflow and forbid critical-content clipping.`);
    }
  }

  for (const [key, value] of Object.entries(contract.adaptation?.invariants ?? {})) {
    if (value !== false) errors.push(`adaptation.invariants.${key} must remain immutable.`);
  }

  const hookIds = (contract.integrationHooks ?? []).map((hook) => hook?.id);
  if (!sameArray(hookIds, REQUIRED_HOOKS)) {
    errors.push('integrationHooks must expose Container, App Shell and Side Navigation hooks without extra promoted components.');
  }
  for (const hook of contract.integrationHooks ?? []) {
    if (hook?.coreComponent !== false) {
      errors.push(`integration hook ${hook?.id ?? '<unknown>'} must not prematurely become a Core Component.`);
    }
  }

  const modelAxes = platformModel.axes ?? {};
  for (const example of contract.examples ?? []) {
    const context = example?.context ?? {};
    for (const axis of ['platform', 'viewport', 'input', 'contentScale']) {
      if (!(modelAxes[axis]?.values ?? []).includes(context[axis])) {
        errors.push(`example ${example?.name ?? '<unnamed>'} uses invalid ${axis}: ${JSON.stringify(context[axis])}.`);
      }
    }
    if (!REQUIRED_FOUNDATIONS.includes(example?.resolvedLayout?.foundation)) {
      errors.push(`example ${example?.name ?? '<unnamed>'} uses unknown layout foundation.`);
    }
    if (!Number.isInteger(example?.resolvedLayout?.tracks) || example.resolvedLayout.tracks < 1) {
      errors.push(`example ${example?.name ?? '<unnamed>'} tracks must be an integer >= 1.`);
    }
  }

  const equivalenceGroups = new Map();
  for (const example of contract.examples ?? []) {
    const context = example?.context ?? {};
    const key = [example?.semanticTask, context.viewport, context.input, context.contentScale].join('|');
    if (!equivalenceGroups.has(key)) equivalenceGroups.set(key, []);
    equivalenceGroups.get(key).push(example);
  }
  let crossPlatformEquivalentGroups = 0;
  for (const [key, group] of equivalenceGroups.entries()) {
    const platforms = new Set(group.map((example) => example.context?.platform));
    if (platforms.size < 2) continue;
    crossPlatformEquivalentGroups += 1;
    const expectedLayout = canonicalJson(group[0].resolvedLayout);
    for (const example of group.slice(1)) {
      if (canonicalJson(example.resolvedLayout) !== expectedLayout) {
        errors.push(`platform-only layout drift is forbidden for equivalent context ${key}.`);
      }
    }
  }
  if (crossPlatformEquivalentGroups < 2) {
    errors.push('examples must prove at least two equivalent viewport/input/content-scale contexts across different platforms.');
  }

  const semanticTasks = new Set((contract.examples ?? []).map((example) => example.semanticTask));
  let compactWideTask = false;
  for (const task of semanticTasks) {
    const viewports = new Set((contract.examples ?? [])
      .filter((example) => example.semanticTask === task)
      .map((example) => example.context?.viewport));
    if (viewports.has('compact') && viewports.has('wide')) compactWideTask = true;
  }
  if (!compactWideTask) {
    errors.push('examples must preserve one semantic task across compact and wide viewport compositions.');
  }

  let enlargedReflowEvidence = false;
  for (const enlarged of (contract.examples ?? []).filter((example) => example.context?.contentScale === 'enlarged')) {
    const standard = (contract.examples ?? []).find((candidate) =>
      candidate.semanticTask === enlarged.semanticTask
      && candidate.context?.platform === enlarged.context?.platform
      && candidate.context?.viewport === enlarged.context?.viewport
      && candidate.context?.input === enlarged.context?.input
      && candidate.context?.contentScale === 'standard');
    if (standard && enlarged.resolvedLayout?.tracks < standard.resolvedLayout?.tracks) {
      enlargedReflowEvidence = true;
    }
  }
  if (!enlargedReflowEvidence) {
    errors.push('examples must show enlarged content scale reflowing without increasing layout track count.');
  }

  if (manifest) {
    if (manifest.systemModel?.layoutInputFoundationSource !== 'sources.layoutInputFoundation') {
      errors.push('manifest.systemModel.layoutInputFoundationSource must reference sources.layoutInputFoundation.');
    }
    if (manifest.sources?.layoutInputFoundation !== './layout-input-foundation-v2.json') {
      errors.push('manifest.sources.layoutInputFoundation must point to ./layout-input-foundation-v2.json.');
    }
    if (manifest.sources?.layoutInputSchema !== '../schemas/layout-input-foundation-v2.schema.json') {
      errors.push('manifest.sources.layoutInputSchema must point to ../schemas/layout-input-foundation-v2.schema.json.');
    }
    if (!(manifest.releaseGates?.requirements ?? []).includes('layoutInputFoundationMapped')) {
      errors.push('manifest release gates must require layoutInputFoundationMapped.');
    }
  }

  return errors;
}

export function validateLayoutInputFoundation(repoRoot, platformModel, manifest = null) {
  const { contract, schema } = loadLayoutInputFoundation(repoRoot);
  return validateLayoutInputFoundationContract(contract, schema, platformModel, manifest);
}
