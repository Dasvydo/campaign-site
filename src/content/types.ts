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
 *   - A numeral never sits inside a noun phrase that has to agree with it.
 *     Every slot below that takes a figure puts the figure last: after a label
 *     and a colon, or at the end of a clause with no noun behind it. English
 *     gets away with "3 places"; Danish needs "1 plads" and "2 pladser", and
 *     Lithuanian needs "1 vieta", "5 vietos" and "11 vietu". A label with the
 *     count after it is right at every count in all three languages, and it is
 *     the shape to keep. Where that genuinely could not be done, the comment on
 *     the slot says which counts are reachable, so the form can be chosen
 *     rather than guessed.
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
  /** What follows the figure: "x", " USD", " days". Leading space where one is
      wanted. This is the one counted noun left standing next to a numeral on
      the page, because a ledger line is a figure and its unit and nothing else
      reads like one. It is safe because the reachable counts are narrow: the
      multiple and the saving take units that do not inflect, and with the
      shipped offer the payback lands between three and nine days at every tier,
      so a form that is right across two to nine is right everywhere the page
      can reach. If the offer ever puts that figure at one, or above ten, this
      line wants rewriting rather than translating. */
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
    render time, so the sheet cannot disagree with the total below it.

    `waived` is carried by the setup line alone, and rendered only on a tier
    that gives that fee away. The amount is still shown, struck through, with
    `label` beside it: a fee waived without its amount on show is a trade with
    no visible value, and the reader is left with no way to price what they are
    giving up for it. A struck out figure is a picture, so `say` carries the
    same fact in words, split around the amount, for anyone who is not looking
    at it. The digit is still the offer's. */
export interface PriceFee {
  term: string;
  per: string;
  note: string;
  waived?: {
    /** The word set beside the struck out amount. */
    label: string;
    /** "<before><the setup fee><after>", said aloud. */
    say: { before: string; after: string };
  };
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
 * The per person table, the two claims that sit under it, and the one plan
 * that is named beside it rather than ranked inside it.
 *
 * Nothing here holds a figure. Our own cost a head is arithmetic on the flat
 * fee, and the rates it is set beside are doviloop.dev's published prices; both
 * are injected at render time, so a price that moves cannot leave a sentence on
 * this page saying otherwise.
 *
 * What the two claims argue, and why they are these two.
 *
 * `belowTeamCeiling` is the lead. It is a firm total against a firm total, not
 * a rate against a rate: Team stops selling at its seat ceiling, so the largest
 * firm Team will take is the largest bill Team can produce, and our one flat
 * fee is set against that. It carries no head count slot, because both sides of
 * it are fixed. It is true on a tier priced under that ceiling and false above
 * it, which is why it is gated on the offer rather than written as a promise.
 *
 * `curve` is the argument that needs no rival at all: one fee for the firm
 * means the cost per head falls as the firm grows. It names the smallest and
 * the largest head count the table shows and what each person costs at each, so
 * the reader can see the line running down rather than be told about it. It is
 * true at every tier and every pair of sizes, so it is ungated.
 *
 * Individual is not argued against, and it is not in the table. The table
 * compares firm level plans by head, so everything in it has to be a plan a
 * firm can buy for the whole firm: our own sizes, and Team at the largest firm
 * it will sell to. Individual is a plan for one person, bought a seat at a
 * time, so a row for it would put its seat rate in the same column a firm reads
 * our cost a head out of, and invite a comparison that is not like for like at
 * any size this offer is sold to. It is named in prose under the table instead,
 * by `individualNote`, which says what the plan is and what a seat costs and
 * claims nothing about it either way.
 *
 * There is no "nothing holds" fallback. With `curve` ungated, the claims list
 * is empty only where the table has fewer than two covered sizes to draw a
 * curve between, which the shipped coverage never produces; a fallback for that
 * would be a sentence maintained in three languages and never seen.
 */
export interface CompareCopy {
  eyebrow: string;
  title: string;
  lede: string;

  /** Column heads, in the order the table reads them. */
  planLabel: string;
  perHeadLabel: string;
  firmLabel: string;

  /** Our own rows, one per head count on show. The size cell is a label with
      the count after it, "People: 12", and not a sentence wrapped around a
      digit, so no language has to make a noun agree with a number it is handed
      at render time. `label` carries its own colon, so the punctuation belongs
      to the translator rather than to the component. */
  ourPlan: string;
  ourSize: { label: string };

  /** The one reference row. Team is a firm plan, so it can be compared with
      ours by head, and it is the only published plan in the table.

      `teamSize` is the same label shape as `ourSize` and takes the ceiling Team
      will sell to: "People, at most: 9". */
  teamPlan: string;
  teamSize: { label: string };

  claimsTitle: string;
  /**
   * Two claims, independent of one another. Neither refers to the other, so
   * both orderings and both of the reachable combinations read correctly.
   */
  claims: {
    /** The lead claim, rendered only where `belowTeamCeiling` holds on the
        active tier.
        "<before><the Team seat ceiling><mid><what the largest firm Team will
        take pays every month><then><our flat monthly fee for the whole
        firm><after>"
        No head count slot: both sides of this claim are fixed, so it falls away
        with the tier rather than with the size. The ceiling is a count of
        people and lands at the end of its clause, with no noun after it to
        agree with. */
    belowTeamCeiling: { before: string; mid: string; then: string; after: string };
    /** Always rendered wherever the table has two covered sizes to draw
        between, because it is true at every tier and every size.
        "<smallOpen><the smallest head count on show><smallCost><what each
        person costs at that size><largeOpen><the largest head count on
        show><largeCost><what each person costs at that size><after>"
        Both head counts end their clauses. Write the sentence so it is right
        whatever the four figures turn out to be: the only thing it may assert
        is that the fee for the firm does not change between the two sizes and
        that the cost per head therefore falls, which holds at every tier. */
    curve: {
      smallOpen: string;
      smallCost: string;
      largeOpen: string;
      largeCost: string;
      after: string;
    };
  };

  /**
   * The Individual plan, named under the table instead of given a row in it.
   * "<before><what one Individual seat costs a month><after>"
   *
   * This is the only place the page says the Individual plan exists, and it
   * exists because the rate is public and hiding it would be worse than saying
   * it. What it must do is describe the plan: one person, bought a seat at a
   * time, each seat keeping its own knowledge base. What it must not do is rank
   * it. No "cheaper", no "better", no "instead of", no setting its seat rate
   * against our cost a head, and no arithmetic on it: a firm that wants a
   * separate knowledge base for every person can multiply it themselves.
   *
   * One figure only, and it ends its clause with no noun behind it to agree
   * with. The rate is doviloop.dev's, so it is covered by `sourceNote`, which
   * is rendered directly after this and names both published rates.
   */
  individualNote: { before: string; after: string };

  /** Whose prices the published rates in this section are, and when we read
      them. It covers the Team rate in the table and the Individual rate in the
      note above it, so it names both rather than pointing at a row.
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

    /** The active tier's own name, dropped into the founding block so that one
        block is correct on every tier that sells a capped price against a
        trade. Both `founding` and `early` are capped and both waive nothing the
        other does not, so a block that said "founding" in fixed type would be
        wrong the morning the first tier sells out. `standard` is here for
        completeness; the block it feeds is replaced by `spotsClosed` there. */
    tierNames: { founding: string; early: string; standard: string };

    feesTitle: string;
    /** The monthly fee for the firm, then the one off setup fee. */
    fees: [PriceFee, PriceFee];

    /** What the flat fee covers. Both ceilings are firm level rather than per
        person, and both numbers come from the offer. */
    covers: {
      title: string;
      /** A label, then the ceiling: "People covered, up to: 20". `note` is the
          sentence that follows it and carries no figure, so neither half has to
          agree with a number. */
      people: { label: string; note: string };
      /** The same shape again, for the pooled draft cap. */
      drafts: { label: string; note: string };
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
      /** "<before><the active tier's name><after>". */
      eyebrow: { before: string; after: string };
      title: string;
      lede: string;
      /** A label, then the count, then the total: "Places still open: 3 of 5".
          The numeral ends its clause and nothing after it agrees with it, so
          the line is right at one place left as well as at five. One is the
          state that matters most commercially, and zero is unreachable: the
          tier advances the moment the last place is spent. */
      spots: { label: string; of: string };
      spotsClosed: string;
      givesTitle: string;
      gives: [string, string, string, string];
      getsTitle: string;
      /** The two halves of what the trade gives back, named rather than
          indexed, because they are not interchangeable. `fee` holds on any
          capped tier and names it. `setup` is rendered only where the tier
          actually waives the setup fee. */
      gets: {
        /** "<before><the active tier's name><after>". */
        fee: { before: string; after: string };
        setup: string;
      };
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
    /** `sub` is a label with the covered head count after it, the same shape
        the coverage list uses. There is no `figure`: the monthly total is the
        offer's, read at render time. `zero` is what replaces it when the last
        stop strikes it out. */
    total: { term: string; sub: { label: string }; per: string; zero: string };

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
