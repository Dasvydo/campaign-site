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
 * Deliberately NOT wired into `prebuild`. A production deploy must not fail
 * because a third party is having an afternoon. It runs in `npm run verify`,
 * which is the gate a human passes before shipping. For the same reason a
 * network failure here is reported and forgiven; only a definitive answer from
 * PostHog fails the run.
 */

import { readFileSync, existsSync } from 'node:fs';
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

const claimsEu = [];
for (const { file, phrase } of EU_CLAIMS) {
  const p = join(root, file);
  if (!existsSync(p)) {
    problems.push(`${file} is missing, so its consent copy could not be checked`);
    continue;
  }
  if (readFileSync(p, 'utf8').includes(phrase)) claimsEu.push(file);
}

const hostIsEu = host.startsWith(EU_HOST);

if (claimsEu.length && !hostIsEu) {
  problems.push(
    `The consent notice promises EU hosting in ${claimsEu.length} locale(s) ` +
      `(${claimsEu.join(', ')}) but events are sent to ${host}.\n` +
      `    That sentence is shown while asking a DK or LT visitor for consent. ` +
      `Either point the host back at the EU, or change the copy in every locale ` +
      `in the same commit.`,
  );
} else if (claimsEu.length && hostIsEu) {
  notes.push(`consent copy promises EU hosting in ${claimsEu.length} locale(s), and the host is EU`);
} else if (!claimsEu.length) {
  notes.push('no locale claims EU hosting, so the host region is unconstrained by the copy');
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
