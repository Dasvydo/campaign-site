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
  ['each thing it promises about accuracy', '#who .who-accuracy-list li'],
  ['the price band', '#price'],
  ['the package cards', '#price [data-price-pkg]'],
  ['where a firm too small is sent', '#price .price-pkgs-under a'],
  ['the calculator', '#numbers .numbers-beats'],
  ['the figure it ends on', '#numbers .numbers-keep'],
  ['its controls', '#numbers input[type="range"]'],
  /* The heading block carries `id="fit"`; the form is a sibling. Checking
     `#fit` alone passed while the form itself was invisible. */
  ['the fit check', '#fit'],
  ['the form inside it', '.qualifier-sheet form'],
  ['its first question', '.qualifier-chips'],
  ['and an answer to press', '.qualifier-chip'],
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
          /* Every match, not the first one. A verifier hid the SECOND package
             card and the second, third and fourth calculator controls and this
             gate never looked at them, because it asked querySelector. */
          const all = Array.from(document.querySelectorAll(sel));
          if (all.length === 0) { out[label] = 'not in the document'; continue; }
          const problems = [];
          for (const el of all) {
          /* Scroll it in: something below the fold is still visible to a
             reader, and we are asking whether it renders, not where. */
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (cs.display === 'none') { problems.push('display:none'); continue; }
          if (cs.visibility === 'hidden') { problems.push('visibility:hidden'); continue; }
          /* Not `=== 0`. A verifier put the whole price band at 2% and this
             gate called it visible. Anything under a tenth is not on screen
             in any sense a reader would recognise. */
          if (Number(cs.opacity) < 0.1) { problems.push(`opacity:${cs.opacity}`); continue; }
          if (r.width < 1 || r.height < 1) { problems.push(`${Math.round(r.width)}x${Math.round(r.height)}`); continue; }
          /* Type too small to read. A verifier set the calculator's answer to
             font-size 0 and the box survived, because a nested span carried
             its own size. */
          if ((el.textContent || '').trim() && parseFloat(cs.fontSize) < 6) {
            problems.push(`font-size:${cs.fontSize}`); continue;
          }
          /* Off screen sideways. A box of the right size at x = -11838 passed
             every check this file used to make. */
          if (r.right < 0 || r.left > window.innerWidth) { problems.push(`at x ${Math.round(r.left)}`); continue; }
          /* Clipped to nothing while keeping its box. */
          if (cs.clipPath && cs.clipPath !== 'none' && /inset\(\s*(100%|50%\s+50%)/.test(cs.clipPath)) {
            problems.push(`clip-path:${cs.clipPath}`); continue;
          }
          /* Type the same colour as what is behind it. Walks up for the first
             painted background, because a transparent element inherits one. */
          const ink = cs.color;
          let bgEl = el, bg = 'rgba(0, 0, 0, 0)';
          while (bgEl && bg === 'rgba(0, 0, 0, 0)') {
            bg = getComputedStyle(bgEl).backgroundColor;
            bgEl = bgEl.parentElement;
          }
          const rgb = (v) => (v.match(/[\d.]+/g) || []).map(Number);
          const [ir, ig, ib, ia = 1] = rgb(ink);
          const [br, bgc, bb] = rgb(bg);
          if (ia === 0) { problems.push('text is transparent'); continue; }
          if (br !== undefined && Math.abs(ir - br) + Math.abs(ig - bgc) + Math.abs(ib - bb) < 24) {
            problems.push(`text ${ink} on ${bg}`); continue;
          }
          /* Something painted over it. */
          const top = document.elementFromPoint(
            Math.min(window.innerWidth - 2, Math.max(2, r.left + r.width / 2)),
            Math.min(window.innerHeight - 2, Math.max(2, r.top + r.height / 2)),
          );
          /* Not `&& !top.contains(el)`. A verifier laid an opaque sheet over
             three whole sections with `::after`, and elementFromPoint returns
             the sheet's ORIGINATING element, which is an ancestor, so
             excusing ancestors excused exactly the attack. The topmost thing
             over the middle of a content block should be that block or
             something inside it. */
          if (top && top !== el && !el.contains(top)) {
            problems.push(`covered by ${top.tagName.toLowerCase()}.${(top.className || '').toString().split(' ')[0]}`);
            continue;
          }
          }
          out[label] = problems.length
            ? `${problems.length} of ${all.length}: ${problems[0]}`
            : `ok ${all.length}`;
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
