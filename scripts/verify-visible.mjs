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
  ['the price band', '#price'],
  ['the package cards', '#price [data-price-pkg]'],
  ['where a firm too small is sent', '#price .price-pkgs-under a'],
  /* Each of the four obligations the trade asks for. They were four bulleted
     sentences and are one wrapped run now, which is exactly the kind of change
     that can leave an item with no box: an inline `<li>` inside a collapsed
     parent measures zero and reads as nothing at all. */
  ['what the trade asks for', '#price .price-gives li'],
  ['the calculator', '#numbers .numbers-beats'],
  ['the figure it ends on', '#numbers .numbers-keep'],
  ['its controls', '#numbers input[type="range"]'],
  /* The promise the panel makes about its own figures. It spent this long
     inside a disclosure closed at rest, where nothing on this page could tell
     the difference between present and invisible. */
  ['the promise the calculator makes', '#numbers [data-n-promise]'],
  /* The heading block carries `id="fit"`; the form is a sibling. Checking
     `#fit` alone passed while the form itself was invisible. */
  ['the fit check', '#fit'],
  ['the form inside it', '.qualifier-sheet form'],
  ['its first question', '.qualifier-chips'],
  ['and an answer to press', '.qualifier-chip'],
];

/* Every copy of the mark, and how big it is allowed to be.

   The page draws the mark four times and sizes each one differently: a 30px
   masthead, a 28px brand on the fit check, a 34px emboss on the registered
   office, and a watermark on the draft that is meant to be large. Three of the
   four are sized by a rule that names a class; the hero and the fit check are
   sized by a rule on their parent. So "does it carry a class" is the wrong
   question - what matters is that each copy came out the size it was meant to
   be.

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
  ['the fit check brand', '.qualifier-mark svg', 20, 48],
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

  /* The two lines the founder asked to fit on one line.

     Both were two lines when he read the page, and both are copy: nothing
     stops the next edit putting the wrap back, and nothing would notice. A
     character count would not do it either, because what matters is the box,
     which is 676px for the reason and 333px for a package card, and both are
     set in different type at different sizes. So it is measured, in a browser,
     at the width he reviewed at. Below 1280 the reason's column narrows and it
     wraps again, which is expected and not checked. */
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 990 } });
    const page = await ctx.newPage();
    await ctx.route('**://*.facebook.*/**', (r) => r.abort());
    await ctx.route('**://*.posthog.*/**', (r) => r.abort());
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

    const lines = (sel, nth) =>
      page.evaluate(
        ([sel, nth]) => {
          const el = document.querySelectorAll(sel)[nth];
          if (!el) return null;
          const cs = getComputedStyle(el);
          const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
          const r = document.createRange();
          r.selectNodeContents(el);
          return {
            n: Math.round(r.getBoundingClientRect().height / lh),
            text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
          };
        },
        [sel, nth],
      );

    for (const [sel, nth, what] of [
      ['#price .price-reason', 0, 'the reason the price is low'],
      ['#price .price-pkg-note', 1, "the Firm card's note"],
    ]) {
      const got = await lines(sel, nth);
      check(
        got !== null && got.n === 1,
        `\n  ${what} is one line at 1920`,
        got === null ? `${sel} is not on the page` : `${got.n} line(s): ${JSON.stringify(got.text.slice(0, 64))}`,
      );
    }
    await ctx.close();
  }

  /* One size, said once.

     Section 04's two package cards and section 05's calculator were two
     components with two opinions about how big the reader is. Pressing Firm
     changed the fee above and nothing below it, so a reader who pressed Firm
     and scrolled one section met "This costs (Desk)" over an allowance of
     5,000 pooled drafts, which is the other package's number under the other
     package's fee. The press now moves the head count, the head count moves
     the package, and the package moves the allowance: one path, checked here
     from the end a reader actually touches. */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await ctx.route('**://*.facebook.*/**', (r) => r.abort());
    await ctx.route('**://*.posthog.*/**', (r) => r.abort());
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

    const read = () =>
      page.evaluate(() => ({
        drafts: document.querySelector('[data-n-input="drafts"]')?.textContent?.trim() ?? '',
        people: document.querySelector('[data-n-input="people"]')?.textContent?.trim() ?? '',
        fee: Array.from(document.querySelectorAll('#numbers .numbers-beat'))
          .map((b) => b.textContent ?? '')
          .find((t) => /costs/i.test(t)) ?? '',
      }));

    /* At rest, before anything is pressed. The price block lights one card on
       load, and the calculator used to open on its own smallest band, so a
       reader who pressed nothing already met a lit Firm card above "This costs
       (Desk)". The disagreement did not need a click to exist. */
    {
      const lit = await page.getAttribute('[data-price-pkg][aria-pressed="true"]', 'data-price-pkg');
      const got = await read();
      check(
        Boolean(lit) && got.fee.toLowerCase().includes(lit),
        '\n  at rest the calculator is already on the package the price block lit',
        `${lit} is lit, the fee row says ${JSON.stringify(got.fee.slice(0, 32))}`,
      );
    }

    const want = { firm: ['10,000', '20'], desk: ['5,000', '10'] };
    const press = async (id, label) => {
      await page.click(`[data-price-pkg="${id}"]`);
      await page.waitForTimeout(250);
      const got = await read();
      const [drafts, people] = want[id];
      /* The fee row names the package it is charging for, so it is the one
         place the two sections can be caught disagreeing in words rather than
         only in numbers. */
      const named = got.fee.toLowerCase().includes(id);
      check(
        got.drafts === drafts && got.people === people && named,
        label,
        `${got.people} people, ${got.drafts} drafts, fee row says ${named ? id : JSON.stringify(got.fee.slice(0, 40))}`,
      );
    };

    /* Both directions, because the linkage runs off a change in the picked
       package and either one could be the value it happened to start on. */
    await press('desk', '\n  pressing desk in the price block moves the calculator with it');
    await press('firm', '  and pressing firm moves it back');

    /* And the press that is not a change. A reader who drags the head count
       somewhere else and then presses the card that is already lit is asking
       to be put back where that card says. Held on to the id alone this does
       nothing at all: same value, no re-render, a dead button under a finger
       that just pressed it. */
    await page.evaluate(() => {
      const el = document.querySelector('input[name="people"]');
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      set.call(el, '13');
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(150);
    const moved = (await read()).people;
    check(moved === '13', '  (the head count really moved away first)', moved);
    await press('firm', '  and pressing the card that is already lit puts it back');
    await ctx.close();
  }

  /* The page a visitor without JavaScript gets.

     There was not one. React writes every element in #root, so with scripting
     off the body was empty: no sentence, no address, nothing to click, on a
     page ads point at. The stylesheet has carried a .qualifier-nojs fallback
     the whole time and it never rendered once, because it lives inside the
     component that does not run. This is the only check that can tell the
     difference, because it is the only one that turns the script off. */
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

  /* Every one of the six is required, pressed the way a reader presses it.

     The phone shipped optional on 2026-09-22 and was made required the same
     day. "Required" is a claim about what the form REFUSES, and the payload
     harness cannot make it: that one only ever sees what got through, so a
     form that quietly accepted a blank number would leave it with nothing to
     notice. This fills every box but one, presses the button, and checks the
     form stayed put and said which box.

     Done for the phone because it is the field that changed, and for the
     email beside it as a control: if a check like this passes on a form where
     nothing is required at all, it is measuring nothing. */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.route('**://*.facebook.*/**', (r) => r.abort());
    await ctx.route('**://*.posthog.*/**', (r) => r.abort());

    /* If one ever gets through, it must not reach a webhook: a lead POSTed by
       a form that was supposed to refuse it is a worse outcome than a failing
       check, so the request is counted and would fail this too. */
    let posted = 0;
    await ctx.route('**/api/lead*', (r) => {
      posted += 1;
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    for (const [leaveBlank, what] of [['phone', 'the number'], ['work_email', 'the email']]) {
      const page = await ctx.newPage();
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.querySelector('#fit')?.scrollIntoView());
      await page.check('[data-field="team_size"] input[value="10-24"]');
      await page.check('[data-field="email_client"] input[value="outlook"]');
      await page.check('[data-field="role"] input[value="ops_office_manager"]');
      await page.click('#qualifier button[type="submit"]');
      await page.waitForTimeout(300);

      const fill = { company_name: 'Vesterled', work_email: 'lars@vesterled.dk', phone: '+45 31 42 55 90' };
      for (const [id, value] of Object.entries(fill)) {
        if (id !== leaveBlank) await page.fill(`#f-${id}`, value);
      }
      const before = posted;
      await page.click('#qualifier button[type="submit"]');
      await page.waitForTimeout(600);

      const got = await page.evaluate((id) => {
        /* Every field keeps its error paragraph in the DOM at all times,
           `hidden` until there is something to say, so that the id an input's
           aria-describedby points at always resolves. Counting the paragraphs
           therefore counts the fields, not the complaints. The first version
           of this check did exactly that and reported all three fields
           failing on a form that was behaving perfectly. Only the ones that
           are both shown and have text in them are complaints. */
        const shown = [...document.querySelectorAll('#qualifier [id^="e-"]')].filter(
          (e) => !e.hidden && (e.textContent || '').trim(),
        );
        return {
          onForm: Boolean(document.querySelector('#qualifier .qualifier-form')),
          said: shown.find((e) => e.id === `e-${id}`)?.textContent?.trim() ?? '',
          complaints: shown.map((e) => e.id),
        };
      }, leaveBlank);

      check(
        got.onForm && got.said.length > 0 && got.complaints.length === 1 && posted === before,
        `\n  the form refuses to send a lead with ${what} left blank`,
        got.onForm
          ? `said ${JSON.stringify(got.said)}, complaining about ${got.complaints.join(',') || 'nothing'}${posted > before ? ', BUT POSTED IT ANYWAY' : ''}`
          : 'it went through to an answer screen',
      );
      await page.close();
    }
    await ctx.close();
  }

  /* The answer screens, which nothing had ever looked at.

     The fit check's three outcomes are behind a submitted form, so no gate
     reached them and no screenshot pass had opened them. They were written in
     Tailwind utilities naming DARK theme tokens - text-warmwhite/90,
     bg-card-dark, text-muted-dark - on a sheet that is #FDF9F7 paper. Both
     sentences explaining the call measured 1.06:1 against it. The Gmail note
     was a near black box with near black text inside it, also 1.06:1. That is
     not low contrast, it is a live page showing a visitor nothing where its
     copy should be, and the founder read it as the screens being mostly empty.

     So this walks every piece of text on every outcome and measures it against
     the background actually painted behind it, rather than trusting a class
     name. 4.5:1 is the WCAG AA threshold for body text. */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.route('**://*.facebook.*/**', (r) => r.abort());
    await ctx.route('**://*.posthog.*/**', (r) => r.abort());
    await ctx.route('**/api/lead*', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
    );

    /* team size, mail client, and what the page should conclude */
    const RUNS = [
      ['1-9', 'outlook', 'too small'],
      ['10-24', 'outlook', 'qualified'],
      ['50+', 'gmail', 'qualified, on Gmail'],
    ];

    for (const [size, client, what] of RUNS) {
      const page = await ctx.newPage();
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.querySelector('#fit')?.scrollIntoView());
      await page.check(`[data-field="team_size"] input[value="${size}"]`);
      await page.check(`[data-field="email_client"] input[value="${client}"]`);
      await page.check('[data-field="role"] input[value="ops_office_manager"]');
      await page.click('#qualifier button:has-text("Continue"), #qualifier button[type="submit"]');
      await page.waitForTimeout(300);
      await page.fill('#qualifier input[type="email"]', 'someone@example-firm.dk');
      await page.fill('#qualifier input[name="company_name"]', 'Example Firm ApS');
      /* Required since 2026-09-22. Without it this walk never leaves the
         second screen and every check below reports an answer screen that
         does not exist, which is how the change announced itself here. */
      await page.fill('#qualifier input[name="phone"]', '+45 31 42 55 90');
      await page.click('#qualifier button[type="submit"]');
      await page.waitForTimeout(1200);

      const got = await page.evaluate(() => {
        const lum = (rgb) => {
          const f = rgb.map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
        };
        const parse = (c) => {
          const m = c.match(/-?[\d.]+/g);
          if (!m) return null;
          /* oklab and oklch cannot be read off the string, so bounce the colour
             through a canvas, which reports whatever the engine resolved. */
          if (!c.startsWith('rgb')) {
            const cv = document.createElement('canvas');
            cv.width = cv.height = 1;
            const g = cv.getContext('2d');
            g.fillStyle = '#fff';
            g.fillRect(0, 0, 1, 1);
            g.fillStyle = c;
            g.fillRect(0, 0, 1, 1);
            const d = g.getImageData(0, 0, 1, 1).data;
            return [d[0], d[1], d[2]];
          }
          return [Number(m[0]), Number(m[1]), Number(m[2])];
        };
        /* What is really painted behind this element: walk up until something
           is not transparent. An element on a see through parent is sitting on
           whatever that parent is sitting on. */
        const behind = (el) => {
          let n = el;
          while (n && n !== document.documentElement) {
            const bg = getComputedStyle(n).backgroundColor;
            const a = bg.match(/-?[\d.]+/g);
            if (a && (a.length < 4 || Number(a[3]) > 0.9)) return parse(bg);
            n = n.parentElement;
          }
          return [255, 255, 255];
        };
        const root = document.querySelector('#qualifier .qualifier-result');
        if (!root) return { missing: true };
        const bad = [];
        let seen = 0;
        for (const el of root.querySelectorAll('*')) {
          /* Only elements that paint text of their own. */
          const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (!own) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          const fg = parse(cs.color);
          const bg = behind(el);
          if (!fg || !bg) continue;
          seen++;
          const l1 = lum(fg);
          const l2 = lum(bg);
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          if (ratio < 4.5) {
            bad.push(
              `${ratio.toFixed(2)}:1 "${(el.textContent || '').trim().slice(0, 34)}"`,
            );
          }
        }
        /* The answer uses the whole sheet. The rail is the form's margin, for
           the question numbers; on an answer it was 132px of nothing with the
           text squeezed into what was left. */
        const body = document.querySelector('#qualifier .qualifier-body');
        const gutter = Math.round(root.getBoundingClientRect().x - body.getBoundingClientRect().x);
        return { bad, seen, gutter };
      });

      check(
        !got.missing && got.seen >= 3 && got.bad.length === 0,
        `\n  every word of the "${what}" answer is legible on the paper it is printed on`,
        got.missing
          ? 'no answer screen rendered at all'
          : got.bad.length
            ? `${got.seen} checked, ${got.bad.length} under 4.5:1 -> ${got.bad.slice(0, 3).join(' | ')}`
            : `${got.seen} pieces of text, all at or above 4.5:1`,
      );
      check(
        got.gutter === 0,
        `  and it uses the sheet, not the form's numbering margin`,
        `${got.gutter}px of empty gutter to its left`,
      );
      await page.close();
    }
    await ctx.close();
  }

} finally {
  await browser.close();
}

console.log(failures === 0 ? '\nTHE PAGE IS ON THE SCREEN\n' : `\n${failures} CHECK(S) FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
