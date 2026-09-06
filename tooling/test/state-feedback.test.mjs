import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  resolveFeedbackSurface,
  validateStateFeedbackContract,
} from '../src/state-feedback.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(repoRoot,p),'utf8'));
const readText = (p) => fs.readFileSync(path.join(repoRoot,p),'utf8');

const contract = readJson('design-source/specs/state-feedback-v2.json');
const schema = readJson('design-source/schemas/state-feedback-v2.schema.json');
const componentIndex = readJson('design-source/components/index.json');
const patterns = readJson('design-source/specs/core-patterns.json');
const components = Object.fromEntries(
  componentIndex.components.map((entry) => [
    entry.slug,
    readJson('design-source/' + entry.contract),
  ]),
);
const previews = {
  alert: readText('design-source/preview/component-alert.html'),
  emptyState: readText('design-source/preview/component-empty-state.html'),
  resultState: readText('design-source/preview/component-result-state.html'),
};

const validate = (candidate=contract, overrides={}) => validateStateFeedbackContract(
  candidate,
  schema,
  { componentIndex, components, patterns, previews, ...overrides },
);

test('T023 canonical feedback spectrum validates and adds only Result State to Core', () => {
  assert.deepEqual(validate(), []);
  assert.equal(componentIndex.components.length, 34);
  assert.equal(patterns.patterns.length, 7);
  assert.equal(componentIndex.components.find((entry)=>entry.slug==='result-state').name,'Result State');
});

test('T023 selects absence, outcome, persistent, transient, field and blocking surfaces deterministically', () => {
  assert.equal(resolveFeedbackSurface({kind:'absence'},contract).surface,'empty-state');
  assert.equal(resolveFeedbackSurface({kind:'task-outcome'},contract).surface,'result-state');
  assert.equal(resolveFeedbackSurface({kind:'persistent',scope:'local'},contract).surface,'alert:inline');
  assert.equal(resolveFeedbackSurface({kind:'persistent',scope:'page'},contract).surface,'alert:banner');
  assert.equal(resolveFeedbackSurface({kind:'transient',actionable:false},contract).surface,'toast');
  assert.equal(resolveFeedbackSurface({kind:'transient',actionable:true},contract).surface,'snackbar');
  assert.equal(resolveFeedbackSurface({kind:'field-error'},contract).surface,'field-validation');
  const offline=resolveFeedbackSurface({kind:'external-block',cause:'offline'},contract);
  assert.equal(offline.surface,'blocking-state');
  assert.deepEqual(offline.requiredContent,['cause','scope','next-action']);
  assert.ok(offline.nextActions.includes('retry'));
});

test('T023 Empty State cannot regain recoverable-error semantics', () => {
  const mutated=JSON.parse(JSON.stringify(components));
  mutated['empty-state'].variantDimensions.variant.push('recoverable-error');
  const errors=validate(contract,{components:mutated});
  assert.ok(errors.some((error)=>error.includes('Empty State variants must be exactly')));
  assert.ok(errors.some((error)=>error.includes('must not retain recoverable-error')));
});

test('T023 Result State owns task outcomes but not field validation', () => {
  const mutated=JSON.parse(JSON.stringify(components));
  mutated['result-state'].interactionContract =
    mutated['result-state'].interactionContract.filter((rule)=>!rule.includes('Field-level validation'));
  const errors=validate(contract,{components:mutated});
  assert.ok(errors.some((error)=>error.includes('keep field validation out')));
  assert.equal(resolveFeedbackSurface({kind:'field-error'},contract).surface,'field-validation');
});

test('T023 Inline Alert and Banner cannot collapse into one width-only presentation', () => {
  const mutated=JSON.parse(JSON.stringify(components));
  mutated.alert.presentationContract.banner.placement =
    mutated.alert.presentationContract.inline.placement;
  mutated.alert.presentationContract.banner.geometry =
    mutated.alert.presentationContract.inline.geometry;
  const errors=validate(contract,{components:mutated});
  assert.ok(errors.some((error)=>error.includes('Banner must use page/region')));
  assert.ok(errors.some((error)=>error.includes('cannot differ by width alone')));
});

test('T023 titleless warning preview visibly distinguishes local Inline Alert from page Banner', () => {
  assert.match(previews.alert,/warning-inline-titleless/);
  assert.match(previews.alert,/warning-banner-titleless/);
  assert.match(previews.alert,/section-card/);
  assert.match(previews.alert,/page-header/);
  assert.match(previews.alert,/\.alert-inline/);
  assert.match(previews.alert,/\.alert-banner/);
});

test('T023 Blocking State requires a next action for every accepted blocking cause', () => {
  const candidate=JSON.parse(JSON.stringify(contract));
  candidate.blockingState.nextActions['permission-denied']=[];
  const errors=validate(candidate);
  assert.ok(errors.some((error)=>error.includes('permission-denied')));
});

test('T023 field components retain their own error semantics', () => {
  const mutated=JSON.parse(JSON.stringify(components));
  mutated.input.variantDimensions.state =
    mutated.input.variantDimensions.state.filter((state)=>state!=='error');
  const errors=validate(contract,{components:mutated});
  assert.ok(errors.some((error)=>error.includes('input must retain field-level error')));
});

test('T023 critical failure cannot be reduced to Toast-only feedback', () => {
  const candidate=JSON.parse(JSON.stringify(contract));
  candidate.transientFeedback.criticalFailureToastOnlyAllowed=true;
  const errors=validate(candidate);
  assert.ok(errors.some((error)=>error.includes('cannot be the only critical failure feedback')));
});

test('T023 unknown blocking cause is rejected instead of guessed', () => {
  assert.throws(
    () => resolveFeedbackSurface({kind:'external-block',cause:'battery-low'},contract),
    /unknown blocking-state cause/,
  );
});


test('T023 prohibition copy may name forbidden error semantics without activating them', () => {
  const candidate=JSON.parse(JSON.stringify(components));
  candidate['empty-state'].doNotInvent.push(
    'never restore recoverable-error or Danger decoration to Empty State',
  );
  candidate['empty-state'].structurePatterns.push(
    'Empty State does not use error coloring as a semantic carrier',
  );

  assert.deepEqual(validate(contract,{components:candidate}), []);
});
