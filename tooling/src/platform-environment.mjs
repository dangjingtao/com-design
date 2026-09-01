const REQUIRED_SNAPSHOT_FIELDS = [
  'schemaVersion',
  'platform',
  'geometry',
  'chrome',
  'back',
  'focus',
  'keyboardIme',
  'pointer',
  'gesture',
  'overlay',
  'accessibility',
];

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sameArray(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function valueType(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function validateSchemaNode(value, schema, path, errors) {
  if (!isPlainObject(schema)) {
    errors.push(`${path}: schema node must be an object.`);
    return;
  }

  if (Object.hasOwn(schema, 'const') && value !== schema.const) {
    errors.push(`${path} must equal ${JSON.stringify(schema.const)}.`);
    return;
  }

  if (schema.type) {
    const actual = valueType(value);
    const matches = schema.type === 'object'
      ? isPlainObject(value)
      : schema.type === 'number'
        ? typeof value === 'number' && Number.isFinite(value)
        : actual === schema.type;
    if (!matches) {
      errors.push(`${path} must be ${schema.type}.`);
      return;
    }
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(`${path} must be one of: ${schema.enum.join(', ')}.`);
    return;
  }

  if (typeof value === 'string' && Number.isInteger(schema.minLength) && value.length < schema.minLength) {
    errors.push(`${path} must contain at least ${schema.minLength} character(s).`);
  }

  if (typeof value === 'number' && Number.isFinite(schema.minimum) && value < schema.minimum) {
    errors.push(`${path} must be >= ${schema.minimum}.`);
  }

  if (isPlainObject(value)) {
    for (const requiredKey of schema.required ?? []) {
      if (!Object.hasOwn(value, requiredKey)) {
        errors.push(`${path}.${requiredKey} is required.`);
      }
    }

    const properties = schema.properties ?? {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(properties, key)) {
          errors.push(`${path}.${key} is not allowed.`);
        }
      }
    }

    for (const [key, childSchema] of Object.entries(properties)) {
      if (Object.hasOwn(value, key)) {
        validateSchemaNode(value[key], childSchema, `${path}.${key}`, errors);
      }
    }
  }

  if (Array.isArray(value)) {
    if (schema.uniqueItems === true) {
      const seen = new Set();
      for (const item of value) {
        const key = JSON.stringify(item);
        if (seen.has(key)) {
          errors.push(`${path} must not contain duplicate items.`);
          break;
        }
        seen.add(key);
      }
    }
    if (schema.items) {
      value.forEach((item, index) => validateSchemaNode(item, schema.items, `${path}[${index}]`, errors));
    }
  }
}

export function validatePlatformEnvironmentSnapshot(snapshot, schema) {
  const errors = [];
  validateSchemaNode(snapshot, schema, 'environment', errors);

  if (!isPlainObject(snapshot) || errors.length) return errors;

  const reservedRegions = snapshot.geometry?.reservedRegions ?? [];
  const seenRegionIds = new Set();
  for (const region of reservedRegions) {
    if (seenRegionIds.has(region.id)) {
      errors.push(`environment.geometry.reservedRegions must not contain duplicate id ${region.id}.`);
      continue;
    }
    seenRegionIds.add(region.id);
  }

  const regionById = new Map(reservedRegions.map((region) => [region.id, region]));
  for (const chrome of snapshot.chrome ?? []) {
    for (const regionId of chrome.reservedRegionIds ?? []) {
      const region = regionById.get(regionId);
      if (!region) {
        errors.push(`environment.chrome ${chrome.id} references missing reserved region ${regionId}.`);
        continue;
      }
      if (region.owner !== chrome.owner) {
        errors.push(`environment.chrome ${chrome.id} owner must match reserved region ${regionId} owner.`);
      }
    }
  }

  if (snapshot.pointer?.supported === false && snapshot.pointer?.hover === true) {
    errors.push('environment.pointer.hover cannot be true when pointer support is false.');
  }
  if (snapshot.pointer?.supported === false && snapshot.pointer?.precision !== 'none') {
    errors.push('environment.pointer.precision must be none when pointer support is false.');
  }
  if (snapshot.back?.available === false && (snapshot.back?.mechanisms?.length ?? 0) > 0) {
    errors.push('environment.back.mechanisms must be empty when back is unavailable.');
  }
  if (snapshot.back?.available === true && (snapshot.back?.mechanisms?.length ?? 0) === 0) {
    errors.push('environment.back.mechanisms must not be empty when back is available.');
  }
  if (snapshot.back?.predictive === true && !snapshot.back?.available) {
    errors.push('environment.back.predictive requires back availability.');
  }

  return errors;
}

export function validatePlatformEnvironmentContract(contract, schema, platformModel, manifest = null) {
  const errors = [];

  if (!isPlainObject(contract)) return ['platform environment contract must be an object.'];
  if (!isPlainObject(schema)) return ['platform environment schema must be an object.'];
  if (!isPlainObject(platformModel)) return ['platform model must be an object.'];

  if (contract.$metadata?.version !== 1 || contract.$metadata?.owner !== 'T010') {
    errors.push('platform environment metadata must declare version 1 and owner T010.');
  }
  if (schema.properties?.schemaVersion?.const !== 1) {
    errors.push('platform environment schemaVersion must be const 1.');
  }
  const requiredKeys = schema.required ?? [];
  for (const key of REQUIRED_SNAPSHOT_FIELDS) {
    if (!requiredKeys.includes(key)) {
      errors.push(`platform environment schema must require ${key}.`);
    }
  }
  if (schema.additionalProperties !== false) {
    errors.push('platform environment schema must reject unknown top-level properties.');
  }

  const modelPlatforms = platformModel.axes?.platform?.values;
  const schemaPlatforms = schema.properties?.platform?.enum;
  if (!sameArray(schemaPlatforms, modelPlatforms)) {
    errors.push('platform environment schema platform enum must match the canonical platform model exactly.');
  }

  const modelContentScale = platformModel.axes?.contentScale?.values;
  const schemaContentScale = schema.properties?.accessibility?.properties?.contentScale?.enum;
  if (!sameArray(schemaContentScale, modelContentScale)) {
    errors.push('platform environment contentScale values must match the canonical platform model exactly.');
  }

  if (platformModel.boundary?.environmentDetailsOwner !== 'T010') {
    errors.push('platform model must keep environmentDetailsOwner assigned to T010.');
  }

  const requiredPrinciples = [
    'runtimeFactsNotPlatformAssumptions',
    'platformDoesNotInferCapabilities',
    'systemAndHostChromeAreNotCore',
    'componentsDoNotProbeHostChromeDirectly',
    'adapterConsumesEnvironment',
  ];
  for (const key of requiredPrinciples) {
    if (contract.principles?.[key] !== true) {
      errors.push(`platform environment principles.${key} must be true.`);
    }
  }

  const immutableInvariants = [
    'coreSemanticsMutable',
    'actionHierarchyMutable',
    'taskResultMutable',
    'authoritativeStateMutable',
  ];
  for (const key of immutableInvariants) {
    if (contract.invariants?.[key] !== false) {
      errors.push(`platform environment invariants.${key} must be false.`);
    }
  }
  if (contract.invariants?.platformPresentationSelectionAllowed !== true) {
    errors.push('platform environment must allow adapter presentation selection.');
  }

  const consumers = contract.presentationPolicy?.consumers ?? [];
  for (const consumer of ['navigation', 'overlay', 'select']) {
    if (!consumers.includes(consumer)) {
      errors.push(`presentationPolicy.consumers must include ${consumer}.`);
    }
  }
  const equivalence = contract.presentationPolicy?.mustRemainEquivalent ?? [];
  for (const invariant of ['task-result', 'state-semantics', 'action-hierarchy']) {
    if (!equivalence.includes(invariant)) {
      errors.push(`presentationPolicy.mustRemainEquivalent must include ${invariant}.`);
    }
  }

  const examples = contract.examples ?? [];
  const seenPlatforms = [];
  for (const example of examples) {
    if (!isPlainObject(example)) {
      errors.push('platform environment examples must be objects.');
      continue;
    }
    if (example.platform !== example.snapshot?.platform) {
      errors.push(`example ${example.name ?? '<unnamed>'} platform must match snapshot.platform.`);
    }
    const snapshotErrors = validatePlatformEnvironmentSnapshot(example.snapshot, schema);
    if (snapshotErrors.length) {
      errors.push(`example ${example.name ?? '<unnamed>'} is invalid: ${snapshotErrors.join(' ')}`);
    }
    seenPlatforms.push(example.platform);
  }

  if (!sameArray([...new Set(seenPlatforms)].sort(), [...(modelPlatforms ?? [])].sort())) {
    errors.push('platform environment examples must cover each canonical platform exactly once.');
  }
  if (seenPlatforms.length !== new Set(seenPlatforms).size) {
    errors.push('platform environment examples must not duplicate platform coverage.');
  }

  const miniProgram = examples.find((example) => example.platform === 'wechat-mini-program')?.snapshot;
  const capsule = miniProgram?.chrome?.find((item) => item.kind === 'host-capsule');
  if (!capsule || capsule.owner !== 'host' || capsule.comDesignOwned !== false) {
    errors.push('WeChat Mini Program capsule must be host-owned chrome and never Com Design-owned UI.');
  }
  const capsuleRegions = new Set(capsule?.reservedRegionIds ?? []);
  const hostCapsuleRegion = miniProgram?.geometry?.reservedRegions?.find(
    (region) => region.kind === 'host-capsule' && capsuleRegions.has(region.id),
  );
  if (!hostCapsuleRegion || hostCapsuleRegion.owner !== 'host' || hostCapsuleRegion.comDesignOwned !== false) {
    errors.push('WeChat Mini Program capsule must expose a host-owned reserved region.');
  }

  if (manifest) {
    if (manifest.systemModel?.platformEnvironmentSource !== 'sources.platformEnvironment') {
      errors.push('manifest.systemModel.platformEnvironmentSource must reference sources.platformEnvironment.');
    }
    if (manifest.sources?.platformEnvironment !== './platform-environment-v1.json') {
      errors.push('manifest.sources.platformEnvironment must point to ./platform-environment-v1.json.');
    }
    if (manifest.sources?.platformEnvironmentSchema !== '../schemas/platform-environment-v1.schema.json') {
      errors.push('manifest.sources.platformEnvironmentSchema must point to ../schemas/platform-environment-v1.schema.json.');
    }
  }

  return errors;
}
