/**
 * The shape every locale file fills. TypeScript enforces it, which is how the
 * QA line "no missing keys in any locale" is guaranteed rather than eyeballed:
 * a missing key is a build failure, not a blank space on the page.
 *
 * Rules for anyone editing the locale files:
 *   - No em dashes. Anywhere. This is checked by npm run verify:payload.
 *   - No AI-flavoured phrasing. No "unlock", no "supercharge", no "seamless".
 *   - Short declarative sentences. Concrete nouns. Write like a person.
 *   - Do not invent testimonials, named customers or pilots. None exist.
 */

/** The five things a firm knows, and the five switches that turn them off.
    They are deliberately the same five on every desk: a rule, a date, the file,
    the figures, and the house voice. That sameness is the argument. */
export type DemoSource = 'rules' | 'deadline' | 'file' | 'deductions' | 'tone';

export interface DemoSourceCopy {
  key: DemoSource;
  label: string;
  /** "1 line", "2 figures", "the register". */
  count: string;
  /** Said aloud when a clause fed by this source is pinned. */
  name: string;
  /** What the live region says when it goes off, and when it comes back. */
  off: string;
  on: string;
}

/** One reading of one clause. `circle` is the phrase the pen rings, if any. */
export interface DemoVariant {
  text: string;
  circle?: string;
  tail?: string;
}

/** One clause of the draft, in its three readings.
    `on` is the whole truth, `tone` is the same facts in a stiffer register and
    is absent where the clause has no separate voice, `off` is what is left when
    the source is gone. `dep` marks a clause that disappears entirely when
    another source goes, because it is the tail of that source's sentence.
    `sep` is the literal text that follows the clause, outside it. */
export interface DemoClause {
  key: DemoSource;
  dep?: DemoSource;
  on: DemoVariant;
  tone?: DemoVariant;
  off: DemoVariant;
  sep?: string;
}

/** One desk. Every sender, figure and date on all three is invented, which the
    slug under the heading says out loud. None of them is a customer. */
export interface DemoDesk {
  id: string;
  tab: string;
  /** Named in the live region when the desk changes. */
  deskName: string;
  letter: { from: string; subject: string; body: string };
  sources: [DemoSourceCopy, DemoSourceCopy, DemoSourceCopy, DemoSourceCopy, DemoSourceCopy];
  salutation: DemoClause;
  clauses: DemoClause[];
}

export interface NumberRow {
  /** The figure itself, without the hedge and without the unit. */
  amount: string;
  /** What follows it: "x", " EUR", " days". Leading space where one is wanted. */
  unit: string;
  label: string;
}

/** One line of the arithmetic behind a figure. */
export interface BasisRow {
  term: string;
  def: string;
}

export interface AudienceCopy {
  /** The index tab on the folder. */
  tab: string;
  /** The single line on the sheet below it. */
  line: string;
}

export interface PriceFee {
  term: string;
  figure: string;
  per: string;
  note: string;
}

export interface PriceTerm {
  t: string;
  n: string;
}

/** One stop on the timeline: its label, the line under it, the state the total
    shows while it is selected, and what the live region says. */
export interface PriceStop {
  day: string;
  note: string;
  state: string;
  say: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface Content {
  /** BCP-47 tag written onto <html lang>. */
  htmlLang: string;
  /** Marker for translated files. Empty on English. */
  nativeCheck: string;

  meta: {
    title: string;
    description: string;
  };

  nav: {
    skipToContent: string;
    localeLabel: string;
    localeNames: { en: string; da: string; lt: string };
    cta: string;
  };

  hero: {
    clockIn: string;
    clockOut: string;

    /** Masthead. The section links are in-page anchors; the hrefs live in the
        component because they are structural, not translatable. */
    skip: string;
    dateline: string;
    nav: { example: string; price: string; fit: string };
    tab: string;

    /** The headline is split so the highlighter can fall on the right phrase in
        each language rather than on a fixed word count. */
    title: { before: string; mark: string; after: string };
    /** The deck is split around hero.clockIn, so the time is written once. */
    deck: { before: string; after: string };

    cta: string;
    ctaNote: string;

    /** The pile of letters, and the one dealt off the top of it. */
    pileAlt: string;
    deal: {
      exampleLabel: string;
      from: string;
      subjectLabel: string;
      subject: string;
      sr: string;
    };

    /** The standing price bar on phones. */
    bar: { text: string; cta: string };

    /** The worked example's own paper. The demo reads these for its first desk,
        so the property scenario exists once per locale. */
    message: {
      from: string;
      subject: string;
      body: string;
    };
    draft: {
      greeting: string;
      body: string;
      signoff: string;
    };
  };

  demo: {
    eyebrow: string;
    title: string;
    lede: string;
    /** Says out loud that the example is canned and the figures invented. */
    slug: string;
    noJs: string;

    /** The letter's own two labels. The hero's dealt card uses its own. */
    fromLabel: string;
    subjectLabel: string;

    pickLead: string;
    beatIn: string;
    beatKnows: string;
    beatWrote: string;
    beatNote: string;

    gateNote: string;
    sendLabel: string;
    editLabel: string;
    doneLabel: string;
    sentStamp: string;
    draftStamp: string;
    sentChip: string;
    dealLabel: string;
    payoff: string;
    editNote: string;
    reLabel: string;
    close: string;
    closeBasis: string;

    /** The live region's fixed lines. Everything else it says comes from the
        desk, because it names that desk's own facts. */
    say: {
      allOff: string;
      restore: string;
      deal: string;
      sent: string;
      edit: string;
      done: string;
      /** Prefixed to a source name when a clause is pinned. */
      source: string;
      /** "{desk} desk. A different message, the same five sources." */
      desk: string;
    };

    restoreLabel: string;
    allOffNote: string;

    desks: [DemoDesk, DemoDesk, DemoDesk];
  };

  numbers: {
    eyebrow: string;
    title: string;
    /** "about ", set before every figure, so the hedge is written once. */
    about: string;
    rows: [NumberRow, NumberRow, NumberRow];
    /** "These are a model, not a measurement." The mark is highlighted. */
    lede: { before: string; mark: string; after: string };
    /** The disclosure that carries the basis of every figure above. */
    moreLabel: string;
    basis: [BasisRow, BasisRow, BasisRow];
    notes: [string, string];
  };

  who: {
    eyebrow: string;
    title: string;
    groups: [AudienceCopy, AudienceCopy, AudienceCopy];
    notes: {
      /** Both notes carry a hand-drawn underline under `mark`. */
      seats: { before: string; mark: string; mid: string; link: string; after: string };
      setup: { before: string; mark: string; after: string };
    };
  };

  price: {
    eyebrow: string;
    title: string;

    feesTitle: string;
    fees: [PriceFee, PriceFee];

    freeTitle: string;
    freeNote: string;
    termsLabel: string;
    terms: [PriceTerm, PriceTerm, PriceTerm, PriceTerm];

    whenTitle: string;
    /** Three stops on the timeline. The last one is the one that strikes the
        monthly total out and replaces it with nothing. */
    stops: [PriceStop, PriceStop, PriceStop];
    total: { term: string; sub: string; figure: string; per: string; zero: string };

    askEyebrow: string;
    ask: { before: string; link: string; after: string };
    cta: string;
    ctaNote: string;
  };

  form: {
    eyebrow: string;
    title: string;
    lead: string;
    /** The form number on the letterhead. */
    formNo: string;
    /** Marks the one field that is not required. */
    optional: string;
    companyLabel: string;
    companyPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailHint: string;
    emailFreeWarning: string;
    phoneLabel: string;
    phonePlaceholder: string;
    teamSizeLabel: string;
    teamSizeOptions: SelectOption[];
    emailClientLabel: string;
    emailClientOptions: SelectOption[];
    roleLabel: string;
    roleOptions: SelectOption[];
    choosePrompt: string;
    submit: string;
    submitting: string;
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    privacyNote: string;
  };

  results: {
    qualified: {
      title: string;
      body: string;
      covers: string[];
      coversTitle: string;
      bookingCta: string;
      bookingFallback: string;
    };
    gmailNote: string;
    tooSmall: {
      title: string;
      body: string;
      pricingCta: string;
      nurtureTitle: string;
      nurtureBody: string;
      nurtureCta: string;
      nurtureSubject: string;
      nurtureMailBody: string;
    };
    deliveryWarning: string;
    startOver: string;
  };

  /** The consent notice. Two categories, because the page loads exactly two
      non-essential things, and a category nobody uses is a category that
      teaches visitors the notice is decoration. */
  consent: {
    title: string;
    body: string;
    accept: string;
    decline: string;
    detailsLabel: string;
    items: { name: string; body: string }[];
    note: string;
    privacyLabel: string;
    /** Shown in the footer next to the reopen control. */
    statusGranted: string;
    statusDenied: string;
    statusUnset: string;
    reopenLabel: string;
  };

  footer: {
    tagline: string;
    /** Term for the footer row that reopens the consent notice. */
    consentLink: string;
    officeLabel: string;
    elsewhereLabel: string;
    productLink: string;
    privacyLink: string;
    contactLink: string;
    setIn: string;
    /** Registry facts. Identical in every locale on purpose: a company number
        and a street address are not translated, and scripts/audit-locales.mjs
        enforces that they stay identical. */
    company: {
      legalName: string;
      registrationNumber: string;
      address: string;
    };
  };
}
