/**
 * Does the consent gate actually hold?
 *
 * Bundles the REAL consent notice and the REAL pixel and analytics loaders with
 * a pixel ID and a PostHog key configured, renders them in jsdom, and inspects
 * what reached the document at each step. A gate that is described in a comment
 * and a gate that works look identical in a diff; this tells them apart.
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
      // Empty on purpose: exercises the default in src/lib/env.ts,
      // which is the origin the page serves from today.
      'import.meta.env.VITE_SITE_ORIGIN': '""',
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
  check(a.noscriptPixels === 1, 'the noscript fallback is added');
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(
  failures === 0 ? '\nCONSENT GATE HOLDS' : `\n${failures} PROBLEM(S) FOUND`,
);
process.exit(failures === 0 ? 0 : 1);
