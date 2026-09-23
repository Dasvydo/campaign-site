/**
 * The consent notice, measured in a real browser engine.
 *
 * jsdom has no layout, so scripts/verify-consent.mjs can prove the gate holds
 * but cannot see that the notice covers the one button the page is asking
 * people to press. This can. Four viewports by three locales, with the notice
 * up and again after it is answered.
 *
 * What it asserts, and why each one is here rather than eyeballed:
 *
 *   - no horizontal overflow, before and after. A fixed, full-width element is
 *     the classic way to add a scrollbar to a page that did not have one.
 *   - at every viewport the slip must not touch the hero's call to action.
 *     Until 2026-09-18 this was only asserted from 1024px up, on the belief
 *     that a phone's sheet would always sit on the button; what sat on the
 *     button was a payback line and a 197px sheet. The button now comes
 *     first and the sheet is tighter, and the assertion runs at 360, 390,
 *     768 and 1280 wide so a first screen with no reachable action fails.
 *   - on a phone the standing price bar stands down while the notice is up and
 *     comes back afterwards, because two fixed bars must never stack.
 *
 * Nothing leaves the machine: every request to a Meta or PostHog host is
 * aborted at the route level before it is sent.
 *
 * It also owns the horizontal overflow measurement for the whole page, at four
 * widths by three locales, before and after the notice is answered. That used
 * to be measured in a second place as well - scripts/verify-browser.py, at
 * three widths with the notice up - which this strictly contains. The Python
 * gate was removed on 2026-09-23; its overflow coverage is here and was
 * already a subset, so nothing was lost with it.
 *
 * Needs a built site being served, and playwright-core with a Chromium, which
 * scripts/chromium.mjs resolves. Same optional-tooling footing as the other
 * two browser gates, and like them it is not part of `npm run verify`.
 *
 *   npm run build && npx vite preview --port 4318 --host 127.0.0.1 &
 *   node scripts/verify-consent-layout.mjs http://127.0.0.1:4318
 */
/* Optional tooling: say so plainly rather than throwing a module-resolution
   stack trace at someone who has not installed it. */
let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.error('needs playwright-core:  npm ci');
  process.exit(2);
}
const { launchOptions } = await import('./chromium.mjs');

const BASE = process.argv[2];
if (!BASE) {
  console.error('usage: node scripts/verify-consent-layout.mjs <base-url>');
  process.exit(2);
}
/* 320 is here because nothing below 360 was ever measured, and below 360 the
   sheet sat on the button in all three languages: English overlapped by 2px,
   Danish by 70, and Lithuanian cleared by 6 until a longer call-to-action
   label wrapped its button and turned that into a 15px overlap. Two of the
   three predated the rebuild and no gate could see any of them. */
const VIEWPORTS = [[320, 800, 'phone'], [360, 800, 'phone'], [390, 844, 'phone'], [768, 1024, 'tablet'], [1280, 800, 'laptop']];
const LOCALES = [['/', 'en'], ['/da', 'da'], ['/lt', 'lt']];

const OVERFLOW = () => {
  const over = document.documentElement.scrollWidth - window.innerWidth;
  const culprits = [];
  if (over > 0) {
    const wide = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      const right = r.right + window.scrollX;
      if (r.width > 0 && right > window.innerWidth + 1) wide.push({ el, right, w: r.width });
    }
    wide.sort((a, b) => b.right - a.right);
    for (const c of wide.slice(0, 3)) {
      const cls = typeof c.el.className === 'string' && c.el.className
        ? '.' + c.el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      culprits.push(c.el.tagName.toLowerCase() + (c.el.id ? '#' + c.el.id : '') + cls
        + ' right=' + Math.round(c.right) + ' w=' + Math.round(c.w));
    }
  }
  return { over, culprits };
};

let fails = 0;
const check = (ok, label, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) fails += 1;
};

const browser = await chromium.launch(launchOptions({ args: ['--no-sandbox'] }));

/* The loop below is wrapped because several measurements read a boundingBox()
   without a null guard - `slip.boundingBox()` in particular, which returns
   null the moment `.consent-slip` stops existing. That is a throw, not a
   FAIL, which is the right direction, but unguarded it left a headless
   Chromium running after the process gave up. The other two browser gates
   already close theirs in a `finally`; this one did not. */
try {
for (const [w, h, vpName] of VIEWPORTS) {
  console.log(`\n${vpName} ${w}x${h}`);
  for (const [path, loc] of LOCALES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    // Never let a verification run reach a real tracking host.
    await page.route(/connect\.facebook\.net|facebook\.com\/tr|posthog\.com/, (r) => r.abort());
    await page.goto(BASE + path, { waitUntil: 'networkidle' });

    const notice = page.locator('[role="dialog"]');
    /* The visible object is the slip. The [role=dialog] wrapper is a
       full-width, transparent, pointer-events:none flex container, so
       measuring IT would report an overlap that nobody can see. */
    const slip = page.locator('.consent-slip');
    const shown = await notice.count();
    check(shown === 1, `${loc}: the notice is up`, `${shown} found`);

    const withNotice = await page.evaluate(OVERFLOW);
    check(withNotice.over <= 0, `${loc}: no horizontal overflow with the notice up`,
      withNotice.over > 0 ? `${withNotice.over}px | ${withNotice.culprits.join(' | ')}` : '0px');

    /* The notice must not cover the hero's call to action: that button is what
       the page is for, and a banner on top of it is a banner that costs money. */
    /* Asserted at every width since 2026-09-18. It used to be skipped below
       1024 on the reasoning that a phone's sheet would always sit on the
       button; what actually sat on the button was the payback line and a
       197px sheet. The phone hero now puts the button above that line and
       the sheet is set tighter, so a first screen with no reachable action is
       a regression this catches rather than a state it excuses. */
    /* A missing button is a FAIL, not a skip.

       This was `if (await cta.count()) { ... }`, so the whole assertion simply
       did not run when the selector matched nothing - and the selector names
       one class on one section, which is the kind of thing a redesign renames
       without noticing. The page would have shipped with no call to action in
       the hero and this gate would have printed one line fewer and exited 0.
       A gate that goes quiet when its subject disappears is the failure this
       repository has now hit five times. */
    const cta = page.locator('#hero a.hero-btn, #hero button.hero-btn').first();
    const haveCta = (await cta.count()) > 0;
    if (!haveCta) {
      check(false, `${loc}: the hero has a call to action to measure the notice against`,
        'no #hero .hero-btn on the page');
    } else {
      const a = await cta.boundingBox();
      const b = await slip.boundingBox();
      /* boundingBox() returns {x,y,width,height} and no .right, so the edges
         are computed. Reading a .right that is always undefined made every
         comparison false and every box look like it overlapped. */
      const overlap = a && b && !(a.x + a.width <= b.x || b.x + b.width <= a.x ||
        a.y + a.height <= b.y || b.y + b.height <= a.y);
      check(!overlap, `${loc}: the notice does not cover the hero CTA`,
        overlap ? `cta y=${Math.round(a.y)}..${Math.round(a.y + a.height)} vs slip y=${Math.round(b.y)}..${Math.round(b.y + b.height)}` : 'clear');
    }

    if (w < 1024) {
      const box = await slip.boundingBox();
      check(box.height <= h * 0.33, `${loc}: the sheet stays under a third of the screen`,
        `${Math.round(box.height)}px of ${h}px = ${Math.round((box.height / h) * 100)}%`);
      const reserved = await page.evaluate(
        () => parseFloat(getComputedStyle(document.body).paddingBottom) || 0,
      );
      check(reserved >= box.height - 2, `${loc}: the page reserves the sheet's height`,
        `${Math.round(reserved)}px reserved for ${Math.round(box.height)}px`);
    }

    /* Only one fixed bar may own the bottom of a phone screen. */
    if (w < 720) {
      const barVisible = await page.evaluate(() => {
        const bar = document.querySelector('#hero .hero-bar');
        if (!bar) return false;
        return getComputedStyle(bar).display !== 'none';
      });
      check(!barVisible, `${loc}: the standing price bar stands down while the notice is up`);
    }

    // Now answer it, and check the page recovers.
    await page.locator('.consent-btn').first().click();
    await page.waitForTimeout(150);
    const after = await page.evaluate(OVERFLOW);
    check(after.over <= 0, `${loc}: no horizontal overflow after answering`,
      after.over > 0 ? `${after.over}px | ${after.culprits.join(' | ')}` : '0px');
    check((await notice.count()) === 0, `${loc}: the notice is gone after answering`);

    if (w < 720) {
      const barBack = await page.evaluate(() => {
        const bar = document.querySelector('#hero .hero-bar');
        return bar ? getComputedStyle(bar).display !== 'none' : false;
      });
      check(barBack, `${loc}: the price bar comes back afterwards`);
    }

    await ctx.close();
  }
}

} finally {
  await browser.close();
}
console.log(fails === 0 ? '\nLAYOUT HOLDS' : `\n${fails} PROBLEM(S) FOUND`);
process.exit(fails === 0 ? 0 : 1);
