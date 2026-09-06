import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  HUMAN_GUIDE_LITERAL_ALLOWLIST,
  validateHumanGuideTokenCompliance,
} from '../src/human-guide-token-compliance.mjs';

const repoRoot=path.resolve('.');

function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'com-design-human-guide-token-'));
  for(const relativePath of ['design-source/colors_and_type.css','design-source/themes/premium-gold.css','report/design-system-v1','report/design-system-v2']){
    const source=path.join(repoRoot,relativePath);
    const target=path.join(root,relativePath);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.cpSync(source,target,{recursive:true});
  }
  return root;
}

test('T028 Human Guide shell uses canonical semantic tokens with explicit exceptions only',()=>{
  const result=validateHumanGuideTokenCompliance(repoRoot);
  assert.deepEqual(result.errors,[]);
  assert.deepEqual(result.evidence.themeScopes,['default-light','default-dark','premium-light','premium-dark']);
  assert.equal(result.evidence.acceptedV1Retained,true);
  assert.equal(result.evidence.componentInspector,true);
  assert.equal(result.evidence.violations.length,0);
  assert.equal(result.evidence.allowlistedLiterals.length,2);
});

test('T028 responsive literal allowlist is narrow and documented',()=>{
  assert.deepEqual(HUMAN_GUIDE_LITERAL_ALLOWLIST.map(item=>item.value),['840px','520px']);
  assert.ok(HUMAN_GUIDE_LITERAL_ALLOWLIST.every(item=>item.category==='responsive-boundary'&&item.reason.length>20));
});

test('T028 does not allow a responsive breakpoint literal outside its documented media-query line',()=>{
  const root=fixture();
  const cssPath=path.join(root,'report/design-system-v2/styles.css');
  fs.appendFileSync(cssPath,'\n.bad-width { inline-size: 840px; }\n');
  const result=validateHumanGuideTokenCompliance(root);
  assert.ok(result.errors.some(error=>error.includes('raw-length-literal')&&error.includes('840px')));
});

test('T028 rejects raw shell colors',()=>{
  const root=fixture();
  const cssPath=path.join(root,'report/design-system-v2/styles.css');
  fs.appendFileSync(cssPath,'\n.bad-token { color: #123456; }\n');
  const result=validateHumanGuideTokenCompliance(root);
  assert.ok(result.errors.some(error=>error.includes('raw-color-literal')));
});

test('T028 rejects token fallbacks that create a second visual truth',()=>{
  const root=fixture();
  const cssPath=path.join(root,'report/design-system-v2/styles.css');
  fs.appendFileSync(cssPath,'\n.bad-fallback { color: var(--color-text-primary, #000000); }\n');
  const result=validateHumanGuideTokenCompliance(root);
  assert.ok(result.errors.some(error=>error.includes('token-fallback')));
});

test('T028 rejects unknown Human Guide token references',()=>{
  const root=fixture();
  const cssPath=path.join(root,'report/design-system-v2/styles.css');
  fs.appendFileSync(cssPath,'\n.bad-ref { color: var(--color-not-real); }\n');
  const result=validateHumanGuideTokenCompliance(root);
  assert.ok(result.errors.some(error=>error.includes('unknown-token-reference')));
});

test('T028 rejects runtime inline styling',()=>{
  const root=fixture();
  const jsPath=path.join(root,'report/design-system-v2/app.js');
  fs.appendFileSync(jsPath,'\ndocument.body.style.color = "red";\n');
  const result=validateHumanGuideTokenCompliance(root);
  assert.ok(result.errors.some(error=>error.includes('runtime-inline-style')));
});
