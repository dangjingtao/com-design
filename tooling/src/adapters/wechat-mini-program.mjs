import { parseTypography, pxToNumber } from '../token-model.mjs';

const CANONICAL_MODEL_ID = 'com-design:canonical-model:v2';
const MOTION_FOUNDATION_ID = 'com-design:motion-foundation:v2';
const PLATFORM = 'wechat-mini-program';

function requireCanonicalModel(context) {
  const model = context?.canonicalModel;
  if (model?.id !== CANONICAL_MODEL_ID || model?.schemaVersion !== 2) {
    throw new Error('mini-program.wechat requires Canonical Design Model V2.');
  }
  if (!Array.isArray(model.tokens?.entries) || !model.tokens?.byType) {
    throw new Error('mini-program.wechat requires canonical token entries and byType indexes.');
  }
  if (
    model.motion?.id !== MOTION_FOUNDATION_ID
    || model.motion?.schemaVersion !== 2
    || !model.motion?.contract
  ) {
    throw new Error('mini-program.wechat requires canonical T011 motion foundation.');
  }
  return model;
}

function tokenEntries(model, type) {
  const ids = model.tokens.byType?.[type] ?? [];
  const byId = new Map(model.tokens.entries.map((token) => [token.id, token]));
  return ids.map((id) => {
    const token = byId.get(id);
    if (!token) throw new Error(`mini-program.wechat cannot resolve canonical token id: ${id}`);
    return token;
  });
}

function record(tokens, mapper = (token) => token.light) {
  return Object.fromEntries(tokens.map((token) => [token.key, mapper(token)]));
}

function numericRecord(tokens) {
  return record(tokens, (token) => pxToNumber(token.light));
}

function scopeRecord(scope, prefix) {
  return Object.fromEntries(
    Object.entries(scope ?? {})
      .filter(([name]) => name.startsWith(prefix))
      .map(([name, value]) => [name.slice(prefix.length), pxToNumber(value)]),
  );
}

function requirePlatform(model) {
  const platform = model.platform?.platforms?.find((entry) => entry.platform === PLATFORM);
  if (!platform) throw new Error('mini-program.wechat requires canonical platform:wechat-mini-program.');
  return platform;
}

function axisValues(model, name) {
  const axis = model.platform?.axes?.find((entry) => entry.name === name);
  if (!axis || !Array.isArray(axis.values) || axis.values.length === 0) {
    throw new Error(`mini-program.wechat requires canonical platform axis: ${name}`);
  }
  return [...axis.values];
}

function requireEnvironment(platformEnvironment) {
  const example = platformEnvironment?.examples?.find((entry) => entry.platform === PLATFORM);
  if (!example?.snapshot) {
    throw new Error('mini-program.wechat requires canonical WeChat Mini Program environment evidence.');
  }
  return example;
}

function normalizeTypography(model) {
  const styles = {};
  for (const token of tokenEntries(model, 'typography')) {
    const parsed = parseTypography(token.light);
    if (parsed.raw !== undefined) {
      throw new Error(`mini-program.wechat cannot normalize typography token: ${token.name}`);
    }
    styles[token.key] = {
      fontSize: parsed.fontSize,
      lineHeight: parsed.lineHeight,
      fontWeight: parsed.fontWeight,
      fontFamilyRole: 'host-system',
    };
  }
  return styles;
}

function themeColorRecord(model, theme, mode) {
  return Object.fromEntries(
    tokenEntries(model, 'color').map((token) => [
      token.key,
      theme[mode]?.[token.name] ?? (mode === 'dark' ? token.dark : token.light),
    ]),
  );
}

function createConsumerTokens(model) {
  const compact = numericRecord(tokenEntries(model, 'density'));
  const comfortable = {
    ...compact,
    ...scopeRecord(model.tokens.scopes?.densityComfortable, 'density-'),
  };
  const touch = tokenEntries(model, 'platform').find((token) => token.key === 'touch-min');
  if (!touch) throw new Error('mini-program.wechat requires platform touch-min token.');

  const themes = Object.fromEntries(
    Object.entries(model.tokens.themes ?? {}).map(([key, theme]) => [
      key,
      {
        name: theme.name,
        color: {
          light: themeColorRecord(model, theme, 'light'),
          dark: themeColorRecord(model, theme, 'dark'),
        },
      },
    ]),
  );

  return {
    schemaVersion: 1,
    source: {
      modelId: model.id,
      sourceHash: model.sourceHash,
    },
    unitPolicy: {
      sourcePxMeaning: 'logical-design-unit',
      runtimeGeometryUnit: 'layout-unit',
      rpxAssumption: false,
    },
    color: {
      light: record(tokenEntries(model, 'color')),
      dark: record(tokenEntries(model, 'color'), (token) => token.dark),
    },
    themes,
    space: numericRecord(tokenEntries(model, 'spacing')),
    radius: numericRecord(tokenEntries(model, 'radius')),
    size: numericRecord(tokenEntries(model, 'size')),
    density: {
      compact,
      comfortable,
    },
    touch: {
      minimum: pxToNumber(touch.light),
      sourceTokenId: touch.id,
    },
    fontSize: numericRecord(tokenEntries(model, 'fontSize')),
    lineHeight: numericRecord(tokenEntries(model, 'lineHeight')),
    fontWeight: record(tokenEntries(model, 'fontWeight'), (token) => Number(token.light)),
    typography: normalizeTypography(model),
  };
}

function createConsumerModule(tokens) {
  return `// Generated by Com Design. Do not edit by hand.
// WeChat Mini Program consumer module derived from Canonical Design Model V2.
const tokens = ${JSON.stringify(tokens, null, 2)};
module.exports = tokens;
`;
}

function createAdapterEvidence(model, platformEnvironment) {
  const targetPlatform = requirePlatform(model);
  const environmentExample = requireEnvironment(platformEnvironment);
  const snapshot = environmentExample.snapshot;
  const miniMotion = model.motion.contract.platforms?.[PLATFORM];
  if (!miniMotion) {
    throw new Error('mini-program.wechat requires canonical WeChat motion mapping.');
  }

  return {
    schemaVersion: 2,
    id: 'com-design:wechat-mini-program-adapter:v2',
    $metadata: {
      authority: 'derived-build-artifact',
      editable: false,
      sourceOfTruth: 'design-source/',
    },
    adapter: {
      id: 'mini-program.wechat',
      target: 'wechat-mini-program',
      family: 'mini-program',
    },
    source: {
      modelId: model.id,
      modelSchemaVersion: model.schemaVersion,
      sourceHash: model.sourceHash,
      environmentContractVersion: platformEnvironment?.$metadata?.version ?? null,
      motionContractId: model.motion.id,
      motionContractVersion: model.motion.schemaVersion,
    },
    targetPlatform,
    context: {
      schemaVersion: model.platform?.schemaVersion ?? null,
      platform: PLATFORM,
      axes: {
        viewport: axisValues(model, 'viewport'),
        input: axisValues(model, 'input'),
        motion: axisValues(model, 'motion'),
        colorScheme: axisValues(model, 'colorScheme'),
        contentScale: axisValues(model, 'contentScale'),
      },
      platformDoesNotInferAxes:
        model.platform?.principles?.platformDoesNotInferAxes === true,
    },
    environment: {
      runtimeContract: {
        name: platformEnvironment?.$metadata?.name ?? null,
        version: platformEnvironment?.$metadata?.version ?? null,
        owner: platformEnvironment?.$metadata?.owner ?? null,
      },
      runtimeHooks: {
        safeAreaInsets: 'geometry.safeAreaInsets',
        reservedRegions: 'geometry.reservedRegions',
        hostChrome: 'chrome',
        back: 'back',
        focus: 'focus',
        keyboardIme: 'keyboardIme',
        pointer: 'pointer',
        gesture: 'gesture',
        overlay: 'overlay',
        accessibility: 'accessibility',
      },
      geometryUnit: 'layout-unit',
      hostChromeOwnedByComDesign: false,
      referenceSnapshot: {
        name: environmentExample.name,
        exampleOnly: true,
        snapshot,
      },
    },
    motion: {
      semanticSource: model.motion.id,
      reducedMotion: model.motion.contract.reducedMotion,
      platform: miniMotion,
      highFrequencySetDataAnimationAllowed: false,
    },
    consumption: {
      tokenModule: 'dist/wechat-mini-program/tokens.js',
      moduleFormat: 'commonjs',
      themeModePolicy: 'select color.light/color.dark at runtime; optional themes remain generated named token maps, not new source truth',
      wxssSourceOfTruth: false,
      generatedWxssRequired: false,
    },
    contract: {
      coreSemanticFork: false,
      hostCapsuleIsCoreComponent: false,
      tailwindOrDomRequired: false,
      reactNativeRequired: false,
      rpxRequiredByCore: false,
      productBusinessLogicAllowed: false,
    },
  };
}

export const wechatMiniProgramAdapter = Object.freeze({
  id: 'mini-program.wechat',
  target: 'wechat-mini-program',
  family: 'mini-program',
  outputPaths: Object.freeze([
    'dist/wechat-mini-program/tokens.js',
    'dist/wechat-mini-program/adapter.json',
  ]),
  build(_legacyTokenModel, context = {}) {
    const model = requireCanonicalModel(context);
    const tokens = createConsumerTokens(model);
    const evidence = createAdapterEvidence(model, context.platformEnvironment);
    return new Map([
      ['dist/wechat-mini-program/tokens.js', createConsumerModule(tokens)],
      ['dist/wechat-mini-program/adapter.json', `${JSON.stringify(evidence, null, 2)}\n`],
    ]);
  },
});
