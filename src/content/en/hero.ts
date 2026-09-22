import type { Content } from '../types';

export const hero: Content['hero'] = {
  clockIn: '08:40',
  clockOut: '08:41',

  skip: 'Skip to content',
  nav: { example: 'Example', price: 'What it costs', fit: 'Fit' },

  title: {
    before: 'Forty emails in. The ones your files answer, ',
    mark: 'drafted',
    mid: '. By ',
    after: '.',
  },

  pileAlt: 'A pile of forty letters waiting on a desk.',
  deal: {
    draftLabel: 'Draft reply, ready',
    to: 'To the resident in flat 214',
    subjectLabel: 'Subject',
    subject: 'Deposit statement, still nothing',
    preview: 'Thank you for chasing this, and sorry you have had to.',
    sr: 'Read the whole draft in the worked example.',
  },

  setup: 'It runs on our servers, or we install it on yours.',

  bar: {
    /* It said "Five questions", which is the true count of the fields, while
       the form's own heading says "Three questions. Under a minute." Both
       were defensible and the page was still telling a reader two different
       numbers about the same form. The bar stops counting; the heading
       keeps the count. */
    text: 'Under a minute, no card.',
  },

  message: {
    from: 'Hanne Jensen, flat 214',
    subject: 'Deposit statement, still nothing',
    body: 'I moved out on the 30th of last month and I still have not had the statement. The keys went back on time and the flat was clean. When am I getting my deposit and how much of it is left?',
  },
  draft: {
    greeting: 'Dear Ms Jensen,',
    body: 'Thank you for chasing this, and sorry you have had to. Your statement is due within three weeks of handover, which puts it with you by the 21st. The two deductions raised so far are the end of tenancy clean at 850 EUR and the touch up to the hallway wall at 400 EUR. That leaves 4,750 EUR of your deposit to be paid back to the account we hold.',
    signoff: 'I will send the full statement as soon as the final reading is in.',
  },
};
