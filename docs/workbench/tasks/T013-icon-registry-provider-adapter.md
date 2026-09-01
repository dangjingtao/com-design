# T013 · Icon Registry → Provider → Adapter

- Status: PASS
- Target version: V2 first-stage
- Impact: Foundation / Iconography
- Owner: -

## Background

V2 readiness audit 发现 manifest 曾引用不存在的 iconography source/schema。V2 已确认采用 `Icon Registry → Icon Provider → Icon Adapter`，Lucide 是默认 Core provider，品牌 / Mascot 属于 Product Extension。

## Goal

补齐 provider-agnostic、machine-readable icon contract，并修复当前 iconography source 缺口。

## Must Read

- `design-source/V2_PLANNING.md` iconography section
- `design-source/v2-planning/four-platform-readiness-audit.md`
- `design-source/specs/design-system-v1.json`
- `design-source/SKILL.md`

## Scope

- 新增 icon registry / schema。
- 定义 Core 与 Product namespace。
- Lucide 作为默认 Core provider；允许 Company/Product SVG provider。
- 管理 stable name、size 16/20/24、stroke/viewBox/alignment/a11y metadata。
- missing icon fallback / validation。

## Out of scope

- 不把品牌图形 / Mascot 升为 Core icons。
- 不允许 Product provider 静默覆盖同名 Core icon。
- 不要求每个 icon 都是 semantic icon。

## Acceptance

- [x] registry/schema/source 均真实存在并可被 manifest 引用。
- [x] Core / Product namespace 不冲突。
- [x] missing / duplicate / illegal override 会失败或明确 fallback。
- [x] Lucide provider 可映射稳定 icon names。
- [x] focused tests 通过。

## Risks / Dependencies

- 前置：无。
- 与 T001 的 manifest source 修正需协调，不重复改同一声明。
- T014、T020 依赖本卡。

## Implementation record

- Commit / PR: branch `task/T013-icon-registry-provider-adapter`; PR #20 against `dev`.
- Changed paths:
  - `design-source/schemas/iconography-contract-v1.schema.json`
  - `design-source/specs/iconography.json`
  - `design-source/specs/design-system-v1.json`
  - `tooling/src/iconography.mjs`
  - `tooling/bin/validate.mjs`
  - `tooling/test/iconography.test.mjs`
  - `tooling/test/source-integrity.test.mjs`
  - `docs/workbench/00-work-ledger.md`
  - this task card
- Notes:
  - Canonical stable names are fully namespaced (`core.*` / `product.<namespace>.*`); Product Extension may reuse a local label such as `search` only inside its own namespace, but cannot register or replace any `core.*` provider/icon.
  - `lucide-core` is the default Core provider. The canonical source maps 11 common stable names while provider-specific export names stay behind the adapter boundary.
  - Shared geometry is `0 0 24 24`, optical-center, stroke width 2; supported visual sizes are exactly 16 / 20 / 24.
  - Missing icons explicitly fall back to `core.help` with a warning unless strict resolution is requested; missing providers and invalid Core overrides are hard failures.
  - Product/Company custom icons are represented as namespaced SVG providers and remain Product Extension rather than Core.
  - Interactive icons that require an accessible name fail resolution when none is supplied.
  - Acceptance review found `decorativeAllowed: false` was initially metadata-only. Resolver now rejects decorative rendering for those icons and requires an accessible name when they are exposed non-decoratively; regression coverage was added.
  - T013 was replayed onto the latest `dev` after T010 merged, preserving the canonical Platform Environment sources and validator path.

## Verification evidence

- CI: PR #20 Design System Build run `33501834586`, head `ced9f163f9d5163c6a69674e79e3f2ca8ecc50a1`, completed successfully. Unit tests, `npm run build:all`, accepted-report protection and artifact uploads all passed.
- Registry validation: canonical schema/source are promoted from `plannedSources` into manifest `sources`; source-integrity derives `coreIcons: 11`, and the unified validator executes `validateIconographyContract` alongside T010 Platform Environment validation.
- Provider sample: `core.search → lucide-core / Search`; Product SVG sample `product.academy.campus → academy-icons / campus`; unknown names explicitly resolve to `core.help` unless strict mode is selected.

## Review

- Reviewer: Mira
- Result: PASS
- Conclusion: PASS. The provider-neutral stable-name boundary is coherent, Core/Product namespaces are isolated without over-restricting local-name reuse, Lucide remains an implementation provider rather than product API, missing/duplicate/override behavior is deterministic, accessibility metadata is enforced at resolution time, and final-head CI passes on the latest `dev` baseline with T010 preserved.
- Follow-up: T014 and T020 may now consume this registry/provider/adapter boundary. Downstream platform adapters should map the provider-neutral result rather than hard-code SVG assets or Lucide names in product components.
