import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  buildFourPlatformSmokeInputs,
  evaluateFourPlatformSmoke,
  runFourPlatformSmoke,
} from '../src/four-platform-smoke.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('T018 real repository passes representative four-platform smoke', () => {
  const evidence = runFourPlatformSmoke(repoRoot);

  assert.equal(evidence.result, 'pass');
  assert.equal(evidence.summary.platforms, 4);
  assert.equal(evidence.summary.representativeComponents, 5);
  assert.deepEqual(
    evidence.platforms.map((entry) => entry.platform),
    ['web', 'ios', 'android', 'wechat-mini-program'],
  );
  assert.ok(evidence.platforms.every((entry) => entry.result === 'pass'));
  assert.ok(evidence.platforms.every((entry) => entry.context.motion === 'reduced'));
  assert.equal(evidence.invariants.pixelEqualityRequired, false);
});

test('T018 proves representative semantics are identical across all platform interpretations', () => {
  const evidence = runFourPlatformSmoke(repoRoot);
  const reference = evidence.platforms[0].semanticHashes;

  for (const platform of evidence.platforms) {
    assert.deepEqual(platform.semanticHashes, reference);
  }
  assert.ok(reference.button);
  assert.ok(reference.select);
  assert.ok(reference['top-app-bar']);
  assert.ok(reference['bottom-sheet']);
  assert.ok(reference['search-field']);
});

test('T018 covers Web pointer+keyboard, native touch/safe-area, and WeChat host chrome', () => {
  const evidence = runFourPlatformSmoke(repoRoot);
  const byPlatform = Object.fromEntries(
    evidence.platforms.map((entry) => [entry.platform, entry]),
  );

  assert.equal(byPlatform.web.context.input, 'hybrid');
  assert.equal(byPlatform.web.presentationFacts.pointer.hover, true);
  assert.equal(byPlatform.web.presentationFacts.keyboardIme.supported, true);

  assert.equal(byPlatform.ios.presentationFacts.adapter.touch.minimum, 44);
  assert.ok(byPlatform.ios.presentationFacts.safeArea.bottom > 0);

  assert.equal(byPlatform.android.presentationFacts.adapter.touch.minimum, 48);
  assert.equal(byPlatform.android.presentationFacts.back.predictive, true);

  const capsule = byPlatform['wechat-mini-program'].presentationFacts.hostChrome.find(
    (entry) => entry.kind === 'host-capsule',
  );
  assert.equal(capsule.owner, 'host');
  assert.equal(capsule.comDesignOwned, false);
});

test('T018 localizes a broken component invariant to the contract layer', () => {
  const inputs = buildFourPlatformSmokeInputs(repoRoot);
  const button = inputs.canonicalModel.components.find((entry) => entry.slug === 'button');
  button.contract.variantDimensions.state =
    button.contract.variantDimensions.state.filter((state) => state !== 'disabled');

  const evidence = evaluateFourPlatformSmoke(inputs);

  assert.equal(evidence.result, 'fail');
  assert.ok(
    evidence.failures.some(
      (failure) => failure.id === 'contract:button-state-hierarchy'
        && failure.layer === 'contract',
    ),
  );
});

test('T018 localizes adapter source drift to the adapter layer', () => {
  const inputs = buildFourPlatformSmokeInputs(repoRoot);
  const web = JSON.parse(inputs.outputs.get('dist/tailwind/adapter.json'));
  web.source.sourceHash = 'drifted-source';
  inputs.outputs.set('dist/tailwind/adapter.json', JSON.stringify(web));

  const evidence = evaluateFourPlatformSmoke(inputs);

  assert.equal(evidence.result, 'fail');
  assert.ok(
    evidence.failures.some(
      (failure) => failure.id === 'adapter:source-parity:web'
        && failure.layer === 'adapter',
    ),
  );
});

test('T018 localizes invalid platform context to the platform-context layer', () => {
  const inputs = buildFourPlatformSmokeInputs(repoRoot);
  inputs.contexts.web.viewport = 'desktop';

  const evidence = evaluateFourPlatformSmoke(inputs);

  assert.equal(evidence.result, 'fail');
  assert.ok(
    evidence.failures.some(
      (failure) => failure.id === 'context:web'
        && failure.layer === 'platform-context',
    ),
  );
});
