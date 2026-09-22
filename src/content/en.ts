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
    cardAlt:
      'The line the page opens with: forty emails in, the ones your files answer, drafted by 08:41.',
  },

  nav: {
    skipToContent: 'Skip to the main content',
    localeLabel: 'Language',
    localeNames: { en: 'English', da: 'Dansk', lt: 'Lietuvių' },
    cta: 'Check if we are a fit',
  },

  hero: {
    clockIn: '08:40',
    clockOut: '08:41',

    skip: 'Skip to content',
    nav: { example: 'Example', price: 'What it costs', fit: 'Fit' },

    title: {
      problem: '40 emails in.',
      before: '40 drafts ',
      mark: 'ready',
      after: '.',
    },
    lede: 'Written from your own files, so you send them instead of fixing them.',

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
  },

  demo: {
    eyebrow: 'Worked example',
    title: 'One of the forty',
    lede: 'The draft is written from what the office already has on file.',
    noJs: 'Needs JavaScript. The message, draft and gate read the same either way.',
    fromLabel: 'From',
    subjectLabel: 'Subject',
    pickLead: 'Pick the desk nearest yours.',
    beatIn: 'What came in, 08:40',
    beatKnows: 'What your own files say',
    beatWrote: 'What it wrote back',
    beatNote: 'Switch one off and watch the draft lose it.',
    gateNote: 'There is no automatic send anywhere in this product. Someone reads it, changes what they want, and sends it themselves.',
    sendLabel: 'Send',
    editLabel: 'Edit',
    doneLabel: 'Done',
    sentStamp: 'Sent',
    draftStamp: 'Draft',
    sentChip: 'Sent by you, 08:41',
    dealLabel: 'Next letter',
    payoff: 'Nothing left this office until you pressed send. There is no other way out.',
    editNote: 'You changed it before it went out. That is what the first week looks like.',
    reLabel: 'Re',
    close: {
      before: 'You read it. You send it. ',
      mark: 'Nobody sat down and spent ',
      markEnd: ' minutes',
      after: ' writing it out.',
    },
    say: {
      allOff: 'Nothing left on. The draft is four generic lines.',
      restore: 'All five back on. The draft is whole again.',
      deal: 'A new letter on the desk. The draft is back to where it started.',
      sent: 'Sent. The draft left only because you pressed send.',
      edit: 'The draft is editable. Press Done, or Escape, when you have finished.',
      done: 'Editing finished. Your changes are kept.',
      source: 'Source: ',
      desk: ' desk. A different message, the same five sources.',
    },
    restoreLabel: 'Put it all back',
    allOffNote: 'This is what any other tool writes, with none of your files.',
    desks: [
      {
        id: 'property',
        tab: 'Property',
        deskName: 'Property',
        letter: {
          from: 'Hanne Jensen, flat 214',
          subject: 'Deposit statement, still nothing',
          body: 'I moved out on the 30th of last month and I still have not had the statement. The keys went back on time and the flat was clean. When am I getting my deposit and how much of it is left?',
        },
        sources: [
          {
            key: 'rules',
            label: 'the deposit rules',
            count: '1 line',
            name: 'the deposit rules',
            off: 'Deposit rules off. The draft stops naming the three week rule.',
            on: 'Deposit rules on. The three week rule is back in the draft.',
          },
          {
            key: 'deadline',
            label: 'the three week deadline',
            count: '1 line',
            name: 'the three week deadline',
            off: 'Deadline off. The date drops out of the draft.',
            on: 'Deadline on. The 21st is back in the draft.',
          },
          {
            key: 'file',
            label: 'the file on that flat',
            count: '2 lines',
            name: 'the file on that flat',
            off: 'File off. The tenant name and the account drop out of the draft.',
            on: 'File on. The tenant name and the account are back in the draft.',
          },
          {
            key: 'deductions',
            label: 'the deductions already logged',
            count: '3 figures',
            name: 'the deductions already logged',
            off: 'Deductions log off. Three figures removed from the draft.',
            on: 'Deductions log on. Three figures are back in the draft.',
          },
          {
            key: 'tone',
            label: 'the way the office writes',
            count: 'the tone',
            name: 'the way the office writes',
            off: 'House tone off. Same facts, stiffer wording.',
            on: 'House tone on. The draft reads in the office voice again.',
          },
        ],
        salutation:
          {
            key: 'file',
            on: { text: 'Dear Ms Jensen,' },
            off: { text: 'Dear tenant,' },
          },
        clauses: [
          {
            key: 'tone',
            on: { text: 'Thank you for chasing this, and sorry you have had to.' },
            off: { text: 'Please be advised that your enquiry has been received.' },
          },
          {
            key: 'rules',
            on: { text: 'Your statement is due within three weeks of handover' },
            tone: { text: 'The statement is due within three weeks of handover' },
            off: { text: 'Your statement is due in line with the usual timescales' },
            sep: ', ',
          },
          {
            key: 'deadline',
            on: { text: 'which puts it with you by ', circle: 'the 21st', tail: '.' },
            tone: { text: 'which places it with you by the 21st.' },
            off: { text: 'but I cannot give you the date without checking.' },
          },
          {
            key: 'deductions',
            on: { text: 'The two deductions raised so far are the end of tenancy clean at 850 EUR and the touch up to the hallway wall at 400 EUR. That leaves 4,750 EUR of your deposit to be paid back to' },
            tone: { text: 'Two deductions have been raised to date: the end of tenancy clean at 850 EUR and the touch up to the hallway wall at 400 EUR. The balance of 4,750 EUR is to be repaid to' },
            off: { text: 'There may be some deductions. I will confirm the amounts once I have checked.' },
          },
          {
            key: 'file',
            dep: 'deductions',
            on: { text: 'the account we hold.' },
            tone: { text: 'the account held on record.' },
            off: { text: 'your account.' },
          },
        ],
      },
      {
        id: 'accounting',
        tab: 'Accounting',
        deskName: 'Accounting',
        letter: {
          from: 'Mark Adeyemi, Harlow Joinery',
          subject: 'VAT return, are we late?',
          body: 'Our bookkeeper left in August and I have no idea where we stand. Has the return for the quarter gone in, and do we owe anything? I would rather hear it straight than get a letter about it.',
        },
        sources: [
          {
            key: 'rules',
            label: 'the filing rules',
            count: '1 line',
            name: 'the filing rules',
            off: 'Filing rules off. The draft stops naming the deadline rule.',
            on: 'Filing rules on. The one month and seven days rule is back in the draft.',
          },
          {
            key: 'deadline',
            label: 'the quarter deadline',
            count: '1 date',
            name: 'the quarter deadline',
            off: 'Deadline off. The date drops out of the draft.',
            on: 'Deadline on. The 7th is back in the draft.',
          },
          {
            key: 'file',
            label: 'the file on that client',
            count: '2 lines',
            name: 'the file on that client',
            off: 'File off. The client name and the direct debit drop out of the draft.',
            on: 'File on. The client name and the direct debit are back in the draft.',
          },
          {
            key: 'deductions',
            label: 'the figures already posted',
            count: '3 figures',
            name: 'the figures already posted',
            off: 'Posted figures off. Three figures removed from the draft.',
            on: 'Posted figures on. Three figures are back in the draft.',
          },
          {
            key: 'tone',
            label: 'the way the office writes',
            count: 'the tone',
            name: 'the way the office writes',
            off: 'House tone off. Same facts, stiffer wording.',
            on: 'House tone on. The draft reads in the office voice again.',
          },
        ],
        salutation:
          {
            key: 'file',
            on: { text: 'Dear Mark,' },
            off: { text: 'Dear client,' },
          },
        clauses: [
          {
            key: 'tone',
            on: { text: 'Thank you for asking straight out, it is easier for both of us.' },
            off: { text: 'Please be advised that your enquiry has been received.' },
          },
          {
            key: 'rules',
            on: { text: 'Your return for the quarter to 31 July is due one calendar month and seven days after the quarter end' },
            tone: { text: 'The return for the quarter to 31 July is due one calendar month and seven days after the quarter end' },
            off: { text: 'Your return is due in line with the usual timescales' },
            sep: ', ',
          },
          {
            key: 'deadline',
            on: { text: 'which puts your filing date at ', circle: 'the 7th', tail: '.' },
            tone: { text: 'which places the filing date at the 7th.' },
            off: { text: 'but I cannot give you the date without checking.' },
          },
          {
            key: 'deductions',
            on: { text: 'Everything is posted to the end of July: 41,280 EUR of sales VAT against 12,940 EUR reclaimed, which leaves 28,340 EUR to pay from' },
            tone: { text: 'All entries are posted to 31 July: sales VAT of 41,280 EUR against 12,940 EUR reclaimed, leaving 28,340 EUR payable from' },
            off: { text: 'There may be something to pay. I will confirm the amount once I have checked.' },
          },
          {
            key: 'file',
            dep: 'deductions',
            on: { text: 'the account we hold, by direct debit.' },
            tone: { text: 'the account held on record, by direct debit.' },
            off: { text: 'your account.' },
          },
        ],
      },
      {
        id: 'insurance',
        tab: 'Insurance',
        deskName: 'Insurance',
        letter: {
          from: 'Greta Poulsen, policy 4471-C',
          subject: 'Water damage, still no answer',
          body: 'The kitchen floor came up on the 2nd and your adjuster came out a week later. Nobody has told me what is covered. Am I paying the excess or are you, and when does any of it actually get paid?',
        },
        sources: [
          {
            key: 'rules',
            label: 'the policy wording',
            count: '1 section',
            name: 'the policy wording',
            off: 'Policy wording off. The draft stops naming the section and the excess.',
            on: 'Policy wording on. Section 4 and the excess are back in the draft.',
          },
          {
            key: 'deadline',
            label: 'the fourteen day standard',
            count: '1 date',
            name: 'the fourteen day standard',
            off: 'Deadline off. The date drops out of the draft.',
            on: 'Deadline on. The 18th is back in the draft.',
          },
          {
            key: 'file',
            label: 'the file on that claim',
            count: '2 lines',
            name: 'the file on that claim',
            off: 'File off. The claimant name and the account drop out of the draft.',
            on: 'File on. The claimant name and the account are back in the draft.',
          },
          {
            key: 'deductions',
            label: 'the amounts already agreed',
            count: '3 figures',
            name: 'the amounts already agreed',
            off: 'Agreed amounts off. Three figures removed from the draft.',
            on: 'Agreed amounts on. Three figures are back in the draft.',
          },
          {
            key: 'tone',
            label: 'the way the office writes',
            count: 'the tone',
            name: 'the way the office writes',
            off: 'House tone off. Same facts, stiffer wording.',
            on: 'House tone on. The draft reads in the office voice again.',
          },
        ],
        salutation:
          {
            key: 'file',
            on: { text: 'Dear Ms Poulsen,' },
            off: { text: 'Dear policyholder,' },
          },
        clauses: [
          {
            key: 'tone',
            on: { text: 'Thank you for chasing this, and sorry you have had to.' },
            off: { text: 'Please be advised that your enquiry has been received.' },
          },
          {
            key: 'rules',
            on: { text: 'Escape of water is covered under section 4 of your policy, with the excess at 350 EUR' },
            tone: { text: 'Escape of water falls under section 4 of the policy, excess 350 EUR' },
            off: { text: 'Water damage is covered in the usual way' },
            sep: ', ',
          },
          {
            key: 'deadline',
            on: { text: 'and we answer on cover within fourteen days of the adjuster’s report, which is ', circle: 'the 18th', tail: '.' },
            tone: { text: 'and cover is confirmed within fourteen days of the adjuster’s report, being the 18th.' },
            off: { text: 'but I cannot give you the date without checking.' },
          },
          {
            key: 'deductions',
            on: { text: 'The adjuster has agreed 6,200 EUR for the floor and 1,150 EUR for the drying, so after the excess 7,000 EUR goes to' },
            tone: { text: 'The adjuster has agreed 6,200 EUR for the floor and 1,150 EUR for drying; net of the excess, 7,000 EUR is payable to' },
            off: { text: 'There may be something to pay out. I will confirm the amounts once I have checked.' },
          },
          {
            key: 'file',
            dep: 'deductions',
            on: { text: 'the account we hold.' },
            tone: { text: 'the account held on record.' },
            off: { text: 'your account.' },
          },
        ],
      },
    ],
  },

  numbers: {
    eyebrow: 'Your own arithmetic',
    title: 'What you keep',
    about: 'about\u00a0',
    inputs: {
      people: { label: 'People who answer mail' },
      drafts: { label: 'Drafts sent a month' },
      hourly: { label: 'What an hour of their time costs' },
      minutes: { label: 'Minutes saved on each draft', note: 'Your estimate. We have not timed this yet.' },
    },
    beats: {
      hours: { label: 'Hours handed back:' },
      worth: { label: 'What those hours cost you today:' },
      fee: { before: 'This costs (', after: '):' },
      keep: { label: 'You keep:' },
    },
    units: { hours: '\u00a0h', perMonth: ' a month', perHour: ' an hour' },
    yearLabel: 'Over a year:',
    under: 'At these figures it does not pay for itself. We would say so on the call rather than sell it to you.',
    moreLabel: 'Show the arithmetic',
    basis: [
      {
        term: 'Drafts a month',
        def: 'Not every email gets one. On a live mailbox, about one in seven did, because it was a question the files could already answer. If you know roughly how much mail comes in, that is how to turn it into a number of drafts.',
      },
      {
        term: 'Minutes saved on each draft',
        def: 'Our guess, not a measurement. Writing a reply from nothing takes about six minutes; reading one that is ready and pressing send takes about one. So five is the gap. Put your own number in if ours is wrong.',
      },
      {
        term: 'What an hour costs',
        def: 'Yours, not ours. What one of your people costs the firm for an hour, wages plus what you pay on top of them. The slider opens on a rough figure for this market; move it to what you actually pay.',
      },
    ],
    note: 'On the call we run this again on your real numbers, and if it does not pay for itself we say so.',
  },

  who: {
    eyebrow: 'Filed under',
    title: 'Who this is for',
    /* Ordered to match the demo's desk tabs, which open on Property because
       the hero's letter is the property one. The two sections used to run in
       different orders one scroll apart. */
    groups: [
      { id: 'property', tab: 'Property managers', line: 'Tenant mail, deposits and maintenance. All year.' },
      { id: 'accounting', tab: 'Accounting firms', line: 'Fee queries and missing documents, every filing deadline.' },
      { id: 'insurance', tab: 'Insurance brokers', line: 'The answer is usually already in the policy.' },
    ],

      sourcesTitle: 'Drafted out of:',

    accuracy: {
      title: 'What happens when it does not know',
      items: [
        'It only drafts the ones it can answer from your files. The rest it leaves alone.',
        'When the answer is not on file, it asks you. It does not fill the gap with something that reads well.',
        'There is no automatic send anywhere in this product. A person reads every draft and sends it themselves.',
        'A draft quotes the fee, the deadline or the rule out of your own documents, in your own wording.',
      ],
    },
  },

  price: {
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
  },

  form: {
    eyebrow: 'What do I do now',
    title: 'Three questions. Under a minute.',
    lead: 'This is how we work out whether a call is worth your time. If it is not, this page will say so instead of booking you in.',
    formNo: 'Fit check',
    optional: 'Optional',
    companyLabel: 'Company name',
    companyPlaceholder: 'The name on your invoices',
    emailLabel: 'Work email',
    emailPlaceholder: 'you@yourfirm.com',
    emailHint: 'Only used to send the call details and the pilot agreement.',
    emailFreeWarning:
      'That looks like a personal address. It will still work, but a work address helps us find your firm before we speak.',
    phoneLabel: 'Phone',
    phoneHint: 'So we can reach you if the email bounces. Used for this call and nothing else.',
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
    otherLabel: 'Tell us which',
    choosePrompt: 'Choose one',
    steps: ['About the team', 'How to reach you'],
    stepsLabel: 'The fit check, in two steps',
    continueCta: 'Continue',
    backCta: 'Back',
    submit: 'Check if we are a fit',
    submitting: 'One moment',
    required: 'This one is needed.',
    invalidEmail: 'That address does not look complete.',
    invalidPhone: 'That does not look like enough digits for a number.',
    privacyNote: 'Used to prepare for the call. No list, no resale.',
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
      sameEmail:
        'One thing: book with the same email you just gave us. That is how the call gets matched to what you told us here.',
    },
    gmailNote:
      'You told us the team is not on Outlook. That is fine. Gmail and other clients are set up per team during onboarding, and we will go through what that takes on the call.',
    tooSmall: {
      title: 'This one starts at ten people.',
      body: 'You are under that today, so a call would spend twenty minutes of your time to reach the same answer. The plan on doviloop.dev does the same drafting for smaller teams and costs a great deal less. Come back to us when the team grows and we will pick this up.',
      pricingCta: 'See the plan for smaller teams',
    },
    deliveryWarning:
      'Our system did not confirm your answers, so we have kept them on this device and will send them again automatically. Nothing is lost. Book the call below either way.',
    startOver: 'Change an answer',
  },

  consent: {
    title: 'Cookies on this page',
    body: 'Visit counting and advertising. Neither runs until you accept.',
    accept: 'Accept',
    decline: 'Decline',
    detailsLabel: 'What each one does',
    items: [
      {
        name: 'Counting visits',
        body: 'PostHog, hosted in the EU. Which sections get read and how far down the page people get. No session recording, no heatmaps.',
      },
      {
        name: 'Advertising',
        body: 'The Meta pixel. Lets us show ads on Facebook and Instagram to people who have been on this page.',
      },
    ],
    note: 'Declining changes nothing about the page, the worked example or the form. You can change your mind in the footer.',
    privacyLabel: 'Privacy policy',
    statusGranted: 'Accepted',
    statusDenied: 'Declined',
    statusUnset: 'Not set',
    reopenLabel: 'Change cookie choice',
  },

  footer: {
    tagline: 'Email drafting for teams who live in their inbox.',
    consentLink: 'Cookies',
    officeLabel: 'Registered office',
    elsewhereLabel: 'Elsewhere',
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
