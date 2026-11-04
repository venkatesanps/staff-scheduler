---
name: media-gallery
description: Build a fast, browsable gallery or catalog page (masonry grid of video/image cards, category filter chips, sticky intro column, sort menu, ⌘K command-palette search, lazy media) that works from phone to desktop. Use for showcases, portfolios, template or component libraries, inspiration boards, product catalogs and "explore" pages.
---

# Media gallery

The pattern behind gallery-first sites (seen in a teardown of motionvideo.xyz): **content is the
hero**. The intro is a column inside the grid, not a banner above it.

## Layout

```
┌ header: logo · primary nav · live status · ⌘K search · CTA · avatar ─────────┐
├ toolbar: [All] [Category] [Category] … (scrolls sideways)      [Sort ▾] ──────┤
│ ┌ intro ─────┐ ┌ card ┐ ┌ card ┐ ┌ card ┐                                     │
│ │ h1 + lede  │ │      │ │      │ └──────┘                                     │
│ │ 2 buttons  │ └──────┘ │      │ ┌ card ┐                                     │
│ ├ card ──────┤ ┌ card ┐ └──────┘ │      │   masonry: cards keep their own      │
```

- Use CSS columns for true masonry: `columns: 4 280px; column-gap: 12px;` with each card
  `break-inside: avoid; margin-bottom: 12px`. The intro block is the first item.
- Breakpoints: 4 columns from 1280px, 3 from 1024px, 2 from 640px, 1 below. On a phone the
  intro sits above a single column and the header collapses to logo · search icon · menu.
- Filter chips: a horizontal `nav aria-label="Filter by category"` with
  `overflow-x: auto; scrollbar-width: none`, a fade mask at the right edge, and the active chip
  in `--primary`. Inactive chips use `--muted`.
- Cards are `<article>` elements with a media frame (rounded `--radius`, `--surface-outline`),
  a small creator avatar overlaid bottom-left, and an optional "Sponsored" badge top-left. Put
  the title in an `<h2>` that is visually hidden or shown on hover, so the outline stays
  meaningful.

## Media performance

- Video: `muted loop playsinline preload="none" poster="…jpg"`. Play on hover (desktop) or in
  view (touch). At most 2–3 playing at once: pause the ones that scroll out, using an
  IntersectionObserver with `threshold: .5`.
- Images: `loading="lazy" decoding="async"` with `width`/`height` set (no layout shift),
  `srcset` at 1x and 2x, and AVIF/WebP.
- Ship short encoded previews (4–8s, ≤1 MB, 720p) and keep full-quality files for the
  detail page.
- Load the next page with an IntersectionObserver sentinel, and keep URLs shareable
  (`?category=charts&sort=new`).

## Search (⌘K)

- Open the palette with ⌘K or Ctrl+K and from a search button in the header that shows the
  shortcut in `<kbd>`.
- Use `role="dialog" aria-modal`, focus trap, Escape closes, and return focus to the trigger.
- Group results by type (videos, creators, tools…) and support arrow-key navigation with
  `aria-activedescendant`.
- Fuzzy-match on the client for catalogs under ~5k items; above that, use a search endpoint.

## Delight, sparingly

- "Surprise me" goes to a random item.
- A live "N online" counter with a pinging dot (see `motion-system`).
- On hover a card lifts: `translateY(-2px)` plus `--surface-lift`, over `--dur-fast`.
