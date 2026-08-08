#!/usr/bin/env python3
"""Audit a native PenPot v3 export without mutating it.

The auditor follows PenPot's documented v3 ZIP+JSON model. It proves only
machine-observable facts. Typography rendering, clipping, optical quality and
semantic theme appearance remain an actual-PenPot visual gate.
"""

from __future__ import annotations

import argparse
import json
import zipfile
from collections import Counter
from pathlib import Path
from typing import Any, Iterable

REQUIRED_FEATURES = {"design-tokens/v1", "variants/v1", "components/v2"}
REQUIRED_TOKEN_SETS = {
    "Foundation/Core",
    "Semantic/Light",
    "Semantic/Dark",
    "Density/Compact",
    "Density/Comfortable",
    "Platform/Canonical",
    "Platform/iOS",
    "Platform/Android",
}
REQUIRED_THEME_NAMES = {
    "Light", "Dark", "Compact", "Comfortable", "iOS", "Android"
}


def walk(value: Any, trail: tuple[str, ...] = ()) -> Iterable[tuple[tuple[str, ...], Any]]:
    yield trail, value
    if isinstance(value, dict):
        for key, child in value.items():
            yield from walk(child, trail + (str(key),))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk(child, trail + (str(index),))


def json_members(zf: zipfile.ZipFile) -> list[str]:
    return [n for n in zf.namelist() if n.endswith('.json') and not n.startswith('__MACOSX/')]


def load_json(zf: zipfile.ZipFile, name: str) -> Any:
    return json.loads(zf.read(name).decode('utf-8'))


def find_component_docs(names: list[str]) -> list[str]:
    return [n for n in names if '/components/' in n and n.endswith('.json')]


def find_shape_docs(names: list[str]) -> list[str]:
    # Page metadata lives directly below pages/. Shape JSON lives one directory deeper.
    return [
        n for n in names
        if '/pages/' in n and n.endswith('.json') and n.count('/') >= 4
    ]


def find_page_metadata_docs(names: list[str]) -> list[str]:
    return [
        n for n in names
        if '/pages/' in n and n.endswith('.json') and n.count('/') == 3
    ]


def collect_token_bindings(doc: Any) -> list[tuple[str, str, str]]:
    """Return (field, property, token-name) from runtime/export token fields.

    PenPot v3 exports shape bindings under `appliedTokens`. `tokens` is accepted
    too for tolerance with connector/plugin snapshots, but the audit records the
    source field so a real v3 export is distinguishable from an adapter dump.
    """
    bindings: list[tuple[str, str, str]] = []
    for trail, value in walk(doc):
        if not trail or trail[-1] not in {'appliedTokens', 'tokens'} or not isinstance(value, dict):
            continue
        field = trail[-1]
        for prop, token_value in value.items():
            if isinstance(token_value, str) and token_value:
                bindings.append((field, str(prop), token_value))
            elif isinstance(token_value, list):
                for item in token_value:
                    if isinstance(item, str) and item:
                        bindings.append((field, str(prop), item))
            elif isinstance(token_value, dict):
                for key in ('name', 'token', 'tokenName', 'path'):
                    item = token_value.get(key)
                    if isinstance(item, str) and item:
                        bindings.append((field, str(prop), item))
                        break
    return bindings


def collect_variant_keys(doc: Any) -> Counter:
    hits: Counter = Counter()
    for trail, _value in walk(doc):
        if trail and 'variant' in trail[-1].lower():
            hits[trail[-1]] += 1
    return hits


def component_identity(doc: Any) -> tuple[str | None, str | None]:
    if not isinstance(doc, dict):
        return None, None
    name = doc.get('name')
    path = doc.get('path')
    if isinstance(name, str) or isinstance(path, str):
        return name if isinstance(name, str) else None, path if isinstance(path, str) else None
    return None, None


def logical_component_from_path(path: str | None) -> str | None:
    return path.strip('/') if isinstance(path, str) and path.strip('/') else None


def load_catalog(script_dir: Path) -> dict[str, Any]:
    return json.loads((script_dir.parent / 'catalog' / 'component-catalog.json').read_text('utf-8'))


def canonical_paths(catalog: dict[str, Any]) -> set[str]:
    return {
        f"{family['path']}/{component['name']}"
        for family in catalog['families']
        for component in family['components']
    }


def token_library_summary(doc: Any) -> tuple[set[str], set[str], list[str]]:
    set_names: set[str] = set()
    theme_names: set[str] = set()
    active_themes: list[str] = []
    if not isinstance(doc, dict):
        return set_names, theme_names, active_themes

    sets = doc.get('sets')
    if isinstance(sets, dict):
        for key, value in sets.items():
            if isinstance(key, str):
                set_names.add(key)
            if isinstance(value, dict) and isinstance(value.get('name'), str):
                set_names.add(value['name'])

    themes = doc.get('themes')
    if isinstance(themes, dict):
        for key, value in themes.items():
            if isinstance(key, str):
                theme_names.add(key)
            if isinstance(value, dict) and isinstance(value.get('name'), str):
                theme_names.add(value['name'])
    elif isinstance(themes, list):
        for value in themes:
            if isinstance(value, dict) and isinstance(value.get('name'), str):
                theme_names.add(value['name'])

    active = doc.get('activeThemes')
    if isinstance(active, list):
        active_themes = [item for item in active if isinstance(item, str)]
    return set_names, theme_names, active_themes


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('penpot', type=Path)
    parser.add_argument('--out', type=Path)
    parser.add_argument('--expect-full-catalog', action='store_true')
    parser.add_argument('--expect-instances', action='store_true', help='Require reusable component instance references on verification shapes.')
    parser.add_argument('--round-trip', action='store_true', help='Input is the re-export after successful re-import/open inspection.')
    args = parser.parse_args()

    catalog = load_catalog(Path(__file__).resolve().parent)
    expected = canonical_paths(catalog)
    report: dict[str, Any] = {
        'artifact': args.penpot.name,
        'designSystemVersion': catalog['designSystemVersion'],
        'scope': 'reusable-component-library',
        'roundTripInputDeclared': bool(args.round_trip),
        'checks': {},
        'evidence': {},
        'visualGate': {
            'automatable': False,
            'status': 'REQUIRES_PENPOT_VISUAL_INSPECTION',
            'required': [
                'fonts are not stretched or compressed',
                'no component/page abnormal clipping or overlap',
                'Light/Dark semantic roles remain correct',
                'Compact/Comfortable remains collision-free',
                'instances insert, switch variants, and preserve intended overrides normally'
            ]
        }
    }

    if not args.penpot.is_file():
        report['status'] = 'FAIL'
        report['checks']['artifactExists'] = False
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 2

    try:
        with zipfile.ZipFile(args.penpot) as zf:
            bad = zf.testzip()
            report['checks']['zipIntegrity'] = bad is None
            report['evidence']['firstBadZipMember'] = bad
            names = json_members(zf)
            report['evidence']['jsonDocumentCount'] = len(names)

            if 'manifest.json' not in zf.namelist():
                raise RuntimeError('manifest.json missing')
            manifest = load_json(zf, 'manifest.json')
            report['checks']['manifestType'] = manifest.get('type') == 'penpot/export-files'
            report['evidence']['generatedBy'] = manifest.get('generatedBy')
            features = sorted({
                f for item in manifest.get('files', []) if isinstance(item, dict)
                for f in item.get('features', []) if isinstance(f, str)
            })
            report['evidence']['featureFlags'] = features
            report['checks']['nativeFeatureFlagsPresent'] = REQUIRED_FEATURES.issubset(features)

            component_docs = find_component_docs(names)
            components: list[dict[str, Any]] = []
            variant_keys: Counter = Counter()
            for doc_name in component_docs:
                doc = load_json(zf, doc_name)
                name, lib_path = component_identity(doc)
                components.append({
                    'document': doc_name,
                    'id': doc.get('id') if isinstance(doc, dict) else None,
                    'name': name,
                    'path': lib_path,
                    'mainInstanceId': doc.get('mainInstanceId') if isinstance(doc, dict) else None,
                    'mainInstancePage': doc.get('mainInstancePage') if isinstance(doc, dict) else None,
                })
                variant_keys.update(collect_variant_keys(doc))

            logical = sorted({p for c in components if (p := logical_component_from_path(c.get('path')))})
            present = set(logical) & expected
            missing = sorted(expected - present)
            unexpected = sorted(set(logical) - expected)
            report['evidence']['componentDocumentCount'] = len(component_docs)
            report['evidence']['componentDocuments'] = components
            report['evidence']['canonicalComponentPathsPresent'] = sorted(present)
            report['evidence']['missingCanonicalComponents'] = missing
            report['evidence']['unexpectedComponentPaths'] = unexpected
            report['checks']['realComponentMetadataPresent'] = bool(component_docs) and all(
                c.get('id') and c.get('name') and c.get('path') and c.get('mainInstanceId') and c.get('mainInstancePage')
                for c in components
            )
            report['checks']['fullCatalog33'] = len(present) == 33 and not missing
            report['checks']['canonicalPatternsNotCountedAsComponents'] = not any(
                p.endswith('/Status Composition') or p.endswith('/Search Pattern') for p in logical
            )

            shape_docs = find_shape_docs(names)
            token_bindings: list[dict[str, str]] = []
            primitive_direct: list[dict[str, str]] = []
            component_refs: list[dict[str, str | None]] = []
            for doc_name in shape_docs:
                doc = load_json(zf, doc_name)
                variant_keys.update(collect_variant_keys(doc))
                if isinstance(doc, dict) and isinstance(doc.get('componentId'), str):
                    component_refs.append({
                        'document': doc_name,
                        'shapeId': doc.get('id'),
                        'componentId': doc.get('componentId'),
                        'componentFile': doc.get('componentFile'),
                        'shapeRef': doc.get('shapeRef'),
                    })
                for field, prop, token_name in collect_token_bindings(doc):
                    entry = {'document': doc_name, 'field': field, 'property': prop, 'token': token_name}
                    token_bindings.append(entry)
                    if token_name.startswith('primitive.'):
                        primitive_direct.append(entry)

            report['evidence']['shapeDocumentCount'] = len(shape_docs)
            report['evidence']['componentReferenceShapeCount'] = len(component_refs)
            report['evidence']['componentReferenceSamples'] = component_refs[:50]
            report['evidence']['variantMetadataKeys'] = dict(variant_keys)
            report['evidence']['tokenBindingCount'] = len(token_bindings)
            report['evidence']['tokenBindingSourceFields'] = dict(Counter(item['field'] for item in token_bindings))
            report['evidence']['primitiveDirectBindings'] = primitive_direct
            report['checks']['componentInstanceReferencesPresent'] = len(component_refs) > 0
            report['checks']['variantMetadataPresent'] = 'variants/v1' in features and sum(variant_keys.values()) > 0
            report['checks']['nativeAppliedTokenBindingsPresent'] = any(item['field'] == 'appliedTokens' for item in token_bindings)
            report['checks']['componentToPrimitiveDirectBindingForbidden'] = len(primitive_direct) == 0

            page_docs = find_page_metadata_docs(names)
            page_names = []
            for doc_name in page_docs:
                doc = load_json(zf, doc_name)
                if isinstance(doc, dict) and isinstance(doc.get('name'), str):
                    page_names.append(doc['name'])
            report['evidence']['pageDocumentCount'] = len(page_docs)
            report['evidence']['pageNamesObserved'] = sorted(set(page_names))

            token_docs = [n for n in names if n.endswith('/tokens.json')]
            set_names: set[str] = set()
            theme_names: set[str] = set()
            active_themes: list[str] = []
            for doc_name in token_docs:
                sets, themes, active = token_library_summary(load_json(zf, doc_name))
                set_names |= sets
                theme_names |= themes
                active_themes.extend(active)
            report['evidence']['tokenDocuments'] = token_docs
            report['evidence']['tokenSetNames'] = sorted(set_names)
            report['evidence']['themeNames'] = sorted(theme_names)
            report['evidence']['activeThemes'] = sorted(set(active_themes))
            report['evidence']['missingRequiredTokenSets'] = sorted(REQUIRED_TOKEN_SETS - set_names)
            report['evidence']['missingRequiredThemeNames'] = sorted(REQUIRED_THEME_NAMES - theme_names)
            report['checks']['tokenMetadataPresent'] = bool(token_docs)
            report['checks']['requiredTokenSetsPresent'] = REQUIRED_TOKEN_SETS.issubset(set_names)
            report['checks']['requiredThemeAxesPresent'] = REQUIRED_THEME_NAMES.issubset(theme_names)

    except (zipfile.BadZipFile, json.JSONDecodeError, RuntimeError, KeyError) as exc:
        report['status'] = 'FAIL'
        report['checks']['readablePenpotExport'] = False
        report['evidence']['error'] = str(exc)
        text = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
        if args.out:
            args.out.parent.mkdir(parents=True, exist_ok=True)
            args.out.write_text(text, 'utf-8')
        print(text, end='')
        return 2

    required_checks = [
        'zipIntegrity',
        'manifestType',
        'nativeFeatureFlagsPresent',
        'realComponentMetadataPresent',
        'variantMetadataPresent',
        'nativeAppliedTokenBindingsPresent',
        'componentToPrimitiveDirectBindingForbidden',
        'canonicalPatternsNotCountedAsComponents',
        'tokenMetadataPresent',
        'requiredTokenSetsPresent',
        'requiredThemeAxesPresent',
    ]
    if args.expect_full_catalog:
        required_checks.append('fullCatalog33')
    if args.expect_instances:
        required_checks.append('componentInstanceReferencesPresent')

    failed = [name for name in required_checks if report['checks'].get(name) is not True]
    report['evidence']['failedRequiredChecks'] = failed

    if failed:
        report['status'] = 'FAIL'
    elif not args.round_trip:
        report['status'] = 'STRUCTURAL_PASS_ROUND_TRIP_NOT_PROVEN'
    else:
        report['status'] = 'ROUND_TRIP_STRUCTURAL_PASS_VISUAL_EVIDENCE_REQUIRED'

    text = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text, 'utf-8')
    print(text, end='')
    return 0 if report['status'] != 'FAIL' else 2


if __name__ == '__main__':
    raise SystemExit(main())
