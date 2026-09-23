import type { Content } from '../types';

export const hero: Content['hero'] = {
  clockIn: '08:40',
  clockOut: '08:41',

  skip: 'Skip to content',
  nav: { label: 'Page sections', example: 'Example', price: 'What it costs', who: 'Who it is for' },

  /* The pen falls on the clause the page's own worked example calls the moat,
     not on the verb. "Drafted" is what every tool in this category does and
     says; "the ones your files answer" is the thing the demo then proves, and
     its payoff line is that what any other tool writes, it writes with none of
     your files. The four halves are re-cut around the phrase and nothing else:
     concatenated with clockOut between mid and after they spell exactly the
     sentence they spelled before, which is what the page harness asserts. */
  title: {
    before: 'Forty emails in. ',
    mark: 'The ones your files answer',
    mid: ', drafted. By ',
    after: '.',
  },

  pileAlt: 'A pile of forty letters waiting on a desk.',
  deal: {
    draftLabel: 'Draft reply, ready',
    to: 'To the resident in flat 214',
    subjectLabel: 'Subject',
    subject: 'Deposit statement, still nothing',
    preview: 'Thank you for chasing this, and sorry you have had to.',
    cue: 'See how it was written',
  },

  /* THE SUB-HEADLINE, under the h1 and above the button.

     This slot used to carry where the thing is installed: "It runs on our
     servers, or we install it on yours." Two things had gone wrong with that.
     It was the smallest type in the hero answering a question nobody has asked
     on the first screen, with an unattached "It" for a subject. And it had
     started contradicting the page: trial.terms now opens with "Nothing to
     install. It runs on the mail you already have", which is the checked claim
     (an OAuth consent against a Microsoft app registration, no add-in and no
     manifest anywhere in the product), and it sits one section below this one.

     So the slot carries the sentence the page was telling everybody except the
     visitor. The literal definition was in meta.title for crawlers, in the
     <noscript> block for readers with scripting off, and in the footer tagline
     at the bottom of the scroll. A paying ad click got the headline and no
     definition at all. Every clause here is already true copy elsewhere on this
     page; none of it is a new claim, and none of it is a figure. */
  setup:
    'DoviLoop drafts replies inside Outlook, out of the files your firm already has, in your own voice. Your team reads each one and presses send.',

  bar: {
    /* It said "Five questions", which is the true count of the fields, while
       the form's own heading says "Three questions. Under a minute." Both
       were defensible and the page was still telling a reader two different
       numbers about the same form. The bar stops counting; the heading
       keeps the count. */
    text: 'You set it up yourself, in the mail you already have.',
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
