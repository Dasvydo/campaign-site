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
    opening: 'It is 08:40 and forty messages are waiting.',
    subOpening:
      'Every one of them needs a careful reply. Most of them sound a lot like the last forty. Someone in your office is about to spend the morning writing them out again.',
    claim:
      'DoviLoop writes the first draft of each one. Your team reads it, changes what they want, and sends it. Nothing leaves the office that a person has not approved.',
    cta: 'Book a call',
    ctaNote: 'Teams of 10 or more. Twenty minutes, and we tell you on the call if it is not a fit.',
    exampleCaption: 'An example of the same message and the draft it produced.',
    message: {
      from: 'Hanne Jensen, flat 214',
      subject: 'Deposit statement, still nothing',
      body: 'I moved out on the 30th of last month and I still have not had the statement. The keys went back on time and the flat was clean. When am I getting my deposit and how much of it is left?',
    },
    draftReady: 'Draft ready',
    draft: {
      greeting: 'Dear Ms Jensen,',
      body: 'Thank you for chasing this, and sorry you have had to. Your statement is due within three weeks of handover, which puts it with you by the 21st. I can see the flat was handed back on the 30th with the keys returned on the day. The two deductions raised so far are the end of tenancy clean at 850 and the touch up to the hallway wall at 400. That leaves 4,750 of your deposit to be paid back to the account we hold.',
      signoff: 'I will send the full statement as soon as the final reading is in.',
    },
    afterLine: 'You read it. You send it. It took eleven seconds instead of nine minutes.',
  },

  how: {
    title: 'How it actually works',
    lead: 'Three things happen between the message arriving and the draft appearing. None of them need anyone technical.',
    steps: [
      {
        n: '01',
        title: 'It reads the message',
        body: 'Who sent it, what they are asking for, and what they were told the last time they wrote in. The same read a good colleague does before they start typing.',
      },
      {
        n: '02',
        title: 'It pulls what your firm actually knows',
        body: 'Your deposit rules. Your fee schedule. The wording your senior partner signed off in March. It answers from your own material and your own past replies, not from something it found on the internet.',
      },
      {
        n: '03',
        title: 'It writes the reply in your voice',
        body: 'In the tone your firm already uses, with the details filled in. Then it stops and waits for a person. Your team reads the draft, changes what they want, and presses send.',
      },
    ],
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
    title: 'What it is worth',
    lead: 'Three figures, and the sum behind each one.',
    rows: [
      {
        figure: 'about 9x',
        label: 'return on the seat cost',
        basis: 'The time we assume a seat saves, costed against what that seat costs you per month.',
      },
      {
        figure: 'about 400 EUR',
        label: 'saved per month, per seat',
        basis: 'The hours we assume stop going into rewriting repeat replies, costed at a mid level salary.',
      },
      {
        figure: 'about 40 days',
        label: 'to pay back the setup fee',
        basis: 'Counting the 500 dollar setup fee and the first month of seats.',
      },
    ],
    caveat:
      'These are a model, not a measurement. We assume how much time repeat replies take, cost it at a mid level salary, and do the arithmetic. They have not yet been checked against a real customer. Your number depends on how much of your mail is repeat work. We will do the sum with your own figures on the call, and if it does not clear we will say so.',
  },

  who: {
    title: 'Who this is for',
    lead: 'Three kinds of office, all with the same problem: a lot of mail, and every reply has to be right.',
    groups: [
      {
        title: 'Accounting firms',
        body: 'The same client questions, in every one of the four weeks before a filing deadline. Fee queries, missing documents, what happens if we are late.',
      },
      {
        title: 'Insurance brokers',
        body: 'Claims correspondence where the answer is usually already in the policy, and the delay is in someone writing it out clearly.',
      },
      {
        title: 'Administrative firms',
        body: 'Housing associations, student accommodation, property and facility admin. Tenant mail, deposits, maintenance requests, in volume, all year.',
      },
    ],
    seatMinimum:
      'This offer starts at 10 seats. Below that, the plan on doviloop.dev does the same drafting and costs a great deal less.',
    noTech:
      'You do not need a developer, and you do not need to change your email. If your team is in Outlook, the setup is our job.',
  },

  objections: {
    title: 'Five things people ask before they book',
    lead: 'The answers we would give you on the call anyway.',
    items: [
      {
        q: 'It will sound like a robot.',
        a: 'It sounds like whoever wrote your last few hundred replies, because that is what it works from. And a person reads every draft before it goes. When one sounds wrong you fix it, and the next one is closer. Two weeks in, most teams stop editing the routine ones at all.',
      },
      {
        q: 'Our data is confidential.',
        a: 'Your material stays yours. It is used to answer your mail and nothing else. It is not used to train a shared model, it is not visible to any other customer, and it is stored in the EU. You get the data processing agreement before the pilot starts, not after.',
      },
      {
        q: 'My team will not adopt it.',
        a: 'That is the usual reason tools like this fail, which is what the setup fee is for. We run a workshop with your team using their own real mail, and we stay until they can run it without us. Getting your team to use it is our job in week one, not yours.',
      },
      {
        q: 'We already have Copilot.',
        a: 'Copilot writes well and it does not know your firm. Ask it for your deposit terms or your fee schedule and it will produce something polite and wrong. This answers from your documents and your own past replies. Several teams run both, Copilot for general writing and this for the mail that has to be correct.',
      },
      {
        q: 'What happens when it gets one wrong.',
        a: 'Nothing sends by itself. A wrong draft is a draft you delete, and it cost you the ten seconds you would have spent staring at a blank reply. There is no route where a bad answer reaches your client without one of your people reading it and pressing send.',
      },
    ],
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
      legalName: '',
      registrationNumber: '',
      address: '',
    },
  },
};
