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
  /** Minutes a person saves on one draft, against writing it from nothing.
      Five to write it, one to read and send a prepared one. Never timed. */
  readonly minutesPerDraft: Constant;
  /** Inbound emails each person receives a month. An illustrative range, not
      a measurement; the visitor supplies their own. */
  readonly inbound: Range;
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

export const VALUE: Value = deepFreeze({
  draftRate: { value: 0.152, basis: 'measured', readAt: '2026-09-17' },
  minutesPerDraft: { value: 4, basis: 'assumed' },
  inbound: { min: 50, max: 1000, step: 50, start: 300 },
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

/** Hours a month the firm gets back, at the minutes the visitor allows. */
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

/** The measured draft rate as a percentage, for the one place the page prints
    it. Rounded to one decimal, which is how it was read. */
export function draftRatePercent(value: Value = VALUE): number {
  return Math.round(value.draftRate.value * 1000) / 10;
}

/** The measured share the other way up: one email in how many gets a draft.
    A count, rounded, for the sentence that says what the product leaves
    alone. */
export function oneEmailIn(value: Value = VALUE): number {
  return Math.round(1 / value.draftRate.value);
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
  if (!within(value.inbound.start, value.inbound)) {
    out.push('the inbound control must open inside its own range');
  }
  if (!within(value.heroInbound, value.inbound)) {
    out.push('the hero volume must be one the inbound control can offer');
  }
  for (const [k, v] of Object.entries(value.hourlyStart)) {
    if (!within(v, value.hourly)) out.push(`hourlyStart.${k} is outside the hourly range`);
  }
  if (!('en' in value.hourlyStart)) out.push('hourlyStart needs an English default');
  for (const r of [value.inbound, value.hourly, value.minutes]) {
    if (!(r.min < r.max) || !(r.step > 0)) out.push('every range needs min < max and a positive step');
  }
  if (heroBreakEvenHourly(value, offer) === null) out.push('the hero figure does not compute');
  return out;
}
