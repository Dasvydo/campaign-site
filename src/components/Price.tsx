import { useEffect, useRef, useState } from 'react';
import type { Content } from '../content/types';
import {
  OFFER,
  activeTier,
  formatCount,
  formatMoney,
  isCapped,
  noCustomersYet,
  remainingSpots,
  setupDue,
} from '../lib/offer';
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

  /* The two ways this band prints a number, and the reason they live inside the
     component rather than beside the imports: the language does. `c.htmlLang`
     is the locale the page was routed to, and the three languages this page is
     published in do not agree on what a full stop in a figure means. Danish
     reads it as a thousands separator, so an ungrouped 19.50 on /da says
     nineteen hundred and fifty, and a price is the last figure on a page that
     may be ambiguous. Both formatters round exactly as the old `usd` did, so
     nothing here changes what an amount is, only how it is written down. */

  /** An amount, with the currency the offer is priced in. Never a literal. */
  const money = (value: number): string => `${formatMoney(value, c.htmlLang)} ${OFFER.currency}`;

  /** A count of things rather than an amount. Same locale, different rounding:
      a count carries no decimal part, and a pooled cap in the thousands is
      grouped the way the language reading it groups. */
  const figure = (value: number): string => formatCount(value, c.htmlLang);

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

        {/* One panel, not six stacked blocks.

            This band used to ask for seven headings to be read in order before
            it said what anyone actually pays, and the only interactive thing on
            it, the timeline that strikes the total out, sat at the bottom where
            nobody scrolled to it. That order is now inverted. The stops are the
            control, the total is the answer, and everything that is neither is
            one click away rather than gone: the fee sheet, the ceilings and the
            terms are inside the disclosures below, so every figure and every
            note is still on the page and still in the DOM for a screen reader
            and for find-in-page.

            The headings those folded blocks need in order to label their lists
            are still here too, as .price-sr. A definition list wants a name,
            and losing the name to save a line of space would have traded a real
            thing for a cosmetic one. */}
        <div className="price-sheet">
          <div className="price-block price-panel">
            <h3 className="price-sr" id="price-when-h">
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
              {/* Keyed so it remounts and replays. Between the first two
                  stops this line is the only thing on the total that changes,
                  so if it arrives silently the stop reads as a dead control. */}
              <p className="price-total-state" data-price-state key={stop}>
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
                  {/* The ref stays on the outer span, which never remounts, so
                      the measured pen length survives a change of stop. Only
                      the digits inside are keyed, and remounting those is what
                      replays the count. */}
                  <span className="price-total-fig" data-price-strike ref={strikeRef}>
                    <span className="price-total-num" key={stop}>
                      {money(tier.price)}
                    </span>
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

            {/* The waiver, as a mark rather than a row of its own. The amount
                it is worth and the sentence that says so both live in the terms
                below; this is only the flag that there is something to read. */}
            {waived ? (
              <p className="price-waiver" data-price-reveal style={{ ['--i' as string]: 0 }}>
                <span className="price-waiver-term">{setupFee.term}</span>
                <span className="price-waiver-mark">{waived.label}</span>
              </p>
            ) : null}

            <p className="price-free" data-price-reveal style={{ ['--i' as string]: 1 }}>
              <strong className="price-free-t">{c.price.freeTitle}</strong>{' '}
              <span className="price-free-n">{c.price.freeNote}</span>
            </p>

            {/* The counter that makes the trade a fact rather than a countdown.
                It stays in the open: it is one short line, and it is the only
                thing on the band that changes as places go. What the trade
                costs and returns is the reading, and the reading folds. */}
            {capped ? (
              <div
                className="price-founding"
                data-price-reveal
                style={{ ['--i' as string]: 2 }}
              >
                <p className="price-eyebrow">
                  {c.price.founding.eyebrow.before}
                  {tierName}
                  {c.price.founding.eyebrow.after}
                </p>
                <h3 className="price-sr" id="price-founding-h">
                  {c.price.founding.title}
                </h3>
                <dl className="price-fees price-fees-tight" aria-labelledby="price-founding-h">
                  <div className="price-fee">
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
              </div>
            ) : (
              <p className="price-fee-note" data-price-reveal style={{ ['--i' as string]: 2 }}>
                {c.price.founding.spotsClosed}
              </p>
            )}

            <div className="price-more" data-price-reveal style={{ ['--i' as string]: 3 }}>
              <Disclosure label={c.price.termsLabel}>
                <ol className="price-terms">
                  {c.price.terms.map((t) => (
                    <li key={t.t}>
                      <span className="price-term-t">{t.t}</span>
                      <span className="price-term-n">{t.n}</span>
                    </li>
                  ))}
                </ol>

                {/* The fee sheet. The firm's own line repeats the total above
                    it on purpose: read on its own, inside the terms, it is the
                    line that says the fee is one fee and does not move with
                    head count. */}
                <h4 className="price-sr" id="price-fees-h">
                  {c.price.feesTitle}
                </h4>
                <dl className="price-fees" aria-labelledby="price-fees-h">
                  <div className="price-fee">
                    <dt className="price-fee-term">{firmFee.term}</dt>
                    <dd className="price-fee-amt">
                      <span className="price-fig">{money(tier.price)}</span>
                      <span className="price-per">{firmFee.per}</span>
                    </dd>
                    <dd className="price-fee-note">{firmFee.note}</dd>
                  </div>

                  {/* The setup fee is shown whether or not it is due. A fee
                      waived in silence is a fee nobody knows they were spared,
                      and the amount has to be legible for the waiver above to
                      mean anything. */}
                  <div className="price-fee">
                    <dt className="price-fee-term">{setupFee.term}</dt>
                    <dd className="price-fee-amt">
                      {waived ? (
                        <>
                          <span className="price-fig price-fig-off" aria-hidden="true">
                            {money(OFFER.setupFee)}
                          </span>
                          {/* The period stays with the amount it belongs to,
                              and the waiver follows as its own mark. Read in
                              the other order it ran together as "Waived once",
                              which says the waiver happens once rather than
                              that the fee does. */}
                          <span className="price-per" aria-hidden="true">
                            {setupFee.per}
                          </span>
                          <span className="price-per price-per-mark" aria-hidden="true">
                            {waived.label}
                          </span>
                          <span className="price-sr">
                            {waived.say.before}
                            {money(OFFER.setupFee)}
                            {waived.say.after}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="price-fig">{money(OFFER.setupFee)}</span>
                          <span className="price-per">{setupFee.per}</span>
                        </>
                      )}
                    </dd>
                    <dd className="price-fee-note">{setupFee.note}</dd>
                  </div>
                </dl>

                {/* Both ceilings are the whole firm's, not one person's, so
                    both read as one number the firm shares. */}
                <h4 className="price-sr" id="price-covers-h">
                  {c.price.covers.title}
                </h4>
                <dl className="price-fees" aria-labelledby="price-covers-h">
                  <div className="price-fee">
                    <dt className="price-fee-term">{c.price.covers.people.label}</dt>
                    <dd className="price-fee-amt">
                      <span className="price-fig">{figure(OFFER.covers)}</span>
                    </dd>
                    <dd className="price-fee-note">{c.price.covers.people.note}</dd>
                  </div>
                  <div className="price-fee">
                    <dt className="price-fee-term">{c.price.covers.drafts.label}</dt>
                    <dd className="price-fee-amt">
                      <span className="price-fig">{figure(OFFER.draftCap)}</span>
                    </dd>
                    <dd className="price-fee-note">{c.price.covers.drafts.note}</dd>
                  </div>
                </dl>
                <p className="price-fee-note">{c.price.covers.note}</p>
              </Disclosure>

              {capped ? (
                <Disclosure label={c.price.founding.title}>
                  {/* The admission comes off the page by itself. It is true
                      today and false from the first pilot onward, and the offer
                      is the only thing that knows which, so the offer decides.
                      What is left standing is the sentence that explains the
                      trade, which is true at any count and reads on its own. */}
                  <p className="price-subnote">
                    {noCustomersYet() ? <>{c.price.founding.lede.noProofYet} </> : null}
                    {c.price.founding.lede.trade}
                  </p>

                  <h4 className="price-sr" id="price-gives-h">
                    {c.price.founding.givesTitle}
                  </h4>
                  <ol className="price-terms" aria-labelledby="price-gives-h">
                    {c.price.founding.gives.map((g) => (
                      <li key={g}>
                        <span className="price-term-t">{g}</span>
                      </li>
                    ))}
                  </ol>

                  <h4 className="price-sr" id="price-gets-h">
                    {c.price.founding.getsTitle}
                  </h4>
                  <ol className="price-terms" aria-labelledby="price-gets-h">
                    <li>
                      <span className="price-term-t">
                        {c.price.founding.gets.fee.before}
                        {tierName}
                        {c.price.founding.gets.fee.after}
                      </span>
                    </li>
                    {setupWaived ? (
                      <li>
                        <span className="price-term-t">{c.price.founding.gets.setup}</span>
                      </li>
                    ) : null}
                  </ol>

                  <p className="price-fee-note">{c.price.founding.note}</p>
                </Disclosure>
              ) : null}
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
              {c.nav.cta}
            </a>
            <p className="price-cta-note">{c.price.ctaNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
