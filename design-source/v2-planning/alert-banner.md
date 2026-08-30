# V2 Planning — Alert / Inline Banner

> Status: Confirmed planning item  
> Scope: Com Design V2  
> Source component: `Alert / Inline Banner`

## Confirmed problem

Current V1 contract differentiates `inline` and `banner` mainly by placement/width: inline sits in content flow, banner spans the card/app width. In the current Human Guide preview this does not create a meaningful visual or structural distinction: the banner reads as the same Alert made wider.

This is a visual and semantic design defect. **Width alone is not a sufficient component distinction.**

## V2 boundary

V2 keeps one shared feedback family, but defines two clearly different presentation contracts.

### Inline Alert

Use for contextual feedback attached to a local section, form, field group, card content, or task area.

- Lives inside normal content flow and inherits the local content width.
- May use contained radius and subtle tinted surface.
- Default anatomy: status icon + content + optional local action.
- Title is optional; short supporting text is common.
- Action, when present, is contextual to the local content.
- Dismiss is uncommon and only allowed when the message is safely ignorable.
- Should visually read as part of the section rather than as page chrome.

### Banner

Use for page-level or region-level persistent information whose scope is broader than a local content block.

- Occupies a defined page/region notification slot rather than merely stretching an Inline Alert.
- Placement is structural: normally below Top App Bar / page header or at the top edge of the affected content region.
- Mobile banner SHOULD align to page edge/inset rules, not be wrapped in an additional white card merely to look wider.
- Visual geometry SHOULD be flatter than Inline Alert: reduced or context-dependent corner radius; edge-to-edge/contained behavior is controlled by page shell/inset context.
- Default anatomy: status icon + message block + optional action + optional dismiss.
- One concise title or strong first line; copy should be scannable without reading a card-like paragraph stack.
- Action may be inline/trailing when width permits; on narrow mobile it may move below the text, but remains part of the banner.
- Dismiss belongs at the banner edge and must never compete visually with the primary recovery/action link.
- Multiple simultaneous banners SHOULD NOT stack indefinitely. Products should prioritize, merge, or queue lower-priority notices.
- A banner should not be used for transient success confirmation that is better served by Toast/Snackbar.

## Scope, not tone, determines variant

`info / success / warning / danger` are semantic tones and are orthogonal to `inline / banner` presentation.

Examples:

- Local form validation summary → Inline Alert, danger.
- One section cannot sync → Inline Alert, warning/error.
- Account login expired and affects the whole page → Banner, danger.
- System-wide scheduled maintenance notice → Banner, info/warning.
- "Saved successfully" after a normal action → usually Toast/Snackbar, not Banner.

Do not choose Banner merely because the message is severe; choose it because the message scope is page/region level.

## Visual differentiation requirements

V2 Preview / Human Guide must make Inline Alert and Banner distinguishable even when both use the same tone.

Required comparison example:

- `warning + inline`
- `warning + banner`

The two examples MUST differ in at least:

1. placement/context ownership;
2. container geometry/inset behavior;
3. content/action layout;
4. visual relationship to surrounding content.

They MUST NOT be implemented as the same rounded tinted card with only a different width.

## Mobile platform mapping

### iOS / Android

- Banner placement respects Safe Area and Top App Bar ownership.
- Page-level banners should not float over content unless the product intentionally chooses an overlay notification pattern; that would be a different component/pattern.
- Text/actions adapt to narrow widths without squeezing the status icon or reducing touch targets.

### WeChat Mini Program

- Banner must respect Mini Program Top App Bar / reserved capsule region via the platform adapter.
- It should normally live inside the product content region below host/navigation chrome; it must not attempt to render into WeChat-owned chrome.
- Page-scroll and custom-scroll-container pages need explicit banner ownership so sticky/persistent behavior does not create nested-scroll bugs.

## Relationship to other feedback components

- `Toast`: transient, lightweight acknowledgement; no durable page position.
- `Snackbar`: transient feedback with optional short action.
- `Inline Alert`: persistent, local-context feedback.
- `Banner`: persistent, page/region-scope feedback.
- `Dialog`: blocking decision/confirmation.
- `Result State`: full-state task outcome, not merely a strip of feedback.

## Implementation decision

Do not add a new Core count merely to solve the visual bug yet. V2 should first strengthen the existing `Alert / Inline Banner` contract and preview. If the two presentations later require materially different APIs/anatomy across products, then reassess whether Banner deserves an independent Core Component.