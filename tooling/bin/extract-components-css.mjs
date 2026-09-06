#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateComponentCssParity, writeComponentsCss } from '../src/component-css.mjs';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
if(process.argv.includes('--check')){
  const result=validateComponentCssParity(repoRoot);
  if(result.errors.length){
    console.error('Com Design component CSS parity failed:');
    for(const error of result.errors) console.error('- '+error);
    process.exit(1);
  }
  console.log('Com Design component CSS parity passed: '+result.evidence.matched+'/'+result.evidence.componentCount+' components.');
}else{
  const output=writeComponentsCss(repoRoot);
  console.log('Generated '+output+' from canonical component preview CSS blocks.');
}
