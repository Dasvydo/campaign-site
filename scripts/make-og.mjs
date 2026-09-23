/**
 * The share card, one per locale.
 *
 * Every page carried og:title, og:description, og:type, og:url and
 * twitter:card=summary_large_image, and no image at all. A large-image card
 * with no image does not fall back to a neat small card on every surface; on
 * LinkedIn and Slack it unfurls as a bare line of text, and on Facebook it
 * picks whatever raster it can scrape, which on this site is nothing. Ads
 * point here, so the first thing a share shows was a blank.
 *
 * The card is generated rather than drawn so it cannot drift from the page:
 * the headline, the marked word and the setup line are read straight out of
 * src/content/*.ts at build time, in the page's own two typefaces, loaded from
 * the same self-hosted woff2 files the site ships. Change the hero copy and
 * `npm run og` redraws all three.
 *
 * Run it after changing hero copy or the palette:  npm run og
 */
import { chromium } from 'playwright-core';
import { launchOptions } from './chromium.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* The content files are TypeScript, and this script is a plain node module.
   Rather than add a compile step for three strings, pull the four title slots
   and the setup line out of the source. A miss throws instead of drawing a
   card with a blank headline. */
function copyFor(locale) {
  const src = readFileSync(resolve(root, `src/content/${locale}/hero.ts`), 'utf8');
  const slot = (name) => {
    const m = src.match(new RegExp(`${name}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
    if (!m) throw new Error(`${locale}/hero.ts: no ${name} in the hero title`);
    return m[1].replace(/\\'/g, "'");
  };
  const block = src;
  const title = block.slice(block.indexOf('title: {'), block.indexOf('pileAlt'));
  const t = (name) => {
    const m = title.match(new RegExp(`${name}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
    if (!m) throw new Error(`${locale}/hero.ts: no ${name} in the hero title`);
    return m[1].replace(/\\'/g, "'");
  };
  const clockOut = slot('clockOut');
  return {
    before: t('before'),
    mark: t('mark'),
    mid: t('mid') + clockOut + t('after'),
    /* Indent-agnostic, and it THROWS. It used to require exactly four spaces
       with the string on the same line, and to fall back to '' on a miss. The
       content split moved this key to two spaces with the string on the next
       line, so the match stopped working, the fallback swallowed it, and this
       script went on printing "Three cards written to public/." and exiting 0
       while drawing three cards with no sub-headline at all. The four title
       slots above throw on a miss; there was no reason for this one not to. */
    setup: (() => {
      const m = block.match(/\n\s*setup:\s*'((?:[^'\\]|\\.)*)'/);
      if (!m) throw new Error(`${locale}/hero.ts: no setup line found`);
      return m[1].replace(/\\'/g, "'");
    })(),
  };
}

const font = (file) =>
  'data:font/woff2;base64,' + readFileSync(resolve(root, 'public/fonts', file)).toString('base64');

/* Latin-ext as well as latin: Lithuanian needs it for "laiskø" and the rest,
   and a missing range renders as a fallback face rather than as tofu, which is
   the kind of wrong that passes a glance. */
const FACES = [
  ['Playfair Display', 400, 'playfair-display-latin-400-normal.woff2', 'U+0000-024F'],
  ['Playfair Display', 400, 'playfair-display-latin-ext-400-normal.woff2', 'U+0100-024F'],
  ['Playfair Display', 600, 'playfair-display-latin-600-normal.woff2', 'U+0000-024F'],
  ['Playfair Display', 600, 'playfair-display-latin-ext-600-normal.woff2', 'U+0100-024F'],
  ['DM Sans', 400, 'dm-sans-latin-400-normal.woff2', 'U+0000-024F'],
  ['DM Sans', 400, 'dm-sans-latin-ext-400-normal.woff2', 'U+0100-024F'],
  ['DM Sans', 500, 'dm-sans-latin-500-normal.woff2', 'U+0000-024F'],
  ['DM Sans', 500, 'dm-sans-latin-ext-500-normal.woff2', 'U+0100-024F'],
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function html(c) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${FACES.map(([f, w, file, range]) => `@font-face{font-family:'${f}';font-weight:${w};font-style:normal;font-display:block;src:url(${font(file)}) format('woff2');unicode-range:${range}}`).join('\n')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
body{
  background:#fff0e5; color:#251d18;
  font-family:'DM Sans',sans-serif;
  padding:72px 80px; display:flex; flex-direction:column; justify-content:space-between;
  position:relative; overflow:hidden;
}
/* The same paper fibre the hero lays over its background, at the same
   opacity. Without it the card is a flat block of cream and reads as a
   placeholder. */
body::before{
  content:""; position:absolute; inset:0; pointer-events:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.74 .88' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .42 0 0 0 0 .35 0 0 0 0 .30 0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>");
}
.wrap{position:relative; display:contents}
.kicker{
  font-size:19px; font-weight:500; letter-spacing:.16em; text-transform:uppercase;
  color:#70635c;
}
h1{
  font-family:'Playfair Display',serif; font-weight:400;
  font-size:66px; line-height:1.14; letter-spacing:-.01em;
  max-width:19ch;
}
/* The headline's marked word, drawn the way the page draws it: an amber wash
   sitting behind the baseline, not a highlighter rectangle. */
.mark{position:relative; white-space:nowrap}
.mark::after{
  content:""; position:absolute; left:-.06em; right:-.06em; bottom:.12em; height:.40em;
  background:#f59b0a; opacity:.30; border-radius:2px; z-index:-1;
}
.foot{display:flex; align-items:baseline; justify-content:space-between; gap:40px}
.setup{font-size:24px; color:#70635c; max-width:34ch; line-height:1.4}
.host{
  font-size:24px; font-weight:500; color:#251d18; white-space:nowrap;
  border-bottom:2px solid #f59b0a; padding-bottom:4px;
}
</style></head><body>
<div class="kicker">DoviLoop for teams</div>
<h1>${esc(c.before)}<span class="mark">${esc(c.mark)}</span>${esc(c.mid)}</h1>
<div class="foot"><div class="setup">${esc(c.setup)}</div><div class="host">teams.doviloop.dev</div></div>
</body></html>`;
}

const browser = await chromium.launch(launchOptions({ args: ['--no-sandbox'] }));
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

for (const locale of ['en', 'da', 'lt']) {
  const c = copyFor(locale);
  await page.setContent(html(c), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  /* Draw only what fits. A headline that overflows 630px would be silently
     cropped by the screenshot, so measure and fail loudly instead. */
  const over = await page.evaluate(() => document.body.scrollHeight - 630);
  if (over > 0) throw new Error(`${locale}: the card overflows by ${over}px. Shorten the headline or drop the size.`);
  const buf = await page.screenshot({ type: 'png' });
  const out = resolve(root, `public/og-${locale}.png`);
  writeFileSync(out, buf);
  console.log(`  og-${locale}.png  ${(buf.length / 1024).toFixed(0)} KB  "${c.before}${c.mark}${c.mid}"`);
}

await browser.close();
console.log('Three cards written to public/.');
