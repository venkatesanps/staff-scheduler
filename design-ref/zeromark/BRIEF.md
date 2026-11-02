# Style brief: zeromark.io → Staff Scheduler landing

Captured 2026-11-01 (`desktop.png`, `mobile.png`, `tokens.json` in this folder).

## Mood
Warm, editorial, calm-confident. It reads like a printed essay that happens to animate.
What makes it feel "insane":
1. **Hero confetti field.** Around 1,500 tiny rotated bars in a muted five-colour palette fill the
   viewport (canvas). A soft clearing in the centre holds the headline. The chaos is the product's "before" state.
2. **A narrative counter.** A giant monospace number ("1600 unsorted" → "1600 left" → "0 left")
   carries the scroll story from step to step and lands on zero at the CTA.
3. **Restraint.** One centred column (~640px copy), huge vertical whitespace, a single accent colour,
   and small mono "STEP ONE" kickers. Everything else is quiet, so the few effects hit hard.

## Palette (light only)
| token | hex | use |
|---|---|---|
| paper | #faf7f0 | page bg |
| card | #fffdf8 | cards |
| border | #e7e0d3 | 1px hairlines, dashed footer rule |
| ink | #1c1917 | headings |
| soft | #44403c | body |
| muted | #78716c | secondary, counter unit |
| flame | #f0472c | accent: second headline line, kickers, CTA |
| flame-dark | #d13a22 | accent text on cream (contrast) |
| confetti | #f0472c #2f6f4f #4a76a8 #a77bd0 #c9a063 | data-ish illustration only |

## Type
- Display: Akmorn Grotesque (proprietary) → **Space Grotesk 700**. 58–62px, tracking -0.03em, lh 1.04.
- Body: Space Grotesk 400, 19px / 1.7, soft colour, centred, max 640px.
- Mono: **IBM Plex Mono**. Kickers 13–14px uppercase with +0.14em tracking in flame; counters
  110px 400 with a 35px muted unit word; stats and labels.

## Layout
Centred single column; content max 860px, copy 640px; sections ~100vh apart. Hero is full
viewport with a centred logo, kicker, two-line H1 (second line flame), and a "SCROLL" mono label with a bobbing chevron.

## Surfaces
Cards: #fffdf8, 1px #e7e0d3 border, radius 14px, no shadow. Key chips: radius 7px, a 1px
border tinted by meaning, a 2px darker bottom border (keycap). Pills 999px. The CTA is a flame pill, white
700 text, with an arrow.
Background: very faint concentric rings behind sections.

## Signature effects (ranked)
1. Confetti field (canvas). In our version, the bars are **shifts** that snap into a roster grid as you scroll.
2. Counter that ticks down per step and ends at "0 left".
3. Diagrams that form: nodes pop in (scale 0 → 1.4 → 1), dashed edges draw, rows slide in.

## Motion
`rise` 14px fade-in on scroll; `pop` 0.94 → 1; node-form overshoot; dashed edge draw; chevron
bob (translateY 12px, 2s). Hover transitions 140ms ease. Honour reduced motion.

## Components
Top-right text link "Sign in →" (ours: "Open the app →"), kicker, counter, H2 + body, key chips,
light cards with mono table headers, flame pill CTA, and a footer with a dashed top rule, small muted links, and
flame underlined links.
