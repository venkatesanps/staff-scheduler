---
name: dashboard-builder
description: Design and build data dashboards that read at a glance: KPI tiles, charts, tables, filters, loading/empty/error states, responsive density, light and dark. Use when building an admin panel, analytics page, metrics view, roster/schedule overview, ops console or any page whose job is to show data. Pairs with design-tokens, motion-system and the dataviz skill.
---

# Dashboard builder

A dashboard answers three questions, in this order: **Is anything wrong? What changed? Where
do I look next?** Lay it out to match.

## 1. Plan before pixels

Write down:
- The user and the decision they make with this page
- 3–5 headline metrics: each one has a value, a comparison (vs last period or target) and a
  direction that counts as good
- Supporting views: trend, breakdown, the detail table
- Filters that apply to the whole page (date range, segment) and their default

## 2. Layout

```
header: title · date range · segment filter · refresh/last-updated · export
row 1:  KPI tiles (3–5), equal width
row 2:  primary trend chart (2/3)  |  breakdown or alerts (1/3)
row 3:  detail table (sortable, sticky header, row → drill-down)
```

- Use a 12-column grid, `gap: 12–16px`, and a max width of about 1440px. Phones get one
  column, with KPIs in a 2×N grid.
- Density: tables use 36–40px rows, with 32px available as a compact option. Card padding is
  16px.
- Put alerts and exceptions above the fold, in `--destructive`/warning tints. Don't wait for
  someone to spot them in a chart.

## 3. KPI tile

```
Label (14px muted)                 [i]
12,480          ▲ 8.2%  vs last wk     ← value 28–32px tabular-nums, delta colored by *good/bad*, not up/down
▁▂▃▅▃▆▇  sparkline (no axes)
```

Animate the value with a number tween on first load only (see `motion-system`). Respect
reduced motion.

## 4. Charts

- Follow the `dataviz` skill for form choice, palette and validation. Its defaults: line for
  trends, bars for comparisons, never pie charts with more than 3 slices, and direct labels
  instead of legends where possible.
- Chart colors come from `--chart-1…5`. A neutral ramp plus one accent for the series that
  matters is often clearer than five hues.
- Every chart has a title that states the takeaway ("Weekend coverage fell 2 shifts"), a
  hover tooltip with exact values and a text/table alternative.
- Hand-rolled SVG is fine for small, static charts. For interactive ones, use a pinned
  library version (Chart.js, ECharts, Recharts, Observable Plot).

## 5. States (every widget)

| State | Show |
|---|---|
| Loading | skeleton the shape of the content, using a shimmer sweep, never a spinner in every card |
| Empty | what would appear, why it's empty, and the action that fills it |
| Error | what failed, retry, and the last good value with a timestamp |
| Stale | "Updated 12 min ago" turning amber after the expected refresh interval |

## 6. Tables

Give tables a sticky header, right-aligned numbers, sortable columns with `aria-sort`, row hover,
a keyboard-reachable row action, client-side filtering under ~2k rows, CSV export, and
horizontal scroll *inside* the table on small screens (never the page).

## 7. Verify

Run `web-quality-gate` at 390, 768 and 1440 widths in light and dark, then fill each widget
with real or realistic data, including very long labels, zeros and negative deltas.
