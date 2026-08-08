# Contrast Report — V1 Release Candidate RC2

Target baseline:

- Normal text: **≥ 4.5:1**
- Large text: **≥ 3:1**
- Necessary non-text UI boundary / focus indicator: **≥ 3:1**

This report checks high-risk canonical pairs used by Core and now includes real component consumer-path checks discovered during Foundation Hardening. It is still not permission for arbitrary Product Extension pairings.

## RC2 corrections found by reverse-auditing component contracts

Two P0 gaps existed in RC1 even though the individual palette tokens looked acceptable in isolation:

1. Search Field used `color.text.placeholder` on `color.surface.subtle`. The RC1 pair failed normal-text contrast in both themes.
2. Alert used base status chroma as the icon foreground on the matching tinted status background. Success and Warning failed necessary non-text contrast, and the pattern incorrectly assumed a status color was valid on every status surface.

RC2 fixes the consumer paths rather than inventing decorative palette entries:

- Light placeholder moves from Neutral 500 to Neutral 600.
- Dark placeholder moves from Neutral 400 to Neutral 300.
- Alert/tinted-status necessary graphics use the corresponding `*Text` semantic foreground.
- Toast status icons on inverse surfaces use `color.text.inverse`; status type is carried by icon shape plus message rather than forcing low-contrast status chroma.

## Light

| Pair | Ratio | Result |
| --- | ---: | --- |
| text.primary `#252B3D` / surface.default `#FFFFFF` | 14.08:1 | PASS |
| text.secondary `#535D72` / surface.default | 6.61:1 | PASS |
| placeholder `#535D72` / surface.default | 6.61:1 | PASS |
| **Search placeholder `#535D72` / surface.subtle `#F0F2F8`** | **5.91:1** | **PASS** |
| text.brand `#494CE0` / surface.default | 6.19:1 | PASS |
| inverse label `#FFFFFF` / action.primary `#5B5EF7` | 4.78:1 | PASS |
| inverse label / action.destructive `#D63E50` | 4.50:1 | PASS |
| border.default `#8590A3` / white control surface | 3.22:1 | PASS non-text |
| border.focused `#5B5EF7` / white control surface | 4.78:1 | PASS |
| Alert info icon/infoText `#393BBE` / infoBg `#F0F1FF` | 7.37:1 | PASS |
| Alert success icon/successText `#147A4C` / successBg `#DDF8EA` | 4.77:1 | PASS |
| Alert warning icon/warningText `#9A6110` / warningBg `#FFF2D6` | 4.63:1 | PASS |
| Alert danger icon/dangerText `#A92939` / dangerBg `#FFE4E8` | 5.72:1 | PASS |

For reference, the removed RC1 Alert pairings were not all valid: `success.500/success.100 = 2.34:1`, `warning.500/warning.100 = 1.89:1`, `info.500/info.50 = 4.27:1`, `danger.500/danger.100 = 3.76:1`.

## Dark

Dark values come from `tokens/theme-dark.json`.

| Pair | Ratio | Result |
| --- | ---: | --- |
| text.primary `#F7F8FC` / page `#10131E` | 17.45:1 | PASS |
| text.primary / surface.default `#171B2A` | 16.13:1 | PASS |
| text.secondary `#CDD3E1` / surface.default | 11.41:1 | PASS |
| placeholder `#CDD3E1` / surface.default | 11.41:1 | PASS |
| **Search placeholder `#CDD3E1` / surface.subtle `#252B3D`** | **9.39:1** | **PASS** |
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

- `status.success`, `status.warning`, etc. are **marker chroma**, not universal foreground colors.
- On tinted status surfaces, text and necessary status graphics use the corresponding `*Text` role unless another pairing is separately audited.
- On inverse transient-feedback surfaces, a status icon may use the inverse foreground while icon shape + message carry status meaning.
- Accent is not a generic text color. It may be used for indicators and explicitly checked action emphasis.
- Disabled content is allowed lower emphasis but must not carry essential information that becomes unreadable.
- Product / Domain Extension may not invent arbitrary text/background combinations and cite this report as approval.

## Remaining independent-review checks

Before Stable V1, independent review should still sample:

- real rendered fonts on iOS / Android
- remaining status graphic + surrounding surface combinations in actual components
- Dark overlay in PenPot and implementation
- high-contrast / OS accessibility settings where supported
- non-text focus and selection states on actual controls
