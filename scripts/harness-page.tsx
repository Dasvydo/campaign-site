/**
 * Third harness. Renders the entire <LocalePage /> for each locale in jsdom and
 * reports what came out, so "all three locales render, with no missing keys and
 * no English leaking into /da or /lt" is a measured claim rather than a hope.
 *
 * Since the page went to a flat firm fee it also has to measure the arithmetic.
 * Not one price is written in a locale file any more: every amount on the page
 * is injected from src/lib/offer.ts at render time, which means a string from
 * the content file can no longer prove that the figure beside it arrived. So
 * the figure-bearing lines are asserted as assembled strings, content plus the
 * offer's own number, and the comparison table is read back out of the DOM and
 * checked against what `comparison()` says it should hold. This file does the
 * measuring and the deriving; verify-payload.mjs does the asserting, because
 * only this side can import the offer.
 *
 *
 * The calculator is measured by driving it. Its four controls are set to a
 * grid of values through the native setter, and at every point the figures on
 * the panel are read back out of the DOM and set against what src/lib/value.ts
 * computes for those inputs, so a panel doing its own arithmetic fails at the
 * inputs where it differs and names them.
 */
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LocalePage } from '../src/LocalePage';
import { content, pathFor } from '../src/content';
import { TEAM_SIZES, route } from '../src/lib/contract';
import type { Locale } from '../src/lib/contract';
import {
  OFFER,
  headlinePackage,
  foundingOpen,
  packageById,
  packages,
  remainingFoundingPlaces,
  setupDue,
  formatCount,
  formatMoney,
} from '../src/lib/offer';
import type { PackageId } from '../src/lib/offer';
import {
  VALUE,
  draftRatePercent,
  formatShare,
  heroHoursBack,
  hourlyStart,
  hoursFromDrafts,
  keptFromDrafts,
  packageFor,
  oneEmailIn,
  peopleRange,
  worthFromDrafts,
} from '../src/lib/value';

/* The page after the port and after the flat fee landed: hero, the worked
   example, who it is for, what it is worth, what it costs, what each person
   costs, the fit check. "how" and "objections" are gone, the first because the
   worked example shows what it described and the second because the objections
   are answered where they arise. The comparison with the product site's per
   seat plans is gone too, since 2026-09-18: it argued from somebody else's
   rates, and the calculator argues from the reader's own. The order below is
   the document order the page is asserted to have, not just a set of ids. */
const SECTION_IDS = ['hero', 'demo', 'who', 'price', 'numbers', 'qualifier'];

/* The numbers and the framing the old per seat model put on the page. 890 USD
   a month for ten seats, 89 USD a seat, and a minimum written as a count of
   seats rather than of people. All three are gone, and the whole argument the
   page now makes depends on them staying gone: a page that says 89 USD a seat
   anywhere is a page still selling the thing the flat fee replaced.

   The two amounts are matched as bare numerals rather than as "89 USD", so the
   check survives a locale putting the unit somewhere English does not, and they
   are fenced against digits and separators on both sides so that 890 does not
   match inside 8900 and 89 does not match inside 890 or 189. Nothing the
   shipped offer can render collides with either: the reachable figures are the
   three tier prices, the setup fee, the coverage, the pooled draft cap, the two
   published rates, the Team ceiling and the per head divisions of the flat fee.

   The seat framing is checked as the English word only, and never as the bare
   word. Danish and Lithuanian said it as "plads" and "vieta", and both of those
   words are now doing honest work in the founding block, where they mean a
   place in the cohort. English is no safer: since Individual lost its row it is
   named in prose under the table, and that sentence says the plan is "bought a
   seat at a time" and that "each seat keeps its own knowledge base". That is
   correct copy about somebody else's per seat plan, shipped deliberately in
   three languages, and a bare word match fails on it.

   So the two seat patterns match the framing rather than the noun: a price
   attached to a seat, and a count of seats. Neither is a thing this page can
   say about its own offer without having gone back to selling seats, and
   neither fires on prose that merely mentions one. Describing a rival plan by
   the seat is allowed; pricing by the seat, or fencing the offer at a number of
   them, is not. The numerals stay as they were, and they remain the half of the
   check that catches an actual misprice in all three locales. */
const STALE = [
  { label: '890, the old flat monthly for ten seats', re: /(?<![\d.,])890(?![\d.,])/ },
  { label: '89, the old per seat rate', re: /(?<![\d.,])89(?![\d.,])/ },
  {
    label: 'a rate priced by the seat',
    re: /(?<![\d.,])\d[\d.,]*\s*(?:USD\s*)?(?:a|per|\/)\s*seat\b/i,
  },
  {
    label: 'the old minimum framed as a count of seats',
    re: /(?:(?<![\d.,])\d[\d.,]*|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|fifty)\b)\s*\+?\s*seats\b/i,
  },
];

/* The plan that is named under the table and must never be inside it.

   Read from the locale rather than written down here. It used to be the one
   literal 'Individual', on the reasoning that the product site keeps its plan
   names in English; the product site does no such thing, and on /da and /lt it
   prints names of its own. A literal would have gone on passing while missing
   the row it exists to catch, in the two languages where it matters. */

/** Every leaf string in a content object, so a blank key is caught. */
function leaves(value: unknown, path = '', out: Array<[string, string]> = []): Array<[string, string]> {
  if (typeof value === 'string') out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => leaves(v, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) leaves(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

/* React tracks an input's value through its own setter, so assigning
   `el.value` from a test leaves the tracker believing nothing changed and the
   change event it then hears is ignored. The prototype's setter is the one
   React did not wrap. */
function setNativeValue(el: HTMLInputElement, value: string): void {
  const proto = Object.getPrototypeOf(el) as object;
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  if (desc?.set) desc.set.call(el, value);
  else el.value = value;
}

/* The grid the calculator is driven across. Every end of every range, the
   place each control opens, and the smallest and largest firm each package
   covers, because those are the head counts where the fee row changes package
   and where a panel reading the wrong one would show. */
const drivePoints = (): Array<[number, number, number, number]> => {
  const pr = peopleRange();
  const heads = new Set<number>([pr.min, pr.start, pr.max, ...packages().map((p) => p.covers), ...packages().map((p) => p.covers + 1)]);
  const out: Array<[number, number, number, number]> = [];
  for (const h of [...heads].filter((n) => n >= pr.min && n <= pr.max).sort((a, b) => a - b)) {
    for (const d of [VALUE.drafts.min, VALUE.drafts.start, VALUE.drafts.max]) {
      for (const hr of [VALUE.hourly.min, VALUE.hourly.max]) {
        for (const min of [VALUE.minutes.min, VALUE.minutesPerDraft.value, VALUE.minutes.max]) {
          out.push([h, d, hr, min]);
        }
      }
    }
  }
  return out;
};

(globalThis as unknown as { __RUN_PAGE__: () => Promise<void> }).__RUN_PAGE__ = async () => {
  const results: Array<Record<string, unknown>> = [];

  /* Read once, outside the loop. The three locales are three renderings of one
     offer, so every figure below has to be the same in all three, and reading
     the tier three times would hide a counter that moved mid-run. */
  const tier = headlinePackage();
  const capped = foundingOpen();
  const spotsLeft = remainingFoundingPlaces();
  /* Has the cohort begun to fill? The counter is withheld until it has, so
     that a full cohort does not advertise that nobody has taken a place. */
  const anyPlaceTaken = spotsLeft < OFFER.founding.places;
  const setupWaived = setupDue() === 0;

  for (const locale of ['en', 'da', 'lt'] as Locale[]) {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);

    let crashed: string | null = null;
    try {
      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={[pathFor(locale)]}>
            <LocalePage locale={locale} />
          </MemoryRouter>,
        );
      });
    } catch (err) {
      crashed = err instanceof Error ? err.message : String(err);
    }

    const stepOneText = host.textContent ?? '';
    /* Six questions, across two screens.

       The form asks three and then three, so a count of what is on screen
       would come back three and be confidently wrong about the thing it is
       measuring. This walks the form instead: count the first screen, answer
       it, turn the page, count the second, then put the form back where it was
       found so every measurement below still sees the page a visitor arrives
       at. Labelling is checked on both screens for the same reason: half a
       form whose labels are real proves nothing about the other half.

       The answers used to get past the first screen are read off the contract,
       never written down here, so a change to the routing table cannot leave
       this walking into a dead end it then reports as a missing question. */
    const countQuestions = (): number =>
      host.querySelectorAll('#qualifier input:not([type="radio"])').length +
      host.querySelectorAll('#qualifier [role="radiogroup"]').length;
    const labelsHold = (): boolean =>
      Array.from(host.querySelectorAll<HTMLInputElement>('#qualifier input')).every(
        (el) =>
          Boolean(el.id && host.querySelector(`label[for="${el.id}"]`)) ||
          Boolean(el.closest('label')),
      );
    const tick = (name: string, value: string) =>
      host
        .querySelector<HTMLInputElement>(`#qualifier input[type="radio"][name="${name}"][value="${value}"]`)
        ?.click();

    const stepsShown = host.querySelectorAll('#qualifier .qualifier-step').length;
    const stepOneQuestions = countQuestions();
    const stepOneLabelled = labelsHold();
    /* Which questions each screen actually holds, by the label the reader sees.
       Counting alone would be satisfied by two screens that both showed all
       six, and a split that does not split is the whole thing this is for. */
    const labelsOn = (): string[] =>
      Array.from(host.querySelectorAll('#qualifier .qualifier-field .qualifier-label')).map((el) =>
        (el.textContent ?? '').trim(),
      );
    const stepOneAsks = labelsOn();

    const qualifyingBand = TEAM_SIZES.find((t) => route(t, 'outlook').outcome !== 'too_small');
    await act(async () => {
      tick('team_size', qualifyingBand ?? '');
      tick('email_client', 'outlook');
      tick('role', 'owner_partner');
    });
    await act(async () => {
      host.querySelector<HTMLFormElement>('#qualifier form')?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    const stepTwoText = host.textContent ?? '';
    const stepTwoAsks = labelsOn();
    const stepTwoQuestions = countQuestions();
    const stepTwoLabelled = labelsHold();
    /* The page turn itself. If Continue did nothing the counts above are both
       of the same screen, which would otherwise add up to six and pass. */
    const stepTurned = stepTwoQuestions > 0 && !host.querySelector('#qualifier [role="radiogroup"]');

    await act(async () => {
      host.querySelector<HTMLButtonElement>('#qualifier .qualifier-back')?.click();
    });
    const backWorks = Boolean(host.querySelector('#qualifier [role="radiogroup"]'));

    /* Both screens, joined on a newline so that nothing can match across the
       seam. Every check that reads the page reads this: a string the form
       only shows on its second screen is still a string the page shows, and
       English leaking onto the second screen of /da would otherwise be
       invisible to the one check that exists to catch it. */
    const text = stepOneText + '\n' + stepTwoText;
    const c = content[locale];
    const [firmFee, setupFee] = c.price.fees;

    /* The three ways the page prints a number, copied from <Price /> and
       <Compare /> so an assembled string is assembled exactly the way the
       component assembles it.

       Rebuilt once per locale rather than once per run, which is the whole
       reason they moved in here. A figure is written differently in each of the
       three languages: Danish and Lithuanian write the decimal with a comma,
       and each groups thousands its own way. An expectation built in English
       and compared against a Danish page would fail on every amount with a
       decimal part, and an expectation that did not group at all would pass a
       page that had quietly stopped grouping. Both of those are the check
       lying about the page rather than reading it, so the locale goes in.

       `cell` and `money` are the same amount with and without its unit,
       because that is the distinction <Compare /> draws: a table cell sits
       under a column head that has named the currency once, a claim is a
       sentence that has to carry its own. */
    const cell = (value: number): string => formatMoney(value, c.htmlLang);
    const money = (value: number): string => `${cell(value)} ${OFFER.currency}`;
    const figure = (value: number): string => formatCount(value, c.htmlLang);

    /* Empty or whitespace-only strings anywhere in the locale file. */
    const blankKeys = leaves(c)
      .filter(([k, v]) => v.trim() === '' && !k.startsWith('footer.company') && k !== 'nativeCheck')
      .map(([k]) => k);

    /* Every visible string that should appear in the DOM. Excludes the form
       result screens (not rendered until submit), placeholders and meta.
       Whole strings only: anything with a slot in it for a figure is asserted
       further down, assembled, because half a sentence proves nothing now that
       the other half comes from the offer. */
    const mustAppear = [
      c.hero.title.mark, c.nav.cta,
      c.hero.deal.subject,
      c.demo.title, c.demo.lede, c.demo.pickLead,
      /* The close carries the minutes from value.ts now, so its two halves
         are what reach the DOM; the assembled sentence is asserted below. */
      c.demo.close.before, c.demo.close.after,
      ...c.demo.desks.map((d) => d.tab),
      /* only the first desk's paper is on the page at rest; the other two are
         one click away and are covered by the browser run instead. */
      c.demo.desks[0].letter.from, c.demo.desks[0].letter.subject,
      ...c.demo.desks[0].sources.map((x) => x.label),
      c.who.title, ...c.who.groups.map((g) => g.line),
      /* The signpost for a firm too small for either card. The last one was
         deleted and nothing noticed, because nothing asserted it; a reader who
         is not the buyer still has somewhere to go, and this is the only place
         on the page that says so before the form. */
      c.price.packages.under.before, c.price.packages.under.after,
      /* The accuracy block. Asserted line by line because it is the answer to
         the objection that decides a regulated sale, and a block that quietly
         stopped rendering would look like nothing at all. */
      c.who.accuracy.title, ...c.who.accuracy.items, c.who.accuracy.unmeasured,
      c.numbers.title,
      ...Object.values(c.numbers.inputs).map((i) => i.label), c.numbers.inputs.minutes.note,
      ...Object.values(c.numbers.beats).map((b) => ('label' in b ? b.label : '')).filter(Boolean),
      c.numbers.yearLabel, c.numbers.moreLabel, ...c.numbers.basis.map((b) => b.term),
      c.numbers.note,
      c.price.eyebrow, c.price.title, c.price.feesTitle,
      c.price.termsLabel, c.price.whenTitle,
      /* The fee sheet still has a term and a period per line. What it no longer
         has is a figure: that comes from the offer, and is asserted assembled. */
      ...c.price.fees.map((f) => f.term),
      ...c.price.fees.map((f) => f.per),
      ...c.price.fees.map((f) => f.note),
      /* What the flat fee covers: two firm level ceilings, neither a price. */
      c.price.covers.title, c.price.covers.people.label, c.price.covers.people.note,
      c.price.covers.drafts.label, c.price.covers.drafts.note, c.price.covers.note,
      ...c.price.stops.map((x) => x.day), ...c.price.stops.map((x) => x.note),
      /* Only the selected stop's state line is on the page at rest. */
      c.price.stops[0].state,
      c.price.ctaNote,
      /* The founding block on a capped tier, or the one line that replaces the
         whole trade once the capped tiers are spent. Never both. */
      ...(capped
        ? [
            /* The half of the lede that is true at any count. The other half is a
               claim about this business, gated on the offer, and it is asserted in
               both of its states by harness-claim rather than assumed here.

               `founding.title` is no longer asserted as copy on the page: the
               disclosure it labelled was a second, collapsed telling of the
               block above it and is gone. The string survives as the screen
               reader heading on the places counter. */
            c.price.founding.lede.trade,
            /* The reason, which carries the cohort's size. Asserted on every
               capped tier rather than only where the counter renders: with the
               counter withheld this is the ONLY place the page still states how
               many places the offer is, and a verifier deleted the figure from
               it to a green suite. */
            c.price.founding.reason.before, c.price.founding.reason.after,
            /* The counter's own label goes only where the counter goes. */
            ...(anyPlaceTaken ? [c.price.founding.spots.label] : []),
            c.price.founding.lock,
            c.price.founding.givesTitle, ...c.price.founding.gives,
            c.price.founding.signature.name, c.price.founding.signature.line,
            c.price.founding.note,
          ]
        : [c.price.founding.spotsClosed]),
      /* The two packages, in the open, and what is in both of them. */
      c.price.packages.pick, c.price.packages.lede,
      /* The line for a firm bigger than every package. It was asserted by
         nothing: an independent verifier replaced it with {null} and the whole
         suite stayed green, so it was one careless edit from vanishing in three
         languages. */
      c.price.packages.over,
      ...c.price.packages.rows.map((r) => r.name), ...c.price.packages.rows.map((r) => r.note),
      c.price.included.title, ...c.price.included.items,
      c.form.title, c.form.lead, c.form.companyLabel, c.form.emailLabel,
      c.form.teamSizeLabel, c.form.emailClientLabel, c.form.roleLabel, c.form.submit,
      c.footer.tagline, c.footer.privacyLink, c.footer.officeLabel,
    ];
    const missing = mustAppear.filter((s) => !text.includes(s));

    /* The lines where the copy and the offer meet. Each one is the content
       fragments and the offer's own figure, concatenated in the order the
       component lays them out, so it can only be satisfied if the figure
       actually reached the slot the sentence left for it. This is what a
       half-finished migration breaks: the words arrive and the number does
       not, or the number arrives somewhere else on the band. */
    const assembled: Array<[string, string]> = [
      /* The headline. It grew a slot when it started promising an outcome
         rather than describing a mechanism, and the hour in that slot is the
         whole promise: forty replies drafted, by then. A headline that lost it
         would still read as a sentence, which is why presence of the words is
         not enough on its own. */
      [
        'the headline, with the hour the work is finished by',
        c.hero.title.before + c.hero.title.mark + c.hero.title.mid + c.hero.clockOut +
          c.hero.title.after,
      ],
      ['the flat firm fee, on the fee sheet', firmFee.term + money(tier.price) + firmFee.per],
      ['the setup fee, on the fee sheet', setupFee.term + money(OFFER.setupFee)],
      ['people covered by the fee', c.price.covers.people.label + figure(tier.covers)],
      ['the pooled draft cap', c.price.covers.drafts.label + figure(tier.draftCap)],
      /* The guarantee, with the count the offer holds itself to. It is the
         one line on the band that outlives the trial, and a sentence reading
         "fewer than , that month is free" would ship in three languages
         without a single check noticing. */
      [
        'the guarantee, with the drafts it promises',
        c.price.guarantee.before + figure(OFFER.guaranteeDrafts) + c.price.guarantee.after,
      ],
      /* The plan with no row. Everything else in this section is arithmetic
         the table or a claim would give away if it went missing, and this is
         the one figure in it with nothing behind it: a published rate dropped
         into a sentence. Nothing else on the page would move if it arrived
         blank, so a sentence reading "One seat costs  a month" would ship in
         three languages without a single check noticing. */
      /* The hero's one flat figure. Arithmetic on a stated volume and a
         stated assumption, read from value.ts; a hero that lost it would
         still read as a sentence, which is why the words alone prove
         nothing. It carried the break even hourly cost until 2026-09-19,
         when it became the hours themselves: the division produced a figure
         below every legal wage in these markets, so the sentence it made was
         a condition that could not fail. */
      [
        'the hero line, with the hours handed back',
        c.hero.payback.before +
          figure(headlinePackage().covers) +
          c.hero.payback.mid +
          figure(heroHoursBack() ?? NaN) +
          c.hero.payback.after,
      ],
      /* Each package card: its name and then its fee, the way the card lays
         them out. Two cards, both read from the offer by id. */
      ...packages().map((p): [string, string] => [
        `the ${p.id} card, with its fee`,
        (c.price.packages.rows.find((r) => r.id === p.id)?.name ?? '') + money(p.price) + firmFee.per,
      ]),
      ...packages().map((p): [string, string] => [
        `the ${p.id} card, with its coverage and pooled drafts`,
        c.price.packages.peopleLabel + ' ' + figure(p.covers) +
          c.price.packages.draftsLabel + ' ' + figure(p.draftCap),
      ]),
      /* The one measured figure, assembled, wherever the accuracy block puts
         it. This line was deleted once and nothing noticed, because nothing
         asserted it; it is asserted now. */
      [
        'the accuracy block saying what share of mail gets a draft',
        c.who.accuracy.share.before + figure(oneEmailIn()) + c.who.accuracy.share.after,
      ],
      /* The reason beside the price, with the cohort's size in it. */
      ...(capped && anyPlaceTaken
        ? ([[
            'the reason the price is low, with the number of places',
            c.price.founding.reason.before + figure(OFFER.founding.places) + c.price.founding.reason.after,
          ]] as Array<[string, string]>)
        : []),
      /* The worked example's close, with the minutes it says nobody spent.
         The figure was typed into the sentence as a word until 2026-09-19,
         and it disagreed with the assumption every other figure on the page
         was computed from: the demo said nine minutes, value.ts said five.
         Asserted assembled so the two cannot drift apart again in silence. */
      [
        'the worked example, with the minutes nobody spent',
        c.demo.close.before + figure(VALUE.minutesFromScratch.value) + c.demo.close.after,
      ],
      /* The measured share, which no longer multiplies anything on this panel
         and is a hint under the control instead. Still assembled from value.ts
         and not from the copy, so the hint cannot drift from the measurement. */
      [
        'the measured draft share, as the hint under the drafts control',
        c.numbers.inputs.drafts.note.before + formatShare(draftRatePercent(), c.htmlLang) + c.numbers.inputs.drafts.note.after,
      ],
      /* The counter only exists once the cohort has begun to fill. Gated
         separately from the line below it, which is true of any capped tier
         whether or not a place has gone. */
      ...(capped && anyPlaceTaken
        ? ([
            [
              'the spots counter',
              c.price.founding.spots.label + figure(spotsLeft ?? 0) +
                c.price.founding.spots.of + figure(OFFER.founding.places),
            ],
          ] as Array<[string, string]>)
        : []),
      /* Said out loud only where the tier really waives the fee. A struck out
         figure is a picture, and this is the sentence that carries it in words
         for anyone who is not looking at it. */
      ...(capped && setupWaived && setupFee.waived
        ? ([
            [
              'the waiver, said out loud with its amount',
              setupFee.waived.say.before + money(OFFER.setupFee) + setupFee.waived.say.after,
            ],
          ] as Array<[string, string]>)
        : []),
    ];
    const unassembled = assembled.filter(([, s]) => !text.includes(s)).map(([label]) => label);

    /* The calculator, driven rather than trusted.

       Four range inputs. Each is set through the native setter so React sees
       the change, and at every point on the grid the five figures on the panel
       are read back and set against what value.ts computes. The expectation is
       asked of the helpers rather than worked out again here: a check that
       redoes the arithmetic is a second implementation that would agree with a
       wrong first one. */
    const rangeOf = (name: string): HTMLInputElement | null =>
      host.querySelector<HTMLInputElement>(`#numbers input[type="range"][name="${name}"]`);
    const ranges = {
      people: rangeOf('people'),
      drafts: rangeOf('drafts'),
      hourly: rangeOf('hourly'),
      minutes: rangeOf('minutes'),
    };
    const calcFound = Object.values(ranges).every(Boolean);
    const bounds = (el: HTMLInputElement | null): string =>
      el ? `${el.min}-${el.max}/${el.step}` : 'missing';
    const pr = peopleRange();
    const wantBounds = {
      people: `${pr.min}-${pr.max}/${pr.step}`,
      drafts: `${VALUE.drafts.min}-${VALUE.drafts.max}/${VALUE.drafts.step}`,
      hourly: `${VALUE.hourly.min}-${VALUE.hourly.max}/${VALUE.hourly.step}`,
      minutes: `${VALUE.minutes.min}-${VALUE.minutes.max}/${VALUE.minutes.step}`,
    };
    const badBounds = (Object.keys(ranges) as Array<keyof typeof ranges>)
      .filter((k) => bounds(ranges[k]) !== wantBounds[k])
      .map((k) => `${k}: ${bounds(ranges[k])}, value.ts says ${wantBounds[k]}`);
    /* Where each control opens, against where the model says it should. The
       hourly one is the market's, not a constant. */
    const opensAt = {
      people: Number(ranges.people?.value),
      drafts: Number(ranges.drafts?.value),
      hourly: Number(ranges.hourly?.value),
      minutes: Number(ranges.minutes?.value),
    };
    const wantOpen = {
      people: pr.start,
      drafts: VALUE.drafts.start,
      hourly: hourlyStart(c.htmlLang),
      minutes: VALUE.minutesPerDraft.value,
    };
    const badOpen = (Object.keys(opensAt) as Array<keyof typeof opensAt>)
      .filter((k) => opensAt[k] !== wantOpen[k])
      .map((k) => `${k} opens at ${opensAt[k]}, value.ts says ${wantOpen[k]}`);

    const readBeat = (sel: string): string =>
      (host.querySelector(`#numbers [${sel}] .numbers-amt, #numbers [${sel}] .numbers-keep`)?.childNodes[0]
        ? Array.from(host.querySelector(`#numbers [${sel}] .numbers-amt, #numbers [${sel}] .numbers-keep`)!.childNodes)
            .filter((n) => !(n instanceof Element && n.classList.contains('numbers-year')))
            .map((n) => n.textContent ?? '')
            .join('')
        : ''
      ).trim();
    const drive = async (h: number, d: number, hr: number, min: number) => {
      await act(async () => {
        for (const [el, v] of [
          [ranges.people, h], [ranges.drafts, d], [ranges.hourly, hr], [ranges.minutes, min],
        ] as Array<[HTMLInputElement | null, number]>) {
          if (!el) continue;
          setNativeValue(el, String(v));
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    };
    const badPoints: string[] = [];
    let pointsDriven = 0;
    let unhedged: string[] = [];
    let barBad: string[] = [];
    if (calcFound) {
      for (const [h, d, hr, min] of drivePoints()) {
        await drive(h, d, hr, min);
        pointsDriven += 1;
        const pkg = packageFor(h);
        const want = {
          hours: hoursFromDrafts(d, min),
          worth: worthFromDrafts(d, min, hr),
          fee: pkg?.price ?? null,
          keep: keptFromDrafts(h, d, min, hr),
        };
        /* Modelled amounts print to the whole unit: a figure hedged with
           "about" and printed to the cent would be contradicting itself. */
        const wantText = {
          hours: want.hours === null ? '' : c.numbers.about + figure(want.hours) + c.numbers.units.hours,
          worth: want.worth === null ? '' : c.numbers.about + money(Math.round(want.worth)),
          fee: want.fee === null ? '' : money(want.fee),
          keep: want.keep === null ? '' : c.numbers.about + money(Math.round(want.keep)),
        };
        const got = {
          hours: readBeat('data-n-hours'),
          worth: readBeat('data-n-worth'),
          fee: readBeat('data-n-fee'),
          keep: readBeat('data-n-keep'),
        };
        for (const k of Object.keys(got) as Array<keyof typeof got>) {
          if (got[k] !== wantText[k]) {
            badPoints.push(`${h}p/${d}d/${hr}h/${min}m ${k}: "${got[k]}" against "${wantText[k]}"`);
          }
        }
        /* The fee row names the package the head count lands on. */
        const feeTerm = (host.querySelector('#numbers [data-n-fee] .numbers-term')?.textContent ?? '').trim();
        const wantName = pkg ? (c.price.packages.rows.find((r) => r.id === pkg.id)?.name ?? '') : '';
        const wantTerm = c.numbers.beats.fee.before + wantName + c.numbers.beats.fee.after;
        if (feeTerm !== wantTerm) {
          badPoints.push(`${h}p fee row reads "${feeTerm}", the offer puts them on "${wantTerm}"`);
        }
        /* The hedge is on the model and not on the fee. */
        const hedged = (sel: string) => Boolean(host.querySelector(`#numbers [${sel}] .numbers-about`));
        unhedged = [
          ...(['data-n-hours', 'data-n-worth', 'data-n-keep'].filter((sel) => !hedged(sel))),
          ...(hedged('data-n-fee') ? ['data-n-fee is hedged'] : []),
        ];
        /* The bar is the fee's share of what the hours cost, capped at all of it. */
        const barEl = host.querySelector<HTMLElement>('#numbers [data-n-bar]');
        const wantBar =
          want.worth === null || want.worth <= 0 || want.fee === null
            ? ''
            : `${(Math.min(1, want.fee / want.worth) * 100).toFixed(1)}%`;
        /* Compared as numbers: the DOM writes "100.0%" back as "100%", and
           that is a serialisation, not a different width. */
        const gotBar = barEl?.style.width ?? '';
        const same =
          gotBar === wantBar ||
          (gotBar !== '' && wantBar !== '' && Math.abs(parseFloat(gotBar) - parseFloat(wantBar)) < 0.05);
        if (!same) barBad.push(`${h}p/${d}d/${hr}h/${min}m bar ${gotBar || 'missing'} against ${wantBar || 'nothing'}`);
        /* Where the sum comes out under, the page says so instead of a year line. */
        const under = Boolean(host.querySelector('#numbers [data-n-under]'));
        const year = Boolean(host.querySelector('#numbers [data-n-year]'));
        const wantUnder = want.keep !== null && want.keep < 0;
        if (under !== wantUnder || year === wantUnder) {
          badPoints.push(`${h}p/${d}d/${hr}h/${min}m under=${under} year=${year}, model says under=${wantUnder}`);
        }
      }
      /* Put the controls back where a visitor finds them. */
      await drive(wantOpen.people, wantOpen.drafts, wantOpen.hourly, wantOpen.minutes);
    }

    /* The package cards: one per package, the lit one the offer leads with,
       and pressing the other moves the total under the timeline to its fee. */
    const cards = Array.from(host.querySelectorAll<HTMLButtonElement>('#price [data-price-pkg]'));
    const cardIds = cards.map((b) => b.dataset.pricePkg ?? '');
    const litAtRest = cards.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.pricePkg);
    const totalText = () =>
      (host.querySelector('#price [data-price-strike] .price-total-num')?.textContent ?? '').trim();
    const totalAtRest = totalText();
    const cardDrives: string[] = [];
    for (const b of cards) {
      await act(async () => b.click());
      const id = b.dataset.pricePkg as PackageId;
      const p = OFFER.order.includes(id) ? packageById(id) : null;
      const want = p ? money(p.price) : '';
      if (totalText() !== want) cardDrives.push(`${id}: total reads "${totalText()}", offer says "${want}"`);
    }
    for (const b of cards) if (b.dataset.pricePkg === tier.id) await act(async () => b.click());

    /* Nothing from the model this page replaced, anywhere it rendered except
       the comparison.

       Two of the numerals scanned for stopped being ours. The model this page
       used to sell was the product site's Managed plan, priced by the seat from
       ten seats up, so this page's old flat monthly for ten and its old per
       seat rate are that plan's published figures. Managed is now a row in the
       comparison, cited at exactly those rates, and a scan that knows only the
       digits cannot tell a citation from a relapse.

       Excluding that one section loses nothing. It is the most heavily asserted
       part of the page: every cell is checked against the offer's own
       arithmetic, every figure inside a claim has to be one the offer can
       produce, and the plan that must never return to the table has two checks
       of its own. A stale price could not hide there. Everywhere else the
       numerals still catch a misprice in all three locales, which is what they
       were added for.

       Subtracted as text rather than pruned from the DOM because `text` is both
       screens of the form joined, and the comparison appears in each.

       A little of the surrounding text rides along with each hit, because the
       numeral being on the page is only half of what a reader of the failure
       needs. */
    const outside = text;
    const stale = STALE.flatMap(({ label, re }) => {
      const m = re.exec(outside);
      if (!m) return [];
      const at = Math.max(0, (m.index ?? 0) - 40);
      return [`${label} -> ...${outside.slice(at, (m.index ?? 0) + 40).replace(/\s+/g, ' ')}...`];
    });

    /* English master strings that must NOT appear on /da or /lt. Compared only
       where the two locales genuinely differ, because a good deal of what is on
       this page is the same string in all three and none of it is a leak.

       Three kinds of shared token. Names somebody else owns: "Outlook",
       "Gmail", "doviloop.dev", and the plan names "Individual" and "Team",
       which stay in English in all three files because that is what a reader
       will be looking at when they open the product site. Marks and dates. And
       every amount on the page, which is now the largest group of the three:
       since the flat fee landed, not one price lives in a locale file, so
       "390 USD" and "8000" and "2026-09-16" are identical across the three
       renderings by construction rather than by coincidence. None of them is a
       word, so none of them belongs in the list below; the list is master copy,
       and the filter drops anything the target locale happens to share. */
    const en = content.en;
    const englishOnly = [
      en.hero.title.mark, en.nav.cta, en.demo.title, en.demo.pickLead,
      en.numbers.title, en.who.title, en.price.title, en.form.title, en.form.submit,
      en.price.feesTitle, en.price.covers.title, en.price.whenTitle,
      en.price.packages.pick, en.price.included.title, ...en.price.included.items,
      en.numbers.beats.keep.label, en.numbers.beats.fee.before,
      en.numbers.inputs.people.label, en.numbers.inputs.hourly.label, en.numbers.under,
      en.hero.payback.before,
      ...en.demo.desks.map((d) => d.tab),
      ...en.demo.desks[0].sources.map((x) => x.label),
      ...en.who.groups.map((g) => g.line),
      en.footer.tagline,
    ].filter((s) => !leaves(c).some(([, v]) => v === s));
    const leaked = locale === 'en' ? [] : englishOnly.filter((s) => text.includes(s));

    results.push({
      locale,
      crashed,
      htmlLang: document.documentElement.lang,
      title: document.title,
      description: document.head.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
      canonical: document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
      hreflangs: Array.from(document.head.querySelectorAll('link[rel="alternate"]')).map((l) => l.getAttribute('hreflang')),
      sectionsExpected: SECTION_IDS,
      sectionsFound: SECTION_IDS.filter((id) => host.querySelector(`#${id}`)),
      /* Presence is not enough for the newest section. "compare" reads as the
         second half of the terms and has to arrive after the price and before
         anyone is asked for an email address, so the order is measured too.
         querySelectorAll returns document order, which is the whole point. */
      sectionOrder: Array.from(
        host.querySelectorAll(SECTION_IDS.map((id) => `#${id}`).join(',')),
      ).map((el) => el.id),
      /* The skip link belongs to the hero now, because it is positioned
         against it, and it skips the masthead rather than the whole page. */
      hasSkipLink: Boolean(host.querySelector('#hero a[href="#hero-content"]')),
      hasMainLandmark: Boolean(host.querySelector('main#main')),
      hasFooter: Boolean(host.querySelector('footer')),
      /* The three desks of the worked example, and the tablist that changes
         them. This replaced the reserved 16:9 video box, which never got a
         video. */
      deskCount: host.querySelectorAll('#demo [role="tab"]').length,
      /* The timeline under the terms. Three stops, the last of which strikes
         the monthly total out, which is the risk reversal made visible. */
      stopCount: host.querySelectorAll('#price [data-price-stop]').length,
      stopsInContent: c.price.stops.length,
      /* The page asks for exactly one thing, so it has to ask for it in one
         set of words. These four controls, the folder tab, the hero button,
         the standing bar and the button under the price, all point at #fit and
         all used to carry their own wording. One of the four said a call was
         being booked, which is not what happens: six questions happen. They
         now read a single key, and this is the check that keeps them there.
         A literal typed back into any one component shows up here as a second
         distinct label rather than as nothing at all. */
      fitCtaLabels: Array.from(
        host.querySelectorAll('a[href="#fit"]:not(.hero-nav a)'),
      ).map((a) => (a.textContent ?? '').trim()),
      /* The masthead's own section link also points at #fit and is excluded
         above. It is a table of contents entry sitting between "Example" and
         "What it costs", not an ask, and holding it to the button wording
         would put a sentence in a list of one-word labels. Counted here so
         that the exclusion is a measurement rather than an assumption: if the
         masthead ever stops carrying it, this reads 0 and says so. */
      fitNavLinks: host.querySelectorAll('.hero-nav a[href="#fit"]').length,
      fitCtaInContent: c.nav.cta,
      /* The founding trade, and the counter that makes it a fact rather than a
         countdown. Rendered where the tier still has places to count AND at
         least one has gone: a counter reading its own maximum says only that
         nobody has bought, which is an argument against the offer it sits in. */
      /* The audiences, in the two places the page enumerates them.

         Read off the CONTENT rather than the DOM, because the DOM order is
         the content order (both components map in array order, and no CSS
         reorders either list), and because reading it here catches a locale
         whose folders drifted even if that locale's markup is fine. Paired on
         the id the two lists now share; before they shared one, a verifier
         swapped two folders in a single locale and the whole suite stayed
         green. */
      audienceOrder: c.who.groups.map((g) => g.id).join(','),
      /* Distinctness, because a union type does not give exhaustiveness: the
         same id twice in both lists compares equal and silently drops a trade
         from the page. */
      audienceIdsDistinct: new Set(c.who.groups.map((g) => g.id)).size === 3,
      deskIdsDistinct: new Set(c.demo.desks.map((d) => d.id)).size === 3,
      deskOrder: c.demo.desks.map((d) => d.id).join(','),
      tierOnShow: tier.id,
      tierIsCapped: capped,
      anyPlaceTaken,
      hasSpotsCounter: Boolean(
        host.querySelector('#price dl[aria-labelledby="price-founding-h"] .price-fig'),
      ),
      /* Every control is labelled, by a label[for] on the three text fields and
         by the label that wraps each radio. Both are real label elements; an
         aria-label would not count here on purpose. Measured on both screens
         by the walk above. */
      labelledControls: stepOneLabelled && stepTwoLabelled,
      /* Five questions: three chosen from radio groups, then two written.
         It was six until 2026-09-19, when the phone field went (T23): the
         spec was changed and the n8n validator updated to accept an empty
         string, so the page stopped asking for a number it does not need. */
      questionCount: stepOneQuestions + stepTwoQuestions,
      stepsShown,
      stepTurned,
      backWorks,
      /* The three closed questions first, the contact details second, and
         neither screen carrying any of the other's. */
      stepOneAsks,
      stepTwoAsks,
      stepOneIsTheQuestions:
        stepOneAsks.join('|') ===
        [c.form.teamSizeLabel, c.form.emailClientLabel, c.form.roleLabel].join('|'),
      stepTwoIsTheDetails:
        stepTwoAsks.join('|') === [c.form.companyLabel, c.form.emailLabel].join('|'),
      blankKeys,
      missing,
      unassembled,
      /* The hero card quotes the draft the worked example goes on to show in
         full. Asserted against the copy rather than the DOM on purpose: the
         demo renders that letter behind a desk picker, so the two strings can
         be held to each other here without driving the picker, and an excerpt
         that stopped being an excerpt is a defect in the content whether or
         not the section it belongs to happens to be on screen. */
      previewIsExcerpt: c.hero.draft.body.includes(c.hero.deal.preview),
      /* The draft card itself, read out of the DOM.
         `previewIsExcerpt` compares one content string to another and never
         looks at the page, so an independent verifier replaced the entire card
         with {null} and got a clean build, a green suite and both browser
         gates green. The hero's argument is that a drafted reply is already
         waiting; with no card the hero merely asserts it. */
      heroCardText: (host.querySelector('#hero .hero-deal')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      heroCardWants: [c.hero.deal.draftLabel, c.hero.deal.subject, c.hero.deal.preview],
      /* Words are not a signpost. This one has to be pressable and it has to
         go to the product site. */
      /* Every copy of the mark actually draws something.
         The three copies were hand-duplicated, so correcting the shape left
         two of them drawing the old one; and when they were wired to one
         definition, a broken substitution put a placeholder in it and the
         mark rendered as nothing at all, to a green suite of 435 checks.
         A logo that is not on the page is not a small defect. */
      markPaths: Array.from(host.querySelectorAll('#hero .hero-brand svg path, #demo .demo-emboss path'))
        .map((n) => (n.getAttribute('d') ?? '').trim()),
      underLinkHref: host.querySelector('#price .price-pkgs-under a')?.getAttribute('href') ?? '',
      underLinkText: (host.querySelector('#price .price-pkgs-under a')?.textContent ?? '').trim(),
      /* The calculator's rows, in the order they are read down. Nothing pinned
         the SET of rows once `numbers.beats` became a named record, so a sixth
         row could be added straight into the component, in untranslated
         English on two locales, to a green suite. Proved by doing it. */
      ledgerTerms: Array.from(host.querySelectorAll('#numbers .numbers-beat .numbers-term'))
        .map((n) => (n.textContent ?? '').replace(/\s+/g, ' ').trim()),
      /* The fee row carries the package name, which moves with the head count,
         so it is matched by its two fixed halves rather than whole. */
      ledgerWants: [
        c.numbers.beats.hours.label,
        c.numbers.beats.worth.label,
        c.numbers.beats.fee.before,
        c.numbers.beats.keep.label,
      ],
      /* The calculator, driven across the grid. */
      calcFound,
      badBounds,
      badOpen,
      pointsDriven,
      badPoints,
      unhedged,
      barBad,
      /* The package cards. */
      cardIds,
      wantCardIds: [...OFFER.order],
      litAtRest,
      totalAtRest,
      wantTotalAtRest: money(tier.price),
      cardDrives,
      stale,
      leaked,
      charCount: text.length,
    });

    await act(async () => {
      root.unmount();
    });
    host.remove();
  }

  (globalThis as unknown as { __PAGE_RESULTS__: unknown }).__PAGE_RESULTS__ = results;
};
