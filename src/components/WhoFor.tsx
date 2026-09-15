import { useEffect, useRef } from 'react';
import type { Content } from '../content/types';
import { Pen } from './Pen';

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

  const n = c.who.notes;

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

        <div className="who-notes">
          <p className="who-note who-note-a">
            {n.seats.before}
            <Pen d="M1 6 C 20 3, 45 8, 62 5 S 90 4, 99 6">{n.seats.mark}</Pen>
            {n.seats.mid}
            <a className="who-link" href="https://doviloop.dev" rel="noopener">
              {n.seats.link}
            </a>
            {n.seats.after}
          </p>
          <p className="who-note who-note-b">
            {n.setup.before}
            <Pen d="M1 6 C 22 4, 44 8, 63 5 S 88 3, 99 6">{n.setup.mark}</Pen>
            {n.setup.after}
          </p>
        </div>
      </div>
    </section>
  );
}
