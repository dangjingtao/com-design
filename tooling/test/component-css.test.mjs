import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  extractPreviewComponentCss,
  generateComponentsCss,
  validateComponentCssParity,
} from '../src/component-css.mjs';

function writeFixture({previewCss, aggregateCss}) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'com-design-component-css-'));
  fs.mkdirSync(path.join(root,'design-source','components'),{recursive:true});
  fs.mkdirSync(path.join(root,'design-source','preview'),{recursive:true});
  fs.writeFileSync(
    path.join(root,'design-source','components','index.json'),
    JSON.stringify({
      schemaVersion:2,
      components:[{
        slug:'sample-control',
        name:'Sample Control',
        contract:'components/sample-control.json',
        preview:'preview/component-sample-control.html'
      }]
    },null,2)+'\n'
  );
  fs.writeFileSync(
    path.join(root,'design-source','preview','component-sample-control.html'),
    '<style>/* @component-css-start */\n'+previewCss+'\n/* @component-css-end */</style>\n'
  );
  fs.writeFileSync(
    path.join(root,'design-source','components.css'),
    '/* ── Sample Control ── */\n'+aggregateCss+'\n'
  );
  return root;
}

test('T026 repository aggregated component CSS matches all current previews', () => {
  const repoRoot=path.resolve('.');
  const result=validateComponentCssParity(repoRoot);
  assert.deepEqual(result.errors,[]);
  assert.equal(result.evidence.componentCount,34);
  assert.equal(result.evidence.matched,34);
  assert.deepEqual(result.evidence.mismatched,[]);
});

test('T026 component CSS parity detects stale downstream aggregation', () => {
  const root=writeFixture({
    previewCss:'.sample{color:var(--color-primary);}',
    aggregateCss:'.sample{color:var(--color-danger);}'
  });
  const result=validateComponentCssParity(root);
  assert.equal(result.evidence.matched,0);
  assert.deepEqual(result.evidence.mismatched,['sample-control']);
  assert.ok(result.errors.some((error)=>error.includes('sample-control')));
});

test('T026 component CSS generator is deterministic and sourced from preview markers', () => {
  const root=writeFixture({
    previewCss:'.sample { color: var(--color-primary); }',
    aggregateCss:'.sample { color: var(--color-primary); }'
  });
  const first=generateComponentsCss(root);
  const second=generateComponentsCss(root);
  assert.equal(second,first);
  assert.match(first,/source: preview\/component-sample-control\.html/);
  assert.match(first,/\.sample \{ color: var\(--color-primary\); \}/);
});

test('T026 preview extraction rejects missing or duplicated marker blocks', () => {
  assert.throws(
    ()=>extractPreviewComponentCss('<style>.x{}</style>','missing'),
    /must contain exactly one/,
  );
  assert.throws(
    ()=>extractPreviewComponentCss(
      '/* @component-css-start */.a{}/* @component-css-end */'
      +'/* @component-css-start */.b{}/* @component-css-end */',
      'duplicate',
    ),
    /must contain exactly one/,
  );
});
