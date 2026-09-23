/**
 * End-to-end verification of the page, in jsdom, over real HTTP where a real
 * request is what is being tested.
 *
 * WHAT THIS FILE USED TO BE, AND WHY THE NAME STAYS.
 *
 * It verified the qualifier payload: it bundled the real <Qualifier />, filled
 * both screens of the fit-check form, submitted, and let lib/lead.ts POST over
 * real HTTP to a mock that validated the body strictly against the contract in
 * 00-START-HERE.md. Around that it had grown the checks on the price band's
 * arithmetic, the calculator driven across a grid, and the founding cohort's
 * claim in a state the shipped offer could not reach.
 *
 * The form, the contract, the price band and the calculator are all deleted.
 * Every check that measured them is deleted too, rather than repointed at
 * something nearby: a check whose subject is gone does not become a weaker
 * check, it becomes a green line over nothing, and this repository has shipped
 * that twice.
 *
 * What is kept is what still has a subject, and it is not a small thing:
 * nothing else in the suite looks at the head a crawler and a link unfurler
 * read, and nothing else drives the never-lose-a-lead queue. The npm script
 * keeps its name so the workflow and the docs that call it keep working.
 *
 * Checks:
 *   1. All three locales render, with every content key filled, every expected
 *      string reaching the DOM, and no English leaking into /da or /lt
 *   2. The head: html lang, title, description, canonical, four hreflang
 *      alternates, and every absolute URL in it on the campaign's own origin
 *   3. The share card each locale promises, on both scrapers, with alt text
 *   4. The surviving sections, present and in document order
 *   5. The hero's drafted reply, and the audience folders against the worked
 *      example's desks
 *   6. Never lose a lead: two attempts, the localStorage queue, the drain on
 *      the next load, and the fourteen day expiry
 *   7. Static checks on the content files, and the share card PNGs on disk
 *   8. Every PostHog event name the page may raise is actually raised
 *
 *   npm run verify:payload
 */
import { spawn } from 'node:child_process';
import { readFileSync, readdirSync, rmSync, mkdtempSync, existsSync } from 'node:fs';
import { localeSource } from './content-src.mjs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* Read out of the component rather than repeated here. A constant copied into
   the checker is a constant that agrees with itself and with nothing else: the
   old origin would have passed a hardcoded copy of the old origin forever. */
const SITE_ORIGIN = (() => {
  const src = readFileSync(resolve(root, 'src/LocalePage.tsx'), 'utf8');
  const m = src.match(/const SITE_ORIGIN = '([^']+)'/);
  if (!m) throw new Error('src/LocalePage.tsx: no SITE_ORIGIN to check the head against');
  /* Reading the constant proves the eight tags agree with each other. It
     cannot prove they agree with reality: put the vercel.app host back and
     both sides move together and every check below still passes. I tried it.
     So the constant is judged too, against the one thing that makes an origin
     wrong here: it has to be the domain the ads point at, not the hostname
     the host happens to serve it on. A deployment hostname in the canonical
     is the exact defect this suite missed for the whole build. */
  const host = new URL(m[1]).host;
  if (!/^[a-z0-9-]+\.doviloop\.dev$/.test(host)) {
    console.error(
      `\n  SITE_ORIGIN in src/LocalePage.tsx is ${m[1]}.\n` +
        `  The head's canonical, og:url, og:image and hreflang alternates all\n` +
        `  derive from it, and ${host} is not a doviloop.dev domain. A hosting\n` +
        `  provider's own hostname there hands crawlers and link unfurlers an\n` +
        `  origin the visitor never sees.\n`,
    );
    process.exit(1);
  }
  return m[1];
})();
/* The mock's port.

   It was the bare literal 8799. That is fine for one run at a time and wrong
   the moment two are in flight: four independent verifiers running this suite
   in parallel worktrees all bound, or failed to bind, the same port, and their
   POSTs landed in whichever mock currently owned it. The symptom was a suite
   that failed on an UNMODIFIED tree with "mock received 4 payloads (got 0)",
   then "(got 6)", then "(got 8)" — a green run and a red run from identical
   source, which is worse than a broken check because it teaches people to
   re-run until it passes.

   Derived from the process id so concurrent runs cannot collide, and
   overridable with MOCK_PORT for anyone who needs a fixed one. The range
   avoids the ephemeral ports the OS hands out. */
const PORT = Number(process.env.MOCK_PORT) || 20000 + (process.pid % 20000);
const ENDPOINT = `http://127.0.0.1:${PORT}/api/lead`;
const work = mkdtempSync(join(tmpdir(), 'dl-verify-'));
const LOG = join(work, 'received.ndjson');

let failures = 0;
const check = (ok, label, detail = '') => {
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures += 1;
};

async function waitForMock(tries = 60) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(ENDPOINT, { method: 'OPTIONS' });
      if (res.status === 204) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  return false;
}

/**
 * The same source with every comment removed.
 *
 * The check at the foot of this file asks whether an event is RAISED by
 * looking for `track('name'` in the source. Read raw, that is a text search
 * that a comment satisfies: deleting the real `track('price_seen')` from
 * LocalePage.tsx and leaving `/* was: track('price_seen') *\/` in its place
 * kept the gate green, measured on 2026-09-23. The page would have stopped
 * raising the one event the price-first layout is judged on, and the line that
 * exists to notice would have read PASS.
 *
 * A comment is where a call goes to stop being a call, so the comments come
 * out before anything is searched for. This is a scanner rather than a regex
 * because `//` inside a string literal is not a comment and 'https://' is all
 * over this codebase. Strings are tracked in all three quotings; regex
 * literals are not, which is safe here because no regex in src/ contains a
 * quote character, and the failure mode if one ever does is over-stripping,
 * which makes the positive check FAIL rather than pass.
 */
function uncommented(src) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      if (c === '\\') { out += c + (next ?? ''); i += 2; continue; }
      if (c === quote) quote = null;
      out += c;
      i += 1;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; out += c; i += 1; continue; }
    if (c === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (c === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
      i += 2;
      /* Left as a newline so line-oriented reading of the result still works
         and two identifiers either side of a comment cannot fuse. */
      out += '\n';
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

async function main() {
  console.log('\nDoviLoop campaign-site, page verification\n');

  /* 1. mock webhook --------------------------------------------------------
     Still here, and still a real HTTP server, because the recovery gate below
     is about what happens when a POST fails and then stops failing. Nothing
     else in this file needs it. */
  const mock = spawn(process.execPath, [join(root, 'scripts/mock-webhook.mjs')], {
    env: { ...process.env, MOCK_PORT: String(PORT), MOCK_LOG: LOG },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  mock.stdout.on('data', (d) => process.stdout.write(`  ${d}`));
  mock.stderr.on('data', (d) => process.stderr.write(`  ${d}`));

  const up = await waitForMock();
  if (!up) {
    console.error('  FAIL  mock webhook did not start');
    mock.kill();
    process.exit(1);
  }

  try {
    /* 2. a window to render into ------------------------------------------ */
    const vc = new VirtualConsole();
    vc.on('jsdomError', () => {});
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'https://teams.doviloop.dev/?utm_source=meta&utm_medium=paid_social',
      pretendToBeVisual: true,
      runScripts: 'outside-only',
      virtualConsole: vc,
    });

    const w = dom.window;
    w.IS_REACT_ACT_ENVIRONMENT = true;
    w.fetch = (...args) => fetch(...args);
    w.Headers = Headers;
    w.Request = Request;
    w.Response = Response;
    w.AbortController = AbortController;
    // jsdom does not implement these; React's act scheduler and posthog need them.
    w.MessageChannel = MessageChannel;
    w.MessagePort = MessagePort;
    w.queueMicrotask = queueMicrotask;
    if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });

    /* 3. the whole page, in all three locales ----------------------------- */
    console.log('Full page render, all three locales');
    const pageBundleFile = join(work, 'page.js');
    await build({
      entryPoints: [join(root, 'scripts/harness-page.tsx')],
      bundle: true,
      outfile: pageBundleFile,
      format: 'iife',
      platform: 'browser',
      jsx: 'automatic',
      target: 'es2020',
      logLevel: 'silent',
      define: {
        'import.meta.env.DEV': 'false',
        'import.meta.env.VITE_LEAD_WEBHOOK_URL': JSON.stringify(ENDPOINT),
        'import.meta.env.VITE_BOOKING_URL': JSON.stringify('https://calendar.example/mock'),
        'import.meta.env.VITE_POSTHOG_KEY': '""',
        'import.meta.env.VITE_POSTHOG_HOST': '""',
        'import.meta.env.VITE_META_PIXEL_ID': '""',
        'process.env.NODE_ENV': '"development"',
      },
      loader: { '.css': 'empty' },
    });
    w.eval(readFileSync(pageBundleFile, 'utf8'));
    await w.__RUN_PAGE__();
    const pages = w.__PAGE_RESULTS__;

    for (const p of pages) {
      console.log(`  /${p.locale === 'en' ? '' : p.locale}`);
      check(p.crashed === null, `    renders without throwing`, p.crashed ?? '');
      check(p.blankKeys.length === 0, `    every content key has a value`, p.blankKeys.join(', '));
      check(p.missing.length === 0, `    every expected string reaches the DOM`, p.missing.slice(0, 2).join(' | '));
      check(p.leaked.length === 0, `    no English master copy leaked in`, p.leaked.slice(0, 2).join(' | '));
      check(
        p.sectionsFound.length === p.sectionsExpected.length,
        `    all ${p.sectionsExpected.length} sections present`,
        p.sectionsFound.join(','),
      );
      /* Presence would pass with the sections in any order. The calculator
         has to come before the price, and the price before anybody is asked
         for an email address. */
      check(
        p.sectionOrder.join(',') === p.sectionsExpected.join(','),
        `    the sections are in document order`,
        p.sectionOrder.join(','),
      );
      check(p.htmlLang === (p.locale === 'en' ? 'en' : p.locale), `    html lang is ${p.locale}`, p.htmlLang);
      check(p.title.length > 20 && p.description.length > 60, `    title and description are set`);
      check(p.canonical.endsWith(p.locale === 'en' ? '/' : `/${p.locale}`), `    canonical points at this locale`, p.canonical);
      check(p.hreflangs.length === 4, `    hreflang alternates for all locales plus x-default`, p.hreflangs.join(','));
      /* The host, not just the path. Every one of these named the vercel.app
         deployment while the ads pointed at the custom domain, and the line
         above passed the whole time, because every path ends the same way on
         either host. A canonical on a hostname the visitor never sees splits
         the ranking between two live origins serving byte identical HTML and
         puts the wrong domain on every share card. */
      const strays = p.headHosts.filter((u) => !u.startsWith(SITE_ORIGIN + '/'));
      check(
        p.headHosts.length === 8 && strays.length === 0,
        `    canonical, og:url, og:image, twitter:image and all four alternates are on ${SITE_ORIGIN}`,
        strays.length ? strays.join(' ') : `${p.headHosts.length} urls`,
      );
      /* A large-image card with no image unfurls as a bare line of text on
         LinkedIn and Slack, and lets Facebook scrape whatever raster it finds.
         There was no og:image at all, in any locale, and twitter:card has said
         summary_large_image since the first commit. */
      check(
        p.twitterCard === 'summary_large_image' &&
          p.ogImage === `${SITE_ORIGIN}/og-${p.locale}.png` &&
          p.twitterImage === p.ogImage,
        `    the share card is this locale's own, on both scrapers`,
        `${p.ogImage || 'no og:image'} / ${p.twitterImage || 'no twitter:image'}`,
      );
      check(
        p.ogImageAlt.length > 30 && p.ogLocale === { en: 'en_GB', da: 'da_DK', lt: 'lt_LT' }[p.locale],
        `    the card carries alt text and an og:locale`,
        `${p.ogLocale} / ${p.ogImageAlt.slice(0, 40)}`,
      );
      check(p.hasSkipLink && p.hasMainLandmark && p.hasFooter, `    skip link, main landmark and footer present`);
      check(
        p.previewIsExcerpt,
        `    the hero quotes the draft the worked example shows, word for word`,
      );
      /* The card, not the string comparison above it. A verifier deleted the
         whole card and every check in this repository stayed green. */
      check(
        p.heroCardWants.every((want) => p.heroCardText.includes(want)),
        `    the drafted reply is actually on the page, not merely described`,
        p.heroCardText ? p.heroCardText.slice(0, 56) : 'no card in the hero',
      );
      {
        const bad = p.markCopies
          .map(([name, ds]) => {
            if (ds.length === 0) return `${name}: not on the page`;
            const wrong = ds.filter((d) => !p.markWants.includes(d));
            if (wrong.length) return `${name}: ${wrong.length} path(s) not the definition`;
            if (!p.markWants.every((w) => ds.includes(w))) return `${name}: missing half the mark`;
            return null;
          })
          .filter(Boolean);
        check(
          bad.length === 0,
          `    every copy of the mark draws the one definition, shape for shape`,
          bad.length ? bad.join(' | ') : `${p.markCopies.length} copies, all matching`,
        );
      }
      {
        /* Every folder names its own trade's five, in order. */
        const bad = p.whoFolders
          .map((f) => {
            if (f.want.length === 0) return `${f.tab}: no desk answers to its id`;
            if (f.shown.length !== f.want.length) {
              return `${f.tab}: ${f.shown.length} named, ${f.want.length} on the desk`;
            }
            const off = f.shown.findIndex((v, i) => v !== f.want[i]);
            return off === -1 ? null : `${f.tab}: "${f.shown[off]}" where "${f.want[off]}" belongs`;
          })
          .filter(Boolean);
        check(
          bad.length === 0,
          `    each folder is drafted out of its own trade's files`,
          bad.length ? bad.join(' | ') : `${p.whoFolders.length} folders, each matching its desk`,
        );
      }
      check(p.deskCount === 3, `    the worked example offers three desks`, String(p.deskCount));
      /* Three languages, three different paths, and the one you are reading
         named on the control itself. */
      check(
        p.localeHrefs.length === 3 && new Set(p.localeHrefs).size === 3,
        `    the language picker offers all three, each to its own page`,
        p.localeHrefs.join(' ') || 'none',
      );
      check(
        p.localeSummary.length > 0,
        `    and says which one you are reading`,
        p.localeSummary || 'blank',
      );
      /* The page asks for one thing in one set of words, wherever it asks.
         The href those buttons carry is dangling until the trial signup is
         built; the wording is what is held here. */
      check(
        p.fitCtaLabels.length > 0 &&
          p.fitCtaLabels.every((l) => l === p.fitCtaInContent) &&
          p.fitNavLinks === 0,
        `    every call to action says the one thing the copy says`,
        `${p.fitCtaLabels.length} button(s): ${[...new Set(p.fitCtaLabels)].join(' | ') || 'none'}`,
      );
      /* The masthead is a table of contents. An entry that leads nowhere is
         worse than no entry, and one of them advertised a deleted funnel for
         two waves because nothing checked where it pointed. */
      check(
        p.navTargets.length > 0 && p.navTargets.every((t) => t.resolves),
        `    every masthead link lands on a section that exists`,
        p.navTargets.map((t) => `${t.href}${t.resolves ? '' : ' MISSING'}`).join(' '),
      );
      /* The audience folders and the worked example's desks are the same three
         trades in the same order, paired on the id both lists carry. */
      check(
        p.audienceIdsDistinct && p.deskIdsDistinct && p.audienceOrder === p.deskOrder,
        `    the folders and the desks are the same three trades, in the same order`,
        `${p.audienceOrder} vs ${p.deskOrder}`,
      );
      check(p.unassembled.length === 0,
        `    every figure reached the sentence that left a slot for it`,
        p.unassembled.join(' | '));
    }

    /* 4. never lose a lead: retry, queue, and drain on next load ---------- */
    console.log('\nWebhook failure recovery');

    const recoveryBundle = async (mode, endpoint) => {
      const out = join(work, `recovery-${mode}.js`);
      await build({
        entryPoints: [join(root, 'scripts/harness-recovery.ts')],
        bundle: true,
        outfile: out,
        format: 'iife',
        platform: 'browser',
        target: 'es2020',
        logLevel: 'silent',
        define: {
          'import.meta.env.DEV': 'false',
          'import.meta.env.VITE_LEAD_WEBHOOK_URL': JSON.stringify(endpoint),
          'import.meta.env.VITE_BOOKING_URL': '""',
          'import.meta.env.VITE_POSTHOG_KEY': '""',
          'import.meta.env.VITE_POSTHOG_HOST': '""',
          'import.meta.env.VITE_META_PIXEL_ID': '""',
          'process.env.NODE_ENV': '"development"',
        },
      });
      return readFileSync(out, 'utf8');
    };

    // Pass 1: the webhook is down. Two attempts, then the payload is queued.
    w.__MODE__ = 'fail';
    w.eval(await recoveryBundle('fail', `http://127.0.0.1:${PORT}/api/lead-fail`));
    await w.__RUN_RECOVERY__();

    const rec = w.__RECOVERY__;
    check(rec.submit?.delivered === false, 'a failing webhook is reported as not delivered');
    check(rec.submit?.attempts === 2, 'exactly two attempts are made, the original plus one retry', `got ${rec.submit?.attempts}`);
    check(rec.submit?.queued === true, 'the payload is written to the localStorage queue');
    check(rec.queuedAfterFailure === 1, 'the queue holds exactly one entry', `got ${rec.queuedAfterFailure}`);
    /* The whole object, not a fragment of it. It used to be checked field by
       field against the qualifier's contract; the queue never read a field of
       that contract and the next form will send a different shape, so what is
       held now is the promise the queue actually makes: what went in comes
       back out, nested values and all. Compared as JSON because the two sides
       crossed a jsdom boundary and a reference equality check would be
       meaningless. */
    check(
      Boolean(rec.queuedPayload) &&
        JSON.stringify(rec.queuedPayload) === JSON.stringify(rec.sentPayload),
      'the queued entry is the payload that was handed over, whole',
      rec.queuedPayload ? `${Object.keys(rec.queuedPayload).length} keys` : 'nothing queued',
    );

    // Pass 2: next page load, webhook is back. The queue drains.
    w.__MODE__ = 'flush';
    w.eval(await recoveryBundle('flush', ENDPOINT));
    await w.__RUN_RECOVERY__();

    check(w.__RECOVERY__.flush?.sent === 1, 'the queued lead is delivered on the next load');
    check(w.__RECOVERY__.queuedAfterFlush === 0, 'and the queue is emptied afterwards');

    /* Pass 3: the fourteen day cutoff.

       Recovered from scripts/verify-browser.py, which was the only thing that
       had ever exercised it and was removed on 2026-09-23. With
       VITE_LEAD_WEBHOOK_URL unset in production the queue is the live delivery
       path rather than a fallback, so an entry that can never be delivered
       staying on a visitor's device forever is the failure mode this cutoff
       exists for, and it had no gate.

       Two entries seeded either side of the line, read back through the
       module's own accessor. The webhook is not involved: nothing is being
       delivered here, so only age can remove one. */
    w.__MODE__ = 'age';
    w.eval(await recoveryBundle('age', ENDPOINT));
    await w.__RUN_RECOVERY__();
    const aged = w.__RECOVERY__.aged;
    check(
      Array.isArray(aged) && aged.length === 1 && aged[0] === 'age-13',
      'a queued lead older than fourteen days is dropped, a younger one is kept',
      Array.isArray(aged) ? `queue holds ${JSON.stringify(aged)}` : 'the queue was never read',
    );

    /* What actually went over the wire, read back from the mock's own log
       rather than from what the page says it did.

       This is the one mechanism in lead.ts that was paid for in production. A
       probe on 2026-09-21 established that the live webhook dedupes on the
       BODY and ignores the header, so a retry sending the id as a header only
       created a second lead every time it fired. The coverage for it was
       written against the fit-check form, and when that form was deleted the
       driver went with it - but the mechanism did not, and for one commit the
       suite could not tell the fixed behaviour from the broken one. Asserted
       here against the transport instead, so it no longer depends on which
       form is sending. */
    const wire = readFileSync(LOG, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l));

    check(wire.length > 0, 'the recovery pass reached the endpoint at all', `${wire.length} POST(s)`);
    check(
      wire.every((r) => typeof r.dedupe_in_body === 'string' && r.dedupe_in_body.length > 0),
      'every POST carries dedupe_id in the body, which is what the webhook reads',
      wire.map((r) => r.dedupe_in_body ?? 'MISSING').join(' '),
    );

    /* A retry must reuse its id, or the webhook cannot recognise the second
       attempt as the same lead and creates a duplicate - which is the failure
       the live probe found.

       The other half of the property, that two DIFFERENT leads get different
       ids, is deliberately not asserted here: this pass submits one lead and
       watches it fail twice and then flush, so every POST on the wire belongs
       to that one lead and a single id across all three is the correct
       result. Asserting distinctness against this fixture would fail on
       working code. It wants a second lead to be meaningful, and the fixture
       does not send one. */
    const attempts = wire.filter((r) => r.path === '/api/lead-fail');
    if (attempts.length > 1) {
      const ids = new Set(attempts.map((r) => r.dedupe_in_body));
      check(
        ids.size === 1,
        'a retry reuses the same id, so the webhook can recognise it',
        `${attempts.length} attempts, ${ids.size} distinct`,
      );
    }

    /* 5. static checks on the content files -------------------------------- */
    console.log('\nContent files');
    for (const f of ['en', 'da', 'lt']) {
      const src = localeSource(root, f);
      check(!src.includes('—'), `the ${f} copy contains no em dash`);
      check(!/lorem|ipsum|TODO|FIXME|XXX|placeholder text/i.test(src), `the ${f} copy contains no placeholder text`);
    }
    const daSrc = localeSource(root, 'da');
    const ltSrc = localeSource(root, 'lt');
    check(daSrc.includes('NEEDS NATIVE CHECK'), 'da.ts is marked NEEDS NATIVE CHECK');
    check(ltSrc.includes('NEEDS NATIVE CHECK'), 'the lt copy is marked NEEDS NATIVE CHECK');
    check(/Jūs|Jūsų/.test(ltSrc), 'the lt copy uses the formal Jus register');

    /* 6. the share cards the head promises actually exist -------------------
       The head can name /og-lt.png all day; if the file is not in public/ the
       scraper gets a 404 and the card is blank again, which is the state this
       was meant to end. Read the PNG header rather than trusting the name:
       Facebook and LinkedIn both reject an image under 200x200 and crop
       anything that is not close to 1.91:1. */
    console.log('\nShare cards');
    for (const locale of ['en', 'da', 'lt']) {
      const file = join(root, `public/og-${locale}.png`);
      if (!existsSync(file)) {
        check(false, `public/og-${locale}.png exists`, 'missing. Run npm run og');
        continue;
      }
      const buf = readFileSync(file);
      const png = buf.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
      /* IHDR is the first chunk and its width and height are big endian at
         byte 16. */
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      check(png && w === 1200 && h === 630, `    og-${locale}.png is a 1200x630 png`, `${w}x${h}`);
      /* Under 8 MB is Facebook's limit and under 5 MB is Twitter's; a card
         this simple lands near 250 KB, so anything near a megabyte means the
         generator drew something it should not have. */
      check(buf.length < 1024 * 1024, `    og-${locale}.png is under 1 MB`, `${(buf.length / 1024).toFixed(0)} KB`);
    }

    /* 7. every PostHog event name exists in the source --------------------- */
    console.log('\nPostHog event names');
    /* Read out of analytics.ts rather than listed here, and then looked for
       where an event is actually RAISED. Listing the names here and grepping
       both files for them was a check that agreed with itself: every name is
       in analytics.ts by definition, because analytics.ts is where the union
       is declared.

       NOT_RAISED_YET below is the exemption list and it is now empty. It held
       `pricing_view` for the months that name was declared against a price
       band which had been deleted and was expected back. The vocabulary was
       replaced on 2026-09-23 and nothing declares that name any more, at which
       point the entry stopped exempting anything at all: this loop only visits
       names the union declares, and that was no longer one of them. An
       exemption for a name that cannot occur is the same defect as a check
       whose subject is gone - it reads in a diff as a live decision and is
       inert - so it comes off rather than being left as furniture.

       Anything put back on this list has to be a name the union DOES declare
       and that nothing raises, with the reason written down beside it. */
    const analyticsSrc = readFileSync(join(root, 'src/lib/analytics.ts'), 'utf8');
    /* Every place an event could be raised, not just the page shell.

       This read `src/LocalePage.tsx` alone, which was true enough while the
       page raised everything from one file. It is not true now: a section
       component is exactly where a section's own event would be raised, so a
       negative assertion that only reads the shell says nothing about the
       component that would break it. The mutation that proved it was run while
       `pricing_view` was still a declared-and-unraised name: adding
       `track('pricing_view')` inside `Tiers.tsx` left this gate green. That
       name has since been retired, and it is named here only because it is
       what the mutation used; the hole was in the scan, not in the name.

       Both directions read the whole tree now, with the comments stripped
       first - see `uncommented` above for why that is not a detail. The
       positive check still passes, because the calls it looks for are in the
       shell and the shell is part of the tree. */
    const pageSrc = uncommented(
      (function readAll(dir) {
        let out = '';
        for (const e of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, e.name);
          if (e.isDirectory()) out += readAll(full);
          else if (/\.tsx?$/.test(e.name)) out += readFileSync(full, 'utf8') + '\n';
        }
        return out;
      })(join(root, 'src')),
    );
    const declared = [...analyticsSrc.matchAll(/^\s*\|\s*'([a-z_]+)'/gm)].map((m) => m[1]);
    const NOT_RAISED_YET = [];
    check(declared.length > 0, 'the event names can be read out of analytics.ts', declared.join(', '));
    for (const name of declared) {
      if (NOT_RAISED_YET.includes(name)) {
        /* Unreachable while the list above is empty, and kept rather than
           deleted because the list is the thing that is empty, not the idea.
           Read it as the shape a future exemption has to take.

           A RAISE, not a mention. The negative used to look for the bare
           quoted name, which worked only because it read one file that does
           not declare them. Widening the scan to the whole tree brought
           analytics.ts in with it, where every name appears by definition, so
           the bare form inverted into a check that could never pass. Both
           branches look for the same call shape now. */
        check(!pageSrc.includes(`track('${name}'`), `${name} is declared and deliberately not raised yet`);
      } else {
        check(pageSrc.includes(`track('${name}'`), `${name} is raised by the page`);
      }
    }
  } finally {
    mock.kill();
    rmSync(work, { recursive: true, force: true });
  }

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
