import fs from 'node:fs';
import path from 'node:path';
import { validateJsonSchemaValue } from './component-contract.mjs';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function loadMotionFoundation(repoRoot) {
  const contractPath = path.join(repoRoot, 'design-source', 'specs', 'motion-foundation-v2.json');
  const schemaPath = path.join(repoRoot, 'design-source', 'schemas', 'motion-foundation-v2.schema.json');
  const contract = readJson(contractPath);
  const schema = readJson(schemaPath);
  return { contractPath, schemaPath, contract, schema };
}

export function validateMotionFoundation(repoRoot) {
  const { contract, schema } = loadMotionFoundation(repoRoot);
  const { $schema: _schema, ...value } = contract;
  const errors = validateJsonSchemaValue(value, schema, 'motionFoundation');

  const categories = new Set(contract.intents.map((intent) => intent.category));
  const requiredCategories = [
    'micro',
    'enter-exit',
    'expand-collapse',
    'overlay',
    'navigation-spatial',
    'collection-change',
    'continuous-ambient',
  ];
  for (const category of requiredCategories) {
    if (!categories.has(category)) errors.push(`motionFoundation: missing semantic category ${category}.`);
  }

  const miniProgram = contract.platforms['wechat-mini-program'];
  if (!miniProgram.constraints.includes('no-high-frequency-frame-by-frame-setData')) {
    errors.push('motionFoundation: WeChat Mini Program must prohibit high-frequency frame-by-frame setData.');
  }
  if (contract.reducedMotion?.firstClass !== true) {
    errors.push('motionFoundation: reduced motion must be first-class.');
  }

  return errors;
}
