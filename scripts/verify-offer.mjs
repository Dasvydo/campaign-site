/**
 * Does the offer say anything it cannot prove?
 *
 * src/lib/offer.ts is the only place in the application allowed to hold a
 * price, and the page now argues from those numbers rather than merely
 * printing them: at ten people this costs less per head than Team, at fifteen
 * less than Individual, and so on. Three things can go wrong with an argument
 * like that. The configuration can be edited into a state that contradicts
 * itself, for instance more places sold than a tier has. A claim can be written
 * down as a fact and then quietly stop being true when the tier advances, which
 * is exactly what happens to two of the comparisons at the uncapped tier. Or
 * the configuration can be edited away from the offer we actually agreed to
 * sell, which is the one failure a self consistent module can never notice
 * about itself.
 *
 * So this script bundles the REAL module with esbuild, the same way
 * scripts/verify-payload.mjs bundles the real component, and then checks it in
 * two different ways. Be clear about which is which, because they prove very
 * different things.
 *
 * What this script PROVES. `SPEC` below pins every commercial number by hand,
 * and the first section compares OFFER against it field by field, so a price, a
 * tier capacity, a setup waiver, the coverage, the pooled draft cap, the setup
 * fee or a published rival rate that drifts away from the agreed offer fails
 * here and names the field that moved. The per head figures, the break even
 * headcounts and the full Team firm total are likewise written out below as
 * literals, computed by hand away from this code, so the module has to arrive
 * at those same answers rather than merely agree with its own division.
 *
 * What this script does NOT prove. The structural sections further down, the
 * claim table aside, read their expectations from the configuration they were
 * handed: the invariant cases, the ladder advancing by hand, the frozen tree,
 * the guards on impossible headcounts. Those are internal consistency checks.
 * They show that the helpers agree with each other and with whatever
 * configuration they are given, and they would go on passing if the offer
 * changed. `SPEC` and the hand written literals are the part that will not.
 *
 * It prints the comparisons that are FALSE as loudly as the ones that are
 * true. A claim that does not hold is not a failure of this script, it is the
 * thing this script exists to surface, and the page is expected to render
 * nothing where the arithmetic runs out.
 *
 *   node scripts/verify-offer.mjs
 *   node scripts/verify-offer.mjs --demo-failure   (proves the exit path)
 */
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const HEADCOUNTS = [10, 15, 20];

/**
 * The agreed offer, written out by hand.
 *
 * These numbers now exist in two places: here, and in src/lib/offer.ts. That
 * duplication is deliberate, it is the only duplication in the project that is,
 * and tidying it away would delete the only check in this file that can catch a
 * configuration edited into an offer nobody agreed to sell. An expectation
 * computed from OFFER will agree with OFFER whatever OFFER says; set the
 * founding price to 39 and every derived comparison in this script quietly
 * recomputes itself and passes. A pinned copy cannot do that. It is the
 * difference between proving the module is consistent and proving the module
 * still sells the offer.
 *
 * It does not weaken the rule that governs src/. That rule is that the page has
 * exactly one place to read a price from, so that two parts of the page can
 * never disagree in front of a reader. A verification script is not the page:
 * nothing here is rendered, nothing here is imported by the application, and
 * these numbers are read by a person deciding whether the config is still
 * right. If the offer genuinely changes, this table is edited too, on purpose,
 * as the record that the change was intended rather than a slip.
 */
const SPEC = {
  currency: 'USD',
  covers: 20,
  draftCap: 8000,
  setupFee: 500,
  tiers: {
    founding: { price: 390, total: 5, setupWaived: true },
    early: { price: 490, total: 10, setupWaived: false },
    standard: { price: 590, total: null, setupWaived: false },
  },
  compare: { individual: 29, team: 59, teamMax: 9 },
};

/**
 * Hand computed answers, to the cent, for the figures the page will print.
 *
 * Worked out on paper from SPEC and typed in as literals. Nothing below is an
 * expression over OFFER, which is what makes it an expectation rather than an
 * echo: 490 divided by 15 is 32.67 because somebody did that division, so if
 * the module ever returns something else, one of the two is wrong and the
 * script says so instead of agreeing with itself.
 */
const PER_HEAD = {
  founding: { 10: 39.00, 15: 26.00, 20: 19.50 },
  early: { 10: 49.00, 15: 32.67, 20: 24.50 },
  standard: { 10: 59.00, 15: 39.33, 20: 29.50 },
};

/** The smallest firm at which each claim starts to hold. Null means never. */
const BREAK_EVEN = {
  founding: { team: 7, individual: 14 },
  early: { team: 9, individual: 17 },
  standard: { team: 11, individual: null },
};

/** Nine seats at 59 USD. What the largest firm Team will sell to pays. */
const TEAM_CEILING_MONTHLY = 531;

let failures = 0;
const check = (ok, label, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures += 1;
};

/** Bundles the module the app imports, rather than a copy of it. */
async function loadOffer() {
  const work = mkdtempSync(join(tmpdir(), 'dl-offer-'));
  try {
    const outfile = join(work, 'offer.mjs');
    await build({
      entryPoints: [join(root, 'src/lib/offer.ts')],
      bundle: true, format: 'esm', outfile, logLevel: 'silent',
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

const offer = await loadOffer();
const {
  OFFER, activeTier, remainingSpots, perPerson, comparison, belowTeamRate,
  belowIndividualRate, belowTeamCeiling, teamCeilingMonthly, breakEvenHeadcount,
  setupDue, firstMonthTotal, coversHeadcount, validateOffer, assertOfferValid,
  pilotsStarted, noCustomersYet,
  usd,
} = offer;

/** A mutable plain copy, since OFFER itself is frozen on purpose. */
const clone = () => JSON.parse(JSON.stringify(OFFER));

const yn = (b) => (b ? 'yes' : 'NO');
const pad = (v, n) => String(v).padStart(n);
/** Prints a figure the module may legitimately refuse to produce. */
const money = (v) => (v === null || v === undefined ? 'none' : usd(v));
/** Rounds to cents so a hand written literal can be compared with a division. */
const cents = (v) => (v === null || v === undefined ? null : Math.round(v * 100) / 100);

console.log('\nDoviLoop campaign-site, offer verification\n');
console.log(`  read from ${OFFER.compare.source} on ${OFFER.compare.readAt}: ` +
  `Individual ${usd(OFFER.compare.individual)} per seat, Team ${usd(OFFER.compare.team)} per seat ` +
  `up to ${OFFER.compare.teamMax} seats\n`);

/* 1. the configuration against the pinned specification ------------------- */
console.log('The configuration against the offer we agreed to sell');
check(OFFER.currency === SPEC.currency, 'currency is the agreed USD',
  `config says ${String(OFFER.currency)}`);
for (const id of Object.keys(SPEC.tiers)) {
  const want = SPEC.tiers[id];
  const tier = OFFER.tiers[id];
  if (!tier) {
    check(false, `tier ${id} is present in the configuration`, 'missing');
    continue;
  }
  check(tier.price === want.price, `${id}.price is the agreed ${want.price} USD`,
    `config says ${String(tier.price)}`);
  check(tier.total === want.total,
    `${id}.total is the agreed ${want.total === null ? 'uncapped tier' : `${want.total} places`}`,
    `config says ${String(tier.total)}`);
  check(tier.setupWaived === want.setupWaived,
    `${id}.setupWaived is the agreed ${String(want.setupWaived)}`,
    `config says ${String(tier.setupWaived)}`);
}
for (const [field, want, got] of [
  ['covers', SPEC.covers, OFFER.covers],
  ['draftCap', SPEC.draftCap, OFFER.draftCap],
  ['setupFee', SPEC.setupFee, OFFER.setupFee],
  ['compare.individual', SPEC.compare.individual, OFFER.compare.individual],
  ['compare.team', SPEC.compare.team, OFFER.compare.team],
  ['compare.teamMax', SPEC.compare.teamMax, OFFER.compare.teamMax],
]) {
  check(got === want, `${field} is the agreed ${want}`, `config says ${String(got)}`);
}
check(teamCeilingMonthly() === TEAM_CEILING_MONTHLY,
  `a full Team firm pays the hand computed ${TEAM_CEILING_MONTHLY} USD a month`,
  `module says ${money(teamCeilingMonthly())}`);

/* 2. the shipped configuration -------------------------------------------- */
console.log('\nThe shipped configuration');
const shippedProblems = validateOffer();
check(shippedProblems.length === 0, 'validateOffer finds no problem',
  shippedProblems.join('; ') || 'clean');

const active = activeTier();
check(active.id === OFFER.declaredTier, 'the active tier is the declared one',
  `${active.id}, derived from the counts`);
// An uncapped tier has no places to count, and null minus the counts would be
// zero, which would read as a sold out tier and fail this check on a perfectly
// valid configuration. The two cases are therefore asked separately.
check(
  active.total === null
    ? remainingSpots(active) === null
    : remainingSpots(active) === active.total - active.started - active.held,
  active.total === null
    ? 'an uncapped active tier advertises no count of places'
    : 'remaining places are total minus started minus held',
  active.total === null
    ? 'uncapped, so remainingSpots is null'
    : `${remainingSpots(active)} of ${active.total} open`);
const lastOnLadder = OFFER.tiers[OFFER.order[OFFER.order.length - 1]];
check(lastOnLadder.total === null,
  'the last tier on the ladder is uncapped, so the page can never be left standing on a spent tier',
  `${lastOnLadder.id} declares ${lastOnLadder.total === null ? 'no capacity' : `${lastOnLadder.total} places`}`);
check(Object.isFrozen(OFFER) && Object.isFrozen(OFFER.tiers) &&
  Object.isFrozen(OFFER.tiers.founding) && Object.isFrozen(OFFER.compare),
  'the config is frozen all the way down, not just at the top');
let wrote = false;
try {
  OFFER.tiers.founding.started = 99;
  wrote = OFFER.tiers.founding.started === 99;
} catch {
  wrote = false;
}
check(!wrote, 'a count cannot be written at runtime');
check(setupDue(OFFER.tiers.founding) === 0,
  'the founding tier waives setup, as the trade says');
check(setupDue(OFFER.tiers.standard) === OFFER.setupFee &&
  firstMonthTotal(OFFER.tiers.standard) === OFFER.tiers.standard.price + OFFER.setupFee,
  'every other tier charges setup on the first invoice',
  `first month ${usd(firstMonthTotal(OFFER.tiers.standard))}`);
check(OFFER.covers > 0 && OFFER.draftCap > 0,
  'coverage and the pooled draft cap are firm level facts',
  `${OFFER.covers} people, ${OFFER.draftCap} drafts per month pooled`);
check(OFFER.currency === 'USD', 'prices are USD everywhere');

/* 3. the source itself ---------------------------------------------------- */
console.log('\nThe module as a source of truth');
const src = readFileSync(join(root, 'src/lib/offer.ts'), 'utf8');
const occurrences = (n) => (src.match(new RegExp(`(?<![\\d.])${n}(?![\\d.])`, 'g')) ?? []).length;
for (const [label, value] of [
  ['founding price', OFFER.tiers.founding.price],
  ['early price', OFFER.tiers.early.price],
  ['standard price', OFFER.tiers.standard.price],
  ['setup fee', OFFER.setupFee],
  ['Individual rate', OFFER.compare.individual],
  ['Team rate', OFFER.compare.team],
  ['Team seat ceiling', OFFER.compare.teamMax],
  ['coverage', OFFER.covers],
  ['pooled draft cap', OFFER.draftCap],
  ['founding places', OFFER.tiers.founding.total],
  ['early places', OFFER.tiers.early.total],
]) {
  const n = occurrences(value);
  check(n === 1, `${label} is written down exactly once`, `${value} appears ${n} time(s)`);
}
// Built from its code point so that this file can test for the character it is
// forbidden to contain, without containing it.
const EM_DASH = String.fromCharCode(8212);
check(!src.includes(EM_DASH), 'src/lib/offer.ts contains no em dash');
check(!readFileSync(join(root, 'scripts/verify-offer.mjs'), 'utf8').includes(EM_DASH),
  'scripts/verify-offer.mjs contains no em dash');

/* 4. cost per person, against hand computed figures ----------------------- */
console.log('\nCost per person, against figures computed by hand');
console.log('    tier      people   flat   per head   by hand');
for (const id of OFFER.order) {
  const tier = OFFER.tiers[id];
  for (const n of HEADCOUNTS) {
    const want = PER_HEAD[id]?.[n];
    const got = perPerson(n, tier);
    console.log(`    ${id.padEnd(9)}${pad(n, 6)}${pad(usd(tier.price), 8)}${pad(money(got), 10)}` +
      `${pad(want === undefined ? 'none' : usd(want), 10)}`);
    check(want !== undefined, `there is a hand computed figure for ${id} at ${n} people`);
    check(cents(got) === want,
      `${id} at ${n} people costs the hand computed ${want === undefined ? '?' : usd(want)} per head`,
      `module says ${money(got)}`);
  }
}
const firstTier = OFFER.tiers[OFFER.order[0]];
check(perPerson(HEADCOUNTS[0], firstTier) > perPerson(HEADCOUNTS[HEADCOUNTS.length - 1], firstTier),
  'cost per person falls as the firm grows, which is the point of a flat fee');

/* 5. the claims, at every tier and headcount ------------------------------ */
console.log('\nClaims, resolved rather than asserted');
console.log('    tier      people  per head   below Team  below Individual  below full Team firm');
const falseAtStandard = [];
for (const id of OFFER.order) {
  const tier = OFFER.tiers[id];
  for (const n of HEADCOUNTS) {
    // Both sides of this comparison come from the pinned figures above, not
    // from the module, so a config edit cannot move the expectation with it.
    const each = PER_HEAD[id]?.[n];
    if (each === undefined || !SPEC.tiers[id]) {
      check(false, `${id} at ${n} people has a pinned figure to be checked against`,
        'no entry in the hand computed table');
      continue;
    }
    const covered = n > 0 && n <= SPEC.covers;
    const want = {
      belowTeamRate: covered && each < SPEC.compare.team,
      belowIndividualRate: covered && each < SPEC.compare.individual,
      belowTeamCeiling: SPEC.tiers[id].price < TEAM_CEILING_MONTHLY,
    };
    const got = comparison(n, tier).claims;
    console.log(`    ${id.padEnd(9)}${pad(n, 6)}${pad(usd(each), 10)}${pad(yn(got.belowTeamRate), 13)}` +
      `${pad(yn(got.belowIndividualRate), 18)}${pad(yn(got.belowTeamCeiling), 22)}`);
    check(
      got.belowTeamRate === want.belowTeamRate &&
      got.belowIndividualRate === want.belowIndividualRate &&
      got.belowTeamCeiling === want.belowTeamCeiling,
      `${id} at ${n} people resolves all three claims as the hand arithmetic does`,
      `Team ${yn(want.belowTeamRate)}, Individual ${yn(want.belowIndividualRate)}, full Team firm ${yn(want.belowTeamCeiling)}`,
    );
    if (id === 'standard') {
      for (const [claim, value] of Object.entries(got)) {
        if (!value) falseAtStandard.push(`${claim} at ${n} people`);
      }
    }
  }
}

/* 6. the comparisons that do NOT hold ------------------------------------- */
console.log('\nWhat the page may NOT say at the uncapped tier');
const standard = OFFER.tiers.standard;
for (const line of falseAtStandard) console.log(`    FALSE  ${line}`);
check(falseAtStandard.length > 0,
  'the uncapped tier has claims that fail, and they are named rather than hidden',
  `${falseAtStandard.length} of ${HEADCOUNTS.length * 3} do not hold`);
check(!belowTeamCeiling(standard),
  'the whole firm total is NOT below what a full Team firm pays, at the uncapped tier',
  `${usd(standard.price)} against ${usd(teamCeilingMonthly())}`);
check(belowTeamCeiling(OFFER.tiers.founding) && belowTeamCeiling(OFFER.tiers.early),
  'the same claim does hold at both capped tiers, so it is computed and not fixed');

// The headcount where the uncapped per head meets the Team seat rate exactly is
// the solution of price / n = team rate, and nothing else. It is currently ten,
// which is also one more than the Team seat ceiling, and reaching for that
// number instead would make this check pass by coincidence: the two have
// nothing to do with each other and would part company the moment a price
// moved. So it is derived from the equality under test, and the derivation is
// guarded, because a headcount of 10.17 people cannot be asked about and a
// check that quietly asks nothing is worse than no check.
const meetsTeamRate = standard.price / OFFER.compare.team;
const askable = Number.isInteger(meetsTeamRate) && meetsTeamRate > 0 && meetsTeamRate <= OFFER.covers;
check(askable,
  'the uncapped per head meets the Team rate at a whole, coverable headcount',
  `${usd(standard.price)} / ${usd(OFFER.compare.team)} = ${meetsTeamRate}`);
if (askable) {
  check(perPerson(meetsTeamRate, standard) === OFFER.compare.team,
    `and at ${meetsTeamRate} people it is an equality rather than an approximation`,
    `${money(perPerson(meetsTeamRate, standard))} against ${usd(OFFER.compare.team)}`);
  check(!belowTeamRate(meetsTeamRate, standard),
    'per head at the uncapped tier is NOT below the Team rate where it merely equals it',
    `${money(perPerson(meetsTeamRate, standard))} is not less than ${usd(OFFER.compare.team)}`);
}
check(!belowIndividualRate(OFFER.covers, standard),
  'per head at the uncapped tier is NOT below the Individual rate even at full coverage',
  `${money(perPerson(OFFER.covers, standard))} against ${usd(OFFER.compare.individual)}`);

/* 7. where each claim starts to hold, against hand computed sizes --------- */
console.log('\nWhere each claim starts to hold');
for (const id of OFFER.order) {
  const tier = OFFER.tiers[id];
  for (const against of ['team', 'individual']) {
    const want = BREAK_EVEN[id]?.[against] ?? null;
    const got = breakEvenHeadcount(against, tier);
    const rate = against === 'team' ? SPEC.compare.team : SPEC.compare.individual;
    check(got === want,
      `${id} goes below the ${against} rate at ` +
      `${want === null ? 'no covered size, by hand' : `${want} people, by hand`}`,
      got === null
        ? `module says never inside ${OFFER.covers} people`
        : `module says ${got} people, ${money(perPerson(got, tier))} against ${usd(rate)}`);
    if (got !== null && got > 1) {
      const holds = against === 'team' ? belowTeamRate : belowIndividualRate;
      check(!holds(got - 1, tier), 'and does not claim it one person earlier',
        `${money(perPerson(got - 1, tier))} against ${usd(rate)}`);
    }
  }
}

/* 8. headcounts that would break naive arithmetic ------------------------- */
console.log('\nHeadcounts a component might actually pass in');
for (const n of [0, -3, 7.5, Number.NaN, Number.POSITIVE_INFINITY]) {
  const each = perPerson(n, active);
  check(each === null, `perPerson(${String(n)}) is null, not Infinity or NaN`, String(each));
  const c = comparison(n, active);
  check(!c.claims.belowTeamRate && !c.claims.belowIndividualRate,
    `and no per head claim is made at ${String(n)} people`);
}
// A headcount is a count of people. Seven and a half of them divides cleanly,
// which is exactly what makes it dangerous: without this the page would print a
// confident figure for a firm that cannot exist.
check(!coversHeadcount(7.5), 'a fractional headcount is not covered');
const fractional = comparison(7.5, active);
check(fractional.covered === false && fractional.perPerson === null,
  'and it yields no coverage and no per head figure',
  `covered ${String(fractional.covered)}, per head ${money(fractional.perPerson)}`);
check(!fractional.claims.belowTeamRate && !fractional.claims.belowIndividualRate,
  'and makes no per head claim at all');
const over = OFFER.covers + 1;
check(!coversHeadcount(over) && perPerson(over, active) === null &&
  !belowTeamRate(over, active) && !belowIndividualRate(over, active),
  'a firm larger than the coverage gets no per head figure, however good the division would look',
  `${over} people, per head ${money(perPerson(over, active))}`);
check(comparison(OFFER.compare.teamMax + 1, active).teamMonthly === null,
  'there is no Team price to compare against above the Team seat ceiling');
check(comparison(OFFER.compare.teamMax, active).teamMonthly === TEAM_CEILING_MONTHLY,
  'and there is one at the ceiling itself, at the hand computed total',
  usd(TEAM_CEILING_MONTHLY));

/* 9. the five invariants, each violated on purpose ------------------------ */
console.log('\nThe validator, given configurations that are wrong');
const brokenCases = [
  {
    label: 'a tier sold past its capacity',
    match: /oversold/i,
    make: () => {
      const c = clone();
      c.tiers.founding.started = c.tiers.founding.total;
      c.tiers.founding.held = 1;
      return c;
    },
  },
  {
    label: 'a count that is negative or fractional',
    match: /non-negative whole number/i,
    make: () => {
      const c = clone();
      c.tiers.founding.held = -1;
      c.tiers.early.started = 1.5;
      return c;
    },
  },
  {
    label: 'a ladder that does not climb',
    match: /must increase/i,
    make: () => {
      const c = clone();
      c.tiers.early.price = c.tiers.founding.price - 1;
      return c;
    },
  },
  {
    label: 'a declared tier the counts contradict',
    match: /declaredTier/i,
    make: () => {
      const c = clone();
      c.declaredTier = 'standard';
      return c;
    },
  },
  {
    // The one a reviewer found by hand. Give the last tier a capacity and spend
    // the whole ladder, and activeTier has nowhere left to fall through to: it
    // hands back a capped tier with no places on it, and the page offers the
    // trade beside a counter reading none of however many. Nothing downstream
    // can catch it, because every helper it asks is being told the truth about
    // a tier that genuinely is the active one.
    label: 'a capacity on the last tier of the ladder',
    match: /last tier on the ladder must be uncapped/i,
    make: () => {
      const c = clone();
      const lastId = c.order[c.order.length - 1];
      for (const id of c.order) {
        if (id !== lastId) c.tiers[id].started = c.tiers[id].total;
      }
      c.tiers[lastId].total = 4;
      c.tiers[lastId].started = 4;
      c.declaredTier = lastId;
      return c;
    },
  },
];
for (const { label, match, make } of brokenCases) {
  const bad = make();
  const problems = validateOffer(bad);
  check(problems.some((p) => match.test(p)), `it catches ${label}`,
    problems.join('; ') || 'nothing reported');
  let threw = false;
  try {
    assertOfferValid(bad);
  } catch {
    threw = true;
  }
  check(threw, `and the build guard refuses to pass ${label}`);
}

/* 9b. the one claim about the business rather than the offer -------------- */
/* "We have no customers to point at yet" is the only sentence on the page that
   is a statement about us. It cannot be checked by rendering it: it goes false
   while reading exactly as it always did, on a day nobody edits the page. So
   the states it has to be right in are walked here.

   The fourth of these is the one the gate exists for. Gating on the tier would
   have passed it: founding is still the active tier with four pilots running,
   and the sentence would have been on a live page contradicting four
   customers. */
console.log('\nThe claim that we have nobody to point at yet');
check(pilotsStarted(OFFER) === 0 && noCustomersYet(OFFER),
  'the shipped offer has started nobody, so the page may still say so');

const one = clone();
one.tiers.founding.started = 1;
check(pilotsStarted(one) === 1 && !noCustomersYet(one),
  'one pilot started takes the claim off the page',
  `started ${pilotsStarted(one)}`);

const held = clone();
held.tiers.founding.held = held.tiers.founding.total;
check(pilotsStarted(held) === 0 && noCustomersYet(held),
  'a held place is a booked call, not a customer, so the claim stands');

const nearlyFull = clone();
nearlyFull.tiers.founding.started = nearlyFull.tiers.founding.total - 1;
check(activeTier(nearlyFull).id === 'founding' && !noCustomersYet(nearlyFull),
  'the claim is gone well before the tier turns over, which the tier alone would miss',
  `${pilotsStarted(nearlyFull)} started, still on ${activeTier(nearlyFull).id}`);

const onEarly = clone();
onEarly.tiers.founding.started = onEarly.tiers.founding.total;
onEarly.declaredTier = 'early';
check(!noCustomersYet(onEarly),
  'and it is gone on every tier above founding',
  `started ${pilotsStarted(onEarly)}`);

const late = clone();
late.tiers.founding.started = late.tiers.founding.total;
late.tiers.early.started = late.tiers.early.total;
late.declaredTier = 'standard';
check(pilotsStarted(late) === late.tiers.founding.total + late.tiers.early.total,
  'pilots are counted across the whole ladder, not just the tier on show',
  `${pilotsStarted(late)} started`);

/* 10. the ladder advancing by hand ---------------------------------------- */
console.log('\nAdvancing a tier, which is a hand edit and nothing else');
const filled = clone();
filled.tiers.founding.started = filled.tiers.founding.total;
filled.declaredTier = 'early';
check(activeTier(filled).id === 'early' && validateOffer(filled).length === 0,
  'a spent founding tier moves the page to early, and validates',
  `${remainingSpots(activeTier(filled))} places left on early`);
const heldOut = clone();
heldOut.tiers.founding.held = heldOut.tiers.founding.total;
heldOut.declaredTier = 'early';
check(activeTier(heldOut).id === 'early' && validateOffer(heldOut).length === 0,
  'soft holds alone are enough to close a tier, so bookings cannot oversell it');
const spent = clone();
spent.tiers.founding.started = spent.tiers.founding.total;
spent.tiers.early.started = spent.tiers.early.total;
spent.declaredTier = 'standard';
check(activeTier(spent).id === 'standard' && remainingSpots(activeTier(spent)) === null &&
  validateOffer(spent).length === 0,
  'with every capped tier spent the page is uncapped, and advertises no count');

/* 11. the exit path, on request ------------------------------------------- */
if (process.argv.includes('--demo-failure')) {
  console.log('\nDemonstration: a broken configuration shipped as if it were real');
  const bad = clone();
  bad.tiers.founding.held = bad.tiers.founding.total + 1;
  check(validateOffer(bad).length === 0,
    'this check is meant to fail, to prove the exit code is not decorative',
    validateOffer(bad).join('; '));
}

console.log(`\n${failures === 0 ? 'OFFER HOLDS' : `${failures} PROBLEM(S) FOUND`}\n`);
process.exit(failures === 0 ? 0 : 1);
