import { parseTypography, pxToNumber } from '../token-model.mjs';

const CANONICAL_MODEL_ID = 'com-design:canonical-model:v2';
const MOTION_FOUNDATION_ID = 'com-design:motion-foundation:v2';

function requireCanonicalModel(context) {
  const model = context?.canonicalModel;
  if (model?.id !== CANONICAL_MODEL_ID || model?.schemaVersion !== 2) {
    throw new Error('native-mobile.contract requires Canonical Design Model V2.');
  }
  if (!Array.isArray(model.tokens?.entries) || !model.tokens?.byType) {
    throw new Error('native-mobile.contract requires canonical token entries and byType indexes.');
  }
  if (
    model.motion?.id !== MOTION_FOUNDATION_ID
    || model.motion?.schemaVersion !== 2
    || !model.motion?.contract
  ) {
    throw new Error('native-mobile.contract requires canonical T011 motion foundation.');
  }
  return model;
}

function tokenEntries(model, type) {
  const ids = model.tokens?.byType?.[type] ?? [];
  const byId = new Map(model.tokens.entries.map((token) => [token.id, token]));
  return ids.map((id) => {
    const token = byId.get(id);
    if (!token) throw new Error(`native-mobile.contract cannot resolve canonical token id: ${id}`);
    return token;
  });
}

function requireEnvironment(platformEnvironment, platform) {
  const example = platformEnvironment?.examples?.find((entry) => entry.platform === platform);
  if (!example?.snapshot) {
    throw new Error(`native-mobile.contract requires canonical ${platform} platform environment evidence.`);
  }
  return example.snapshot;
}

function requirePlatform(model, platform) {
  const entry = model.platform?.platforms?.find((item) => item.platform === platform);
  if (!entry) throw new Error(`native-mobile.contract requires canonical platform:${platform}.`);
  return entry;
}

function axisValues(model, name) {
  const axis = model.platform?.axes?.find((entry) => entry.name === name);
  if (!axis || !Array.isArray(axis.values) || axis.values.length === 0) {
    throw new Error(`native-mobile.contract requires canonical platform axis: ${name}`);
  }
  return [...axis.values];
}

function parseColor(value) {
  const match = String(value ?? '').trim().match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/,
  );
  if (!match) throw new Error(`native-mobile.contract cannot normalize shadow color: ${value}`);
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function parseLength(value) {
  const match = String(value ?? '').trim().match(/^(-?[\d.]+)(?:px)?$/);
  if (!match) throw new Error(`native-mobile.contract cannot normalize shadow length: ${value}`);
  return Number(match[1]);
}

function parseShadow(value) {
  const match = String(value ?? '').trim().match(
    /^(-?[\d.]+(?:px)?)\s+(-?[\d.]+(?:px)?)\s+(-?[\d.]+(?:px)?)\s+(-?[\d.]+(?:px)?)\s+(rgba?\([^)]*\))$/,
  );
  if (!match) {
    throw new Error(`native-mobile.contract cannot normalize CSS-shaped shadow token: ${value}`);
  }
  return {
    offset: { x: parseLength(match[1]), y: parseLength(match[2]) },
    blurRadius: parseLength(match[3]),
    spreadRadius: parseLength(match[4]),
    color: parseColor(match[5]),
  };
}

function normalizeShadows(model) {
  const shadows = tokenEntries(model, 'shadow');
  return {
    light: Object.fromEntries(shadows.map((token) => [token.key, parseShadow(token.light)])),
    dark: Object.fromEntries(shadows.map((token) => [token.key, parseShadow(token.dark)])),
  };
}

function normalizeTypography(model) {
  const styles = {};
  for (const token of tokenEntries(model, 'typography')) {
    const parsed = parseTypography(token.light);
    if (parsed.raw !== undefined) {
      throw new Error(`native-mobile.contract cannot normalize typography token: ${token.name}`);
    }
    styles[token.key] = {
      fontSize: parsed.fontSize,
      lineHeight: parsed.lineHeight,
      fontWeight: parsed.fontWeight,
      fontFamilyRole: 'platform-system',
    };
  }
  return {
    fontFamilyPolicy: {
      strategy: 'platform-system',
      ios: 'system',
      android: 'system',
      cssFontFamilyStackRequired: false,
    },
    styles,
  };
}

function parseDuration(value) {
  const match = String(value ?? '').trim().match(/^([\d.]+)ms$/);
  if (!match) throw new Error(`native-mobile.contract cannot normalize motion duration: ${value}`);
  return Number(match[1]);
}

function parseEasing(value) {
  const match = String(value ?? '').trim().match(
    /^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/,
  );
  if (!match) throw new Error(`native-mobile.contract cannot normalize motion easing: ${value}`);
  return {
    kind: 'cubicBezier',
    controlPoints: match.slice(1).map(Number),
  };
}

function normalizeMotionTokens(model) {
  const durationsMs = {};
  const easingCurves = {};
  for (const token of tokenEntries(model, 'motion')) {
    if (token.key.startsWith('duration-')) {
      durationsMs[token.key.slice('duration-'.length)] = parseDuration(token.light);
      continue;
    }
    if (token.key.startsWith('easing-')) {
      easingCurves[token.key.slice('easing-'.length)] = parseEasing(token.light);
      continue;
    }
    throw new Error(`native-mobile.contract has no native normalization for motion token: ${token.name}`);
  }
  return { durationsMs, easingCurves };
}

function touchPolicy(model, platform) {
  const touch = tokenEntries(model, 'platform').find((token) => token.key === 'touch-min');
  if (!touch) throw new Error('native-mobile.contract requires platform touch-min token.');
  const androidOverride = model.tokens.scopes?.platformAndroid?.['platform-touch-min'];
  return {
    minimum: pxToNumber(platform === 'android' ? androidOverride ?? touch.light : touch.light),
    source: {
      tokenId: touch.id,
      scope: platform === 'android' && androidOverride !== undefined
        ? 'platformAndroid'
        : 'base',
    },
  };
}

function platformContract(model, platformEnvironment, platform) {
  const environment = requireEnvironment(platformEnvironment, platform);
  return {
    targetPlatform: requirePlatform(model, platform),
    context: {
      schemaVersion: model.platform?.schemaVersion ?? null,
      platform,
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
    unit: platform === 'ios' ? 'logical-point' : 'density-independent-pixel',
    touch: touchPolicy(model, platform),
    environment: {
      back: environment.back,
      keyboardIme: environment.keyboardIme,
      gesture: environment.gesture,
      accessibility: environment.accessibility,
    },
  };
}

function createNativeMobileEvidence(model, platformEnvironment) {
  const motion = model.motion;
  return {
    schemaVersion: 2,
    id: 'com-design:native-mobile-adapter:v2',
    $metadata: {
      authority: 'derived-build-artifact',
      editable: false,
      sourceOfTruth: 'design-source/',
    },
    adapter: {
      id: 'native-mobile.contract',
      target: 'native-mobile',
      family: 'native-mobile',
    },
    source: {
      modelId: model.id,
      modelSchemaVersion: model.schemaVersion,
      sourceHash: model.sourceHash,
      motionContractId: motion.id,
      motionContractVersion: motion.schemaVersion,
      environmentContractVersion: platformEnvironment?.$metadata?.version ?? null,
    },
    platforms: {
      ios: platformContract(model, platformEnvironment, 'ios'),
      android: platformContract(model, platformEnvironment, 'android'),
    },
    typography: normalizeTypography(model),
    shadow: normalizeShadows(model),
    motion: {
      tokens: normalizeMotionTokens(model),
      intentContract: {
        id: motion.id,
        schemaVersion: motion.schemaVersion,
        intents: motion.contract.intents,
        reducedMotion: motion.contract.reducedMotion,
        platforms: {
          ios: motion.contract.platforms?.ios,
          android: motion.contract.platforms?.android,
        },
        provenance: motion.provenance,
      },
    },
    migration: {
      nativewind: {
        adapterId: 'native-mobile.nativewind',
        target: 'nativewind',
        status: 'compatible-engineering-consumer',
        rule: 'May continue consuming existing semantic token preset while migrating platform behavior to native-mobile contract.',
      },
      reactNative: {
        adapterId: 'native-mobile.react-native',
        target: 'react-native',
        status: 'compatible-engineering-consumer',
        rule: 'Existing tokens.ts remains available for compatibility; new platform behavior and native-safe shadow/motion/typography semantics come from native-mobile contract.',
      },
    },
    contract: {
      coreSemanticFork: false,
      reactNativeIsPlatformDefinition: false,
      cssBoxShadowStringsRequired: false,
      cssCubicBezierStringsRequired: false,
      cssFontFamilyStackRequired: false,
      platformDoesNotInferInputOrViewport: true,
    },
  };
}

export const nativeMobileAdapter = Object.freeze({
  id: 'native-mobile.contract',
  target: 'native-mobile',
  family: 'native-mobile',
  outputPaths: Object.freeze(['dist/native-mobile/adapter.json']),
  build(_legacyTokenModel, context = {}) {
    const model = requireCanonicalModel(context);
    const evidence = createNativeMobileEvidence(model, context.platformEnvironment);
    return new Map([
      ['dist/native-mobile/adapter.json', `${JSON.stringify(evidence, null, 2)}\n`],
    ]);
  },
});
