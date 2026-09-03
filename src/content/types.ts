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

export interface StepCopy {
  n: string;
  title: string;
  body: string;
}

export interface NumberRow {
  figure: string;
  label: string;
  basis: string;
}

export interface AudienceCopy {
  title: string;
  body: string;
}

export interface ObjectionCopy {
  q: string;
  a: string;
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
    opening: string;
    subOpening: string;
    claim: string;
    cta: string;
    ctaNote: string;
    exampleCaption: string;
    message: {
      from: string;
      subject: string;
      body: string;
    };
    draftReady: string;
    draft: {
      greeting: string;
      body: string;
      signoff: string;
    };
    afterLine: string;
  };

  how: {
    title: string;
    lead: string;
    steps: [StepCopy, StepCopy, StepCopy];
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
    title: string;
    lead: string;
    rows: [NumberRow, NumberRow, NumberRow];
    caveat: string;
  };

  who: {
    title: string;
    lead: string;
    groups: [AudienceCopy, AudienceCopy, AudienceCopy];
    seatMinimum: string;
    noTech: string;
  };

  objections: {
    title: string;
    lead: string;
    items: ObjectionCopy[];
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
