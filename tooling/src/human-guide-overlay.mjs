import fs from 'node:fs';
import path from 'node:path';
import { validateSourceIntegrity } from './source-integrity.mjs';

export function buildHumanGuideCurrentFacts(repoRoot){
  const integrity=validateSourceIntegrity(repoRoot);
  if(integrity.errors.length){
    throw new Error('Human Guide current facts require valid canonical source: '+integrity.errors.join(' | '));
  }
  const manifest=JSON.parse(
    fs.readFileSync(path.join(repoRoot,'design-source','specs','design-system-v1.json'),'utf8'),
  );
  return {
    version:manifest.$metadata?.version ?? null,
    coreComponents:integrity.evidence.catalogCounts?.coreComponents ?? 0,
    coreCompositeComponents:integrity.evidence.catalogCounts?.coreCompositeComponents ?? 0,
    corePatterns:integrity.evidence.catalogCounts?.corePatterns ?? 0,
    canonicalSourceRoot:'design-source/',
    canonicalManifest:'design-source/specs/design-system-v1.json',
    acceptedReport:'report/design-system-v1/',
    acceptedReportRole:'retained-v1-acceptance-baseline',
    previewReferenceOnly:true,
  };
}

export function buildHumanGuideOverlay(repoRoot){
  const facts=buildHumanGuideCurrentFacts(repoRoot);
  return `(()=>{
const facts=${JSON.stringify(facts)};
function applyCurrentFacts(){
  document.title='Com Design · V2 Current Facts + Accepted V1 Human Guide';

  const railCount=document.querySelector('.rail-components-title b');
  if(railCount) railCount.textContent=String(facts.coreComponents);

  const railBrandMeta=document.querySelector('.rail-brand span');
  if(railBrandMeta) railBrandMeta.textContent='Accepted V1 Guide · historical baseline';

  const eyebrow=document.querySelector('.hero .eyebrow');
  if(eyebrow) eyebrow.textContent='Accepted V1 Human Guide · retained baseline';

  for(const link of document.querySelectorAll('a')){
    if(/查看\\s+\\d+\\s+个 Pattern Preview/.test(link.textContent||'')){
      link.textContent='查看 '+facts.corePatterns+' 个 Pattern Preview ↗';
    }
  }

  for(const article of document.querySelectorAll('article')){
    if((article.textContent||'').includes('唯一真相源')){
      const small=article.querySelector('small');
      const strong=article.querySelector('b');
      const paragraph=article.querySelector('p');
      if(small) small.textContent='当前 V2 唯一真相源';
      if(strong) strong.textContent=facts.canonicalSourceRoot;
      if(paragraph) paragraph.textContent='Canonical manifest: '+facts.canonicalManifest+'。Preview / UI Kits / Human Guide 均为下游参考或验收证据，不是生产或编辑真相源。';
    }
  }

  const factsBlock=document.querySelector('.hero .facts');
  if(factsBlock && !document.getElementById('com-design-v1-baseline-label')){
    const label=document.createElement('p');
    label.id='com-design-v1-baseline-label';
    label.style.cssText='margin:0 0 8px;font:600 11px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;color:#687288';
    label.textContent='以下原始数字属于保留的 V1 验收基线；当前 V2 RC 数字见页面顶部 Current Facts。';
    factsBlock.parentNode.insertBefore(label,factsBlock);
  }

  let banner=document.getElementById('com-design-current-v2-facts');
  if(!banner){
    banner=document.createElement('aside');
    banner.id='com-design-current-v2-facts';
    banner.setAttribute('role','note');
    banner.style.cssText='margin:12px auto;padding:10px 14px;width:min(1120px,calc(100% - 32px));border:1px solid rgba(91,94,247,.22);border-radius:10px;background:rgba(91,94,247,.06);font:12px/1.55 system-ui,-apple-system,Segoe UI,sans-serif;color:#535D72;box-sizing:border-box';
    const main=document.querySelector('main');
    if(main) main.insertBefore(banner,main.firstChild);
    else document.body.insertBefore(banner,document.body.firstChild);
  }
  banner.textContent='V2 current facts · '+facts.version+' · '+facts.coreComponents+' Core Components · '+facts.coreCompositeComponents+' Core Composite Components · '+facts.corePatterns+' Core UX Patterns · canonical: '+facts.canonicalManifest+'。下方主体为保留的 V1 accepted Human Guide 基线，不代表当前 catalog 数量。';
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyCurrentFacts,{once:true});
else applyCurrentFacts();
setTimeout(applyCurrentFacts,0);
})();\n`;
}

export function validateHumanGuideCurrentFacts(repoRoot){
  const facts=buildHumanGuideCurrentFacts(repoRoot);
  const overlay=buildHumanGuideOverlay(repoRoot);
  const pages=fs.readFileSync(path.join(repoRoot,'.github','workflows','pages.yml'),'utf8');
  const errors=[];
  if(!fs.existsSync(path.join(repoRoot,facts.acceptedReport))) errors.push('accepted Human Guide report is missing.');
  if(!overlay.includes(String(facts.coreComponents)+' Core Components')) errors.push('Human Guide overlay is missing canonical component count.');
  if(!overlay.includes(String(facts.corePatterns)+' Core UX Patterns')) errors.push('Human Guide overlay is missing canonical Pattern count.');
  if(!overlay.includes(facts.canonicalManifest)) errors.push('Human Guide overlay is missing canonical manifest authority.');
  if(!overlay.includes('Preview / UI Kits / Human Guide')) errors.push('Human Guide overlay must explicitly keep Preview/UI Kits/Human Guide downstream.');
  if(!overlay.includes("main.insertBefore(banner,main.firstChild)")){
    errors.push('Human Guide current-facts banner must render inside main without changing the page grid.');
  }
  if(!overlay.includes('retained baseline') || !overlay.includes('不代表当前 catalog 数量')){
    errors.push('Human Guide must label the accepted V1 body as a retained historical baseline.');
  }
  if(!pages.includes('human-guide-overlay.mjs') || !pages.includes('com-design-v2-current.js')){
    errors.push('Pages deployment must generate and load the canonical Human Guide current-facts overlay.');
  }
  return {errors,evidence:facts};
}
