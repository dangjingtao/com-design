import fs from 'node:fs';
import path from 'node:path';
import { validateJsonSchemaValue } from './component-contract.mjs';
import { createIconRegistry } from './iconography.mjs';

const FOUNDATION_ID = 'com-design:navigation-foundation:v2';
const REQUIRED_VIEWPORTS = ['compact', 'medium', 'wide'];
const REQUIRED_CONTEXT_AXES = ['platform', 'viewport', 'input', 'motion', 'colorScheme', 'contentScale'];

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

function walkNodes(nodes, visitor, parentIds = []) {
  for (const node of nodes ?? []) {
    visitor(node, parentIds);
    walkNodes(node?.children, visitor, [...parentIds, node?.id]);
  }
}

function findNode(nodes, targetId, parentIds = []) {
  for (const node of nodes ?? []) {
    if (node?.id === targetId) return { node, parentIds };
    const nested = findNode(node?.children, targetId, [...parentIds, node?.id]);
    if (nested) return nested;
  }
  return null;
}

function maxDepth(nodes, depth = 1) {
  let result = 0;
  for (const node of nodes ?? []) {
    result = Math.max(result, depth, maxDepth(node?.children, depth + 1));
  }
  return result;
}

function axisValues(platformModel, axis) {
  return platformModel?.axes?.[axis]?.values ?? [];
}

function validateContext(context, platformModel, label) {
  const errors = [];
  for (const axis of REQUIRED_CONTEXT_AXES) {
    if (!axisValues(platformModel, axis).includes(context?.[axis])) {
      errors.push(`${label}.context.${axis} must use a canonical platform-axis value.`);
    }
  }
  return errors;
}

function validateSampleTree(contract, iconRegistry) {
  const errors = [];
  const ids = new Set();
  let parentDestinationWithChildren = false;

  walkNodes(contract.sampleTree, (node, parentIds) => {
    if (!isObject(node)) {
      errors.push('navigation sampleTree nodes must be objects.');
      return;
    }
    if (typeof node.id !== 'string' || !node.id.trim()) {
      errors.push('every navigation node must have a non-empty id.');
    } else if (ids.has(node.id)) {
      errors.push(`duplicate navigation node id: ${node.id}`);
    } else {
      ids.add(node.id);
    }
    if (typeof node.label !== 'string' || !node.label.trim()) {
      errors.push(`navigation node ${node.id ?? '<unknown>'} must have a non-empty label.`);
    }
    if (node.destination !== undefined && (typeof node.destination !== 'string' || !node.destination.trim())) {
      errors.push(`navigation node ${node.id ?? '<unknown>'} destination must be a non-empty string when present.`);
    }
    if (node.children !== undefined && !Array.isArray(node.children)) {
      errors.push(`navigation node ${node.id ?? '<unknown>'} children must be an array when present.`);
    }
    if (node.destination && Array.isArray(node.children) && node.children.length) {
      parentDestinationWithChildren = true;
    }
    if (typeof node.icon === 'string') {
      try {
        iconRegistry.resolve(node.icon, { decorative: true });
      } catch (error) {
        errors.push(`navigation node ${node.id ?? '<unknown>'} icon ${node.icon} is not consumable through T013: ${error.message}`);
      }
    }
    if (parentIds.includes(node.id)) {
      errors.push(`navigation node ${node.id} creates a recursive cycle.`);
    }
  });

  if (maxDepth(contract.sampleTree) < 4) {
    errors.push('navigation sampleTree must prove recursive depth beyond the old two-level limit.');
  }
  if (!parentDestinationWithChildren) {
    errors.push('navigation sampleTree must prove a parent can be both a destination and a disclosure owner.');
  }
  if (contract.navigationModel?.parentDestinationAndDisclosureSeparated !== true) {
    errors.push('parent destination and disclosure hit targets must be explicitly separated.');
  }

  const state = contract.stateExample ?? {};
  const active = findNode(contract.sampleTree, state.activeDestinationId);
  if (!active?.node?.destination) {
    errors.push('stateExample.activeDestinationId must resolve to a real destination node.');
  } else if (!sameArray(state.activeAncestorIds, active.parentIds)) {
    errors.push('stateExample.activeAncestorIds must equal the derived active destination ancestor chain.');
  }
  for (const id of state.expandedNodeIds ?? []) {
    const resolved = findNode(contract.sampleTree, id);
    if (!resolved || !(resolved.node.children?.length > 0)) {
      errors.push(`stateExample.expandedNodeIds contains non-expandable node: ${id}`);
    }
  }
  if (state.activeDestinationId && (state.expandedNodeIds ?? []).includes(state.activeDestinationId)) {
    errors.push('active destination state and expansion state must remain separate identifiers.');
  }

  return errors;
}

export function loadNavigationFoundation(repoRoot) {
  const contractPath = path.join(repoRoot, 'design-source', 'specs', 'navigation-foundation-v2.json');
  const schemaPath = path.join(repoRoot, 'design-source', 'schemas', 'navigation-foundation-v2.schema.json');
  return {
    contractPath,
    schemaPath,
    contract: readJson(contractPath),
    schema: readJson(schemaPath),
  };
}

export function validateNavigationFoundationContract(
  contract,
  schema,
  platformModel,
  layoutInputFoundation,
  platformEnvironment,
  iconography,
  iconographySchema,
  manifest = null,
) {
  const errors = [];
  if (!isObject(contract)) return ['navigation foundation contract must be an object.'];
  if (!isObject(schema)) return ['navigation foundation schema must be an object.'];

  const { $schema: _schema, ...schemaValue } = contract;
  errors.push(...validateJsonSchemaValue(schemaValue, schema, 'navigationFoundation'));

  if (contract.schemaVersion !== 2 || contract.id !== FOUNDATION_ID) {
    errors.push('navigation foundation must declare schemaVersion 2 and canonical id.');
  }
  if (contract.metadata?.owner !== 'T020') {
    errors.push('navigation foundation metadata owner must be T020.');
  }
  for (const [key, value] of Object.entries(contract.principles ?? {})) {
    if (value !== true) errors.push(`navigation principle ${key} must remain true.`);
  }

  const iconRegistry = createIconRegistry(iconography, iconographySchema);
  errors.push(...validateSampleTree(contract, iconRegistry));

  const canonicalViewports = axisValues(platformModel, 'viewport');
  if (!sameArray([...Object.keys(contract.responsiveMapping ?? {})].sort(), [...canonicalViewports].sort())) {
    errors.push('responsiveMapping must cover exactly the canonical viewport axis values.');
  }
  if (!sameArray([...canonicalViewports].sort(), [...REQUIRED_VIEWPORTS].sort())) {
    errors.push('navigation foundation expects the accepted compact/medium/wide viewport vocabulary.');
  }
  if (contract.responsiveMapping?.wide?.defaultPresentation !== 'side-navigation-expanded') {
    errors.push('wide navigation must default to expanded Side Navigation.');
  }
  if (contract.responsiveMapping?.medium?.defaultPresentation !== 'navigation-rail-compact') {
    errors.push('medium navigation must expose Navigation Rail as the compact default candidate.');
  }
  if (contract.responsiveMapping?.compact?.topLevel3To5 !== 'bottom-navigation'
      || contract.responsiveMapping?.compact?.deepOrMany !== 'drawer-or-sheet-multilevel') {
    errors.push('compact navigation must distinguish 3–5 top-level destinations from deep/many destination navigation.');
  }

  if (layoutInputFoundation?.inputRules?.touch?.hoverMayAffectPresentation !== false) {
    errors.push('navigation foundation requires T012 touch input to remain hover-independent.');
  }
  if (layoutInputFoundation?.inputRules?.keyboard?.focusVisibleRequired !== true
      || layoutInputFoundation?.inputRules?.hybrid?.focusVisibleRequired !== true) {
    errors.push('navigation foundation requires T012 keyboard/hybrid focus-visible support.');
  }
  if (contract.inputAccessibility?.touch?.destinationAndDisclosureHitTargetsSeparated !== true) {
    errors.push('touch navigation must separate destination and disclosure hit targets.');
  }
  if (contract.inputAccessibility?.keyboard?.destinationAndDisclosureOperable !== true
      || contract.inputAccessibility?.keyboard?.focusVisibleRequired !== true) {
    errors.push('keyboard navigation must keep destination and disclosure independently operable with visible focus.');
  }
  if (contract.inputAccessibility?.accessibility?.railIconOnlyItemsRequireAccessibleLabel !== true) {
    errors.push('Navigation Rail icon-only items must require accessible labels.');
  }

  let wideEvidence = false;
  let mediumEvidence = false;
  let compactMobileEvidence = false;
  let miniEvidence = false;
  for (const example of contract.examples ?? []) {
    errors.push(...validateContext(example.context, platformModel, `example ${example.name ?? '<unnamed>'}`));
    if (example.context?.viewport === 'wide' && example.presentation === 'side-navigation-expanded') {
      wideEvidence = true;
    }
    if (example.context?.viewport === 'medium' && example.presentation === 'navigation-rail-compact') {
      mediumEvidence = true;
    }
    if (example.context?.viewport === 'compact'
        && example.context?.platform !== 'wechat-mini-program'
        && String(example.presentation).includes('bottom-navigation')) {
      compactMobileEvidence = true;
    }

    for (const action of example.topAppBarActions ?? []) {
      try {
        iconRegistry.adapt(action.icon, {
          size: 20,
          interactive: true,
          accessibleName: action.accessibleName,
        });
      } catch (error) {
        errors.push(`example ${example.name} Top App Bar action must resolve through T013: ${error.message}`);
      }
    }

    if (example.context?.platform === 'wechat-mini-program') {
      const environmentExample = platformEnvironment?.examples?.find(
        (candidate) => candidate.name === example.hostEnvironmentExample
          && candidate.platform === 'wechat-mini-program',
      );
      if (!environmentExample) {
        errors.push(`example ${example.name} must reference a canonical T010 WeChat environment example.`);
        continue;
      }
      const reservedById = new Map(
        (environmentExample.snapshot?.geometry?.reservedRegions ?? []).map((region) => [region.id, region]),
      );
      for (const id of example.reservedRegionIds ?? []) {
        const region = reservedById.get(id);
        if (!region) errors.push(`example ${example.name} references unknown reserved region: ${id}`);
        else if (region.owner !== 'host' || region.comDesignOwned !== false) {
          errors.push(`example ${example.name} reserved region ${id} must remain host-owned and outside Com Design Core.`);
        }
      }
      const capsule = (environmentExample.snapshot?.chrome ?? []).find((entry) => entry.kind === 'host-capsule');
      if (!capsule || capsule.owner !== 'host' || capsule.comDesignOwned !== false) {
        errors.push('WeChat Capsule must remain host-owned platform chrome, never a Core component.');
      }
      if (!(example.reservedRegionIds ?? []).some((id) => capsule?.reservedRegionIds?.includes(id))) {
        errors.push('WeChat example must reserve the host Capsule region from Top App Bar layout.');
      }
      miniEvidence = true;
    }
  }
  if (!wideEvidence || !mediumEvidence || !compactMobileEvidence || !miniEvidence) {
    errors.push('examples must cover wide Side Navigation, medium Rail, compact mobile and WeChat host-aware navigation.');
  }

  if (contract.topAppBar?.safeAreaOwnedByPlatform !== true
      || contract.topAppBar?.hostChromeIsCoreComponent !== false
      || contract.topAppBar?.trailingActions?.stableNamesOnly !== true
      || contract.topAppBar?.trailingActions?.providerImportsForbidden !== true
      || contract.topAppBar?.trailingActions?.overflowBeforeOverlap !== true) {
    errors.push('Top App Bar must consume platform geometry and T013 stable icon names without owning host chrome.');
  }

  if (manifest) {
    if (manifest.systemModel?.navigationFoundationSource !== 'sources.navigationFoundation') {
      errors.push('manifest.systemModel.navigationFoundationSource must reference sources.navigationFoundation.');
    }
    if (manifest.sources?.navigationFoundation !== './navigation-foundation-v2.json') {
      errors.push('manifest.sources.navigationFoundation must point to ./navigation-foundation-v2.json.');
    }
    if (manifest.sources?.navigationSchema !== '../schemas/navigation-foundation-v2.schema.json') {
      errors.push('manifest.sources.navigationSchema must point to ../schemas/navigation-foundation-v2.schema.json.');
    }
    if (!(manifest.releaseGates?.requirements ?? []).includes('navigationFoundationMapped')) {
      errors.push('manifest release gates must require navigationFoundationMapped.');
    }
  }

  return errors;
}

export function validateNavigationFoundation(repoRoot, dependencies, manifest = null) {
  const { contract, schema } = loadNavigationFoundation(repoRoot);
  return validateNavigationFoundationContract(
    contract,
    schema,
    dependencies.platformModel,
    dependencies.layoutInputFoundation,
    dependencies.platformEnvironment,
    dependencies.iconography,
    dependencies.iconographySchema,
    manifest,
  );
}
