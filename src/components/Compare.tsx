import type { Content } from '../content/types';
import type { Comparison } from '../lib/offer';
import {
  OFFER,
  activeTier,
  belowTeamCeiling,
  comparison,
  formatCount,
  formatMoney,
  teamCeilingMonthly,
} from '../lib/offer';

/**
 * The sum per head, and the two claims it is allowed to support.
 *
 * This is the section that makes the argument rather than asserting it. One
 * flat fee for the whole firm means the cost per person falls as the firm
 * grows, and the only way a reader can check that is to see the division done
 * in front of them. So the table is the substance of the section, and the
 * claims underneath it are a reading of the table, never a replacement for it.
 *
 * What is in the table, and what is not.
 *
 * The table holds firm level plans and nothing else: our own fee at three head
 * counts, and Team at the largest firm it will sell to. That is what a grid
 * with a per head column implies it is doing, and it is the only comparison
 * this offer wins at every size it is sold to. Team is the plan a firm of this
 * size would otherwise be on, and Team stops selling at its seat ceiling, so a
 * firm at the head count this page is sold to cannot buy it at all. The
 * comparison worth making is therefore firm total against firm total: our one
 * flat fee against what the largest firm Team will take pays every month. That
 * is the lead claim.
 *
 * Individual has no row, and that is the point of this file's last revision.
 * It is a plan for one person, bought a seat at a time, so its seat rate is not
 * a firm's cost a head and cannot be read down the same column as one. Printed
 * there it was read against our cost a head, which at the smallest firm this
 * page is sold to is the comparison we lose: the flat fee only falls past that
 * seat rate well above the ten person floor the meta description, the dateline,
 * the qualifying note and the form routing all advertise. So the plan is named
 * in prose under the table instead, with its published seat rate, and nothing
 * is claimed about it in either direction. The rate is public; hiding it would
 * be worse than saying it. What we stop doing is inviting the per head
 * comparison by putting it in a column.
 *
 * What renders at each tier, under the shipped offer.
 *
 * The curve claim renders at all three tiers. It compares nothing: it states
 * what each person costs at the smallest and the largest head count the table
 * shows, and the fact that the fee for the firm does not move between them.
 * That is true at every tier and at every pair of sizes, so it is not gated on
 * arithmetic. It is skipped only where the table has fewer than two covered
 * sizes to draw a line between, which the shipped coverage does not produce.
 *
 * The Team ceiling claim renders at the two capped tiers, whose flat fee is
 * under what the largest firm Team will take pays, and does not render at the
 * uncapped tier, whose flat fee is above it. Nothing softens or hedges it
 * there: the gate reads `belowTeamCeiling` off the offer, and a claim that does
 * not hold is simply not on the page.
 *
 * So at the uncapped tier the section is the table, the curve, the note naming
 * Individual, and the source note. There is no "none of this holds" fallback
 * sentence, because with the
 * curve ungated there is no reachable state in which the claims list is empty
 * and the table is not. A fallback for an unreachable state is copy maintained
 * in three languages and read in none.
 *
 * Three rules hold the rest of it together.
 *
 * Nothing here is written down. Every figure on screen comes out of offer.ts
 * through the three formatters below, and the published rates are the ones the
 * offer file records with the date they were read. There is no number in this
 * file except the three head counts the table compares at, which are sizes,
 * not prices.
 *
 * No sentence is a sentence. Each claim is a set of fragments with slots for
 * figures, and the component decides whether it appears at all.
 *
 * No per head figure outside coverage. `comparison(n).perPerson` is null for a
 * head count the flat fee does not cover, and the rows are filtered on exactly
 * that null before anything is rendered. A firm above the ceiling would get the
 * most flattering figure on the page out of a division the offer has not agreed
 * to honour, so it gets no figure at all. The filter also means that lowering
 * `OFFER.covers` quietly drops the sizes it no longer covers from the table,
 * and from the two ends of the curve, instead of leaving them to be believed.
 *
 * No folio number, unlike the other sections. The folios are a continuous run
 * across the sections that were already here, and opening a slot in the middle
 * of that run would mean editing six other components to insert one. This block
 * reads as the second half of the terms it follows, which is where it sits.
 */

/* Sizes, not prices. A ten person firm is the smallest this offer is sold to,
   twenty is the largest the flat fee covers, and fifteen is the middle of that
   range: three points are enough to show which way the line runs. Anything the
   offer stops covering is dropped below rather than shown. */
const SIZES = [10, 15, 20] as const;

/** A comparison whose head count the flat fee actually covers. */
type CoveredComparison = Comparison & { readonly perPerson: number };

/**
 * The only door a per person figure gets through. Written as a type guard so
 * the filter narrows for the compiler too: past this point `perPerson` is a
 * number, and no cell has to remember to check it a second time.
 */
function isCovered(row: Comparison): row is CoveredComparison {
  return row.perPerson !== null;
}

export function Compare({ c }: { c: Content }) {
  const t = c.compare;

  /* Three ways to print a figure, all of them in the language the section is
     being read in. This section exists so a reader can check the division
     themselves, and they cannot check a figure whose decimal mark they read as
     a thousands separator: the per head figure at the largest covered firm is
     nineteen and a half, which written the English way is a four figure sum in
     Danish.

     `cell` and `money` differ by one word, and the difference is where the
     figure sits. A cell is under a column head that has already named the
     currency once, and repeating it down the column would be printing the same
     word in every row. A claim is a sentence standing on its own, and an
     amount in a sentence with no unit beside it is a number the reader has to
     take on trust, which is the one thing this section refuses to ask of them.
     `figure` is for the head counts, which are not amounts at all. */
  const cell = (value: number): string => formatMoney(value, c.htmlLang);
  const money = (value: number): string => `${cell(value)} ${OFFER.currency}`;
  const figure = (value: number): string => formatCount(value, c.htmlLang);

  /* Read once, so the table and the claims are answering for the same tier
     even if this render straddled a change to the counts. */
  const tier = activeTier();
  const rows = SIZES.map((n) => comparison(n, tier)).filter(isCovered);

  /* The two ends of the curve are the two ends of the table, so the sentence
     cannot describe a size the reader cannot also see. Two distinct rows are
     needed for a curve to be a curve: with one size covered, or none, there is
     a figure but no fall, and the honest thing is to say nothing rather than to
     compare a size with itself. */
  const smallest = rows.length > 1 ? rows[0] : null;
  const largest = rows.length > 1 ? rows[rows.length - 1] : null;

  /* The other claim has no size in it at all: both sides of it are fixed, so it
     turns on the tier and nothing else. */
  const ceilingHolds = belowTeamCeiling(tier);

  const anyClaim = ceilingHolds || (smallest !== null && largest !== null);

  return (
    <section id="compare" aria-labelledby="compare-h">
      <div className="cmp-wrap">
        <header className="cmp-head">
          <p className="cmp-eyebrow">{t.eyebrow}</p>
          <h2 className="cmp-h" id="compare-h">
            {t.title}
          </h2>
        </header>

        <div className="cmp-sheet">
          {/* A real table with a real caption. The lede is the caption rather
              than a paragraph above it because the lede is already the sentence
              that says what is being compared against what, which is exactly
              what a caption owes a screen reader, and printing it twice to
              satisfy both would be printing it twice. */}
          <table className="cmp-table">
            <caption className="cmp-cap">{t.lede}</caption>
            <thead>
              <tr>
                <th scope="col" className="cmp-col-plan">
                  {t.planLabel}
                </th>
                <th scope="col" className="cmp-col-num">
                  {t.perHeadLabel} <span className="cmp-unit">{OFFER.currency}</span>
                </th>
                <th scope="col" className="cmp-col-num">
                  {t.firmLabel} <span className="cmp-unit">{OFFER.currency}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr className="cmp-row cmp-row-ours" key={r.headcount}>
                  <th scope="row" className="cmp-plan">
                    <span className="cmp-plan-name">{t.ourPlan}</span>
                    <span className="cmp-plan-size">
                      {t.ourSize.label} {figure(r.headcount)}
                    </span>
                  </th>
                  <td className="cmp-num cmp-num-lead">{cell(r.perPerson)}</td>
                  <td className="cmp-num">{cell(r.monthly)}</td>
                </tr>
              ))}

              {/* The only row here that is not ours, because it is the only
                  other plan a firm can buy for the whole firm. */}
              <tr className="cmp-row cmp-row-ref">
                <th scope="row" className="cmp-plan">
                  <span className="cmp-plan-name">{t.teamPlan}</span>
                  <span className="cmp-plan-size">
                    {t.teamSize.label} {figure(OFFER.compare.teamMax)}
                  </span>
                </th>
                {/* The firm cell here is a real total for a real firm: the seat
                    rate at the seat ceiling, which is the largest bill Team can
                    produce and the figure the lead claim is argued against. */}
                <td className="cmp-num">{cell(OFFER.compare.team)}</td>
                <td className="cmp-num">{cell(teamCeilingMonthly())}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Outside the table on purpose. These are prose about the figures, not
            more figures, and a cell is the wrong place to put an argument. */}
        {anyClaim && (
          <div className="cmp-claims">
            <h3 className="cmp-claims-h">{t.claimsTitle}</h3>

            <ul className="cmp-claim-list" role="list">
              {ceilingHolds && (
                <li className="cmp-claim">
                  {t.claims.belowTeamCeiling.before}
                  <b className="cmp-fig">{figure(OFFER.compare.teamMax)}</b>
                  {t.claims.belowTeamCeiling.mid}
                  <b className="cmp-fig">{money(teamCeilingMonthly())}</b>
                  {t.claims.belowTeamCeiling.then}
                  <b className="cmp-fig">{money(tier.price)}</b>
                  {t.claims.belowTeamCeiling.after}
                </li>
              )}

              {smallest !== null && largest !== null && (
                <li className="cmp-claim">
                  {t.claims.curve.smallOpen}
                  <b className="cmp-fig">{figure(smallest.headcount)}</b>
                  {t.claims.curve.smallCost}
                  <b className="cmp-fig">{money(smallest.perPerson)}</b>
                  {t.claims.curve.largeOpen}
                  <b className="cmp-fig">{figure(largest.headcount)}</b>
                  {t.claims.curve.largeCost}
                  <b className="cmp-fig">{money(largest.perPerson)}</b>
                  {t.claims.curve.after}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* The plan that is not in the table, said plainly. A sentence rather
            than a row, because prose can say what a plan is and a column can
            only say what it costs a head, and what this plan costs a head is
            not a figure a firm can compare itself with. It sits directly above
            the source note so the rate in it is attributed by the same
            sentence that attributes the rate in the table. */}
        <p className="cmp-src">
          {t.individualNote.before}
          <b className="cmp-fig">{money(OFFER.compare.individual)}</b>
          {t.individualNote.after}
        </p>

        {/* Somebody else's prices, so they carry whose they are and when we read
            them. A comparison whose basis is invisible is a claim the reader has
            to take on trust, and this whole section exists so they do not. */}
        <p className="cmp-src">
          {t.sourceNote.before}
          <a className="cmp-src-link" href="https://doviloop.dev" rel="noopener">
            {t.sourceNote.link}
          </a>
          {t.sourceNote.mid}
          <time dateTime={OFFER.compare.readAt}>{OFFER.compare.readAt}</time>
          {t.sourceNote.after}
        </p>
      </div>
    </section>
  );
}
