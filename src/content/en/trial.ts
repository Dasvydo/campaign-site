import type { Content } from '../types';

/**
 * The free trial, in English. This is the master copy.
 *
 * It is the argument the price band used to make, rewritten for a funnel with
 * no sales call in it. The timeline said nobody is charged until they say yes,
 * which is the one thing a trial has to say, so the sentences are kept and the
 * two calls are taken out of them: the reader starts it themselves, uses it,
 * and is invoiced only if they keep it.
 *
 * No figures. No em dashes. Where a number belongs, the sentence splits around
 * it.
 */
export const trial: Content['trial'] = {
  whenTitle: 'What happens, and when',

  stops: [
    {
      figure: 'start',
      day: { before: 'Day ', after: ' of the trial' },
      note: 'You set it up yourself. Then drafts start.',
      state: 'Nothing invoiced yet',
      say: {
        before:
          'The day you start. You set it up yourself, and the drafts begin. Nothing is invoiced. The monthly fee reads ',
        after: '.',
      },
    },
    {
      figure: 'end',
      day: { before: 'Day ', after: ' of the trial' },
      note: 'The trial ends. Keep it and the first month is invoiced.',
      state: 'Invoiced if you keep it',
      say: {
        before:
          'The day the trial ends. The first month is invoiced only if you keep it. The monthly total is ',
        after: '.',
      },
    },
    {
      figure: 'none',
      day: { before: 'Stop', after: ' sooner' },
      note: 'Any time up to that day.',
      state: 'Nothing invoiced at all',
      say: { before: 'Stop sooner, and the monthly total is struck out and reads ', after: '.' },
    },
  ],

  termsLabel: 'Show the terms',
  terms: [
    { t: 'The setup is included.', n: 'It is not billed afterwards.' },
    { t: 'No card, and nothing taken.', n: 'Payment details come later, and only if you keep it.' },
    { t: 'Stop and you pay nothing.', n: 'Nothing is invoiced, and there is nothing to cancel.' },
    { t: 'The fee is month to month.', n: 'No year to sign, and no notice period.' },
  ],

  included: {
    title: 'What the trial includes',
    items: [
      'Your website read into a knowledge base, and a place to add whatever it misses.',
      'Your documents indexed, so a draft can quote the fee, the deadline and the rule.',
      'A voice profile for each person, so a draft reads like the one who sends it.',
      'A question back to you when the answer is not on file, rather than a guess.',
      'Drafts land in Outlook. Nothing sends itself.',
      'Hosted in the EU.',
    ],
  },

  ctaNote: 'Nothing is invoiced unless you keep it.',
};
