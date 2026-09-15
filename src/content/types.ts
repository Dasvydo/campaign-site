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
    title: string;
    lead: string;
    placeholderTitle: string;
    placeholderBody: string;
    playLabel: string;
    caption: string;
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
    title: string;
    perSeat: string;
    perSeatNote: string;
    setup: string;
    setupNote: string;
    lines: string[];
    cta: string;
  };

  form: {
    title: string;
    lead: string;
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

  footer: {
    tagline: string;
    productLink: string;
    privacyLink: string;
    contactLink: string;
    /** Left empty until Dovy supplies them. Empty fields are not rendered. */
    company: {
      legalName: string;
      registrationNumber: string;
      address: string;
    };
  };
}
