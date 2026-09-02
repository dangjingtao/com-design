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

export function enrichCanonicalTokens(tokens, model) {
  const canonicalByName = new Map((model.tokens?.entries ?? []).map((token) => [token.name, token]));
  return (tokens ?? []).map((token) => {
    const canonical = canonicalByName.get(token.sourceId ?? token.name);
    if (!canonical) {
      return {
        ...token,
        provenanceKind: 'canonical-foundation-source',
      };
    }
    return {
      ...token,
      canonicalId: canonical.id,
      sourceRevision: canonical.provenance?.sourceHash ?? null,
      sourcePath: canonical.provenance?.sourcePath ?? null,
      provenanceKind: 'canonical-model',
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
  for (const token of manifest.tokens ?? []) {
    if (!token.canonicalId) continue;
    const canonical = canonicalTokenById.get(token.canonicalId);
    if (!canonical) {
      errors.push(`Penpot token ${token.set}/${token.name} references unknown canonical token ${token.canonicalId}.`);
      continue;
    }
    if (token.sourceRevision !== canonical.provenance?.sourceHash) {
      errors.push(`Penpot token ${token.set}/${token.name} sourceRevision does not match canonical token.`);
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
