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
 * Then a fifth verifier refuted the first version of this file, and the audit
 * is worth keeping because it names exactly what a passing gate is worth. It
 * deleted the whole stand-down mechanism and this gate still printed
 * DEMONSTRATION HOLDS, because the check labelled "it stands down the moment a
 * visitor touches the section" clicked a switch, and a switch click stands the
 * sequence down through the toggle handler's own call, never reaching the
 * section listeners at all. The label did not describe what it tested. Three
 * more mutations walked through untouched: firing twice, re-arming on a desk
 * change, and speaking into the live region. Every one of those is a claim the
 * header above used to make with nothing behind it.
 *
 * So the rule this file is now written to: a check tests the mechanism named in
 * its own label, by the path a person would actually take, and every sentence
 * of the component's promise gets one. Where that is not possible the gap is
 * written down rather than implied.
 *
 * What it holds the section to:
 *
 *   - it performs. The source named by KEY goes off, and the figures it feeds
 *     leave the draft. A demonstration that never runs is the defect this whole
 *     change exists to fix.
 *   - it restores, INCLUDING when interrupted. The draft ends whole. A reader
 *     who looks away must not come back to a letter missing a clause nobody
 *     removed, and the first build failed exactly here: standing down cancelled
 *     the restoring step, so the gesture the movement provokes was the gesture
 *     that maimed the letter.
 *   - it needs both halves on screen. The switch without the draft is a tick
 *     moving for no reason; the draft without the switch is text changing by
 *     itself. On a phone the two cannot share a screen, so it must not run.
 *   - it gives the run back if the reader scrolls off before it moves, rather
 *     than spending it on somebody who is no longer looking.
 *   - it stands down for prefers-reduced-motion, entirely. Not slower: absent.
 *   - it stands down for a real person, through the section listeners: a
 *     pointer, a key or focus anywhere in the section.
 *   - it runs once. Not twice, and not again on a desk change.
 *   - it never speaks into the live region. Announcing a change nobody made is
 *     noise, and it would be the screen reader user's only evidence that the
 *     page moved under them.
 *   - the whole sequence is inside WCAG 2.2.2's five seconds, asserted against
 *     a stated ceiling rather than left to a polling timeout.
 *
 * Needs a built site being served, and playwright-core with the Chromium at
 * PLAYWRIGHT_BROWSERS_PATH. Same optional-tooling footing as
 * verify-consent-layout.mjs: not part of `npm run verify`.
 *
 *   npm run build && npx vite preview --port 4318 &
 *   node scripts/verify-demo.mjs http://127.0.0.1:4318
 */
import { chromium } from 'playwright-core';
import { launchOptions } from './chromium.mjs';

const BASE = process.argv[2];
if (!BASE) {
  console.error('usage: node scripts/verify-demo.mjs <served-url>');
  process.exit(2);
}

/** The source the section demonstrates with, and a figure its clause carries.
    Both mirror src/components/Demo.tsx; a change there should fail here. */
const KEY = 'deductions';
const FIGURE = '850';
/** WCAG 2.2.2. The sequence must finish inside this, and the check that says so
    must not be the polling timeout by accident. */
const WCAG_MOVING_LIMIT = 5000;

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

let failures = 0;
const check = (ok, label, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures += 1;
};

const browser = await chromium.launch(launchOptions());

try {
  /** A loaded page with the trackers refused, NOT yet scrolled anywhere. */
  async function openPage(ctx) {
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
    return page;
  }

  /** How much of each half is on screen right now. */
  const bothSeen = (page) =>
    page.evaluate((key) => {
      const cause = document.querySelector(`#demo .demo-sw[data-src="${key}"]`);
      const effect = document.querySelector(`#demo .demo-clause[data-clause="${key}"]`);
      if (!cause || !effect) return null;
      const seen = (el) => {
        const r = el.getBoundingClientRect();
        const h = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
        return r.height ? +(h / r.height).toFixed(2) : 0;
      };
      const a = cause.getBoundingClientRect();
      const b = effect.getBoundingClientRect();
      return {
        cause: seen(cause),
        effect: seen(effect),
        union: Math.max(a.bottom, b.bottom) - Math.min(a.top, b.top),
      };
    }, KEY);

  /** Puts the driving switch and the clause it drives on screen together, which
      is what the component now requires before it will run. Returns how much of
      each ended up visible, so a check can say whether the ask was satisfiable at
      this viewport rather than silently asserting nothing.

      `behavior: 'instant'` on purpose: the page sets `scroll-behavior: smooth`,
      so a plain scrollTo animates and anything measured on the next line is read
      off the old position. The first run of this file scored both halves at 0
      while the demonstration played perfectly, which is a gate lying in the
      reassuring direction. */
  async function showBoth(page) {
    await page.evaluate((key) => {
      const cause = document.querySelector(`#demo .demo-sw[data-src="${key}"]`);
      const effect = document.querySelector(`#demo .demo-clause[data-clause="${key}"]`);
      if (!cause || !effect) return;
      const a = cause.getBoundingClientRect();
      const b = effect.getBoundingClientRect();
      const top = Math.min(a.top, b.top) + window.scrollY;
      const bottom = Math.max(a.bottom, b.bottom) + window.scrollY;
      window.scrollTo({ top: Math.max(0, (top + bottom) / 2 - window.innerHeight / 2), behavior: 'instant' });
    }, KEY);
    await page.waitForTimeout(120);
    return bothSeen(page);
  }

  /** Puts the switch strip on screen and nothing else, which is what a phone
      reader gets. Used to prove the sequence declines to play there. */
  const showStripOnly = (page) =>
    page.evaluate(() => {
      document.querySelector('#demo .demo-switches')?.scrollIntoView({ block: 'center' });
    });

  const read = (page) =>
    page.evaluate(
      ([key, figure]) => ({
        checked:
          document.querySelector(`#demo .demo-sw[data-src="${key}"]`)?.getAttribute('aria-checked'),
        inDraft: (document.querySelector('#demo-draft')?.textContent || '').includes(figure),
        said: Array.from(document.querySelectorAll('#demo .demo-sr'))
          .map((n) => (n.textContent || '').trim())
          .filter(Boolean)
          .join(' | '),
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
   *  within a generous window, not that it is true at one instant.
   *
   *  The window is generous ON PURPOSE and is therefore NOT the timing check.
   *  A verifier stretched the sequence past WCAG 2.2.2's five seconds and this
   *  failed only because the default deadline happened to be six. That is an
   *  accidental catch, so the ceiling is asserted explicitly in check 9. */
  async function until(page, want, ms = 8000) {
    const started = Date.now();
    const deadline = started + ms;
    let last = await read(page);
    while (Date.now() < deadline) {
      last = await read(page);
      if (want(last)) return { ok: true, last, took: Date.now() - started };
      await page.waitForTimeout(50);
    }
    return { ok: false, last, took: Date.now() - started };
  }

  /** Watches for any movement at all over a window. The absence checks all want
      this, and all of them used to roll their own loop. */
  async function stillFor(page, ms) {
    const deadline = Date.now() + ms;
    let moved = false;
    let spoke = '';
    while (Date.now() < deadline) {
      const s = await read(page);
      if (s.checked !== 'true' || !s.inDraft) moved = true;
      if (s.said) spoke = s.said;
      await page.waitForTimeout(100);
    }
    return { moved, spoke };
  }

  /** Did the demonstrated switch go off by itself at any point in the window?
      The narrow question, for the cases where the draft's text legitimately
      changes for other reasons. */
  async function switchWentOff(page, ms) {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      const s = await read(page);
      if (s.checked !== 'true') return true;
      await page.waitForTimeout(100);
    }
    return false;
  }

  console.log('\nThe worked example demonstrates itself\n');

  /* 1. it performs, it restores, it is silent, and it finishes in time ------ */
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await openPage(ctx);
    const seen = await showBoth(page);
    check(
      !!seen && seen.cause >= 0.9 && seen.effect >= 0.9,
      'the switch and the clause it drives can share a desktop screen',
      seen ? `switch ${seen.cause}, clause ${seen.effect}, together ${Math.round(seen.union)}px` : 'not found',
    );

    const atRest = await read(page);
    check(atRest.checked === 'true' && atRest.inDraft, 'the draft starts whole',
      `${KEY} ${atRest.checked}, ${FIGURE} in draft ${atRest.inDraft}`);

    const off = await until(page, (s) => s.checked === 'false' && !s.inDraft);
    check(off.ok, 'the source goes off by itself, and the draft loses what it fed',
      `${KEY} ${off.last.checked}, ${FIGURE} in draft ${off.last.inDraft}`);

    const back = await until(page, (s) => s.checked === 'true' && s.inDraft);
    check(back.ok, 'and it comes back, so the reader is left a whole draft',
      `${KEY} ${back.last.checked}, ${FIGURE} in draft ${back.last.inDraft}`);

    /* 9. the stated ceiling, not the polling timeout -------------------------- */
    check(back.ok && off.took + back.took < WCAG_MOVING_LIMIT,
      `the whole sequence is inside WCAG 2.2.2's five seconds`,
      `${off.took + back.took}ms of ${WCAG_MOVING_LIMIT}`);

    /* 8. it never speaks ------------------------------------------------------ */
    const after = await read(page);
    check(after.said === '', 'it never speaks into the live region',
      after.said === '' ? 'both regions empty through the sequence' : `said "${after.said}"`);

    /* 6. it runs once --------------------------------------------------------- */
    const again = await stillFor(page, 4000);
    check(!again.moved, 'it runs once, and does not come round again',
      'watched four seconds after it restored');

    /* 7. and not again on a desk change --------------------------------------- */
    const tabs = await page.$$('#demo .demo-tab');
    if (tabs.length > 1) {
      await tabs[1].click();
      await showBoth(page);
      /* Watches the SWITCH only, not the figure. Every desk writes a different
         letter, so `850` leaves the draft on a desk change for a reason that has
         nothing to do with this sequence. The first run of this file read that
         as movement and failed a component that was behaving correctly, which is
         a gate lying in the alarming direction. */
      const wentOff = await switchWentOff(page, 4000);
      check(!wentOff, 'it does not re-arm when the reader changes desk',
        'the switch stayed on for four seconds on the second desk');
    } else {
      check(false, 'it does not re-arm when the reader changes desk', 'no second desk tab found');
    }
    await ctx.close();
  }

  /* 2. interrupted mid-sequence, the reader is still left a whole draft ------ */
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await openPage(ctx);
    await showBoth(page);
    const off = await until(page, (s) => s.checked === 'false');
    /* Act in the gap, the way a reader reaching for the mouse the instant they
       notice the text move would. Inert text, so this goes through the section
       listeners and not through any switch's own handler. */
    await page.click('#demo .demo-beat-note', { force: true }).catch(() => {});
    const back = await until(page, (s) => s.checked === 'true' && s.inDraft, 4000);
    check(off.ok && back.ok,
      'interrupting between the two steps still leaves a whole draft',
      off.ok
        ? `${KEY} ${back.last.checked}, ${FIGURE} in draft ${back.last.inDraft}`
        : 'never went off, so the interrupt proved nothing',
    );
    await ctx.close();
  }

  /* 3. reduced motion: absent, not merely slower ---------------------------- */
  {
    const ctx = await browser.newContext({ viewport: DESKTOP, reducedMotion: 'reduce' });
    const page = await openPage(ctx);
    await showBoth(page);
    const { moved } = await stillFor(page, 4000);
    check(!moved, 'it never runs for prefers-reduced-motion', 'watched four seconds');
    await ctx.close();
  }

  /* 4. a real person takes over, through the section listeners -------------- */
  {
    for (const [how, act] of [
      ['a pointer on inert text', (p) => p.click('#demo .demo-beat-note', { force: true })],
      /* Dispatched straight at the section. This used to be a real keypress
         preceded by a click on inert text, to get focus into the section - and
         that click was what stood the run down, so this case passed for years
         without the key ever being the reason. Found when a change to the
         pointer rule made the click stop counting and this went red with it. */
      ['a key', (p) => p.dispatchEvent('#demo', 'keydown', { key: 'ArrowRight' })],
      ['focus reaching a switch', (p) => p.focus(`#demo .demo-sw[data-src="rules"]`)],
    ]) {
      const ctx = await browser.newContext({ viewport: DESKTOP });
      const page = await openPage(ctx);
      await showBoth(page);
      /* Inside the arming window and before the removing step, which is where a
         person who has just arrived at the section actually is. */
      await page.waitForTimeout(150);
      /* No `.catch()` here. A silenced act is a check that passes because
         nothing happened, which is the failure mode this suite keeps finding
         in itself. */
      await act(page);
      const { moved } = await stillFor(page, 4000);
      check(!moved, `it stands down for ${how}`, 'nothing moved for four seconds after');
      await ctx.close();
    }
  }

  /* 4c. a thumb travelling past is not a person taking over ----------------- */
  {
    /* The mouse cases above are right: nobody clicks a paragraph by accident,
       so a click is an act. A touch pointerdown on inert text is not the same
       thing - it is how a scroll begins. Any touch device large enough for the
       sequence to arm used to cancel it with the very press that carried the
       reader past, which killed the demonstration on exactly the devices whose
       readers, per Demo.tsx, "never saw the proof".

       Not the phone case: there the sequence declines to play at all, and
       check 5 asserts that separately. This is the tablet and the touch
       laptop, at a viewport where it does arm. */
    const ctx = await browser.newContext({ viewport: DESKTOP, hasTouch: true });
    const page = await openPage(ctx);
    await showBoth(page);
    await page.waitForTimeout(150);
    const box = await (await page.$('#demo .demo-beat-note')).boundingBox();
    await page.touchscreen.tap(Math.round(box.x + 4), Math.round(box.y + 4));
    const off = await until(page, (s) => s.checked === 'false');
    check(
      off.ok,
      'a thumb on inert text does not stand it down',
      off.ok ? `ran ${off.took}ms after the tap` : 'the tap cancelled the sequence',
    );
    await ctx.close();
  }

  /* 4b. the next letter is a NEW letter ------------------------------------- */
  {
    /* The founder found this one by using the page. Edit the draft, send it,
       deal the next letter, and the reader's own typing was still there on a
       letter it was never written for. The body is `contentEditable`, so the
       browser mutates those nodes directly and React never learns; `reset()`
       then reconciles to an identical tree and changes nothing.

       It matters more than a stale string. The whole argument of this section
       is that each draft is built from the file. A draft that carries the last
       one's edits is the page demonstrating the opposite of its own claim. */
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await openPage(ctx);
    await showBoth(page);
    const body = () => page.evaluate(() =>
      (document.querySelector('#demo-body')?.textContent || '').replace(/\s+/g, ' ').trim());
    const atRest = await body();

    const press = async (re) => {
      for (const btn of await page.$$('#demo button')) {
        if (re.test((await btn.textContent()) || '')) { await btn.click(); return true; }
      }
      return false;
    };
    await press(/^(edit|rediger|redaguoti)/i);
    await page.waitForTimeout(250);
    await page.evaluate(() => {
      const el = document.querySelector('#demo-body');
      el.focus();
      const r = document.createRange();
      r.selectNodeContents(el);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    });
    await page.keyboard.type('EDITED BY THE VISITOR');
    await page.waitForTimeout(200);
    const edited = await body();

    await press(/^(send|send|siųsti)/i);
    await page.waitForTimeout(400);
    const dealt = await press(/next letter|næste brev|kitas laiškas/i);
    await page.waitForTimeout(600);
    const after = await body();

    check(edited.includes('EDITED BY THE VISITOR'), 'the reader can edit the draft',
      edited.slice(0, 40));
    check(dealt && after === atRest && !after.includes('EDITED BY THE VISITOR'),
      'and the next letter is a new draft, not the one they edited',
      after === atRest ? 'back to the written draft' : after.slice(0, 56));
    await ctx.close();
  }

  /* 4c. the same bug, on the three paths the first fix did not reach -------- */
  {
    /* The founder reported this for "next letter". A verifier then found it
       alive on three more paths, and two of them left the draft EMPTY: a
       switch toggled after an edit, "Put it all back" after an edit, and one
       Backspace over the whole body, after which the control whose entire job
       is to put it back could not, while the live region announced that the
       draft was whole again.

       One check per path, because the first fix passed a check that tested
       only the path it fixed. */
    const paths = [
      ['a source is switched after an edit', async (page) => {
        await page.click('#demo .demo-sw[data-src="rules"]');
      }],
      ['the reader presses put it all back after an edit', async (page, press) => {
        for (const k of ['rules', 'deadline', 'file', 'deductions', 'tone']) {
          await page.click(`#demo .demo-sw[data-src="${k}"]`);
          await page.waitForTimeout(60);
        }
        await press(/put it all back|sæt det hele tilbage|grąžinti/i);
      }],
    ];
    for (const [name, act] of paths) {
      for (const wipe of [false, true]) {
        const ctx = await browser.newContext({ viewport: DESKTOP });
        const page = await openPage(ctx);
        await showBoth(page);
        const body = () => page.evaluate(() =>
          (document.querySelector('#demo-body')?.textContent || '').replace(/\s+/g, ' ').trim());
        const press = async (re) => {
          for (const btn of await page.$$('#demo button')) {
            if (re.test((await btn.textContent()) || '')) { await btn.click(); return true; }
          }
          return false;
        };
        const atRest = await body();
        await press(/^(edit|ret|taisyti)/i);
        await page.waitForTimeout(220);
        await page.evaluate(() => {
          const el = document.querySelector('#demo-body');
          el.focus();
          const r = document.createRange();
          r.selectNodeContents(el);
          const sel = getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
        });
        if (wipe) await page.keyboard.press('Backspace');
        else await page.keyboard.type('EDITED BY THE VISITOR ');
        await page.waitForTimeout(180);
        await press(/^(done|færdig|atlikta)/i);
        await page.waitForTimeout(280);
        await act(page, press);
        await page.waitForTimeout(600);
        const after = await body();
        check(
          after.length > 60 && !after.includes('EDITED BY THE VISITOR'),
          `the draft comes back when ${name}${wipe ? ', even wiped' : ''}`,
          after.length > 60 ? 'rebuilt from the clauses' : `left ${after.length} characters`,
        );
        await ctx.close();
      }
    }
  }

  /* 5. it declines to play where the reader cannot see both halves ---------- */
  {
    const ctx = await browser.newContext({ viewport: PHONE });
    const page = await openPage(ctx);
    await showStripOnly(page);
    const seen = await page.evaluate((key) => {
      const effect = document.querySelector(`#demo .demo-clause[data-clause="${key}"]`);
      if (!effect) return null;
      const r = effect.getBoundingClientRect();
      const h = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
      return r.height ? +(h / r.height).toFixed(2) : 0;
    }, KEY);
    const { moved } = await stillFor(page, 4000);
    check(seen !== null && seen < 0.9 && !moved,
      'on a phone, where the draft is off screen, it does not play to nobody',
      `clause ${seen} on screen with the strip centred, moved ${moved}`);
    await ctx.close();
  }

  /* 6b. scrolled off before it moves, the run is given back not spent -------- */
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await openPage(ctx);
    await showBoth(page);
    /* Away again well inside the wait, so nothing has moved yet. */
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    const awayFor = await stillFor(page, 2500);
    check(!awayFor.moved, 'scrolling away before it moves stops it',
      'nothing moved in two and a half seconds at the top of the page');

    await showBoth(page);
    const off = await until(page, (s) => s.checked === 'false' && !s.inDraft, 4000);
    const back = await until(page, (s) => s.checked === 'true' && s.inDraft, 4000);
    check(off.ok && back.ok, 'and coming back gets the demonstration, not a spent run',
      off.ok ? 'performed in full on the second look' : 'never performed, so the run was spent');
    await ctx.close();
  }
} finally {
  /* A throw anywhere above used to leak the Chromium. */
  await browser.close();
}

console.log(failures === 0 ? '\nDEMONSTRATION HOLDS\n' : `\n${failures} CHECK(S) FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
