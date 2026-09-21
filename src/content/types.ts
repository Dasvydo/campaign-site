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
  /** Paired with the audience folder of the same id. See AudienceCopy.id. */
  id: AudienceId;
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

/** The three trades this page is sold to.

    A union rather than a bare string, so a typo is a build failure. Be precise
    about what that buys, because this comment used to overclaim: TypeScript
    does NO cross-list comparison. It refuses an id outside the union and a list
    of the wrong length, and nothing else. The pairing of the two lists is the
    page harness's job, and what it asserts is the SEQUENCE of ids, not the
    meaning: swap the words between two folders while leaving their ids in
    place and every check still passes. An independent verifier proved that.
    The id fixes the order; a human still has to read the words. */
export type AudienceId = 'property' | 'accounting' | 'insurance';

export interface AudienceCopy {
  /** Which desk this folder is the audience for.

      It exists so the order can be CHECKED rather than eyeballed. The two
      lists ran in different orders one scroll apart until 2026-09-19, and the
      fix was real but unprotected: an independent verifier swapped two folders
      in one locale and the entire suite stayed green, because nothing paired
      the lists and they shared no key to pair them on. They share this one
      now, and scripts/harness-page.tsx holds the two orders equal in every
      locale. */
  id: AudienceId;
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
        is the fit check. The page harness holds every #fit control to one
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
    nav: { example: string; price: string; fit: string };

    /** The headline is split so the highlighter can fall on the right phrase in
        each language rather than on a fixed word count, and so the time the
        work is finished by is written once, in hero.clockOut, rather than typed
        into three translations of the same sentence. The headline carries the
        outcome: what the reader ends up with, and when. */
    title: { before: string; mark: string; mid: string; after: string };
    /** The one value figure the page states flatly, and the reason it may.
        "<before><the hours handed back a month><after>": the drafts a firm of
        that size would get, at the assumed minutes, on the largest package at
        its own coverage and at the low end of the illustrative volume. It is
        arithmetic on a stated volume and a stated assumption, not a claim
        about anyone's staff or their cost.

        It used to carry the break even hourly cost instead, and the sentence
        read "it pays for itself if the people answering your email cost more
        than about 5 EUR an hour". True, and useless: that is below the legal
        minimum everywhere this page is sold, so the condition never fails and
        the line reads as rhetoric rather than as the sum it is. The hours are
        the same sum stopped one step earlier. See heroHoursBack in
        src/lib/value.ts.

        The figure is hedged with "about" in the copy, because it moves with
        the volume and the minutes.

        TWO SLOTS, NOT ONE, and the first is why. The head count was spelled
        out in words in all three locale files, "a firm of twenty", with
        nothing tying it to the coverage the hours were computed on. An
        independent verifier moved that coverage to 25 and got a page reading
        "a firm of twenty gets back about 51 hours a month": half derived, half
        typed, and the typed half quietly contradicting the package the derived
        half came from. Both figures are read from the offer and the model now,
        the head count first and the hours second.

        Both are pinned in scripts/verify-offer.mjs, which is what makes the
        inflection safe: Danish and Lithuanian agree a noun with each of them,
        so each translation is written for one pair of counts and the build
        refuses a change that would move either without the endings being read
        again. */

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
    /** Under the button in the hero: where the thing is installed.

        It is the first question a firm asks before it asks the price - a
        property manager or an accountant is about to let software read client
        correspondence, and "where does our mail actually go" comes before
        "what does it cost". The page's only other word on it is "Hosted in the
        EU", four sections down inside a disclosure.

        This is a claim about what the business can deliver, not about the
        page. The founder asked for it after being told the page said nothing
        of the kind and that offering it commits him to installing inside
        somebody else's infrastructure; he asked for it anyway, which is his
        call to make. */
    setup: string;

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
    /** The worked example's closing line, split around the minutes nobody
        spent: "<before><the minutes to write one from nothing><after>".

        The figure used to be typed into this sentence as "nine", while the
        calculator's own basis said five and src/lib/value.ts computed every
        figure on the page from five. Two assumptions for one quantity, about
        two thousand pixels apart, on a page whose whole argument is that its
        numbers are checkable. It reads from value.ts now.

        THE FIGURE DOES NOT END ITS CLAUSE, and this comment used to claim it
        did. An independent verifier caught it: in all three locales the number
        is followed immediately by "minutes", "minutter" or "minuciu", a noun
        that has to agree with it. The claim was copied from the `share` slot
        below, where it is true. The endings written here are correct for the
        one count that renders, and scripts/verify-offer.mjs pins that count, so
        moving it fails the build rather than shipping bad grammar in a language
        the person moving it may not read. */
    /** The example's closing line, split so the highlighter can fall on the
        clause that carries the point and take the figure with it. The minutes
        sit between `mark` and `markEnd`, inside the highlight, because a
        number left outside it reads as an afterthought. */
    close: { before: string; mark: string; markEnd: string; after: string };
    /** Says the figure in `close` is an assumption, not a measurement, and
        carries it again: "<before><the same minutes><after>". */

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
      /** The figure the whole sum now runs from, asked for directly because
          drafts are what the firm is buying. `note` carries the measured share
          as a hint for a reader who knows their inbox and not their draft
          count: "<before><the share, as a percentage><after>". */
      drafts: { label: string; note: { before: string; after: string } };
      hourly: { label: string };
      /** The one input that is an assumption of ours rather than a fact of
          theirs. `note` says so in words beside the control. */
      minutes: { label: string; note: string };
    };

    /** The rows of the sum, read down. Each is a label with its colon, then
        the figure. `fee` takes the package name under its label. */
    beats: {
      hours: { label: string };
      worth: { label: string };
      /** "<before><the package name><after>": "This costs (Desk):". The
          name is the one the price band prints for the package the head
          count lands on, so the two sections call it the same thing. */
      fee: { before: string; after: string };
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

    /** What happens when a draft would be wrong.

        The objection this answers is the one a regulated trade asks first, and
        until 2026-09-19 the page did not answer it anywhere. What it answered
        was a different question: "nothing sends itself" is about automation,
        not about correctness, and an accountant is not afraid the software will
        send without them. They are afraid it will be confidently wrong and
        somebody will send it.

        NOTHING HERE IS A NEW CLAIM. Every line is something the page already
        said somewhere else, moved to where the question is actually asked: the
        share that gets a draft at all, the question back instead of a guess,
        the absence of any automatic send, and documents indexed so a figure can
        be checked against the file it came from. If a line here ever needs
        evidence the product cannot produce, it does not belong on the page.

        `unmeasured` is the one thing that is not a claim: how often a draft
        needs correcting has not been measured, and the page says so rather than
        implying a number it does not have. It is the same move the calculator
        makes about the minutes. */
    /** The lead-in over the five things a trade's drafts are written out of.

        The five themselves are not held here. They are `demo.desks[].sources`,
        matched to the folder by the id both lists carry, because they are the
        same five things the worked example switches on and off and a second
        copy of them would be a second copy to keep true. Only the label that
        introduces them is this section's own, and it carries its own
        punctuation because a colon is not the same mark in every language. */
    sourcesTitle: string;

    accuracy: {
      title: string;
      items: readonly string[];
      /** The one measured figure on this block, said quietly and said here
          rather than beside the draft the reader has just watched appear.
          It was a full sized line under the worked example, which put a
          limitation in the loudest place on the page; it belongs with the
          other limits. "<before><one in how many, as a count><after>", the
          count derived from the measured share in src/lib/value.ts. */
      share: { before: string; after: string };
      unmeasured: string;
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

    /** The two packages, smallest firm first.

        Only the words live here. Every figure beside them, the fee, the
        coverage and the pooled draft cap, is read from the offer at render
        time, which is why a row carries an `id` rather than a price: the row
        has to be matched to the right package, and matching it by position
        would put Firm's fee beside Desk's name the first time somebody
        reordered the list. A row whose id names no package renders nothing. */
    packages: {
      title: string;
      /** Names the group of package cards for a screen reader, and sits
          above them for everyone else: pick by counting your people. */
      pick: string;
      rows: readonly { id: string; name: string; note: string }[];
      /** Column headings. Neither carries a figure. */
      feeLabel: string;
      peopleLabel: string;
      draftsLabel: string;
      note: string;
      /** What a firm larger than the biggest package reads.

          The fit check routes anyone above nine people to a booking link, but
          the packages stop at the largest one's coverage, so a firm of forty
          could pass the check, book a call, and never have seen a price that
          applies to them. The calculator cannot model them either: its people
          control stops at the same ceiling. Saying so beside the packages is
          cheaper than letting them work it out on the call, and a firm that
          large is a call worth taking rather than one to turn away. Carries no
          figure: the ceiling it refers to is the one printed on the card
          beside it. */
      /** For the firm too small for either card, which is the half of this
          pair nobody was answering.

          A line in the fit section used to point them at doviloop.dev. It was
          cut on 2026-09-20 as redundant with this section, and it was: it
          repeated the price. It was also the only place a reader met the fact
          that there is something cheaper for them, and the routing that says
          so lives behind the form, on a screen only reached by answering "1 to
          9 people". A firm that reads the price and leaves never gets there.
          `link` is the product site's own domain, so it is not translated. */
      under: { before: string; link: string; after: string };
      over: string;
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
      title: string;
      /** The admission, printed only while it is true.

          It is a claim about this business and not about the offer: it holds
          until the first pilot starts and is false from then on, with nothing
          at render time able to tell. `offer.noCustomersYet()` decides whether
          it appears, and it opens the paragraph that `reason` and `lock`
          finish rather than standing as a sentence of its own.

          It used to be printed beside a second sentence, "These places are a
          trade, not a discount", which said in other words what `reason` says
          with the number in it. The founder read this block three times and
          called it redundant three times; that sentence was the redundancy. */
      noProofYet: string;
      /** Why the price is what it is, printed beside it in the open so the
          price never appears without its reason.
          "<before><the number of places in the cohort><after>". The count is
          the cohort's total, read from the offer, and it ends its clause: the
          noun that names what is counted comes before it, so the only
          reachable count, the one in `OFFER.founding.places`, is the one
          each translation has to be right for. */
      reason: { before: string; after: string };
      /** The price is held while the firm stays. Printed beside the reason,
          because it is the other half of the same promise: low, and not
          going up on you. */
      lock: string;
      /** A label, then the count, then the total: "Places still open: 3 of 5".
          The numeral ends its clause and nothing after it agrees with it, so
          the line is right at one place left as well as at five. One is the
          state that matters most commercially, and zero is unreachable: the
          tier advances the moment the last place is spent. */
      spots: { label: string; of: string };
      spotsClosed: string;
      /** The four obligations, set as one line rather than a heading standing
          over four sentences.

          `givesTitle` is the lead-in that says what the list is, and it
          carries its own punctuation, because a colon is not the same mark in
          every language. The four are noun phrases, separated on screen by a
          middot drawn in CSS, so no translation has to supply a conjunction
          and no translation's word order has to survive one. They stay four
          strings rather than one sentence so each obligation is still a
          translatable unit on its own.

          The lead-in is not optional. Without it a sighted reader met four
          bullets with nothing saying what they were, and a list of things you
          owe reads as a list of things you get. */
      givesTitle: string;
      gives: [string, string, string, string];
      note: string;

      /** Who the one person is.

          The trade above rests on a claim about capacity: a place in the
          founding five, "which is as many firms as one person can give real
          attention to at once". That sentence shipped for weeks without the
          person in it being named anywhere on the page, which left a reader
          in Denmark or Lithuania with an Estonian registry code and nobody to
          attach the promise to.

          `line` is his own sentence, in the first person, which is a
          deliberate break from the page's "we" because a signature is the one
          place a person should speak as themselves. `name` is the first name
          it is signed with.

          It held his full name in display serif over the line, and he asked
          for that gone; what came back is a signature rather than a nameplate.
          The profile it links to is not here - it is one address, the same in
          every language, and lives in lib/env.ts beside the other fixed
          destinations rather than being kept identical by hand in three
          files. */
      signature: { name: string; line: string };
    };

    termsLabel: string;
    terms: [PriceTerm, PriceTerm, PriceTerm, PriceTerm];

    whenTitle: string;
    /** Three stops on the timeline. The last one is the one that strikes the
        monthly total out and replaces it with nothing. */
    stops: [PriceStop, PriceStop, PriceStop];
    /** What replaces the fee on the lit card when the last stop strikes it
        out. The fee itself is the offer's, read at render time. */
    total: { zero: string };

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
    teamSizeLabel: string;
    teamSizeOptions: SelectOption[];
    emailClientLabel: string;
    emailClientOptions: SelectOption[];
    roleLabel: string;
    roleOptions: SelectOption[];
    /** Over the box that opens when "Something else" is chosen, on the email
        client question and on the role. One string for both, because both ask
        the same thing of the reader and a second would be a second thing to
        keep translated for no gain. */
    otherLabel: string;
    choosePrompt: string;
    /** The two screens the five questions are split across.

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
