import { useEffect, useRef, useState } from 'react';
import type { Content } from '../content/types';
import { OFFER, activeTier, isCapped, remainingSpots, setupDue, usd } from '../lib/offer';
import { Disclosure } from './Disclosure';

/**
 * The terms sheet: a charcoal band, not a centred pricing card.
 *
 * Showing the price out loud is part of the qualifying. Someone who is not
 * going to spend this leaves here instead of on a call, which is the outcome
 * we want.
 *
 * Not one amount below is written down here. Every figure on this band is read
 * from src/lib/offer.ts at render time, so the fee, the setup fee, the places
 * left and the tier the page is actually selling cannot drift apart from each
 * other or from the rest of the page.
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

/** An amount, with the currency the offer is priced in. Never a literal. */
const money = (value: number): string => `${usd(value)} ${OFFER.currency}`;

/** A count of things rather than an amount, printed the same way so that a
    ceiling and a fee cannot come out formatted differently. */
const figure = (value: number): string => usd(value);

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

  /* The tier the counts imply, read once per render so that every figure on
     the band, the fee, the waiver and the counter, is describing the same
     tier. Never `OFFER.declaredTier`: that one is only there to be checked. */
  const tier = activeTier();
  const capped = isCapped(tier);
  const spotsLeft = remainingSpots(tier);
  /* The tier's own name, so the founding block reads correctly on the morning
     the first tier sells out and nobody has edited the copy. */
  const tierName = c.price.tierNames[tier.id];
  /* Both halves have to agree: the tier has to give the fee away, and the copy
     has to have the words for it. */
  const setupWaived = tier.setupWaived && setupDue(tier) === 0;
  const [firmFee, setupFee] = c.price.fees;
  const waived = setupWaived ? setupFee.waived : undefined;

  /* The timeline. Three stops; picking the last one strikes the monthly total
     out and puts nothing in its place, which is the risk reversal made visible
     rather than asserted. The live region says what changed, because a struck
     out figure is a picture and a screen reader cannot see pictures. */
  const [stop, setStop] = useState(0);
  const [status, setStatus] = useState('');
  const stopRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sayTimer = useRef<number>(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const strikeRef = useRef<HTMLSpanElement | null>(null);

  const struck = stop === c.price.stops.length - 1;

  /* What the total is actually showing at a stop, so the announcement reads
     the figure rather than pointing at it: the monthly fee, or the zero that
     replaces it once the pen has gone through it. */
  const shownAt = (i: number): string =>
    i === c.price.stops.length - 1 ? c.price.total.zero : money(tier.price);

  const select = (i: number, moveFocus: boolean) => {
    setStop(i);
    window.clearTimeout(sayTimer.current);
    sayTimer.current = window.setTimeout(() => {
      const say = c.price.stops[i].say;
      setStatus(say.before + shownAt(i) + say.after);
    }, 300);
    if (moveFocus) stopRefs.current[i]?.focus();
  };

  /* The pen that strikes the total out is drawn by dashoffset, so it needs its
     own measured length. */
  useEffect(() => {
    const path = strikeRef.current?.querySelector('path');
    if (!path) return;
    try {
      const len = path.getTotalLength();
      strikeRef.current!.style.setProperty('--price-len', String(len));
      strikeRef.current!.style.setProperty(
        '--price-dur',
        Math.max(240, Math.min(620, len * 2.1)) + 'ms',
      );
    } catch {
      /* leave the CSS fallbacks in place */
    }
  }, []);

  /* The band settles in when it arrives, and on a safety timer if no frame
     ever comes, because these are the prices. */
  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    const reveal = () => sec.classList.add('price-in');
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      sec.classList.remove('price-anim');
      reveal();
      return;
    }
    sec.classList.add('price-anim');
    const safety = window.setTimeout(reveal, 2000);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          reveal();
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: '-10% 0px -10% 0px' },
    );
    io.observe(sec);
    return () => {
      window.clearTimeout(safety);
      io.disconnect();
    };
  }, []);

  useEffect(() => () => window.clearTimeout(sayTimer.current), []);

  return (
    <section id="price" className="price" aria-labelledby="price-h" ref={sectionRef}>
      <div className="price-wrap" ref={ref}>
        <p className="price-folio" aria-hidden="true">
          05
        </p>
        <div className="price-rule" aria-hidden="true" />

        <header className="price-head">
          <p className="price-eyebrow">{c.price.eyebrow}</p>
          <h2 className="price-h2" id="price-h">
            {c.price.title}
          </h2>
        </header>

        <div className="price-sheet">
          <div className="price-block">
            <h3 className="price-sub" id="price-fees-h">
              {c.price.feesTitle}
            </h3>
            <dl className="price-fees" aria-labelledby="price-fees-h">
              <div className="price-fee" data-price-reveal style={{ ['--i' as string]: 0 }}>
                <dt className="price-fee-term">{firmFee.term}</dt>
                <dd className="price-fee-amt">
                  <span className="price-fig">{money(tier.price)}</span>
                  <span className="price-per">{firmFee.per}</span>
                </dd>
                <dd className="price-fee-note">{firmFee.note}</dd>
              </div>

              {/* The setup fee is shown whether or not it is due. A fee waived
                  without its amount on show is a trade with no visible value,
                  and the reader is left no way to price what they are giving
                  up for it. The struck figure is a picture, so where it is
                  struck the same fact is carried in words as well. */}
              <div className="price-fee" data-price-reveal style={{ ['--i' as string]: 1 }}>
                <dt className="price-fee-term">{setupFee.term}</dt>
                <dd className="price-fee-amt">
                  {waived ? (
                    <>
                      <span className="price-fig" aria-hidden="true">
                        <s>{money(OFFER.setupFee)}</s>
                      </span>
                      <span className="price-per" aria-hidden="true">
                        {waived.label}
                      </span>
                      <span className="price-sr">
                        {waived.say.before}
                        {money(OFFER.setupFee)}
                        {waived.say.after}
                      </span>
                    </>
                  ) : (
                    <span className="price-fig">{money(OFFER.setupFee)}</span>
                  )}
                  <span className="price-per">{setupFee.per}</span>
                </dd>
                <dd className="price-fee-note">{setupFee.note}</dd>
              </div>
            </dl>
          </div>

          {/* Both ceilings are the whole firm's, not one person's, so both read
              as a label with the count after it and neither is a price. */}
          <div className="price-block">
            <h3 className="price-sub" id="price-covers-h">
              {c.price.covers.title}
            </h3>
            <dl className="price-fees" aria-labelledby="price-covers-h">
              <div className="price-fee" data-price-reveal style={{ ['--i' as string]: 0 }}>
                <dt className="price-fee-term">{c.price.covers.people.label}</dt>
                <dd className="price-fee-amt">
                  <span className="price-fig">{figure(OFFER.covers)}</span>
                </dd>
                <dd className="price-fee-note">{c.price.covers.people.note}</dd>
              </div>
              <div className="price-fee" data-price-reveal style={{ ['--i' as string]: 1 }}>
                <dt className="price-fee-term">{c.price.covers.drafts.label}</dt>
                <dd className="price-fee-amt">
                  <span className="price-fig">{figure(OFFER.draftCap)}</span>
                </dd>
                <dd className="price-fee-note">{c.price.covers.drafts.note}</dd>
              </div>
            </dl>
            <p className="price-fee-note">{c.price.covers.note}</p>
          </div>

          {/* The trade, and the counter that makes it a fact rather than a
              countdown. On the uncapped tier there is no trade left to offer,
              so the whole block goes and one line stands in its place. Nothing
              here is written for a particular tier: the name comes from the
              tier on show, and the second half of what is got back appears
              only where that tier really does waive the setup fee. */}
          {capped ? (
            <div className="price-block">
              <p className="price-eyebrow">
                {c.price.founding.eyebrow.before}
                {tierName}
                {c.price.founding.eyebrow.after}
              </p>
              <h3 className="price-sub price-sub-lead" id="price-founding-h">
                {c.price.founding.title}
              </h3>
              <p className="price-subnote">{c.price.founding.lede}</p>

              <dl className="price-fees" aria-labelledby="price-founding-h">
                <div className="price-fee" data-price-reveal style={{ ['--i' as string]: 0 }}>
                  <dt className="price-fee-term">{c.price.founding.spots.label}</dt>
                  <dd className="price-fee-amt">
                    <span className="price-fig">
                      {figure(spotsLeft ?? 0)}
                      {c.price.founding.spots.of}
                      {figure(tier.total ?? 0)}
                    </span>
                  </dd>
                </div>
              </dl>

              <h4 className="price-sub" id="price-gives-h">
                {c.price.founding.givesTitle}
              </h4>
              <ol className="price-terms" aria-labelledby="price-gives-h">
                {c.price.founding.gives.map((g, i) => (
                  <li data-price-reveal style={{ ['--i' as string]: i }} key={g}>
                    <span className="price-term-t">{g}</span>
                  </li>
                ))}
              </ol>

              <h4 className="price-sub" id="price-gets-h">
                {c.price.founding.getsTitle}
              </h4>
              <ol className="price-terms" aria-labelledby="price-gets-h">
                <li data-price-reveal style={{ ['--i' as string]: 0 }}>
                  <span className="price-term-t">
                    {c.price.founding.gets.fee.before}
                    {tierName}
                    {c.price.founding.gets.fee.after}
                  </span>
                </li>
                {setupWaived ? (
                  <li data-price-reveal style={{ ['--i' as string]: 1 }}>
                    <span className="price-term-t">{c.price.founding.gets.setup}</span>
                  </li>
                ) : null}
              </ol>

              <p className="price-fee-note">{c.price.founding.note}</p>
            </div>
          ) : (
            <div className="price-block">
              <p className="price-fee-note">{c.price.founding.spotsClosed}</p>
            </div>
          )}

          <div className="price-block">
            <h3 className="price-sub price-sub-lead" id="price-free-h">
              {c.price.freeTitle}
            </h3>
            <p className="price-subnote">{c.price.freeNote}</p>

            <Disclosure label={c.price.termsLabel}>
              <ol className="price-terms" aria-labelledby="price-free-h">
                {c.price.terms.map((t, i) => (
                  <li data-price-reveal style={{ ['--i' as string]: i }} key={t.t}>
                    <span className="price-term-t">{t.t}</span>
                    <span className="price-term-n">{t.n}</span>
                  </li>
                ))}
              </ol>
            </Disclosure>
          </div>

          <div className="price-block">
            <h3 className="price-sub" id="price-when-h">
              {c.price.whenTitle}
            </h3>

            <ol className="price-stops" aria-labelledby="price-when-h">
              {c.price.stops.map((s, i) => (
                <li
                  className={'price-stop-item' + (i === stop ? ' is-on' : '')}
                  data-price-reveal
                  style={{ ['--i' as string]: i }}
                  key={s.day}
                >
                  <button
                    className="price-stop"
                    type="button"
                    data-price-stop
                    aria-current={i === stop ? 'step' : undefined}
                    ref={(el) => {
                      stopRefs.current[i] = el;
                    }}
                    onClick={() => select(i, false)}
                    /* Left and right are a convenience. There is no composite
                       role here to announce an arrow key convention, so nothing
                       is reachable by arrows alone and all three stops are
                       ordinary tab stops. The vertical keys are left to the
                       page, so scrolling still works while a stop has focus. */
                    onKeyDown={(e) => {
                      const n = c.price.stops.length;
                      let next = -1;
                      if (e.key === 'ArrowRight') next = (i + 1) % n;
                      else if (e.key === 'ArrowLeft') next = (i + n - 1) % n;
                      if (next < 0) return;
                      e.preventDefault();
                      select(next, true);
                    }}
                  >
                    <span className="price-stop-day">{s.day}</span>
                    <span className="price-stop-note">{s.note}</span>
                  </button>
                </li>
              ))}
            </ol>

            <div className={'price-total' + (struck ? ' is-struck' : '')} data-price-total>
              <p className="price-total-state" data-price-state>
                {c.price.stops[stop].state}
              </p>
              <div className="price-total-row">
                <span className="price-total-term">
                  {c.price.total.term}
                  <span className="price-total-sub">
                    {c.price.total.sub.label} {figure(OFFER.covers)}
                  </span>
                </span>
                <span className="price-total-amt">
                  <span className="price-total-fig" data-price-strike ref={strikeRef}>
                    {money(tier.price)}
                    <svg
                      className="price-strike-svg"
                      viewBox="0 0 120 14"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M2 9 C 26 4, 52 11, 76 6 S 106 4, 118 8" />
                    </svg>
                  </span>
                  <span
                    className={'price-total-zero' + (struck ? ' is-in' : '')}
                    data-price-zero
                    hidden={!struck}
                  >
                    {c.price.total.zero}
                  </span>
                  <span className="price-per">{c.price.total.per}</span>
                </span>
              </div>
              <p className="price-sr" role="status" aria-live="polite" data-price-status>
                {status}
              </p>
            </div>
          </div>
        </div>

        <div className="price-ask">
          <div className="price-ask-inner">
            <p className="price-ask-eyebrow">{c.price.askEyebrow}</p>
            <p className="price-ask-lead">
              {c.price.ask.before}
              <a href="https://doviloop.dev" rel="noopener">
                {c.price.ask.link}
              </a>
              {c.price.ask.after}
            </p>
            <a className="price-cta" href="#fit" onClick={onCta}>
              {c.price.cta}
            </a>
            <p className="price-cta-note">{c.price.ctaNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
