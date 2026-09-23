/**
 * Does the analytics key actually work, and does the page tell the truth about
 * where it sends people's data?
 *
 * This exists because of a failure that was invisible from every angle we
 * normally look from. On 2026-09-22 the page had been live for days with a
 * PostHog key that belongs to a project on PostHog's US cloud, while
 * src/lib/env.ts defaulted the ingest host to the EU one. Every event the page
 * raised - page_view, demo_desk, pricing_view, form_start, form_step,
 * form_submit, qualified_shown, too_small_shown, booking_click, which is the
 * entire on-page funnel - was posted at a host that does not know the key, and
 * silently dropped.
 *
 * That list is the funnel as it stood on the day, and is left as it was: it is
 * an account of what was lost, not a register of what the page raises now.
 * Five of those events went with the fit-check form. The live set is whatever
 * `EventName` in src/lib/analytics.ts declares, which verify-payload.mjs reads
 * from the union itself rather than from a copy kept here.
 *
 * Nothing caught it, and nothing was going to. analytics.ts swallows its own
 * errors on purpose, because a broken analytics library must never break a
 * landing page. PostHog's capture endpoint answers `{"status":"Ok"}` to anything
 * at all, key or no key, so even a hand probe of the obvious endpoint says
 * everything is fine. The only honest signal is an authenticated endpoint, and
 * nobody was asking one.
 *
 * So this script asks one. Two different questions, and they fail for very
 * different reasons, so keep them apart.
 *
 * 1. DOES THE KEY RESOLVE AT THE CONFIGURED HOST. /flags/ requires the key to
 *    belong to the project at that host: 200 means yes, 401 means the key is
 *    real but lives in the other region. When it fails we probe the other
 *    region too, so the error can say where the project actually is instead of
 *    leaving you to guess.
 *
 * 2. DOES THE CONSENT NOTICE AGREE WITH THE HOST. All three locales tell the
 *    visitor, inside the consent dialog, that PostHog is "hosted in the EU" -
 *    "hostet i EU" in Danish, "talpinama ES" in Lithuanian. That sentence is
 *    not decoration. It is a statement about where personal data goes, made at
 *    the moment consent is asked for, to visitors in DK and LT. If the ingest
 *    host is ever pointed outside the EU, that sentence has to change in the
 *    same commit or the page is asking for consent on a false premise. This
 *    check makes that impossible to do by accident, in either direction.
 *
 *    The promise is REQUIRED, and that is the difference between this check and
 *    the one that was here until 2026-09-23. It used to derive what it enforced
 *    from the copy it was reading: locales that made the promise were held to
 *    it, and if no locale made it the script noted that "the host region is
 *    unconstrained by the copy" and exited 0 - against a US host, confirmed by
 *    running it. So the one gate standing between a wording change and shipping
 *    DK and LT visitors' analytics to a US region could be switched off by
 *    deleting a sentence, in a commit that touched no configuration at all and
 *    would have read, in review, as copy polish.
 *
 *    A promise this page is required to keep cannot be inferred from whether
 *    the page currently happens to make it. It is stated here instead, as
 *    EU_HOSTING_IS_PROMISED, so that dropping it is one greppable line in a
 *    diff that a reviewer has to agree to, rather than the silent absence of a
 *    string. While that constant is true, a locale that has stopped promising
 *    EU hosting is a FAIL in its own right, before the host is even looked at.
 *
 * Deliberately NOT wired into `prebuild`. A production deploy must not fail
 * because a third party is having an afternoon. It runs in `npm run verify`,
 * which is the gate a human passes before shipping. For the same reason a
 * network failure here is reported and forgiven; only a definitive answer from
 * PostHog fails the run.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Keep in step with src/lib/env.ts. If the default there moves, move it here. */
const DEFAULT_HOST = 'https://eu.i.posthog.com';

const EU_HOST = 'https://eu.i.posthog.com';
const US_HOST = 'https://us.i.posthog.com';

/** Phrases that promise EU hosting, one per locale, as the consent copy words it. */
const EU_CLAIMS = [
  { file: 'src/content/en/consent.ts', phrase: 'hosted in the EU' },
  { file: 'src/content/da/consent.ts', phrase: 'hostet i EU' },
  { file: 'src/content/lt/consent.ts', phrase: 'talpinama ES' },
];

/**
 * Does this page promise EU hosting at all?
 *
 * True is the committed position: every locale in EU_CLAIMS above must carry
 * its phrase, and the ingest host must be in the EU. There is no third state
 * where the copy has gone quiet and the check relaxes to match, because that
 * state is how the promise gets dropped without anybody deciding to drop it.
 *
 * If the page one day genuinely stops promising EU hosting - a different
 * processor, an explicit choice, a lawyer's sign-off - flip this to false in
 * that commit. It will then insist on the opposite: no locale may still say
 * "hosted in the EU" while this is false, so a half-done removal fails too.
 * What it will NOT do is give an opinion on the host, which is the whole point
 * of making it explicit: with the promise withdrawn, the region becomes a
 * configuration question rather than a statement made to a visitor, and the
 * person flipping this line is the one saying so.
 */
const EU_HOSTING_IS_PROMISED = true;

const problems = [];
const notes = [];

/* ---------------------------------------------------------------- config -- */

/** Reads a VITE_ value from the process env, then .env.local, then .env. */
function envValue(name) {
  if (process.env[name]) return process.env[name].trim();
  for (const f of ['.env.local', '.env']) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    const line = readFileSync(p, 'utf8')
      .split('\n')
      .find((l) => l.trim().startsWith(`${name}=`));
    if (line) return line.slice(line.indexOf('=') + 1).trim();
  }
  return '';
}

const key = envValue('VITE_POSTHOG_KEY');
const host = envValue('VITE_POSTHOG_HOST') || DEFAULT_HOST;

/* ------------------------------------------------------------ the claims -- */

/* The list above has to cover every locale that exists, or emptying it would
   disarm this check as completely as deleting the sentence used to. A new
   language is a new consent dialog making - or not making - the same promise,
   and it must not join the page unnoticed. Read off the filesystem rather than
   from a second hardcoded list, so the two cannot agree with each other and
   with nothing else. */
const consentFiles = readdirSync(join(root, 'src/content'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(root, 'src/content', e.name, 'consent.ts')))
  .map((e) => `src/content/${e.name}/consent.ts`);
const uncovered = consentFiles.filter((f) => !EU_CLAIMS.some((c) => c.file === f));
if (!EU_CLAIMS.length || uncovered.length) {
  problems.push(
    `EU_CLAIMS in this file does not cover every locale's consent copy.\n` +
      `    On disk: ${consentFiles.join(', ') || 'none found'}\n` +
      `    Not listed here: ${uncovered.join(', ') || '(the list is empty)'}\n` +
      `    Add each one with the phrase its own language uses for the EU hosting ` +
      `promise. A locale that is not in this list is a locale nothing checks.`,
  );
}

const claimsEu = [];
const silent = [];
for (const { file, phrase } of EU_CLAIMS) {
  const p = join(root, file);
  if (!existsSync(p)) {
    problems.push(`${file} is missing, so its consent copy could not be checked`);
    continue;
  }
  if (readFileSync(p, 'utf8').includes(phrase)) claimsEu.push(file);
  else silent.push(`${file} (looked for "${phrase}")`);
}

const hostIsEu = host.startsWith(EU_HOST);

if (EU_HOSTING_IS_PROMISED) {
  /* Absent is a failure, not a licence. This is the branch that used to be an
     exit 0. */
  if (silent.length) {
    problems.push(
      `${silent.length} locale(s) no longer promise EU hosting inside the consent ` +
        `dialog: ${silent.join(', ')}.\n` +
        `    EU_HOSTING_IS_PROMISED in this file says the page makes that promise, ` +
        `so every locale has to make it. A DK or LT visitor is being asked for ` +
        `consent without being told where their data goes, and the check that ` +
        `pins the ingest host to the EU reads that same sentence - removing it ` +
        `from every locale is what used to switch this gate off entirely.\n` +
        `    Put the sentence back, or, if the promise is genuinely being ` +
        `withdrawn, set EU_HOSTING_IS_PROMISED to false in the same commit and ` +
        `say why in the review.`,
    );
  }
  if (claimsEu.length && !hostIsEu) {
    problems.push(
      `The consent notice promises EU hosting in ${claimsEu.length} locale(s) ` +
        `(${claimsEu.join(', ')}) but events are sent to ${host}.\n` +
        `    That sentence is shown while asking a DK or LT visitor for consent. ` +
        `Either point the host back at the EU, or change the copy in every locale ` +
        `in the same commit.`,
    );
  }
  if (!hostIsEu && !claimsEu.length) {
    /* Both halves are wrong at once: the copy has gone quiet AND the host has
       left the EU. Said out loud, because the message above is about the copy
       and would otherwise leave the host unmentioned. */
    problems.push(
      `The ingest host is ${host}, which is not in the EU, and no locale says so ` +
        `to the visitor.`,
    );
  }
  if (!silent.length && hostIsEu && !uncovered.length && EU_CLAIMS.length) {
    notes.push(`consent copy promises EU hosting in all ${claimsEu.length} locale(s), and the host is EU`);
  }
} else {
  /* The escape hatch, taken. It has to be taken completely: a locale still
     making a promise the script has been told the page does not make is the
     worst of the three states, because both sides look deliberate. */
  if (claimsEu.length) {
    problems.push(
      `EU_HOSTING_IS_PROMISED is false, but ${claimsEu.length} locale(s) still tell ` +
        `the visitor analytics are hosted in the EU (${claimsEu.join(', ')}).\n` +
        `    Either finish removing the sentence, or set the constant back to true.`,
    );
  } else {
    notes.push(
      'EU_HOSTING_IS_PROMISED is false and no locale claims EU hosting, ' +
        'so the host region is not constrained by the copy',
    );
  }
}

/* --------------------------------------------------------------- the key -- */

/** POSTs to /flags/, which is the cheapest endpoint that actually authenticates. */
async function keyResolves(atHost) {
  const res = await fetch(`${atHost}/flags/?v=2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: key, distinct_id: 'verify-posthog' }),
    signal: AbortSignal.timeout(15000),
  });
  return res.status;
}

if (!key) {
  notes.push('VITE_POSTHOG_KEY is not set here, so the key itself was not probed');
} else {
  try {
    const status = await keyResolves(host);
    if (status === 200) {
      notes.push(`key resolves at ${host}`);
    } else if (status === 401 || status === 403) {
      /* Real key, wrong region, or a key that has been rotated away. Say which. */
      const other = hostIsEu ? US_HOST : EU_HOST;
      let where = 'nowhere we can see';
      try {
        if ((await keyResolves(other)) === 200) where = other;
      } catch {
        /* the second probe is a nicety; its failure must not mask the first */
      }
      problems.push(
        `VITE_POSTHOG_KEY is rejected at the configured host ${host} (HTTP ${status}).\n` +
          `    The project this key belongs to lives at: ${where}.\n` +
          `    Every event the page raises is being dropped. Either paste a key from a ` +
          `project on ${host}, or move the host - and read the consent check above ` +
          `before moving the host.`,
      );
    } else {
      notes.push(`key probe at ${host} answered HTTP ${status}; treating as inconclusive`);
    }
  } catch (err) {
    notes.push(`could not reach ${host} (${err.message}); key not verified, not failing the run`);
  }
}

/* ---------------------------------------------------------------- report -- */

console.log('verify:posthog');
for (const n of notes) console.log(`  · ${n}`);

if (problems.length) {
  console.error('\n  FAIL');
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error('');
  process.exit(1);
}

console.log('  OK\n');
