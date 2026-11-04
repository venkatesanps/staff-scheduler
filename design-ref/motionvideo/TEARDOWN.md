# Teardown: motionvideo.xyz

Captured 2026-11-04 by passive observation in headless Chromium: public, logged-out pages
`/en`, `/en/moves`, `/en/templates`, `/en/tools`, `/en/docs` at 1440×900 and 390×844, dark scheme.
The method follows REA's browser-observation approach (github.com/morluto/rea). Its npm package was
not run in this session, so the same observations were made with Playwright. Screenshots stay local
(PNGs in `design-ref/` are gitignored).

Legend: **[obs]** observed directly · **[inf]** inferred from fingerprints · **[unk]** not visible

## Stack
- TanStack Start/Router: chunks `createServerFn`, `lazyRouteComponent`, `matchContext`, `routes` **[inf]**
- Rolldown-built bundles (`rolldown-runtime`), ~160 JS chunks on the home page **[obs]**
- Motion (framer-motion): `AnimatePresence` chunk **[inf]**
- Base UI primitives: `CompositeList`, `getPseudoElementBounds` **[inf]**
- Tailwind v4 + shadcn-style OKLCH tokens (`--card`, `--ring`, `--chart-1…5`, `--sidebar-*`) **[obs]**
- View Transitions API: `::view-transition-*` rules **[obs]**
- PostHog analytics, Cloudflare Web Analytics, media on `assets.motionvideo.xyz` **[obs]**
- Search backend, auth and the Pro gating logic: **[unk]**

## Tokens [obs]
- Neutral grey scale (chroma 0): background 14.5% / card 20.5% / muted 26.9% in dark; borders are
  `oklch(100% 0 0 / .1)`.
- One accent: amber `oklch(79.5% .184 86)` (dark). It's used for the active chip, the primary CTA
  ("Get Pro", "Submit a video") and the focus ring.
- `--radius: .45rem` (buttons are 7.2px).
- Two shadow tokens: `--surface-outline` (multi-layer hairline) and `--surface-lift`.
- A parametrized **raised-button** system (`.t-raise-{primary,secondary,outline,destructive,info,…}::before`)
  with `--raise-fill/lip/shade/edge/contact`.
- Charts use a 5-step neutral ramp, so data colour stays out of the chrome.

## Type [obs]
- One family for everything: "Timeless Sans" (custom).
- h1 24px/30px, 600, −0.6px tracking. Body 16/24. Controls 14/20, 500.
- The marketing voice comes from the *videos*, not from big type, so the UI chrome stays small.

## Layout [obs]
- Masonry grid: 4 columns at 1440, 1 on phone. The intro (h1, lede, two buttons) is the first
  grid cell, not a hero banner.
- Header: logo · nav · live "150 online" with a ping dot · search with `Ctrl K` hint · CTA · avatar.
  On phone it collapses to logo · count · search icon · menu.
- A sideways-scrolling category chip bar with an edge fade, plus a "Featured" sort menu.
- No horizontal page overflow at either width.

## Motion [obs]
- Hover transitions: 150ms colour/background/border with `cubic-bezier(.23,1,.32,1)` (ease-out quint)
  and `cubic-bezier(.4,0,.2,1)`.
- `animate-ping` (1s) on the live dot, and a custom `mv-rotate` 6s linear loop.
- `prefers-reduced-motion` turns off the shimmer text and all view-transition animations.
- The site teaches "moves" (named principles such as squash and stretch, anticipation, overshoot
  and settle, staggered timing, line mask reveal, text scramble…). That taxonomy is the core of
  `motion-system`.

## Media and performance [obs]
- 28 `<video>` elements on the home page: `muted loop playsinline preload="none"` with posters,
  playing when in view or hovered.
- 321 requests on the home page (162 scripts, 109 images, 44 media). It's heavy, but the cost is
  deferred until you scroll.
- The ⌘K / Ctrl+K command palette opens a `role=dialog`.

## Take
1. One semantic token set, defined twice; one accent; translucent dark borders
2. Composite `surface-outline`/`surface-lift` shadows instead of borders
3. Parametrized raised buttons for every variant
4. Intro-as-grid-cell gallery layout with a chip filter bar
5. `preload="none"` + poster + play-in-view video
6. ⌘K search with a `<kbd>` hint in the header
7. Named motion moves with 150ms/ease-out-quint hover tokens and reduced-motion overrides
8. Neutral chart ramp

## Leave
- 160+ JS chunks for a gallery. A small site should ship far fewer.
- Some pages (`/en/skill`, `/en/mcp`, `/en/pricing`) rendered an error frame ("This frame didn't
  render") in the headless capture. That could be a bot check or a client error **[unk]**.
  Either way, build an error state that gives the user a way forward.

## Limits
Logged-in and Pro states, server functions, search ranking and anything behind the paywall were not
observed. Animations were sampled at load time only.

These findings became the skills `site-teardown`, `design-tokens`, `motion-system`,
`media-gallery`, `dashboard-builder` and `web-quality-gate`, and the agents in `.claude/agents/`.
