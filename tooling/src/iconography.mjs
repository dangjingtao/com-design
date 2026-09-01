import { validateJsonSchemaValue } from './component-contract.mjs';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sameNumberSet(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  const a = [...left].sort((x, y) => x - y);
  const b = [...right].sort((x, y) => x - y);
  return a.every((value, index) => value === b[index]);
}

function stableNamespace(stableName) {
  if (typeof stableName !== 'string') return null;
  if (stableName.startsWith('core.')) return 'core';
  const parts = stableName.split('.');
  if (parts.length === 3 && parts[0] === 'product') return `product.${parts[1]}`;
  return null;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function validateIconographyContract(contract, schema) {
  const errors = [];

  if (!isObject(contract)) return ['iconography: contract must be an object.'];
  if (!isObject(schema)) return ['iconography: schema must be an object.'];

  errors.push(...validateJsonSchemaValue(contract, schema, 'iconography'));

  const visualSizes = Array.isArray(contract.visualSizes) ? contract.visualSizes : [];
  if (!sameNumberSet(visualSizes, [16, 20, 24])) {
    errors.push('iconography.visualSizes must be exactly 16, 20 and 24.');
  }

  const providerKinds = new Set(Array.isArray(contract.providerKinds) ? contract.providerKinds : []);
  const providers = Array.isArray(contract.providers) ? contract.providers : [];
  const providerById = new Map();
  for (const [index, provider] of providers.entries()) {
    if (!isObject(provider)) continue;
    if (providerById.has(provider.id)) errors.push(`duplicate icon provider id: ${provider.id}`);
    else providerById.set(provider.id, provider);
    if (provider.kind && !providerKinds.has(provider.kind)) {
      errors.push(`providers[${index}].kind ${JSON.stringify(provider.kind)} is not declared by providerKinds.`);
    }
    if (typeof provider.namespace === 'string' && provider.namespace.startsWith('product.') && provider.kind !== 'svg') {
      errors.push(`providers[${index}] product namespace ${provider.namespace} must use an svg provider.`);
    }
  }

  const defaultProvider = providerById.get(contract.defaultCoreProvider);
  if (!defaultProvider) {
    errors.push(`defaultCoreProvider references missing provider: ${contract.defaultCoreProvider}`);
  } else {
    if (defaultProvider.namespace !== 'core') errors.push('defaultCoreProvider must belong to the core namespace.');
    if (defaultProvider.kind !== 'lucide') errors.push('defaultCoreProvider must use the lucide provider kind in V1.');
  }

  const icons = Array.isArray(contract.icons) ? contract.icons : [];
  const iconByStableName = new Map();

  for (const [index, icon] of icons.entries()) {
    if (!isObject(icon)) continue;
    const label = `icons[${index}]`;
    if (iconByStableName.has(icon.stableName)) errors.push(`duplicate icon stableName: ${icon.stableName}`);
    else iconByStableName.set(icon.stableName, icon);

    const derivedNamespace = stableNamespace(icon.stableName);
    if (derivedNamespace && icon.namespace !== derivedNamespace) {
      errors.push(`${label}.namespace ${JSON.stringify(icon.namespace)} does not match stableName namespace ${derivedNamespace}.`);
    }

    const provider = providerById.get(icon.provider);
    if (!provider) {
      errors.push(`${label}.provider references missing provider: ${icon.provider}`);
    } else if (provider.namespace !== icon.namespace) {
      errors.push(`${label}.provider ${icon.provider} belongs to ${provider.namespace}, not ${icon.namespace}; namespace override is forbidden.`);
    }

    if (!sameNumberSet(icon.sizes, visualSizes)) {
      errors.push(`${label}.sizes must match iconography.visualSizes exactly.`);
    }
    if (isObject(contract.geometry)) {
      if (icon.viewBox !== contract.geometry.viewBox) errors.push(`${label}.viewBox must match shared geometry viewBox.`);
      if (icon.alignment !== contract.geometry.alignment) errors.push(`${label}.alignment must match shared geometry alignment.`);
      if (icon.strokeWidth !== contract.geometry.strokeWidth) errors.push(`${label}.strokeWidth must match shared geometry strokeWidth.`);
    }
  }

  const fallback = isObject(contract.fallback) ? contract.fallback : null;
  if (fallback) {
    const fallbackIcon = iconByStableName.get(fallback.stableName);
    if (!fallbackIcon) errors.push(`fallback.stableName references missing icon: ${fallback.stableName}`);
    else if (fallbackIcon.namespace !== 'core') errors.push('fallback.stableName must reference a Core icon.');
  }

  return errors;
}

function invalidContractError(errors) {
  const error = new Error(`Invalid iconography contract (${errors.length}): ${errors.join(' | ')}`);
  error.code = 'ICONOGRAPHY_CONTRACT_INVALID';
  error.errors = errors;
  return error;
}

export function createIconRegistry(contract, schema) {
  const errors = validateIconographyContract(contract, schema);
  if (errors.length) throw invalidContractError(errors);

  const providers = new Map(contract.providers.map((provider) => [provider.id, provider]));
  const icons = new Map(contract.icons.map((icon) => [icon.stableName, icon]));
  const fallbackIcon = icons.get(contract.fallback.stableName);
  const allowedSizes = new Set(contract.visualSizes);

  const registry = {
    resolve(stableName, options = {}) {
      const size = options.size ?? 20;
      if (!allowedSizes.has(size)) {
        const error = new Error(`Unsupported icon size ${size}; allowed sizes are ${contract.visualSizes.join(', ')}.`);
        error.code = 'ICON_SIZE_UNSUPPORTED';
        throw error;
      }

      let icon = icons.get(stableName);
      const warnings = [];
      let usedFallback = false;
      if (!icon) {
        if (options.strict === true || contract.fallback.missingIcon === 'error') {
          const error = new Error(`Unknown icon stableName: ${stableName}`);
          error.code = 'ICON_NOT_FOUND';
          throw error;
        }
        icon = fallbackIcon;
        usedFallback = true;
        warnings.push(`Missing icon ${stableName}; fell back to ${fallbackIcon.stableName}.`);
      }

      const provider = providers.get(icon.provider);
      if (!provider) {
        const error = new Error(`Provider ${icon.provider} for ${icon.stableName} is unavailable.`);
        error.code = 'ICON_PROVIDER_NOT_FOUND';
        throw error;
      }

      const interactive = options.interactive === true;
      const accessibleName = typeof options.accessibleName === 'string' && options.accessibleName.trim()
        ? options.accessibleName.trim()
        : null;
      if (interactive && icon.a11y.interactiveAccessibleNameRequired && !accessibleName) {
        const error = new Error(`Interactive icon ${stableName} requires an accessibleName.`);
        error.code = 'ICON_ACCESSIBLE_NAME_REQUIRED';
        throw error;
      }

      const decorative = options.decorative ?? (!interactive && !accessibleName);
      if (decorative && icon.a11y.decorativeAllowed === false) {
        const error = new Error(`Icon ${stableName} cannot be rendered as decorative.`);
        error.code = 'ICON_DECORATIVE_FORBIDDEN';
        throw error;
      }
      if (!decorative && icon.a11y.decorativeAllowed === false && !accessibleName) {
        const error = new Error(`Non-decorative icon ${stableName} requires an accessibleName.`);
        error.code = 'ICON_ACCESSIBLE_NAME_REQUIRED';
        throw error;
      }

      return {
        requestedStableName: stableName,
        stableName: icon.stableName,
        namespace: icon.namespace,
        provider,
        providerName: icon.providerName,
        semanticName: icon.semanticName ?? null,
        size,
        geometry: {
          viewBox: icon.viewBox,
          alignment: icon.alignment,
          strokeWidth: icon.strokeWidth,
          lineCap: contract.geometry.lineCap,
          lineJoin: contract.geometry.lineJoin,
        },
        accessibility: {
          decorative,
          accessibleName,
        },
        fallback: usedFallback,
        warnings,
      };
    },

    adapt(stableName, options = {}) {
      const resolved = registry.resolve(stableName, options);
      const common = {
        stableName: resolved.stableName,
        requestedStableName: resolved.requestedStableName,
        size: resolved.size,
        geometry: resolved.geometry,
        accessibility: resolved.accessibility,
        fallback: resolved.fallback,
        warnings: resolved.warnings,
      };

      if (resolved.provider.kind === 'lucide') {
        return {
          kind: 'library-icon',
          providerId: resolved.provider.id,
          package: resolved.provider.source,
          exportName: resolved.providerName,
          ...common,
        };
      }

      if (resolved.provider.kind === 'svg') {
        return {
          kind: 'svg-icon',
          providerId: resolved.provider.id,
          source: resolved.provider.source,
          assetName: resolved.providerName,
          ...common,
        };
      }

      const error = new Error(`Unsupported icon provider kind: ${resolved.provider.kind}`);
      error.code = 'ICON_PROVIDER_KIND_UNSUPPORTED';
      throw error;
    },

    withExtension(extension = {}) {
      const extensionProviders = Array.isArray(extension.providers) ? extension.providers : [];
      const extensionIcons = Array.isArray(extension.icons) ? extension.icons : [];
      for (const provider of extensionProviders) {
        if (provider?.namespace === 'core') {
          const error = new Error('Product Extension cannot register a Core icon provider.');
          error.code = 'ICON_CORE_OVERRIDE_FORBIDDEN';
          throw error;
        }
      }
      for (const icon of extensionIcons) {
        if (icon?.namespace === 'core' || (typeof icon?.stableName === 'string' && icon.stableName.startsWith('core.'))) {
          const error = new Error('Product Extension cannot register or replace Core icons.');
          error.code = 'ICON_CORE_OVERRIDE_FORBIDDEN';
          throw error;
        }
      }

      const merged = clone(contract);
      merged.providers.push(...clone(extensionProviders));
      merged.icons.push(...clone(extensionIcons));
      return createIconRegistry(merged, schema);
    },
  };

  return registry;
}
