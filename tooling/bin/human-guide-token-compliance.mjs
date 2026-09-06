#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateHumanGuideTokenCompliance,
  writeHumanGuideTokenEvidence,
} from '../src/human-guide-token-compliance.mjs';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const result=validateHumanGuideTokenCompliance(repoRoot);
const output=writeHumanGuideTokenEvidence(repoRoot,result);
if(result.errors.length){
  for(const error of result.errors) console.error('error: '+error);
  console.error('Human Guide token compliance failed. Evidence: '+output);
  process.exit(1);
}
console.log(
  'Human Guide token compliance passed: '
  + result.evidence.scannedStyleFiles.length
  + ' style files, '
  + result.evidence.themeScopes.length
  + ' theme scopes, '
  + result.evidence.allowlistedLiterals.length
  + ' explicit responsive exceptions. Evidence: '
  + output,
);
