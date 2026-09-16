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
 * The ledger in the numbers section is measured the same way, and for a worse
 * reason: it is the one section that has already shipped with its figures
 * missing. Two of its three rows are arithmetic on the offer and the third is
 * the assumption the other two are computed from, so the numerals are read back
 * out of the DOM and set against what `modelledMultiple` and
 * `modelledMultiple` returns. Nothing about the ledger is asserted from the
 * words beside it, because the words were all still correct on the day the
 * figures went blank.
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
  activeTier,
  belowManagedFloor,
  belowTeamCeiling,
  comparison,
  isCapped,
  modelledMultiple,
  remainingSpots,
  setupDue,
  formatCount,
  formatMoney,
  managedFloorMonthly,
  teamCeilingMonthly,
} from '../src/lib/offer';

/* The page after the port and after the flat fee landed: hero, the worked
   example, who it is for, what it is worth, what it costs, what each person
   costs, the fit check. "how" and "objections" are gone, the first because the
   worked example shows what it described and the second because the objections
   are answered where they arise. "compare" is the newest of them and sits
   between the terms and the form on purpose: it is the second half of the
   terms, read before anybody is asked for an email address. The order below is
   the document order the page is asserted to have, not just a set of ids. */
const SECTION_IDS = ['hero', 'demo', 'who', 'numbers', 'price', 'compare', 'qualifier'];

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

/** The head count out of a size cell, "People: 15" and its two translations. */
const sizeOf = (el: Element | null): number =>
  Number((el?.textContent ?? '').replace(/\D+/g, ''));

/* The firm the ledger models, in people.

   <Numbers /> holds this as MODEL_FIRM and does not export it, so it is
   restated here rather than imported. It is not a price and it is not a figure
   the page prints: it is the smallest firm this is sold to, which is the count
   the qualifier's first qualifying band opens at. Everything derived from it
   below still comes out of src/lib/offer.ts, and `smallestSoldTo` ties the
   restated constant to the contract so the two cannot drift apart in silence,
   which is the only way a mirrored constant is safe to keep. */
const MODEL_FIRM = 10;

/* The smallest head count the qualifier will take a lead from, read off the
   contract rather than written down: the first band in TEAM_SIZES that routes
   to anything other than too_small, taken at its lower bound. */
const smallestSoldTo = (): number => {
  for (const size of TEAM_SIZES) {
    if (route(size, 'outlook').outcome !== 'too_small') return Number(size.replace(/\D.*$/, ''));
  }
  return 0;
};

(globalThis as unknown as { __RUN_PAGE__: () => Promise<void> }).__RUN_PAGE__ = async () => {
  const results: Array<Record<string, unknown>> = [];

  /* Read once, outside the loop. The three locales are three renderings of one
     offer, so every figure below has to be the same in all three, and reading
     the tier three times would hide a counter that moved mid-run. */
  const tier = activeTier();
  const capped = isCapped(tier);
  const spotsLeft = remainingSpots(tier);
  const setupWaived = tier.setupWaived && setupDue(tier) === 0;

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
    const tierName = c.price.tierNames[tier.id];

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
      c.hero.title.mark, c.hero.deck, c.hero.cta, c.hero.dateline,
      c.hero.deal.subject,
      c.demo.title, c.demo.lede, c.demo.pickLead, c.demo.close,
      ...c.demo.desks.map((d) => d.tab),
      /* only the first desk's paper is on the page at rest; the other two are
         one click away and are covered by the browser run instead. */
      c.demo.desks[0].letter.from, c.demo.desks[0].letter.subject,
      ...c.demo.desks[0].sources.map((x) => x.label),
      c.who.title, ...c.who.groups.map((g) => g.line), c.who.notes.seats.mark,
      c.numbers.title, c.numbers.lede.mark, ...c.numbers.rows.map((r) => r.label),
      c.price.eyebrow, c.price.title, c.price.feesTitle, c.price.freeTitle,
      c.price.freeNote, c.price.termsLabel, c.price.whenTitle,
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
      c.price.total.term, c.price.total.per,
      c.price.askEyebrow, c.price.cta, c.price.ctaNote,
      /* The founding block on a capped tier, or the one line that replaces the
         whole trade once the capped tiers are spent. Never both. */
      ...(capped
        ? [
            c.price.founding.title,
            /* The half of the lede that is true at any count. The other half is a
               claim about this business, gated on the offer, and it is asserted in
               both of its states by harness-claim rather than assumed here. */
            c.price.founding.lede.trade, c.price.founding.spots.label,
            c.price.founding.givesTitle, ...c.price.founding.gives,
            c.price.founding.getsTitle, c.price.founding.note,
            ...(setupWaived ? [c.price.founding.gets.setup] : []),
          ]
        : [c.price.founding.spotsClosed]),
      /* The sum per head. The table's own figures are arithmetic and are
         checked against the offer below; these are the words around them. */
      c.compare.eyebrow, c.compare.title, c.compare.lede,
      c.compare.planLabel, c.compare.perHeadLabel, c.compare.firmLabel,
      c.compare.ourPlan, c.compare.ourSize.label,
      /* One reference plan, because the table now holds firm level plans only.
         Individual is named in prose under the table, and its sentence has a
         figure in it, so it is asserted assembled rather than listed here. */
      c.compare.teamPlan, c.compare.teamSize.label,
      c.compare.managedPlan, c.compare.managedSize.label, c.compare.individualPlan,
      c.compare.claimsTitle, c.compare.sourceNote.link,
      c.form.title, c.form.lead, c.form.companyLabel, c.form.emailLabel, c.form.phoneLabel,
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
      ['people covered by the fee', c.price.covers.people.label + figure(OFFER.covers)],
      ['the pooled draft cap', c.price.covers.drafts.label + figure(OFFER.draftCap)],
      [
        'the monthly total under the timeline',
        c.price.total.term + c.price.total.sub.label + ' ' + figure(OFFER.covers) + money(tier.price),
      ],
      /* The plan with no row. Everything else in this section is arithmetic
         the table or a claim would give away if it went missing, and this is
         the one figure in it with nothing behind it: a published rate dropped
         into a sentence. Nothing else on the page would move if it arrived
         blank, so a sentence reading "One seat costs  a month" would ship in
         three languages without a single check noticing. */
      [
        'the Individual note, with the seat rate it publishes',
        c.compare.individualNote.before + money(OFFER.compare.individual) +
          c.compare.individualNote.after,
      ],
      [
        'the source note, with the date the rival rates were read',
        c.compare.sourceNote.before + c.compare.sourceNote.link + c.compare.sourceNote.mid +
          OFFER.compare.readAt + c.compare.sourceNote.after,
      ],
      ...(capped
        ? ([
            [
              'the founding eyebrow, naming the tier on show',
              c.price.founding.eyebrow.before + tierName + c.price.founding.eyebrow.after,
            ],
            [
              'the spots counter',
              c.price.founding.spots.label + figure(spotsLeft ?? 0) +
                c.price.founding.spots.of + figure(tier.total ?? 0),
            ],
            [
              'what the trade gives back, naming the tier on show',
              c.price.founding.gets.fee.before + tierName + c.price.founding.gets.fee.after,
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

    /* The ledger, read back out of the DOM rather than trusted.

       This is the section that already shipped blank. When the content contract
       moved the multiple off a written amount, the component
       went on printing the amount that was no longer there, and the page read
       "about  x" and "about  days" in all three locales for two commits. Every
       suite passed throughout, because the labels were still on the page and a
       label is a word.

       So the numerals are measured here, one row at a time. The saving is read
       back out of the copy exactly the way <Numbers /> reads it, because it is
       the assumption the other two figures are computed from rather than a
       price of ours, and the two computed figures are asked of the offer's own
       helpers instead of being worked out again in this file. Redoing the
       arithmetic here would produce a check that agrees with a wrong
       implementation, which is the circular test the offer guard already had to
       be rescued from. */
    const saving = Number.parseFloat(
      c.numbers.rows.find((r) => r.key === 'saving')?.amount ?? '',
    );
    const wantMultiple = modelledMultiple(saving, MODEL_FIRM, tier);
    /* Two of these are counts and one is an amount, which is the split
       <Numbers /> makes and the reason the saving is asked of the parsed number
       rather than handed back out of the copy: the component prints what it
       computed from, so an expectation built from the raw string would agree
       with a component that had stopped doing that. */
    const wantFigure = (key: string, amount?: string): string => {
      if (key === 'multiple') return wantMultiple === null ? '' : figure(wantMultiple);
      return saving > 0 && amount ? cell(saving) : '';
    };

    const ledger = Array.from(host.querySelectorAll('#numbers .numbers-slip')).map((li, i) => {
      const row = c.numbers.rows[i];
      const want = row ? wantFigure(row.key, row.amount).trim() : '';
      return {
        key: row ? row.key : `row ${i + 1}`,
        amount: (li.querySelector('.numbers-amt')?.textContent ?? '').trim(),
        unit: (li.querySelector('.numbers-unit')?.textContent ?? '').trim(),
        /* The whole hedged line as one string, so a figure that reaches the
           page but lands outside the sentence it belongs to still fails. */
        line: li.querySelector('.numbers-fig')?.textContent ?? '',
        want,
        wantLine: row ? c.numbers.about + want + row.unit : '',
      };
    });

    /* The failure that shipped, kept as a check of its own. It cannot be folded
       into the comparison below, because a saving that stops parsing takes the
       expectation blank at the same moment it takes the page blank, and a check
       that only compared the two would pass on exactly the regression it exists
       to catch. */
    const ledgerBlank = ledger.filter((r) => r.amount === '').map((r) => r.key);
    const ledgerBad = ledger
      .filter((r) => r.amount !== '' && (r.amount !== r.want || r.line !== r.wantLine))
      .map((r) => `${r.key}: "${r.line}", offer says "${r.wantLine}"`);

    /* The comparison table, read back out of the DOM rather than trusted. Each
       of our rows carries the head count it is arguing about, so the arithmetic
       can be redone here from the offer and set against what the cell printed.
       A row whose per head figure does not equal `comparison(n).perPerson` is a
       page doing its own division. */
    const ourRowEls = Array.from(host.querySelectorAll('#compare .cmp-row-ours'));
    const ourRows = ourRowEls.map((row) => {
      const size = sizeOf(row.querySelector('.cmp-plan-size'));
      const cells = Array.from(row.querySelectorAll('.cmp-num')).map((td) => td.textContent ?? '');
      const want = comparison(size, tier);
      return {
        size,
        perHead: cells[0] ?? '',
        firm: cells[1] ?? '',
        wantPerHead: want.perPerson === null ? null : cell(want.perPerson),
        wantFirm: cell(want.monthly),
        covered: want.covered,
      };
    });
    const badRows = ourRows
      .filter((r) => r.perHead !== r.wantPerHead || r.firm !== r.wantFirm)
      .map((r) => `${r.size}: ${r.perHead}/${r.firm}, offer says ${r.wantPerHead}/${r.wantFirm}`);
    /* No per head figure outside coverage. A firm the flat fee does not cover
       would get the most flattering number on the page out of a division the
       offer has refused to honour. */
    const uncoveredRows = ourRows.filter((r) => !r.covered).map((r) => String(r.size));

    /* The one reference row is somebody else's published rate, printed as it is
       read. Team is the only plan in the table that is not ours, because it is
       the only other plan a firm can buy for the whole firm, and both of its
       cells are a firm's figures: the seat rate it sells at, and what the
       largest firm it will take pays every month.

       How many such rows there should be is derived rather than written down.
       The offer can put exactly these two figures in a reference row, and the
       table gives every row one figure per numeric column, so the rows to
       expect is those cells over the columns the table has. Add a row for a
       plan the offer has no reference cells for and the arithmetic stops
       agreeing, which is the same failure as printing the wrong rate. */
    const numCols = host.querySelectorAll('#compare .cmp-table thead .cmp-col-num').length;
    const refCells = Array.from(host.querySelectorAll('#compare .cmp-row-ref .cmp-num')).map(
      (td) => td.textContent ?? '',
    );
    const wantRefCells = [
      cell(OFFER.compare.team), cell(teamCeilingMonthly()),
      cell(OFFER.compare.managed), cell(managedFloorMonthly()),
    ];
    const wantRefRowCount = numCols > 0 ? wantRefCells.length / numCols : 0;
    const badRefCells =
      refCells.length === wantRefCells.length && refCells.every((v, i) => v === wantRefCells[i])
        ? []
        : [`${refCells.join(',')} against ${wantRefCells.join(',')}`];

    /* The comparison this section was rebuilt to stop making, measured as an
       absence.

       Individual is a plan for one person, bought a seat at a time, so its seat
       rate is not a firm's cost a head and cannot be read down the same column
       as one. Printed there it was set against our per head figure, and at the
       ten person floor this page advertises that is the one comparison this
       offer loses: the flat fee only falls past that seat rate well above it.
       The plan therefore has no row, and these are the two measurements that
       fail if somebody gives it one again.

       The first is the row by name, which catches the obvious way back. The
       second is the shape of the mistake rather than its wording, and catches a
       row that reaches the same reading under another name or none: our cost a
       head and that seat rate printed as two cells of one row is a comparison
       to any reader, whatever the row is called. Both the figure the page
       printed and the figure the offer would have produced count as ours, so a
       row that pairs the rate with a per head cell still fails while the cell
       itself is being reported wrong elsewhere. */
    const rowText = (el: Element): string => (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    /* Both shapes of every amount this check looks for.

       An amount is written two ways in this section now, with its unit and
       without, and which one a cell uses is a styling decision somebody making
       this mistake again would not think about. The seat rate reads bare inside
       a table and with its unit in the prose it is published in today; our own
       per head figure is the reverse. Matching only the shape each happens to
       wear right now would mean a row that paired them the other way round
       walked straight past a check written to stop exactly that pairing. */
    const bothShapes = (value: number): string[] => [cell(value), money(value)];
    const individualRates = new Set(bothShapes(OFFER.compare.individual));
    const individualNamedInTable = Array.from(host.querySelectorAll('#compare .cmp-table tr'))
      .filter((tr) => rowText(tr).includes(c.compare.individualPlan))
      .map(rowText);
    const ourPerHead = new Set(
      ourRows
        .flatMap((r) => [
          r.perHead.trim(),
          ...(r.wantPerHead === null ? [] : [r.wantPerHead, `${r.wantPerHead} ${OFFER.currency}`]),
        ])
        .filter((v) => v !== ''),
    );
    const individualPairedRows = Array.from(
      host.querySelectorAll('#compare tr, #compare [role="row"]'),
    )
      .filter((row) => {
        const cells = Array.from(row.querySelectorAll('td, th, .cmp-num, .cmp-fig')).map((el) =>
          (el.textContent ?? '').trim(),
        );
        return cells.some((v) => ourPerHead.has(v)) && cells.some((v) => individualRates.has(v));
      })
      .map(rowText);

    /* Which claims the offer says hold at this tier, over exactly the sizes the
       table put on show. Derived, never listed: the point of the gate is that a
       tier change takes the sentences it stops supporting off the page without
       anybody remembering to, and an expectation written down here by hand
       would go stale on the same morning the copy would have.

       Two claims, and each is asked the one question that gates it. The ceiling
       claim is asked of the tier alone, because both sides of it are fixed: it
       holds wherever the flat fee is under what the largest firm Team will take
       pays, at every size or at none. The curve claim is asked of the table,
       because it compares our own figures with each other and so has no rate to
       fall short of: it needs two covered sizes to draw a line between and
       nothing else. Coverage is read off `comparison()` rather than off the
       rows, so a size the offer has stopped covering takes the curve with it
       even if the table were still printing it.

       There is no third branch. The section has no fallback sentence, because
       with the curve ungated there is no reachable state in which the claims
       list is empty and the table is not. */
    const shown = ourRows.map((r) => comparison(r.size, tier));
    const coveredShown = shown.filter((r) => r.perPerson !== null);
    const claimsExpected = [
      ...(belowManagedFloor(tier) ? ['belowManagedFloor'] : []),
      ...(belowTeamCeiling(tier) ? ['belowTeamCeiling'] : []),
      ...(coveredShown.length > 1 ? ['curve'] : []),
    ];
    const claimsRendered = host.querySelectorAll('#compare .cmp-claim').length;

    /* Every figure inside a claim has to be one the offer can produce. This is
       the check that catches a number typed into the copy: the sentences are
       fragments with slots, and a fragment that grew a numeral would read
       correctly and be wrong.

       Neither rival seat rate is in this set, and both absences are the same
       rule. They are real figures of the offer's, and one of them is printed
       on the page in the note under the table, but no claim may carry either:
       a claim that did would be the per seat comparison this section was
       rebuilt to stop making, and it would arrive wearing the offer's own
       number. The Team rate has a cell of its own in the table, which is a
       firm's published rate presented as one and not an argument; a sentence
       is the other thing. So both are stray figures here.

       Every entry is in the shape a claim would print it: head counts as
       counts, amounts with the unit the sentence around them has no column
       head to borrow. An amount allowed here bare would let a claim print one
       with no currency on it and pass, which is the ambiguity the formatters
       were added to remove. */
    const allowedFigures = new Set<string>([
      ...ourRows.flatMap((r) => [
        figure(r.size),
        ...(r.wantPerHead === null ? [] : [`${r.wantPerHead} ${OFFER.currency}`]),
      ]),
      money(tier.price),
      figure(OFFER.compare.teamMax),
      money(teamCeilingMonthly()),
      figure(OFFER.compare.managedMin),
      money(managedFloorMonthly()),
    ]);
    const claimFigures = Array.from(host.querySelectorAll('#compare .cmp-claim .cmp-fig')).map(
      (el) => el.textContent ?? '',
    );
    const strayFigures = claimFigures.filter((f) => !allowedFigures.has(f));

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
    const compareText = host.querySelector('#compare')?.textContent ?? '';
    const outside = compareText ? text.split(compareText).join('\n') : text;
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
      en.hero.title.mark, en.hero.cta, en.demo.title, en.demo.pickLead,
      en.numbers.title, en.who.title, en.price.title, en.form.title, en.form.submit,
      en.price.feesTitle, en.price.covers.title, en.price.whenTitle,
      en.compare.title, en.compare.eyebrow, en.compare.lede, en.compare.claimsTitle,
      en.compare.ourPlan, en.compare.perHeadLabel,
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
      /* The founding trade, and the counter that makes it a fact rather than a
         countdown. Rendered only where the tier has places to count. */
      tierOnShow: tier.id,
      tierIsCapped: capped,
      hasSpotsCounter: Boolean(
        host.querySelector('#price dl[aria-labelledby="price-founding-h"] .price-fig'),
      ),
      /* Every control is labelled, by a label[for] on the three text fields and
         by the label that wraps each radio. Both are real label elements; an
         aria-label would not count here on purpose. Measured on both screens
         by the walk above. */
      labelledControls: stepOneLabelled && stepTwoLabelled,
      /* Six questions: three chosen from radio groups, then three written. */
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
        stepTwoAsks.join('|') ===
        [c.form.companyLabel, c.form.emailLabel, c.form.phoneLabel].join('|'),
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
      /* The ledger: three rows, three figures, and the window the unit beside
         the last of them can carry. */
      ledgerRowCount: ledger.length,
      ledgerRowsInContent: c.numbers.rows.length,
      modelFirm: MODEL_FIRM,
      smallestSoldTo: smallestSoldTo(),
      modelFirmMatchesContract: MODEL_FIRM === smallestSoldTo(),
      ledgerSaving: Number.isFinite(saving)
        ? String(saving)
        : `"${c.numbers.rows.find((r) => r.key === 'saving')?.amount ?? ''}" does not parse to a figure`,
      ledgerSavingIsNumeric: Number.isFinite(saving) && saving > 0,
      ledgerModelled: wantMultiple !== null,
      wantMultiple,
      ledgerBlank,
      ledgerBad,
      ourRowCount: ourRows.length,
      refRowCount: host.querySelectorAll('#compare .cmp-row-ref').length,
      wantRefRowCount,
      badRows,
      uncoveredRows,
      badRefCells,
      individualNamedInTable,
      individualPairedRows,
      claimsExpected,
      claimsRendered,
      claimFigureCount: claimFigures.length,
      strayFigures,
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
