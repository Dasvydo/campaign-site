import type { Content } from '../types';

/**
 * The pricing tiers, in English. This is the master copy.
 *
 * The brief asks two things here, in one sentence: pricing tiers immediately
 * after the hero, the way doviloop.dev has them, and the free fortnight made
 * painfully obvious. (Relayed from an adviser rather than asked for by the
 * founder directly - src/lib/pricing.ts carries the provenance.) So the free
 * days are the section's own
 * headline, set in the largest type on the page, and they are said again on
 * every card. The repetition is the brief, not an oversight.
 *
 * No figures. Not one. The rates, the seat bands, the length of the trial and
 * the currency are all in src/lib/pricing.ts. Where a number belongs in a
 * sentence the sentence splits around it, and where it belongs in a spec row
 * the label is here and the count is printed after it.
 *
 * What is NOT here: the timeline, the terms, what the trial includes and the
 * note under the button. All four are in ./trial.ts, already written in three
 * languages, and this section renders them from there.
 *
 * No em dashes.
 */
export const tiers: Content['tiers'] = {
  eyebrow: 'What it costs',

  headline: { before: 'Free for the first', after: 'days' },
  lede: 'On every tier below. You start it yourself, and the first invoice comes only if you keep it.',

  freeBadge: { before: 'Free for ', after: ' days' },

  pickLead: 'Pick by counting the people who answer mail.',
  rows: [
    {
      id: 'individual',
      name: 'Individual',
      line: 'One person, answering their own mail.',
      seatsLabel: 'Seats',
    },
    {
      id: 'team',
      name: 'Team',
      line: 'A team, on one knowledge base.',
      seatsLabel: 'Seats, up to',
    },
    {
      id: 'managed',
      name: 'Managed',
      line: 'A larger firm, with the running of it left to us.',
      seatsLabel: 'Seats, from',
    },
  ],
  per: 'per seat, per month',
};
