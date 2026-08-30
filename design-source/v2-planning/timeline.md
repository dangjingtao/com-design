# V2 Timeline — Visual & Structural Correction

> Status: Confirmed defect / V2 correction required  
> Scope: Existing Core `Timeline`  
> Platforms: Mobile first, cross-platform compatible

## Problem observed

Current Human Guide / Preview does not read as a coherent timeline. The visible result resembles several colored dots with disconnected vertical fragments rather than one continuous chronological rail.

The V1 contract itself already requires:

- vertical chronological events;
- a node for each event;
- a subtle connector between events;
- optional timestamp, title and supporting content;
- the final event connector omitted or faded.

Therefore V2 does **not** need a new Timeline component or new basic anatomy. This is primarily a Preview / implementation / visual-governance defect.

## Root cause in current Preview

The current Preview attaches the connector using a selector equivalent to:

```css
.tl-event + .tl-event .tl-rail::before
```

and hides it again for the last event.

This gives connector ownership to the following event instead of expressing the semantic relationship:

```text
current node
↓ connector
next node
```

The implementation makes the first relationship especially weak and allows visible gaps between node/connector segments.

## V2 correction rules

### 1. Continuous rail

- Every non-final event MUST visually connect from its node toward the next event node.
- The connector must meet the node cleanly; there must be no unexplained vertical gap around the node.
- The final event MUST terminate the rail cleanly; do not leave a dangling line.
- Event content height may vary, but connector continuity must remain intact.
- Implementation may use per-event connector, shared rail, pseudo-element, native drawing or equivalent platform technique; Core contract specifies the visual relationship, not CSS structure.

### 2. Node alignment

- Node should align consistently with the event's primary temporal/content anchor.
- For the standard mobile layout, align the node near the timestamp / first content line rather than floating ambiguously between rows.
- Node position must remain stable when supporting text wraps to additional lines.
- Node size and rail thickness should remain visually balanced; the connector must not appear heavier than the event content.

### 3. Event spacing

- Vertical spacing belongs between event content blocks, while the timeline rail remains continuous through that space.
- Do not use `gap` in a way that visually cuts the rail into separate unrelated segments.
- Timestamp → title → supporting text spacing should be tighter than the spacing between events, so each event reads as one unit.

### 4. Status semantics

- Status color is secondary reinforcement, not the primary chronology mechanism.
- `default / success / warning / danger / info` nodes may differ by semantic color, but the rail itself should remain neutral by default.
- Timeline must remain understandable in grayscale / reduced-color conditions.
- If status meaning is important, readable text or icon semantics must carry it; a colored dot alone is insufficient.

### 5. Visual hierarchy

Recommended hierarchy:

```text
timestamp / metadata      low emphasis
primary event title       strongest text
supporting description    secondary text
node                      compact semantic marker
connector                 quiet structural guide
```

Avoid making all colored nodes equally attention-grabbing. A chronology is primarily scanned through text and sequence, not through four competing status colors.

### 6. Container policy

- Timeline itself must not require a Card container.
- It may live in a Card, Section, page surface, detail sheet or history panel according to product composition.
- Preview should demonstrate the component without implying that every timeline must be wrapped in a large white card.

### 7. Long history behavior

For long timelines:

- allow date / phase grouping;
- preserve rail continuity within each logical group;
- group boundaries may intentionally break or restart the rail when the hierarchy is explicit;
- do not compress dozens of events into tiny spacing merely to fit one screen;
- long history can compose with incremental loading / virtualization when required, without changing Timeline semantics.

### 8. Cross-platform guidance

- iOS / Android / WeChat Mini Program may implement the rail differently, but visual continuity and alignment are shared requirements.
- Avoid platform implementations that rely on absolute heights derived from fixed text lines; dynamic type / font scaling / wrapped content must remain correct.
- Reduced Motion has little effect on the static timeline itself; if events animate into the list, motion is optional and must not be necessary to understand sequence.

## Preview acceptance

V2 Preview / Human Guide should include at least:

1. a four-event mixed-status timeline with visibly continuous connectors;
2. one event whose supporting text wraps to multiple lines;
3. a final event with a clean rail termination;
4. grayscale / no-color readability check;
5. long-content sample showing that variable event height does not break the rail.

The screenshot state where nodes appear separated by disconnected line fragments is a failed visual acceptance state.
