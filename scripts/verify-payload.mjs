/**
 * End-to-end verification of the QA gate lines that can be checked here.
 *
 * Boots the local mock webhook, bundles the REAL <Qualifier /> component with
 * esbuild, renders it in jsdom, fills the form and submits. The payload travels
 * over real HTTP to the mock, which validates it strictly against the contract
 * in 00-START-HERE.md. Nothing is stubbed on the payload path.
 *
 * Checks:
 *   1. All three routing outcomes are reachable and correct
 *   2. The POSTed body is exactly the contract shape, no more, no less
 *   3. The free-provider email produces a warning and does NOT block submission
 *   4. Danish and Lithuanian result screens render without English leaking in
 *   5. Every locale file has every key, and none contains an em dash
 *   6. All seven sections render, in document order, in all three locales
 *   7. Every figure the offer injects reaches the line that left a slot for it,
 *      the comparison table prints the offer's own division, only the claims
 *      the arithmetic supports at the shipped tier are on the page, and the
 *      Individual plan stays out of the table it was taken out of
 *   8. Nothing of the per seat model it replaced is still rendered anywhere
 *   9. The three ledger figures are the offer's own arithmetic, none of them
 *      blank
 *
 *   npm run verify:payload
 */
import { spawn } from 'node:child_process';
import { readFileSync, rmSync, mkdtempSync, existsSync } from 'node:fs';
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

/* Every scenario gives a number, because since 2026-09-22 a lead cannot get
   past the second screen without one. Two of these carried '' for the one
   morning the field was optional; leaving them that way would have been a
   scenario set that could no longer submit at all, which is how this change
   announced itself. The formats differ on purpose: the validator counts
   digits and must not care about spaces, a leading plus or a country code. */
const SCENARIOS = [
  { name: '10-24 seats on Outlook', locale: 'en', team_size: '10-24', email_client: 'outlook', role: 'owner_partner', email: 'lars@vesterled.dk', phone: '+45 31 42 55 90', expect: 'qualified' },
  { name: '50+ seats on Gmail', locale: 'da', team_size: '50+', email_client: 'gmail', role: 'ops_office_manager', email: 'kontor@vesterled.dk', phone: '31425590', expect: 'gmail_on_request' },
  { name: '25-49 seats on something else', locale: 'lt', team_size: '25-49', email_client: 'other', role: 'it_admin', email: 'admin@imone.lt', phone: '+370 612 34567', expect: 'gmail_on_request' },
  { name: '1-9 seats, too small', locale: 'en', team_size: '1-9', email_client: 'outlook', role: 'other', email: 'someone@gmail.com', phone: '(020) 7946 0958', expect: 'too_small' },
];

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

async function main() {
  console.log('\nDoviLoop campaign-site, qualifier verification\n');

  /* 1. mock webhook -------------------------------------------------------- */
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
    /* 2. bundle the real component ---------------------------------------- */
    const bundle = join(work, 'harness.js');
    await build({
      entryPoints: [join(root, 'scripts/harness.tsx')],
      bundle: true,
      outfile: bundle,
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

    /* 3. run it in jsdom --------------------------------------------------- */
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
    w.__SCENARIOS__ = SCENARIOS;
    if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });

    w.eval(readFileSync(bundle, 'utf8'));
    await w.__RUN__();
    const results = w.__RESULTS__;

    /* 3b. the whole page, in all three locales ---------------------------- */
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
      /* The exact rows of the calculator, in order. A row added straight into
         the component, untranslated, passed everything. */
      check(
        p.ledgerTerms.length === p.ledgerWants.length &&
          p.ledgerTerms.every((t, i) => t.startsWith(p.ledgerWants[i])),
        `    the calculator reads down exactly the rows the copy names, in order`,
        p.ledgerTerms.join(' | '),
      );
      check(
        p.signLinkHref === 'https://www.linkedin.com/in/dovydas-vinickis' &&
          p.signLinkText === 'www.linkedin.com/in/dovydas-vinickis',
        `    the signature links to the person signing it, at the address it shows`,
        `${p.signLinkText || 'no label'} -> ${p.signLinkHref || 'nowhere'}`,
      );
      check(
        p.signByText.startsWith('\u2014 ') && p.signByText.includes(p.signLinkText),
        `    and reads as a sign-off, name then address`,
        p.signByText || 'nothing',
      );
      check(
        p.underLinkHref === 'https://doviloop.dev' && p.underLinkText.length > 0,
        `    a firm too small for either card is sent to the product site, by a real link`,
        `${p.underLinkText || 'no link'} -> ${p.underLinkHref || 'nowhere'}`,
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
      /* Six controls, all required since 2026-09-22. The form's own heading
         says "Three questions", which counts the three closed questions on
         the first screen; it has never counted the contact details on the
         second, so the phone going required does not touch it. */
      check(p.questionCount === 6, `    the qualifier asks exactly 6 things, all of them required`, String(p.questionCount));
      /* Six across two screens, not six on one. The count above is the sum of
         a walk, so it needs the walk to have actually gone somewhere: without
         these three it would be satisfied by counting one screen twice. */
      check(p.stepsShown === 2, `    the form is presented as two steps`, String(p.stepsShown));
      check(
        p.otherClosedAtRest === 0 && p.otherOpensOnOther === 1 && p.otherShutsOnAnswer === 0,
        `    "Something else" opens a box to say what else, and only that option does`,
        `at rest ${p.otherClosedAtRest}, on other ${p.otherOpensOnOther}, after ${p.otherShutsOnAnswer}`,
      );
      check(
        p.otherIsLabelled,
        `    and the box has a label tied to it, like every other field on the form`,
      );
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
      check(p.stepTurned, `    answering the questions turns the page to the contact details`);
      check(
        p.stepOneIsTheQuestions,
        `    the first step asks the three questions and nothing else`,
        p.stepOneAsks.join(' | '),
      );
      check(
        p.stepTwoIsTheDetails,
        `    the second step asks the three contact details and nothing else`,
        p.stepTwoAsks.join(' | '),
      );
      check(p.backWorks, `    and Back returns to the questions`);
      check(p.labelledControls, `    every control has a real label element`);
    }

    /* 3c. the arithmetic, on the page rather than in the config ------------ */
    /* Every amount the page says out loud now comes out of src/lib/offer.ts at
       render time, which is what makes the per person argument checkable and
       also what makes a half-finished migration invisible: the words arrive
       from the locale file and look right whether or not the figure landed
       beside them. So the figure-bearing lines are asserted as content plus the
       offer's own number, assembled in the order the component lays them out,
       and the comparison table is read back out of the DOM and set against what
       `comparison()` says it should hold. */
    console.log('\nThe price, the cards and the calculator');
    for (const p of pages) {
      console.log(`  /${p.locale === 'en' ? '' : p.locale}`);
      check(
        p.unassembled.length === 0,
        `    every figure reaches the line that left a slot for it`,
        p.unassembled.join(' | '),
      );
      /* The worked example and the audience folders name the same three trades,
         and a reader meets them one scroll apart. They ran in different orders
         until 2026-09-19, which is the sort of thing nobody notices and
         everybody feels. */
      check(
        p.audienceOrder === p.deskOrder,
        `    the audience folders run in the worked example's order`,
        `folders ${p.audienceOrder}; desks ${p.deskOrder}`,
      );
      /* Three holes an independent verifier drove through the check above,
         each of which left the suite green:

         - the same id used twice in BOTH lists. Equal sequences, so the
           comparison passed, and a trade vanished off the page.
         - one locale reordered in both lists at once. Equal within that
           locale, so it passed, and the English page opened the worked
           example on a different desk than the Danish and Lithuanian.
         - `desks[0]` free to be any trade, while the hero's letter is the
           property one. en.ts states that coupling as the reason the order
           is what it is, and nothing held it. */
      check(
        p.audienceIdsDistinct && p.deskIdsDistinct,
        `    each trade appears exactly once in both lists`,
        `folders ${p.audienceOrder}; desks ${p.deskOrder}`,
      );
      check(
        p.audienceOrder === 'property,accounting,insurance',
        `    and in the order the hero's letter needs, which opens on property`,
        p.audienceOrder,
      );
      check(
        p.stopCount === 3 && p.stopCount === p.stopsInContent,
        `    the timeline offers three stops`,
        `${p.stopCount} rendered, ${p.stopsInContent} in the content file`,
      );
      /* One ask, one set of words for it. Four separate keys had drifted into
         four different promises, and the drift was invisible because nothing
         compared them. Counting distinct labels is what makes it visible: the
         count is 1 or the check names every wording it found. */
      {
        const distinct = [...new Set(p.fitCtaLabels)];
        check(
          p.fitCtaLabels.length >= 3 &&
            distinct.length === 1 &&
            distinct[0] === p.fitCtaInContent,
          `    every control pointing at the fit check says the same thing`,
          `${p.fitCtaLabels.length} control(s), ${distinct.length} wording(s): ${distinct
            .map((d) => JSON.stringify(d))
            .join(' | ')}; content says ${JSON.stringify(p.fitCtaInContent)}`,
        );
        check(
          p.fitNavLinks === 1,
          `    the masthead still lists the fit check, and is not held to the button wording`,
          `${p.fitNavLinks} masthead link(s) to #fit`,
        );
      }
      /* The counter is the thing that makes the founding places a fact rather
         than a countdown, so it has to be on the page wherever the tier still
         has places to count AND at least one of them has gone. A counter
         reading its own maximum is not scarcity: beside a page that already
         admits it has no customers yet, "5 of 5" says in the largest type in
         the band that nobody has bought, which is an argument against the
         offer it sits in. The cohort's size is still printed in the reason
         above it either way, so nothing about the offer is withheld; what is
         withheld is that none of the places has moved, until that stops being
         true. */
      check(
        p.hasSpotsCounter === (p.tierIsCapped && p.anyPlaceTaken),
        `    the founding block counts its places on the ${p.tierOnShow} tier`,
        `capped ${p.tierIsCapped}, any place taken ${p.anyPlaceTaken}, counter ${
          p.hasSpotsCounter ? 'shown' : 'gone'
        }`,
      );
      /* The two packages, in the open. One card per package the offer sells,
         the one the offer leads with lit at rest, and the total under the
         timeline reading that package's fee. */
      check(
        p.cardIds.join(',') === p.wantCardIds.join(','),
        `    one card per package, in the offer's order`,
        `${p.cardIds.join(',') || 'none'} against ${p.wantCardIds.join(',')}`,
      );
      check(
        p.litAtRest.length === 1 && p.litAtRest[0] === p.tierOnShow,
        `    exactly one card is lit at rest, and it is the package the offer leads with`,
        `lit: ${p.litAtRest.join(',') || 'none'}; offer leads with ${p.tierOnShow}`,
      );
      check(
        p.totalAtRest === p.wantTotalAtRest,
        `    and the timeline's strike sits on that card's fee`,
        `"${p.totalAtRest}" against "${p.wantTotalAtRest}"`,
      );
      /* Pressing a card is what makes it a control rather than a picture:
         the total and the coverage under it have to follow. */
      check(
        p.cardDrives.length === 0,
        `    pressing a card moves the strike to that card's fee`,
        p.cardDrives.join(' | '),
      );
    }

    /* 3d. the calculator, driven ------------------------------------------ */
    /* Four controls, one sum. The harness sets every control through the
       native setter to a grid of values and reads the five figures back at
       each point, against what src/lib/value.ts computes. Nothing is
       recomputed in the harness: a check that redoes the arithmetic is a
       second implementation, and it would agree with a wrong first one. */
    console.log('\nThe calculator, driven across its ranges');
    for (const p of pages) {
      console.log(`  /${p.locale === 'en' ? '' : p.locale}`);
      check(p.calcFound, `    four range inputs, one per figure the reader supplies`, 'a control is missing');
      /* Both ends and the step of every control come from value.ts, so a
         control that offered an input the model refuses would be the page
         asking a question it cannot answer. */
      check(
        p.badBounds.length === 0,
        `    every control offers exactly the range the model will answer for`,
        p.badBounds.join(' | '),
      );
      /* Where each opens: the smallest package's coverage, the illustrative
         volume, the market's hourly figure, and the assumed minutes. The
         hourly one is the market's, which is the check that catches a page
         opening a Lithuanian reader on a Danish wage. */
      check(
        p.badOpen.length === 0,
        `    and opens where the model says, in this market`,
        p.badOpen.join(' | '),
      );
      check(
        p.pointsDriven > 20 && p.badPoints.length === 0,
        `    all four figures are the model's own arithmetic, at all ${p.pointsDriven} points`,
        p.badPoints.slice(0, 3).join(' | '),
      );
      /* The hedge belongs to the modelled figures and not to the fee. A hedge
         on the fee would be the page apologising for a number it knows
         exactly, and losing it from the others would be a model presented as
         a measurement, which is the one thing this section may never do. */
      check(
        p.unhedged.length === 0,
        `    the hedge is on the model and not on the fee`,
        p.unhedged.join(' | '),
      );
      /* The only picture in the section, held to the figures beside it. */
      check(
        p.barBad.length === 0,
        `    the bar is the fee's real share of what the hours cost`,
        p.barBad.slice(0, 2).join(' | '),
      );
    }

    /* 3d-bis. the claim about us, in a state the shipped offer cannot reach -- */
    /* The founding block opens by saying we have no customers to point at. That
       is the only sentence on the page that is a statement about this business
       rather than about the offer, and it is the only one that can go false on
       a day nobody touches the page.

       Rendering the page as shipped cannot check it. The gate is true for the
       offer on disk and stays true until the first pilot starts, so the
       sentence appears whether or not anyone remembered to gate it. The defect
       is invisible in the only state the bundle normally has.

       So the harness is built twice against the real component and the real
       copy: once as the offer stands, and once with a founding pilot started,
       patched into the source as the bundler reads it. A second copy of the
       offer would drift from the first; a patch that stops matching throws. */
    console.log('\nThe claim about us, rendered in both states');
    const startedPilot = (src) => {
      const out = src.replace(/(founding: \{[^\n]*?)started: 0/, '$1started: 1');
      if (out === src) {
        throw new Error(
          'could not start a founding pilot in src/lib/offer.ts: the founding cohort line has ' +
            'changed shape, so this check is no longer testing what it says it is',
        );
      }
      return out;
    };

    const runClaim = async (label, patch) => {
      const outfile = join(work, `claim-${label}.js`);
      await build({
        entryPoints: [join(root, 'scripts/harness-claim.tsx')],
        bundle: true,
        outfile,
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
        plugins: patch
          ? [
              {
                name: 'start-a-pilot',
                setup(b) {
                  b.onLoad({ filter: /src[\\/]lib[\\/]offer\.ts$/ }, (args) => ({
                    contents: patch(readFileSync(args.path, 'utf8')),
                    loader: 'ts',
                  }));
                },
              },
            ]
          : undefined,
      });
      w.eval(readFileSync(outfile, 'utf8'));
      await w.__RUN_CLAIM__();
      return w.__CLAIM_RESULTS__;
    };

    for (const [label, patch, wantGate] of [
      ['as shipped', null, true],
      ['one pilot started', startedPilot, false],
    ]) {
      const rows = await runClaim(label.replace(/\s+/g, '-'), patch);
      console.log(`  ${label}`);
      for (const r of rows) {
        const where = `/${r.locale === 'en' ? '' : r.locale}`;
        check(
          r.gate === wantGate,
          `    ${where} the offer ${wantGate ? 'allows' : 'refuses'} the claim`,
          `${r.started} started, gate ${r.gate}`,
        );
        check(
          r.claimShown === wantGate,
          `    ${where} the claim is ${wantGate ? 'on' : 'off'} the page`,
          r.lede,
        );
        /* The half that never goes false. A gate that took the whole
           paragraph with it would leave the founding block opening on a list
           of obligations with nothing above them saying why the price is low.
           The reason carries the cohort's size, so it is also the sentence
           that explains the trade now that the sentence which merely asserted
           one has been cut. */
        check(
          r.reasonWants.length > 0 && r.reasonWants.every((w) => r.reasonShown.includes(w)),
          `    ${where} the reason and the lock are printed either way`,
          r.reasonShown,
        );
        /* The admission's element goes with the admission. Asserting only the
           text would pass on a page that kept an empty paragraph where the
           sentence used to be, which is a gap in a band nobody chose. */
        check(
          r.ledeFound === wantGate,
          `    ${where} the admission's own element is ${wantGate ? 'there' : 'gone'}`,
          `found ${r.ledeFound}`,
        );
        /* The counter's other direction. `wantGate` is true exactly when no
           pilot has started, and the counter is withheld exactly then, so the
           counter must be present precisely when the claim is not. A gate stuck
           off fails here even though it passes every check that only ever sees
           the shipped offer. */
        check(
          r.counterShown === !wantGate,
          `    ${where} the counter ${wantGate ? 'stays away until a place goes' : 'comes back once a pilot starts'}`,
          `started ${r.started}, counter ${r.counterShown ? 'shown' : 'gone'}`,
        );
        check(
          r.lede === r.wantLede,
          `    ${where} and the lede is exactly those sentences, with nothing left over`,
          `"${r.lede}" against "${r.wantLede}"`,
        );
      }
    }

    /* 3e. nothing left of the model this page replaced -------------------- */
    /* The check that would have caught a half-finished migration. The old page
       sold seats: 890 USD a month for ten of them, 89 USD each, and a minimum
       written as a count of seats. None of that is true any more, and a page
       that still says it anywhere is a page selling two offers at once. Scanned
       across the whole rendered output of all three locales, because the last
       place a stale price survives is the one nobody reads. */
    console.log('\nNothing left of the per seat model');
    for (const p of pages) {
      check(
        p.stale.length === 0,
        `  /${p.locale === 'en' ? '' : p.locale} renders no price from the old model`,
        p.stale.join(' | '),
      );
    }

    /* 4. routing outcomes -------------------------------------------------- */
    console.log('\nRouting outcomes, rendered client side');
    for (const r of results) {
      check(r.outcomeMatches, `${r.scenario} -> ${r.expectedOutcome}`, `got ${r.shownOutcome}`);
      check(r.resultTitleRendered, `  result screen for "${r.scenario}" renders its own copy`);
      check(r.reachedStepTwo, `  "${r.scenario}" reaches the second step before anything is sent`);
      check(
        r.events.filter((e) => e === 'form_submit').length === 1,
        `  "${r.scenario}" submits exactly once, not once per step`,
        r.events.join(','),
      );
      check(
        r.events.indexOf('form_step') > r.events.indexOf('form_start') &&
          r.events.indexOf('form_step') < r.events.indexOf('form_submit'),
        `  "${r.scenario}" fires form_step between form_start and form_submit`,
        r.events.join(','),
      );
    }

    const gmailScenario = results.find((r) => r.expectedOutcome === 'gmail_on_request');
    check(Boolean(gmailScenario?.gmailNoteRendered), 'Gmail outcome adds the per-team Gmail note');

    const outlookScenario = results.find((r) => r.scenario.includes('Outlook') && r.expectedOutcome === 'qualified');
    check(outlookScenario?.gmailNoteRendered === false, 'Outlook outcome does NOT show the Gmail note');

    /* Every qualifying outcome routes to the booking, so every one of them has
       to carry the line that makes the booking traceable back to the lead. */
    for (const r of results.filter((x) => x.expectedOutcome !== 'too_small')) {
      check(r.sameEmailRendered === true, `  "${r.scenario}" asks them to book with the same email`);
    }

    const small = results.find((r) => r.expectedOutcome === 'too_small');
    check(Boolean(small?.pricingLinkRendered), '1-9 seats links to doviloop.dev pricing');
    check(small?.sameEmailRendered === false, '1-9 seats is not asked to book with the same email');
    check(small?.events.includes('too_small_shown') === true, '1-9 seats fires too_small_shown');
    check(
      results.filter((r) => r.expectedOutcome !== 'too_small').every((r) => r.events.includes('qualified_shown')),
      '10+ seats fires qualified_shown',
    );
    check(results.every((r) => r.events.includes('form_start')), 'form_start fires on first interaction');
    check(results.every((r) => r.events.includes('form_submit')), 'form_submit fires on submit');

    /* 5. soft warning, not a block ---------------------------------------- */
    console.log('\nFree provider email');
    check(Boolean(small?.freeEmailWarningShown), 'a gmail.com address raises the soft warning');
    check(Boolean(small?.resultTitleRendered), 'and it still submits, it is not a block');

    /* 6. no English leaking into da or lt --------------------------------- */
    console.log('\nLocale isolation on the rendered result screens');
    for (const r of results.filter((x) => x.locale !== 'en')) {
      check(r.localeIsNotEnglish === true, `/${r.locale} result screen contains no English master copy`);
    }

    /* 7. payload shape, as received over the wire -------------------------- */
    console.log('\nPayload shape, validated by the mock endpoint');
    const lines = existsSync(LOG) ? readFileSync(LOG, 'utf8').trim().split('\n').filter(Boolean) : [];
    check(lines.length === SCENARIOS.length, `mock received ${SCENARIOS.length} payloads`, `got ${lines.length}`);
    const scenarioLines = lines;

    const received = scenarioLines.map((l) => JSON.parse(l));
    check(received.every((r) => r.valid), 'every payload matched the contract exactly');
    for (const r of received.filter((x) => !x.valid)) {
      for (const p of r.problems) console.log(`        ${p}`);
    }
    check(
      received.every((r) => r.expected_outcome === SCENARIOS.find((s) => s.team_size === r.body.team_size && s.email_client === r.body.email_client)?.expect),
      'the mock derives the same outcome from the table as the UI does',
    );
    check(
      received.every((r) => r.body.utm.source === 'meta' && r.body.utm.medium === 'paid_social' && r.body.utm.campaign === 'teams_launch_sept' && r.body.utm.content === 'static_a'),
      'UTM values ride along in the payload',
    );
    /* The number, which is the whole reason the field came back. It is the
       only answer on the form that may be empty, so both halves are checked:
       what was typed arrives untouched, and a blank box arrives as '' rather
       than as a missing key, which is what the n8n validator was changed to
       accept in 2019-09 and what it still expects. */
    const phoneMismatch = received
      .map((r) => {
        const want = SCENARIOS.find(
          (sc) => sc.team_size === r.body.team_size && sc.email_client === r.body.email_client,
        )?.phone;
        return r.body.phone === want ? null : `${JSON.stringify(r.body.phone)} for ${r.body.team_size}, wanted ${JSON.stringify(want)}`;
      })
      .filter(Boolean);
    check(
      phoneMismatch.length === 0,
      'the number reaches the webhook exactly as it was typed',
      phoneMismatch.length ? phoneMismatch.join(' | ') : received.map((r) => JSON.stringify(r.body.phone)).join(' '),
    );
    /* No lead reaches the webhook without one, since the field went required.
       That the form REFUSES an empty box is checked in a real browser, in
       scripts/verify-visible.mjs, where a reader can actually press the
       button on an empty field. Here the claim is narrower and about the
       wire: nothing that got through arrived blank. */
    check(
      received.every((r) => typeof r.body.phone === 'string' && r.body.phone.trim() !== ''),
      'and no payload reaches the webhook without one',
      received.map((r) => JSON.stringify(r.body.phone)).join(' '),
    );
    check(received.every((r) => r.dedupe), 'each POST carries an idempotency key header');
    /* The half that was missing, and that a live probe caught.

       n8n dedupes on `dedupe_id` in the body. The header alone bought nothing:
       the same key twice made two leads. Asserted per POST, and asserted
       distinct across them, because one id reused for every lead would
       "deduplicate" every lead after the first into nothing at all. */
    check(
      received.every((r) => typeof r.dedupe_in_body === 'string' && r.dedupe_in_body.length > 0),
      'and carries it in the body, which is what the webhook reads',
      received.map((r) => r.dedupe_in_body ?? 'missing').join(' '),
    );
    check(
      new Set(received.map((r) => r.dedupe_in_body)).size === received.length,
      'and a different one per lead, so the key cannot swallow real leads',
      `${new Set(received.map((r) => r.dedupe_in_body)).size} distinct of ${received.length}`,
    );

    console.log('\n  Example payload as received:\n');
    console.log(
      JSON.stringify(received[0].body, null, 2)
        .split('\n')
        .map((l) => `    ${l}`)
        .join('\n'),
    );

    /* 7b. never lose a lead: retry, queue, and drain on next load ---------- */
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
    check(
      rec.queuedPayload && rec.queuedPayload.company_name === 'Vesterled Ejendomsadministration' && rec.queuedPayload.team_size === '25-49',
      'the queued entry is the full contract payload, not a fragment',
    );

    // Pass 2: next page load, webhook is back. The queue drains.
    w.__MODE__ = 'flush';
    w.eval(await recoveryBundle('flush', ENDPOINT));
    await w.__RUN_RECOVERY__();

    check(w.__RECOVERY__.flush?.sent === 1, 'the queued lead is delivered on the next load');
    check(w.__RECOVERY__.queuedAfterFlush === 0, 'and the queue is emptied afterwards');

    /* 8. static checks on the content files -------------------------------- */
    console.log('\nContent files');
    for (const f of ['en', 'da', 'lt']) {
      const src = readFileSync(join(root, `src/content/${f}.ts`), 'utf8');
      check(!src.includes('—'), `src/content/${f}.ts contains no em dash`);
      check(!/lorem|ipsum|TODO|FIXME|XXX|placeholder text/i.test(src), `src/content/${f}.ts contains no placeholder text`);
    }
    const daSrc = readFileSync(join(root, 'src/content/da.ts'), 'utf8');
    const ltSrc = readFileSync(join(root, 'src/content/lt.ts'), 'utf8');
    check(daSrc.includes('NEEDS NATIVE CHECK'), 'da.ts is marked NEEDS NATIVE CHECK');
    check(ltSrc.includes('NEEDS NATIVE CHECK'), 'lt.ts is marked NEEDS NATIVE CHECK');
    check(/Jūs|Jūsų/.test(ltSrc), 'lt.ts uses the formal Jus register');

    /* 9. the share cards the head promises actually exist -------------------
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

    /* 10. every PostHog event name exists in the source -------------------- */
    console.log('\nPostHog event names');
    const srcFiles = ['src/LocalePage.tsx', 'src/lib/analytics.ts'].map((p) => readFileSync(join(root, p), 'utf8')).join('\n');
    for (const name of ['page_view', 'demo_desk', 'pricing_view', 'form_start', 'form_step', 'form_submit', 'qualified_shown', 'too_small_shown', 'booking_click']) {
      check(srcFiles.includes(`'${name}'`), `${name} is wired`);
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
