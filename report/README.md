# Human documentation output

`report/` contains the human-facing Com Design documentation.

## Current live report

```text
report/design-system-v1/
```

This report is an important design-system acceptance artifact. It must remain readable and traceable even after newer reports are generated.

## Retention policy

Human reports are **not disposable build output**.

Rules:

1. Do not delete an accepted human report.
2. Do not overwrite an accepted report in place with materially different content.
3. New builds should create a new versioned report before changing the `current`/`latest` entry point.
4. Existing reports may be moved into a version/archive location only if the complete readable report and its Git traceability are preserved.
5. Automated cleanup must exclude retained human reports.

A future layout may use:

```text
report/
  design-system-v1/       current accepted report
  versions/
    <version-or-date>/     retained acceptance reports
  archive/
    ...                    immutable historical markers
```

`current` or `latest` should only be an entry point/pointer. It must never be the only surviving copy of an accepted report.

## Existing archive

The pre-pipeline snapshot is recorded at:

```text
report/archive/design-system-v1-pre-pipeline-2026-08-12/ARCHIVE.md
```

The exact historical repository state is also preserved on:

```text
archive/design-system-v1-pre-pipeline-2026-08-12
```

Archived/versioned reports are acceptance evidence and historical reference material. They never feed future builds and never become a design-system source of truth.

The complete build and retention contract is defined in `design-source/BUILD_PIPELINE.md`.
