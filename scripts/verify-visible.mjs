/**
 * Is the page actually on the screen?
 *
 * This file exists because an independent verifier appended one line to the
 * stylesheet:
 *
 *     #price,#numbers{display:none}
 *
 * (both of those sections have since been deleted; the attack works on any two
 * ids in PARTS below and the reasoning is unchanged)
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
 * left the hero and the audience folders with no gate that had ever loaded a
 * stylesheet.
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
  ['where it is installed', '#hero .hero-setup'],
  ['the worked example', '#demo .demo-beats'],
  ['the draft it writes back', '#demo-draft'],
  ['who it is for', '#who .who-accuracy'],
  /* The five things the open folder says that trade's drafts come out of.
     Scoped to the folder that is open: the other two panels stay in the DOM so
     a reader searching the page finds their own trade, and a `hidden` panel is
     display:none, which is the one kind of invisible this gate must not
     flag. */
  ['what the open folder is drafted out of', '#who .who-sheet:not([hidden]) .who-source'],
  ['each thing it promises about accuracy', '#who .who-accuracy-list li'],
  /* The price band, the calculator and the fit check were checked here, each
     down to the control a reader presses. All three are gone with the sales
     call they were built for, and the parts below the audience folders are
     whatever the trial section turns out to be. Nothing is left here standing
     in for them: a selector that cannot match is a line that reads as coverage
     and is not, which is the exact failure this file was written to end. */
];

/* Every copy of the mark, and how big it is allowed to be.

   The page draws the mark three times and sizes each one differently: a 30px
   masthead, a 34px emboss on the registered office, and a watermark on the
   draft that is meant to be large. A fourth, the 28px brand on the fit check,
   went with that section. Two of the three are sized by a rule that names a
   class; the hero is sized by a rule on its parent. So "does it carry a class"
   is the wrong question - what matters is that each copy came out the size it
   was meant to be.

   The footer's emboss lost `footer-emboss` when the mark became one
   definition, and rendered at its intrinsic size in solid black: three hundred
   pixels of logo under a registry address, the biggest thing on the page. Its
   path data was right so the mark check passed, and it was enormous rather
   than missing so every other check here passed. Nothing on the page was
   asking how big anything was. This does.

   The bands are wide on purpose. They are not a design spec; they are the
   difference between a watermark and a billboard. */
const MARKS = [
  ['the masthead', '#hero .hero-brand svg', 20, 48],
  ['the draft watermark', '#demo .demo-emboss', 80, 220],
  ['the emboss on the registered office', '#footer .footer-slip svg', 20, 60],
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
          /* Something painted over it.

             Probed once per line box, not once per element. An inline element
             that wraps has a bounding rect that is the union of its lines, and
             the middle of that union is whitespace between two of them: the
             topmost thing there is the block that holds the lines, so every
             wrapped inline element read as covered by its own parent. The four
             obligations in the price band are exactly that shape.

             Every line box must be clear, not just one. "Any rect passes"
             would excuse a sheet laid over all but the last line of a
             paragraph, which is a reader who cannot read it. */
          const rects = Array.from(el.getClientRects()).filter((q) => q.width >= 1 && q.height >= 1);
          let covered = null;
          for (const q of (rects.length ? rects : [r])) {
            const top = document.elementFromPoint(
              Math.min(window.innerWidth - 2, Math.max(2, q.left + q.width / 2)),
              Math.min(window.innerHeight - 2, Math.max(2, q.top + q.height / 2)),
            );
            /* Not `&& !top.contains(el)`. A verifier laid an opaque sheet over
               three whole sections with `::after`, and elementFromPoint returns
               the sheet's ORIGINATING element, which is an ancestor, so
               excusing ancestors excused exactly the attack. The topmost thing
               over a line of text should be that line's element or something
               inside it. */
            if (top && top !== el && !el.contains(top)) { covered = top; break; }
          }
          if (covered) {
            problems.push(`covered by ${covered.tagName.toLowerCase()}.${(covered.className || '').toString().split(' ')[0]}`);
            continue;
          }
          /* A sheet elementFromPoint cannot feel.

             Hit testing walks what the mouse would hit, and `pointer-events:
             none` takes an element out of that walk while leaving it painted.
             This page already has such a pseudo-element on the price band: a
             paper-fibre texture at five percent. Repainting it opaque black
             left every part of that band looking, to the probe above, exactly
             as it had before - the topmost hit was still the text, and the
             text was under a solid sheet. The attack that found this was our
             own, run to prove the probe worked.

             So the paint is read as well as the hit. A pseudo-element counts
             as a sheet when it is positioned, pinned to all four edges of
             something the part sits inside, filled with a background colour
             that is all but opaque, at full opacity and blending normally.
             Every one of those has to hold: the fibre texture is excluded by
             its opacity, the footer's compliment slip by having no background
             colour of its own, and a blend mode other than normal cannot cover
             what is under it whatever its alpha. */
          const alpha = (v) => {
            const n = (v.match(/[\d.]+/g) || []).map(Number);
            return n.length < 4 ? (n.length ? 1 : 0) : n[3];
          };
          let sheet = null;
          for (let a = el; a && !sheet; a = a.parentElement) {
            for (const pseudo of ['::before', '::after']) {
              const ps = getComputedStyle(a, pseudo);
              if (!ps || ps.content === 'none' || ps.content === 'normal') continue;
              if (ps.position !== 'absolute' && ps.position !== 'fixed') continue;
              if (ps.mixBlendMode !== 'normal') continue;
              if (Number(ps.opacity) < 0.9) continue;
              if (alpha(ps.backgroundColor) < 0.9) continue;
              const pinned = ['top', 'right', 'bottom', 'left']
                .every((side) => parseFloat(ps[side]) === 0);
              if (!pinned) continue;
              /* Behind the content is not over it. `auto` on a positioned
                 pseudo paints above its originating element's background but
                 below its positioned children, and this page puts its own
                 content at z-index 2 for exactly that reason. */
              const z = ps.zIndex === 'auto' ? 0 : Number(ps.zIndex);
              const own = getComputedStyle(el).zIndex;
              if (a !== el && z < (own === 'auto' ? 1 : Number(own))) continue;
              sheet = `${a.tagName.toLowerCase()}.${(a.className || '').toString().split(' ')[0]}${pseudo}`;
              break;
            }
          }
          if (sheet) { problems.push(`under an opaque ${sheet}`); continue; }
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

      const marks = await page.evaluate((specs) => {
        const out = [];
        for (const [name, sel, min, max] of specs) {
          const all = document.querySelectorAll(sel);
          if (all.length === 0) { out.push(`${name}: not on the page`); continue; }
          for (const el of all) {
            el.scrollIntoView({ block: 'center', behavior: 'instant' });
            const r = el.getBoundingClientRect();
            const side = Math.max(r.width, r.height);
            if (side < min || side > max) {
              out.push(`${name}: ${Math.round(side)}px, wanted ${min} to ${max}`);
            }
          }
        }
        return out;
      }, MARKS);
      check(marks.length === 0, `  /${loc || 'en'}: every copy of the mark is the size it is drawn at`,
        marks.length ? marks.join(' | ') : `${MARKS.length} copies`);
      await ctx.close();
    }
  }



  /* The page a visitor without JavaScript gets.

     There was not one. React writes every element in #root, so with scripting
     off the body was empty: no sentence, no address, nothing to click, on a
     page ads point at. The fallback lives in the served index.html, where it
     cannot depend on the thing that is missing. This is the only check that
     can tell the difference, because it is the only one that turns the script
     off. */
  {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      javaScriptEnabled: false,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    const got = await page.evaluate(() => ({
      text: (document.body.innerText || '').replace(/\s+/g, ' ').trim(),
      mailto: Array.from(document.querySelectorAll('a[href^="mailto:"]')).map((a) => a.getAttribute('href')),
    }));
    check(
      got.text.length > 200 && /javascript/i.test(got.text),
      '\n  with JavaScript off the page still says something',
      got.text ? `${got.text.length} chars: ${got.text.slice(0, 60)}...` : 'the body is empty',
    );
    check(
      got.mailto.some((h) => h.includes('dovyvini@doviloop.dev')),
      '  and still gives a way to reach a person',
      got.mailto.join(' ') || 'no address anywhere',
    );
    await ctx.close();
  }

  /* Review mode is there when it is asked for, and nowhere near a customer
     when it is not.

     Both halves matter. A reviewing tool that never loads is a nuisance; one
     that loads for a visitor is a stranger's debug overlay on a sales page,
     and the chunk it lives in is ten kilobytes they did not ask to download.
     The second check watches the network as well as the DOM, because an
     overlay could be kept off the screen while its code was still shipped. */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await ctx.route('**://*.facebook.*/**', (r) => r.abort());
    await ctx.route('**://*.posthog.*/**', (r) => r.abort());

    const asked = [];
    page.on('request', (r) => {
      if (/\/review-[A-Za-z0-9_-]*\.js$/.test(r.url())) asked.push(r.url());
    });

    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    const bare = await page.locator('#dlrv-root').count();
    check(bare === 0 && asked.length === 0,
      '\n  a visitor who did not ask for review mode never meets it',
      `${bare} overlay(s), ${asked.length} chunk request(s)`);

    await page.goto(`${BASE}/?review`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const armed = await page.locator('#dlrv-root .dlrv-mark').count();
    check(armed === 1 && asked.length === 1,
      '  and ?review brings it, code and all',
      `${armed} button(s), ${asked.length} chunk request(s)`);

    await ctx.close();
  }



} finally {
  await browser.close();
}

console.log(failures === 0 ? '\nTHE PAGE IS ON THE SCREEN\n' : `\n${failures} CHECK(S) FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
