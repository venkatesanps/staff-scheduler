---
name: design-tokens
description: Set up or fix a semantic design-token system (color, radius, depth, type) that works in light and dark mode. Uses OKLCH semantic roles (background/foreground/card/muted/primary/ring/chart-N), layered surface shadows and tactile "raised" buttons. Use when starting a website or dashboard, when colors are hard-coded, when dark mode looks off, or after a site-teardown turned up a palette worth adapting.
---

# Design tokens

Good modern sites (the shadcn/Tailwind v4 lineage, seen e.g. in a 2026 teardown of motionvideo.xyz)
share one structure: **a small set of semantic roles, defined twice (light, dark), consumed
everywhere**. Components never name a raw color.

## 1. The roles

Define these on `:root` and redefine them for dark. Use OKLCH: lightness is perceptual, so
"one step lighter" means the same thing at every hue.

| Role | Light | Dark | Used for |
|---|---|---|---|
| `--background` / `--foreground` | `oklch(100% 0 0)` / `oklch(14.5% 0 0)` | `oklch(14.5% 0 0)` / `oklch(98.5% 0 0)` | page |
| `--card` | = background | `oklch(20.5% 0 0)` | raised surfaces (one step up in dark) |
| `--muted` / `--muted-foreground` | `97%` / `55.6%` | `26.9%` / `70.8%` | chips, secondary text |
| `--border` / `--input` | `oklch(92.2% 0 0)` | `oklch(100% 0 0 / .1)` / `/ .15` | hairlines: **alpha white in dark**, not grey |
| `--primary` / `--primary-foreground` | one saturated accent | slightly darker, less chroma | the single CTA color |
| `--ring` | = primary | = primary | focus rings |
| `--destructive` | `oklch(57.7% .245 27)` | `oklch(70.4% .19 22)` | errors |
| `--chart-1…5` | neutral ramp or 5 hues | same | data only, never UI chrome |
| `--radius` | `.45rem`–`.75rem` | same | derive `sm/md/lg` with calc |

Rules:
- **One accent.** Everything else stays neutral (chroma ≈ 0). The accent is reserved for the primary
  action, the active filter chip and the focus ring, so it always means "this one".
- Dark mode is **not inverted light mode**. Surfaces get *lighter* as they rise, borders become
  translucent white, and the accent drops a few points of lightness and chroma.
- Every foreground/background pair must hit WCAG AA (4.5:1 text, 3:1 large text and UI). Check
  with `web-quality-gate`.

## 2. Theme switching

```css
:root { color-scheme: light; --background: oklch(100% 0 0); /* … */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; /* dark values */ } }
:root[data-theme="dark"] { color-scheme: dark; /* dark values */ }
body { background: var(--background); color: var(--foreground); }
```

Add `<meta name="color-scheme" content="light dark">` so form controls and scrollbars match.

## 3. Depth: two shadow tokens

Flat fills with **composite shadows** feel more physical than one big blur:

```css
--surface-outline: 0 0 0 .5px oklch(0% 0 0 / .08), 0 1px 1px -1px oklch(0% 0 0 / .2), 0 2px 4px -2px oklch(0% 0 0 / .08);
--surface-lift:    0 12px 32px -8px oklch(0% 0 0 / .18);
/* dark */
--surface-outline: 0 0 0 1px oklch(100% 0 0 / .12), 0 1px 2px oklch(0% 0 0 / .4);
--surface-lift:    0 12px 32px -8px oklch(0% 0 0 / .6);
```

The outline replaces borders on cards. Lift is for popovers, menus and hovered cards only.

## 4. Raised (tactile) buttons

A button that looks pressable: a `::before` layer with an inset top highlight, a soft inner
gradient and a dark contact edge. Parametrize it so every variant reuses one recipe:

```css
.raise { position: relative; isolation: isolate; }
.raise::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
  background: var(--raise-fill);
  box-shadow: inset 0 1px 0 var(--raise-lip), inset 0 -1px 0 var(--raise-shade), 0 0 0 1px var(--raise-edge), 0 1px 2px var(--raise-contact); }
.raise:hover::before { filter: brightness(1.06); }
.raise:active::before { box-shadow: inset 0 1px 2px var(--raise-contact), 0 0 0 1px var(--raise-edge); }
.raise-primary { --raise-fill: var(--primary); --raise-lip: #fff9; --raise-shade: #0002; --raise-edge: #0006; --raise-contact: #0003; }
.raise-secondary { --raise-fill: var(--secondary); --raise-lip: #ffffff1f; --raise-shade: transparent; --raise-edge: #0008; --raise-contact: #0003; }
```

Status variants (info/warning/success/danger) are the same recipe with a dark tinted fill.

## 5. Type tokens

- One family is enough for UI and display; add a mono for numbers, code and timestamps.
- Scale: 12 / 14 (UI) / 16 (body) / 20 / 24 (page h1 in an app) / 32–64 (marketing display).
- Headings ≥ 24px: weight 600, tracking `-0.025em`. Body: 16/24. UI controls: 14/20, weight 500.
- Tabular numbers in dashboards: `font-variant-numeric: tabular-nums`.

## Output

Write the tokens into one `tokens.css` (or the `:root` block of a single-file app), then grep
for raw hex/rgb inside components and replace each with a role.
