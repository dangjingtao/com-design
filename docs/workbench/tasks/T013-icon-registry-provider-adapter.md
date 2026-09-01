# T013 · Icon Registry → Provider → Adapter

- Status: TODO
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

- [ ] registry/schema/source 均真实存在并可被 manifest 引用。
- [ ] Core / Product namespace 不冲突。
- [ ] missing / duplicate / illegal override 会失败或明确 fallback。
- [ ] Lucide provider 可映射稳定 icon names。
- [ ] focused tests 通过。

## Risks / Dependencies

- 前置：无。
- 与 T001 的 manifest source 修正需协调，不重复改同一声明。
- T014、T020 依赖本卡。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Registry validation:
- Provider sample:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:
