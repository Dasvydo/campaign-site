/**
 * The tiers, the seats and the free trial. Every figure the pricing section
 * says out loud, written down once.
 *
 * WHY A MODULE AND NOT A SENTENCE. The rule this file exists to keep is the
 * one the old offer module's header argued for and then proved the hard way:
 * a number typed into a sentence is a number nobody is checking. The page is
 * published in three languages, so a fee typed into copy is typed three
 * times, and the day after somebody corrects one of them the page is quoting
 * two different prices to two different readers with nothing to catch it.
 * Every figure below is read at render time by src/components/Tiers.tsx and
 * the copy in src/content/<locale>/tiers.ts carries only the words around it.
 * A price change is one edit, here.
 *
 * NOTHING BELOW IS CONFIRMED. The three seat rates and the two seat bands are
 * a transcription of the live doviloop.dev pricing, read on the date in
 * `readAt` and recovered out of a deleted file's git history. They are what
 * somebody else's page said on one day; nobody has confirmed that this
 * campaign sells at them. `basis` says so in the data rather than in a comment
 * a renderer cannot see, so a later task can print or gate on it. The trial
 * length is the one figure here that is not a transcription: the founder asked
 * for fourteen days free, twice, and that is the whole argument of the
 * section.
 *
 * WHAT IS NOT HERE. No whole-firm fee, no founding cohort, no FX rate, no
 * comparison against anybody. All of that went with the sales call it was
 * written for. If a figure is not printed on the page, it does not belong in
 * this file: a constant nobody renders is a constant nobody maintains.
 */
import { formatCount, formatMoney } from './offer';

/** The three tiers, in the order the page prints them. */
export type TierId = 'individual' | 'team' | 'managed';

/**
 * Where a figure came from.
 *
 * The same distinction src/lib/value.ts draws, for the same reason: a reader
 * of this file should never have to guess whether a number was read off
 * something real. `transcribed` means somebody copied it off a published
 * page on the date beside it and nobody has since confirmed that we sell at
 * it. `stated` means the founder decided it. There is deliberately no
 * `measured` here, because nothing on this page has been sold yet.
 */
export type PriceBasis = 'transcribed' | 'stated';

export interface Tier {
  readonly id: TierId;
  /** Per seat, per month, in `PRICING.currency`. */
  readonly seat: number;
  /**
   * The seat count this tier's card prints after its own label.
   *
   * One number per tier rather than a range, because the card prints a label
   * and then the count: "Seats 1", "Seats, up to 9", "Seats, from 10". That
   * shape is right at every count in all three languages, which a bare
   * numeral inside a noun phrase is not - Danish needs "1 plads" and "2
   * pladser", Lithuanian needs "1 vieta", "9 vietos" and "10 vietu". The
   * label carries the meaning of the edge; this carries the edge.
   */
  readonly seats: number;
}

export interface Pricing {
  /**
   * The currency every figure here is in, printed after the amount.
   *
   * It lives in the data rather than in the copy, which is a departure from
   * what src/lib/offer.ts's own header assumed, and it is a deliberate one.
   * The copy would have to carry the code in a half of a split slot, and one
   * of those halves is empty in the language that puts the code on the other
   * side - an empty half is exactly what the locale audit flags as a gap.
   * The code is an ISO code, identical in all three languages, so nothing is
   * lost by holding it here, and a change of currency stays one edit.
   *
   * What the copy does still own is the unit: "per seat, per month" is in
   * tiers.per, in each language's own word order.
   */
  readonly currency: 'USD';
  /** Print order, cheapest first. */
  readonly order: readonly TierId[];
  readonly tiers: Readonly<Record<TierId, Tier>>;
  readonly trial: {
    /**
     * The free days. The loudest fact in the section, and the one figure
     * here nobody transcribed: the founder asked for it.
     */
    readonly days: number;
    /**
     * The day the timeline's first stop is marked with.
     *
     * One rather than zero. The rescued trial copy reads "Day <n> of the
     * trial" in all three languages, and day zero of a trial a reader starts
     * themselves is a developer's way of counting, not a reader's.
     */
    readonly startDay: number;
    /**
     * What a month of the trial costs, which is the figure the timeline
     * strikes the fee out and replaces with.
     *
     * Zero is still a figure, so it is written down here rather than typed
     * into the component as a literal or, worse, into the copy as "0 USD" -
     * which is what the deleted price section did, in all three languages,
     * with the currency code baked in beside it.
     */
    readonly price: number;
  };
  readonly basis: PriceBasis;
  /** Where the transcribed figures were read. */
  readonly source: string;
  /** ISO-8601 date they were read on. */
  readonly readAt: string;
}

/**
 * The shipped figures. The only place in this application where a price, a
 * seat band or the length of the trial may be written down.
 *
 * To correct a rate: change it here, and every card, the timeline's total and
 * the screen reader announcement that names it all move together. Nothing
 * else needs touching, and nothing in src/content/ has to be re-read in a
 * language you do not speak.
 */
export const PRICING: Pricing = {
  currency: 'USD',
  order: ['individual', 'team', 'managed'],
  tiers: {
    /* Read off the live doviloop.dev pricing on `readAt`, one plan a line.
       Individual is the single seat plan; Team stops selling at nine seats
       and Managed starts at ten, so between them the two bands cover every
       size and each card prints the edge where its own plan meets a firm. */
    individual: { id: 'individual', seat: 29, seats: 1 },
    team: { id: 'team', seat: 59, seats: 9 },
    managed: { id: 'managed', seat: 89, seats: 10 },
  },
  trial: { days: 14, startDay: 1, price: 0 },
  basis: 'transcribed',
  source: 'doviloop.dev pricing, transcribed',
  readAt: '2026-09-16',
};

/** Every tier, cheapest first. The order the page prints them in. */
export function tiers(p: Pricing = PRICING): readonly Tier[] {
  return p.order.map((id) => p.tiers[id]);
}

/** One tier by id, so no caller indexes the record by hand. */
export function tierById(id: TierId, p: Pricing = PRICING): Tier {
  return p.tiers[id];
}

/**
 * A money figure with its currency, in the language it will be read in.
 *
 * The amount is grouped and decimalised by the locale (offer.ts does that and
 * explains why at length); the code follows it after a non-breaking space, so
 * "29 USD" can never wrap onto two lines in a pricing card.
 *
 * One function, so the fee on a card, the total under the timeline and the
 * struck out nothing on the last stop cannot disagree about how a price is
 * spelled.
 */
export function money(value: number, locale?: string | null): string {
  return `${formatMoney(value, locale)} ${PRICING.currency}`;
}

/**
 * A plain count, in the language it will be read in: a day marker, a seat
 * band, the fourteen in the headline.
 *
 * Re-exported through this module rather than imported from offer.ts by the
 * component, so the section reads every figure it prints from one place.
 */
export function count(value: number, locale?: string | null): string {
  return formatCount(value, locale);
}
