#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildHumanGuideCurrentJson,
  buildHumanGuideRootIndex,
  validateHumanGuideV2,
} from '../src/human-guide-v2.mjs';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const outputDir=path.resolve(repoRoot,process.argv[2]||'dist/human-guide');
const sourceRevision=process.env.GITHUB_SHA||process.env.COM_DESIGN_SOURCE_REVISION||'local';
const result=validateHumanGuideV2(repoRoot);
if(result.errors.length){
  for(const error of result.errors) console.error('error: '+error);
  process.exit(1);
}
fs.mkdirSync(outputDir,{recursive:true});
fs.writeFileSync(path.join(outputDir,'current.json'),buildHumanGuideCurrentJson(repoRoot,{sourceRevision}));
fs.writeFileSync(path.join(outputDir,'index.html'),buildHumanGuideRootIndex(repoRoot,{sourceRevision}));
console.log('Human Guide V2 current entry: '+result.evidence.version+' · '+result.evidence.counts.coreComponents+' components · '+result.evidence.counts.coreCompositeComponents+' composites · '+result.evidence.counts.corePatterns+' patterns');
console.log('Wrote '+path.relative(repoRoot,outputDir)+'/current.json and index.html');
