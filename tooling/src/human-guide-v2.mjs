import fs from 'node:fs';
import path from 'node:path';
import { validateSourceIntegrity } from './source-integrity.mjs';

const CURRENT_SCHEMA_VERSION=1;
const CURRENT_ID='com-design:human-guide-current:v2';

function readJson(filePath){
  return JSON.parse(fs.readFileSync(filePath,'utf8'));
}
function requireFile(repoRoot,relativePath,errors){
  const filePath=path.join(repoRoot,relativePath);
  if(!fs.existsSync(filePath)) errors.push(relativePath+' is missing.');
  return filePath;
}
export function buildHumanGuideV2Facts(repoRoot,{sourceRevision='unknown'}={}){
  const integrity=validateSourceIntegrity(repoRoot);
  if(integrity.errors.length){
    throw new Error('Human Guide V2 requires valid canonical source: '+integrity.errors.join(' | '));
  }
  const manifest=readJson(path.join(repoRoot,'design-source/specs/design-system-v1.json'));
  const components=readJson(path.join(repoRoot,'design-source/components/index.json')).components ?? [];
  const composites=readJson(path.join(repoRoot,'design-source/specs/core-composites.json')).composites ?? [];
  const patterns=readJson(path.join(repoRoot,'design-source/specs/core-patterns.json')).patterns ?? [];
  const version=manifest.$metadata?.version;
  if(!version) throw new Error('Canonical manifest is missing $metadata.version.');
  return {
    schemaVersion:CURRENT_SCHEMA_VERSION,
    id:CURRENT_ID,
    version,
    status:manifest.$metadata?.status ?? null,
    currentPath:'versions/'+version+'/',
    currentEntry:'/',
    acceptedV1Path:'accepted/v1/',
    canonicalSourceRoot:'design-source/',
    canonicalManifest:'design-source/specs/design-system-v1.json',
    sourceRevision,
    downstreamAuthority:false,
    previewReferenceOnly:true,
    counts:{
      coreComponents:components.length,
      coreCompositeComponents:composites.length,
      corePatterns:patterns.length,
    },
    componentSlugs:components.map(item=>item.slug),
    compositeIds:composites.map(item=>item.id),
    patternIds:patterns.map(item=>item.id),
  };
}
export function buildHumanGuideCurrentJson(repoRoot,options={}){
  return JSON.stringify(buildHumanGuideV2Facts(repoRoot,options),null,2)+'\n';
}
export function buildHumanGuideRootIndex(repoRoot,options={}){
  const facts=buildHumanGuideV2Facts(repoRoot,options);
  const target='./'+facts.currentPath;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="refresh" content="0;url=${target}">
  <title>Com Design · Current Human Guide</title>
  <link rel="canonical" href="${target}">
</head>
<body>
  <p>正在进入 Com Design Human Guide ${facts.version}。<a href="${target}">继续 ↗</a></p>
</body>
</html>
`;
}
export function validateHumanGuideV2(repoRoot){
  const errors=[];
  let facts=null;
  try{
    facts=buildHumanGuideV2Facts(repoRoot);
  }catch(error){
    errors.push(error instanceof Error?error.message:String(error));
    return {errors,evidence:{}};
  }
  const htmlPath=requireFile(repoRoot,'report/design-system-v2/index.html',errors);
  const appPath=requireFile(repoRoot,'report/design-system-v2/app.js',errors);
  requireFile(repoRoot,'report/design-system-v2/styles.css',errors);
  requireFile(repoRoot,'report/design-system-v1/index.html',errors);
  const pagesPath=requireFile(repoRoot,'.github/workflows/pages.yml',errors);
  const builderPath=requireFile(repoRoot,'tooling/bin/human-guide-v2.mjs',errors);
  if(errors.length) return {errors,evidence:facts};

  const html=fs.readFileSync(htmlPath,'utf8');
  const app=fs.readFileSync(appPath,'utf8');
  const pages=fs.readFileSync(pagesPath,'utf8');
  const builder=fs.readFileSync(builderPath,'utf8');

  for(const required of [
    "components/index.json",
    "specs/core-composites.json",
    "specs/core-patterns.json",
    "specs/design-system-v1.json",
  ]){
    if(!app.includes(required)) errors.push('Human Guide V2 app must read canonical '+required+'.');
  }
  if(!html.includes('data-source-base="../../design-source"')){
    errors.push('Human Guide V2 must resolve canonical data from design-source/.');
  }
  if(!html.includes('Human Guide') || !html.includes('downstream consumer')){
    errors.push('Human Guide V2 must identify itself as a downstream human consumer.');
  }
  if(/\b33\s+Core Components\b|\b6\s+Core UX Patterns\b/.test(html+app)){
    errors.push('Human Guide V2 must not carry stale V1 catalog counts.');
  }
  if(!facts.componentSlugs.includes('result-state')){
    errors.push('Canonical component catalog must expose Result State.');
  }
  if(!facts.patternIds.includes('incrementalLoading')){
    errors.push('Canonical pattern catalog must expose Incremental Loading / Infinite List.');
  }
  if(facts.counts.coreCompositeComponents<1){
    errors.push('Canonical composite catalog must be non-empty.');
  }

  const requiredPagesFragments=[
    'report/design-system-v2',
    '_site/accepted/v1',
    '_site/versions',
    'human-guide-v2.mjs _site',
  ];
  for(const fragment of requiredPagesFragments){
    if(!pages.includes(fragment)) errors.push('Pages current-entry assembly is missing '+fragment+'.');
  }
  if(!builder.includes("path.join(outputDir,'current.json')") || !builder.includes("path.join(outputDir,'index.html')")){
    errors.push('Human Guide V2 builder must emit current.json and the root current pointer.');
  }
  if(pages.includes('human-guide-overlay.mjs _site/com-design-v2-current.js')){
    errors.push('Pages must not use the V1 current-facts overlay as the normal V2 current entry.');
  }

  return {
    errors,
    evidence:{
      ...facts,
      resultStatePresent:facts.componentSlugs.includes('result-state'),
      incrementalLoadingPresent:facts.patternIds.includes('incrementalLoading'),
      acceptedV1Retained:fs.existsSync(path.join(repoRoot,'report/design-system-v1/index.html')),
      v2Shell:'report/design-system-v2/',
    },
  };
}
