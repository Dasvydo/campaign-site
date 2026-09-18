/**
 * The offer, as a single source of truth.
 *
 * Every price the campaign page says out loud is derived from this file. Not
 * because duplication is untidy, but because the page makes an arithmetic
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
 * that is counting people. So each package is a flat monthly fee for the whole
 * firm: the total does not move when the firm grows, which means the cost per
 * person falls as the firm grows. The comparison helpers below exist to say
 * exactly where it falls past each published rate, and to refuse to say it
 * where it does not.
 *
 * Why two packages and not a scarcity ladder.
 *
 * Until 2026-09-17 this file held three tiers at rising prices, advanced by
 * capacity: founding, early, standard. That shape asks the reader to believe a
 * price will go up, which is a claim about the future and the weakest thing on
 * a page otherwise built out of arithmetic. It also had one coverage number for
 * all three, so a firm of six and a firm of twenty were quoted the same fee for
 * very different amounts of work.
 *
 * The ladder is now the buyer's own headcount. Desk covers up to ten mailboxes,
 * Firm up to twenty, and a reader picks by counting their own people rather
 * than by being told to hurry. Both packages carry the same product; the only
 * things that move are coverage and the pooled draft allowance, because those
 * are the only two things that actually cost more to serve.
 *
 * Why the caps are firm level and not per seat.
 *
 * A flat fee with a per seat draft allowance is an unbounded bill: twenty
 * people on a per seat allowance would be a multiple of what any one of them
 * could ever use. The draft cap is therefore pooled across the firm, and the
 * coverage is a ceiling on people rather than a price per person. Both are
 * commitments the offer can actually keep, and both are set so that a customer
 * sitting exactly at the cap is still served at a positive margin.
 *
 * Both caps allow five hundred drafts a person a month. They allowed four
 * hundred until 2026-09-18, which was not a decision anybody took: it fell out
 * of picking round numbers, and it meant a customer at the usage the founder
 * actually expects would have been over the cap in their first month, every
 * month. The cap is a commitment, so it is the figure the cost to serve should
 * be read at, not the usage somebody hopes for. The working is in
 * flow-savvy-automations/docs/economics/OFFER.md, section 6.
 *
 * Why the founding cohort is not a price.
 *
 * The founding trade is a testimonial, a sixty day case study, a logo and two
 * feedback calls, and what it buys is the five hundred dollar setup fee waived.
 * It is not a discount on the monthly fee, so nothing about the price a firm
 * reads today depends on when they read it. Five places, because WF4 polls
 * every sixty seconds at roughly 0.8 seconds a mailbox, which at seventy per
 * cent headroom is about fifty two mailboxes across every customer at once.
 * The scarcity is a fact about the architecture, not a device, and when it
 * stops being true the number here moves.
 */

export type PackageId = 'desk' | 'firm';

export interface PackageConfig {
  readonly id: PackageId;
  /** Flat USD per month for the whole firm, at any covered headcount. */
  readonly price: number;
  /** Largest firm this package is sold to, in mailboxes. */
  readonly covers: number;
  /** Drafts per month, pooled across the whole firm rather than per seat. */
  readonly draftCap: number;
}

/**
 * The founding trade, which is a capacity rather than a date.
 *
 * A countdown would be theatre, and the thing that actually runs out is
 * attention and polling headroom, both of which are counted in firms.
 */
export interface FoundingCohort {
  /** Places in the cohort. */
  readonly places: number;
  /** Pilots actually running. A place that has been spent. */
  readonly started: number;
  /** Setup calls booked but not started. A soft hold on a place. */
  readonly held: number;
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
 *
 * Only doviloop.dev appears here. Fyxer, Superhuman and Copilot are all
 * cheaper to argue against and all more dangerous: their prices came from
 * pricing round-ups rather than vendor pages, and an unverified third party
 * price on a public page is a comparative claim with nothing behind it. They
 * stay out of this file until somebody has read them off the vendor's own
 * pricing page. See OFFER.md, blocker 4.
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
  /** Package order, smallest firm first. Also the order the page prints them in. */
  readonly order: readonly PackageId[];
  readonly packages: Readonly<Record<PackageId, PackageConfig>>;
  readonly founding: FoundingCohort;
  /** One off setup fee in USD, waived while founding places remain. */
  readonly setupFee: number;
  /**
   * Drafts promised in the first thirty days, below which the month is free.
   *
   * Counted from n8n execution records rather than from anything the customer
   * has to track, and set well under what the smallest covered firm is expected
   * to produce, so it is a promise that can be kept rather than a forecast.
   */
  readonly guaranteeDrafts: number;
  readonly compare: CompareRates;
}

/**
 * Freezes the whole tree rather than the top level, because a top level freeze
 * leaves `OFFER.founding.started` writable, and a count that can be written at
 * runtime is a count that can disagree with the one the validator checked at
 * build time.
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
 * Spending a founding place, which is the edit this file exists to survive:
 * one, set `founding.started` to the pilots actually running; two, set
 * `founding.held` to the setup calls booked but not yet begun; three, run
 * `npm run verify:offer`, which the build runs for you and which refuses the
 * edit, by name, if the counts oversell the cohort.
 */
export const OFFER: Offer = deepFreeze({
  currency: 'USD',
  order: ['desk', 'firm'],
  packages: {
    desk: { id: 'desk', price: 149, covers: 10, draftCap: 5000 },
    firm: { id: 'firm', price: 199, covers: 20, draftCap: 10000 },
  },
  founding: { places: 5, started: 0, held: 0 },
  setupFee: 500,
  guaranteeDrafts: 150,
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

/** One package by id. Present so callers never index `OFFER.packages` by hand. */
export function packageById(id: PackageId, offer: Offer = OFFER): PackageConfig {
  return offer.packages[id];
}

/** Every package, smallest firm first. The order the page prints them in. */
export function packages(offer: Offer = OFFER): readonly PackageConfig[] {
  return offer.order.map((id) => offer.packages[id]);
}

/**
 * The package the page leads with, and the default for every helper here.
 *
 * The largest, because it is the one carrying the strongest per head number and
 * the one every claim on the page has to survive. A claim that holds on Firm at
 * its own coverage is the weaker of the two and so the safer default: Desk is
 * cheaper per firm but dearer per head, and a page that defaulted to the
 * flattering one would be arguing from the package fewer readers buy.
 */
export function headlinePackage(offer: Offer = OFFER): PackageConfig {
  return offer.packages[offer.order[offer.order.length - 1]];
}

/** The largest firm any package is sold to. The offer's ceiling, in people. */
export function maxCovers(offer: Offer = OFFER): number {
  return Math.max(...offer.order.map((id) => offer.packages[id].covers));
}

/**
 * The smallest package that covers a firm this size, or null above the ceiling.
 *
 * Null rather than the largest package, because above the ceiling there is no
 * package: a firm of thirty is a custom quote and the page must say so rather
 * than quote them Firm and hope. The search runs along `order`, which the
 * validator holds in increasing coverage, so the first hit is the smallest.
 */
export function packageForHeadcount(
  headcount: number,
  offer: Offer = OFFER,
): PackageConfig | null {
  if (!Number.isInteger(headcount) || headcount <= 0) return null;
  for (const id of offer.order) {
    if (headcount <= offer.packages[id].covers) return offer.packages[id];
  }
  return null;
}

/**
 * Places still advertised as open in the founding cohort.
 *
 * Both a started pilot and a soft hold take a place off the board. Clamped at
 * zero so an oversold cohort reads as full rather than as a negative number on
 * a public page; the overselling itself is caught by `validateOffer`, which is
 * the right place to make noise about it.
 */
export function remainingFoundingPlaces(offer: Offer = OFFER): number {
  const f = offer.founding;
  return Math.max(0, f.places - f.started - f.held);
}

/** Is the founding trade still on the table? Derived, never declared. */
export function foundingOpen(offer: Offer = OFFER): boolean {
  return remainingFoundingPlaces(offer) > 0;
}

/** The setup fee actually due. Zero while founding places remain. */
export function setupDue(offer: Offer = OFFER): number {
  return foundingOpen(offer) ? 0 : offer.setupFee;
}

/** What lands on the first invoice: one month plus whatever setup is due. */
export function firstMonthTotal(
  pkg: PackageConfig = headlinePackage(),
  offer: Offer = OFFER,
): number {
  return pkg.price + setupDue(offer);
}

/**
 * How many pilots have started.
 *
 * Started, never held. A held place is a booked call, and a booked call is not
 * a customer anyone could be pointed at.
 */
export function pilotsStarted(offer: Offer = OFFER): number {
  return offer.founding.started;
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
 */
export function noCustomersYet(offer: Offer = OFFER): boolean {
  return pilotsStarted(offer) === 0;
}

/* -------------------------------------------------------------------------
 * The arithmetic the page argues from
 * ---------------------------------------------------------------------- */

/**
 * Whether a package actually covers a firm this size.
 *
 * Everything below, including `perPerson` itself, refuses to produce a per
 * person number outside coverage. A firm of thirty would get a flattering
 * figure out of a division we have not agreed to honour, and a flattering
 * number we cannot honour is worse than no number.
 *
 * A headcount has to be a whole number, for the same reason the validator
 * insists the cohort counts are whole numbers: it is a count of people. Seven
 * and a half people is not a smaller firm, it is a bad input, and a bad input
 * that divides cleanly is the kind that reaches a page unnoticed.
 */
export function coversHeadcount(
  headcount: number,
  pkg: PackageConfig = headlinePackage(),
): boolean {
  return Number.isInteger(headcount) && headcount > 0 && headcount <= pkg.covers;
}

/**
 * Flat monthly fee divided by people. The whole argument, in one line.
 *
 * Null outside coverage, not just for arithmetic that would misbehave. Zero, a
 * negative, a fraction, NaN and Infinity are all refused, and so is any firm
 * larger than the package covers: there is no agreed price per head out there,
 * so there is no number to hand a component. Returning a raw division above the
 * ceiling would put the most flattering figure on the page in exactly the case
 * we have not committed to serve, and it would only take one component
 * forgetting to read `covered` first. Null is a value a component cannot render
 * by accident.
 */
export function perPerson(
  headcount: number,
  pkg: PackageConfig = headlinePackage(),
): number | null {
  if (!coversHeadcount(headcount, pkg)) return null;
  return pkg.price / headcount;
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

/** What the same firm would pay on the published Managed rate, at any size it sells to. */
export function managedMonthly(headcount: number, offer: Offer = OFFER): number | null {
  if (!Number.isInteger(headcount) || headcount <= 0) return null;
  if (headcount < offer.compare.managedMin) return null;
  return headcount * offer.compare.managed;
}

/** What the largest firm Team will sell to pays every month. A fixed ceiling. */
export function teamCeilingMonthly(offer: Offer = OFFER): number {
  return offer.compare.teamMax * offer.compare.team;
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
 * Is our cost per head below the published Team seat rate, at this size and on
 * this package? Computed, never assumed, and strict rather than "at or below":
 * equal is not cheaper, and the page may not say cheaper when it is equal.
 */
export function belowTeamRate(
  headcount: number,
  pkg: PackageConfig = headlinePackage(),
  offer: Offer = OFFER,
): boolean {
  const each = perPerson(headcount, pkg);
  if (each === null) return false;
  return each < offer.compare.team;
}

/** The same question against the Individual seat rate, which is the harder bar. */
export function belowIndividualRate(
  headcount: number,
  pkg: PackageConfig = headlinePackage(),
  offer: Offer = OFFER,
): boolean {
  const each = perPerson(headcount, pkg);
  if (each === null) return false;
  return each < offer.compare.individual;
}

/**
 * Is our whole monthly bill below what the smallest Managed firm pays?
 *
 * The claim that matters most of the three, because Managed is the only plan
 * on the product site a firm at these head counts can actually buy. Team they
 * cannot: it stops at nine. Individual is sold by the seat to one person. So
 * this is the comparison a reader is really choosing between.
 *
 * Computed all the same, and strict rather than "at or below". A package
 * priced at or above the Managed floor would take the sentence off the page
 * instead of printing something untrue, which is the whole reason none of
 * these is written as copy.
 */
export function belowManagedFloor(
  pkg: PackageConfig = headlinePackage(),
  offer: Offer = OFFER,
): boolean {
  return pkg.price < managedFloorMonthly(offer);
}

/**
 * Is our whole monthly bill below what the largest Team firm pays?
 *
 * Independent of headcount, because both sides of it are fixed. It is computed
 * rather than written as copy so that the sentence it supports disappears from
 * the page by itself if a package is ever priced past the Team ceiling.
 */
export function belowTeamCeiling(
  pkg: PackageConfig = headlinePackage(),
  offer: Offer = OFFER,
): boolean {
  return pkg.price < teamCeilingMonthly(offer);
}

/** Every claim the page can make about one headcount on one package, resolved. */
export interface Comparison {
  readonly pkg: PackageId;
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
  /** Null below the Managed seat floor, where Managed will not sell. */
  readonly managedMonthly: number | null;
  readonly teamCeilingMonthly: number;
  readonly managedFloorMonthly: number;
  /** Positive numbers mean we are cheaper. Null where the rival has no price. */
  readonly savedVsTeam: number | null;
  readonly savedVsIndividual: number | null;
  readonly savedVsManaged: number | null;
  readonly claims: {
    readonly belowTeamRate: boolean;
    readonly belowIndividualRate: boolean;
    readonly belowTeamCeiling: boolean;
    readonly belowManagedFloor: boolean;
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
  pkg: PackageConfig = headlinePackage(),
  offer: Offer = OFFER,
): Comparison {
  const each = perPerson(headcount, pkg);
  const team = teamMonthly(headcount, offer);
  const individual = individualMonthly(headcount, offer);
  const managed = managedMonthly(headcount, offer);
  return {
    pkg: pkg.id,
    headcount,
    covered: coversHeadcount(headcount, pkg),
    monthly: pkg.price,
    perPerson: each,
    teamMonthly: team,
    individualMonthly: individual,
    managedMonthly: managed,
    teamCeilingMonthly: teamCeilingMonthly(offer),
    managedFloorMonthly: managedFloorMonthly(offer),
    savedVsTeam: team === null ? null : team - pkg.price,
    savedVsIndividual: individual === null ? null : individual - pkg.price,
    savedVsManaged: managed === null ? null : managed - pkg.price,
    claims: {
      belowTeamRate: belowTeamRate(headcount, pkg, offer),
      belowIndividualRate: belowIndividualRate(headcount, pkg, offer),
      belowTeamCeiling: belowTeamCeiling(pkg, offer),
      belowManagedFloor: belowManagedFloor(pkg, offer),
    },
  };
}

/**
 * The smallest firm at which a per head claim starts to hold on a package, or
 * null when it never holds inside coverage.
 *
 * Searched rather than solved with a division and a ceiling, because the search
 * asks the same predicate the page will ask, and a closed form would be a
 * second implementation of the comparison that could drift from the first.
 */
export function breakEvenHeadcount(
  against: 'team' | 'individual',
  pkg: PackageConfig = headlinePackage(),
  offer: Offer = OFFER,
): number | null {
  const holds = against === 'team' ? belowTeamRate : belowIndividualRate;
  for (let n = 1; n <= pkg.covers; n += 1) {
    if (holds(n, pkg, offer)) return n;
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
  pkg: PackageConfig,
): boolean {
  return (
    Number.isInteger(savingPerPersonPerMonth) &&
    savingPerPersonPerMonth > 0 &&
    coversHeadcount(headcount, pkg)
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
 * the invariants do not forbid it.
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
  pkg: PackageConfig = headlinePackage(),
): number | null {
  if (!modelIsAnswerable(savingPerPersonPerMonth, headcount, pkg)) return null;
  if (!(pkg.price > 0)) return null;
  return Math.round((savingPerPersonPerMonth * headcount) / pkg.price);
}

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

/**
 * Everything wrong with a configuration, as sentences a person can act on.
 *
 * Takes the offer as an argument rather than reading the shipped one so a
 * candidate edit can be checked before it is shipped, which is what the script
 * does.
 */
export function validateOffer(offer: Offer = OFFER): string[] {
  const problems: string[] = [];
  const count = (label: string, value: unknown): void => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      problems.push(`${label} must be a non-negative whole number, found ${String(value)}`);
    }
  };

  // First: every package listed in order exists, and its three numbers
  // are the kind of number they claim to be. A fractional coverage or a
  // negative price would silently poison every derived figure on the page.
  for (const id of offer.order) {
    const pkg = offer.packages[id];
    if (!pkg) {
      problems.push(`package ${id} is listed in order but missing from packages`);
      continue;
    }
    count(`${id}.covers`, pkg.covers);
    count(`${id}.draftCap`, pkg.draftCap);
    if (typeof pkg.price !== 'number' || !(pkg.price > 0)) {
      problems.push(`${id}.price must be a positive number, found ${String(pkg.price)}`);
    }
    if (pkg.covers <= 0) problems.push(`${id}.covers must be at least one person`);
    if (pkg.draftCap <= 0) problems.push(`${id}.draftCap must be at least one draft`);
  }

  if (offer.order.length === 0) problems.push('the offer must sell at least one package');

  // Next: the ladder only ever goes up, in all three of the numbers that
  // define a package. A larger package that cost less, covered fewer people or
  // pooled fewer drafts would make `packageForHeadcount` quote the wrong one
  // and would make the table on the page an argument for buying downward.
  for (let i = 1; i < offer.order.length; i += 1) {
    const prev = offer.packages[offer.order[i - 1]];
    const next = offer.packages[offer.order[i]];
    if (!prev || !next) continue;
    if (!(prev.price < next.price)) {
      problems.push(
        `package prices must increase along the ladder: ${prev.id} at ${prev.price} is not below ${next.id} at ${next.price}`,
      );
    }
    if (!(prev.covers < next.covers)) {
      problems.push(
        `package coverage must increase along the ladder: ${prev.id} covers ${prev.covers} which is not below ${next.id} at ${next.covers}`,
      );
    }
    if (!(prev.draftCap < next.draftCap)) {
      problems.push(
        `package draft caps must increase along the ladder: ${prev.id} pools ${prev.draftCap} which is not below ${next.id} at ${next.draftCap}`,
      );
    }
  }

  // Then: the founding cohort cannot owe more places than it has. This
  // is the one that catches a booking taken against a cohort already spent.
  count('founding.places', offer.founding.places);
  count('founding.started', offer.founding.started);
  count('founding.held', offer.founding.held);
  if (offer.founding.started + offer.founding.held > offer.founding.places) {
    problems.push(
      `the founding cohort is oversold: ${offer.founding.started} started plus ` +
        `${offer.founding.held} held exceeds ${offer.founding.places} places`,
    );
  }

  // Then: every package must be cheaper for the whole firm than the
  // smallest firm Managed will sell to pays. This is the claim the page is
  // built on, and a package that failed it would leave the comparison table
  // printing a saving that was actually a premium. Checked here rather than
  // left to the component, because a component can only decline to render a
  // sentence: it cannot decline to ship a price.
  const floor = managedFloorMonthly(offer);
  for (const id of offer.order) {
    const pkg = offer.packages[id];
    if (pkg && !(pkg.price < floor)) {
      problems.push(
        `${id} at ${pkg.price} is not below the Managed floor of ${floor}, so the ` +
          `comparison the page is built on does not hold for it`,
      );
    }
  }

  // Last: the guarantee has to be a promise the smallest covered firm
  // can actually be held to. Zero drafts would be a guarantee of nothing.
  count('guaranteeDrafts', offer.guaranteeDrafts);
  if (offer.guaranteeDrafts <= 0) {
    problems.push('guaranteeDrafts must be at least one draft');
  }

  count('setupFee', offer.setupFee);
  for (const [label, value] of [
    ['compare.individual', offer.compare.individual],
    ['compare.team', offer.compare.team],
    ['compare.teamMax', offer.compare.teamMax],
    ['compare.managed', offer.compare.managed],
    ['compare.managedMin', offer.compare.managedMin],
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
