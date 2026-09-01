import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createIconRegistry, validateIconographyContract } from '../src/iconography.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const contract = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'specs', 'iconography.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-source', 'schemas', 'iconography-contract-v1.schema.json'), 'utf8'));

function productIcon(stableName = 'product.academy.campus', overrides = {}) {
  return {
    stableName,
    namespace: 'product.academy',
    provider: 'academy-icons',
    providerName: stableName.split('.').at(-1),
    semanticName: 'campus',
    sizes: [16, 20, 24],
    viewBox: '0 0 24 24',
    alignment: 'optical-center',
    strokeWidth: 2,
    a11y: {
      decorativeAllowed: true,
      interactiveAccessibleNameRequired: true,
    },
    ...overrides,
  };
}

const productProvider = {
  id: 'academy-icons',
  kind: 'svg',
  namespace: 'product.academy',
  source: './icons',
  versionPolicy: 'product-owned',
};

test('canonical iconography contract validates', () => {
  assert.deepEqual(validateIconographyContract(contract, schema), []);
});

test('stable Core names map through the default Lucide provider', () => {
  const registry = createIconRegistry(contract, schema);
  const icon = registry.adapt('core.search', { size: 20, interactive: true, accessibleName: 'Search' });
  assert.equal(icon.kind, 'library-icon');
  assert.equal(icon.providerId, 'lucide-core');
  assert.equal(icon.package, 'lucide');
  assert.equal(icon.exportName, 'Search');
  assert.equal(icon.size, 20);
  assert.equal(icon.accessibility.accessibleName, 'Search');
});

test('missing icons use the explicit fallback or fail in strict mode', () => {
  const registry = createIconRegistry(contract, schema);
  const fallback = registry.resolve('core.does-not-exist');
  assert.equal(fallback.stableName, 'core.help');
  assert.equal(fallback.fallback, true);
  assert.match(fallback.warnings[0], /fell back to core\.help/);
  assert.throws(() => registry.resolve('core.does-not-exist', { strict: true }), { code: 'ICON_NOT_FOUND' });
});

test('interactive icons require an accessible name', () => {
  const registry = createIconRegistry(contract, schema);
  assert.throws(() => registry.resolve('core.search', { interactive: true }), { code: 'ICON_ACCESSIBLE_NAME_REQUIRED' });
});

test('icons that forbid decorative rendering enforce their a11y contract', () => {
  const meaningfulIcon = productIcon('product.academy.alert-mark', {
    a11y: {
      decorativeAllowed: false,
      interactiveAccessibleNameRequired: true,
    },
  });
  const registry = createIconRegistry(contract, schema).withExtension({
    providers: [productProvider],
    icons: [meaningfulIcon],
  });

  assert.throws(
    () => registry.resolve('product.academy.alert-mark'),
    { code: 'ICON_DECORATIVE_FORBIDDEN' },
  );
  assert.throws(
    () => registry.resolve('product.academy.alert-mark', { decorative: true, accessibleName: 'Alert' }),
    { code: 'ICON_DECORATIVE_FORBIDDEN' },
  );
  assert.throws(
    () => registry.resolve('product.academy.alert-mark', { decorative: false }),
    { code: 'ICON_ACCESSIBLE_NAME_REQUIRED' },
  );

  const resolved = registry.resolve('product.academy.alert-mark', {
    decorative: false,
    accessibleName: 'Alert',
  });
  assert.equal(resolved.accessibility.decorative, false);
  assert.equal(resolved.accessibility.accessibleName, 'Alert');
});

test('duplicate stable names are rejected', () => {
  const invalid = structuredClone(contract);
  invalid.icons.push(structuredClone(invalid.icons[0]));
  assert.ok(validateIconographyContract(invalid, schema).some((error) => error.includes('duplicate icon stableName')));
});

test('Product Extension SVG providers can add namespaced icons', () => {
  const registry = createIconRegistry(contract, schema).withExtension({
    providers: [productProvider],
    icons: [productIcon()],
  });
  const icon = registry.adapt('product.academy.campus', { size: 24 });
  assert.equal(icon.kind, 'svg-icon');
  assert.equal(icon.providerId, 'academy-icons');
  assert.equal(icon.source, './icons');
  assert.equal(icon.assetName, 'campus');
});

test('Core and Product may reuse a local name because full stable names stay isolated', () => {
  const registry = createIconRegistry(contract, schema).withExtension({
    providers: [productProvider],
    icons: [productIcon('product.academy.search')],
  });
  assert.equal(registry.adapt('core.search').stableName, 'core.search');
  assert.equal(registry.adapt('product.academy.search').stableName, 'product.academy.search');
});

test('Product Extension cannot register Core providers or icons', () => {
  const registry = createIconRegistry(contract, schema);
  assert.throws(
    () => registry.withExtension({ providers: [{ ...productProvider, namespace: 'core' }] }),
    { code: 'ICON_CORE_OVERRIDE_FORBIDDEN' },
  );
  assert.throws(
    () => registry.withExtension({ icons: [{ ...productIcon(), stableName: 'core.company', namespace: 'core' }] }),
    { code: 'ICON_CORE_OVERRIDE_FORBIDDEN' },
  );
});
