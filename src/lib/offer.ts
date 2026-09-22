/**
 * Printing a figure, as a single source of truth.
 *
 * What this file was: every price the campaign page said out loud, plus the
 * arithmetic that argued from them. One flat monthly fee for the whole firm
 * in two packages, a founding cohort that traded a testimonial for the setup
 * fee, the published per seat rates on doviloop.dev converted through a fixed
 * FX rate, and the comparison helpers that said where the flat fee fell below
 * each of those rates.
 *
 * All of that is gone with the sales call it was written for. The page sells a
 * self-serve trial now, and the tiers and the figures behind it belong to
 * whatever builds that, not to a model nobody is being quoted any more. A
 * whole-firm fee left sitting here would be a second, older answer to the
 * question the new pricing section exists to answer, and the first edit to
 * either would put the page into disagreement with itself.
 *
 * What survives is the part that was never about the offer at all: printing a
 * figure in the language it will be read in. English writes the decimal with a
 * full stop and groups thousands with a comma; Danish does exactly the
 * reverse; Lithuanian writes the decimal with a comma and groups with a space.
 * The same characters say nineteen and a half to one reader and nineteen
 * hundred and fifty to the next, and a figure on a page published in three
 * languages is the last thing that may be ambiguous.
 *
 * `formatCount` has a live caller today: the worked example's closing line, in
 * src/components/Demo.tsx. `formatMoney` and `amount` have none, and are kept
 * rather than deleted because the money they print is coming back with the
 * pricing tiers, and re-deriving this locale plumbing from scratch is how two
 * different roundings get shipped.
 */

export function amount(value: number): string {
  const cents = toCents(value);
  return Number.isInteger(cents) ? String(cents) : cents.toFixed(2);
}

/**
 * The rounding every printed figure shares.
 *
 * Pulled out of `amount` so that the localised formatters below round a
 * figure the same way it has always been rounded, rather than each holding
 * its own opinion about cents and drifting apart the first time one of them
 * is touched. `amount` itself is deliberately left as it was in every other
 * respect: it groups nothing and carries no symbol.
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
 * codes, written out here rather than imported because this file is the thing
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
 * falls back to the ungrouped shape `amount` prints, which is wrong in two
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
 * Rounds exactly as `amount` does, and keeps the distinction that rounding
 * carries: a value that lands on a whole unit prints with no decimal part at
 * all, while a value with cents keeps both of them. That is not a detail. A
 * price that suddenly grew a decimal part in every language would be a
 * visible change to what is being charged that nobody asked for, and a per
 * head figure is exactly the kind that needs its cents.
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
 * For the figures that count rather than cost: the minutes in the worked
 * example's close today, and whatever a tier counts tomorrow. Never a decimal
 * part, because a fraction of a draft is not a thing anyone is owed, and
 * rounded rather than truncated so that a caller handing over an average gets
 * the nearest whole one instead of the floor. Small counts come back as bare
 * digits, since the locale groups only what it considers large enough to need
 * it.
 */
export function formatCount(value: number, locale?: string | null): string {
  return grouped(Math.round(value), locale, 0);
}
