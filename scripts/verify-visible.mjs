/**
 * Is the page actually on the screen?
 *
 * This file exists because an independent verifier appended one line to the
 * stylesheet:
 *
 *     #price,#numbers{display:none}
 *
 * and then ran everything this repository has. `npm run verify` exited 0. The
 * build exited 0. Both browser gates exited 0. The whole workflow was green on
 * a page with no prices and no calculator on it.
 *
 * The reason is structural, and worth stating plainly because it applies to
 * every check written here before today. `harness-page.tsx` renders the real
 * components in jsdom, which has no layout and no CSS, so it can prove a node
 * is in the tree and can never prove a reader can see it. The two browser gates
 * that do have layout look at the consent sheet and at the worked example. That
 * left the hero, the audience folders, the price band and the calculator with
 * no gate that had ever loaded a stylesheet.
 *
 * So this asks the narrow question the others cannot: for each part of the page
 * the argument needs, does it occupy a box a person could look at. Not "is it
 * pretty", not "is it in the right place" — visible, non-zero, not clipped away
 * and not transparent. That is a low bar on purpose. It is also the bar the
 * suite was failing to clear.
 *
 * Needs a built site being served, and playwright-core with a Chromium. Same
 * optional-tooling footing as the other two browser gates.
 *
 *   npm run build && npx vite preview --port 4318 --host 127.0.0.1 &
 *   node scripts/verify-visible.mjs http://127.0.0.1:4318
 */
import { chromium } from 'playwright-core';
import { launchOptions } from './chromium.mjs';

const BASE = process.argv[2];
if (!BASE) {
  console.error('usage: node scripts/verify-visible.mjs <served-url>');
  process.exit(2);
}

/* The sections the page's argument is made of, and for each one the thing
   inside it that carries the argument. A section that renders as an empty box
   would satisfy a check on the section alone. */
const PARTS = [
  ['the hero headline', '#hero h1'],
  ['the drafted reply in the hero', '#hero .hero-deal'],
  ['the worked example', '#demo .demo-beats'],
  ['the draft it writes back', '#demo-draft'],
  ['who it is for', '#who .who-accuracy'],
  ['the price band', '#price'],
  ['the package cards', '#price [data-price-pkg]'],
  ['the calculator', '#numbers .numbers-beats'],
  ['its controls', '#numbers input[type="range"]'],
  ['the fit check', '#fit'],
];

const VIEWPORTS = [['desktop', 1440, 900], ['phone', 390, 844]];
const LOCALES = ['', 'da', 'lt'];

let failures = 0;
const check = (ok, label, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures += 1;
};

const browser = await chromium.launch(launchOptions({ args: ['--no-sandbox'] }));

try {
  for (const [vname, width, height] of VIEWPORTS) {
    console.log(`\n${vname} ${width}x${height}`);
    for (const loc of LOCALES) {
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage();
      await ctx.route('**://*.facebook.*/**', (r) => r.abort());
      await ctx.route('**://*.posthog.*/**', (r) => r.abort());
      await page.goto(`${BASE}/${loc}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#demo .demo-sw', { timeout: 15000 });
      /* Answer the consent notice: it covers the bottom of narrow viewports
         and several things below would be behind it. */
      await page.getByRole('button', { name: /accept|acceptér|sutinku|priimti/i })
        .first().click().catch(() => {});
      await page.waitForTimeout(400);

      const seen = await page.evaluate((parts) => {
        const out = {};
        for (const [label, sel] of parts) {
          const el = document.querySelector(sel);
          if (!el) { out[label] = 'not in the document'; continue; }
          /* Scroll it in: something below the fold is still visible to a
             reader, and we are asking whether it renders, not where. */
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (cs.display === 'none') { out[label] = 'display:none'; continue; }
          if (cs.visibility === 'hidden') { out[label] = 'visibility:hidden'; continue; }
          if (Number(cs.opacity) === 0) { out[label] = 'opacity:0'; continue; }
          if (r.width < 1 || r.height < 1) { out[label] = `${Math.round(r.width)}x${Math.round(r.height)}`; continue; }
          out[label] = `ok ${Math.round(r.width)}x${Math.round(r.height)}`;
        }
        return out;
      }, PARTS);

      const bad = Object.entries(seen).filter(([, v]) => !String(v).startsWith('ok'));
      check(bad.length === 0, `  /${loc || 'en'}: every part of the argument occupies a box`,
        bad.length ? bad.map(([k, v]) => `${k}: ${v}`).join(' | ') : `${PARTS.length} parts`);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}

console.log(failures === 0 ? '\nTHE PAGE IS ON THE SCREEN\n' : `\n${failures} CHECK(S) FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
