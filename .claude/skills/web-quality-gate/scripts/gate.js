#!/usr/bin/env node
// Automated UI quality gate. Usage: node gate.js <url|file.html> <outdir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [target, outdir] = process.argv.slice(2);
if (!target || !outdir) { console.error('usage: gate.js <url|file.html> <outdir>'); process.exit(1); }
const url = /^https?:/.test(target) ? target : 'file://' + path.resolve(target);
fs.mkdirSync(outdir, { recursive: true });

const VIEWPORTS = [{ n: 'phone', w: 390, h: 844 }, { n: 'tablet', w: 768, h: 1024 }, { n: 'desktop', w: 1440, h: 900 }];

function audit(isPhone) {
  const parse = (c) => { const m = c.match(/[\d.]+/g); return m ? m.slice(0, 4).map(Number) : null; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const toRgb = (c) => { // resolve any CSS color (incl. oklch) via canvas
    const cv = document.createElement('canvas'); cv.width = cv.height = 1; const x = cv.getContext('2d');
    x.fillStyle = '#000'; x.fillStyle = c; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255];
  };
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) { const c = toRgb(getComputedStyle(e).backgroundColor); if (c[3] > 0.5) return c; if (getComputedStyle(e).backgroundImage !== 'none') return null; }
    return toRgb(getComputedStyle(document.body).backgroundColor);
  };
  const issues = { contrast: [], images: [], tapTargets: [] };
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode() && issues.contrast.length < 15) {
    const t = walker.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    const bg = bgOf(el); if (!bg) continue; // over image/gradient: unknown, skip
    const fg = toRgb(cs.color); const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize); const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    if (ratio < (large ? 3 : 4.5)) issues.contrast.push(`${ratio.toFixed(2)}:1 "${t.textContent.trim().slice(0, 40)}"`);
  }
  document.querySelectorAll('img').forEach((i) => {
    if (!i.hasAttribute('alt')) issues.images.push('no alt: ' + (i.src || '').slice(-60));
    if (!i.getAttribute('width') && !i.style.width && !i.getAttribute('height')) issues.images.push('no size: ' + (i.src || '').slice(-60));
  });
  if (isPhone) document.querySelectorAll('button,a[href],input,select,[role=button]').forEach((e) => {
    const r = e.getBoundingClientRect(); if (r.width && r.height && (r.width < 24 || r.height < 24) && issues.tapTargets.length < 15)
      issues.tapTargets.push(`${Math.round(r.width)}×${Math.round(r.height)} ${(e.innerText || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 30)}`);
  });
  return {
    overflow: document.documentElement.scrollWidth > innerWidth,
    main: !!document.querySelector('main'), h1: document.querySelectorAll('h1').length,
    ...issues,
  };
}

(async () => {
  const browser = await chromium.launch();
  const results = []; let fail = false;
  for (const scheme of ['light', 'dark']) for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, colorScheme: scheme });
    const page = await ctx.newPage(); const errors = []; let bytes = 0, reqs = 0;
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
    page.on('response', async (r) => { reqs++; const l = +r.headers()['content-length'] || 0; bytes += l; });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => errors.push('nav: ' + e.message.split('\n')[0]));
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outdir, `${scheme}-${vp.n}.png`) });
    const a = await page.evaluate(audit, vp.n === 'phone');
    // focus visibility
    const focusMissing = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const c = getComputedStyle(e);
        const vis = (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) || c.boxShadow !== 'none';
        return { vis, name: (e.innerText || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 30) }; });
      if (f && !f.vis) focusMissing.push(f.name);
    }
    const r = { scheme, viewport: vp.n, ...a, focusMissing, consoleErrors: errors, requests: reqs, kb: Math.round(bytes / 1024) };
    r.fails = [];
    if (a.overflow) r.fails.push('overflow');
    if (!a.main || a.h1 !== 1) r.fails.push('landmarks');
    if (a.contrast.length) r.fails.push('contrast');
    if (a.images.length) r.fails.push('images');
    if (a.tapTargets.length) r.fails.push('tap-targets');
    if (focusMissing.length) r.fails.push('focus');
    if (errors.length) r.fails.push('console');
    if (vp.n === 'desktop' && (reqs > 100 || bytes > 3 * 1024 * 1024)) r.fails.push('budget');
    results.push(r); if (r.fails.length) fail = true;
    await ctx.close();
  }
  // reduced motion
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); await p.goto(url, { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(700);
  const running = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && ((a.effect.getTiming().duration || 0) > 500 || a.effect.getTiming().iterations === Infinity)).length);
  await ctx.close(); await browser.close();
  const rm = { check: 'reduced-motion', longOrInfiniteAnimationsRunning: running, fail: running > 0 }; if (rm.fail) fail = true;
  fs.writeFileSync(path.join(outdir, 'gate.json'), JSON.stringify({ url, results, reducedMotion: rm }, null, 1));
  console.log('scheme  viewport  fails');
  for (const r of results) console.log(`${r.scheme.padEnd(7)} ${r.viewport.padEnd(9)} ${r.fails.join(', ') || 'PASS'}`);
  console.log(`reduced-motion: ${rm.fail ? `FAIL (${running} animations still running)` : 'PASS'}`);
  console.log(`details: ${path.join(outdir, 'gate.json')}`);
  process.exit(fail ? 1 : 0);
})();
