import { useEffect, useRef, useState } from 'react';
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
  const [open, setOpen] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stripRef = useRef<HTMLDivElement | null>(null);

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
        <header className="who-head">
          <p className="who-eyebrow">{c.who.eyebrow}</p>
          <h2 className="who-h" id="who-h">
            {c.who.title}
          </h2>
        </header>

        {/* A filing cabinet, not three cards side by side.
 
            The founder read this section and said the folders were not earning
            their space and should do something. They were three static cards
            showing everything at once, across a very wide row, and the reader
            had to take in all three to learn they only cared about one.
 
            One folder is open at a time and the tabs pick it, which is the
            pattern the worked example already uses for the same three trades,
            two sections up. The closed panels stay in the DOM and are `hidden`,
            so a reader who searches the page still finds their own trade and
            the audit still sees all three lines.
 
            Real tabs: roving focus, arrow keys, Home and End, and `aria-selected`
            on the one that is open. A thing that looks pressable and does not
            answer the keyboard is worse than a thing that never moved. */}
        <div className="who-strip" ref={stripRef}>
          <div className="who-tabs" role="tablist" aria-labelledby="who-h">
            {c.who.groups.map((g, i) => (
              <button
                key={g.tab}
                type="button"
                role="tab"
                id={'who-tab-' + g.id}
                className={'who-tab' + (i === open ? ' is-open' : '')}
                aria-selected={i === open}
                aria-controls={'who-panel-' + g.id}
                tabIndex={i === open ? 0 : -1}
                ref={(el) => { tabRefs.current[i] = el; }}
                onClick={() => setOpen(i)}
                onKeyDown={(e) => {
                  const last = c.who.groups.length - 1;
                  const to =
                    e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
                    : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
                    : e.key === 'Home' ? 0
                    : e.key === 'End' ? last
                    : null;
                  if (to === null) return;
                  e.preventDefault();
                  setOpen(to);
                  tabRefs.current[to]?.focus();
                }}
              >
                {g.tab}
              </button>
            ))}
          </div>
          {c.who.groups.map((g, i) => (
            <div
              key={g.tab}
              role="tabpanel"
              id={'who-panel-' + g.id}
              aria-labelledby={'who-tab-' + g.id}
              className="who-sheet"
              hidden={i !== open}
            >
              <p className="who-line">{g.line}</p>
              {/* What that trade's drafts are written out of.

                  The folder held one sentence of eight words, which is not an
                  answer to "is this me". This is: the five things the worked
                  example switches on and off, named for this trade rather than
                  for the one the example happens to be showing.

                  Nothing here is new and nothing here is a claim. Every label
                  is read from `demo.desks`, matched to the folder by the id
                  the two lists already share, so a reader who opens
                  "Accounting firms" is told about filing rules and quarter
                  deadlines rather than deposits, in their own language,
                  without a word of it having been written twice or invented
                  about a trade nobody here works in. */}
              {(() => {
                const desk = c.demo.desks.find((d) => d.id === g.id);
                if (!desk) return null;
                return (
                  <p className="who-sources">
                    <span className="who-sources-h">{c.who.sourcesTitle}</span>{' '}
                    <span className="who-sources-list">
                      {desk.sources.map((s) => (
                        <span className="who-source" key={s.key}>
                          {s.label}
                        </span>
                      ))}
                    </span>
                  </p>
                );
              })()}
            </div>
          ))}
        </div>

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
        </div>

      </div>
    </section>
  );
}
