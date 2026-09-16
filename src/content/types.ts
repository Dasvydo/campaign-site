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
 *   - No prices. Not one. Every amount the page says out loud is read from
 *     src/lib/offer.ts at render time, and the copy carries the words around
 *     it. Where a number belongs in a sentence, the type gives it a slot.
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

/** One figure in the ledger.
    `key` says where the figure comes from, because two of the three are now
    arithmetic on the offer and only one is copy. `multiple` and `payback` are
    computed at render time from the flat fee, so they carry no `amount` here
    and a price change cannot leave a stale number on the page. `saving` is an
    input to the model rather than a price of ours, so it is written down. */
export interface NumberRow {
  key: 'multiple' | 'saving' | 'payback';
  /** The figure itself, without the hedge and without the unit. Present only
      on the `saving` row; the others are filled from the offer. */
  amount?: string;
  /** What follows it: "x", " USD", " days". Leading space where one is wanted. */
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

/** One line on the fee sheet. No figure: the amount is read from the offer at
    render time, so the sheet cannot disagree with the total below it. `waived`
    is the word shown in place of the amount where the tier gives that fee away,
    and only the setup line carries one. */
export interface PriceFee {
  term: string;
  per: string;
  note: string;
  waived?: string;
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
  /** What the live region says, split around the figure the total is showing
      at this stop: the monthly fee, or the struck out zero on the last one. A
      struck out figure is a picture, and the announcement has to say the
      amount out loud rather than point at it. */
  say: { before: string; after: string };
}

/**
 * The per person table, and the three claims that sit under it.
 *
 * Nothing here holds a figure. Our own cost a head is arithmetic on the flat
 * fee, and the two rates it is set against are doviloop.dev's published prices;
 * both are injected at render time, so a price that moves cannot leave a
 * sentence on this page saying otherwise.
 *
 * The three claims are independent on purpose. Each one is rendered only where
 * the arithmetic makes it true at the size and the tier on show, each reads on
 * its own, and none of them refers to the others. The keys match the claim
 * names the offer resolves, so wiring one to the other is a lookup and not a
 * judgement. Where none of them holds, `noClaims` is what the section says.
 */
export interface CompareCopy {
  eyebrow: string;
  title: string;
  lede: string;

  /** Column heads, in the order the table reads them. */
  planLabel: string;
  perHeadLabel: string;
  firmLabel: string;

  /** Our own rows, one per head count on show. `size` reads "<count> people",
      and `before` is empty in English only because English puts the count
      first. A language that does not needs it. */
  ourPlan: string;
  ourSize: { before: string; after: string };

  /** The two published rates, as reference rows. `teamSize` reads
      "Up to <teamMax> people", which is the ceiling Team will sell to. */
  individualPlan: string;
  individualSize: string;
  teamPlan: string;
  teamSize: { before: string; after: string };

  claimsTitle: string;
  claims: {
    /** "<before><our cost a head><mid><the Team rate><after>" */
    belowTeamRate: { before: string; mid: string; after: string };
    /** "<before><our cost a head><mid><the Individual rate><after>" */
    belowIndividualRate: { before: string; mid: string; after: string };
    /** "<before><our monthly fee><mid><the Team seat ceiling><then><what a firm
        that size pays on Team><after>" */
    belowTeamCeiling: { before: string; mid: string; then: string; after: string };
  };
  /** Stands in for the claims where not one of them is true at this size. */
  noClaims: string;

  /** Whose prices the two reference rows are, and when we read them.
      "<before><doviloop.dev><mid><the date they were read><after>" */
  sourceNote: { before: string; link: string; mid: string; after: string };
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

  /** One flat fee for the whole firm. Every amount below is read from the
      offer, so this block holds the sentences and the labels and not one
      price. */
  price: {
    eyebrow: string;
    title: string;

    feesTitle: string;
    /** The monthly fee for the firm, then the one off setup fee. */
    fees: [PriceFee, PriceFee];

    /** What the flat fee covers. Both ceilings are firm level rather than per
        person, and both numbers come from the offer. */
    covers: {
      title: string;
      /** "<before><people covered><after>" */
      people: { before: string; after: string };
      /** "<before><drafts a month, pooled><after>" */
      drafts: { before: string; after: string };
      note: string;
    };

    /** The founding places, written as a trade rather than a discount: four
        things given, two things got back.
        Each line of `gets` is rendered on its own terms, because the second of
        them is only true on a tier that actually waives the setup fee.
        The counter is rendered only where the tier has a finite number of
        places. On the uncapped tier there is no trade left to offer, and
        `spotsClosed` is the one line that stands in for the whole block. */
    founding: {
      eyebrow: string;
      title: string;
      lede: string;
      /** "<before><places in all><mid><places still open><after>" */
      spots: { before: string; mid: string; after: string };
      spotsClosed: string;
      givesTitle: string;
      gives: [string, string, string, string];
      getsTitle: string;
      gets: [string, string];
      note: string;
    };

    freeTitle: string;
    freeNote: string;
    termsLabel: string;
    terms: [PriceTerm, PriceTerm, PriceTerm, PriceTerm];

    whenTitle: string;
    /** Three stops on the timeline. The last one is the one that strikes the
        monthly total out and replaces it with nothing. */
    stops: [PriceStop, PriceStop, PriceStop];
    /** `sub` splits around the number of people the fee covers. There is no
        `figure`: the monthly total is the offer's, read at render time. `zero`
        is what replaces it when the last stop strikes it out. */
    total: { term: string; sub: { before: string; after: string }; per: string; zero: string };

    askEyebrow: string;
    ask: { before: string; link: string; after: string };
    cta: string;
    ctaNote: string;
  };

  /** What each person costs here, set beside the two published rates on
      doviloop.dev. */
  compare: CompareCopy;

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
