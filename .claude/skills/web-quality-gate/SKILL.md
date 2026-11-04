---
name: web-quality-gate
description: Verify a website or dashboard before calling it done. Takes screenshots at phone/tablet/desktop in light and dark, checks horizontal overflow, text contrast, landmarks and headings, focus visibility, reduced-motion behaviour, image dimensions and the request/byte budget, then reports pass/fail with evidence. Use after building or changing UI, or when asked to QA, audit or "check" a page.
---

# Web quality gate

```bash
node .claude/skills/web-quality-gate/scripts/gate.js <url-or-file> <outdir>
```

The argument can be a local `index.html` path or a URL. For each of 390×844, 768×1024 and
1440×900, in light and dark, the script saves a screenshot and checks the following:

| Check | Fails when |
|---|---|
| overflow | `scrollWidth > innerWidth` (horizontal page scroll) |
| contrast | a visible text node's color vs its effective background is below 4.5:1 (3:1 at ≥ 24px or ≥ 18.66px bold) |
| landmarks | no `<main>`, no `<h1>`, or more than one `<h1>` |
| images | an `<img>` has no `alt` attribute, or has no width/height (causes layout shift) |
| tap targets | on phone, a button or link is smaller than 24×24px |
| focus | Tab to the first 10 focusables; any without a visible outline or box-shadow change |
| reduced motion | animations still running more than 0.5s with `prefers-reduced-motion: reduce` |
| budget | more than 100 requests, or more than 3 MB transferred, on first load (desktop) |
| console | errors in the console |

It writes `gate.json` and prints a summary table. It exits non-zero on any failure.

Then:
1. Look at every screenshot with Read. Automated checks miss ugly, misaligned and clipped UI.
2. Fix the failures, re-run, and report the final table to the user **as it is**: say which
   checks still fail and why, and don't round failures down to "mostly passing".
