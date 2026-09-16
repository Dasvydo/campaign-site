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
 */
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LocalePage } from '../src/LocalePage';
import { content, pathFor } from '../src/content';
import type { Locale } from '../src/lib/contract';
import {
  OFFER,
  activeTier,
  belowTeamCeiling,
  comparison,
  isCapped,
  remainingSpots,
  setupDue,
  teamCeilingMonthly,
  usd,
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

   The seat framing is checked as the English word only. Danish and Lithuanian
   said it as "plads" and "vieta", and both of those words are now doing honest
   work in the founding block, where they mean a place in the cohort. Matching
   them would fail on correct copy, so the numerals carry the check in those two
   locales, and they are the half of the old model that actually misprices
   anything. */
const STALE = [
  { label: '890, the old flat monthly for ten seats', re: /(?<![\d.,])890(?![\d.,])/ },
  { label: '89, the old per seat rate', re: /(?<![\d.,])89(?![\d.,])/ },
  { label: 'the old minimum framed as seats', re: /\bseats?\b/i },
];

/** Every leaf string in a content object, so a blank key is caught. */
function leaves(value: unknown, path = '', out: Array<[string, string]> = []): Array<[string, string]> {
  if (typeof value === 'string') out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => leaves(v, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) leaves(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

/** The two ways the page prints a number, copied from <Price /> so an assembled
    string is assembled exactly the way the component assembles it. */
const money = (value: number): string => `${usd(value)} ${OFFER.currency}`;
const figure = (value: number): string => usd(value);

/** The head count out of a size cell, "People: 15" and its two translations. */
const sizeOf = (el: Element | null): number =>
  Number((el?.textContent ?? '').replace(/\D+/g, ''));

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

    const text = host.textContent ?? '';
    const c = content[locale];
    const [firmFee, setupFee] = c.price.fees;
    const tierName = c.price.tierNames[tier.id];

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
      c.hero.title.mark, c.hero.deck.after, c.hero.cta, c.hero.dateline,
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
            c.price.founding.title, c.price.founding.lede, c.price.founding.spots.label,
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
      c.compare.individualPlan, c.compare.individualSize,
      c.compare.teamPlan, c.compare.teamSize.label,
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
      ['the flat firm fee, on the fee sheet', firmFee.term + money(tier.price) + firmFee.per],
      ['the setup fee, on the fee sheet', setupFee.term + money(OFFER.setupFee)],
      ['people covered by the fee', c.price.covers.people.label + figure(OFFER.covers)],
      ['the pooled draft cap', c.price.covers.drafts.label + figure(OFFER.draftCap)],
      [
        'the monthly total under the timeline',
        c.price.total.term + c.price.total.sub.label + ' ' + figure(OFFER.covers) + money(tier.price),
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
        wantPerHead: want.perPerson === null ? null : usd(want.perPerson),
        wantFirm: usd(want.monthly),
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

    /* The two reference rows are somebody else's published rates, printed as
       they are read. Individual is one seat by definition, so the same figure
       stands in both of its cells. */
    const refCells = Array.from(host.querySelectorAll('#compare .cmp-row-ref .cmp-num')).map(
      (td) => td.textContent ?? '',
    );
    const wantRefCells = [
      usd(OFFER.compare.individual), usd(OFFER.compare.individual),
      usd(OFFER.compare.team), usd(teamCeilingMonthly()),
    ];
    const badRefCells =
      refCells.length === wantRefCells.length && refCells.every((v, i) => v === wantRefCells[i])
        ? []
        : [`${refCells.join(',')} against ${wantRefCells.join(',')}`];

    /* Which claims the offer says hold at this tier, over exactly the sizes the
       table put on show. Derived, never listed: the point of the gate is that a
       tier change takes the sentences it stops supporting off the page without
       anybody remembering to, and an expectation written down here by hand
       would go stale on the same morning the copy would have. The ceiling claim
       is asked of the tier alone, because both sides of it are fixed and it
       holds at every size or none. */
    const shown = ourRows.map((r) => comparison(r.size, tier));
    const claimsExpected = [
      ...(shown.some((r) => r.claims.belowTeamRate) ? ['belowTeamRate'] : []),
      ...(shown.some((r) => r.claims.belowIndividualRate) ? ['belowIndividualRate'] : []),
      ...(belowTeamCeiling(tier) ? ['belowTeamCeiling'] : []),
    ];
    const claimsRendered = host.querySelectorAll(
      '#compare .cmp-claim:not(.cmp-claim-none)',
    ).length;
    /* Where not one claim holds, the section says so rather than trailing off:
       one standing line, and only where there is a covered size to name. */
    const noClaimsRendered = host.querySelectorAll('#compare .cmp-claim-none').length;
    const noClaimsExpected = claimsExpected.length === 0 && ourRows.length > 0 ? 1 : 0;

    /* Every figure inside a claim has to be one the offer can produce. This is
       the check that catches a number typed into the copy: the sentences are
       fragments with slots, and a fragment that grew a numeral would read
       correctly and be wrong. */
    const allowedFigures = new Set<string>([
      ...ourRows.flatMap((r) => [String(r.size), r.wantPerHead ?? '']),
      usd(tier.price),
      usd(OFFER.compare.team),
      usd(OFFER.compare.individual),
      String(OFFER.compare.teamMax),
      usd(teamCeilingMonthly()),
    ]);
    const claimFigures = Array.from(host.querySelectorAll('#compare .cmp-claim .cmp-fig')).map(
      (el) => el.textContent ?? '',
    );
    const strayFigures = claimFigures.filter((f) => !allowedFigures.has(f));

    /* Nothing from the model this page replaced, anywhere in what it rendered.
       A little of the surrounding text rides along with each hit, because
       "890 is on the page" is only half of what a reader of the failure needs. */
    const stale = STALE.flatMap(({ label, re }) => {
      const m = re.exec(text);
      if (!m) return [];
      const at = Math.max(0, (m.index ?? 0) - 40);
      return [`${label} -> ...${text.slice(at, (m.index ?? 0) + 40).replace(/\s+/g, ' ')}...`];
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
         aria-label would not count here on purpose. */
      labelledControls: Array.from(
        host.querySelectorAll<HTMLInputElement>('#qualifier input'),
      ).every(
        (el) =>
          Boolean(el.id && host.querySelector(`label[for="${el.id}"]`)) ||
          Boolean(el.closest('label')),
      ),
      /* Six questions: three written and three chosen from radio groups. */
      questionCount:
        host.querySelectorAll('#qualifier input:not([type="radio"])').length +
        host.querySelectorAll('#qualifier [role="radiogroup"]').length,
      blankKeys,
      missing,
      unassembled,
      ourRowCount: ourRows.length,
      refRowCount: host.querySelectorAll('#compare .cmp-row-ref').length,
      badRows,
      uncoveredRows,
      badRefCells,
      claimsExpected,
      claimsRendered,
      noClaimsExpected,
      noClaimsRendered,
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
