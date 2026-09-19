/**
 * The worked example's performed demonstration, measured in a real browser.
 *
 * Why this file exists at all: four independent verifiers checked wave 7 and
 * the single loudest lesson was that anything no check asserts will eventually
 * vanish in silence. Three separate things had already done so. The auto
 * demonstration added after that review cannot be asserted by the jsdom
 * harnesses, because it is driven by IntersectionObserver and jsdom has none,
 * so it would have shipped with no check at all. This is that check.
 *
 * What it holds the section to, and why each one:
 *
 *   - it performs. The source named by AUTO_KEY goes off, and the figures it
 *     feeds leave the draft. A demonstration that never runs is the defect
 *     this whole change exists to fix.
 *   - it restores. The draft ends whole. A reader who looks away must not come
 *     back to a letter missing a clause nobody removed.
 *   - it stands down for prefers-reduced-motion, entirely. Not slower: absent.
 *   - it stands down for a real person. A visitor who touches anything in the
 *     section owns it from then on, and the page must not animate under them.
 *
 * Needs a built site being served, and playwright-core with the Chromium at
 * PLAYWRIGHT_BROWSERS_PATH. Same optional-tooling footing as
 * verify-consent-layout.mjs: not part of `npm run verify`.
 *
 *   npm run build && npx vite preview --port 4318 &
 *   node scripts/verify-demo.mjs http://127.0.0.1:4318
 */
import { chromium } from 'playwright-core';

const BASE = process.argv[2];
if (!BASE) {
  console.error('usage: node scripts/verify-demo.mjs <served-url>');
  process.exit(2);
}

/** The source the section demonstrates with, and a figure its clause carries.
    Both mirror src/components/Demo.tsx; a change there should fail here. */
const KEY = 'deductions';
const FIGURE = '850';

let failures = 0;
const check = (ok, label, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures += 1;
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
});

/** A page scrolled to the worked example, with the trackers refused. */
async function openDemo(ctx) {
  const page = await ctx.newPage();
  await ctx.route('**://*.facebook.*/**', (r) => r.abort());
  await ctx.route('**://*.posthog.*/**', (r) => r.abort());
  /* `domcontentloaded` plus an explicit wait for the switches, rather than
     `networkidle`. The section is driven by an observer that fires on scroll,
     so what matters is that the document and its script are up, not that every
     font and third party has settled. This also keeps the gate usable against
     an origin where the network never goes quiet. */
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#demo .demo-sw', { timeout: 15000 });
  await page.getByRole('button', { name: /accept|acceptér|sutinku|priimti/i })
    .first().click().catch(() => {});
  await page.evaluate(() => document.getElementById('demo')?.scrollIntoView({ block: 'center' }));
  return page;
}

const read = (page) =>
  page.evaluate(
    ([key, figure]) => ({
      checked:
        document.querySelector(`#demo .demo-sw[data-src="${key}"]`)?.getAttribute('aria-checked'),
      inDraft: (document.querySelector('#demo-draft')?.textContent || '').includes(figure),
    }),
    [KEY, FIGURE],
  );

/** Waits for a state rather than sampling at a fixed moment.
 *
 *  The first version of this file sampled once, 1900ms in, and was flaky: a
 *  clause losing its source is struck through for 380ms BEFORE its wording is
 *  swapped, so a sample can legitimately land on a switch that is already off
 *  beside a draft that still reads the old text. A gate that fails on timing
 *  teaches people to re-run until it passes, which is worse than having no
 *  gate at all. Polling removes the race: it asserts that the state is reached
 *  within a generous window, not that it is true at one instant. */
async function until(page, want, ms = 6000) {
  const deadline = Date.now() + ms;
  let last = await read(page);
  while (Date.now() < deadline) {
    last = await read(page);
    if (want(last)) return { ok: true, last };
    await page.waitForTimeout(100);
  }
  return { ok: false, last };
}

console.log('\nThe worked example demonstrates itself\n');

/* 1. it performs, and it restores ---------------------------------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await openDemo(ctx);
  await page.waitForTimeout(400);
  const atRest = await read(page);
  check(atRest.checked === 'true' && atRest.inDraft, 'the draft starts whole',
    `${KEY} ${atRest.checked}, ${FIGURE} in draft ${atRest.inDraft}`);

  const off = await until(page, (s) => s.checked === 'false' && !s.inDraft);
  check(off.ok, 'the source goes off by itself, and the draft loses what it fed',
    `${KEY} ${off.last.checked}, ${FIGURE} in draft ${off.last.inDraft}`);

  const back = await until(page, (s) => s.checked === 'true' && s.inDraft);
  check(back.ok, 'and it comes back, so the reader is left a whole draft',
    `${KEY} ${back.last.checked}, ${FIGURE} in draft ${back.last.inDraft}`);
  await ctx.close();
}

/* 2. reduced motion: absent, not merely slower ---------------------------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await openDemo(ctx);
  let moved = false;
  for (let i = 0; i < 8; i += 1) {
    await page.waitForTimeout(500);
    const s = await read(page);
    if (s.checked !== 'true' || !s.inDraft) moved = true;
  }
  check(!moved, 'it never runs for prefers-reduced-motion', 'watched four seconds');
  await ctx.close();
}

/* 3. a real person takes over --------------------------------------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await openDemo(ctx);
  await page.waitForTimeout(150);
  await page.click('#demo .demo-sw[data-src="rules"]');
  let moved = false;
  for (let i = 0; i < 8; i += 1) {
    await page.waitForTimeout(500);
    const s = await read(page);
    if (s.checked !== 'true' || !s.inDraft) moved = true;
  }
  check(!moved, 'it stands down the moment a visitor touches the section',
    `${KEY} untouched after a click on another switch`);
  await ctx.close();
}

await browser.close();
console.log(failures === 0 ? '\nDEMONSTRATION HOLDS\n' : `\n${failures} CHECK(S) FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
