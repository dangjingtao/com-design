import fs from 'node:fs';
import path from 'node:path';

const HUMAN_GUIDE_ROOT='report/design-system-v2';
const STYLE_FILES=[
  'report/design-system-v2/styles.css',
  'report/design-system-v2/visual-evidence.css',
];
const DOCUMENT_FILES=[
  'report/design-system-v2/index.html',
  'report/design-system-v2/visual-evidence.html',
];
const SCRIPT_FILES=['report/design-system-v2/app.js'];

export const HUMAN_GUIDE_LITERAL_ALLOWLIST=Object.freeze([
  {
    file:'report/design-system-v2/styles.css',
    value:'840px',
    category:'responsive-boundary',
    reason:'Downstream Human Guide CSS media queries cannot consume custom properties; T012 still owns semantic viewport behavior.',
  },
  {
    file:'report/design-system-v2/styles.css',
    value:'520px',
    category:'responsive-boundary',
    reason:'Narrow Human Guide recomposition boundary only; it does not define a Core platform or viewport contract.',
  },
]);

function read(repoRoot,relativePath){
  return fs.readFileSync(path.join(repoRoot,relativePath),'utf8');
}
function lineNumber(text,index){
  return text.slice(0,index).split('\n').length;
}
function declarations(text){
  return new Set([...text.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map(match=>match[1]));
}
function tokenRefs(text){
  return [...new Set([...text.matchAll(/var\((--[a-z0-9-]+)/gi)].map(match=>match[1]))].sort();
}
function scanRawUnits(relativePath,text){
  const results=[];
  for(const match of text.matchAll(/(?<![\w-])(\d+(?:\.\d+)?(?:px|rem|em))\b/g)){
    const value=match[1];
    const allowed=HUMAN_GUIDE_LITERAL_ALLOWLIST.find(entry=>entry.file===relativePath&&entry.value===value);
    if(!allowed){
      results.push({
        file:relativePath,
        line:lineNumber(text,match.index??0),
        value,
        rule:'raw-length-literal',
      });
    }
  }
  return results;
}
function scanCss(relativePath,text,knownTokens){
  const violations=[];
  for(const match of text.matchAll(/#[0-9a-f]{3,8}\b/gi)){
    violations.push({file:relativePath,line:lineNumber(text,match.index??0),value:match[0],rule:'raw-color-literal'});
  }
  for(const match of text.matchAll(/var\([^,\)]+,[^)]+\)/g)){
    violations.push({file:relativePath,line:lineNumber(text,match.index??0),value:match[0],rule:'token-fallback'});
  }
  violations.push(...scanRawUnits(relativePath,text));
  for(const match of text.matchAll(/box-shadow\s*:\s*([^;\n}]+)/gi)){
    const value=match[1].trim();
    if(value!=='none'&&!value.includes('var(')){
      violations.push({file:relativePath,line:lineNumber(text,match.index??0),value,rule:'literal-elevation'});
    }
  }
  for(const match of text.matchAll(/border-radius\s*:\s*([^;\n}]+)/gi)){
    const value=match[1].trim();
    if(value!=='0'&&!value.includes('var(')){
      violations.push({file:relativePath,line:lineNumber(text,match.index??0),value,rule:'literal-radius'});
    }
  }
  for(const match of text.matchAll(/(?:^|[;{])\s*font\s*:\s*([^;\n}]+)/gim)){
    const value=match[1].trim();
    if(!value.includes('var(')&&value!=='inherit'){
      violations.push({file:relativePath,line:lineNumber(text,match.index??0),value,rule:'literal-typography'});
    }
  }
  const refs=tokenRefs(text);
  for(const ref of refs){
    if(!knownTokens.has(ref)){
      violations.push({file:relativePath,line:null,value:ref,rule:'unknown-token-reference'});
    }
  }
  return {violations,refs};
}
function scanDocuments(repoRoot){
  const violations=[];
  for(const relativePath of DOCUMENT_FILES){
    const text=read(repoRoot,relativePath);
    for(const match of text.matchAll(/\sstyle\s*=/gi)){
      violations.push({file:relativePath,line:lineNumber(text,match.index??0),value:'style=',rule:'inline-style'});
    }
  }
  for(const relativePath of SCRIPT_FILES){
    const text=read(repoRoot,relativePath);
    const patterns=[
      [/\.style\s*\./g,'runtime-inline-style'],
      [/setAttribute\(\s*['"]style['"]/g,'runtime-inline-style'],
    ];
    for(const [pattern,rule] of patterns){
      for(const match of text.matchAll(pattern)){
        violations.push({file:relativePath,line:lineNumber(text,match.index??0),value:match[0],rule});
      }
    }
  }
  return violations;
}
function validateThemeEvidence(repoRoot,errors){
  const index=read(repoRoot,'report/design-system-v2/index.html');
  const app=read(repoRoot,'report/design-system-v2/app.js');
  const fixture=read(repoRoot,'report/design-system-v2/visual-evidence.html');
  const requiredIndex=[
    '../../design-source/themes/premium-gold.css',
    'id="theme-family"',
    'id="theme-scheme"',
    'id="component-inspector"',
    './visual-evidence.html',
  ];
  for(const fragment of requiredIndex){
    if(!index.includes(fragment)) errors.push('Human Guide V2 is missing '+fragment+'.');
  }
  for(const fragment of ['theme-premium-gold','classList.toggle(\'dark\'','selectComponent(']){
    if(!app.includes(fragment)) errors.push('Human Guide V2 app is missing '+fragment+'.');
  }
  const expectedThemes=['default-light','default-dark','premium-light','premium-dark'];
  for(const theme of expectedThemes){
    if(!fixture.includes('data-evidence-theme="'+theme+'"')){
      errors.push('Visual fixture is missing '+theme+'.');
    }
  }
  if(!fixture.includes('../../design-source/components.css')){
    errors.push('Visual fixture must reuse existing Core Component presentation evidence.');
  }
  return expectedThemes;
}
export function validateHumanGuideTokenCompliance(repoRoot){
  const errors=[];
  const foundation=read(repoRoot,'design-source/colors_and_type.css');
  const premium=read(repoRoot,'design-source/themes/premium-gold.css');
  const knownTokens=new Set([...declarations(foundation),...declarations(premium)]);
  const violations=[];
  const refsByFile={};
  for(const relativePath of STYLE_FILES){
    const text=read(repoRoot,relativePath);
    const result=scanCss(relativePath,text,knownTokens);
    violations.push(...result.violations);
    refsByFile[relativePath]=result.refs;
  }
  violations.push(...scanDocuments(repoRoot));
  for(const violation of violations){
    errors.push(violation.file+(violation.line?':'+violation.line:'')+' '+violation.rule+' '+violation.value);
  }
  const themeScopes=validateThemeEvidence(repoRoot,errors);
  const acceptedV1Path=path.join(repoRoot,'report/design-system-v1/index.html');
  if(!fs.existsSync(acceptedV1Path)) errors.push('Accepted V1 Human Guide is missing.');

  return {
    errors,
    evidence:{
      humanGuideRoot:HUMAN_GUIDE_ROOT,
      scannedStyleFiles:STYLE_FILES,
      scannedDocumentFiles:DOCUMENT_FILES,
      scannedScriptFiles:SCRIPT_FILES,
      knownCanonicalTokenCount:knownTokens.size,
      tokenRefsByFile:refsByFile,
      violations,
      allowlistedLiterals:HUMAN_GUIDE_LITERAL_ALLOWLIST,
      themeScopes,
      componentInspector:true,
      visualFixture:'report/design-system-v2/visual-evidence.html',
      acceptedV1Retained:fs.existsSync(acceptedV1Path),
      policy:{
        semanticUiStyling:'canonical-token-required',
        tokenDocumentation:'literal-values-allowed-only-as-content-not-shell-style',
        evidenceGeometry:'explicit-allowlist-required',
        tokenFallbacks:'forbidden',
      },
    },
  };
}
export function writeHumanGuideTokenEvidence(repoRoot,evidence,relativePath='dist/human-guide/token-compliance.json'){
  const output=path.join(repoRoot,relativePath);
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify({
    schemaVersion:1,
    id:'com-design:human-guide-token-compliance:v1',
    result:evidence.errors.length?'fail':'pass',
    errors:evidence.errors,
    ...evidence.evidence,
  },null,2)+'\n','utf8');
  return relativePath;
}
