import type { Content } from './types';

/**
 * English. This is the master copy. Danish and Lithuanian are written from it
 * as native copy, not translated line by line.
 *
 * No em dashes. No invented customers. Figures carry their basis.
 */
export const en: Content = {
  htmlLang: 'en',
  nativeCheck: '',

  meta: {
    title: 'DoviLoop for teams. Email drafting for firms that live in Outlook.',
    description:
      'Your team answers the same kinds of message all day. DoviLoop reads each one, pulls what your firm actually knows, and writes the reply in your voice. Your team reads it and sends it. For teams of 10 or more.',
  },

  nav: {
    skipToContent: 'Skip to the main content',
    localeLabel: 'Language',
    localeNames: { en: 'English', da: 'Dansk', lt: 'Lietuvių' },
    cta: 'Book a call',
  },

  hero: {
    clockIn: '08:40',
    clockOut: '08:41',

    skip: 'Skip to content',
    dateline: 'Teams edition. Ten seats and up.',
    nav: { example: 'Example', price: 'What it costs', fit: 'Fit' },
    tab: 'Check if we are a fit',

    title: { before: 'Written from ', mark: 'your files', after: '. Sent by your people.' },
    deck: { before: 'It is ', after: '. Forty messages are waiting. Every one already has a draft.' },

    cta: 'Check if we are a fit',
    ctaNote: 'From 890 USD a month. First two weeks free.',

    pileAlt: 'A pile of forty letters waiting on a desk.',
    deal: {
      exampleLabel: 'Example message',
      from: 'From a resident in flat 214',
      subjectLabel: 'Subject',
      subject: 'Deposit statement, still nothing',
      sr: 'Read this one in the worked example.',
    },

    bar: {
      text: 'From 890 USD a month for ten seats, plus 500 USD setup once. First two weeks free.',
      cta: 'Check the fit',
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
  },

  demo: {
    title: 'Watch it work',
    lead: 'Two minutes, real mail, no slides.',
    placeholderTitle: 'Demo video',
    placeholderBody:
      'The recording sits here. If you are reading this before it is uploaded, ask for it on the call and we will walk you through the same thing live.',
    playLabel: 'Play the demo',
    caption: 'Recorded against a real inbox. Names and figures changed.',
  },

  numbers: {
    eyebrow: 'Our own arithmetic',
    title: 'What it is worth',
    about: 'about\u00a0',
    rows: [
      { amount: '5', unit: 'x', label: 'return on the seat cost' },
      { amount: '400', unit: '\u00a0EUR', label: 'saved per month, per seat' },
      { amount: '40', unit: '\u00a0days', label: 'to pay back setup and the first month' },
    ],
    lede: { before: 'These are a model, ', mark: 'not a measurement', after: '.' },
    moreLabel: 'Show the arithmetic',
    basis: [
      { term: 'about 5x', def: 'Assumed time saved, against the seat cost.' },
      { term: 'about 400 EUR', def: 'Assumed hours saved, at a mid level salary.' },
      {
        term: 'about 40 days',
        def: 'The 500 USD setup fee and the first month of seats, against the saving above.',
      },
    ],
    notes: [
      'Never yet checked against a real customer. Your number depends on how much of your mail is repeat work.',
      'We will do the sum on your figures on the call, and say so if it does not clear.',
    ],
  },

  who: {
    eyebrow: 'Filed under',
    title: 'Who this is for',
    groups: [
      { tab: 'Accounting firms', line: 'Fee queries and missing documents, every filing deadline.' },
      { tab: 'Insurance brokers', line: 'The answer is usually already in the policy.' },
      { tab: 'Administrative firms', line: 'Tenant mail, deposits and maintenance. All year.' },
    ],
    notes: {
      seats: {
        before: 'This offer starts at ',
        mark: '10 seats',
        mid: '. Below that, the plan on ',
        link: 'doviloop.dev',
        after: ' does the same drafting and costs a great deal less.',
      },
      setup: {
        before: 'No developer, no change of email. If you are in Outlook, ',
        mark: 'setup is our job',
        after: '.',
      },
    },
  },

  price: {
    title: 'What it costs',
    perSeat: '89 USD',
    perSeatNote: 'per seat, per month',
    setup: '500 USD',
    setupNote: 'setup, once. Workshop and onboarding included.',
    lines: [
      'The first two weeks are free, in full. That includes the workshop and the setup.',
      'Your card goes on at the start and is charged on day 14, once the pilot is done. Not before.',
      'Stop inside the two weeks and you are not charged anything at all.',
      'Minimum 10 seats. Add or remove seats month to month.',
    ],
    cta: 'Check if we are a fit',
  },

  form: {
    title: 'Six questions. Under a minute.',
    lead: 'This is how we work out whether a call is worth your time. If it is not, this page will say so instead of booking you in.',
    companyLabel: 'Company name',
    companyPlaceholder: 'The name on your invoices',
    emailLabel: 'Work email',
    emailPlaceholder: 'you@yourfirm.com',
    emailHint: 'Only used to send the call details and the pilot agreement.',
    emailFreeWarning:
      'That looks like a personal address. It will still work, but a work address helps us find your firm before we speak.',
    phoneLabel: 'Phone',
    phonePlaceholder: 'Including country code',
    teamSizeLabel: 'How many people handle email daily?',
    teamSizeOptions: [
      { value: '1-9', label: '1 to 9 people' },
      { value: '10-24', label: '10 to 24 people' },
      { value: '25-49', label: '25 to 49 people' },
      { value: '50+', label: '50 or more' },
    ],
    emailClientLabel: 'What does the team use?',
    emailClientOptions: [
      { value: 'outlook', label: 'Outlook' },
      { value: 'gmail', label: 'Gmail' },
      { value: 'other', label: 'Something else' },
    ],
    roleLabel: 'Your role',
    roleOptions: [
      { value: 'owner_partner', label: 'Owner or partner' },
      { value: 'ops_office_manager', label: 'Operations or office manager' },
      { value: 'it_admin', label: 'IT or admin' },
      { value: 'other', label: 'Something else' },
    ],
    choosePrompt: 'Choose one',
    submit: 'Check if we are a fit',
    submitting: 'One moment',
    required: 'This one is needed.',
    invalidEmail: 'That address does not look complete.',
    invalidPhone: 'Please add a number we can reach you on.',
    privacyNote:
      'We use these answers to prepare for the call and for nothing else. No list, no resale.',
  },

  results: {
    qualified: {
      title: 'Good fit. Let us book the call.',
      body: 'Twenty minutes, and you pick the time. No deck, no proposal to sign afterwards.',
      coversTitle: 'What we cover',
      covers: [
        'What your team actually answers all day, in their own words.',
        'Whether your existing material is in a shape we can work from.',
        'What the two week pilot would look like on your calendar.',
        'The price again, plainly, and the sum on your own numbers.',
      ],
      bookingCta: 'Pick a time',
      bookingFallback: 'Email us to book',
    },
    gmailNote:
      'You told us the team is not on Outlook. That is fine. Gmail and other clients are set up per team during onboarding, and we will go through what that takes on the call.',
    tooSmall: {
      title: 'This one starts at 10 seats.',
      body: 'You are under that today, so a call would spend twenty minutes of your time to reach the same answer. The plan on doviloop.dev does the same drafting for smaller teams and costs a great deal less. Come back to us when the team grows and we will pick this up.',
      pricingCta: 'See the plan for smaller teams',
      nurtureTitle: 'Want the short version by email instead?',
      nurtureBody:
        'Three notes over two weeks on how small offices cut repeat mail. No calls, and you can stop after the first one.',
      nurtureCta: 'Send me the three emails',
      nurtureSubject: 'Send me the three emails',
      nurtureMailBody:
        'Please send me the three short notes on cutting repeat mail. I am under 10 seats for now.',
    },
    deliveryWarning:
      'Our system did not confirm your answers, so we have kept them on this device and will send them again automatically. Nothing is lost. Book the call below either way.',
    startOver: 'Change an answer',
  },

  footer: {
    tagline: 'Email drafting for teams who live in their inbox.',
    productLink: 'The product site',
    privacyLink: 'Privacy',
    contactLink: 'Contact us',
    company: {
      legalName: 'DoviLoop OU',
      registrationNumber: '17355061',
      address: 'Sepapaja 6, 15551 Tallinn, Estonia',
    },
  },
};
