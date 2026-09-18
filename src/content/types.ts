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
    /** The one call to action, for the one thing this page asks anyone to do.
        Every control that points at #fit reads this key: the folder tab, the
        hero button, the standing bar on phones and the button under the price.
        It used to be four keys, and they had drifted into four different
        promises, one of which said a call was being booked when what happens
        is six questions. The page harness holds every #fit control to one
        label, so a literal typed back into a component fails the build rather
        than quietly making it five. Changing the wording here changes it
        everywhere, which is what lets ad copy be written against it. */
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

    /** The headline is split so the highlighter can fall on the right phrase in
        each language rather than on a fixed word count, and so the time the
        work is finished by is written once, in hero.clockOut, rather than typed
        into three translations of the same sentence. The headline carries the
        outcome: what the reader ends up with, and when. */
    title: { before: string; mark: string; mid: string; after: string };
    /** One sentence, no slots. The deck clarifies the promise the headline
        makes rather than making one of its own, which is why the figures it
        used to carry moved up into the headline. */
    deck: string;

    /** Sits under the hero button. The button's words are nav.cta. */
    ctaNote: string;

    /** The one value figure the page states flatly, and the reason it may.
        "<before><the break even hourly cost><after>": the fee divided by the
        hours handed back, on the largest package at its own coverage and at
        the low end of the illustrative volume. It is arithmetic on our own
        price and a stated volume, not a claim about what anyone's staff cost;
        the reader supplies that and does the comparison. The figure comes
        from src/lib/value.ts and is hedged with "about" in the copy, because
        it moves with the volume and the minutes, and the sentence should
        sound like it knows that. */
    payback: { before: string; after: string };

    /** The pile of letters, and the one dealt off the top of it.

        The card is the drafted reply rather than the message that asked for
        it. The pile behind it is already the problem, forty of it, and a hero
        that shows nothing but the problem is asking the reader to imagine the
        part they are being sold. So the card is the thing they get: who it is
        going to, what it is about, and the first line of it in the words it
        was actually drafted in.

        `preview` is held to being an exact substring of hero.draft.body, which
        the page harness checks in all three languages. It is the same letter as
        the one the worked example opens with, and an excerpt that had drifted
        from it would be a hero promising a draft the demo then fails to show. */
    pileAlt: string;
    deal: {
      draftLabel: string;
      to: string;
      subjectLabel: string;
      subject: string;
      preview: string;
      sr: string;
    };

    /** The standing price bar on phones. Its button is nav.cta. */
    bar: { text: string };

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
    /** What it does not draft, said where the one draft is shown, so nobody
        starts a pilot expecting every email to come back with one.
        "<before><one in how many, as a count><after>". The count is derived
        from the measured share in src/lib/value.ts and ends its clause. */
    share: { before: string; after: string };

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

  /** The calculator. The visitor supplies four figures and the page does the
      sum in front of them, in order, so every number on the panel is one the
      reader can check with a pencil. Nothing here holds a figure: the share
      of mail that gets a draft and the assumed minutes live in
      src/lib/value.ts, the fee in src/lib/offer.ts, and the rest is theirs. */
  numbers: {
    eyebrow: string;
    title: string;
    /** "about ", set before every modelled figure, so the hedge is written
        once. Never set before the fee, which is exact. */
    about: string;

    /** The four controls. Each label ends its own clause, and the figure the
        control shows sits after it, so no language has to agree a noun with
        a number it is handed at render time. */
    inputs: {
      people: { label: string };
      inbound: { label: string };
      hourly: { label: string };
      /** The one input that is an assumption of ours rather than a fact of
          theirs. `note` says so in words beside the control. */
      minutes: { label: string; note: string };
    };

    /** The rows of the sum, read down. Each is a label with its colon, then
        the figure. `fee` takes the package name under its label. */
    beats: {
      /** The measured share, said inside the disclosure rather than as a row
          of its own: "<before><the share, as a percentage><after>". Read from
          value.ts, so the one measured figure arrives from the same place the
          sum reads it. */
      draftsNote: { before: string; after: string };
      hours: { label: string };
      worth: { label: string };
      fee: { label: string };
      keep: { label: string };
    };
    /** Units the figures wear. Neither inflects in any of the three
        languages, which is what makes a bare unit beside a numeral safe. */
    units: { hours: string; perMonth: string; perHour: string };
    /** "Over a year:", then the kept figure times twelve. */
    yearLabel: string;
    /** Printed in place of the year line where the sum comes out below zero.
        The page says it does not clear rather than hiding the row. */
    under: string;

    /** The disclosure that carries the basis of every figure above. */
    moreLabel: string;
    /* One line per thing the sum rests on: the measured share, the assumed
       minutes, the hourly cost being theirs. Pinned to a length so a locale
       cannot quietly carry a different number of them. */
    basis: [BasisRow, BasisRow, BasisRow];
    /** Closes the disclosure: the sum is redone on the call. */
    note: string;
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

    /** The founding cohort's own name, dropped into the block that describes
        the trade. One word rather than a name per tier: the page no longer
        sells a price ladder, so there is one cohort and one name for it. The
        block it feeds is replaced by `spotsClosed` once the cohort is full. */
    cohortName: string;

    feesTitle: string;
    /** The monthly fee for the firm, then the one off setup fee. */
    fees: [PriceFee, PriceFee];

    /** The two packages, smallest firm first.

        Only the words live here. Every figure beside them, the fee, the
        coverage and the pooled draft cap, is read from the offer at render
        time, which is why a row carries an `id` rather than a price: the row
        has to be matched to the right package, and matching it by position
        would put Firm's fee beside Desk's name the first time somebody
        reordered the list. A row whose id names no package renders nothing. */
    packages: {
      title: string;
      lede: string;
      /** Names the group of package cards for a screen reader, and sits
          above them for everyone else: pick by counting your people. */
      pick: string;
      rows: readonly { id: string; name: string; note: string }[];
      /** Column headings. Neither carries a figure. */
      feeLabel: string;
      peopleLabel: string;
      draftsLabel: string;
      note: string;
    };

    /** What is in the product, and the same in both packages. No figures:
        these are the things a firm gets, and the ceilings are `covers`. */
    included: { title: string; items: readonly string[] };

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
      /** Two sentences, because only one of them is always true.

          `noProofYet` is a claim about this business and not about the offer:
          it holds until the first pilot starts and is false from then on, with
          nothing at render time able to tell. `offer.noCustomersYet()` decides
          whether it appears. `trade` explains what the places are and does not
          depend on how many firms have taken one, so it is always printed and
          has to read as a whole sentence on its own. */
      lede: { noProofYet: string; trade: string };
      /** Why the price is what it is, printed beside it in the open so the
          price never appears without its reason.
          "<before><the number of places in the cohort><after>". The count is
          the cohort's total, read from the offer, and it ends its clause: the
          noun that names what is counted comes before it, so the only
          reachable count, the one in `OFFER.founding.places`, is the one
          each translation has to be right for. */
      reason: { before: string; after: string };
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
    /** Sits under the button at the foot of the band. The button is nav.cta. */
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
    /** The two screens the six questions are split across.

        Names rather than a count, and the reason is the same one that took the
        numerals out of the price band: "Step 1 of 2" puts a numeral inside a
        noun phrase that has to agree with it, in two languages where it does.
        A name for each screen says more anyway, and `aria-current` carries
        which one is open without either language having to write it down. */
    steps: string[];
    /** Names the list of steps for a screen reader. */
    stepsLabel: string;
    /** Moves to the second screen. Not a submit: nothing is sent yet. */
    continueCta: string;
    backCta: string;
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
      /* Which address to book under. WF-C7 matches a booking back to the lead
         on the email address and has nothing else to match on, so a booking
         made under a different one arrives with no lead attached. Google's
         booking page will take whatever the visitor types, and the shortlink
         strips query parameters, so the address cannot be filled in for them
         from here. Asking is the whole mechanism. */
      sameEmail: string;
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
