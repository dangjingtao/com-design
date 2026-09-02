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

export function compileCanonicalComponents(model) {
  return (model.components ?? []).map((component) => ({
    slug: component.slug,
    name: component.name,
    sourceId: component.id,
    sourceRevision: component.provenance?.contract?.sourceHash ?? null,
    contractPath: component.provenance?.contract?.sourcePath ?? null,
    variantDimensions: component.contract?.variantDimensions ?? [],
    states: component.contract?.states ?? component.contract?.stateMatrix ?? null,
    platformContext: component.contract?.platformContext ?? null,
  }));
}

export function assertPenpotCanonicalParity(manifest, model) {
  const errors = [];
  if (manifest.canonical?.sourceHash !== model.sourceHash) {
    errors.push('Penpot manifest sourceHash must match Canonical Design Model V2.');
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
