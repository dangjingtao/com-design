const REQUIRED_AXES = ['platform', 'viewport', 'input', 'motion', 'colorScheme', 'contentScale'];

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sameArray(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

export function validatePlatformContext(context, schema) {
  const errors = [];

  if (!isObject(schema) || schema.type !== 'object' || !isObject(schema.properties)) {
    return ['platform context schema must be an object schema with properties.'];
  }
  if (!isObject(context)) {
    return ['platform context must be an object.'];
  }

  for (const requiredKey of schema.required ?? []) {
    if (!Object.hasOwn(context, requiredKey)) {
      errors.push(`${requiredKey} is required.`);
    }
  }

  if (schema.additionalProperties === false) {
    for (const key of Object.keys(context)) {
      if (!Object.hasOwn(schema.properties, key)) {
        errors.push(`${key} is not allowed.`);
      }
    }
  }

  for (const [key, rule] of Object.entries(schema.properties)) {
    if (!Object.hasOwn(context, key)) continue;
    const value = context[key];

    if (Object.hasOwn(rule, 'const') && value !== rule.const) {
      errors.push(`${key} must equal ${JSON.stringify(rule.const)}.`);
      continue;
    }
    if (rule.type && typeof value !== rule.type) {
      errors.push(`${key} must be ${rule.type}.`);
      continue;
    }
    if (Array.isArray(rule.enum) && !rule.enum.includes(value)) {
      errors.push(`${key} must be one of: ${rule.enum.join(', ')}.`);
    }
  }

  return errors;
}

export function validatePlatformModel(model, schema, manifest = null) {
  const errors = [];

  if (!isObject(model)) return ['platform model must be an object.'];
  if (!isObject(schema)) return ['platform context schema must be an object.'];

  if (model.$metadata?.version !== 2) {
    errors.push('platform model metadata version must be 2.');
  }
  if (schema.properties?.schemaVersion?.const !== 2) {
    errors.push('platform context schemaVersion must be const 2.');
  }
  if (model.principles?.orthogonalAxes !== true || model.principles?.platformDoesNotInferAxes !== true) {
    errors.push('platform model must explicitly declare orthogonal axes and forbid platform-derived axis inference.');
  }

  const axes = model.axes;
  if (!isObject(axes)) {
    errors.push('platform model axes must be an object.');
  } else {
    for (const axis of REQUIRED_AXES) {
      const modelValues = axes[axis]?.values;
      const schemaValues = schema.properties?.[axis]?.enum;
      if (!Array.isArray(modelValues) || modelValues.length === 0) {
        errors.push(`platform model axis ${axis} must declare non-empty values.`);
        continue;
      }
      if (!sameArray(modelValues, schemaValues)) {
        errors.push(`platform model axis ${axis} must match schema enum values exactly.`);
      }
      if (axes[axis]?.required !== true) {
        errors.push(`platform model axis ${axis} must be required.`);
      }
    }
  }

  const requiredKeys = schema.required ?? [];
  for (const key of ['schemaVersion', ...REQUIRED_AXES]) {
    if (!requiredKeys.includes(key)) {
      errors.push(`platform context schema must require ${key}.`);
    }
  }
  if (schema.additionalProperties !== false) {
    errors.push('platform context schema must reject unknown axes.');
  }

  const platformIds = Array.isArray(model.platforms) ? model.platforms.map((entry) => entry?.id) : [];
  if (!sameArray(platformIds, axes?.platform?.values)) {
    errors.push('platform list must match the platform axis values exactly.');
  }

  const ownership = model.uiOwnership;
  const expectedOwnership = {
    systemChrome: ['system', false],
    hostChrome: ['host', false],
    comDesignUi: ['com-design', true],
  };
  for (const [key, [owner, comDesignOwned]] of Object.entries(expectedOwnership)) {
    if (ownership?.[key]?.owner !== owner || ownership?.[key]?.comDesignOwned !== comDesignOwned) {
      errors.push(`uiOwnership.${key} must distinguish ${owner}-owned UI correctly.`);
    }
  }

  for (const example of model.examples?.valid ?? []) {
    const exampleErrors = validatePlatformContext(example.context, schema);
    if (exampleErrors.length) {
      errors.push(`valid example ${example.name ?? '<unnamed>'} is invalid: ${exampleErrors.join(' ')}`);
    }
  }
  for (const example of model.examples?.invalid ?? []) {
    const exampleErrors = validatePlatformContext(example.context, schema);
    if (exampleErrors.length === 0) {
      errors.push(`invalid example ${example.name ?? '<unnamed>'} was accepted.`);
    }
  }

  if (manifest) {
    if (manifest.systemModel?.platformContextSource !== 'sources.platformModel') {
      errors.push('manifest.systemModel.platformContextSource must reference sources.platformModel.');
    }
    for (const axis of REQUIRED_AXES) {
      const supported = manifest.systemModel?.axes?.[axis]?.supported;
      if (!sameArray(supported, axes?.[axis]?.values)) {
        errors.push(`manifest systemModel axis ${axis} must match the canonical platform model.`);
      }
    }
    if (manifest.platformStatus?.currentModelAxis !== 'sources.platformModel.axes.platform.values') {
      errors.push('manifest.platformStatus.currentModelAxis must point at the canonical platform model.');
    }
  }

  return errors;
}

export const platformContextAxes = [...REQUIRED_AXES];
