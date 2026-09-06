import fs from 'node:fs';
import path from 'node:path';

const START='/* @component-css-start */';
const END='/* @component-css-end */';

function normalizeCss(value){
  return String(value)
    .replace(/\/\*[\s\S]*?\*\//g,'')
    .replace(/\s+/g,' ')
    .replace(/\s*([{}:;,>+~])\s*/g,'$1')
    .trim();
}

function titleFromSlug(slug){
  return slug.split('-').map((part)=>part.charAt(0).toUpperCase()+part.slice(1)).join(' ');
}

export function extractPreviewComponentCss(source, label='preview'){
  const start=source.indexOf(START);
  const end=source.indexOf(END);
  if(start<0 || end<0 || end<=start){
    throw new Error(label+' must contain exactly one @component-css-start/end block.');
  }
  if(source.indexOf(START,start+START.length)>=0 || source.indexOf(END,end+END.length)>=0){
    throw new Error(label+' must contain exactly one @component-css-start/end block.');
  }
  const css=source.slice(start+START.length,end).trim();
  if(!css) throw new Error(label+' component CSS block is empty.');
  return css;
}

export function generateComponentsCss(repoRoot){
  const sourceRoot=path.join(repoRoot,'design-source');
  const index=JSON.parse(fs.readFileSync(path.join(sourceRoot,'components','index.json'),'utf8'));
  const sections=[];
  for(const entry of index.components ?? []){
    const previewPath=path.join(sourceRoot,entry.preview);
    const source=fs.readFileSync(previewPath,'utf8');
    const css=extractPreviewComponentCss(source,entry.preview);
    sections.push(
      '/* ── '+titleFromSlug(entry.slug)+' ── */\n'
      +'/* source: '+entry.preview+' */\n'
      +css
    );
  }
  return [
    '/* ═══════════════════════════════════════════════════════════════',
    '   components.css — Downstream Preview CSS Aggregate',
    '   Generated downstream from reference preview/component-*.html CSS blocks',
    '   NOT CANONICAL — regenerate via npm run build:component-css; Core truth remains components/*.json + manifest sources',
    '   ═══════════════════════════════════════════════════════════════ */',
    '',
    sections.join('\n\n'),
    ''
  ].join('\n');
}

function parseAggregatedSections(source){
  const re=/\/\* ── ([^\n]+?) ─+ \*\//g;
  const matches=[...source.matchAll(re)];
  const result=new Map();
  for(let i=0;i<matches.length;i++){
    const title=matches[i][1].trim();
    const start=matches[i].index+matches[i][0].length;
    const end=i+1<matches.length?matches[i+1].index:source.length;
    result.set(title,source.slice(start,end));
  }
  return result;
}

export function validateComponentCssParity(repoRoot){
  const sourceRoot=path.join(repoRoot,'design-source');
  const index=JSON.parse(fs.readFileSync(path.join(sourceRoot,'components','index.json'),'utf8'));
  const aggregatePath=path.join(sourceRoot,'components.css');
  const aggregate=fs.readFileSync(aggregatePath,'utf8');
  const sections=parseAggregatedSections(aggregate);
  const errors=[];
  const evidence=[];

  for(const entry of index.components ?? []){
    const title=titleFromSlug(entry.slug);
    const previewSource=fs.readFileSync(path.join(sourceRoot,entry.preview),'utf8');
    let expected;
    try{
      expected=extractPreviewComponentCss(previewSource,entry.preview);
    }catch(error){
      errors.push(error.message);
      continue;
    }
    const section=sections.get(title);
    if(!section){
      errors.push('components.css missing section for '+entry.slug+'.');
      continue;
    }
    const expectedNormalized=normalizeCss(expected);
    const actualNormalized=normalizeCss(section);
    const matches=actualNormalized.includes(expectedNormalized);
    evidence.push({slug:entry.slug,preview:entry.preview,status:matches?'pass':'fail'});
    if(!matches){
      errors.push('components.css section drifted from '+entry.preview+': '+entry.slug+'.');
    }
  }

  return {
    errors,
    evidence:{
      componentCount:(index.components ?? []).length,
      matched:evidence.filter((entry)=>entry.status==='pass').length,
      mismatched:evidence.filter((entry)=>entry.status==='fail').map((entry)=>entry.slug),
    }
  };
}

export function writeComponentsCss(repoRoot){
  const output=generateComponentsCss(repoRoot);
  const outputPath=path.join(repoRoot,'design-source','components.css');
  fs.writeFileSync(outputPath,output,'utf8');
  return path.relative(repoRoot,outputPath).replaceAll('\\','/');
}
