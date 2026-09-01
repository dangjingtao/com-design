# Com Design V2 — Early Task Split (Superseded for Dispatch)

> Status: **Planning Source / Superseded for Dispatch**  
> Original full split commit: `f1f262598e0f723934e72f137357f662b126cb77`  
> Formal execution ledger: `../../docs/workbench/00-work-ledger.md`  
> Formal task cards: `../../docs/workbench/tasks/T001-*.md` → `T026-*.md`

This file originally contained the first V2 dependency split using temporary `V2-001` → `V2-026` identifiers. That split was useful for architecture and parallelism planning, but it was incorrectly treated as the dispatched task system.

Com Design now follows the repository task-card workflow used across current projects:

```text
docs/workbench/00-work-ledger.md
→ docs/workbench/tasks/Txxx-*.md
→ Builder implementation / evidence
→ REVIEW
→ Mira review
→ PASS / revise / BLOCKED
```

## Identifier migration

The mapping is one-to-one:

```text
V2-001 → T001
V2-002 → T002
...
V2-026 → T026
```

Do **not** start new construction using `V2-xxx` identifiers. Use the `Txxx` cards under `docs/workbench/tasks/`.

## Why this file remains

The original split remains available in Git history at commit `f1f26259` so the dependency-analysis history is not silently lost. The live execution contracts have been migrated into individual task cards, where Status, Implementation record, Verification evidence and Review can be maintained independently.

## Current first wave

The initial dependency-safe parallel tasks are:

- T001 — Source Integrity + Manifest Gate
- T002 — Cross-platform Platform Model + Axes
- T003 — Core Component Contract V2 Schema
- T004 — Adapter Modularization + Stable Registry
- T013 — Icon Registry → Provider → Adapter

For all current status and dependencies, read `docs/workbench/00-work-ledger.md` rather than this planning artifact.
