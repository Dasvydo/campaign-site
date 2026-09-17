/**
 * Does the offer say anything it cannot prove?
 *
 * src/lib/offer.ts is the only place in the application allowed to hold a
 * price, and the page argues from those numbers rather than merely printing
 * them: at ten people this costs less per head than Team, at fifteen less than
 * Individual, and so on. Three things can go wrong with an argument like that.
 * The configuration can be edited into a state that contradicts itself, for
 * instance more places sold than the founding cohort has. A claim can be
 * written down as a fact and then quietly stop being true when a price moves.
 * Or the configuration can be edited away from the offer we actually agreed to
 * sell, which is the one failure a self consistent module can never notice
 * about itself.
 *
 * So this script bundles the REAL module with esbuild, the same way
 * scripts/verify-payload.mjs bundles the real component, and then checks it in
 * two different ways. Be clear about which is which, because they prove very
 * different things.
 *
 * What this script PROVES. `SPEC` below pins every commercial number by hand,
 * and the first section compares OFFER against it field by field, so a price,
 * a coverage, a pooled draft cap, the cohort capacity, the setup fee, the
 * guarantee or a published rival rate that drifts away from the agreed offer
 * fails here and names the field that moved. The per head figures, the break
 * even headcounts, the full Team firm total and the Managed floor are likewise
 * written out below as literals, computed by hand away from this code, so the
 * module has to arrive at those same answers rather than merely agree with its
 * own division.
 *
 * What this script does NOT prove. The structural sections further down, the
 * claim table aside, read their expectations from the configuration they were
 * handed: the invariant cases, the frozen tree, the guards on impossible
 * headcounts. Those are internal consistency checks. They show that the helpers
 * agree with each other and with whatever configuration they are given, and
 * they would go on passing if the offer changed. `SPEC` and the hand written
 * literals are the part that will not.
 *
 * It prints the comparisons that are FALSE as loudly as the ones that are
 * true. A claim that does not hold is not a failure of this script, it is the
 * thing this script exists to surface, and the page is expected to render
 * nothing where the arithmetic runs out. Desk covers ten people, so two of the
 * three headcounts below have no Desk figure at all, and that absence is
 * checked rather than skipped.
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
 * computed from OFFER will agree with OFFER whatever OFFER says; set the Desk
 * price to 14 and every derived comparison in this script quietly recomputes
 * itself and passes. A pinned copy cannot do that. It is the difference between
 * proving the module is consistent and proving the module still sells the offer.
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
  setupFee: 500,
  guaranteeDrafts: 150,
  founding: { places: 5, started: 0, held: 0 },
  packages: {
    desk: { price: 149, covers: 10, draftCap: 4000 },
    firm: { price: 199, covers: 20, draftCap: 8000 },
  },
  compare: { individual: 29, team: 59, teamMax: 9, managed: 89, managedMin: 10 },
};

/**
 * Hand computed answers, to the cent, for the figures the page will print.
 *
 * Worked out on paper from SPEC and typed in as literals. Nothing below is an
 * expression over OFFER, which is what makes it an expectation rather than an
 * echo: 199 divided by 15 is 13.27 because somebody did that division, so if
 * the module ever returns something else, one of the two is wrong and the
 * script says so instead of agreeing with itself.
 *
 * `null` means the package does not cover a firm that size and the module is
 * required to refuse a figure rather than divide anyway. Desk stops at ten, so
 * it is null at fifteen and at twenty, and those two entries are the ones that
 * would catch a coverage ceiling quietly going missing.
 */
const PER_HEAD = {
  desk: { 10: 14.90, 15: null, 20: null },
  firm: { 10: 19.90, 15: 13.27, 20: 9.95 },
};

/** The smallest firm at which each claim starts to hold. Null means never. */
const BREAK_EVEN = {
  desk: { team: 3, individual: 6 },
  firm: { team: 4, individual: 7 },
};

/** Nine seats at 59 USD. What the largest firm Team will sell to pays. */
const TEAM_CEILING_MONTHLY = 531;
/** Ten seats at 89 USD. What the smallest firm Managed will sell to pays. */
const MANAGED_FLOOR_MONTHLY = 890;

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
  OFFER, headlinePackage, packageForHeadcount, remainingFoundingPlaces, foundingOpen,
  perPerson, comparison, belowTeamRate, belowIndividualRate, belowTeamCeiling,
  belowManagedFloor, teamCeilingMonthly, managedFloorMonthly, breakEvenHeadcount,
  setupDue, firstMonthTotal, coversHeadcount, maxCovers, validateOffer, assertOfferValid,
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
  `up to ${OFFER.compare.teamMax} seats, Managed ${usd(OFFER.compare.managed)} per seat ` +
  `from ${OFFER.compare.managedMin} seats\n`);

/* 1. the configuration against the pinned specification ------------------- */
console.log('The configuration against the offer we agreed to sell');
check(OFFER.currency === SPEC.currency, 'currency is the agreed USD',
  `config says ${String(OFFER.currency)}`);
check(OFFER.order.length === Object.keys(SPEC.packages).length,
  `the offer sells the agreed ${Object.keys(SPEC.packages).length} packages`,
  `config sells ${OFFER.order.length}`);
for (const id of Object.keys(SPEC.packages)) {
  const want = SPEC.packages[id];
  const pkg = OFFER.packages[id];
  if (!pkg) {
    check(false, `package ${id} is present in the configuration`, 'missing');
    continue;
  }
  for (const field of ['price', 'covers', 'draftCap']) {
    check(pkg[field] === want[field], `${id}.${field} is the agreed ${want[field]}`,
      `config says ${String(pkg[field])}`);
  }
}
for (const [field, want, got] of [
  ['setupFee', SPEC.setupFee, OFFER.setupFee],
  ['guaranteeDrafts', SPEC.guaranteeDrafts, OFFER.guaranteeDrafts],
  ['founding.places', SPEC.founding.places, OFFER.founding.places],
  ['founding.started', SPEC.founding.started, OFFER.founding.started],
  ['founding.held', SPEC.founding.held, OFFER.founding.held],
  ['compare.individual', SPEC.compare.individual, OFFER.compare.individual],
  ['compare.team', SPEC.compare.team, OFFER.compare.team],
  ['compare.teamMax', SPEC.compare.teamMax, OFFER.compare.teamMax],
  ['compare.managed', SPEC.compare.managed, OFFER.compare.managed],
  ['compare.managedMin', SPEC.compare.managedMin, OFFER.compare.managedMin],
]) {
  check(got === want, `${field} is the agreed ${want}`, `config says ${String(got)}`);
}
check(teamCeilingMonthly() === TEAM_CEILING_MONTHLY,
  `a full Team firm pays the hand computed ${TEAM_CEILING_MONTHLY} USD a month`,
  `module says ${money(teamCeilingMonthly())}`);
check(managedFloorMonthly() === MANAGED_FLOOR_MONTHLY,
  `the smallest Managed firm pays the hand computed ${MANAGED_FLOOR_MONTHLY} USD a month`,
  `module says ${money(managedFloorMonthly())}`);

/* 2. the shipped configuration -------------------------------------------- */
console.log('\nThe shipped configuration');
const shippedProblems = validateOffer();
check(shippedProblems.length === 0, 'validateOffer finds no problem',
  shippedProblems.join('; ') || 'clean');

const lead = headlinePackage();
check(lead.id === OFFER.order[OFFER.order.length - 1],
  'the page leads with the largest package, which is the one every claim must survive',
  `${lead.id} at ${usd(lead.price)}`);
check(maxCovers() === SPEC.packages.firm.covers,
  `the offer ceiling is the agreed ${SPEC.packages.firm.covers} people`,
  `module says ${maxCovers()}`);
check(remainingFoundingPlaces() === SPEC.founding.places - SPEC.founding.started - SPEC.founding.held,
  'remaining founding places are places minus started minus held',
  `${remainingFoundingPlaces()} of ${OFFER.founding.places} open`);
check(Object.isFrozen(OFFER) && Object.isFrozen(OFFER.packages) &&
  Object.isFrozen(OFFER.packages.desk) && Object.isFrozen(OFFER.founding) &&
  Object.isFrozen(OFFER.compare),
  'the config is frozen all the way down, not just at the top');
let wrote = false;
try {
  OFFER.founding.started = 99;
  wrote = OFFER.founding.started === 99;
} catch {
  wrote = false;
}
check(!wrote, 'a count cannot be written at runtime');

/* The waiver is a property of the cohort and not of a package, which is the
   whole point of the 2026-09-17 restructure: the monthly fee a reader sees does
   not depend on when they read it, only the setup fee does. Both states are
   walked, because the second one is the one nobody will look at again. */
check(foundingOpen() && setupDue() === 0,
  'setup is waived while founding places remain, as the trade says');
const cohortFull = clone();
cohortFull.founding.started = cohortFull.founding.places;
check(!foundingOpen(cohortFull) && setupDue(cohortFull) === OFFER.setupFee,
  'and is charged in full once the cohort is spent',
  `${usd(setupDue(cohortFull))} due`);
for (const id of OFFER.order) {
  const pkg = OFFER.packages[id];
  check(firstMonthTotal(pkg) === pkg.price,
    `${id} bills only the monthly fee on the first invoice while the cohort is open`,
    `first month ${usd(firstMonthTotal(pkg))}`);
  check(firstMonthTotal(pkg, cohortFull) === pkg.price + OFFER.setupFee,
    `and ${id} bills the fee plus setup once it is spent`,
    `first month ${usd(firstMonthTotal(pkg, cohortFull))}`);
  check(pkg.covers > 0 && pkg.draftCap > 0,
    `${id} coverage and pooled draft cap are firm level facts`,
    `${pkg.covers} people, ${pkg.draftCap} drafts per month pooled`);
}
check(OFFER.currency === 'USD', 'prices are USD everywhere');

/* 2b. which package a firm of a given size is quoted ---------------------- */
/* The ladder is the reader's own headcount now, so the mapping from a firm size
   to a package is the thing that replaced advancing a tier by hand. Above the
   ceiling it has to refuse rather than quote the largest package, because a
   firm of thirty is a custom quote and a page that silently quoted them Firm
   would be selling coverage nobody agreed to honour. */
console.log('\nWhich package a firm of each size is quoted');
for (const [n, want] of [[1, 'desk'], [10, 'desk'], [11, 'firm'], [20, 'firm'], [21, null]]) {
  const got = packageForHeadcount(n);
  check((got?.id ?? null) === want,
    `a firm of ${n} is quoted ${want === null ? 'no package at all' : want}`,
    `module says ${got?.id ?? 'none'}`);
}
for (const n of [0, -3, 7.5, Number.NaN]) {
  check(packageForHeadcount(n) === null,
    `and a headcount of ${String(n)} is quoted nothing`);
}

/* 3. the source itself ---------------------------------------------------- */
console.log('\nThe module as a source of truth');
const src = readFileSync(join(root, 'src/lib/offer.ts'), 'utf8');
const occurrences = (n) => (src.match(new RegExp(`(?<![\\d.])${n}(?![\\d.])`, 'g')) ?? []).length;
/* Every figure the module is the source of, and nowhere else in it.

   The rule this enforces is that a figure is written down once, so it cannot be
   edited in one place and left stale in another. What it counts is occurrences
   of the literal in the file, comments included, because a rate restated in
   prose goes stale exactly as readily as one restated in code.

   The count expected is not always one. Two of these are different facts that
   happen to hold the same number: Desk covers ten people and the Managed plan
   starts at ten seats, and neither is the other written twice. So a figure is
   allowed one appearance for each fact on this list that holds it, and no more.
   A third `10` typed into a function body still fails, and so does a rate
   duplicated in a comment, which is what this caught last. */
const FIGURES = [
  ['Desk price', OFFER.packages.desk.price],
  ['Firm price', OFFER.packages.firm.price],
  ['Desk coverage', OFFER.packages.desk.covers],
  ['Firm coverage', OFFER.packages.firm.covers],
  ['Desk draft cap', OFFER.packages.desk.draftCap],
  ['Firm draft cap', OFFER.packages.firm.draftCap],
  ['setup fee', OFFER.setupFee],
  ['guarantee drafts', OFFER.guaranteeDrafts],
  ['founding places', OFFER.founding.places],
  ['Individual rate', OFFER.compare.individual],
  ['Team rate', OFFER.compare.team],
  ['Team seat ceiling', OFFER.compare.teamMax],
  ['Managed rate', OFFER.compare.managed],
  ['Managed seat floor', OFFER.compare.managedMin],
];
for (const [label, value] of FIGURES) {
  const sharing = FIGURES.filter(([, v]) => v === value);
  const n = occurrences(value);
  const also = sharing.filter(([l]) => l !== label).map(([l]) => l);
  check(n === sharing.length,
    `${label} is written down once${also.length ? `, and so is ${also.join(' and ')}` : ''}`,
    `${value} appears ${n} time(s), ${sharing.length} expected`);
}
// Built from its code point so that this file can test for the character it is
// forbidden to contain, without containing it.
const EM_DASH = String.fromCharCode(8212);
check(!src.includes(EM_DASH), 'src/lib/offer.ts contains no em dash');
check(!readFileSync(join(root, 'scripts/verify-offer.mjs'), 'utf8').includes(EM_DASH),
  'scripts/verify-offer.mjs contains no em dash');

/* 4. cost per person, against hand computed figures ----------------------- */
console.log('\nCost per person, against figures computed by hand');
console.log('    package   people   flat   per head   by hand');
for (const id of OFFER.order) {
  const pkg = OFFER.packages[id];
  for (const n of HEADCOUNTS) {
    const want = PER_HEAD[id]?.[n];
    const got = perPerson(n, pkg);
    console.log(`    ${id.padEnd(10)}${pad(n, 6)}${pad(usd(pkg.price), 8)}${pad(money(got), 10)}` +
      `${pad(want === undefined || want === null ? 'none' : usd(want), 10)}`);
    check(want !== undefined, `there is a hand computed entry for ${id} at ${n} people`);
    check(cents(got) === (want ?? null),
      want === null
        ? `${id} refuses a per head figure at ${n} people, which it does not cover`
        : `${id} at ${n} people costs the hand computed ${want === undefined ? '?' : usd(want)} per head`,
      `module says ${money(got)}`);
  }
}
for (const id of OFFER.order) {
  const pkg = OFFER.packages[id];
  check(perPerson(1, pkg) > perPerson(pkg.covers, pkg),
    `cost per person falls as the firm grows on ${id}, which is the point of a flat fee`,
    `${money(perPerson(1, pkg))} at one person, ${money(perPerson(pkg.covers, pkg))} at ${pkg.covers}`);
}

/* 5. the claims, at every package and headcount --------------------------- */
console.log('\nClaims, resolved rather than asserted');
console.log('    package   people  per head   below Team  below Individual  below full Team firm');
const falseSomewhere = [];
for (const id of OFFER.order) {
  const pkg = OFFER.packages[id];
  for (const n of HEADCOUNTS) {
    // Both sides of this comparison come from the pinned figures above, not
    // from the module, so a config edit cannot move the expectation with it.
    const each = PER_HEAD[id]?.[n];
    if (each === undefined || !SPEC.packages[id]) {
      check(false, `${id} at ${n} people has a pinned figure to be checked against`,
        'no entry in the hand computed table');
      continue;
    }
    const covered = n > 0 && n <= SPEC.packages[id].covers;
    const want = {
      belowTeamRate: covered && each !== null && each < SPEC.compare.team,
      belowIndividualRate: covered && each !== null && each < SPEC.compare.individual,
      belowTeamCeiling: SPEC.packages[id].price < TEAM_CEILING_MONTHLY,
      belowManagedFloor: SPEC.packages[id].price < MANAGED_FLOOR_MONTHLY,
    };
    const got = comparison(n, pkg).claims;
    console.log(`    ${id.padEnd(10)}${pad(n, 6)}${pad(each === null ? 'none' : usd(each), 10)}` +
      `${pad(yn(got.belowTeamRate), 13)}${pad(yn(got.belowIndividualRate), 18)}` +
      `${pad(yn(got.belowTeamCeiling), 22)}`);
    check(
      got.belowTeamRate === want.belowTeamRate &&
      got.belowIndividualRate === want.belowIndividualRate &&
      got.belowTeamCeiling === want.belowTeamCeiling &&
      got.belowManagedFloor === want.belowManagedFloor,
      `${id} at ${n} people resolves all four claims as the hand arithmetic does`,
      `Team ${yn(want.belowTeamRate)}, Individual ${yn(want.belowIndividualRate)}, ` +
      `full Team firm ${yn(want.belowTeamCeiling)}, Managed floor ${yn(want.belowManagedFloor)}`,
    );
    for (const [claim, value] of Object.entries(got)) {
      if (!value) falseSomewhere.push(`${id}: ${claim} at ${n} people`);
    }
  }
}

/* 6. the comparisons that do NOT hold ------------------------------------- */
console.log('\nWhat the page may NOT say');
for (const line of falseSomewhere) console.log(`    FALSE  ${line}`);
check(falseSomewhere.length > 0,
  'some claims fail, and they are named rather than hidden',
  `${falseSomewhere.length} of ${OFFER.order.length * HEADCOUNTS.length * 4} do not hold`);
const desk = OFFER.packages.desk;
check(!belowTeamRate(desk.covers + 1, desk) && !belowIndividualRate(desk.covers + 1, desk),
  'Desk makes no per head claim one person past its own coverage, however good the division would look',
  `${money(perPerson(desk.covers + 1, desk))} at ${desk.covers + 1} people`);
for (const id of OFFER.order) {
  check(belowManagedFloor(OFFER.packages[id]) && belowTeamCeiling(OFFER.packages[id]),
    `${id} is below both the Managed floor and the full Team firm total, which is the page's argument`,
    `${usd(OFFER.packages[id].price)} against ${usd(MANAGED_FLOOR_MONTHLY)} and ${usd(TEAM_CEILING_MONTHLY)}`);
}
/* Strictness, at the one size where it could bite. A package priced at exactly
   the Managed floor is not cheaper than it, and the page may not say cheaper
   when it is equal. Constructed rather than waited for. */
const atFloor = clone();
atFloor.packages.firm.price = MANAGED_FLOOR_MONTHLY;
check(!belowManagedFloor(atFloor.packages.firm, atFloor),
  'a package priced at exactly the Managed floor is NOT below it',
  `${usd(MANAGED_FLOOR_MONTHLY)} is not less than ${usd(MANAGED_FLOOR_MONTHLY)}`);

/* 7. where each claim starts to hold, against hand computed sizes --------- */
console.log('\nWhere each claim starts to hold');
for (const id of OFFER.order) {
  const pkg = OFFER.packages[id];
  for (const against of ['team', 'individual']) {
    const want = BREAK_EVEN[id]?.[against] ?? null;
    const got = breakEvenHeadcount(against, pkg);
    const rate = against === 'team' ? SPEC.compare.team : SPEC.compare.individual;
    check(got === want,
      `${id} goes below the ${against} rate at ` +
      `${want === null ? 'no covered size, by hand' : `${want} people, by hand`}`,
      got === null
        ? `module says never inside ${pkg.covers} people`
        : `module says ${got} people, ${money(perPerson(got, pkg))} against ${usd(rate)}`);
    if (got !== null && got > 1) {
      const holds = against === 'team' ? belowTeamRate : belowIndividualRate;
      check(!holds(got - 1, pkg), 'and does not claim it one person earlier',
        `${money(perPerson(got - 1, pkg))} against ${usd(rate)}`);
    }
  }
}

/* 8. headcounts that would break naive arithmetic ------------------------- */
console.log('\nHeadcounts a component might actually pass in');
for (const n of [0, -3, 7.5, Number.NaN, Number.POSITIVE_INFINITY]) {
  const each = perPerson(n, lead);
  check(each === null, `perPerson(${String(n)}) is null, not Infinity or NaN`, String(each));
  const c = comparison(n, lead);
  check(!c.claims.belowTeamRate && !c.claims.belowIndividualRate,
    `and no per head claim is made at ${String(n)} people`);
}
// A headcount is a count of people. Seven and a half of them divides cleanly,
// which is exactly what makes it dangerous: without this the page would print a
// confident figure for a firm that cannot exist.
check(!coversHeadcount(7.5), 'a fractional headcount is not covered');
const fractional = comparison(7.5, lead);
check(fractional.covered === false && fractional.perPerson === null,
  'and it yields no coverage and no per head figure',
  `covered ${String(fractional.covered)}, per head ${money(fractional.perPerson)}`);
check(!fractional.claims.belowTeamRate && !fractional.claims.belowIndividualRate,
  'and makes no per head claim at all');
const over = maxCovers() + 1;
check(!coversHeadcount(over, lead) && perPerson(over, lead) === null &&
  !belowTeamRate(over, lead) && !belowIndividualRate(over, lead),
  'a firm larger than the coverage gets no per head figure, however good the division would look',
  `${over} people, per head ${money(perPerson(over, lead))}`);
check(comparison(OFFER.compare.teamMax + 1, lead).teamMonthly === null,
  'there is no Team price to compare against above the Team seat ceiling');
check(comparison(OFFER.compare.teamMax, lead).teamMonthly === TEAM_CEILING_MONTHLY,
  'and there is one at the ceiling itself, at the hand computed total',
  usd(TEAM_CEILING_MONTHLY));
check(comparison(OFFER.compare.managedMin - 1, lead).managedMonthly === null,
  'there is no Managed price to compare against below the Managed seat floor');
check(comparison(OFFER.compare.managedMin, lead).managedMonthly === MANAGED_FLOOR_MONTHLY,
  'and there is one at the floor itself, at the hand computed total',
  usd(MANAGED_FLOOR_MONTHLY));

/* 9. the invariants, each violated on purpose ----------------------------- */
console.log('\nThe validator, given configurations that are wrong');
const brokenCases = [
  {
    label: 'a founding cohort sold past its capacity',
    match: /oversold/i,
    make: () => {
      const c = clone();
      c.founding.started = c.founding.places;
      c.founding.held = 1;
      return c;
    },
  },
  {
    label: 'a count that is negative or fractional',
    match: /non-negative whole number/i,
    make: () => {
      const c = clone();
      c.founding.held = -1;
      c.packages.desk.covers = 1.5;
      return c;
    },
  },
  {
    label: 'a ladder whose prices do not climb',
    match: /prices must increase/i,
    make: () => {
      const c = clone();
      c.packages.firm.price = c.packages.desk.price - 1;
      return c;
    },
  },
  {
    // The failure the two package shape makes possible that the tier ladder did
    // not. A larger package that covered fewer people would make
    // packageForHeadcount quote the smaller one to a firm it cannot serve, and
    // every helper downstream would go on answering truthfully about a package
    // that should never have been offered.
    label: 'a larger package that covers fewer people',
    match: /coverage must increase/i,
    make: () => {
      const c = clone();
      c.packages.firm.covers = c.packages.desk.covers - 1;
      return c;
    },
  },
  {
    label: 'a larger package that pools fewer drafts',
    match: /draft caps must increase/i,
    make: () => {
      const c = clone();
      c.packages.firm.draftCap = c.packages.desk.draftCap - 1;
      return c;
    },
  },
  {
    // The one the page is built on. A package priced at or above what the
    // smallest Managed firm pays turns every saving in the comparison table
    // into a premium, and no component can catch it: they would all be
    // rendering a true sentence about a price nobody should be charging.
    label: 'a package priced past the Managed floor the page argues against',
    match: /not below the Managed floor/i,
    make: () => {
      const c = clone();
      c.packages.firm.price = MANAGED_FLOOR_MONTHLY;
      return c;
    },
  },
  {
    label: 'a guarantee of no drafts at all',
    match: /guaranteeDrafts/i,
    make: () => {
      const c = clone();
      c.guaranteeDrafts = 0;
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
   the states it has to be right in are walked here. */
console.log('\nThe claim that we have nobody to point at yet');
check(pilotsStarted(OFFER) === 0 && noCustomersYet(OFFER),
  'the shipped offer has started nobody, so the page may still say so');

const one = clone();
one.founding.started = 1;
check(pilotsStarted(one) === 1 && !noCustomersYet(one),
  'one pilot started takes the claim off the page',
  `started ${pilotsStarted(one)}`);

const held = clone();
held.founding.held = held.founding.places;
check(pilotsStarted(held) === 0 && noCustomersYet(held),
  'a held place is a booked call, not a customer, so the claim stands');

const nearlyFull = clone();
nearlyFull.founding.started = nearlyFull.founding.places - 1;
check(foundingOpen(nearlyFull) && !noCustomersYet(nearlyFull),
  'the claim is gone well before the cohort fills, which the cohort alone would miss',
  `${pilotsStarted(nearlyFull)} started, ${remainingFoundingPlaces(nearlyFull)} place(s) left`);

/* 10. spending the cohort, which is a hand edit and nothing else ---------- */
console.log('\nSpending a founding place, which is a hand edit and nothing else');
const filled = clone();
filled.founding.started = filled.founding.places;
check(!foundingOpen(filled) && validateOffer(filled).length === 0,
  'a spent cohort closes the waiver, and validates',
  `${remainingFoundingPlaces(filled)} places left, setup now ${usd(setupDue(filled))}`);
const heldOut = clone();
heldOut.founding.held = heldOut.founding.places;
check(!foundingOpen(heldOut) && validateOffer(heldOut).length === 0,
  'soft holds alone are enough to close the cohort, so bookings cannot oversell it');
for (const id of filled.order) {
  check(filled.packages[id].price === OFFER.packages[id].price,
    `and ${id} costs the same monthly fee after the cohort is spent as before it`,
    `${usd(filled.packages[id].price)} either way`);
}

/* 11. the exit path, on request ------------------------------------------- */
if (process.argv.includes('--demo-failure')) {
  console.log('\nDemonstration: a broken configuration shipped as if it were real');
  const bad = clone();
  bad.founding.held = bad.founding.places + 1;
  check(validateOffer(bad).length === 0,
    'this check is meant to fail, to prove the exit code is not decorative',
    validateOffer(bad).join('; '));
}

console.log(`\n${failures === 0 ? 'OFFER HOLDS' : `${failures} PROBLEM(S) FOUND`}\n`);
process.exit(failures === 0 ? 0 : 1);
