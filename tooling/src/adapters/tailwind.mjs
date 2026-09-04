import { createTailwindPreset, createThemeCss } from './renderers.mjs';

const CANONICAL_MODEL_ID = 'com-design:canonical-model:v2';

function requireCanonicalModel(context) {
  const model = context?.canonicalModel;
  if (model?.id !== CANONICAL_MODEL_ID || model?.schemaVersion !== 2) {
    throw new Error('web.tailwind requires Canonical Design Model V2.');
  }
  if (!Array.isArray(model.tokens?.entries) || !model.tokens?.byType) {
    throw new Error('web.tailwind requires canonical token entries and byType indexes.');
  }
  return model;
}

function projectCanonicalTokens(model) {
  const byId = new Map(model.tokens.entries.map((token) => [token.id, token]));
  const byType = Object.fromEntries(
    Object.entries(model.tokens.byType).map(([type, ids]) => [
      type,
      ids.map((id) => {
        const token = byId.get(id);
        if (!token) throw new Error(`web.tailwind cannot resolve canonical token id: ${id}`);
        return token;
      }),
    ]),
  );

  return {
    schemaVersion: model.tokens.schemaVersion,
    sourceHash: model.sourceHash,
    consumer: model.tokens.entries,
    byType,
    scopes: model.tokens.scopes ?? {
      densityComfortable: {},
      platformAndroid: {},
    },
    themes: model.tokens.themes ?? {},
  };
}

function axisValues(model, name) {
  const axis = model.platform?.axes?.find((entry) => entry.name === name);
  if (!axis || !Array.isArray(axis.values) || axis.values.length === 0) {
    throw new Error(`web.tailwind requires canonical platform axis: ${name}`);
  }
  return [...axis.values];
}

function requireWebEnvironment(platformEnvironment) {
  const example = platformEnvironment?.examples?.find((entry) => entry.platform === 'web');
  if (!example?.snapshot) {
    throw new Error('web.tailwind requires canonical Web platform environment evidence.');
  }
  return example.snapshot;
}

function createWebAdapterEvidence(model, platformEnvironment) {
  const targetPlatform = model.platform?.platforms?.find((entry) => entry.platform === 'web');
  if (!targetPlatform) {
    throw new Error('web.tailwind requires canonical platform:web.');
  }

  const snapshot = requireWebEnvironment(platformEnvironment);
  return {
    schemaVersion: 2,
    id: 'com-design:web-adapter:v2',
    $metadata: {
      authority: 'derived-build-artifact',
      editable: false,
      sourceOfTruth: 'design-source/',
    },
    adapter: {
      id: 'web.tailwind',
      target: 'tailwind',
      family: 'web',
    },
    source: {
      modelId: model.id,
      modelSchemaVersion: model.schemaVersion,
      sourceHash: model.sourceHash,
      authority: model.$metadata?.authority ?? null,
      environmentContractVersion: platformEnvironment?.$metadata?.version ?? null,
    },
    targetPlatform,
    context: {
      schemaVersion: model.platform?.schemaVersion ?? null,
      platform: 'web',
      axes: {
        viewport: axisValues(model, 'viewport'),
        input: axisValues(model, 'input'),
        motion: axisValues(model, 'motion'),
        colorScheme: axisValues(model, 'colorScheme'),
        contentScale: axisValues(model, 'contentScale'),
      },
      platformDoesNotInferAxes:
        model.platform?.principles?.platformDoesNotInferAxes === true,
      rule: model.platform?.principles?.rule ?? null,
    },
    capabilities: {
      pointer: {
        ...snapshot.pointer,
        contextAxis: 'input',
        activeWhen: ['pointer', 'hybrid'],
        coreSemanticFork: false,
      },
      keyboard: {
        supported: snapshot.keyboardIme?.supported === true,
        composition: snapshot.keyboardIme?.composition === true,
        viewportBehavior: snapshot.keyboardIme?.viewportBehavior ?? null,
        contextAxis: 'input',
        activeWhen: ['keyboard', 'hybrid'],
        coreSemanticFork: false,
      },
      focus: {
        ...snapshot.focus,
        contextAxis: 'input',
        focusVisibleRequiredFor: ['keyboard', 'hybrid'],
        coreSemanticFork: false,
      },
    },
    contract: {
      coreSemanticFork: false,
      presentationOwnedBy: 'web-adapter',
      componentContractConsumption: 'none-for-tailwind-token-generation',
      domCssStructureRequired: false,
    },
  };
}

export const tailwindAdapter = Object.freeze({
  id: 'web.tailwind',
  target: 'tailwind',
  family: 'web',
  outputPaths: Object.freeze([
    'dist/tailwind/preset.cjs',
    'dist/tailwind/theme.css',
    'dist/tailwind/adapter.json',
  ]),
  build(_legacyTokenModel, context = {}) {
    const canonicalModel = requireCanonicalModel(context);
    const tokenModel = projectCanonicalTokens(canonicalModel);
    const evidence = createWebAdapterEvidence(
      canonicalModel,
      context.platformEnvironment,
    );

    return new Map([
      ['dist/tailwind/preset.cjs', createTailwindPreset(tokenModel, 'Tailwind')],
      ['dist/tailwind/theme.css', createThemeCss(tokenModel)],
      ['dist/tailwind/adapter.json', `${JSON.stringify(evidence, null, 2)}\n`],
    ]);
  },
});
