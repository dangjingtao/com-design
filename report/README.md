# Human documentation output

`report/` contains the human-facing Com Design documentation.

## Current live report

```text
report/design-system-v2/
```

The deployed root is a generated `current` pointer to a versioned path:

```text
/ → /versions/<canonical-version>/
```

The V2 Human Guide is a downstream consumer of `design-source/`; catalog facts are read from canonical Component / Composite / Pattern sources rather than copied into the report.

## Retention policy

Human reports are **not disposable build output**.

Rules:

1. Do not delete an accepted human report.
2. Do not overwrite an accepted report in place with materially different content.
3. New builds should create a new versioned report before changing the `current`/`latest` entry point.
4. Existing reports may be moved into a version/archive location only if the complete readable report and its Git traceability are preserved.
5. Automated cleanup must exclude retained human reports.

Current repository/deployment layout:

```text
report/
  design-system-v2/       current V2 Human Guide source shell
  design-system-v1/       immutable accepted V1 evidence
  archive/                historical markers

Pages:
/                         generated current pointer
/versions/<version>/      versioned V2 Human Guide
/accepted/v1/             retained V1 baseline
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
