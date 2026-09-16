import { useEffect, useRef } from 'react';
import type { Content, NumberRow } from '../content/types';
import { activeTier, formatCount, formatMoney, modelledMultiple } from '../lib/offer';
import { Disclosure } from './Disclosure';

/**
 * The firm the ledger models, in people.
 *
 * Ten is not a sample size somebody picked. It is the smallest firm this is
 * sold to, and the basis under the figures names it out loud in all three
 * languages: a figure that holds at the smallest firm holds at every size
 * above it. It lives here rather than in the offer because it is an assumption
 * this section argues from and not a term of the offer, and because a change
 * to it is a change to the sentence in the disclosure as much as to the sum.
 */
const MODEL_FIRM = 10;

/**
 * Two figures, and the arithmetic behind them one click away.
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

    const slips = Array.from(sec.querySelectorAll('.numbers-slip'));
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

  // One of the two figures is arithmetic on the offer and the other is copy, so
  // the tier is read here and the saving is read back out of the row that
  // prints it. Keeping the saving in one place means the disclosure that states
  // it and the figure computed from it cannot disagree, and anything that does
  // not parse to a figure leaves the helper with nothing to work from, so the
  // ledger prints a blank rather than a guess.
  const tier = activeTier();
  const saving = Number.parseFloat(
    c.numbers.rows.find((r) => r.key === 'saving')?.amount ?? '',
  );
  const multiple = modelledMultiple(saving, MODEL_FIRM, tier);

  /* The figure for one row, or an empty string where there is none to print.

     Two formatters, because the two rows are not the same kind of thing. The
     multiple is a count, of times over, with no decimal part to write. The
     saving is an amount in the currency its unit names, so it keeps whatever
     cents it was written with and gets the decimal mark of the language
     reading it.

     The saving goes back out through the formatter rather than straight out of
     the copy it came from. It is read as a number a line above to compute the
     multiple, so printing the string it was parsed from would let the page show
     one figure and argue from another. Today they are the same, and this is
     what keeps them so. */
  const figureFor = (r: NumberRow): string => {
    if (r.key === 'multiple') return multiple === null ? '' : formatCount(multiple, c.htmlLang);
    return saving > 0 && r.amount ? formatMoney(saving, c.htmlLang) : '';
  };

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

        <div className="numbers-grid">
          <ul className="numbers-ledger" role="list">
            {c.numbers.rows.map((r, i) => (
              <li className="numbers-slip" key={r.label}>
                <div className="numbers-index">
                  <span className="numbers-entry" aria-hidden="true">
                    {'0' + (i + 1)}
                  </span>
                  <p className="numbers-fig">
                    <span className="numbers-about">{c.numbers.about}</span>
                    <span className="numbers-amt">{figureFor(r)}</span>
                    <span className="numbers-unit">{r.unit}</span>
                  </p>
                </div>
                <div className="numbers-body">
                  <h3 className="numbers-label">{r.label}</h3>
                </div>
              </li>
            ))}
          </ul>

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
            </Disclosure>
          </div>
        </div>
      </div>
    </section>
  );
}
