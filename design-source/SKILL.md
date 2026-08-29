---
name: com-design-design
description: Use this skill to generate branded mobile interfaces for Com Design Mobile — Electric Indigo, flat-first, compact core UI. Contains design guidelines, tokens, and six UI kit components for prototyping app screens.
user-invocable: true
---

# Com Design Mobile Design Skill

Read `README.md` for brand context, then consume `css.json` for structured tokens and `colors_and_type.css` as the runtime CSS variable source. For production code, link the token CSS; for visual prototypes, copy preview patterns. If invoked without guidance, ask what to build and output HTML artifacts or production code as needed.

## Quick map

- `README.md` — brand narrative, foundations, component usage notes
- `colors_and_type.css` — runtime CSS variables for color, type, radius, spacing, elevation
- `css.json` — structured token understanding source
- `components.css` — aggregated component CSS extracted from previews
- `components/index.json` — component index and cross-component patterns
- `components/button.json`, `components/input.json`, `components/list-item.json`, `components/card.json`, `components/tag.json`, `components/bottom-navigation.json` — component contracts for intent and variants
- `preview/component-button.html`, `preview/component-input.html`, `preview/component-list-item.html`, `preview/component-card.html`, `preview/component-tag.html`, `preview/component-bottom-navigation.html` — DOM/CSS source; read preview first, component JSON for intent, and evidence as fallback when available
- `specs/design-system-v1.json` — supplementary structured design-system spec
- `library-consumption.json` — downstream read order

## Essentials at a glance

- Brand primary `#5B5EF7` Electric Indigo drives the highest-priority actions, active navigation, focus, links, selected state and info foreground; accent `#16BFD3` is reserved for local emphasis, progress, and data highlights rather than a fifth status color.
- **Brand color is a scarce hierarchy signal, not a generic clickable-state fill.** Secondary actions use neutral subtle surfaces by default; informational containers also prefer neutral surfaces with brand-colored foreground, so repeated actions/status blocks do not turn the screen into one large brand tint.
- Primary Button normally appears once per view or action group for the highest-priority next step. Visible supporting actions use Secondary; low-emphasis actions use Tertiary/text treatment. Do not create several brand-filled buttons merely because several actions are available.
- Radius is `4 / 8 / 12 / 16` plus pill: controls use `8px`, containers use `12px`, overlays use `16px`; pill appears only on compact tags/chips.
- Compact-first density: default control height `40px`, large controls `48px`, bottom navigation `56px`, and spacing tokens are `0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32`.
- Typography uses `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`; scale runs from caption `12px/18px` to display `28px/36px`, with semibold (`600`) reserved for headings, title, and display.
- Flat-first surfaces: components have no default shadow; only two elevations exist (`--com-elevation-floating`, `--com-elevation-modal`) for transient floating layers and modals.
- Cards default to borderless, shadowless grouping containers; add a border only when extra containment is needed, and use sections before cards in list layouts.
- Voice is Chinese-first, professional, neutral, high information density; UI copy is short and direct, with no emoji and status expressed through icon shape plus text.

## Components

| Slug | Name | Insight |
|---|---|---|
| button | Button | 主操作使用 Electric Indigo；Secondary 默认中性浅底；40px 紧凑，无阴影，Primary 作为稀缺层级信号 |
| input | Input | 描边输入框，字段级校验优先，readonly 与 disabled 语义分离 |
| list-item | List Item | 信息行，48px 最小高，section-before-card |
| card | Card | 默认无边框无阴影容器，边框仅在需要强化收纳时使用 |
| tag | Tag | 色调药丸标签，Accent Cyan 不充当第五种状态色 |
| bottom-navigation | Bottom Navigation | 56px 底栏，Brand 为激活色，3-5 个目的地 |
