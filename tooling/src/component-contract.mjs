import fs from 'node:fs';
import path from 'node:path';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function valueType(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }
  if (isObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function validateJsonSchemaValue(value, schema, currentPath = '$') {
  const errors = [];

  if (!isObject(schema)) {
    return [`${currentPath}: schema node must be an object.`];
  }

  if (Object.hasOwn(schema, 'const') && value !== schema.const) {
    errors.push(`${currentPath}: must equal ${JSON.stringify(schema.const)}.`);
    return errors;
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => candidate === value)) {
    errors.push(`${currentPath}: must be one of ${schema.enum.map((item) => JSON.stringify(item)).join(', ')}.`);
    return errors;
  }

  if (schema.type) {
    const actual = valueType(value);
    const matches = schema.type === 'number'
      ? actual === 'number' || actual === 'integer'
      : schema.type === actual;
    if (!matches) {
      errors.push(`${currentPath}: must be ${schema.type}; got ${actual}.`);
      return errors;
    }
  }

  if (typeof value === 'string') {
    if (Number.isInteger(schema.minLength) && value.length < schema.minLength) {
      errors.push(`${currentPath}: must have length >= ${schema.minLength}.`);
    }
    if (typeof schema.pattern === 'string' && !(new RegExp(schema.pattern)).test(value)) {
      errors.push(`${currentPath}: must match ${schema.pattern}.`);
    }
  }

  if (Array.isArray(value)) {
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) {
      errors.push(`${currentPath}: must contain at least ${schema.minItems} item(s).`);
    }
    if (schema.uniqueItems === true) {
      const seen = new Set();
      for (const item of value) {
        const key = canonicalJson(item);
        if (seen.has(key)) {
          errors.push(`${currentPath}: items must be unique.`);
          break;
        }
        seen.add(key);
      }
    }
    if (isObject(schema.items)) {
      value.forEach((item, index) => {
        errors.push(...validateJsonSchemaValue(item, schema.items, `${currentPath}[${index}]`));
      });
    }
  }

  if (isObject(value)) {
    const properties = isObject(schema.properties) ? schema.properties : {};
    for (const requiredKey of schema.required ?? []) {
      if (!Object.hasOwn(value, requiredKey)) {
        errors.push(`${currentPath}.${requiredKey}: is required.`);
      }
    }

    for (const [key, childValue] of Object.entries(value)) {
      if (Object.hasOwn(properties, key)) {
        errors.push(...validateJsonSchemaValue(childValue, properties[key], `${currentPath}.${key}`));
        continue;
      }
      if (schema.additionalProperties === false) {
        errors.push(`${currentPath}.${key}: additional property is not allowed.`);
      } else if (isObject(schema.additionalProperties)) {
        errors.push(...validateJsonSchemaValue(childValue, schema.additionalProperties, `${currentPath}.${key}`));
      }
    }
  }

  return errors;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${filePath}: invalid JSON (${error.message})`);
  }
}

function isPathInside(rootPath, candidatePath) {
  const relative = path.relative(rootPath, candidatePath);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function resolveDesignSourcePath(designSourceRoot, declaredPath, label, errors) {
  if (typeof declaredPath !== 'string' || !declaredPath.trim()) {
    errors.push(`${label} must be a non-empty relative path.`);
    return null;
  }
  if (path.isAbsolute(declaredPath)) {
    errors.push(`${label} must be relative: ${declaredPath}`);
    return null;
  }

  const resolved = path.resolve(designSourceRoot, declaredPath);
  if (!isPathInside(designSourceRoot, resolved)) {
    errors.push(`${label} must stay inside design-source: ${declaredPath}`);
    return null;
  }
  if (!fs.existsSync(resolved)) {
    errors.push(`${label} points to missing path: ${declaredPath}`);
    return null;
  }
  if (!fs.statSync(resolved).isFile()) {
    errors.push(`${label} must point to a file: ${declaredPath}`);
    return null;
  }

  const realRoot = fs.realpathSync(designSourceRoot);
  const realResolved = fs.realpathSync(resolved);
  if (!isPathInside(realRoot, realResolved)) {
    errors.push(`${label} resolves outside design-source: ${declaredPath}`);
    return null;
  }

  return realResolved;
}

export function validateComponentCatalog(repoRoot, options = {}) {
  const designSourceRoot = options.designSourceRoot ?? path.join(repoRoot, 'design-source');
  const catalogPath = options.catalogPath ?? path.join(designSourceRoot, 'components', 'index.json');
  const schemaPath = options.schemaPath ?? path.join(designSourceRoot, 'schemas', 'component-contract-v2.schema.json');
  const errors = [];
  const evidence = {
    catalogPath,
    schemaPath,
    componentCount: 0,
    contractFiles: [],
    previewFiles: [],
  };

  let catalog;
  let schema;
  try {
    catalog = readJson(catalogPath);
  } catch (error) {
    return { errors: [error.message], evidence };
  }
  try {
    schema = readJson(schemaPath);
  } catch (error) {
    return { errors: [error.message], evidence };
  }

  if (catalog.schemaVersion !== 2) {
    errors.push('component catalog schemaVersion must be 2.');
  }
  if (!Array.isArray(catalog.components)) {
    errors.push('component catalog components must be an array.');
    return { errors, evidence };
  }

  const componentDir = path.join(designSourceRoot, 'components');
  const realComponentDir = fs.realpathSync(componentDir);
  const actualContractFiles = fs.readdirSync(componentDir)
    .filter((name) => name.endsWith('.json') && name !== 'index.json')
    .map((name) => fs.realpathSync(path.join(componentDir, name)))
    .sort();

  const seenSlugs = new Set();
  const seenContractPaths = new Set();
  const seenInternalSlugs = new Set();
  const listedContractPaths = new Set();

  for (const [index, entry] of catalog.components.entries()) {
    const label = `components[${index}]`;
    if (!isObject(entry)) {
      errors.push(`${label} must be an object.`);
      continue;
    }

    for (const field of ['slug', 'name', 'contract', 'preview']) {
      if (typeof entry[field] !== 'string' || !entry[field].trim()) {
        errors.push(`${label}.${field} must be a non-empty string.`);
      }
    }
    if (typeof entry.slug !== 'string' || typeof entry.contract !== 'string') continue;

    if (seenSlugs.has(entry.slug)) {
      errors.push(`duplicate component slug in catalog: ${entry.slug}`);
    }
    seenSlugs.add(entry.slug);

    if (seenContractPaths.has(entry.contract)) {
      errors.push(`duplicate component contract path in catalog: ${entry.contract}`);
    }
    seenContractPaths.add(entry.contract);

    const contractPath = resolveDesignSourcePath(
      designSourceRoot,
      entry.contract,
      `${label}.contract`,
      errors,
    );
    const previewPath = resolveDesignSourcePath(
      designSourceRoot,
      entry.preview,
      `${label}.preview`,
      errors,
    );
    if (previewPath) evidence.previewFiles.push(previewPath);
    if (!contractPath) continue;

    evidence.contractFiles.push(contractPath);
    listedContractPaths.add(contractPath);

    if (path.dirname(contractPath) !== realComponentDir) {
      errors.push(`${label}.contract must resolve inside design-source/components: ${entry.contract}`);
    }
    if (path.basename(contractPath) !== `${entry.slug}.json`) {
      errors.push(`${label}.contract filename must match slug ${entry.slug}: ${entry.contract}`);
    }

    let contract;
    try {
      contract = readJson(contractPath);
    } catch (error) {
      errors.push(error.message);
      continue;
    }

    const schemaErrors = validateJsonSchemaValue(contract, schema, entry.slug);
    errors.push(...schemaErrors);

    if (contract.slug !== entry.slug) {
      errors.push(`catalog drift for ${entry.slug}: contract slug is ${JSON.stringify(contract.slug)}.`);
    }
    if (contract.name !== entry.name) {
      errors.push(`catalog drift for ${entry.slug}: catalog name ${JSON.stringify(entry.name)} != contract name ${JSON.stringify(contract.name)}.`);
    }
    if (typeof contract.slug === 'string') {
      if (seenInternalSlugs.has(contract.slug)) {
        errors.push(`duplicate component contract slug: ${contract.slug}`);
      }
      seenInternalSlugs.add(contract.slug);
    }
  }

  for (const actualPath of actualContractFiles) {
    if (!listedContractPaths.has(actualPath)) {
      errors.push(`catalog drift: unlisted component contract ${path.relative(designSourceRoot, actualPath).split(path.sep).join('/')}.`);
    }
  }

  for (const listedPath of listedContractPaths) {
    if (!actualContractFiles.includes(listedPath)) {
      errors.push(`catalog drift: listed contract is not a component contract file ${path.relative(designSourceRoot, listedPath).split(path.sep).join('/')}.`);
    }
  }

  evidence.componentCount = catalog.components.length;
  evidence.contractFiles.sort();
  evidence.previewFiles.sort();
  return { errors, evidence };
}
