import { useEffect, useRef } from 'react';
import type { Content } from '../content/types';
import { Section } from './Section';

/**
 * A full-bleed sand band, not a centred pricing card.
 *
 * Showing the price out loud is part of the qualifying. Someone who is not
 * going to spend this leaves here instead of on a call, which is the outcome
 * we want.
 *
 * Fires `pricing_view` once, when the band is genuinely on screen.
 */
export function Price({ c, onView, onCta }: { c: Content; onView: () => void; onCta: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      // Old browser: count it as seen rather than losing the event entirely.
      if (!fired.current) {
        fired.current = true;
        onView();
      }
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !fired.current) {
            fired.current = true;
            onView();
            obs.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [onView]);

  return (
    <Section id="price" n="06" title={c.price.title} rule={false} className="bg-sand">
      <div ref={ref} className="grid gap-x-12 gap-y-9 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <p className="font-display text-[clamp(2.4rem,5vw,3.4rem)] leading-none">
            {c.price.perSeat}
          </p>
          <p className="mt-2 text-[1.02rem] text-muted">{c.price.perSeatNote}</p>

          <p className="mt-8 font-display text-[clamp(1.7rem,3.4vw,2.3rem)] leading-none">
            {c.price.setup}
          </p>
          <p className="mt-2 max-w-[32ch] text-[1.02rem] text-muted">{c.price.setupNote}</p>
        </div>

        <div>
          <ul className="m-0 list-none p-0">
            {c.price.lines.map((line, i) => (
              <li
                key={line}
                className={[
                  'py-4 text-[1.02rem] leading-relaxed',
                  i === 0 ? 'pt-0' : 'border-t border-taupe',
                ].join(' ')}
              >
                {line}
              </li>
            ))}
          </ul>

          <a href="#qualifier" className="btn btn-primary mt-7" onClick={onCta}>
            {c.price.cta}
          </a>
        </div>
      </div>
    </Section>
  );
}
