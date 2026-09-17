import { useEffect, useId, useRef, useState } from 'react';
import type { Content } from '../content/types';
import {
  OFFER,
  activeTier,
  comparableHeadcounts,
  formatCount,
  formatMoney,
  modelledKept,
  modelledSpend,
} from '../lib/offer';
import { Disclosure } from './Disclosure';


/**
 * The arithmetic, in three beats a reader can do in their head.
 *
 * What mail costs the firm now, what this costs, and what is left. One
 * subtraction, printed in order, driven by one head count the reader moves.
 *
 * It used to state a saving and leave the reader to take it on trust, because
 * the figure it was subtracted from was never on the screen. Two savings were
 * on the page at that point, on two baselines that never met: one against the
 * firm's own time and one against a published seat rate. A reader could not
 * reconcile them, so they stopped trying.
 *
 * This is the first baseline, and it is the one a reader arriving from an
 * advertisement is actually choosing against: not another plan, but doing
 * nothing. The comparison with the plans on the product site is still here,
 * under the disclosure, for the smaller number of readers who are choosing
 * between them.
 *
 * Every figure is hedged with "about" and none of them is a measurement, which
 * the lede says out loud rather than burying in small print. There are no
 * customers yet, so there is nothing here that could be one: no case study, no
 * named firm, no percentage attributed to anybody.
 *
 * The slips settle in as they arrive and the highlighter runs under the lede
 * once the fonts have loaded, because a mark sized against a fallback face lands
 * in the wrong place when the real one swaps in. Both hidden states come off on
 * a safety timer: these are real figures, and a missed frame must not leave them
 * invisible.
 */
export function Numbers({ c }: { c: Content }) {
  const secRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;

    /* The three beats settle in as they arrive. They used to be paper slips,
       one per figure, and are now the rows of one subtraction, so the reveal
       follows the rows. */
    const slips = Array.from(sec.querySelectorAll('.numbers-beat'));
    const marks = Array.from(sec.querySelectorAll('.numbers-hl'));
    const settle = () => {
      sec.classList.remove('numbers-anim');
      slips.forEach((el) => el.classList.add('numbers-in'));
      marks.forEach((el) => el.classList.add('numbers-marked'));
    };

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      settle();
      return;
    }

    sec.classList.add('numbers-anim');
    const safety = window.setTimeout(settle, 2000);
    const observers: IntersectionObserver[] = [];

    const watch = (targets: Element[], cls: string, rootMargin: string) => {
      if (!targets.length) return;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target.classList.add(cls);
            io.unobserve(e.target);
          }
        },
        { threshold: 0, rootMargin },
      );
      targets.forEach((t) => io.observe(t));
      observers.push(io);
    };

    watch(slips, 'numbers-in', '-10% 0px -14% 0px');

    let cancelled = false;
    const startMarks = () => {
      if (!cancelled) watch(marks, 'numbers-marked', '-30% 0px -22% 0px');
    };
    if (document.fonts?.ready) void document.fonts.ready.then(startMarks, startMarks);
    else startMarks();

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  /* The one assumption, read once. Everything on this section is arithmetic on
     it, so the disclosure that states it and the figures computed from it
     cannot disagree, and a string that does not parse leaves every helper with
     nothing to work from and the section printing blanks rather than guesses. */
  const tier = activeTier();
  const saving = Number.parseFloat(c.numbers.saving);

  /* The head counts this may be moved across: the sizes the flat fee covers.
     Read from the offer rather than written here, so the control cannot offer
     a firm size the arithmetic behind it refuses to answer for. */
  const sizes = comparableHeadcounts();
  const first = sizes[0];
  const last = sizes[sizes.length - 1];

  /* Opens in the middle. At either end one of the three figures is at its
     smallest or its largest, and opening on either would be choosing the least
     or most flattering point before the reader has touched anything. */
  const [heads, setHeads] = useState(() => sizes[Math.floor(sizes.length / 2)]);
  const sliderId = useId();

  const money = (value: number): string => `${formatMoney(value, c.htmlLang)} ${OFFER.currency}`;
  const figure = (value: number): string => formatCount(value, c.htmlLang);

  /* The three beats. Null anywhere the model has no answer, and nothing below
     renders one without checking: a component that prints null as "0 USD" is
     the failure these helpers return null to prevent. */
  const spend = modelledSpend(saving, heads);
  const kept = modelledKept(saving, heads, tier);

  /* The bar. One length, split where the fee falls, so what the firm pays is
     seen as the share of the total it actually is rather than asserted to be
     small. Null spend leaves no bar rather than a full one. */
  const feeShare = spend === null || spend <= 0 ? null : Math.min(1, tier.price / spend);

  /* Said when the control moves, assembled from the same labels the beats
     print, so the spoken version cannot drift from the seen one. Each label
     carries its own colon, so nothing is punctuated here. */
  const announce =
    `${c.numbers.headsLabel} ${figure(heads)}. ` +
    (spend === null ? '' : `${c.numbers.spendLabel} ${money(spend)}. `) +
    `${c.numbers.feeLabel} ${money(tier.price)}. ` +
    (kept === null ? '' : `${c.numbers.keepLabel} ${money(kept)}.`);

  return (
    <section id="numbers" aria-labelledby="numbers-h" ref={secRef}>
      <div className="numbers-wrap">
        <header className="numbers-head">
          <span className="numbers-folio" aria-hidden="true">
            04
          </span>
          <p className="numbers-eyebrow">{c.numbers.eyebrow}</p>
          <h2 className="numbers-h" id="numbers-h">
            {c.numbers.title}
          </h2>
        </header>

        <div className="numbers-panel">
          <div className="numbers-control">
            <div className="numbers-control-head">
              <label className="numbers-control-label" htmlFor={sliderId}>
                {c.numbers.headsLabel}
              </label>
              <output className="numbers-control-count" htmlFor={sliderId}>
                {figure(heads)}
              </output>
            </div>
            <input
              className="numbers-range"
              id={sliderId}
              type="range"
              min={first}
              max={last}
              step={1}
              value={heads}
              aria-valuetext={announce}
              onChange={(e) => setHeads(Number(e.target.value))}
            />
            <div className="numbers-ticks" aria-hidden="true">
              <span>{figure(first)}</span>
              <span>{figure(last)}</span>
            </div>
          </div>

          {/* The three beats, in the order they are read, so the subtraction is
              one a reader can do in their head from what is on the screen. */}
          <dl className="numbers-beats">
            {spend === null ? null : (
              <div className="numbers-beat">
                <dt className="numbers-term">{c.numbers.spendLabel}</dt>
                <dd className="numbers-amt" data-n-spend>
                  <span className="numbers-about">{c.numbers.about}</span>
                  {money(spend)}
                </dd>
              </div>
            )}
            <div className="numbers-beat numbers-beat-fee">
              <dt className="numbers-term">{c.numbers.feeLabel}</dt>
              {/* No hedge on this one. It is a price, not a model. */}
              <dd className="numbers-amt" data-n-fee>
                {money(tier.price)}
              </dd>
            </div>
            {kept === null ? null : (
              <div className="numbers-beat numbers-beat-keep">
                <dt className="numbers-term">{c.numbers.keepLabel}</dt>
                <dd className="numbers-keep" data-n-keep>
                  <span className="numbers-about">{c.numbers.about}</span>
                  {money(kept)}
                  <span className="numbers-year">
                    {c.numbers.yearLabel} {money(kept * 12)}
                  </span>
                </dd>
              </div>
            )}
          </dl>

          {/* What the firm pays, as a share of what mail costs it now. Hidden
              from assistive technology: it is a second rendering of the two
              figures above it, and the live region already says them. */}
          {feeShare === null ? null : (
            <div className="numbers-bar" aria-hidden="true" data-n-bar>
              <span className="numbers-bar-fee" style={{ width: `${feeShare * 100}%` }} />
            </div>
          )}

          <p className="numbers-sr" role="status" aria-live="polite">
            {announce}
          </p>
        </div>

        <div className="numbers-caveat">
          <span className="numbers-hair" aria-hidden="true" />
          <p className="numbers-lede">
            {c.numbers.lede.before}
            <span className="numbers-hl">
              <span className="numbers-hl-soak">{c.numbers.lede.mark}</span>
            </span>
            {c.numbers.lede.after}
          </p>

          <Disclosure label={c.numbers.moreLabel}>
            <p className="disc-p">
              {c.numbers.savingLabel}{' '}
              <b className="numbers-fig">{money(saving)}</b>
            </p>
            <dl className="disc-dl">
              {c.numbers.basis.map((b) => (
                <div key={b.term}>
                  <dt>{b.term}</dt>
                  <dd>{b.def}</dd>
                </div>
              ))}
            </dl>
            {c.numbers.notes.map((n) => (
              <p className="disc-p" key={n}>
                {n}
              </p>
            ))}

            {/* The comparison with the plans on the product site. It is a
                different argument from the one above: that one is against the
                firm's own time, which is the choice a reader arriving from an
                advertisement is actually making, and this one is against
                somebody's published rate, which only matters to a reader
                already choosing between plans. So it sits here, under them. */}
            <div className="numbers-plans">
              <p className="disc-p">
                <b>{c.compare.managedPlan}</b>{' '}
                {c.compare.managedSize.label}{' '}
                <span className="numbers-fig">{figure(OFFER.compare.managedMin)}</span>
              </p>
              <p className="disc-p">
                <b>{c.compare.teamPlan}</b>
                {c.compare.teamOut.before}
                <span className="numbers-fig">{figure(OFFER.compare.teamMax)}</span>
                {c.compare.teamOut.after}
              </p>
              {/* Individual is named and never ranked. At the ten person floor
                  this page advertises, ten seats cost less than this fee, and
                  the flat fee only passes that rate well above it. The rate is
                  public and hiding it would be worse than saying it; what we do
                  not do is set it against a cost a head. */}
              <p className="disc-p">
                <b>{c.compare.individualPlan}</b>
                {c.compare.individualNote.before}
                <span className="numbers-fig">{money(OFFER.compare.individual)}</span>
                {c.compare.individualNote.after}
              </p>
              <p className="disc-p">
                {c.compare.rangeNote.before}
                <span className="numbers-fig">{figure(OFFER.covers)}</span>
                {c.compare.rangeNote.after}
              </p>
              <p className="disc-p numbers-src">
                {c.compare.sourceNote.before}
                <a href="https://doviloop.dev" rel="noreferrer">
                  {c.compare.sourceNote.link}
                </a>
                {c.compare.sourceNote.mid}
                {OFFER.compare.readAt}
                {c.compare.sourceNote.after}
              </p>
            </div>
          </Disclosure>
        </div>
      </div>
    </section>
  );
}
