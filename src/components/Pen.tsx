import { useEffect, useRef } from 'react';

/**
 * The hand-drawn underline.
 *
 * Amber on cream at #8a5200, the one amber that carries next to a letterform,
 * and the same pen as the hero tally and the demo's strike-throughs. The stroke
 * is drawn by dashoffset, so it needs its own measured length; the fallback of
 * 110 is roughly right for this viewBox and only ever applies when the element
 * has no layout, in which case nothing is visible to draw anyway.
 *
 * It draws when it comes into view, once, and it is skipped entirely under
 * reduced motion, where the line is simply there. Nothing on this page is
 * allowed to rest at opacity 0, so the undrawn state is worn only while the
 * script is driving it.
 */
export function Pen({ children, d }: { children: React.ReactNode; d: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const path = el.querySelector('path');
    if (!path) return;

    let len = 110;
    try {
      const measured = path.getTotalLength();
      if (measured && isFinite(measured)) len = measured;
    } catch {
      /* no layout: keep the fallback */
    }
    el.style.setProperty('--who-len', len.toFixed(1));
    el.style.setProperty('--who-dur', Math.max(240, Math.min(620, len * 2.1)).toFixed(0) + 'ms');

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      el.classList.add('who-in');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          el.classList.add('who-in');
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: '-35% 0px -25% 0px' },
    );
    io.observe(el);

    /* if the observer never gets a frame, the line still arrives */
    const safety = window.setTimeout(() => {
      el.classList.add('who-in');
      io.disconnect();
    }, 2000);

    return () => {
      window.clearTimeout(safety);
      io.disconnect();
    };
  }, []);

  return (
    <span className="who-pen" ref={ref}>
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d={d} />
      </svg>
      {children}
    </span>
  );
}
