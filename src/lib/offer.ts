/**
 * The offer, as a single source of truth.
 *
 * Every price the campaign page says out loud is derived from this file. Not
 * because duplication is untidy, but because the page now makes an arithmetic
 * argument rather than a promise: "at your size this costs less per person than
 * the plans on doviloop.dev". An argument like that is only as honest as its
 * inputs, and an input that exists in two places is an input that will disagree
 * with itself the first time one of them is edited.
 *
 * Why flat, and not per seat.
 *
 * doviloop.dev sells Individual per seat and Team per seat for two to nine
 * seats. The campaign page used to sell per seat too, with a ten seat minimum,
 * which made it read as roughly three times the price per head of the product
 * it is selling. That is the wrong shape of number to put in front of a firm
 * that is counting people. So Managed is a flat monthly fee for the whole firm:
 * the total does not move when the firm grows, which means the cost per person
 * falls as the firm grows. The comparison helpers below exist to say exactly
 * where it falls past each published rate, and to refuse to say it where it
 * does not.
 *
 * Why the caps are firm level and not per seat.
 *
 * A flat fee with a per seat draft allowance is an unbounded bill: twenty
 * people on a per seat allowance would be a multiple of what any one of them
 * could ever use. The draft cap is therefore pooled across the firm, and the
 * coverage is a ceiling on people rather than a price per person. Both are
 * commitments the offer can actually keep.
 *
 * Why tiers carry a capacity and not a date.
 *
 * The founding price is not a discount. It is a trade: a testimonial, a sixty
 * day case study, a logo, two feedback calls. The thing being traded for is a
 * place in a cohort we can give real attention to, and attention runs out at a
 * headcount of firms, not on a Friday. A countdown would be theatre, and the
 * kind of theatre a buyer has seen reset on the first of every month. A count
 * of places is a fact, and this file is where that fact lives.
 *
 * Why a spot can be held as well as started.
 *
 * Each capped tier tracks two numbers. `started` is pilots actually running: a
 * place that has been spent. `held` is setup calls that are booked but have not
 * started yet: a soft hold. Without the soft hold, five firms could book the
 * last five places on a page that still advertised five places open, and we
 * would have sold ten seats at a table for five. The hold is soft because a
 * booking that never turns into a pilot should give the place back, which is a
 * human decision made by lowering the number here, not an expiry this file
 * pretends to know how to compute.
 *
 * Tiers advance by hand, in one direction only. There is no automation that
 * promotes a tier, because the promotion is a commercial decision and the only
 * safe way to make it is to look at the counts and edit them. What this file
 * does guarantee is that a hand edit cannot leave the page lying: the active
 * tier is derived from the counts, and `validateOffer` refuses a configuration
 * whose declared tier disagrees with what its counts imply.
 *
 * Prices are USD everywhere, to match doviloop.dev. No currency conversion is
 * offered, because a converted price is a price we would have to keep true.
 */

export type TierId = 'founding' | 'early' | 'standard';

export interface TierConfig {
  readonly id: TierId;
  /** Flat USD per month for the whole firm, at any covered headcount. */
  readonly price: number;
  /** Places in this tier, or null when the tier is uncapped. */
  readonly total: number | null;
  /** Pilots actually running. A place that has been spent. */
  readonly started: number;
  /** Setup calls booked but not started. A soft hold on a place. */
  readonly held: number;
  /** Whether the one off setup fee is waived as part of the trade. */
  readonly setupWaived: boolean;
}

/**
 * The published doviloop.dev rates the page compares itself against.
 *
 * These are somebody else's numbers, read off the live pricing bundle on the
 * date below. They carry their source with them because a comparison whose
 * basis is invisible is a claim the reader has to take on trust, and the whole
 * point of this page is that they should not have to. When doviloop.dev moves a
 * rate, this is the one place that has to be corrected, and `readAt` is what
 * tells a reviewer how stale the comparison has become.
 */
export interface CompareRates {
  /** Individual plan, USD per seat per month. */
  readonly individual: number;
  /** Team plan, USD per seat per month. */
  readonly team: number;
  /** Largest firm the Team plan will sell to, in seats. */
  readonly teamMax: number;
  readonly source: string;
  /** ISO-8601 date the rates above were read. */
  readonly readAt: string;
}

export interface Offer {
  readonly currency: 'USD';
  /** Tier order, cheapest first. Also the order capacity is consumed in. */
  readonly order: readonly TierId[];
  readonly tiers: Readonly<Record<TierId, TierConfig>>;
  /**
   * The tier we believe we are on. Written by hand, never trusted: it exists so
   * that `validateOffer` can catch a hand edit that contradicts the counts.
   * Read `activeTier()` instead of this.
   */
  readonly declaredTier: TierId;
  /** People covered by the flat fee, at every tier. */
  readonly covers: number;
  /** Drafts per month, pooled across the whole firm rather than per seat. */
  readonly draftCap: number;
  /** One off setup fee in USD, waived only where a tier says so. */
  readonly setupFee: number;
  readonly compare: CompareRates;
}

/**
 * Freezes the whole tree rather than the top level, because a top level freeze
 * leaves `OFFER.tiers.founding.started` writable, and a count that can be
 * written at runtime is a count that can disagree with the one the validator
 * checked at build time.
 */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

/**
 * The shipped configuration. The only place in this application where a price
 * may be written down. If a number below needs to change, it changes here and
 * the page follows; if a component needs a number, it imports a helper from
 * this file and never a literal.
 */
export const OFFER: Offer = deepFreeze({
  currency: 'USD',
  order: ['founding', 'early', 'standard'],
  tiers: {
    // Setup waived: this is the half of the trade the founding firms get back
    // for the testimonial, the case study, the logo and the feedback calls.
    founding: { id: 'founding', price: 390, total: 5, started: 0, held: 0, setupWaived: true },
    early: { id: 'early', price: 490, total: 10, started: 0, held: 0, setupWaived: false },
    // Uncapped, and the tier every claim on the page has to survive, because it
    // is the one the page will spend most of its life on.
    standard: { id: 'standard', price: 590, total: null, started: 0, held: 0, setupWaived: false },
  },
  declaredTier: 'founding',
  covers: 20,
  draftCap: 8000,
  setupFee: 500,
  compare: {
    individual: 29,
    team: 59,
    teamMax: 9,
    source: 'doviloop.dev pricing bundle',
    readAt: '2026-09-16',
  },
} as Offer);

/* -------------------------------------------------------------------------
 * Reading the offer
 * ---------------------------------------------------------------------- */

/** One tier by id. Present so callers never index `OFFER.tiers` by hand. */
export function tierById(id: TierId, offer: Offer = OFFER): TierConfig {
  return offer.tiers[id];
}

/** True for a tier that has a finite number of places. */
export function isCapped(tier: TierConfig): boolean {
  return tier.total !== null;
}

/**
 * Places still advertised as open, or null when the tier is uncapped.
 *
 * Both a started pilot and a soft hold take a place off the board. Clamped at
 * zero so an overbooked tier reads as full rather than as a negative number on
 * a public page; the overbooking itself is caught by `validateOffer`, which is
 * the right place to make noise about it.
 */
export function remainingSpots(tier: TierConfig = activeTier()): number | null {
  if (tier.total === null) return null;
  return Math.max(0, tier.total - tier.started - tier.held);
}

/**
 * The tier the counts imply, which is the only tier the page may advertise.
 *
 * Walks the tiers cheapest first and stops at the first capped tier with a
 * place left. When every capped tier is spent, the uncapped tier is what is
 * left, and that is deliberately the last entry in `order`. Derived rather
 * than declared so that no hand edit can put the page on a tier its own counts
 * have already sold out.
 */
export function activeTier(offer: Offer = OFFER): TierConfig {
  for (const id of offer.order) {
    const tier = offer.tiers[id];
    if (tier.total === null) return tier;
    if ((remainingSpots(tier) ?? 0) > 0) return tier;
  }
  return offer.tiers[offer.order[offer.order.length - 1]];
}

/** The setup fee actually due on a tier. Zero where the tier waives it. */
export function setupDue(tier: TierConfig = activeTier(), offer: Offer = OFFER): number {
  return tier.setupWaived ? 0 : offer.setupFee;
}

/** What lands on the first invoice: one month plus whatever setup is due. */
export function firstMonthTotal(tier: TierConfig = activeTier(), offer: Offer = OFFER): number {
  return tier.price + setupDue(tier, offer);
}

/* -------------------------------------------------------------------------
 * The arithmetic the page argues from
 * ---------------------------------------------------------------------- */

/**
 * Whether the flat fee actually covers a firm this size.
 *
 * Everything below, including `perPerson` itself, refuses to produce a per
 * person number outside coverage. A firm of thirty would get a flattering
 * figure out of a division we have not agreed to honour, and a flattering
 * number we cannot honour is worse than no number.
 *
 * A headcount has to be a whole number, for the same reason the validator
 * insists the tier counts are whole numbers: it is a count of people. Seven and
 * a half people is not a smaller firm, it is a bad input, and a bad input that
 * divides cleanly is the kind that reaches a page unnoticed.
 */
export function coversHeadcount(headcount: number, offer: Offer = OFFER): boolean {
  return (
    Number.isInteger(headcount) && headcount > 0 && headcount <= offer.covers
  );
}

/**
 * Flat monthly fee divided by people. The whole argument, in one line.
 *
 * Null outside coverage, not just for arithmetic that would misbehave. Zero, a
 * negative, a fraction, NaN and Infinity are all refused, and so is any firm
 * larger than `covers`: there is no agreed price per head out there, so there is
 * no number to hand a component. Returning a raw division above the ceiling
 * would put the most flattering figure on the page in exactly the case we have
 * not committed to serve, and it would only take one component forgetting to
 * read `covered` first. Null is a value a component cannot render by accident.
 */
export function perPerson(
  headcount: number,
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): number | null {
  if (!coversHeadcount(headcount, offer)) return null;
  return tier.price / headcount;
}

/**
 * What the same firm would pay on the published Team rate, or null when the
 * firm is too large for Team to sell to it at all. Null is the honest answer
 * there: above the Team seat ceiling there is no Team price to compare with.
 */
export function teamMonthly(headcount: number, offer: Offer = OFFER): number | null {
  // Whole people only, for the same reason `coversHeadcount` insists on it.
  if (!Number.isInteger(headcount) || headcount <= 0) return null;
  if (headcount > offer.compare.teamMax) return null;
  return headcount * offer.compare.team;
}

/** What the same firm would pay buying Individual seats, at any size. */
export function individualMonthly(headcount: number, offer: Offer = OFFER): number | null {
  if (!Number.isInteger(headcount) || headcount <= 0) return null;
  return headcount * offer.compare.individual;
}

/** What the largest firm Team will sell to pays every month. A fixed ceiling. */
export function teamCeilingMonthly(offer: Offer = OFFER): number {
  return offer.compare.teamMax * offer.compare.team;
}

/**
 * Is our cost per head below the published Team seat rate, at this size and on
 * this tier? Computed, never assumed, and strict rather than "at or below":
 * equal is not cheaper, and the page may not say cheaper when it is equal.
 * This matters at the uncapped tier, where the per head figure meets the Team
 * rate exactly at one particular headcount.
 */
export function belowTeamRate(
  headcount: number,
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): boolean {
  const each = perPerson(headcount, tier, offer);
  if (each === null) return false;
  return each < offer.compare.team;
}

/** The same question against the Individual seat rate, which is the harder bar. */
export function belowIndividualRate(
  headcount: number,
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): boolean {
  const each = perPerson(headcount, tier, offer);
  if (each === null) return false;
  return each < offer.compare.individual;
}

/**
 * Is our whole monthly bill below what the largest Team firm pays?
 *
 * Independent of headcount, because both sides of it are fixed. It is true at
 * the two capped tiers and false at the uncapped one, which is exactly why it
 * is computed: the sentence it supports has to disappear from the page when the
 * tier advances, without anyone remembering to go and delete it.
 */
export function belowTeamCeiling(
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): boolean {
  return tier.price < teamCeilingMonthly(offer);
}

/** Every claim the page can make about one headcount on one tier, resolved. */
export interface Comparison {
  readonly tier: TierId;
  readonly headcount: number;
  /** False when the flat fee does not cover a firm this size. */
  readonly covered: boolean;
  /** Flat monthly fee for the firm. */
  readonly monthly: number;
  /** Flat fee per head, or null when `covered` is false. Never a bare division. */
  readonly perPerson: number | null;
  /** Null above the Team seat ceiling, where there is nothing to compare. */
  readonly teamMonthly: number | null;
  readonly individualMonthly: number | null;
  readonly teamCeilingMonthly: number;
  /** Positive numbers mean we are cheaper. Null where the rival has no price. */
  readonly savedVsTeam: number | null;
  readonly savedVsIndividual: number | null;
  readonly claims: {
    readonly belowTeamRate: boolean;
    readonly belowIndividualRate: boolean;
    readonly belowTeamCeiling: boolean;
  };
}

/**
 * One call that answers every pricing question a section of the page can ask,
 * so a component never has to assemble an argument out of several helpers and
 * get the gating wrong on one of them. Pure: same inputs, same answer, no
 * reads of anything but the offer it was given.
 */
export function comparison(
  headcount: number,
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): Comparison {
  const each = perPerson(headcount, tier, offer);
  const team = teamMonthly(headcount, offer);
  const individual = individualMonthly(headcount, offer);
  return {
    tier: tier.id,
    headcount,
    covered: coversHeadcount(headcount, offer),
    monthly: tier.price,
    perPerson: each,
    teamMonthly: team,
    individualMonthly: individual,
    teamCeilingMonthly: teamCeilingMonthly(offer),
    savedVsTeam: team === null ? null : team - tier.price,
    savedVsIndividual: individual === null ? null : individual - tier.price,
    claims: {
      belowTeamRate: belowTeamRate(headcount, tier, offer),
      belowIndividualRate: belowIndividualRate(headcount, tier, offer),
      belowTeamCeiling: belowTeamCeiling(tier, offer),
    },
  };
}

/**
 * The smallest firm at which a per head claim starts to hold on a tier, or null
 * when it never holds inside coverage.
 *
 * Searched rather than solved with a division and a ceiling, because the search
 * asks the same predicate the page will ask, and a closed form would be a
 * second implementation of the comparison that could drift from the first.
 */
export function breakEvenHeadcount(
  against: 'team' | 'individual',
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): number | null {
  const holds = against === 'team' ? belowTeamRate : belowIndividualRate;
  for (let n = 1; n <= offer.covers; n += 1) {
    if (holds(n, tier, offer)) return n;
  }
  return null;
}

/**
 * A month, taken as thirty days, for the payback figure alone.
 *
 * The saving the page models is written by the month and the payback is
 * written in days, so one of the two has to be converted and the conversion
 * needs a length of month. Thirty is the round month, the one a reader checks
 * the sum with in their own head, and it is a convention rather than a
 * measurement. That is what the hedge in front of every figure in the ledger,
 * and the line under it saying these are a model and not a measurement, are
 * there to carry. It is not a price, so it belongs here as a constant of the
 * model rather than in the offer.
 */
const DAYS_PER_MONTH = 30;

/**
 * Are these inputs something we are willing to divide with?
 *
 * The saving is not ours: it is an assumption written into the copy, and the
 * component reads it back out of that string. A fraction arriving here is
 * therefore not a finer figure, it is a string that was misread, and a misread
 * string should produce no figure at all rather than a confident one. The
 * headcount is put to `coversHeadcount` for the reason `perPerson` gives: a
 * firm the flat fee does not cover has no arithmetic behind it that we have
 * agreed to honour.
 *
 * The saving is an argument rather than an import on purpose. It is copy, it
 * is translated, and it changes when the assumption behind it changes; this
 * file holds what we charge, and the moment it also held what we assume, the
 * two would start being edited in one place by one person.
 */
function modelIsAnswerable(
  savingPerPersonPerMonth: number,
  headcount: number,
  offer: Offer,
): boolean {
  return (
    Number.isInteger(savingPerPersonPerMonth) &&
    savingPerPersonPerMonth > 0 &&
    coversHeadcount(headcount, offer)
  );
}

/**
 * How many times over the modelled saving covers the flat monthly fee.
 *
 * The saving across the whole firm, against the one fee that firm pays. Null
 * rather than a number wherever the division would misbehave, so a component
 * can render the result straight and get a blank where there is nothing
 * honest to print, in the same way `perPerson` refuses a figure it cannot
 * stand behind. A fee of zero is refused too: it would divide to Infinity, and
 * the ladder invariants do not forbid it.
 *
 * Both figures here round to the nearest whole number. Rounding down would
 * understate the case for no reason a reader benefits from, and rounding up
 * would be the thumb on the scale a modelled figure can least afford. Nearest
 * is the rule that needs no defending, and the figure is hedged in the copy
 * either way.
 */
export function modelledMultiple(
  savingPerPersonPerMonth: number,
  headcount: number,
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): number | null {
  if (!modelIsAnswerable(savingPerPersonPerMonth, headcount, offer)) return null;
  if (!(tier.price > 0)) return null;
  return Math.round((savingPerPersonPerMonth * headcount) / tier.price);
}

/**
 * How long the modelled saving takes to pay back what the firm pays to start.
 *
 * What it costs to start is `firstMonthTotal`, which is the fee plus whatever
 * setup the tier does not waive, so the figure gets worse the moment a tier
 * stops waiving it. That is the honest direction for it to move, and it is why
 * this reads the first invoice rather than the monthly fee.
 *
 * A word of warning for whoever next moves a price. The unit beside this
 * figure is a counted noun in every locale, and types.ts records that the
 * forms shipped are the ones that are right from two to nine. With the shipped
 * ladder the answer lands inside that range at all three tiers. A change that
 * puts it at one, or at ten and above, wants those unit strings rewritten in
 * all three languages, not merely a new number here.
 */
export function modelledPaybackDays(
  savingPerPersonPerMonth: number,
  headcount: number,
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): number | null {
  if (!modelIsAnswerable(savingPerPersonPerMonth, headcount, offer)) return null;
  const toStart = firstMonthTotal(tier, offer);
  // Nothing to pay back is not a payback of no days, it is a figure with no
  // meaning, and the sentence beside it would be about a cost that was not
  // charged.
  if (!(toStart > 0)) return null;
  const savedPerDay = (savingPerPersonPerMonth * headcount) / DAYS_PER_MONTH;
  return Math.round(toStart / savedPerDay);
}

/**
 * Rounds to cents for display only. Never used by a claim: a claim reads the
 * exact value, so a figure that rounds down to look like a win cannot make a
 * sentence appear that the arithmetic does not support.
 */
export function usd(value: number): string {
  const cents = Math.round(value * 100) / 100;
  return Number.isInteger(cents) ? String(cents) : cents.toFixed(2);
}

/* -------------------------------------------------------------------------
 * The guard
 * ---------------------------------------------------------------------- */

/**
 * Everything wrong with a configuration, as sentences a person can act on.
 *
 * Returns a list rather than throwing so the same function can serve two
 * callers with different needs: the pre-flight script, which wants to print all
 * of the problems at once, and the build guard, which wants to stop. It takes
 * the offer as an argument rather than reading the shipped one so a candidate
 * edit can be checked before it is shipped, which is what the script does.
 */
export function validateOffer(offer: Offer = OFFER): string[] {
  const problems: string[] = [];
  const count = (label: string, value: unknown): void => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      problems.push(`${label} must be a non-negative whole number, found ${String(value)}`);
    }
  };

  for (const id of offer.order) {
    const tier = offer.tiers[id];
    if (!tier) {
      problems.push(`tier ${id} is listed in order but missing from tiers`);
      continue;
    }

    // Invariant 2: counts are counts. A fractional or negative count would
    // silently poison every derived number that reads them.
    count(`${id}.started`, tier.started);
    count(`${id}.held`, tier.held);
    if (tier.total !== null) count(`${id}.total`, tier.total);

    // Invariant 1: a tier cannot owe more places than it has. This is the one
    // that catches a booking taken against a tier that is already spent.
    if (tier.total !== null && tier.started + tier.held > tier.total) {
      problems.push(
        `${id} is oversold: ${tier.started} started plus ${tier.held} held exceeds ${tier.total} places`,
      );
    }
  }

  // Invariant 3: the ladder only ever goes up. A tier that is cheaper than the
  // one before it would make advancing a tier a price cut, and would make the
  // scarcity argument on the page an argument for waiting.
  for (let i = 1; i < offer.order.length; i += 1) {
    const prev = offer.tiers[offer.order[i - 1]];
    const next = offer.tiers[offer.order[i]];
    if (prev && next && !(prev.price < next.price)) {
      problems.push(
        `tier prices must increase along the ladder: ${prev.id} at ${prev.price} is not below ${next.id} at ${next.price}`,
      );
    }
  }

  // Invariant 4: what we say we are selling is what the counts say we can sell.
  const implied = activeTier(offer);
  if (implied.id !== offer.declaredTier) {
    problems.push(
      `declaredTier is ${offer.declaredTier} but the counts imply ${implied.id}`,
    );
  }

  // A fifth invariant, and the only one about the shape of the ladder rather
  // than its numbers: it has to end somewhere it cannot run out. The last
  // tier is what `activeTier` falls through to once every capped tier ahead of
  // it is spent, so a capacity on that last tier is a capacity the page can be
  // left standing on with no places behind it: a trade offered against nothing,
  // beside a counter reading none of however many. Nothing downstream can catch
  // it, because every helper it would ask is answering truthfully about a tier
  // that genuinely is the active one. It has to be refused here.
  const last = offer.tiers[offer.order[offer.order.length - 1]];
  if (last && last.total !== null) {
    problems.push(
      `the last tier on the ladder must be uncapped, so the page always has a ` +
        `tier to fall back to: ${last.id} declares ${last.total} places`,
    );
  }

  // Not one of the numbered five, but the same class of mistake: a coverage or cap of
  // zero would make every per person number on the page meaningless.
  count('covers', offer.covers);
  count('draftCap', offer.draftCap);
  count('setupFee', offer.setupFee);
  if (offer.covers <= 0) problems.push('covers must be at least one person');
  if (offer.draftCap <= 0) problems.push('draftCap must be at least one draft');
  for (const [label, value] of [
    ['compare.individual', offer.compare.individual],
    ['compare.team', offer.compare.team],
    ['compare.teamMax', offer.compare.teamMax],
  ] as const) {
    if (typeof value !== 'number' || !(value > 0)) {
      problems.push(`${label} must be a positive number, found ${String(value)}`);
    }
  }

  return problems;
}

/**
 * The build guard. Throws with every problem listed, because a build that stops
 * on the first one costs a second build to find the second one.
 */
export function assertOfferValid(offer: Offer = OFFER): void {
  const problems = validateOffer(offer);
  if (problems.length > 0) {
    throw new Error(`Invalid offer configuration:\n  - ${problems.join('\n  - ')}`);
  }
}
