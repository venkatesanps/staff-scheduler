---
name: motion-system
description: Add purposeful UI motion to a website or dashboard (durations, easing curves, named motion moves, hover and enter/exit transitions, view transitions) that respects prefers-reduced-motion and stays cheap to render. Use when a UI feels static or janky, when adding animations, page transitions or hover effects, or when the user asks for something to "feel alive", "smoother" or "more premium".
---

# Motion system

Motion should explain change: where something came from, what it is now, what you can do next.
Decoration comes last. Give motion tokens the same treatment as colour tokens: a few named
values, used everywhere.

## 1. Tokens

```css
:root {
  --dur-instant: 100ms;  /* press feedback */
  --dur-fast: 150ms;     /* colour, bg, border on hover */
  --dur-base: 220ms;     /* popovers, menus, chips */
  --dur-slow: 360ms;     /* panels, page sections */
  --ease-standard: cubic-bezier(.4, 0, .2, 1);   /* general state change */
  --ease-out: cubic-bezier(.23, 1, .32, 1);       /* entrances: fast start, long settle */
  --ease-in: cubic-bezier(.55, 0, 1, .45);        /* exits */
  --ease-spring: linear(0, .5 7%, 1.04 19%, .99 27%, 1);  /* overshoot and settle */
}
```

Use them in practice like this:
- Hover colour changes: `transition: color, background-color, border-color var(--dur-fast) var(--ease-out)`.
  Name the properties; never use `transition: all`.
- Entrances use `--ease-out`, exits use `--ease-in` and run about 30% shorter than the entrance.
- Animate only `transform`, `opacity`, `filter` and `clip-path`. Never animate width, height,
  top or left.

## 2. Named moves

These are classic animation principles, adapted to UI. Ask for them by name:

| Move | UI use | Recipe |
|---|---|---|
| Ease-out entrance | cards, toasts | `opacity 0→1`, `translateY(8px)→0`, `--dur-base --ease-out` |
| Staggered timing | grids, list rows, KPI tiles | same entrance, `animation-delay: calc(var(--i) * 40ms)`, cap at 8 items |
| Overshoot and settle | toggles, selected chip, badge count | `--ease-spring` on scale 0.96→1 |
| Anticipation | destructive confirm, drag start | scale 1→0.97 for 80ms, then the action |
| Follow-through | drawers, sheets | panel and its content offset by 40–60ms |
| Slow in and slow out | progress, value tween | `--ease-standard` |
| Number tween | dashboard KPIs | count up over 600ms with ease-out, tabular-nums |
| Line mask reveal | marketing headline | `clip-path: inset(0 0 100% 0)` → `inset(0)` per line |
| Text scramble | data refresh labels | random glyphs settle left→right over ~400ms |
| Moving hold | looped hero | tiny 1–2px drift so a "still" frame doesn't freeze |
| Shimmer / skeleton sweep | loading | gradient `background-position` sweep, 1.4s linear infinite |
| Live ping | "N online", live data dot | `animate-ping` ring at 1s behind a solid dot |

## 3. Patterns

- **Hover-to-play media**: `<video muted loop playsinline preload="none" poster>`. Call `play()`
  on pointerenter (or when it enters the viewport on touch screens) and `pause()` on leave.
- **Route and view changes**: `document.startViewTransition(update)`, plus a
  `view-transition-name` on the shared element (a card's thumbnail becomes the detail hero).
- **Presence**: in React, use Motion's `AnimatePresence` for exit animations. In vanilla code,
  add the exit class, wait for `animationend`, then remove the element.
- **Scroll**: CSS `animation-timeline: view()` for reveal-on-scroll. Use IntersectionObserver as
  the fallback. Never use a scroll listener.

## 4. Reduced motion (required)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important; }
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
  .shimmer { background-image: none; }
}
```

Keep the *information*: crossfade instead of slide, show final numbers instead of tweening,
and don't autoplay video.

## 5. Check it

- Record a 60fps trace or screenshot sequence with Playwright. Nothing should take longer than
  `--dur-slow` unless it is a loop.
- Run `web-quality-gate` with reduced motion on and off.
