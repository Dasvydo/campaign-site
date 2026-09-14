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
 * Two separate view signals, on purpose.
 *
 * `onView` fires `pricing_view` to PostHog as soon as 35% of the band is on
 * screen. It is a product metric and its meaning is two months old, so its
 * threshold is left exactly as it was.
 *
 * `onSeen` is the stricter one, and it feeds Meta. It needs 50% of the band
 * visible CONTINUOUSLY for two seconds, per campaigns/pixel-install.md in the
 * ad-engine repo. That dwell is the whole point: the pixel audience it builds
 * is the campaign's only high-intent pool, and counting everyone who scrolled
 * past the price on the way to the form would dilute it until it means nothing.
 * Scrolling away before the two seconds are up cancels it.
 *
 * Both fire at most once per page load.
 */
export function Price({
  c,
  onView,
  onSeen,
  onCta,
}: {
  c: Content;
  onView: () => void;
  onSeen?: () => void;
  onCta: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const fired = useRef(false);
  const seenFired = useRef(false);

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

  /* The dwell signal. Separate observer because it needs a different threshold
     and has to survive the first one disconnecting itself. */
  useEffect(() => {
    const node = ref.current;
    if (!node || !onSeen) return;
    if (typeof IntersectionObserver === 'undefined') return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (seenFired.current) return;
          if (e.isIntersecting) {
            timer ??= setTimeout(() => {
              seenFired.current = true;
              onSeen();
              obs.disconnect();
            }, 2000);
          } else {
            clearTimeout(timer);
            timer = undefined;
          }
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(node);
    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [onSeen]);

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
