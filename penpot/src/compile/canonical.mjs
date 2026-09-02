export function compileCanonicalTrace(model) {
  if (!model || model.id !== 'com-design:canonical-model:v2') {
    throw new Error('Penpot compiler requires Canonical Design Model V2.');
  }

  return {
    authority: 'design-source/',
    modelId: model.id,
    schemaVersion: model.schemaVersion,
    sourceHash: model.sourceHash,
    sourceOfTruth: model.$metadata?.sourceOfTruth ?? 'design-source/',
    conflictPolicy: 'canonical-source-wins',
    editableConsumer: true,
    writeBack: 'proposal-only',
  };
}

function canonicalFoundationSource(model) {
  return (model.provenance?.canonicalSources ?? []).find((source) => source.id === 'source:foundation') ?? null;
}

function themeSourceBySet(model) {
  const map = new Map();
  for (const theme of Object.values(model.tokens?.themes ?? {})) {
    map.set(`${theme.name}-light`, theme.provenance);
    map.set(`${theme.name}-dark`, theme.provenance);
  }
  return map;
}

export function enrichCanonicalTokens(tokens, model) {
  const canonicalByName = new Map((model.tokens?.entries ?? []).map((token) => [token.name, token]));
  const themeBySet = themeSourceBySet(model);
  const foundation = canonicalFoundationSource(model);

  return (tokens ?? []).map((token) => {
    const canonical = canonicalByName.get(token.sourceId ?? token.name);
    const themeSource = themeBySet.get(token.set);

    if (themeSource) {
      return {
        ...token,
        ...(canonical ? { canonicalId: canonical.id } : {}),
        sourceRevision: themeSource.sourceHash ?? null,
        sourcePath: themeSource.sourcePath ?? null,
        provenanceKind: 'canonical-theme-overlay',
      };
    }

    if (canonical) {
      return {
        ...token,
        canonicalId: canonical.id,
        sourceRevision: canonical.provenance?.sourceHash ?? null,
        sourcePath: canonical.provenance?.sourcePath ?? null,
        provenanceKind: 'canonical-model',
      };
    }

    return {
      ...token,
      sourceRevision: foundation?.sourceHash ?? null,
      sourcePath: foundation?.path ?? null,
      provenanceKind: 'canonical-foundation-source',
    };
  });
}

export function compileCanonicalTokenCoverage(tokens, model) {
  const represented = new Set(
    (tokens ?? [])
      .map((token) => token.canonicalId)
      .filter(Boolean),
  );
  const canonicalIds = (model.tokens?.entries ?? []).map((token) => token.id);
  return {
    canonicalTokenCount: canonicalIds.length,
    representedCanonicalTokenCount: represented.size,
    omittedCanonicalTokenIds: canonicalIds.filter((id) => !represented.has(id)),
  };
}

export function compileCanonicalComponents(model) {
  return (model.components ?? []).map((component) => ({
    slug: component.slug,
    name: component.name,
    sourceId: component.id,
    sourceRevision: component.provenance?.contract?.sourceHash ?? null,
    contractPath: component.provenance?.contract?.sourcePath ?? null,
    variantDimensions: component.contract?.variantDimensions ?? {},
    states: component.contract?.states ?? [],
    platformPresentationRefs: component.contract?.platformPresentationRefs ?? [],
    platformExceptionRefs: component.contract?.platformExceptionRefs ?? [],
  }));
}

export function assertPenpotCanonicalParity(manifest, model) {
  const errors = [];
  if (manifest.canonical?.sourceHash !== model.sourceHash) {
    errors.push('Penpot manifest sourceHash must match Canonical Design Model V2.');
  }

  const canonicalTokenById = new Map((model.tokens?.entries ?? []).map((token) => [token.id, token]));
  const foundation = canonicalFoundationSource(model);
  const themeSources = new Map(
    Object.values(model.tokens?.themes ?? {}).map((theme) => [theme.provenance?.sourceHash, theme.provenance]),
  );

  for (const token of manifest.tokens ?? []) {
    const canonical = token.canonicalId ? canonicalTokenById.get(token.canonicalId) : null;
    if (token.canonicalId && !canonical) {
      errors.push(`Penpot token ${token.set}/${token.name} references unknown canonical token ${token.canonicalId}.`);
      continue;
    }

    if (token.provenanceKind === 'canonical-model') {
      if (!canonical || token.sourceRevision !== canonical.provenance?.sourceHash) {
        errors.push(`Penpot token ${token.set}/${token.name} sourceRevision does not match canonical token.`);
      }
    } else if (token.provenanceKind === 'canonical-theme-overlay') {
      const themeSource = themeSources.get(token.sourceRevision);
      if (!themeSource || token.sourcePath !== themeSource.sourcePath) {
        errors.push(`Penpot token ${token.set}/${token.name} theme provenance does not match a canonical theme overlay.`);
      }
    } else if (token.provenanceKind === 'canonical-foundation-source') {
      if (!foundation || token.sourceRevision !== foundation.sourceHash || token.sourcePath !== foundation.path) {
        errors.push(`Penpot token ${token.set}/${token.name} foundation provenance does not match canonical foundation source.`);
      }
    } else {
      errors.push(`Penpot token ${token.set}/${token.name} has unknown provenance kind.`);
    }
  }

  const canonicalBySlug = new Map((model.components ?? []).map((component) => [component.slug, component]));
  for (const component of manifest.components ?? []) {
    const canonical = canonicalBySlug.get(component.slug);
    if (!canonical) {
      errors.push(`Penpot component ${component.slug} is not present in canonical model.`);
      continue;
    }
    if (component.sourceId !== canonical.id) {
      errors.push(`Penpot component ${component.slug} sourceId does not match canonical model.`);
    }
    if (component.sourceRevision !== canonical.provenance?.contract?.sourceHash) {
      errors.push(`Penpot component ${component.slug} sourceRevision does not match canonical contract.`);
    }
  }
  return errors;
}
