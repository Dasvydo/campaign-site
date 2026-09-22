import type { Content } from '../types';

export const price: Content['price'] = {
  eyebrow: 'One fee for the whole firm',
  title: 'What it costs',


  feesTitle: 'The fees',
  fees: [
    {
      term: 'The firm',
      per: 'per month',
      note: 'One fee for everyone who writes mail. It does not move when you hire.',
    },
    {
      term: 'Setup',
      per: 'once',
      note: 'One call, on your firm’s own real mail. We read your site and your documents; you tell us what you get asked.',
      waived: {
        label: 'Waived',
        say: { before: 'The setup fee of ', after: ' is waived while the founding places are open.' },
      },
    },
  ],

  packages: {
    title: 'The two packages',
    pick: 'Pick by counting your people.',
    rows: [
      { id: 'desk', name: 'Desk', note: 'The smallest firm we sell to.' },
      { id: 'firm', name: 'Firm', note: 'One fee, however many you hire.' },
    ],
    feeLabel: 'Per month, whole firm',
    peopleLabel: 'People covered, up to',
    draftsLabel: 'Drafts a month, pooled',
    note: 'Neither number is per person. The drafts are shared, and nobody has their own allowance to run out of.',
    under: { before: 'Smaller than that? ', link: 'doviloop.dev', after: ' does the same for much less.' },
    over: 'Bigger than that? Ask, and we will price it properly.',
  },

  included: {
    title: 'In both packages',
    items: [
      'Your website read into a knowledge base, and one call with whoever knows what your firm gets asked, to fill what it misses.',
      'Your documents indexed, so a draft can quote the fee, the deadline and the rule.',
      'A voice profile for each person, so a draft reads like the one who sends it.',
      'A question back to you when the answer is not on file, rather than a guess.',
      'Drafts land in Outlook. Nothing sends itself.',
      'Hosted in the EU.',
    ],
  },

  covers: {
    title: 'What the fee covers',
    people: {
      label: 'People covered, up to:',
      note: 'Names go on and come off as the team changes.',
    },
    drafts: {
      label: 'Drafts a month, pooled across the firm:',
      note: 'Shared across everyone. Nobody has their own allowance to run out of.',
    },
    note: 'Past either of those we will say so and work it out with you, before anything is billed.',
  },

  founding: {
    title: 'A trade, not a discount',
    noProofYet: 'No customers yet.',
    reason: { before: 'Priced low for ', after: ' firms who will vouch.' },
    lock: 'Yours never rises.',
    spots: { label: 'Places still open:', of: ' of ' },
    spotsClosed: 'The places that came with a trade are taken. The monthly fee below does not change; the setup fee is now charged in full.',
    givesTitle: 'What you give:',
    gives: [
      'a testimonial in your own words',
      'a case study at sixty days, with figures you choose',
      'your logo on the product site',
      'two feedback calls in the first two months',
    ],
    note: 'If you would rather not be named, pay the setup fee and nothing else about the product changes.',
    signature: {
      name: 'Dovydas',
      line: 'I built this, and I run the setup calls myself.',
    },
  },

  termsLabel: 'Show the terms',
  terms: [
    { t: 'The setup call and the setup are included.', n: 'Neither is billed afterwards.' },
    { t: 'No card, and nothing taken.', n: 'Payment details come later, after you have said yes.' },
    { t: 'Say no and you pay nothing.', n: 'Nothing is invoiced, and there is nothing to cancel.' },
    { t: 'The fee is month to month.', n: 'No year to sign, and no head count to keep up.' },
  ],

  whenTitle: 'What happens, and when',
  stops: [
    {
      day: 'Day 0',
      note: 'One call with whoever knows the answers. Then drafts start.',
      state: 'Nothing invoiced yet',
      say: {
        before: 'Day 0. One setup call, then the drafts start. Nothing is invoiced. The monthly fee reads ',
        after: '.',
      },
    },
    {
      day: 'Day 14',
      note: 'A review call. Say yes and the first month is invoiced.',
      state: 'Invoiced after a yes',
      say: {
        before: 'Day 14. There is a review call, and the first month is invoiced only if you say yes. The monthly total is ',
        after: '.',
      },
    },
    {
      day: 'Say no',
      note: 'Any time up to that call.',
      state: 'Nothing invoiced at all',
      say: { before: 'Say no, and the monthly total is struck out and reads ', after: '.' },
    },
  ],
  total: { zero: '0 EUR' },

  ctaNote: 'Nothing is invoiced until you say yes at the review call.',
};
