import { useId, useState } from 'react';
import type { Content } from '../content/types';
import {
  OFFER,
  activeTier,
  comparableHeadcounts,
  formatCount,
  formatMoney,
  keptVsManaged,
  managedMonthly,
  perPerson,
} from '../lib/offer';

/**
 * The sum per head, drawn rather than tabulated.
 *
 * One flat fee for the whole firm means the cost per person falls as the firm
 * grows. That used to be a table of three head counts with three paragraphs
 * reading it back, and a reader had to assemble the shape in their head from
 * nine cells. The shape is the argument, so the section now draws it: one line
 * that climbs with head count and one that does not, with the money between
 * them shaded in. A reader who never touches the control still sees it, which
 * matters because most will not touch it.
 *
 * What is drawn, and what is not.
 *
 * Two lines, both firm level. Ours, flat, because the fee does not move. And
 * Managed, because it is the only plan on the product site a firm at these head
 * counts can actually buy.
 *
 * Team is named and never drawn. It stops selling at its seat ceiling, which is
 * below every head count on this scale, so there is no point on the chart where
 * Team has a price. That absence is the honest reading and the stronger one:
 * the cheaper looking plan will not quote a firm this size at all. Inventing a
 * dashed line for it would be drawing a price nobody can buy.
 *
 * Individual has no line either, and for the opposite reason. It is a plan for
 * one person, bought a seat at a time, so its seat rate is not a firm's cost a
 * head. Set against ours it is the one comparison this offer loses at the ten
 * person floor the whole page advertises: ten seats cost less than this fee,
 * and the flat fee only passes that rate well above it. So the plan is named in
 * prose underneath with its published rate, and nothing is claimed about it in
 * either direction. The rate is public and hiding it would be worse than saying
 * it. What we do not do is invite the comparison by drawing it.
 *
 * Every figure comes from src/lib/offer.ts at render time, and the ones that
 * can be asked for outside coverage come back null rather than as a division
 * this offer has not agreed to honour. The scale itself is the offer's too:
 * `comparableHeadcounts` is every size the fee covers that Managed will also
 * quote for, so the control cannot be moved to a head count the arithmetic
 * behind it refuses to price.
 *
 * The chart is aria-hidden on purpose. It is a second rendering of figures the
 * readout above it already carries in text, the slider announces the same
 * numbers through `aria-valuetext` on every change, and the live region says
 * what moved. A described SVG here would make a screen reader read the same
 * three amounts twice.
 */

/* The drawing, in its own coordinate space. The viewBox leaves room below the
   plot for the axis labels and above it for the upper line's own figure, so
   nothing is drawn outside the bounds at any head count. */
/* `left` is wide enough for the topmost tick with its currency on it, in the
   widest of the three groupings this page publishes in. A gutter sized for the
   bare numeral clipped the thousands digit off, which is the failure this
   comment exists to stop somebody tidying back in. */
const VIEW = { w: 660, h: 340, left: 86, right: 18, top: 18, bottom: 54 };

export function Compare({ c }: { c: Content }) {
  const tier = activeTier();
  const sizes = comparableHeadcounts();
  const first = sizes[0];
  const last = sizes[sizes.length - 1];

  /* Opens at the middle of the scale rather than at either end. At the floor
     the saving is at its smallest and at the ceiling at its largest, and
     opening on either would be choosing the most or least flattering point
     before the reader has touched anything. */
  const [heads, setHeads] = useState(() => sizes[Math.floor(sizes.length / 2)]);

  const sliderId = useId();

  const money = (value: number): string => `${formatMoney(value, c.htmlLang)} ${OFFER.currency}`;
  const figure = (value: number): string => formatCount(value, c.htmlLang);

  /* Null anywhere the offer has no agreed answer. Nothing below renders a
     figure without checking, because a component that renders null as "0 USD"
     is the failure these helpers return null to prevent. */
  const perHead = perPerson(heads, tier);
  const managed = managedMonthly(heads);
  const kept = keptVsManaged(heads, tier);

  /* The scale is fixed across the whole control rather than fitted to the
     head count on show. A scale that refitted on every step would keep the
     two lines the same distance apart at every size, which is the exact
     opposite of what this section is about. */
  const ceiling = managedMonthly(last) ?? tier.price;
  const px = (n: number): number =>
    VIEW.left + ((n - first) / (last - first)) * (VIEW.w - VIEW.left - VIEW.right);
  const py = (value: number): number =>
    VIEW.top + (1 - value / ceiling) * (VIEW.h - VIEW.top - VIEW.bottom);

  const ourY = py(tier.price);
  const manFirst = managedMonthly(first);
  const manLast = managedMonthly(last);

  /* Four ticks plus zero, each naming a value the chart actually reaches. */
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(ceiling * f));

  /* What the slider says when it moves, assembled from the same labels the
     readout prints so the spoken version cannot drift from the seen one. Each
     label carries its own colon, so nothing is punctuated here. */
  const announce =
    `${c.compare.headsLabel} ${figure(heads)}. ` +
    (kept === null ? '' : `${c.compare.keepLabel} ${money(kept)}. `) +
    (perHead === null ? '' : `${c.compare.perHeadLabel} ${money(perHead)}.`);

  return (
    <section id="compare" aria-labelledby="compare-h">
      <div className="cmp-wrap">
        <header className="cmp-head">
          <p className="cmp-eyebrow">{c.compare.eyebrow}</p>
          <h2 className="cmp-h" id="compare-h">
            {c.compare.title}
          </h2>
          <p className="cmp-lede">{c.compare.lede}</p>
        </header>

        <div className="cmp-panel">
          {/* The control, and the figures it moves. The readout comes before
              the drawing in the document so that the numbers are reached first
              by a screen reader and by anyone reading at a narrow width. */}
          <div className="cmp-control">
            <div className="cmp-control-head">
              <label className="cmp-control-label" htmlFor={sliderId}>
                {c.compare.headsLabel}
              </label>
              <output className="cmp-control-count" htmlFor={sliderId}>
                {figure(heads)}
              </output>
            </div>

            <input
              className="cmp-range"
              id={sliderId}
              type="range"
              min={first}
              max={last}
              step={1}
              value={heads}
              aria-valuetext={announce}
              onChange={(e) => setHeads(Number(e.target.value))}
            />

            <div className="cmp-ticks" aria-hidden="true">
              <span>{figure(first)}</span>
              <span>{figure(last)}</span>
            </div>
          </div>

          <div className="cmp-readout">
            {/* The lead figure. Rendered only where both sides of it exist,
                which on this scale they always do; the guard is here because
                the scale is read from the offer and an offer edited to a
                narrower coverage would otherwise print a saving from null. */}
            {kept === null ? null : (
              <div className="cmp-keep">
                <p className="cmp-term">{c.compare.keepLabel}</p>
                <p className="cmp-keep-fig" data-cmp-keep>
                  {money(kept)}
                </p>
                <p className="cmp-year">
                  {c.compare.yearLabel} {money(kept * 12)}
                </p>
              </div>
            )}

            <dl className="cmp-pair">
              <div className="cmp-pair-row">
                <dt className="cmp-term">{c.compare.firmLabel}</dt>
                <dd className="cmp-pair-fig" data-cmp-firm>
                  {money(tier.price)}
                </dd>
              </div>
              {perHead === null ? null : (
                <div className="cmp-pair-row">
                  <dt className="cmp-term">{c.compare.perHeadLabel}</dt>
                  <dd className="cmp-pair-fig" data-cmp-head>
                    {money(perHead)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <p className="cmp-sr" role="status" aria-live="polite">
            {announce}
          </p>

          {/* The drawing. See the note at the top of this file for why it is
              hidden from assistive technology rather than described. */}
          <div className="cmp-chart">
            <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} aria-hidden="true" focusable="false">
              {ticks.map((value) => (
                <g key={value}>
                  <line
                    className="cmp-grid"
                    x1={VIEW.left}
                    y1={py(value)}
                    x2={VIEW.w - VIEW.right}
                    y2={py(value)}
                  />
                  {/* The highest tick wears the unit so the axis is not a
                      column of bare numerals, and the others stay quiet. */}
                  <text className="cmp-tick cmp-tick-y" x={VIEW.left - 10} y={py(value) + 4} textAnchor="end">
                    {value === ticks[ticks.length - 1] ? money(value) : figure(value)}
                  </text>
                </g>
              ))}

              {manFirst === null || manLast === null ? null : (
                <>
                  {/* The money, as an area rather than a number. */}
                  <path
                    className="cmp-band"
                    d={
                      `M${px(first)} ${ourY} L${px(last)} ${ourY} ` +
                      `L${px(last)} ${py(manLast)} L${px(first)} ${py(manFirst)} Z`
                    }
                  />
                  <path
                    className="cmp-line-ref"
                    d={`M${px(first)} ${py(manFirst)} L${px(last)} ${py(manLast)}`}
                  />
                </>
              )}

              <path className="cmp-line-ours" d={`M${px(first)} ${ourY} L${px(last)} ${ourY}`} />

              {managed === null ? null : (
                <>
                  <line
                    className="cmp-marker"
                    x1={px(heads)}
                    y1={py(managed)}
                    x2={px(heads)}
                    y2={py(0)}
                  />
                  <circle className="cmp-dot-ref" cx={px(heads)} cy={py(managed)} r={5} />
                </>
              )}
              <circle className="cmp-dot-ours" cx={px(heads)} cy={ourY} r={5} />

              {sizes
                .filter((n) => n === first || n === last || (n - first) % 2 === 0)
                .map((n) => (
                  <text
                    className="cmp-tick cmp-tick-x"
                    key={n}
                    x={px(n)}
                    y={VIEW.h - 34}
                    textAnchor="middle"
                  >
                    {figure(n)}
                  </text>
                ))}
              <text
                className="cmp-tick cmp-tick-x"
                x={(VIEW.left + VIEW.w - VIEW.right) / 2}
                y={VIEW.h - 8}
                textAnchor="middle"
              >
                {c.compare.axisLabel}
              </text>
            </svg>
          </div>

          <ul className="cmp-legend">
            <li>
              <span className="cmp-swatch cmp-swatch-ours" aria-hidden="true" />
              <span>
                <b>{c.compare.ourPlan}</b> {c.compare.ourLegend}
              </span>
            </li>
            <li>
              <span className="cmp-swatch cmp-swatch-ref" aria-hidden="true" />
              <span>
                <b>{c.compare.managedPlan}</b> {c.compare.managedSize.label}{' '}
                {figure(OFFER.compare.managedMin)}
              </span>
            </li>
          </ul>
        </div>

        <div className="cmp-notes">
          {/* Team, named and not drawn. */}
          <p className="cmp-note">
            <b>{c.compare.teamPlan}</b>
            {c.compare.teamOut.before}
            <span className="cmp-fig">{figure(OFFER.compare.teamMax)}</span>
            {c.compare.teamOut.after}
          </p>

          <p className="cmp-note">
            {c.compare.rangeNote.before}
            <span className="cmp-fig">{figure(OFFER.covers)}</span>
            {c.compare.rangeNote.after}
          </p>

          {/* Individual, named and never ranked. */}
          <p className="cmp-note">
            <b>{c.compare.individualPlan}</b>
            {c.compare.individualNote.before}
            <span className="cmp-fig">{money(OFFER.compare.individual)}</span>
            {c.compare.individualNote.after}
          </p>

          <p className="cmp-source">
            {c.compare.sourceNote.before}
            <a href="https://doviloop.dev" rel="noreferrer">
              {c.compare.sourceNote.link}
            </a>
            {c.compare.sourceNote.mid}
            {OFFER.compare.readAt}
            {c.compare.sourceNote.after}
          </p>
        </div>
      </div>
    </section>
  );
}
