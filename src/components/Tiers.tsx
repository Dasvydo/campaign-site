import { useRef, useState } from 'react';
import type { Content } from '../content/types';
import { PRICING, count, money, tierById } from '../lib/pricing';
import type { TierId } from '../lib/pricing';
import { Disclosure } from './Disclosure';

/**
 * The tiers, on a charcoal band, under the loudest sentence on the page.
 *
 * THE BRIEF, VERBATIM. "Immediately after the hero section, we want to have
 * actually pricing tiers, just like it is on the website for DoviLoop. And we
 * want to make it very, very painfully obvious that it's free for the first 14
 * days." Both halves are load bearing, and the second one decides the layout:
 * the free fortnight is the section's own heading, set in the largest type
 * anywhere on the page, and it is said again on every card and a third time
 * under the button. A reader who takes in nothing else takes in that.
 *
 * NOT ONE FIGURE IS WRITTEN HERE. Every rate, seat band, day marker and the
 * nothing on the last stop is read from src/lib/pricing.ts at render time, and
 * the copy in src/content/<locale>/tiers.ts carries only the words around
 * them. A price change is one edit in one file, and it cannot leave the card
 * saying one thing and the timeline another.
 *
 * THE COPY IS TWO FILES, ON PURPOSE. `tiers` is this section's own: the
 * headline, the cards, the unit. `trial` is the timeline, the terms, the
 * capability list and the note under the button, which were written for the
 * price band that used to be here and rescued out of it before it was deleted.
 * It is the best prose in the repository and it exists in three languages, so
 * it is RENDERED here rather than rewritten or copied.
 *
 * WHAT THE READER CAN DO. Two controls, and they act on each other. The cards
 * pick a tier; the stops walk the trial. The total under the stops is the
 * answer to both, and on the last stop it is struck through and reads nothing,
 * which is the risk reversal shown rather than asserted. The total sits
 * directly under the stops rather than on the card, because on a phone the
 * cards are a screen and a half above the control and a change nobody can see
 * is a control that reads as dead.
 *
 * A struck out figure is a picture, so the live region says the amount out
 * loud. That is what `trial.stops[].say` is for, and why it splits around the
 * figure: the sentence is the locale's, the number is the module's.
 */
export function Tiers({ c }: { c: Content }) {
  const t = c.tiers;
  const lang = c.htmlLang;

  /* No tier is recommended. The first in print order is lit so that the total
     under the timeline has something to show before anybody has pressed
     anything; a lit middle card would be a recommendation nobody has made. */
  const [tierId, setTierId] = useState<TierId>(PRICING.order[0]);
  const [stop, setStop] = useState(0);
  const [status, setStatus] = useState('');
  const stopRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const chosen = tierById(tierId);
  const lastStop = c.trial.stops.length - 1;
  const struck = stop === lastStop;

  /* What the total reads at a given stop, on a given tier. The last stop is
     the one that strikes the fee out, and what replaces it is a figure like
     any other: PRICING.trial.price, not a zero typed into a component. */
  const totalAt = (i: number, id: TierId) =>
    money(i === lastStop ? PRICING.trial.price : tierById(id).seat, lang);

  /* The announcement for a stop, with the amount the total is showing spliced
     into the sentence the locale wrote around it. A struck out figure is a
     picture, so the amount is said out loud rather than pointed at. */
  const say = (i: number, id: TierId) => {
    const s = c.trial.stops[i];
    return s.say.before + totalAt(i, id) + s.say.after;
  };

  /* Which count a stop's day marker wraps. `start` takes the day the trial
     begins, `end` the day it runs out, and `none` takes no count at all, in
     which case the two halves of the marker are joined as they stand. The
     stop does not know what any of them mean; the copy does. */
  const dayOf = (figure: Content['trial']['stops'][number]['figure']) =>
    figure === 'start' ? PRICING.trial.startDay : figure === 'end' ? PRICING.trial.days : null;

  const select = (i: number, moveFocus: boolean) => {
    setStop(i);
    setStatus(say(i, tierId));
    if (moveFocus) stopRefs.current[i]?.focus();
  };

  /* Picking a tier changes the total too, and the total is somewhere else on
     the screen from the card that was pressed. Same announcement, same
     sentence, the other control. */
  const pick = (id: TierId) => {
    setTierId(id);
    setStatus(say(stop, id));
  };

  const days = count(PRICING.trial.days, lang);

  return (
    /* on-dark flips all six dark ground interaction values at once: the rest
       and lift shadows become a warm halo, the focus ring becomes the amber
       that is legible on charcoal, and the button inverts. Nothing below
       declares a hover shadow, a press or a ring of its own. */
    <section id="price" className="tiers on-dark" aria-labelledby="tiers-h">
      <div className="tiers-wrap">
        <header className="tiers-head">
          <p className="tiers-eyebrow">{t.eyebrow}</p>
          {/* The heading IS the offer. It reads, in one breath, "Free for the
              first 14 days", with the count set as a display numeral between
              the two halves of the sentence the locale wrote around it. */}
          <h2 className="tiers-h" id="tiers-h">
            <span className="tiers-h-lead">{t.headline.before}</span>{' '}
            <span className="tiers-h-free">
              <span className="tiers-h-fig">{days}</span>{' '}
              <span className="tiers-h-unit">{t.headline.after}</span>
            </span>
          </h2>
          <p className="tiers-lede">{t.lede}</p>
        </header>

        {/* The tiers. Per seat, per month, cheapest first. Each card is a
            button because pressing one is how a reader says which size they
            are, and the total below follows the press. A card that named a
            tier the data module does not have would be a build failure, not a
            blank fee: the id on the copy is typed as the module's own union. */}
        <p className="tiers-pick" id="tiers-pick">
          {t.pickLead}
        </p>
        <div className="tiers-row" role="group" aria-labelledby="tiers-pick">
          {t.rows.map((row) => {
            const tier = tierById(row.id);
            const on = row.id === tierId;
            return (
              <button
                key={row.id}
                type="button"
                className={'tiers-card ix-raise' + (on ? ' is-on' : '')}
                aria-pressed={on}
                data-tier={row.id}
                onClick={() => pick(row.id)}
              >
                {/* The fortnight, again, on every card. The founder asked for
                    painfully obvious and this is the cheapest way to be it:
                    whichever card a reader is reading says it. */}
                <span className="tiers-badge">
                  <span className="tiers-badge-dot" aria-hidden="true" />
                  {t.freeBadge.before}
                  {days}
                  {t.freeBadge.after}
                </span>
                <span className="tiers-name">{row.name}</span>
                <span className="tiers-fee">
                  <span className="tiers-fee-fig">{money(tier.seat, lang)}</span>
                  <span className="tiers-fee-per">{t.per}</span>
                </span>
                <span className="tiers-line">{row.line}</span>
                {/* The seat band as a label and then the count, which is the
                    one shape that is right at every count in all three
                    languages. The label knows whether it is an only seat, a
                    ceiling or a floor; the figure is the module's. */}
                <span className="tiers-seats">
                  <span className="tiers-seats-label">{row.seatsLabel}</span>
                  <span className="tiers-seats-fig">{count(tier.seats, lang)}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* The trial, walked. Three stops, and the total under them is what
            they act on. */}
        <div className="tiers-when">
          <h3 className="tiers-when-h" id="tiers-when-h">
            {c.trial.whenTitle}
          </h3>
          <ol className="tiers-stops" aria-labelledby="tiers-when-h">
            {c.trial.stops.map((s, i) => {
              const n = dayOf(s.figure);
              return (
                /* Keyed on the two halves of the day marker. The old price
                   band keyed on `day` when `day` was one string; it is a pair
                   now, and the pair is what is unique. */
                <li
                  key={s.day.before + s.day.after}
                  className={'tiers-stop-item' + (i === stop ? ' is-on' : '')}
                >
                  <button
                    type="button"
                    className="tiers-stop ix-tap"
                    aria-current={i === stop ? 'step' : undefined}
                    ref={(el) => {
                      stopRefs.current[i] = el;
                    }}
                    onClick={() => select(i, false)}
                    /* Left and right are a convenience, not a contract. There
                       is no composite role here announcing an arrow key
                       convention, so all three stops stay ordinary tab stops
                       and the vertical keys are left to the page, which is
                       what keeps scrolling working while a stop has focus. */
                    onKeyDown={(e) => {
                      const n2 = c.trial.stops.length;
                      let next = -1;
                      if (e.key === 'ArrowRight') next = (i + 1) % n2;
                      else if (e.key === 'ArrowLeft') next = (i + n2 - 1) % n2;
                      if (next < 0) return;
                      e.preventDefault();
                      select(next, true);
                    }}
                  >
                    <span className="tiers-stop-day">
                      {s.day.before}
                      {n === null ? null : count(n, lang)}
                      {s.day.after}
                    </span>
                    <span className="tiers-stop-note">{s.note}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className={'tiers-total' + (struck ? ' is-struck' : '')}>
            {/* Keyed on the stop so it remounts and replays. Between the first
                two stops this line is the only thing that changes, and a state
                that arrived silently would make the stop read as dead. */}
            <p className="tiers-state" key={stop}>
              {c.trial.stops[stop].state}
            </p>
            <p className="tiers-total-row">
              <span className="tiers-total-name">{nameOf(t, tierId)}</span>
              <span className="tiers-total-amt">
                <span className="tiers-total-strike">
                  <span className="tiers-total-fig">{money(chosen.seat, lang)}</span>
                  {/* pathLength normalises the stroke to one unit, so the
                      dash can be drawn from CSS without measuring the path in
                      JavaScript the way the old band did. */}
                  <svg
                    className="tiers-strike"
                    viewBox="0 0 120 14"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path pathLength="1" d="M2 9 C 26 4, 52 11, 76 6 S 106 4, 118 8" />
                  </svg>
                </span>
                {/* Rendered only while struck rather than hidden: a hidden
                    span is still text to find-in-page and to a screen reader
                    reading the row. */}
                {struck ? (
                  <span className="tiers-total-zero">{money(PRICING.trial.price, lang)}</span>
                ) : null}
                <span className="tiers-total-per">{t.per}</span>
              </span>
            </p>
          </div>

          <p className="tiers-sr" role="status" aria-live="polite">
            {status}
          </p>
        </div>

        {/* The ask, while "nothing invoiced at all" is still on the screen.
            The label is nav.cta, the one set of words this page asks for
            anything in, and the note under it is the trial copy's own. The
            href is #fit along with the hero's three, and is dangling until
            the signup exists; whoever builds it repoints all four. */}
        <div className="tiers-act">
          <a className="btn btn-primary tiers-cta" href="#fit">
            {c.nav.cta}
          </a>
          <p className="tiers-note">{c.trial.ctaNote}</p>
        </div>

        <div className="tiers-inc">
          <h3 className="tiers-inc-h" id="tiers-inc-h">
            {c.trial.included.title}
          </h3>
          <ul className="tiers-inc-list" aria-labelledby="tiers-inc-h">
            {c.trial.included.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {/* The terms behind the page's own disclosure rather than a second
              one written here. Native <details>: it opens with no JavaScript,
              it is already a disclosure to a screen reader, and find-in-page
              can open it. */}
          <Disclosure label={c.trial.termsLabel}>
            <dl className="disc-dl">
              {c.trial.terms.map((term) => (
                <div key={term.t}>
                  <dt>{term.t}</dt>
                  <dd>{term.n}</dd>
                </div>
              ))}
            </dl>
          </Disclosure>
        </div>
      </div>
    </section>
  );
}

/** The chosen tier's name, read off the copy rather than off the data module:
    the module holds the figures, the locale holds the words. */
function nameOf(t: Content['tiers'], id: TierId): string {
  return t.rows.find((row) => row.id === id)?.name ?? '';
}
