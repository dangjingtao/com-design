# Archived human documentation snapshot

This archive records the human-facing `report/design-system-v1/` state immediately before the multi-target build-pipeline contract was added on 2026-08-12.

## Immutable snapshot

- Archive branch: `archive/design-system-v1-pre-pipeline-2026-08-12`
- Snapshot commit: `4d57906550b52667edeca573524f841401306af6`
- Original live path: `report/design-system-v1/`

The archive branch preserves the complete repository state, including all HTML/CSS/JS assets used by the report at that point. This marker intentionally avoids duplicating generated assets into `dev` while still preserving an exact Git snapshot.

## Rules

1. Do not use this archive as a source of truth.
2. `design-source/` remains the only editable design-system source.
3. Do not rewrite or force-update the archive branch.
4. Before a future published human report is replaced, create a new dated snapshot first.
5. `report/design-system-v1/` remains the live report until the unified document generator is implemented and verified.
