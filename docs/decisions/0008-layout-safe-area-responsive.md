# ADR 0008 — Layout, safe area and responsive structure

- **Status:** accepted
- **Date:** 2026-06-12

> Note: the Phase 5 brief referred to this decision as
> `001-layout-safe-area-responsive.md`. It is recorded here under the existing
> four-digit ADR convention (0001–0007) as `0008`. Rename if a different scheme
> is preferred.

## Context

The settings wireframe needs a professional layout structure — not final visual
design. This ADR fixes the page shell, the centred safe-area surface, bounded
bar heights, the two-column main grid, and the responsive behaviour, so the
structure is consistent and future-friendly before any aesthetic work.

## Decision

### Page shell

A full-height application shell, top to bottom: primary nav, context bar,
secondary submenu, body, footer. The page itself does not scroll by default;
scrolling lives inside the left settings list and/or the right detail panel.

### Maximum width and safe area

The shell is a centred surface:

- default max width **2080px**;
- ultrawide absolute ceiling **2240px**, applied only if explicitly needed (kept
  as a token, not currently active);
- the menu is not stretched indefinitely on 21:9 — extra width becomes margin;
- minimum safe area **20px**;
- future-friendly horizontal padding:
  `max(<breakpoint margin>, env(safe-area-inset-*), 20px)`.

These are expressed as CSS custom properties (tokens) on `:root`.

### Bounded bar heights

- top nav: 56px small / 64px base / 72px max;
- subnav: 48px small / 50px base / 54px max;
- footer: 64px small / 66px base / 72px max.

The body occupies the remaining height between the bars. The context bar is
content-sized (no fixed height) and sits between nav and subnav.

### Main grid

Two columns, left list wider than right detail:

- technical base: `minmax(620px, 1.35fr) minmax(420px, 1fr)` (≈58% / ≈42%);
- accepted range: left 54–62%, right 38–46%;
- the right panel must not become too narrow; the left must not become absurdly
  wide.

Each column scrolls internally; the page does not.

### Responsive behaviour

- When two columns cannot fit while respecting their minimum widths
  (≈620 + ≈420), switch to **stacked** mode: list above, detail below. No
  collapsible or hideable panels yet.
- 16:10: same composition; extra height shows more rows/content.
- 21:9: centre the surface, keep the max width, do not stretch text and controls
  across the whole viewport.

The submenu stays a single bounded-height row and scrolls horizontally rather
than wrapping, so its height stays within the subnav bounds.

## Consequences

- Layout tokens live in one place and can be tuned without touching components.
- The structure behaves predictably from narrow laptops to 21:9.
- Final aesthetics (colour, decoration, motion) remain out of scope and can be
  layered on top of this structure later.

## Alternatives considered

- **Full-bleed, no max width.** Rejected: text and controls stretch awkwardly on
  ultrawide.
- **Collapsible panels for small screens.** Rejected for now: stacked mode is
  simpler and sufficient at this stage.
