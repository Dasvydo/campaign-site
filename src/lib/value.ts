/**
 * What a customer keeps, as a single source of truth.
 *
 * What this file was: every buyer-side number on the page, and the arithmetic
 * the calculator ran on them. Inbound volume, the share of mail that gets a
 * draft, the hourly cost of a person's time, the hours back, the worth, the
 * fee subtracted from it, and the break-even against a whole-firm flat fee.
 *
 * The calculator is gone, and with it every figure it subtracted a fee from:
 * the page sells a per-seat trial now, and a saving computed against a fee
 * nobody is quoted is arithmetic with one side missing. None of the helpers
 * survive, and neither do the constants only they read.
 *
 * ONE CONSTANT SURVIVES, because one thing outside the calculator reads it.
 * The worked example's closing line in src/components/Demo.tsx says how long a
 * reply takes to write from nothing, and it reads that figure from here rather
 * than from its own copy. That was the whole point of this file: a number
 * typed into a sentence is a number nobody is checking. It is still true of
 * that sentence, so the constant stays where the sentence reads it.
 *
 * The constant carries where it came from. `measured` means somebody read it
 * off the live system on the date beside it; `assumed` means it is the best
 * guess of a person who has not measured it. Nothing here is a price.
 */

export type Basis = 'measured' | 'assumed';

export interface Constant {
  readonly value: number;
  readonly basis: Basis;
  /** The date a measured figure was read. Absent on an assumption. */
  readonly readAt?: string;
}

export interface Value {
  /** Minutes to write one reply from nothing. The worked example's close says
      what nobody spent. Never timed. */
  readonly minutesFromScratch: Constant;
}

function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === 'object') {
    Object.freeze(obj);
    for (const v of Object.values(obj as object)) deepFreeze(v);
  }
  return obj;
}

/* Six, not five, since 2026-09-22. Founder's call. Six minutes to write a
   substantive reply from nothing is a defensible assumption: the worked
   example's letter quotes a deposit rule, a deadline and a logged deduction.

   It was one half of a pair, and the minutes a person saved on a draft were
   the difference between the two rather than a figure anybody could type. The
   other half belonged to the calculator and went with it. This one is still
   `basis: 'assumed'` and the worked example still says so in words. */
const MINUTES_FROM_SCRATCH = 6;

export const VALUE: Value = deepFreeze({
  minutesFromScratch: { value: MINUTES_FROM_SCRATCH, basis: 'assumed' },
} as Value);
