import { useEffect, useRef, useState } from 'react';
import type { Content } from '../content/types';

/**
 * The one orchestrated moment on the page: a minute of work, scrubbed by scroll.
 *
 * This is the single exception to DESIGN-PLAN principle 5, "the page does not
 * move", taken deliberately rather than by drift. The rest of that principle
 * still holds: nothing else on the page animates, there are no entrance
 * effects, and this section reveals nothing a still page would not have said.
 * It re-tells the hero's example in four beats, and it is the one place where
 * the claim "eleven seconds instead of nine minutes" is shown rather than
 * asserted.
 *
 * It renders `hero.message` and `hero.draft` rather than carrying copy of its
 * own, so the example exists once per locale. If the hero's example changes,
 * this changes with it and cannot drift out of step.
 *
 * ACCESSIBILITY. The scrubbing apparatus is aria-hidden in full: text that
 * rewrites itself on scroll is hostile to a screen reader, and a typing effect
 * is worse. Every beat is therefore also rendered as ordinary static prose in
 * an sr-only list, so the whole narrative is available without scrolling,
 * without motion, and without JavaScript.
 *
 * MOTION. Under `prefers-reduced-motion: reduce` the section collapses to its
 * end state: full draft, all chips lit, the gate visible, no sticky viewport
 * and no scroll listener attached at all. That is handled here in JS as well as
 * in CSS, because the CSS alone would leave the scroll handler running.
 *
 * FIT. The sticky viewport is one screen tall and clips what does not fit, so
 * the sequence only scrubs when the content actually fits the screen; it falls
 * back to the same static end state when it does not. That is measured rather
 * than guessed at a breakpoint, because the required height depends on the
 * locale: the Lithuanian copy is materially taller than the English, and a
 * media query tuned on English would clip it. Measured, phones and short
 * laptop windows both get the readable static version instead of a draft with
 * its first and last lines cut off.
 */
export function Sequence({ c }: { c: Content }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [beat, setBeat] = useState(0);
  const [local, setLocal] = useState(0);
  const [reduced, setReduced] = useState(true);
  const [fits, setFits] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /* Does a whole beat fit on one screen? The 48px is breathing room, and it is
     also hysteresis: the static and scrubbed layouts are the same grid at the
     same widths, so without a margin a viewport sitting exactly on the
     boundary could flip between them on every resize tick. */
  useEffect(() => {
    const measure = () => {
      const inner = innerRef.current;
      if (!inner) return;
      setFits(inner.offsetHeight + 48 <= window.innerHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    const ro =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (ro && innerRef.current) ro.observe(innerRef.current);
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduced || !fits) return;
    const node = wrapRef.current;
    if (!node) return;

    let raf = 0;
    const frame = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const span = node.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, -rect.top / (span || 1)));
      const b = Math.min(3, Math.floor(p * 4));
      setBeat(b);
      setLocal(p * 4 - b);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced, fits]);

  const s = c.sequence;
  const draft = `${c.hero.draft.greeting}\n\n${c.hero.draft.body}`;

  /* Scrub only when motion is allowed AND a beat fits the screen. Otherwise
     render the end state, which says everything the sequence would have said. */
  const scrub = !reduced && fits;
  const shown = scrub ? beat : 3;
  const litCount = !scrub
    ? s.knowledge.length
    : beat < 1
      ? 0
      : beat > 1
        ? s.knowledge.length
        : Math.round(local * s.knowledge.length);
  const typedCount = !scrub
    ? draft.length
    : beat < 2
      ? 0
      : beat > 2
        ? draft.length
        : Math.round(local * draft.length);
  const gateOn = !scrub || (beat >= 3 && local > 0.28);
  const typing = scrub && beat === 2 && typedCount < draft.length;

  /* 08:40:00 through 08:41:00, built from the hero's clock so the time is
     written down in one place per locale rather than four. */
  const seconds = [0, 2, 11, 60][shown];
  const clock =
    seconds >= 60
      ? `${c.hero.clockOut}:00`
      : `${c.hero.clockIn}:${String(seconds).padStart(2, '0')}`;

  const step = s.steps[shown];

  return (
    <section aria-label={s.ariaLabel} className="rule-top">
      {/* The whole narrative, for screen readers and for no-JS. */}
      <div className="sr-only">
        <p>{s.srIntro}</p>
        <ol>
          {s.steps.map((b) => (
            <li key={b.head}>
              <strong>{b.head}</strong> {b.say}
            </li>
          ))}
        </ol>
        <p>{draft}</p>
        <p>{s.gate}</p>
      </div>

      <div
        ref={wrapRef}
        aria-hidden="true"
        className={scrub ? 'h-[300vh] md:h-[420vh]' : ''}
      >
        <div
          className={
            scrub
              ? 'sticky top-0 flex h-screen items-center overflow-hidden'
              : 'mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-8 md:py-24'
          }
        >
          <div
            ref={innerRef}
            className="mx-auto grid w-full max-w-[1180px] items-center gap-7 px-5 sm:px-8 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-12"
          >
            {/* Left: which beat we are on. */}
            <div>
              <p
                className="text-[13px] font-medium uppercase tracking-[0.1em]"
                style={{ color: 'var(--color-amber-text)' }}
              >
                {step.label}
              </p>
              <h2 className="mt-4 text-[clamp(1.7rem,3.2vw,2.6rem)]">{step.head}</h2>
              <p className="mt-4 max-w-[42ch] text-[1.02rem] leading-relaxed text-muted">
                {step.say}
              </p>

              {/* Four bars, one per beat. */}
              <div className="mt-8 flex max-w-[330px] gap-2">
                {s.steps.map((b, i) => (
                  <span key={b.label} className="relative h-[3px] flex-1 overflow-hidden rounded-sm bg-taupe">
                    <span
                      className="absolute inset-0 origin-left bg-amber"
                      style={{
                        transform: `scaleX(${!scrub ? 1 : i < beat ? 1 : i === beat ? local : 0})`,
                      }}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Right: the mail, the knowledge, the draft, the gate. */}
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-rule bg-sand px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-taupe" />
                <span className="h-2 w-2 rounded-full bg-taupe" />
                <span className="h-2 w-2 rounded-full bg-taupe" />
                <span className="ml-2 text-[13px] tabular-nums text-muted">{clock}</span>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <p className="text-[13px] text-muted">{c.hero.message.from}</p>
                <p className="mt-2 text-[15.5px] font-medium">{c.hero.message.subject}</p>
                <p className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-muted">
                  {c.hero.message.body}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {s.knowledge.map((k, i) => (
                    <span
                      key={k}
                      className={[
                        'rounded-full border px-3 py-1.5 text-[13.5px] transition-all duration-300',
                        i < litCount
                          ? 'border-taupe bg-peach text-espresso'
                          : 'border-rule bg-cream text-muted',
                      ].join(' ')}
                    >
                      {k}
                    </span>
                  ))}
                </div>

                <div className="mt-4 min-h-[10.5em] whitespace-pre-wrap rounded-brand border border-rule bg-cream px-4 py-4 text-[14.5px] leading-relaxed">
                  {draft.slice(0, typedCount)}
                  {typing ? <span className="caret" /> : null}
                </div>

                <div
                  className="mt-4 flex gap-2.5 transition-all duration-500"
                  style={{
                    opacity: shown >= 3 ? 1 : 0,
                    transform: shown >= 3 ? 'none' : 'translateY(8px)',
                  }}
                >
                  <span className="rounded-sm px-4 py-2 text-[14px] font-medium bg-amber text-charcoal">
                    {s.sendLabel}
                  </span>
                  <span className="rounded-sm border border-rule px-4 py-2 text-[14px] text-muted">
                    {s.editLabel}
                  </span>
                </div>

                <p
                  className="mt-3.5 text-[14.5px] text-muted transition-opacity duration-500"
                  style={{ opacity: gateOn ? 1 : 0 }}
                >
                  {s.gate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
