import { useEffect, useRef } from 'react';

/**
 * How much of the page is left.
 *
 * Three pixels of the same amber pen that draws the tally, the underlines and
 * the strike-throughs. The page is around 7,500px and the browser's own
 * scrollbar is an overlay that fades, so an impatient reader otherwise has no
 * way of knowing.
 *
 * It is aria-hidden: it says nothing a screen reader does not already have from
 * the scroll position, and a progressbar role here would announce a number on
 * every tick. It carries no transition, so it tracks the scroll exactly rather
 * than chasing it, which is also why reduced motion leaves it alone: it moves
 * only when the reader moves.
 *
 * It renders outside <main> because several sections set overflow-x:clip and a
 * clip context captures fixed descendants.
 */
export function Rail() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const doc = document.documentElement;
      const span = doc.scrollHeight - window.innerHeight;
      /* a window taller than the page is not zero progress, it is all of it */
      const p = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 1;
      rail.style.setProperty('--rail-p', p.toFixed(4));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);

    /* the page grows and shrinks as disclosures open and the demo changes desk,
       and the fraction is wrong until it is measured again. */
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(queue);
    ro?.observe(document.body);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      ro?.disconnect();
    };
  }, []);

  return (
    <div className="rail" aria-hidden="true" ref={ref}>
      <span className="rail-ink" />
    </div>
  );
}
