---
name: site-teardown
description: Reverse-engineer how a live website is built, from evidence rather than guesses. Passively observes a public site in a headless browser and reports its stack, design tokens, type, motion, layout, media strategy, accessibility structure and network budget, each claim with its evidence and limits. Use when the user says "how is X built", "reverse engineer this site", "tear down", or wants to learn techniques from a site before building their own website or dashboard.
---

# Site teardown

The method follows REA (github.com/morluto/rea): **passive observation, bounded evidence, explicit
unknowns**. Every conclusion names what it was seen in. When something wasn't observed, the report
says "unknown"; it never says "absent".

## Scope and ethics

- Observe only public pages a normal visitor can load. Never log in, bypass paywalls, bot
  protection or rate limits. Don't fetch "Pro" or paid content.
- You are learning **techniques** (token structure, timing, layout systems), not taking assets.
  Never copy the site's copy, logo, images, video, fonts or proprietary source into the user's
  project.
- Screenshots and captures go in the scratchpad or `design-ref/<name>/` (PNGs there are
  gitignored).

## 1. Capture

```bash
node .claude/skills/site-teardown/scripts/teardown.js <url> <outdir> [/path1 /path2 ...]
```

For each path, at desktop (1440×900) and mobile (390×844), dark scheme, the script writes:
viewport and full-page PNGs, plus `report.json` with:

- **Tokens**: CSS custom properties on `:root`/`.dark`/`html`, and computed styles of h1/h2/body/
  button/nav link/card/input
- **Motion**: running animations (name, duration, easing), distinct `transition` values, and
  `prefers-reduced-motion` rules
- **Structure**: headings, landmarks and ARIA roles, element counts, horizontal overflow, page height
- **Media**: video attributes (autoplay/muted/loop/playsinline/preload/poster), image count
- **Network**: requests by type, third-party hosts, 4xx/5xx responses
- **Stack fingerprints**: script chunk names, meta generator, global hints

Then look at **every** screenshot with Read. Values tell you *what*; pixels tell you *how it composes*.

Optional probes (write them as small Playwright snippets in the scratchpad):
- hover a card and check whether its `<video>` starts playing (hover-to-play)
- press Ctrl/⌘+K and check for a `[role=dialog]` (command palette)
- scroll to the bottom and count new `article`s (infinite scroll or pagination)

## 2. Infer the stack (with confidence)

Read chunk filenames and hosts in `report.json`:

| Evidence | Likely |
|---|---|
| `createServerFn`, `lazyRouteComponent`, `matchContext` | TanStack Start / Router |
| `_next/static` | Next.js |
| `AnimatePresence` chunk | Motion (framer-motion) |
| `--tw-*` vars, `oklch(...)` shadcn names (`--card`, `--ring`, `--chart-1`) | Tailwind v4 + shadcn/ui tokens |
| `CompositeList`, `getPseudoElementBounds` | Base UI primitives |
| `posthog`, `cloudflareinsights` | product analytics / RUM |
| `::view-transition-*` rules | View Transitions API |

Mark each as **observed** (direct evidence), **inferred** (fingerprint) or **unknown**.

## 3. Write the teardown

Write `design-ref/<name>/TEARDOWN.md`:

1. **Stack**: framework, styling, motion library, analytics, CDN (with confidence)
2. **Tokens**: the semantic palette in light and dark, radius, the shadow recipes
3. **Type**: families, scale, weights, tracking, line heights
4. **Layout**: grid, columns per breakpoint, intro/hero composition, density
5. **Motion**: durations, easing curves, signature effects, reduced-motion handling
6. **Media and performance**: lazy strategy, request budget, heaviest asset types
7. **Interaction patterns**: search, filters, hover states, dialogs
8. **Take / leave**: 5–10 techniques worth adopting, and what to avoid
9. **Limits**: what this capture could not see (logged-in states, paid pages, server logic)

Hand the "take" list to `design-tokens`, `motion-system`, `media-gallery` or `dashboard-builder`.

## Network blocked?

If the host is unreachable (DNS failure, proxy 403), say so and ask for screenshots or for the domain
to be allowed in the environment's network settings. Never describe a site you couldn't load.
