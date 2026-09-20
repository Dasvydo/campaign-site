/**
 * What a customer keeps, as a single source of truth.
 *
 * The sibling of offer.ts. That file holds every number about what we charge;
 * this one holds every number about what a firm gets back, and the two never
 * meet except through the helpers below. Until 2026-09-18 the buyer-side
 * figures lived only in prose, and one of them went stale for two commits
 * without anything noticing: the copy said a person saved 430 EUR a month when
 * the model that produced that figure had already been replaced. A number
 * typed into a sentence is a number nobody is checking.
 *
 * Every constant carries where it came from. `measured` means somebody read it
 * off the live system on the date beside it; `assumed` means it is the best
 * guess of a person who has not measured it. The page reads that flag: an
 * assumed figure is presented as the visitor's own estimate that they can move,
 * and a measured one is stated. The day the four minutes is timed, its basis
 * flips here and the page stops hedging by itself.
 *
 * Nothing here is a price. The fee the calculator subtracts is read from
 * offer.ts at the moment it is needed, so this file cannot disagree with the
 * price band about what a package costs.
 */

import {
  OFFER,
  headlinePackage,
  maxCovers,
  packageForHeadcount,
  type Offer,
  type PackageConfig,
} from './offer';

export type Basis = 'measured' | 'assumed';

export interface Constant {
  readonly value: number;
  readonly basis: Basis;
  /** The date a measured figure was read. Absent on an assumption. */
  readonly readAt?: string;
}

/** What a control on the page may offer: its two ends, its step, and where it
    opens. */
export interface Range {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly start: number;
}

export interface Value {
  /** The share of inbound mail that gets a draft. Read off a live mailbox:
      230 inbound messages produced 35 drafts. */
  readonly draftRate: Constant;
  /** Minutes to write one reply from nothing. The larger half of the pair
      below, and the only one the page ever prints on its own: the worked
      example's close says what nobody spent. Never timed. */
  readonly minutesFromScratch: Constant;
  /** Minutes to read a prepared draft and send it. The smaller half. */
  readonly minutesToSend: Constant;
  /** Minutes a person saves on one draft, against writing it from nothing.
      Derived from the two above rather than declared, because it used to be
      declared and the worked example quietly disagreed with it: the demo said
      a reply took nine minutes to write while the calculator's own basis said
      five, and nothing could tell. It is now subtracted from the two constants
      above rather than declared beside them, so the three cannot disagree at
      all, and `validateValue` refuses a pair that does not subtract as a second
      line. Never timed. */
  readonly minutesPerDraft: Constant;
  /** Inbound emails each person receives a month. An illustrative range, not
      a measurement; the visitor supplies their own. */
  readonly inbound: Range;
  readonly drafts: Range;
  /** What an hour of a person's time costs the firm, in our currency. The
      visitor's own figure; the control opens on the market the page is read
      in. */
  readonly hourly: Omit<Range, 'start'>;
  /** Where the hourly control opens, by the language the page is read in.
      Derived from published junior salaries, loaded and rounded: about 30 in
      Denmark, about 10 in Lithuania. English is read from Denmark. */
  readonly hourlyStart: Readonly<Record<string, number>>;
  /** The window the minutes control may move within. It opens on the
      assumption above. */
  readonly minutes: Omit<Range, 'start'>;
  /** The inbound volume the hero's one flat figure is computed at. The low
      end of the illustrative range, on the largest package at its own
      coverage, so the line is arithmetic on our own price rather than a claim
      about anyone's mail. */
  readonly heroInbound: number;
}

function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === 'object') {
    Object.freeze(obj);
    for (const v of Object.values(obj as object)) deepFreeze(v);
  }
  return obj;
}

/* The two halves of the minutes, named so the saving can be SUBTRACTED from
   them rather than typed beside them.

   This was `minutesPerDraft: { value: 5 - 1 }` for one commit, which reads as
   a derivation and is not one: `5 - 1` is a literal that happens to agree with
   the two constants above it, and nothing tied them together. An independent
   verifier moved `minutesFromScratch` to 9 and got a page that said writing
   one from nothing takes 9 minutes, reading a prepared one takes 1, and the
   saving is 4, because the calculator opens its control on `minutesPerDraft`.
   That is the same contradiction the whole change existed to kill, in the same
   shape, and the build accepted it.

   Referencing the constants makes the drift unrepresentable rather than
   merely checked: move either one and the saving moves with it. The guard in
   `validateValue` stays as a second line, but it is no longer the only one. */
const MINUTES_FROM_SCRATCH = 5;
const MINUTES_TO_SEND = 1;

export const VALUE: Value = deepFreeze({
  draftRate: { value: 0.152, basis: 'measured', readAt: '2026-09-17' },
  minutesFromScratch: { value: MINUTES_FROM_SCRATCH, basis: 'assumed' },
  minutesToSend: { value: MINUTES_TO_SEND, basis: 'assumed' },
  minutesPerDraft: { value: MINUTES_FROM_SCRATCH - MINUTES_TO_SEND, basis: 'assumed' },
  inbound: { min: 50, max: 1000, step: 50, start: 300 },
  /* The calculator asks for this one and multiplies nothing into it. Its
     ceiling is where the old chain topped out: twenty people taking a
     thousand emails each came to about 3,040 drafts, so a reader who could
     reach a number before can still reach it. Both packages pool far more
     than this (5,000 and 10,000), so the allowance cannot bind inside the
     control, which is deliberate: a slider that runs past what the fee buys
     would need the page to say what happens then, and it does not. */
  /* The control opens on what the reader's own package pools, and reaches
     the largest allowance the offer sells. `start` is only the value before a
     head count is known; the panel resets it to `packageFor(people).draftCap`
     whenever the package changes, so a reader on Desk opens on 5,000 and one
     on Firm on 10,000. */
  drafts: { min: 500, max: 10000, step: 100, start: 5000 },
  hourly: { min: 5, max: 100, step: 5 },
  hourlyStart: { en: 30, da: 30, lt: 10 },
  minutes: { min: 1, max: 10, step: 1 },
  heroInbound: 200,
} as Value);

/* -------------------------------------------------------------------------
 * What a control may offer
 * ---------------------------------------------------------------------- */

/** The head counts the calculator may be asked about: the smallest firm the
    offer sells to, which is the smallest package's coverage, up to the largest
    any package covers. Below the floor the page sends a reader to the product
    site, so a control that started lower would be pricing a firm this offer
    turns away; above the ceiling there is no package and so no fee. */
export function peopleRange(offer: Offer = OFFER): Range {
  const smallest = offer.packages[offer.order[0]].covers;
  return { min: smallest, max: maxCovers(offer), step: 1, start: smallest };
}

/** Where the hourly control opens for a page read in this language. Unknown
    languages open where English does rather than nowhere. */
export function hourlyStart(locale: string | null | undefined, value: Value = VALUE): number {
  const key = (locale ?? '').toLowerCase().split('-')[0];
  return value.hourlyStart[key] ?? value.hourlyStart.en;
}

function within(n: number, r: { min: number; max: number }): boolean {
  return Number.isFinite(n) && n >= r.min && n <= r.max;
}

/** Whether the four inputs are ones the model will answer for. Anything
    outside the stated ranges is refused rather than extrapolated: a figure the
    page did not offer is a figure it has not thought about. */
export function inputsAnswerable(
  people: number,
  inboundPerPerson: number,
  minutes: number,
  hourly: number,
  value: Value = VALUE,
  offer: Offer = OFFER,
): boolean {
  return (
    Number.isInteger(people) &&
    within(people, peopleRange(offer)) &&
    within(inboundPerPerson, value.inbound) &&
    within(minutes, value.minutes) &&
    within(hourly, value.hourly)
  );
}

/* -------------------------------------------------------------------------
 * The model, one step at a time
 *
 * inbound x the measured draft rate = drafts
 * drafts x minutes saved on each / 60 = hours handed back
 * hours x what an hour costs = what those hours cost the firm today
 * that, less the fee = what the firm keeps
 *
 * Each helper returns null rather than a number it cannot stand behind.
 * ---------------------------------------------------------------------- */

/** Drafts a month across the firm, from what its people receive. */
export function draftsPerMonth(
  people: number,
  inboundPerPerson: number,
  value: Value = VALUE,
  offer: Offer = OFFER,
): number | null {
  if (!Number.isInteger(people) || !within(people, peopleRange(offer))) return null;
  if (!within(inboundPerPerson, value.inbound)) return null;
  return people * inboundPerPerson * value.draftRate.value;
}

/**
 * The calculator's chain, which begins at drafts.
 *
 * It used to begin at inbound mail and multiply by the measured share, which
 * asked a reader for a figure they could answer and printed a figure they were
 * buying. The founder's objection was that the thing being sold is drafts, and
 * he is right that the panel should be denominated in it. So the control asks
 * for drafts and the share becomes a hint under it for anyone who only knows
 * their inbox, rather than an invisible multiplier.
 *
 * Head count no longer enters this sum at all, and that is not a loss: what a
 * firm saves depends on how many drafts it sends, not on how many people are
 * sitting there. The head count still picks the package, and so the fee.
 */
export function hoursFromDrafts(
  drafts: number,
  minutes: number,
  value: Value = VALUE,
): number | null {
  if (!within(drafts, value.drafts) || !within(minutes, value.minutes)) return null;
  return (drafts * minutes) / 60;
}

/**
 * The hours as the panel prints them, which is what the money is worked out
 * from.
 *
 * The exact hours and the printed hours were two different numbers, and the
 * money came from the exact one. At fifty drafts and a minute saved that read
 * "about 1 h" beside "about 83 EUR", so a reader multiplying the two figures
 * in front of them got 100 and the panel was wrong by its own arithmetic.
 *
 * Rounding here and deriving the money from the result costs a little accuracy
 * at the bottom of the range and always in the same direction, downwards, so
 * the panel understates rather than overstates. That is the right way round
 * for a figure we are asking someone to trust.
 */
export function hoursShown(
  drafts: number,
  minutes: number,
  value: Value = VALUE,
): number | null {
  const raw = hoursFromDrafts(drafts, minutes, value);
  if (raw === null) return null;
  return raw < 10 ? Math.round(raw * 10) / 10 : Math.round(raw);
}

/** What those hours cost the firm today, from a draft count. */
export function worthFromDrafts(
  drafts: number,
  minutes: number,
  hourly: number,
  value: Value = VALUE,
): number | null {
  const hours = hoursShown(drafts, minutes, value);
  if (hours === null || !within(hourly, value.hourly)) return null;
  return hours * hourly;
}

/** What the firm keeps a month, from a draft count and the package its head
    count puts it on. Negative where the model does not clear. */
export function keptFromDrafts(
  people: number,
  drafts: number,
  minutes: number,
  hourly: number,
  value: Value = VALUE,
  offer: Offer = OFFER,
): number | null {
  const worth = worthFromDrafts(drafts, minutes, hourly, value);
  const pkg = packageFor(people, offer);
  if (worth === null || pkg === null) return null;
  return worth - pkg.price;
}

/** Hours a month the firm gets back, at the minutes the visitor allows.
    The inbound path, which the HERO still argues from: it illustrates a firm
    of a stated size taking a stated volume, where nobody has told us a draft
    count. */
export function hoursBack(
  people: number,
  inboundPerPerson: number,
  minutes: number,
  value: Value = VALUE,
  offer: Offer = OFFER,
): number | null {
  const drafts = draftsPerMonth(people, inboundPerPerson, value, offer);
  if (drafts === null || !within(minutes, value.minutes)) return null;
  return (drafts * minutes) / 60;
}

/** What those hours cost the firm today, at the visitor's own hourly rate. */
export function worthPerMonth(
  people: number,
  inboundPerPerson: number,
  minutes: number,
  hourly: number,
  value: Value = VALUE,
  offer: Offer = OFFER,
): number | null {
  const hours = hoursBack(people, inboundPerPerson, minutes, value, offer);
  if (hours === null || !within(hourly, value.hourly)) return null;
  return hours * hourly;
}

/** The package a firm this size would be on, and so the fee the model
    subtracts. Null above the ceiling, where there is no package. */
export function packageFor(people: number, offer: Offer = OFFER): PackageConfig | null {
  return packageForHeadcount(people, offer);
}

/** What the firm keeps a month: what the hours cost today, less the fee.
    Negative where the model does not clear, and the page says so rather than
    hiding it. */
export function keptPerMonth(
  people: number,
  inboundPerPerson: number,
  minutes: number,
  hourly: number,
  value: Value = VALUE,
  offer: Offer = OFFER,
): number | null {
  const worth = worthPerMonth(people, inboundPerPerson, minutes, hourly, value, offer);
  const pkg = packageFor(people, offer);
  if (worth === null || pkg === null) return null;
  return worth - pkg.price;
}

/**
 * The hourly cost at which the fee and the hours handed back are equal.
 *
 * Arithmetic on our own price and a stated volume, and nothing else: the fee
 * divided by the hours. It is the one value figure the page states flatly,
 * because it makes no claim about what anyone's staff cost. The reader
 * supplies that and does the comparison themselves.
 */
export function breakEvenHourly(
  pkg: PackageConfig,
  people: number,
  inboundPerPerson: number,
  minutes: number,
  value: Value = VALUE,
  offer: Offer = OFFER,
): number | null {
  const hours = hoursBack(people, inboundPerPerson, minutes, value, offer);
  if (hours === null || hours <= 0) return null;
  return pkg.price / hours;
}

/**
 * The hero's figure, to the nearest whole unit of our currency.
 *
 * Computed on the largest package at its own coverage, at the low end of the
 * illustrative inbound range, at the assumed minutes. Every one of those is a
 * choice, and they are made here, once, so the sentence in the hero can carry
 * "about" and mean it.
 */
export function heroBreakEvenHourly(value: Value = VALUE, offer: Offer = OFFER): number | null {
  const pkg = headlinePackage(offer);
  const raw = breakEvenHourly(
    pkg,
    pkg.covers,
    value.heroInbound,
    value.minutesPerDraft.value,
    value,
    offer,
  );
  return raw === null ? null : Math.round(raw);
}

/**
 * The hours a month the hero promises back, to the nearest whole hour.
 *
 * Computed on exactly the basis the break even figure above uses: the largest
 * package at its own coverage, the low end of the illustrative inbound range,
 * the assumed minutes. It replaced that break even figure in the hero on
 * 2026-09-19. The arithmetic was sound but the sentence it produced was not
 * doing its job: the fee divided by the hours comes out below every legal wage
 * in the markets this page is sold in, so "it pays for itself if your people
 * cost more than that" is a condition that is always true, and a reader who
 * notices reads it as rhetoric rather than as the arithmetic it is.
 *
 * The hours are the same sum stopped one step earlier, before the division
 * that made it sound like a claim about cheap labour. They are hedged with
 * "about" in the copy, because they move with the volume and the minutes.
 */
export function heroHoursBack(value: Value = VALUE, offer: Offer = OFFER): number | null {
  const pkg = headlinePackage(offer);
  const raw = hoursBack(
    pkg.covers,
    value.heroInbound,
    value.minutesPerDraft.value,
    value,
    offer,
  );
  return raw === null ? null : Math.round(raw);
}

/** The measured draft rate as a percentage, for the one place the page prints
    it. Rounded to one decimal, which is how it was read. */
export function draftRatePercent(value: Value = VALUE): number {
  return Math.round(value.draftRate.value * 1000) / 10;
}

/** The measured share the other way up: one email in how many gets a draft.
    A count, rounded, for the quiet line in the accuracy block that says what
    the product leaves alone. */
export function oneEmailIn(value: Value = VALUE): number {
  return Math.round(1 / value.draftRate.value);
}

/**
 * Hours, set so that the reader can multiply them.
 *
 * `formatCount` rounds to a whole number, which is right for drafts and wrong
 * for hours at the bottom of the range. At fifty drafts and a minute saved the
 * panel printed "about 1 h" beside "about 83 EUR", and a reader doing the
 * multiplication the panel invites gets 100. The panel's own docstring says
 * every number on it is one they can check with a pencil; that one was not.
 *
 * One decimal below ten, none above, which is where a tenth of an hour stops
 * being worth printing. `hoursShown` in value.ts rounds to the same precision
 * and the money is derived from THAT, so the two always multiply out.
 */
export function formatHours(value: number, locale?: string | null): string {
  return new Intl.NumberFormat(locale || 'en', {
    maximumFractionDigits: Math.abs(value) < 10 ? 1 : 0,
    useGrouping: true,
  }).format(value);
}

/** A share as a percentage figure, in the language it is read in: one
    decimal at most, which is how the rate was read, and never the two a
    money formatter would give it. */
export function formatShare(value: number, locale?: string | null): string {
  try {
    return new Intl.NumberFormat(locale ?? 'en', { maximumFractionDigits: 1 }).format(value);
  } catch {
    return String(value);
  }
}

/** Everything wrong with the model, as sentences. Empty when it is sound. */
export function validateValue(value: Value = VALUE, offer: Offer = OFFER): string[] {
  const out: string[] = [];
  if (!(value.draftRate.value > 0 && value.draftRate.value < 1)) {
    out.push('draftRate must be a share between 0 and 1');
  }
  if (value.draftRate.basis === 'measured' && !value.draftRate.readAt) {
    out.push('a measured draftRate must say when it was read');
  }
  if (!(value.minutesPerDraft.value > 0)) out.push('minutesPerDraft must be positive');
  if (!within(value.minutesPerDraft.value, value.minutes)) {
    out.push('the minutes control must be able to open on the assumed minutes');
  }
  if (!(value.minutesFromScratch.value > value.minutesToSend.value)) {
    out.push('writing one from nothing must take longer than reading a prepared one');
  }
  /* Both halves need bounds of their own. Until an independent verifier looked,
     neither had any: `minutesToSend` was not even required to be positive, and
     `minutesFromScratch` could be set to anything that still subtracted. It is
     printed in three languages, so an unbounded value is a grammar bug waiting
     in the two that inflect around a count. */
  if (!(value.minutesToSend.value > 0)) out.push('minutesToSend must be positive');
  if (!within(value.minutesFromScratch.value, value.minutes)) {
    out.push('the minutes control must be able to reach the figure the worked example prints');
  }
  if (value.minutesFromScratch.value - value.minutesToSend.value !== value.minutesPerDraft.value) {
    out.push(
      'the saving must be the difference between writing one from nothing and sending a prepared one',
    );
  }
  if (!within(value.inbound.start, value.inbound)) {
    out.push('the inbound control must open inside its own range');
  }
  if (!within(value.heroInbound, value.inbound)) {
    out.push('the hero volume must be one the inbound control can offer');
  }
  if (!within(value.drafts.start, value.drafts)) {
    out.push('the drafts control must open inside its own range');
  }
  if (!(value.drafts.min > 0)) out.push('the drafts control must not offer zero drafts');
  /* The control is denominated in the allowance now, so its ceiling IS the
     largest allowance: shorter and it could not show a Firm its own package,
     longer and it would price drafts nobody is sold. */
  const biggestPool = Math.max(...offer.order.map((id) => offer.packages[id].draftCap));
  if (value.drafts.max !== biggestPool) {
    out.push(`the drafts control should stop at the largest pooled allowance, ${biggestPool}`);
  }
  for (const id of offer.order) {
    if (offer.packages[id].draftCap < value.drafts.min) {
      out.push(`${id} pools fewer drafts than the control can offer`);
    }
  }
  for (const [k, v] of Object.entries(value.hourlyStart)) {
    if (!within(v, value.hourly)) out.push(`hourlyStart.${k} is outside the hourly range`);
  }
  if (!('en' in value.hourlyStart)) out.push('hourlyStart needs an English default');
  for (const r of [value.inbound, value.hourly, value.minutes]) {
    if (!(r.min < r.max) || !(r.step > 0)) out.push('every range needs min < max and a positive step');
  }
  if (heroBreakEvenHourly(value, offer) === null) out.push('the hero figure does not compute');
  if (heroHoursBack(value, offer) === null) out.push('the hero hours do not compute');
  if ((heroHoursBack(value, offer) ?? 0) <= 0) out.push('the hero hours must be worth saying');
  return out;
}
