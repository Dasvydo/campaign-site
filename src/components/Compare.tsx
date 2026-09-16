import type { Content } from '../content/types';
import type { Comparison } from '../lib/offer';
import {
  OFFER,
  activeTier,
  belowTeamCeiling,
  comparison,
  teamCeilingMonthly,
  usd,
} from '../lib/offer';

/**
 * The sum per head, and the three sentences it is allowed to support.
 *
 * This is the section that makes the argument rather than asserting it. One
 * flat fee for the whole firm means the cost per person falls as the firm
 * grows, and the only way a reader can check that is to see the division done
 * in front of them next to the two rates anyone can buy on doviloop.dev. So the
 * table is the substance of the section, and the claims underneath it are a
 * reading of the table, never a replacement for it.
 *
 * Three rules hold this together.
 *
 * Nothing here is written down. Every figure on screen comes out of offer.ts
 * through `usd`, and the two rival rates are the published ones the offer file
 * records with the date they were read. There is no number in this file except
 * the three head counts the table compares at, which are sizes, not prices.
 *
 * No sentence is a sentence. Each claim is a boolean the offer resolves, and
 * the copy around it is a set of fragments with slots for figures. A claim that
 * does not hold at the active tier is not softened or hedged: it is not
 * rendered. That is the whole point of the gate. At the uncapped tier all three
 * happen to be false at all three sizes, which is why `noClaims` exists and why
 * the table, the heading and the source note all still render around it. The
 * honest version of this section is a finished thought, not a lede followed by
 * a refusal.
 *
 * No per head figure outside coverage. `comparison(n).perPerson` is null for a
 * head count the flat fee does not cover, and the rows are filtered on exactly
 * that null before anything is rendered. A firm above the ceiling would get the
 * most flattering figure on the page out of a division the offer has not agreed
 * to honour, so it gets no figure at all. The filter also means that lowering
 * `OFFER.covers` quietly drops the sizes it no longer covers from the table
 * instead of leaving them there to be believed.
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

  /* Read once, so the table and the claims are answering for the same tier
     even if this render straddled a change to the counts. */
  const tier = activeTier();
  const rows = SIZES.map((n) => comparison(n, tier)).filter(isCovered);

  /* Each per head claim is argued at the smallest size on show where it is
     true, because the smallest size is the weakest case that still holds and
     therefore the one worth stating. `find` returns undefined where no size
     qualifies, and undefined renders nothing. */
  const teamRateRow = rows.find((r) => r.claims.belowTeamRate) ?? null;
  const individualRow = rows.find((r) => r.claims.belowIndividualRate) ?? null;

  /* The third claim has no size in it at all: both sides of it are fixed, so it
     turns on the tier and nothing else. */
  const ceilingHolds = belowTeamCeiling(tier);

  const anyClaim = teamRateRow !== null || individualRow !== null || ceilingHolds;

  /* The fallback names the largest size on show, which is the size at which the
     sum comes closest to working. Saying it does not come out there is the
     strongest honest version of the sentence. */
  const fallbackRow = rows.length > 0 ? rows[rows.length - 1] : null;

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
                      {t.ourSize.label} {r.headcount}
                    </span>
                  </th>
                  <td className="cmp-num cmp-num-lead">{usd(r.perPerson)}</td>
                  <td className="cmp-num">{usd(r.monthly)}</td>
                </tr>
              ))}

              <tr className="cmp-row cmp-row-ref">
                <th scope="row" className="cmp-plan">
                  <span className="cmp-plan-name">{t.individualPlan}</span>
                  <span className="cmp-plan-size">{t.individualSize}</span>
                </th>
                {/* The same figure in both cells, and not by accident:
                    Individual is one seat by definition, so the firm buying it
                    is one person and the two columns are the same number for
                    it. Printing the rate in the firm column rather than leaving
                    the cell empty keeps every row readable on its own. */}
                <td className="cmp-num">{usd(OFFER.compare.individual)}</td>
                <td className="cmp-num">{usd(OFFER.compare.individual)}</td>
              </tr>

              <tr className="cmp-row cmp-row-ref">
                <th scope="row" className="cmp-plan">
                  <span className="cmp-plan-name">{t.teamPlan}</span>
                  <span className="cmp-plan-size">
                    {t.teamSize.label} {OFFER.compare.teamMax}
                  </span>
                </th>
                <td className="cmp-num">{usd(OFFER.compare.team)}</td>
                <td className="cmp-num">{usd(teamCeilingMonthly())}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Outside the table on purpose. These are prose about the figures, not
            more figures, and a cell is the wrong place to put an argument. */}
        {(anyClaim || fallbackRow !== null) && (
          <div className="cmp-claims">
            <h3 className="cmp-claims-h">{t.claimsTitle}</h3>

            {anyClaim ? (
              <ul className="cmp-claim-list" role="list">
                {teamRateRow !== null && (
                  <li className="cmp-claim">
                    {t.claims.belowTeamRate.size}
                    <b className="cmp-fig">{teamRateRow.headcount}</b>
                    {t.claims.belowTeamRate.before}
                    <b className="cmp-fig">{usd(teamRateRow.perPerson)}</b>
                    {t.claims.belowTeamRate.mid}
                    <b className="cmp-fig">{usd(OFFER.compare.team)}</b>
                    {t.claims.belowTeamRate.after}
                  </li>
                )}

                {individualRow !== null && (
                  <li className="cmp-claim">
                    {t.claims.belowIndividualRate.size}
                    <b className="cmp-fig">{individualRow.headcount}</b>
                    {t.claims.belowIndividualRate.before}
                    <b className="cmp-fig">{usd(individualRow.perPerson)}</b>
                    {t.claims.belowIndividualRate.mid}
                    <b className="cmp-fig">{usd(OFFER.compare.individual)}</b>
                    {t.claims.belowIndividualRate.after}
                  </li>
                )}

                {ceilingHolds && (
                  <li className="cmp-claim">
                    {t.claims.belowTeamCeiling.before}
                    <b className="cmp-fig">{usd(tier.price)}</b>
                    {t.claims.belowTeamCeiling.mid}
                    <b className="cmp-fig">{OFFER.compare.teamMax}</b>
                    {t.claims.belowTeamCeiling.then}
                    <b className="cmp-fig">{usd(teamCeilingMonthly())}</b>
                    {t.claims.belowTeamCeiling.after}
                  </li>
                )}
              </ul>
            ) : (
              fallbackRow !== null && (
                <p className="cmp-claim cmp-claim-none">
                  {t.noClaims.size}
                  <b className="cmp-fig">{fallbackRow.headcount}</b>
                  {t.noClaims.after}
                </p>
              )
            )}
          </div>
        )}

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
