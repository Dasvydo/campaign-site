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
  /** Managed plan, USD per seat per month. */
  readonly managed: number;
  /** Smallest firm the Managed plan will sell to, in seats. A floor, where
      `teamMax` is a ceiling: Team stops at nine and Managed starts at ten, so
      between them they cover every size and the two rows in the table are the
      edges where each plan meets the sizes this offer is sold at. */
  readonly managedMin: number;
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
 *
 * Advancing a tier by hand, which is the edit this file exists to survive:
 * one, set `started` to the pilots actually running on that tier; two, set
 * `held` to the setup calls booked but not yet begun; three, when a tier has
 * no places left, move `declaredTier` on to the next tier along `order`; four,
 * run `npm run verify:offer`, which the build runs for you and which refuses
 * the edit, by name, if the counts and the declared tier disagree.
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
  /* Somebody else's published prices, all read on the date below.

     doviloop.dev sells three plans and all three are here. Individual is a
     plan for one person and is named in prose under the table, because a seat
     rate is not a firm's cost a head and cannot be read down the same column
     as one. Team and Managed are both firm level plans and both have a row.

     Team is a ceiling and Managed is a floor, which is why one row each is
     enough. Team stops selling at nine seats, so its largest firm is the last
     point where it touches the sizes this page is sold at. Managed starts at
     ten, so its smallest firm is the first. Between them they are the whole of
     what a firm at these head counts could buy instead of this offer.

     No figure of its own is written down in this comment on purpose: every
     rate this file carries appears exactly once, and the build guard enforces
     it. They are all three lines below. */
  compare: {
    individual: 29,
    team: 59,
    teamMax: 9,
    managed: 89,
    managedMin: 10,
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
 * How many pilots have started, across the whole ladder.
 *
 * Started, never held. A held place is a booked call, and a booked call is not
 * a customer anyone could be pointed at. Summed over every tier rather than
 * read off the active one, because the active tier's own count says nothing
 * about the tiers already spent: at `early` the founding places are full by
 * definition, and a question about whether this business has customers is a
 * question about all of them.
 */
export function pilotsStarted(offer: Offer = OFFER): number {
  return offer.order.reduce((n, id) => n + (offer.tiers[id]?.started ?? 0), 0);
}

/**
 * May the page still say it has no customers to point at?
 *
 * The one sentence on this page that makes a factual claim about the state of
 * the business rather than about the offer, which is why it is gated here
 * beside the claims about price rather than left standing in the copy. It is
 * true the day the page goes up and false from the first pilot onward, and
 * nothing about rendering it could ever notice: a sentence does not stop
 * reading like a sentence when it stops being true.
 *
 * Gated on the count and not on the tier. The tier is the coarser signal and
 * would have left the claim standing through the first four founding pilots,
 * every one of them a customer we could by then point at.
 */
export function noCustomersYet(offer: Offer = OFFER): boolean {
  return pilotsStarted(offer) === 0;
}

/**
 * What the smallest firm Managed will sell to pays every month. A fixed floor.
 *
 * The mirror of `teamCeilingMonthly`. Team is bounded above and Managed below,
 * so the two figures the comparison sets this offer against are the two points
 * where somebody else's per seat pricing meets the sizes sold here.
 */
export function managedFloorMonthly(offer: Offer = OFFER): number {
  return offer.compare.managedMin * offer.compare.managed;
}

/**
 * What the same firm would pay on the published Managed rate, or null where
 * Managed will not sell to a firm that size.
 *
 * The counterpart of `teamMonthly`, and bounded at the other end: Team refuses
 * firms above its seat ceiling, Managed refuses them below its floor. Null is
 * the honest answer in both cases, because below ten seats there is no Managed
 * price to set anything against.
 *
 * This exists because the comparison stopped being a table of three fixed head
 * counts and became a figure a reader moves. A reader who can choose the head
 * count can choose one the published rate says nothing about, and a component
 * handed a raw multiplication would print a Managed price for a firm Managed
 * would turn away.
 */
export function managedMonthly(headcount: number, offer: Offer = OFFER): number | null {
  // Whole people only, for the same reason `coversHeadcount` insists on it.
  if (!Number.isInteger(headcount) || headcount <= 0) return null;
  if (headcount < offer.compare.managedMin) return null;
  return headcount * offer.compare.managed;
}

/**
 * What a firm keeps every month by paying one firm fee instead of Managed's
 * per seat rate, or null where the two cannot be compared at all.
 *
 * Null rather than zero or a negative wherever either side is missing: above
 * the coverage ceiling this offer has no agreed price, and below the Managed
 * floor that plan has none, so there is no difference to report in either
 * direction. Where both exist the subtraction is left to say what it says. It
 * is not clamped at zero, because a page that can only ever print a saving is
 * a page that would keep printing one after the saving stopped being real.
 */
export function keptVsManaged(
  headcount: number,
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): number | null {
  if (!coversHeadcount(headcount, offer)) return null;
  const managed = managedMonthly(headcount, offer);
  if (managed === null) return null;
  return managed - tier.price;
}

/**
 * The head counts this comparison may be moved across: every size the flat fee
 * covers that Managed will also quote for.
 *
 * Derived from the offer rather than written down, so the control cannot offer
 * a size the arithmetic behind it refuses to price. The lower bound is the
 * Managed floor because below it there is nothing to compare against, and the
 * upper bound is the coverage ceiling because above it this offer has no per
 * head figure to show.
 */
export function comparableHeadcounts(offer: Offer = OFFER): number[] {
  const out: number[] = [];
  for (let n = offer.compare.managedMin; n <= offer.covers; n += 1) out.push(n);
  return out;
}

/**
 * Is our whole monthly bill below what the smallest Managed firm pays?
 *
 * The claim that matters most of the three, because Managed is the only plan
 * on the product site a firm at these head counts can actually buy. Team they
 * cannot: it stops at nine. Individual is sold by the seat to one person. So
 * this is the comparison a reader is really choosing between, and it is the
 * one that holds at every tier on the ladder rather than only the capped ones.
 *
 * Computed all the same, and strict rather than "at or below". A ladder that
 * ever priced a tier at or above the Managed floor would take the sentence off
 * the page instead of printing something untrue, which is the whole reason
 * none of these is written as copy.
 */
export function belowManagedFloor(
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): boolean {
  return tier.price < managedFloorMonthly(offer);
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
 * What mail is modelled to be costing the firm every month before any of this.
 *
 * The saving assumed for one person, times the people who write mail. It is
 * the first of the three figures the page's arithmetic runs on, and the only
 * one of them that is not read off a price: it is an assumption about a firm's
 * own time, which is why every component that prints it prints the hedge
 * beside it and why the disclosure under it says what the assumption is.
 *
 * Null on the same terms as every other model figure here. `modelIsAnswerable`
 * refuses a saving that is not a positive finite number and a head count the
 * fee does not cover, so a firm outside coverage gets no figure rather than a
 * flattering one, and a component cannot render null by accident.
 */
export function modelledSpend(
  savingPerPersonPerMonth: number,
  headcount: number,
  offer: Offer = OFFER,
): number | null {
  if (!modelIsAnswerable(savingPerPersonPerMonth, headcount, offer)) return null;
  return savingPerPersonPerMonth * headcount;
}

/**
 * What is left of that after the firm has paid for this.
 *
 * The third beat, and the only subtraction on the page a reader can do in
 * their head from the two figures printed above it. That is the point of
 * printing all three: a saving with no visible derivation is a number a reader
 * has to take on trust, and this page does not ask for trust it has not earned.
 *
 * Not clamped at zero. If the modelled spend ever fell below the fee the honest
 * answer is a negative, and a page that could only ever print a saving would
 * keep printing one after the saving stopped being real. The assumption would
 * have to change a long way before that happened, which is an argument for
 * leaving the arithmetic alone rather than for guarding it.
 */
export function modelledKept(
  savingPerPersonPerMonth: number,
  headcount: number,
  tier: TierConfig = activeTier(),
  offer: Offer = OFFER,
): number | null {
  const spend = modelledSpend(savingPerPersonPerMonth, headcount, offer);
  if (spend === null) return null;
  return spend - tier.price;
}

/**
 * Rounds to cents for display only. Never used by a claim: a claim reads the
 * exact value, so a figure that rounds down to look like a win cannot make a
 * sentence appear that the arithmetic does not support.
 */
export function usd(value: number): string {
  const cents = toCents(value);
  return Number.isInteger(cents) ? String(cents) : cents.toFixed(2);
}

/**
 * The rounding every printed figure shares.
 *
 * Pulled out of `usd` so that the localised formatters below round a figure
 * the same way it has always been rounded, rather than each holding its own
 * opinion about cents and drifting apart the first time one of them is
 * touched. `usd` itself is deliberately left as it was in every other
 * respect: it groups nothing and carries no symbol, several components and
 * two verification scripts read its exact output today, and none of them is
 * asking for a separator.
 */
function toCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/* -------------------------------------------------------------------------
 * Printing a figure in the language it is read in
 * ---------------------------------------------------------------------- */

/**
 * The languages this page is published in.
 *
 * A figure with a decimal part is not readable in the abstract. English writes
 * the decimal with a full stop and groups thousands with a comma; Danish does
 * exactly the reverse, a comma for the decimal and a full stop for the group;
 * Lithuanian writes the decimal with a comma and groups with a space. So the
 * same characters that say nineteen and a half to one reader say nineteen
 * hundred and fifty to the next, and a price is the last figure on the page
 * that may be ambiguous.
 *
 * These are the values of `htmlLang` in the content files, the two letter
 * codes, written out here rather than imported because the offer is the thing
 * the copy reads from and must not read from the copy. A content file that
 * grows a new language adds a case below; until it does, that language reads
 * as English rather than as something broken.
 */
export type OfferLocale = 'en' | 'da' | 'lt';

/**
 * Narrows whatever a caller happens to be holding to a language this file can
 * print in.
 *
 * It accepts a plain string, because `htmlLang` is typed as one and a call
 * site should not have to cast to ask for a price. It never throws, because
 * this runs while a page is rendering and a missing figure is a worse answer
 * than a figure grouped the English way. A region is accepted and dropped, so
 * the Danish of Denmark still reads as Danish. Anything unknown, absent or of
 * the wrong type falls back to English, which is the language the page is
 * served in when nothing says otherwise.
 *
 * The fallback is decided here rather than left to the formatter, and that is
 * the whole reason this function exists. An unrecognised tag handed straight
 * to the platform formatter does not fail; it quietly prints in whatever
 * locale the host prefers, which is a browser setting in one environment and a
 * server default in another. A figure that changes shape with the reader's
 * machine is precisely the ambiguity this section was added to remove.
 */
function resolveLocale(locale?: string | null): OfferLocale {
  const tag = typeof locale === 'string' ? locale.trim().toLowerCase().split('-')[0] : '';
  switch (tag) {
    case 'da':
      return 'da';
    case 'lt':
      return 'lt';
    default:
      return 'en';
  }
}

/**
 * The one formatter the two public ones share.
 *
 * Built on demand rather than kept in a cache beside it, because nothing added
 * to this file may run when the module is loaded: the only thing here allowed
 * to do that is the guard at the bottom. A rendered page prints a handful of
 * figures, not a stream of them, so a formatter per figure is a cost nobody
 * will ever measure. If that stops being true, the cache belongs inside this
 * function, behind its first call, and not at module scope.
 *
 * Grouping is left entirely to the locale data rather than assembled by hand,
 * which also settles where grouping starts: every locale decides for itself
 * how large a figure has to be before it is grouped at all, so a coverage of
 * twenty prints as bare digits in all three languages while a pooled cap in
 * the thousands is grouped in all three.
 *
 * The catch is there for a runtime shipped without locale data, not for a bad
 * tag, since the tag has already been narrowed to one of three known ones. It
 * falls back to the ungrouped shape `usd` prints, which is wrong in two
 * languages but readable in all of them, and readable beats absent while a
 * page is being rendered.
 */
function grouped(value: number, locale: string | null | undefined, fractionDigits: number): string {
  const tag = resolveLocale(locale);
  try {
    return new Intl.NumberFormat(tag, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      useGrouping: true,
    }).format(value);
  } catch {
    return fractionDigits > 0 && Number.isFinite(value) ? value.toFixed(fractionDigits) : String(value);
  }
}

/**
 * A money figure, in the language it will be read in.
 *
 * Rounds exactly as `usd` does, and keeps the distinction that rounding
 * carries: a value that lands on a whole unit prints with no decimal part at
 * all, while a value with cents keeps both of them. That is not a detail. A
 * price band that suddenly grew a decimal part in every language would be a
 * visible change to the offer that nobody asked for, and the figures that
 * need cents are the per head ones in the comparison, which is the section
 * whose entire job is to let a reader check the arithmetic.
 *
 * No currency symbol and no currency code, because the unit belongs to the
 * copy: the three languages do not agree on where it goes or whether it is
 * spaced, and this file has no business deciding that for them.
 */
export function formatMoney(value: number, locale?: string | null): string {
  const cents = toCents(value);
  return grouped(cents, locale, Number.isInteger(cents) ? 0 : 2);
}

/**
 * A count of things, in the language it will be read in.
 *
 * For the figures that count rather than cost: the coverage ceiling and the
 * pooled draft cap. Never a decimal part, because a fraction of a draft is not
 * a thing anyone is owed, and rounded rather than truncated so that a caller
 * handing over an average gets the nearest whole one instead of the floor.
 * Small counts come back as bare digits, since the locale groups only what it
 * considers large enough to need it.
 */
export function formatCount(value: number, locale?: string | null): string {
  return grouped(Math.round(value), locale, 0);
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

/** The problems as one block of text, so every caller reports them alike. */
function problemReport(problems: string[]): string {
  return `Invalid offer configuration:\n  - ${problems.join('\n  - ')}`;
}

/**
 * The build guard. Throws with every problem listed, because a build that stops
 * on the first one costs a second build to find the second one.
 */
export function assertOfferValid(offer: Offer = OFFER): void {
  const problems = validateOffer(offer);
  if (problems.length > 0) {
    throw new Error(problemReport(problems));
  }
}

/* -------------------------------------------------------------------------
 * Running the guard, when the page is what is running
 * ---------------------------------------------------------------------- */

/**
 * Was this bundle built for whoever wrote the edit, or for whoever reads the
 * page?
 *
 * Asked through an optional read rather than a plain one, because this module
 * is bundled outside Vite as well: the verification script hands it to esbuild
 * with nothing defined, and in a plain module `import.meta.env` is simply not
 * there. A guard that threw while working out whether it was allowed to throw
 * would be the worst of both worlds, so anything short of a definite yes is
 * read as no, which is the branch that cannot take a page down.
 */
function builtForDevelopment(): boolean {
  return (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;
}

/**
 * The guard, run once, the first time anything imports the offer.
 *
 * This is the only thing in this file that happens because the file was
 * loaded, and it is here because the guard above was until now a function
 * nobody called from the application: a hand edit that oversold a tier could
 * reach a browser with nothing having objected. It runs at module scope rather
 * than inside a helper deliberately. A check inside `activeTier` would run on
 * every render for no new information, since the configuration is frozen and
 * cannot change between two renders, and it would fail in whichever component
 * happened to ask first rather than at the point the offer was loaded.
 *
 * Why it does two different things in two places, which is a choice and not an
 * oversight.
 *
 * For whoever is editing, it throws. A thrown error at module scope stops the
 * dev server dead with the list of problems in front of the person who just
 * caused them, which is the fastest and least ignorable way to learn that the
 * counts no longer add up.
 *
 * For whoever is reading the page, it reports and carries on. Throwing here
 * would unmount the whole page, and a visitor who came from an ad would get a
 * blank screen instead of an offer: a wrong count is a bad day, an empty page
 * is the ad budget spent on nothing. The page is also not defenceless in that
 * state, because `remainingSpots` clamps at none rather than printing a
 * negative count, so the worst an oversold tier renders is a tier that reads
 * as full. The build is where a bad configuration is supposed to be stopped,
 * and it now is: the verification script runs ahead of the build through the
 * prebuild hook, so a configuration this bad should never have been given a
 * bundle at all. Reaching a visitor at all means that gate was bypassed, and
 * the console line is the record of it.
 */
const problemsAtLoad = validateOffer();
if (problemsAtLoad.length > 0) {
  const report = problemReport(problemsAtLoad);
  if (builtForDevelopment()) throw new Error(report);
  console.error(report);
}
