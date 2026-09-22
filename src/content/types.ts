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

export interface Content {
  /** BCP-47 tag written onto <html lang>. */
  htmlLang: string;
  /** Marker for translated files. Empty on English. */
  nativeCheck: string;

  meta: {
    title: string;
    description: string;
    /* Alt text for the share card in public/og-<locale>.png. A scraped image
       with no alt is what a screen reader announces as "image" in a timeline,
       so it carries the headline it draws. */
    cardAlt: string;
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
        one count that renders, and scripts/verify-payload.mjs pins that count, so
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
 */
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
    };
  };

  /** The free trial: the reader starts it themselves, uses the product, and is
      invoiced only if they keep it.

      It is the argument `price` used to make, rewritten for a funnel with no
      sales call in it. The timeline, the terms and the capability list were
      written to say that nobody is charged until they say yes, which is the
      one thing a trial has to say, so the sentences were carried across and
      the two calls taken out of them. Carried, not moved: `price` still
      renders, and still owns its own copy, until the whole firm model is
      taken off the page.

      Not one figure lives in this block. The length of the trial and the money
      belong to the data module, and every slot that meets a number splits into
      `before` and `after` halves around it, the way the rest of this file
      does. A numeral that lands inside a noun phrase has to agree with it in
      Danish and in Lithuanian, and a split sentence is what lets each language
      put its own words on either side of the count. */
  trial: {
    /** Heading over the stops. */
    whenTitle: string;

    /** The stops on the timeline, in order: the day it starts, the day it
        ends, and stopping before then. Three of them, and the locale audit
        holds every language to the same number.

        `figure` says which count the day marker wraps, so a renderer can walk
        the list without having to know what any one stop means. `start` takes
        the day the trial begins, `end` the day it runs out, and `none` takes
        no count at all: on that stop the two halves of `day` are joined as
        they stand. It still splits into halves, because every locale has to
        carry the same keys and no key may be left blank, which is what the
        locale audit checks.

        `say` is what the live region announces when a stop is selected, split
        around the figure the card is showing there: the monthly fee, or the
        struck out nothing on the last one. A struck out figure is a picture,
        so the announcement says the amount out loud rather than pointing at
        it. It does not repeat the day marker, which is ordinary text that a
        screen reader reaches on its own. */
    stops: readonly {
      figure: 'start' | 'end' | 'none';
      /** "<before><the day count><after>", or the two halves joined where
          `figure` is `none`. */
      day: { before: string; after: string };
      note: string;
      /** What the total is showing while this stop is selected. */
      state: string;
      /** "<before><whatever the total reads at this stop><after>". */
      say: { before: string; after: string };
    }[];

    /** The disclosure the terms sit behind. */
    termsLabel: string;
    /** Four term and note pairs: `t` is the term, `n` the sentence under it.
        Neither half carries a figure. */
    terms: readonly { t: string; n: string }[];

    /** What the trial gives a firm. No figures: these are things you get, and
        not one of them is a ceiling. */
    included: { title: string; items: readonly string[] };

    /** Sits under the button that starts the trial. The button is nav.cta. */
    ctaNote: string;
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
