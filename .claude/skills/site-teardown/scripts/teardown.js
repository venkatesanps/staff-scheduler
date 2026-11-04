#!/usr/bin/env node
// Passive website observation: screenshots + tokens + motion + structure + network.
// Usage: node teardown.js <origin-url> <outdir> [/path ...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [origin, outdir, ...rest] = process.argv.slice(2);
if (!origin || !outdir) { console.error('usage: teardown.js <url> <outdir> [/path ...]'); process.exit(1); }
const base = new URL(origin);
const paths = rest.length ? rest : [base.pathname || '/'];
fs.mkdirSync(outdir, { recursive: true });

const VIEWPORTS = [{ n: 'desktop', w: 1440, h: 900 }, { n: 'mobile', w: 390, h: 844 }];

function collect() {
  const cs = (e) => getComputedStyle(e);
  const pick = (sel) => {
    const e = document.querySelector(sel); if (!e) return null; const c = cs(e);
    return { font: c.fontFamily, size: c.fontSize, weight: c.fontWeight, lh: c.lineHeight, ls: c.letterSpacing,
      color: c.color, bg: c.backgroundColor, radius: c.borderRadius, shadow: c.boxShadow, border: c.border };
  };
  const vars = {}; const keyframes = []; const reduced = [];
  for (const sh of document.styleSheets) {
    let rules; try { rules = sh.cssRules; } catch (e) { continue; }
    for (const r of rules) {
      if (r.selectorText && /^(:root|\.dark|html|\[data-theme)/.test(r.selectorText))
        for (const k of r.style) if (k.startsWith('--')) vars[`${r.selectorText} ${k}`] = r.style.getPropertyValue(k).trim();
      if (r.type === CSSRule.KEYFRAMES_RULE) keyframes.push(r.name);
      if (r.conditionText && /reduced-motion/.test(r.conditionText)) reduced.push(r.cssText.slice(0, 240));
    }
  }
  const transitions = new Set();
  document.querySelectorAll('a,button,input,[class*=card],article,video,img').forEach((e) => {
    const t = cs(e).transition; if (t && !/^all 0s/.test(t)) transitions.add(t.slice(0, 220));
  });
  const counts = {}; document.querySelectorAll('*').forEach((e) => { counts[e.tagName] = (counts[e.tagName] || 0) + 1; });
  return {
    title: document.title,
    styles: { h1: pick('h1'), h2: pick('h2'), body: pick('body'), button: pick('button'), navLink: pick('nav a'),
      card: pick('article,[class*=card]'), input: pick('input'), code: pick('code,pre') },
    fonts: [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,button,code')].map((e) => cs(e).fontFamily))],
    vars, keyframes: [...new Set(keyframes)].slice(0, 60), reducedMotion: reduced.slice(0, 10),
    animations: document.getAnimations().slice(0, 40).map((a) => {
      const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : {};
      return { name: a.animationName || a.transitionProperty || a.constructor.name, duration: t.duration, easing: t.easing, iterations: t.iterations };
    }),
    transitions: [...transitions].slice(0, 20),
    headings: [...document.querySelectorAll('h1,h2,h3')].slice(0, 30).map((h) => `${h.tagName}: ${h.innerText.trim().slice(0, 90)}`),
    landmarks: [...document.querySelectorAll('header,nav,main,aside,footer,section,dialog,[role]')].slice(0, 50)
      .map((e) => e.tagName + (e.getAttribute('role') ? `[${e.getAttribute('role')}]` : '') + (e.getAttribute('aria-label') ? ` "${e.getAttribute('aria-label')}"` : '')),
    media: {
      videos: document.querySelectorAll('video').length, images: document.images.length,
      videoAttrs: [...document.querySelectorAll('video')].slice(0, 5).map((v) => ({ autoplay: v.autoplay, muted: v.muted, loop: v.loop, playsinline: v.playsInline, preload: v.preload, poster: !!v.poster })),
      lazyImages: [...document.images].filter((i) => i.loading === 'lazy').length,
    },
    scripts: [...document.scripts].map((s) => s.src).filter(Boolean).map((s) => s.split('/').pop()).slice(0, 200),
    modulePreloads: [...document.querySelectorAll('link[rel=modulepreload]')].map((l) => l.href.split('/').pop()).slice(0, 200),
    meta: Object.fromEntries([...document.querySelectorAll('meta[name],meta[property]')].map((m) => [m.name || m.getAttribute('property'), (m.content || '').slice(0, 120)])),
    counts: Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20)),
    pageHeight: document.documentElement.scrollHeight,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  };
}

(async () => {
  const browser = await chromium.launch();
  const report = { origin: base.origin, capturedAt: new Date().toISOString(), pages: {}, limits: [
    'Public, logged-out pages only; server logic and authenticated states are unknown.',
    'Animations list only what was running at capture time.',
    'Cross-origin stylesheets may hide their rules (CORS); missing vars are unknown, not absent.',
  ] };
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, colorScheme: 'dark' });
    for (const p of paths) {
      const page = await ctx.newPage(); const net = [];
      page.on('response', (r) => net.push({ url: r.url(), status: r.status(), type: r.request().resourceType() }));
      let navError = null;
      try { await page.goto(new URL(p, base).href, { waitUntil: 'networkidle', timeout: 45000 }); } catch (e) { navError = e.message.split('\n')[0]; }
      await page.waitForTimeout(1200);
      const slug = (p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root');
      await page.screenshot({ path: path.join(outdir, `${vp.n}-${slug}.png`) }).catch(() => {});
      if (vp.n === 'desktop') await page.screenshot({ path: path.join(outdir, `full-${slug}.png`), fullPage: true }).catch(() => {});
      const info = await page.evaluate(collect).catch((e) => ({ error: e.message }));
      info.navError = navError;
      info.network = {
        total: net.length,
        byType: net.reduce((a, x) => ((a[x.type] = (a[x.type] || 0) + 1), a), {}),
        hosts: [...new Set(net.map((x) => new URL(x.url).host))],
        errors: net.filter((x) => x.status >= 400).slice(0, 15).map((x) => `${x.status} ${x.url.slice(0, 120)}`),
      };
      report.pages[`${vp.n} ${p}`] = info;
      await page.close();
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(outdir, 'report.json'), JSON.stringify(report, null, 1));
  await browser.close();
  console.log(`wrote ${outdir}/report.json and ${paths.length * 3} screenshots`);
})();
