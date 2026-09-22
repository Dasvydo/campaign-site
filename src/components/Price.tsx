import { useEffect, useRef, useState } from 'react';
import type { Content } from '../content/types';
import {
  OFFER,
  foundingOpen,
  packageById,
  formatCount,
  formatMoney,
  headlinePackage,
  noCustomersYet,
  pilotsStarted,
  remainingFoundingPlaces,
  setupDue,
} from '../lib/offer';
import type { PackageId } from '../lib/offer';
import { LINKEDIN_URL, LINKEDIN_LABEL } from '../lib/env';
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
 * `onSeen` is the stricter one, and it feeds Meta. It needs the band to cover
 * the middle half of the screen CONTINUOUSLY for two seconds, per
 * campaigns/pixel-install.md in the ad-engine repo. That dwell is the whole
 * point: the pixel audience it builds is the campaign's only high-intent pool,
 * and counting everyone who scrolled past the price on the way to the form
 * would dilute it until it means nothing. Scrolling away before the two seconds
 * are up cancels it.
 *
 * ⚠️ It used to ask for 50% of THE BAND, and on a phone that was unreachable.
 * IntersectionObserver measures the ratio against the target's own area, so a
 * target taller than the viewport can never exceed viewport / target however
 * far you scroll. This band renders about 1,705px tall against an 844px phone,
 * which caps the ratio at 0.49 against a gate of 0.50. Measured in a real
 * browser on 2026-09-22: peak 0.494 on a 390x844 viewport, 0.684 on 1440x900.
 * So ViewContent fired on desktop and NEVER on mobile, and mobile is where paid
 * traffic lands - the high-intent pool was quietly not being built at all.
 *
 * Framing it the other way round fixes it for good. Shrinking the root by 25%
 * top and bottom and asking only for any overlap means "the price band is what
 * fills the middle of your screen", which is what the signal was always trying
 * to say, and it holds on every viewport because it no longer divides by the
 * height of the thing being measured. The same idiom is already used further
 * down this file for the reveal.
 *
 * Both fire at most once per page load.
 */

export function Price({
  c,
  onView,
  onSeen,
  onCta,
  onPackagePick,
}: {
  c: Content;
  onView: () => void;
  onSeen?: () => void;
  onCta: () => void;
  /* The two package cards are the only place on the page where a reader says
     which size they are. The calculator one section down was working it out
     independently from its own head count slider, so a reader who pressed
     Firm and scrolled read "This costs (Desk)" under a fee they had just
     rejected, against an allowance of 5,000 drafts they were not buying. The
     press is a statement of size; it travels. */
  onPackagePick?: (id: PackageId) => void;
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
      /* Not a ratio of the band. The root is cut to its middle half and any
         overlap counts, so the test is "the price is what is on screen" rather
         than "half of a band taller than the screen is on screen", which no
         phone can ever satisfy. See the header note. */
      { threshold: 0, rootMargin: '-25% 0px -25% 0px' },
    );
    obs.observe(node);
    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [onSeen]);

  /* The package the band is describing. The reader picks it from the two
     cards by counting their own people; until they do, it is the one the
     offer leads with. Held once so that the fee under the timeline, the
     coverage in the terms and the card that is lit are all the same package. */
  const [pkgId, setPkgId] = useState<PackageId>(headlinePackage().id);
  const pkg = packageById(pkgId);
  /* The founding cohort is the only thing on this page with a capacity now.
     The price does not move when it fills; the setup fee stops being waived. */
  const capped = foundingOpen();
  const spotsLeft = remainingFoundingPlaces();
  /* Has the cohort started to fill? Counted in STARTED PILOTS, never in holds,
     which is the same rule `noCustomersYet()` uses and for the same reason: a
     held place is a booked call, and a booked call is not a customer.

     It was `spotsLeft < places` for one commit, which counts holds. An
     independent verifier found the state that breaks: one hold and no started
     pilot rendered "Places still open: 4 of 5" inches under "We have no
     customers to point at yet." The counter implied a firm had signed while
     the sentence above said none had, which is a weaker form of exactly the
     adjacency the gate was added to remove. The two derivations now agree. */
  const anyPlaceTaken = pilotsStarted() > 0;
  /* Both halves have to agree: the cohort has to still be giving the fee away,
     and the copy has to have the words for it. */
  const setupWaived = setupDue() === 0;
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

  const struck = stop === c.price.stops.length - 1;

  /* What the total is actually showing at a stop, so the announcement reads
     the figure rather than pointing at it: the monthly fee, or the zero that
     replaces it once the pen has gone through it. */
  const shownAt = (i: number): string =>
    i === c.price.stops.length - 1 ? c.price.total.zero : money(pkg.price);

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
    const sec = sectionRef.current;
    if (!sec) return;
    sec.querySelectorAll<HTMLElement>('.price-pkg-strike').forEach((wrap) => {
      const path = wrap.querySelector('path');
      if (!path) return;
      try {
        const len = path.getTotalLength();
        wrap.style.setProperty('--price-len', String(len));
        wrap.style.setProperty('--price-dur', Math.max(240, Math.min(620, len * 2.1)) + 'ms');
      } catch {
        /* leave the CSS fallbacks in place */
      }
    });
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
            {/* The two packages, in the open, and the reader picks by
                counting their own people. The lit card is the package the
                timeline strikes out and the coverage in the terms describes,
                so the band never shows one package's fee beside another's
                ceiling. Every figure on a card is read from the offer: a card
                is matched to its package by id, and a row naming a package
                that does not exist renders nothing rather than a blank fee. */}
            <h3 className="price-sr" id="price-packages-h">
              {c.price.packages.title}
            </h3>
            <p className="price-pick">{c.price.packages.pick}</p>
            <div className="price-pkgs" role="group" aria-labelledby="price-packages-h">
              {c.price.packages.rows.map((row) => {
                const p = OFFER.order.includes(row.id as PackageId)
                  ? packageById(row.id as PackageId)
                  : null;
                if (!p) return null;
                const on = p.id === pkg.id;
                const struckHere = on && struck;
                return (
                  <button
                    type="button"
                    className={'price-pkg' + (on ? ' is-on' : '') + (struckHere ? ' is-struck' : '')}
                    aria-pressed={on}
                    data-price-pkg={p.id}
                    key={p.id}
                    onClick={() => {
                      setPkgId(p.id);
                      onPackagePick?.(p.id);
                    }}
                  >
                    <span className="price-pkg-name">{row.name}</span>
                    <span className="price-pkg-fee">
                      {/* The pen strikes the fee out on the card itself, on
                          the last stop of the timeline. The digits are keyed
                          on the stop so the count replays when it changes;
                          the wrapper is not, so the measured pen length
                          survives. Only the lit card carries the strike, so
                          the marker below names exactly one fee. */}
                      <span
                        className="price-pkg-strike"
                        data-price-strike={on ? '' : undefined}
                      >
                        <span className="price-pkg-fig price-total-num" key={on ? stop : 'off'}>
                          {money(p.price)}
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
                      {/* Rendered only while struck, not merely hidden: a
                          hidden span is still text to a screen reader's
                          reading of the card and to find-in-page. */}
                      {struckHere ? (
                        <span className="price-pkg-zero is-in" data-price-zero>
                          {c.price.total.zero}
                        </span>
                      ) : null}
                      <span className="price-pkg-per">{firmFee.per}</span>
                    </span>
                    <span className="price-pkg-line">
                      {c.price.packages.peopleLabel} {figure(p.covers)}
                    </span>
                    <span className="price-pkg-line">
                      {c.price.packages.draftsLabel} {figure(p.draftCap)}
                    </span>
                    <span className="price-pkg-note">{row.note}</span>
                  </button>
                );
              })}
            </div>
            {/* For the firm that is smaller than both cards. The pair reads
                down: too small, then too big, then what happens either way. */}
            <p className="price-fee-note price-pkgs-under">
              {c.price.packages.under.before}
              <a className="price-link" href="https://doviloop.dev" target="_blank" rel="noopener noreferrer">
                {c.price.packages.under.link}
              </a>
              {c.price.packages.under.after}
            </p>
            {/* For the firm that is bigger than both cards. The fit check
                books anyone above nine people, so a firm of forty reaches the
                call having seen two prices that do not apply to them and a
                calculator whose head count control stops below their size.
                Said here, where they are looking, rather than left for the
                call. */}
            <p className="price-fee-note price-pkgs-over">{c.price.packages.over}</p>

            {/* The timeline, directly under the cards it acts on. Three
                stops; the last strikes the lit card's fee out and puts nothing
                in its place, which is the risk reversal made visible rather
                than asserted. The live region says what changed, because a
                struck out figure is a picture. */}
            <div className="price-timeline">
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
              {/* Keyed so it remounts and replays. Between the first two
                  stops this line is the only thing that changes, so if it
                  arrived silently the stop would read as a dead control. */}
              <p className={'price-state' + (struck ? ' is-struck' : '')} data-price-state key={stop}>
                {c.price.stops[stop].state}
              </p>
              <p className="price-sr" role="status" aria-live="polite" data-price-status>
                {status}
              </p>
            </div>

            {/* No waiver line here.

                It read "Setup / Waived", with the struck amount and the
                sentence about the founding places. Founder's call: on the
                open band, before anybody has been told what setup normally
                costs, a struck 500 EUR is a discount arriving ahead of the
                thing it discounts, and it reads as pressure rather than as a
                saving. The fee sheet inside "Show the terms" still prints the
                amount and still says it is waived while the places are open,
                which is where a reader who wants the number goes looking. The
                gap this leaves is deliberate: the band holds the fee, the
                trade and the counter, and nothing else. */}


            {/* The trade, in the open, in the order a reader needs it: why
                the price is low, that it stays there, what it asks for, and
                how many places are left. The counter sits here rather than
                further down because it is the same five the reason names. */}
            {capped ? (
              <div className="price-trade" data-price-trade>
                {/* The admission, the reason and the lock, as one paragraph.

                    The admission is on the open band rather than behind a
                    disclosure nobody opens: a verifier had already made
                    exactly that point about the founder's signature, and a
                    sentence behind a closed disclosure is no sentence at all
                    for most readers.

                    It used to be a paragraph of its own, ending "These places
                    are a trade, not a discount", above a second paragraph
                    saying the price is low because we need five firms who will
                    say it works. That is the same sentence twice, once without
                    the number. The founder called this block redundant three
                    times; one of the two had to go, and the one carrying no
                    figure went.

                    `data-price-lede` is how scripts/harness-claim.tsx finds
                    the admission, and it is absent entirely once a pilot has
                    started, which is what that harness now asserts. */}
                <p className="price-reason" data-price-reason>
                  {noCustomersYet() ? (
                    <span className="price-subnote" data-price-lede>
                      {c.price.founding.noProofYet}
                    </span>
                  ) : null}
                  {noCustomersYet() ? ' ' : null}
                  {c.price.founding.reason.before}
                  {figure(OFFER.founding.places)}
                  {c.price.founding.reason.after}{' '}
                  <span className="price-lock" data-price-lock>
                    {c.price.founding.lock}
                  </span>
                </p>
                {/* The four obligations, on one line.

                    The lead-in is visible, not screen reader only. It was
                    `price-sr`, so a sighted reader met four bullets with
                    nothing saying what they were: a list of obligations
                    reading as if it might be a list of benefits.

                    The four used to be four full sentences under a heading of
                    their own, which is five lines of a block the founder had
                    already called too much to read. They are noun phrases in
                    one run now, still four `<li>` so the list is still a list
                    to a screen reader, and the middot between them is drawn in
                    CSS so no translation has to supply a conjunction. */}
                <div className="price-gives-line">
                  <h3 className="price-gives-h" id="price-gives-open-h">
                    {c.price.founding.givesTitle}
                  </h3>{' '}
                  <ul className="price-gives" aria-labelledby="price-gives-open-h">
                    {c.price.founding.gives.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </div>
                {/* The counter earns its place only once it is moving.

                    It used to render from the first visitor, which meant the
                    largest number in the band read "5 of 5" beside a sentence
                    admitting there are no customers yet. A scarcity counter
                    generates urgency while it drains and doubt while it is
                    full, and this one sat full, in display serif, directly
                    under the reason it exists. Nothing here is hidden: the
                    cohort's size is still printed in the reason above, which
                    is the number the offer is actually making. What is
                    withheld is the fact that none of them has gone, and that
                    is ours to withhold until it stops being true. */}
                {anyPlaceTaken ? (
                  <div className="price-founding" data-price-reveal style={{ ['--i' as string]: 1 }}>
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
                            {figure(OFFER.founding.places)}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : null}

                {/* The one person the trade is about, on the open page.

                    It was inside the "A trade, not a discount" disclosure for
                    one commit, which is closed at rest. An independent verifier
                    put it plainly: a name behind a disclosure is still no human
                    being for every reader who does not click, and on a landing
                    page that is most of them. It defeated the entire purpose of
                    adding it. It sits on the band now, under the trade it
                    explains and under the count of what is left. */}
                {/* The sign-off, and somewhere to check who is signing.

                    It was a name set over the line in display serif, and he
                    asked for that gone. What came back is a signature rather
                    than a nameplate: the sentence, then a first name, then the
                    profile it belongs to, so "I built this" is a claim a
                    reader can take two seconds to verify. That is worth more
                    on a page with no customers to point at than the name ever
                    was as a heading.

                    The address is shown in full rather than behind the word
                    "LinkedIn", so a reader knows where it goes before they
                    press it. */}
                <p className="price-signature">
                  <span className="price-signature-line">
                    {c.price.founding.signature.line}
                  </span>
                  <span className="price-signature-by">
                    {'\u2014 '}
                    <span className="price-signature-who">
                      {c.price.founding.signature.name}
                    </span>
                    {', '}
                    <a
                      className="price-signature-link"
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {LINKEDIN_LABEL}
                    </a>
                  </span>
                </p>
              </div>
            ) : (
              <p className="price-fee-note" data-price-reveal style={{ ['--i' as string]: 1 }}>
                {c.price.founding.spotsClosed}
              </p>
            )}


            {/* What is in the product, and it is the same list on both
                cards, which is the point of printing it once. */}
            {/* Six lines of product detail, folded away like the terms.

                They were open on the band, which put six sentences between the
                trade and the timeline for every reader, including the ones who
                had already decided. The heading was `price-sr` - spoken to a
                screen reader and invisible to everyone else - so the list sat
                there with nothing above it saying what it was. Made the
                disclosure's own label, it does both jobs: it names the list,
                and it is the thing you press to read it. */}
            <div className="price-incl-fold">
              <Disclosure label={c.price.included.title}>
                <ul className="price-incl">
                  {c.price.included.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Disclosure>
            </div>

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

                {/* The one thing about the trade a reader might need and most
                    will not: how to take the product without being named. It
                    was on the open band, where it was a fifth block in a
                    section the founder had already called too long. */}
                <p className="price-fee-note">{c.price.founding.note}</p>

                {/* The fee sheet. The firm's own line repeats the lit card on
                    purpose: read on its own, inside the terms, it is the line
                    that says the fee is one fee and does not move with head
                    count. */}
                <h4 className="price-sr" id="price-fees-h">
                  {c.price.feesTitle}
                </h4>
                <dl className="price-fees" aria-labelledby="price-fees-h">
                  <div className="price-fee">
                    <dt className="price-fee-term">{firmFee.term}</dt>
                    <dd className="price-fee-amt">
                      <span className="price-fig">{money(pkg.price)}</span>
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
                      <span className="price-fig">{figure(pkg.covers)}</span>
                    </dd>
                    <dd className="price-fee-note">{c.price.covers.people.note}</dd>
                  </div>
                  <div className="price-fee">
                    <dt className="price-fee-term">{c.price.covers.drafts.label}</dt>
                    <dd className="price-fee-amt">
                      <span className="price-fig">{figure(pkg.draftCap)}</span>
                    </dd>
                    <dd className="price-fee-note">{c.price.covers.drafts.note}</dd>
                  </div>
                </dl>
                <p className="price-fee-note">{c.price.covers.note}</p>
              </Disclosure>

              {/* "A trade, not a discount" used to be a second, collapsed
                  telling of the block above. Read side by side it repeated the
                  price lock word for word, the setup waiver that is already a
                  chip on the band, and the count of firms the reason already
                  names. The founder read the section and said it was
                  redundant and too long, and he was right: what was unique in
                  it, the admission and the opt out, is on the open band now,
                  and the rest is gone rather than said twice. */}
            </div>
          </div>
        </div>

        <div className="price-ask">
          <div className="price-ask-inner">
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
