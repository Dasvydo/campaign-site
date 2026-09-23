/**
 * Does the consent gate actually hold?
 *
 * Bundles the REAL consent notice and the REAL pixel and analytics loaders with
 * a pixel ID and a PostHog key configured, renders them in jsdom, and inspects
 * what reached the document at each step. A gate that is described in a comment
 * and a gate that works look identical in a diff; this tells them apart.
 *
 * TWO HARNESSES, because the gate has two halves and they need different
 * instruments.
 *
 *   harness-consent.tsx runs against the REAL posthog-js and the REAL Meta
 *   loader, and answers "what reached the device, and what was said to Meta".
 *
 *   harness-consent-queue.tsx runs with posthog-js aliased to a recording stub
 *   and answers the question the first one structurally cannot: what happens
 *   to an event raised BEFORE the visitor answers. analytics.ts holds it in a
 *   module-private array and discards it on Decline; nothing outside the
 *   module can see that array, so the only honest place to watch is the call
 *   the flush would make. Added 2026-09-23, after two separate mutations that
 *   relaxed exactly that promise were found to leave this whole suite green.
 *
 *   node scripts/verify-consent.mjs
 */
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const work = mkdtempSync(join(tmpdir(), 'dl-consent-'));
const PIXEL = '1584074833462346';

let failures = 0;
const check = (ok, label, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures += 1;
};

try {
  const bundle = join(work, 'consent.js');
  await build({
    entryPoints: [join(root, 'scripts/harness-consent.tsx')],
    bundle: true,
    outfile: bundle,
    format: 'iife',
    platform: 'browser',
    jsx: 'automatic',
    target: 'es2020',
    logLevel: 'silent',
    define: {
      'import.meta.env.DEV': 'false',
      'import.meta.env.VITE_LEAD_WEBHOOK_URL': '""',
      'import.meta.env.VITE_BOOKING_URL': '""',
      // Both configured on purpose: an empty value would pass the test for the
      // wrong reason.
      'import.meta.env.VITE_POSTHOG_KEY': JSON.stringify('phc_test'),
      'import.meta.env.VITE_POSTHOG_HOST': JSON.stringify('https://eu.i.posthog.com'),
      'import.meta.env.VITE_META_PIXEL_ID': JSON.stringify(PIXEL),
      'process.env.NODE_ENV': '"development"',
    },
    loader: { '.css': 'empty' },
  });

  const vc = new VirtualConsole();
  vc.on('jsdomError', () => {});
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://campaign-site-azure.vercel.app/da',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole: vc,
  });
  const w = dom.window;
  w.IS_REACT_ACT_ENVIRONMENT = true;
  // jsdom does not implement these; React's act scheduler needs them.
  w.MessageChannel = MessageChannel;
  w.MessagePort = MessagePort;
  w.queueMicrotask = queueMicrotask;
  if (!w.matchMedia) {
    w.matchMedia = () => ({
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    });
  }

  w.eval(readFileSync(bundle, 'utf8'));
  await w.__RUN__();
  const r = w.__RESULTS__;

  console.log('\nThe notice itself');
  check(r.noticeShown, 'it appears when no choice has been made');
  check(r.noticeLabelled, 'it is a labelled dialog');
  check(r.noticeNotModal, 'it is explicitly not modal, so the page stays usable');
  check(r.buttonCount === 2, 'it offers exactly two choices', String(r.buttonCount));
  check(
    r.buttonClassesIdentical,
    'accept and decline are rendered identically, neither is demoted',
  );

  console.log('\nBefore any choice: nothing may reach the device');
  const b = r.beforeChoice;
  check(b.fbScripts === 0, 'no Meta pixel script is injected', `${b.fbScripts} found`);
  check(b.noscriptPixels === 0, 'no tracking pixel image is injected');
  check(b.trBeacons === 0, 'no beacon to facebook.com/tr is built at all');
  check(!b.fbqDefined, 'window.fbq is never defined');
  check(b.cookies === '', 'no cookie is written', JSON.stringify(b.cookies));
  check(
    !b.storageKeys.some((k) => k.startsWith('ph_') || k.includes('posthog')),
    'PostHog writes nothing to localStorage',
    b.storageKeys.join(',') || 'empty',
  );

  console.log('\nAfter declining');
  const d = r.afterDecline;
  check(r.choiceAfterDecline === 'denied', 'the choice is recorded');
  check(r.noticeGoneAfterDecline, 'the notice stops asking');
  check(d.fbScripts === 0, 'still no pixel, even after a tracked event fires');
  check(!d.fbqDefined, 'window.fbq is still undefined');
  check(
    !d.storageKeys.some((k) => k.startsWith('ph_') || k.includes('posthog')),
    'still nothing from PostHog',
  );
  check(
    d.storageKeys.includes('dl_consent'),
    'only our own record of the refusal is stored',
    d.storageKeys.join(','),
  );

  console.log('\nWithdrawing and changing the answer');
  check(r.footerReopenPresent, 'the colophon offers a way back');
  check(r.noticeReopened, 'the notice reopens on request');
  check(r.choiceAfterReopen === null, 'the old answer is cleared, not assumed');

  console.log('\nAfter accepting');
  const a = r.afterAccept;
  check(r.choiceAfterAccept === 'granted', 'the choice is recorded');
  check(a.fbScripts === 1, 'the pixel loads, exactly once', `${a.fbScripts} found`);
  check(a.fbqDefined, 'window.fbq is defined');
  /* Inverted on 2026-09-22, and this is the point of the test rather than a
     relaxation of it. This used to assert the noscript fallback WAS added.
     It was, and it was also firing: setting `.src` on an element made by
     document.createElement sends the request immediately, while it is still
     detached, so parking it in a <noscript> afterwards changed nothing. Every
     visitor with JavaScript sent two PageViews for one page load, neither
     carrying an event_id, so Meta could not deduplicate them and landing page
     views read about twice high. The fallback could never have served a visitor
     without JavaScript either, because pixel.ts is JavaScript.

     fbevents.js is now the only thing on this page that speaks to Meta. */
  check(a.noscriptPixels === 0, 'no noscript beacon is built, so PageView is not doubled');
  check(a.trBeacons === 0, 'the page builds no facebook.com/tr beacon of its own');

  /* What the page actually SAYS to Meta, not just that it opened the line.

     The checks above prove fbevents.js loads once and that this page builds no
     beacon of its own. They say nothing about the calls, and the calls are the
     data: `fbq('track', 'ViewContent', {content_name: 'pricing'})` would leave
     every one of them green while telling Meta what a named visitor was
     shopping for.

     Two calls and no more is the whole Meta surface of this page today.
     `initMetaPixel` in src/lib/pixel.ts makes both of them, and `pixelTrack`,
     the only other way to reach fbq, has no caller anywhere in src/ - so an
     extra entry in this array means somebody added one, which is exactly when
     a human should be reading it.

     What this does NOT catch, measured rather than assumed: removing the
     consent guard from `pixelTrack` leaves this green. The harness calls
     pixelTrack with a ViewContent while consent stands declined, but at that
     moment `window.fbq` does not exist yet - the loader runs on Accept - so
     the call goes nowhere for a reason that has nothing to do with the guard,
     and `fbq.queue` is only created afterwards. The declined path is held by
     the footprint checks above instead, which is the right instrument for it.
     Verified by deleting `!consentGranted()` from pixelTrack: still green
     here, and it stays green because nothing in src/ calls pixelTrack at all.
     That is a gap in the suite, not in this check. */
  const said = (a.fbqQueue ?? []).map((c) => c.slice(0, 2));
  check(
    Array.isArray(a.fbqQueue) &&
      JSON.stringify(said) === JSON.stringify([['init', PIXEL], ['track', 'PageView']]),
    'the pixel is told init and PageView, in that order, and nothing else',
    a.fbqQueue ? JSON.stringify(a.fbqQueue) : 'fbq.queue was never created',
  );

  /* ---- the queue, on both sides of the fork ----------------------------- */

  const queueBundle = join(work, 'queue.js');
  await build({
    entryPoints: [join(root, 'scripts/harness-consent-queue.tsx')],
    bundle: true,
    outfile: queueBundle,
    format: 'iife',
    platform: 'browser',
    jsx: 'automatic',
    target: 'es2020',
    logLevel: 'silent',
    /* The one substitution in this file, and it is scoped to this bundle. The
       harness above keeps the real library precisely so the device checks
       stay real. */
    alias: { 'posthog-js': join(root, 'scripts/stub-posthog.ts') },
    define: {
      'import.meta.env.DEV': 'false',
      'import.meta.env.VITE_LEAD_WEBHOOK_URL': '""',
      'import.meta.env.VITE_BOOKING_URL': '""',
      'import.meta.env.VITE_POSTHOG_KEY': JSON.stringify('phc_test'),
      'import.meta.env.VITE_POSTHOG_HOST': JSON.stringify('https://eu.i.posthog.com'),
      'import.meta.env.VITE_META_PIXEL_ID': '""',
      'process.env.NODE_ENV': '"development"',
    },
    loader: { '.css': 'empty' },
  });
  const queueSrc = readFileSync(queueBundle, 'utf8');

  /* A window each. analytics.ts keeps `started`, `ph` and `pending` as module
     state, so the two paths cannot share one. */
  async function runQueue(mode) {
    const qvc = new VirtualConsole();
    qvc.on('jsdomError', () => {});
    const qdom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'https://teams.doviloop.dev/da',
      runScripts: 'outside-only',
      pretendToBeVisual: true,
      virtualConsole: qvc,
    });
    const qw = qdom.window;
    qw.IS_REACT_ACT_ENVIRONMENT = true;
    qw.MessageChannel = MessageChannel;
    qw.MessagePort = MessagePort;
    qw.queueMicrotask = queueMicrotask;
    if (!qw.matchMedia) {
      qw.matchMedia = () => ({
        matches: false,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
      });
    }
    qw.__QUEUE_MODE__ = mode;
    qw.eval(queueSrc);
    await qw.__RUN_QUEUE__();
    return qw.__QUEUE_RESULTS__;
  }

  console.log('\nEvents raised before the visitor has answered');
  const accepted = await runQueue('accept');
  const declined = await runQueue('decline');

  check(
    accepted.startedUndecided === 0 && declined.startedUndecided === 0,
    'the analytics client is not even started while the notice is up',
    `init called ${accepted.startedUndecided}/${declined.startedUndecided} time(s)`,
  );
  check(
    accepted.capturedUndecided.length === 0 && declined.capturedUndecided.length === 0,
    'an event raised while the notice is up is not sent',
    [...accepted.capturedUndecided, ...declined.capturedUndecided].join(',') || 'nothing sent',
  );
  /* The half that keeps the two below honest. If the queue simply lost
     everything, every "nothing was sent" line here would pass. */
  check(
    accepted.pressed && accepted.choice === 'granted' &&
      accepted.capturedAfterAccept.join(',') === 'page_view',
    'and IS sent once the visitor accepts, so the queue is really a queue',
    accepted.capturedAfterAccept.join(',') || 'nothing arrived',
  );

  check(
    declined.pressed && declined.choice === 'denied' &&
      declined.capturedAfterDecline.length === 0,
    'declining throws the held event away rather than sending it',
    declined.capturedAfterDecline.join(',') || 'nothing sent',
  );
  /* The promise in full. Declining is not a pause.

     Empty, not "does not contain the held page_view". Asserting the absence of
     one named event let a real mutation through: with only the drop inside
     `track()` removed and `applyConsent()` left alone, the event raised AFTER
     the refusal was queued instead of dropped and arrived on the later accept,
     while the check still passed because it was looking for a different name.
     Nothing raised before a yes may arrive on the back of that yes - whichever
     side of the refusal it was raised on. */
  check(
    declined.reopenPresent && declined.pressedAccept &&
      declined.choiceAfterAccept === 'granted' &&
      declined.capturedAfterLaterAccept.length === 0,
    'and a later change of mind resurrects nothing that was raised before it',
    declined.capturedAfterLaterAccept.join(',') || 'nothing sent',
  );
  check(
    declined.capturedAfterFreshRaise.includes('demo_desk'),
    'while an event raised after that accept does go, so the line above means something',
    declined.capturedAfterFreshRaise.join(',') || 'nothing sent',
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(
  failures === 0 ? '\nCONSENT GATE HOLDS' : `\n${failures} PROBLEM(S) FOUND`,
);
process.exit(failures === 0 ? 0 : 1);
