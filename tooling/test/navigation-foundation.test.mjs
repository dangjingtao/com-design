import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  validateNavigationFoundationContract,
} from '../src/navigation-foundation.mjs';
import { createIconRegistry } from '../src/iconography.mjs';
import { validateSourceIntegrity } from '../src/source-integrity.mjs';
import { createAgentContract } from '../src/agent-contract.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function sources() {
  const result = validateSourceIntegrity(repoRoot);
  assert.deepEqual(result.errors, []);
  const source = result.evidence.canonicalSources;
  return {
    contract: structuredClone(source.navigationFoundation.value),
    schema: structuredClone(source.navigationSchema.value),
    platformModel: structuredClone(source.platformModel.value),
    layoutInputFoundation: structuredClone(source.layoutInputFoundation.value),
    platformEnvironment: structuredClone(source.platformEnvironment.value),
    iconography: structuredClone(source.iconography.value),
    iconographySchema: structuredClone(source.iconographySchema.value),
    manifest: JSON.parse(
      fs.readFileSync(result.evidence.manifestPath, 'utf8'),
    ),
  };
}

function validate(value = sources()) {
  return validateNavigationFoundationContract(
    value.contract,
    value.schema,
    value.platformModel,
    value.layoutInputFoundation,
    value.platformEnvironment,
    value.iconography,
    value.iconographySchema,
    value.manifest,
  );
}

function findNode(nodes, id, parents = []) {
  for (const node of nodes ?? []) {
    if (node.id === id) return { node, parents };
    const child = findNode(node.children, id, [...parents, node.id]);
    if (child) return child;
  }
  return null;
}

test('T020 canonical Navigation Foundation validates and proves recursive destination state', () => {
  const value = sources();
  assert.deepEqual(validate(value), []);

  const active = findNode(
    value.contract.sampleTree,
    value.contract.stateExample.activeDestinationId,
  );
  assert.ok(active);
  assert.deepEqual(
    active.parents,
    value.contract.stateExample.activeAncestorIds,
  );
  assert.equal(
    value.contract.navigationModel.parentDestinationAndDisclosureSeparated,
    true,
  );
  assert.equal(
    value.contract.responsiveMapping.wide.defaultPresentation,
    'side-navigation-expanded',
  );
  assert.equal(
    value.contract.responsiveMapping.medium.defaultPresentation,
    'navigation-rail-compact',
  );
  assert.equal(
    value.contract.responsiveMapping.compact.deepOrMany,
    'drawer-or-sheet-multilevel',
  );
});

test('T020 rejects fake two-level navigation and state/disclosure drift', () => {
  const shallow = sources();
  shallow.contract.sampleTree[1].children[1].children = [];
  assert.ok(
    validate(shallow).some((error) =>
      error.includes('recursive depth beyond the old two-level limit')),
  );

  const wrongAncestor = sources();
  wrongAncestor.contract.stateExample.activeAncestorIds = ['workspace'];
  assert.ok(
    validate(wrongAncestor).some((error) =>
      error.includes('must equal the derived active destination ancestor chain')),
  );

  const conflatedState = sources();
  conflatedState.contract.stateExample.expandedNodeIds.push(
    conflatedState.contract.stateExample.activeDestinationId,
  );
  assert.ok(
    validate(conflatedState).some((error) =>
      error.includes('active destination state and expansion state must remain separate')),
  );
});

test('T020 consumes real T010 WeChat reserved regions and T013 stable icons', () => {
  const value = sources();
  const mini = value.contract.examples.find(
    (example) => example.context.platform === 'wechat-mini-program',
  );
  assert.equal(mini.hostEnvironmentExample, 'wechat-mini-program-runtime');
  assert.deepEqual(mini.reservedRegionIds, ['wechat-capsule-region']);

  const environment = value.platformEnvironment.examples.find(
    (example) => example.name === mini.hostEnvironmentExample,
  );
  const capsule = environment.snapshot.chrome.find(
    (entry) => entry.kind === 'host-capsule',
  );
  assert.equal(capsule.owner, 'host');
  assert.equal(capsule.comDesignOwned, false);
  assert.ok(capsule.reservedRegionIds.includes('wechat-capsule-region'));

  const iconRegistry = createIconRegistry(
    value.iconography,
    value.iconographySchema,
  );
  const action = mini.topAppBarActions[0];
  const adapted = iconRegistry.adapt(action.icon, {
    size: 20,
    interactive: true,
    accessibleName: action.accessibleName,
  });
  assert.equal(adapted.stableName, 'core.search');
  assert.equal(adapted.providerId, 'lucide-core');

  const missingRegion = sources();
  missingRegion.contract.examples.find(
    (example) => example.context.platform === 'wechat-mini-program',
  ).reservedRegionIds = ['fake-capsule'];
  assert.ok(
    validate(missingRegion).some((error) =>
      error.includes('references unknown reserved region: fake-capsule')),
  );

  const badIcon = sources();
  badIcon.contract.examples.find(
    (example) => example.context.platform === 'wechat-mini-program',
  ).topAppBarActions[0].icon = 'core.not-real';
  assert.ok(
    validate(badIcon).some((error) =>
      error.includes('Top App Bar action must resolve through T013')),
  );
});

test('T020 keyboard/touch rules are downstream of T012 rather than platform guesses', () => {
  const value = sources();
  assert.equal(
    value.layoutInputFoundation.inputRules.touch.hoverMayAffectPresentation,
    false,
  );
  assert.equal(
    value.layoutInputFoundation.inputRules.keyboard.focusVisibleRequired,
    true,
  );
  assert.equal(
    value.contract.inputAccessibility.touch.destinationAndDisclosureHitTargetsSeparated,
    true,
  );
  assert.equal(
    value.contract.inputAccessibility.keyboard.destinationAndDisclosureOperable,
    true,
  );

  value.layoutInputFoundation.inputRules.keyboard.focusVisibleRequired = false;
  assert.ok(
    validate(value).some((error) =>
      error.includes('requires T012 keyboard/hybrid focus-visible support')),
  );
});

test('T020 binds existing Top App Bar and Bottom Navigation contracts without adding a fake Side Nav Core component', () => {
  const top = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'design-source', 'components', 'top-app-bar.json'),
      'utf8',
    ),
  );
  const bottom = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'design-source', 'components', 'bottom-navigation.json'),
      'utf8',
    ),
  );
  const index = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'design-source', 'components', 'index.json'),
      'utf8',
    ),
  );
  const value = sources();
  const registry = createIconRegistry(value.iconography, value.iconographySchema);

  assert.ok(
    top.platformPresentationRefs.some(
      (entry) => entry.ref === 'sources.navigationFoundation.topAppBar',
    ),
  );
  assert.equal(top.traits.trailingActionIconSource, 'sources.iconography');
  for (const variant of top.representativeVariants) {
    for (const icon of variant.actions ?? []) {
      assert.equal(registry.resolve(icon, { strict: true }).stableName, icon);
    }
    if (variant.leadingAction) {
      assert.equal(
        registry.resolve(variant.leadingAction, { strict: true }).stableName,
        variant.leadingAction,
      );
    }
  }

  assert.ok(
    bottom.platformPresentationRefs.some(
      (entry) =>
        entry.ref === 'sources.navigationFoundation.responsiveMapping.compact',
    ),
  );
  for (const variant of bottom.representativeVariants) {
    assert.equal(
      registry.resolve(variant.icon, { strict: true }).stableName,
      variant.icon,
    );
  }

  assert.equal(index.components.length, 33);
  assert.equal(
    index.components.some((entry) => entry.slug === 'side-navigation'),
    false,
  );
});

test('Agent Contract selects navigation presentation from viewport, not platform identity', () => {
  const base = {
    schemaVersion: 2,
    input: 'touch',
    motion: 'standard',
    colorScheme: 'light',
    contentScale: 'standard',
  };
  const compactWeb = createAgentContract(repoRoot, {
    context: {
      ...base,
      platform: 'web',
      viewport: 'compact',
    },
  });
  const wideIos = createAgentContract(repoRoot, {
    context: {
      ...base,
      platform: 'ios',
      viewport: 'wide',
    },
  });

  assert.equal(
    compactWeb.target.navigationPresentation.defaultPresentation,
    'adaptive-mobile-navigation',
  );
  assert.equal(
    wideIos.target.navigationPresentation.defaultPresentation,
    'side-navigation-expanded',
  );
  assert.equal(
    compactWeb.target.navigationPresentation.platformDoesNotSelectPresentation,
    true,
  );
  assert.equal(compactWeb.catalogs.navigation.id, 'com-design:navigation-foundation:v2');
});

test('T020 keeps focused preview evidence for wide, Rail, compact and WeChat host constraints', () => {
  const preview = fs.readFileSync(
    path.join(repoRoot, 'design-source', 'preview', 'navigation-foundation.html'),
    'utf8',
  );
  for (const sample of [
    'wide-side-navigation',
    'medium-navigation-rail',
    'compact-bottom-navigation',
    'wechat-host-reserved-region',
  ]) {
    assert.match(preview, new RegExp(`data-evidence-sample="${sample}"`));
  }
  assert.match(preview, /Host Capsule/);
  assert.match(preview, /not a Com Design Core component/);
});
