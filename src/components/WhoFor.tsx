import { useEffect, useRef } from 'react';
import type { Content } from '../content/types';
import { formatCount } from '../lib/offer';
import { oneEmailIn } from '../lib/value';

/**
 * Three folders on a desk, and the two things worth saying beside them.
 *
 * The cards lift into place once, staggered, when the strip arrives. The
 * hidden state is worn only while the script is driving it and comes off on a
 * safety timer, so a page whose observer never fires shows three cards rather
 * than three blanks.
 */
export function WhoFor({ c }: { c: Content }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const stripRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const strip = stripRef.current;
    if (!root || !strip) return;

    const reveal = () => {
      root.classList.remove('who-js');
      strip.classList.add('who-in');
    };

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      reveal();
      return;
    }

    root.classList.add('who-js');
    const safety = window.setTimeout(reveal, 2000);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          strip.classList.add('who-in');
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: '-10% 0px -18% 0px' },
    );
    io.observe(strip);

    return () => {
      window.clearTimeout(safety);
      io.disconnect();
    };
  }, []);

  return (
    <section id="who" aria-labelledby="who-h" ref={rootRef}>
      <div className="who-wrap">
        <p className="who-folio" aria-hidden="true">
          03
        </p>

        <header className="who-head">
          <p className="who-eyebrow">{c.who.eyebrow}</p>
          <h2 className="who-h" id="who-h">
            {c.who.title}
          </h2>
        </header>

        <ul className="who-strip" role="list" ref={stripRef}>
          {c.who.groups.map((g) => (
            <li className="who-item" key={g.tab}>
              <div className="who-lift">
                <h3 className="who-tab">{g.tab}</h3>
                <div className="who-sheet">
                  <p className="who-line">{g.line}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* The objection a regulated trade asks first, answered where they
            are already asking whether this is for them. Every line is a claim
            the page makes elsewhere; the last one is the figure we do not
            have, said out loud rather than skipped. */}
        <div className="who-accuracy">
          <h3 className="who-accuracy-h" id="who-accuracy-h">
            {c.who.accuracy.title}
          </h3>
          {/* The measured figure hangs off the FIRST item, not off the list.

              It sat after the whole list for one commit, and an independent
              verifier measured what a reader actually sees: the list is a two
              column grid above 900px flowing 1 3 / 2 4, so the note landed
              under "There is no automatic send anywhere in this product" at
              1440 and 1280, and under "A draft quotes the fee" below that. At
              no width did it sit under the bullet it quantifies. A measurement
              of how much mail gets a draft, printed under a sentence about
              sending, reads as a measurement of sends.

              Nesting it inside the item removes the question: it is adjacent
              to the claim it qualifies at every width, because it is part of
              it. */}
          <ul className="who-accuracy-list" aria-labelledby="who-accuracy-h">
            {c.who.accuracy.items.map((item, i) => (
              <li key={item}>
                {item}
                {i === 0 ? (
                  <span className="who-accuracy-share">
                    {c.who.accuracy.share.before}
                    {formatCount(oneEmailIn(), c.htmlLang)}
                    {c.who.accuracy.share.after}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="who-accuracy-note">{c.who.accuracy.unmeasured}</p>
        </div>

      </div>
    </section>
  );
}
