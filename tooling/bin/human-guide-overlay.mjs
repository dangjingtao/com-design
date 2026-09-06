#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHumanGuideOverlay } from '../src/human-guide-overlay.mjs';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const target=process.argv[2]
  ? path.resolve(repoRoot,process.argv[2])
  : path.join(repoRoot,'dist','human-guide','com-design-v2-current.js');
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,buildHumanGuideOverlay(repoRoot),'utf8');
console.log('Generated '+path.relative(repoRoot,target).replaceAll('\\','/')+' from canonical Com Design facts.');
