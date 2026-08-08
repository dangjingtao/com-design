#!/usr/bin/env python3
"""Audit a PenPot v3 export without mutating it.

This intentionally audits only facts that can be proven from the exported file.
Visual acceptance (font rendering, clipping, optical quality) remains a human gate in PenPot.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path
from typing import Any, Iterable


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
    return [
        n for n in names
        if '/components/' in n
        and not n.endswith('/components/index.json')
        and not n.endswith('/components.json')
    ]


def find_page_docs(names: list[str]) -> list[str]:
    return [n for n in names if '/pages/' in n and n.endswith('.json')]


def collect_token_bindings(doc: Any) -> list[tuple[str, str]]:
    bindings: list[tuple[str, str]] = []
    for trail, value in walk(doc):
        if len(trail) >= 1 and trail[-1] == 'tokens' and isinstance(value, dict):
            for prop, token_name in value.items():
                if isinstance(token_name, str) and token_name:
                    bindings.append((str(prop), token_name))
    return bindings


def collect_variant_keys(doc: Any) -> Counter:
    hits: Counter = Counter()
    for trail, value in walk(doc):
        if trail:
            key = trail[-1]
            if 'variant' in key.lower():
                hits[key] += 1
    return hits


def component_identity(doc: Any) -> tuple[str | None, str | None]:
    if not isinstance(doc, dict):
        return None, None
    name = doc.get('name')
    path = doc.get('path')
    if isinstance(name, str) or isinstance(path, str):
        return name if isinstance(name, str) else None, path if isinstance(path, str) else None
    # Some PenPot v3 component documents wrap the payload.
    for _, value in walk(doc):
        if isinstance(value, dict) and isinstance(value.get('name'), str):
            p = value.get('path')
            return value['name'], p if isinstance(p, str) else None
    return None, None


def logical_component_from_path(path: str | None) -> str | None:
    if not path:
        return None
    normalized = path.strip('/')
    # Builder paths end in the canonical human component name; variant member
    # name is stored separately, so the path is the stable logical identity.
    return normalized or None


def load_catalog(script_dir: Path) -> dict[str, Any]:
    catalog = script_dir.parent / 'catalog' / 'component-catalog.json'
    return json.loads(catalog.read_text('utf-8'))


def canonical_paths(catalog: dict[str, Any]) -> set[str]:
    out: set[str] = set()
    for family in catalog['families']:
        for component in family['components']:
            out.add(f"{family['path']}/{component['name']}")
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('penpot', type=Path)
    parser.add_argument('--out', type=Path)
    parser.add_argument('--expect-full-catalog', action='store_true')
    parser.add_argument('--round-trip', action='store_true', help='Mark this input as the re-export after a successful re-import/open check.')
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
                'instances can be inserted and overridden normally'
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
            report['evidence']['files'] = manifest.get('files', [])
            features = sorted({
                f for item in manifest.get('files', []) if isinstance(item, dict)
                for f in item.get('features', []) if isinstance(f, str)
            })
            report['evidence']['featureFlags'] = features

            component_docs = find_component_docs(names)
            components: list[dict[str, Any]] = []
            variant_keys: Counter = Counter()
            token_bindings: list[dict[str, str]] = []
            primitive_direct: list[dict[str, str]] = []

            for doc_name in component_docs:
                try:
                    doc = load_json(zf, doc_name)
                except Exception as exc:  # pragma: no cover - evidence path
                    components.append({'document': doc_name, 'jsonError': str(exc)})
                    continue
                name, lib_path = component_identity(doc)
                components.append({'document': doc_name, 'name': name, 'path': lib_path})
                variant_keys.update(collect_variant_keys(doc))
                for prop, token_name in collect_token_bindings(doc):
                    entry = {'document': doc_name, 'property': prop, 'token': token_name}
                    token_bindings.append(entry)
                    if token_name.startswith('primitive.'):
                        primitive_direct.append(entry)

            logical = sorted({
                p for c in components
                if (p := logical_component_from_path(c.get('path')))
            })
            present = set(logical) & expected
            missing = sorted(expected - present)
            unexpected = sorted(set(logical) - expected)

            report['evidence']['componentDocumentCount'] = len(component_docs)
            report['evidence']['componentDocuments'] = components
            report['evidence']['logicalComponentPaths'] = logical
            report['evidence']['canonicalComponentPathsPresent'] = sorted(present)
            report['evidence']['missingCanonicalComponents'] = missing
            report['evidence']['unexpectedComponentPaths'] = unexpected
            report['evidence']['variantMetadataKeys'] = dict(variant_keys)
            report['evidence']['tokenBindingCount'] = len(token_bindings)
            report['evidence']['primitiveDirectBindings'] = primitive_direct

            report['checks']['realComponentMetadataPresent'] = len(component_docs) > 0
            report['checks']['variantMetadataPresent'] = sum(variant_keys.values()) > 0
            report['checks']['componentToPrimitiveDirectBindingForbidden'] = len(primitive_direct) == 0
            report['checks']['canonicalPatternsNotCountedAsComponents'] = not any(
                p.endswith('/Status Composition') or p.endswith('/Search Pattern') for p in logical
            )
            report['checks']['fullCatalog33'] = len(present) == 33 and not missing

            page_docs = find_page_docs(names)
            page_names: list[str] = []
            hide_in_viewer_true = 0
            for doc_name in page_docs:
                try:
                    doc = load_json(zf, doc_name)
                except Exception:
                    continue
                for trail, value in walk(doc):
                    if trail and trail[-1] == 'name' and len(trail) <= 3 and isinstance(value, str):
                        page_names.append(value)
                    if trail and trail[-1] in {'hideInViewer', 'hide-in-viewer'} and value is True:
                        hide_in_viewer_true += 1
            report['evidence']['pageDocumentCount'] = len(page_docs)
            report['evidence']['pageNamesObserved'] = sorted(set(page_names))
            report['evidence']['hideInViewerTrueObserved'] = hide_in_viewer_true

            # Tokens live in exported JSON under file-data/tokens; keep the audit
            # schema-tolerant and only prove the facts visible in the archive.
            token_docs = [n for n in names if n.endswith('tokens.json') or '/tokens/' in n]
            report['evidence']['tokenDocuments'] = token_docs
            report['checks']['tokenMetadataPresent'] = bool(token_docs)

    except (zipfile.BadZipFile, json.JSONDecodeError, RuntimeError) as exc:
        report['status'] = 'FAIL'
        report['checks']['readablePenpotExport'] = False
        report['evidence']['error'] = str(exc)
        text = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
        if args.out:
            args.out.write_text(text, 'utf-8')
        print(text, end='')
        return 2

    hard_fail = [
        report['checks'].get('zipIntegrity') is False,
        report['checks'].get('manifestType') is False,
        report['checks'].get('realComponentMetadataPresent') is False,
        report['checks'].get('variantMetadataPresent') is False,
        report['checks'].get('componentToPrimitiveDirectBindingForbidden') is False,
        report['checks'].get('canonicalPatternsNotCountedAsComponents') is False,
    ]
    if args.expect_full_catalog:
        hard_fail.append(report['checks'].get('fullCatalog33') is False)

    if any(hard_fail):
        report['status'] = 'FAIL'
    elif not args.round_trip:
        report['status'] = 'STRUCTURAL_PASS_ROUND_TRIP_NOT_PROVEN'
    else:
        # A declared round-trip export can prove structure, but visual inspection
        # must still be recorded separately. Never silently promote this to the
        # overall PenPot gate.
        report['status'] = 'ROUND_TRIP_STRUCTURAL_PASS_VISUAL_EVIDENCE_REQUIRED'

    text = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text, 'utf-8')
    print(text, end='')
    return 0 if report['status'] != 'FAIL' else 2


if __name__ == '__main__':
    raise SystemExit(main())
