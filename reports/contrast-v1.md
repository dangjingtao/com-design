# Contrast Report — V1 Release Candidate

Target baseline:

- Normal text: **≥ 4.5:1**
- Large text: **≥ 3:1**
- Necessary non-text UI boundary / focus indicator: **≥ 3:1**

This report checks the high-risk canonical pairs used by Core. It is a release spot-check, not a claim that every arbitrary color pairing is allowed.

## Light

| Pair | Ratio | Result |
| --- | ---: | --- |
| text.primary `#252B3D` / surface.default `#FFFFFF` | 14.08:1 | PASS |
| text.secondary `#535D72` / surface.default | 6.61:1 | PASS |
| placeholder `#687288` / surface.default | 4.83:1 | PASS |
| text.brand `#494CE0` / surface.default | 6.19:1 | PASS |
| inverse label `#FFFFFF` / action.primary `#5B5EF7` | 4.78:1 | PASS |
| inverse label / action.destructive `#D63E50` | 4.50:1 | PASS |
| border.default `#8590A3` / white control surface | 3.22:1 | PASS non-text |
| border.focused `#5B5EF7` / white control surface | 4.78:1 | PASS |

## Dark

Dark values come from `tokens/theme-dark.json`.

| Pair | Ratio | Result |
| --- | ---: | --- |
| text.primary `#F7F8FC` / page `#10131E` | 17.45:1 | PASS |
| text.primary / surface.default `#171B2A` | 16.13:1 | PASS |
| text.secondary `#CDD3E1` / surface.default | 11.41:1 | PASS |
| placeholder `#8590A3` / surface.default | 5.31:1 | PASS |
| text.brand `#C9CDFF` / surface.default | 11.14:1 | PASS |
| inverse label `#FFFFFF` / action.primary `#5B5EF7` | 4.78:1 | PASS |
| inverse label / action.destructive `#D63E50` | 4.50:1 | PASS |
| border.default `#687288` / surface.default | 3.55:1 | PASS non-text |
| border.focused `#7B7EF8` / surface.default | 5.04:1 | PASS |
| successText `#DDF8EA` / successBg `#163629` | 11.73:1 | PASS |
| warningText `#FFF2D6` / warningBg `#403013` | 11.47:1 | PASS |
| dangerText `#FFE4E8` / dangerBg `#431C24` | 12.25:1 | PASS |
| infoText `#E3E5FF` / infoBg `#25264D` | 11.56:1 | PASS |

## Important interpretation

- `status.success`, `status.warning`, etc. may be used as icon / marker colors; text must use the corresponding `*Text` role unless a separate contrast check passes.
- Accent is not a generic text color. It may be used for indicators and explicitly checked action emphasis.
- Disabled content is allowed lower emphasis but must not carry essential information that becomes unreadable.
- Product / Domain Extension may not invent arbitrary text/background combinations and cite this report as approval.

## Remaining independent-review checks

Before Stable V1, independent review should still sample:

- real rendered fonts on iOS / Android
- status icon + surrounding surface combinations
- Dark overlay in PenPot and implementation
- high-contrast / OS accessibility settings where supported
- non-text focus and selection states on actual controls
