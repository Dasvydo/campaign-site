import { useEffect, useId, useRef, useState } from 'react';
import type { Content } from '../content/types';
import { OFFER, formatCount, formatMoney } from '../lib/offer';
import {
  VALUE,
  draftRatePercent,
  formatShare,
  hoursBack,
  hourlyStart,
  keptPerMonth,
  packageFor,
  peopleRange,
  worthPerMonth,
} from '../lib/value';
import { Disclosure } from './Disclosure';

/**
 * The calculator. Four figures of the reader's, one sum, in order.
 *
 * How many people answer mail, how much each of them gets, what an hour of
 * their time costs, and how many minutes a prepared draft saves. The panel
 * multiplies them out in front of the reader and takes the fee off at the
 * end, so every number on it is one they can check with a pencil, and the
 * page never asserts a saving: it computes one from what it was given.
 *
 * Three of the four inputs are facts about the reader's firm that only they
 * know. The fourth, the minutes, is an assumption of ours that has never been
 * timed, and the panel says so beside the control rather than in small print.
 * The one measured figure on the panel, the share of mail that gets a draft,
 * is read from src/lib/value.ts along with its provenance, and the fee from
 * src/lib/offer.ts, so nothing here can drift from the price band above it.
 *
 * Every modelled figure is hedged with "about". The fee is not, because the
 * fee is exact.
 */
export function Numbers({ c }: { c: Content }) {
  const secRef = useRef<HTMLElement | null>(null);
  const uid = useId();

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;

    const beats = Array.from(sec.querySelectorAll('.numbers-beat'));
    const marks = Array.from(sec.querySelectorAll('.numbers-hl'));
    const settle = () => {
      sec.classList.remove('numbers-anim');
      beats.forEach((el) => el.classList.add('numbers-in'));
      marks.forEach((el) => el.classList.add('numbers-marked'));
    };

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      settle();
      return;
    }

    sec.classList.add('numbers-anim');
    const safety = window.setTimeout(settle, 2000);
    const observers: IntersectionObserver[] = [];

    const watch = (targets: Element[], cls: string, rootMargin: string) => {
      if (!targets.length) return;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target.classList.add(cls);
            io.unobserve(e.target);
          }
        },
        { threshold: 0, rootMargin },
      );
      targets.forEach((t) => io.observe(t));
      observers.push(io);
    };

    watch(beats, 'numbers-in', '-10% 0px -14% 0px');

    let cancelled = false;
    const startMarks = () => {
      if (!cancelled) watch(marks, 'numbers-marked', '-30% 0px -22% 0px');
    };
    if (document.fonts?.ready) {
      document.fonts.ready.then(startMarks, startMarks);
    } else {
      startMarks();
    }

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      observers.forEach((io) => io.disconnect());
    };
  }, []);

  /* The four controls, each opening where the model says it should. The
     hourly one opens on the market the page is read in, because the honest
     starting figure for a Danish firm and a Lithuanian one are not the same
     number. */
  const people = peopleRange();
  const [heads, setHeads] = useState(people.start);
  const [inbound, setInbound] = useState(VALUE.inbound.start);
  const [hourly, setHourly] = useState(() => hourlyStart(c.htmlLang));
  const [minutes, setMinutes] = useState(VALUE.minutesPerDraft.value);

  /* The sum, one helper per row, so the panel cannot do its own division. */
  const pkg = packageFor(heads);
  const hours = hoursBack(heads, inbound, minutes);
  const worth = worthPerMonth(heads, inbound, minutes, hourly);
  const kept = keptPerMonth(heads, inbound, minutes, hourly);
  const clears = kept !== null && kept >= 0;
  const feeShare = worth === null || worth <= 0 || pkg === null ? null : Math.min(1, pkg.price / worth);

  const money = (v: number): string => `${formatMoney(v, c.htmlLang)} ${OFFER.currency}`;
  const figure = (v: number): string => formatCount(v, c.htmlLang);
  const pkgName = pkg ? (c.price.packages.rows.find((r) => r.id === pkg.id)?.name ?? pkg.id) : '';

  /* The live region says the answer, not the slider position. */
  const [status, setStatus] = useState('');
  const sayTimer = useRef<number>(0);
  useEffect(() => {
    window.clearTimeout(sayTimer.current);
    sayTimer.current = window.setTimeout(() => {
      setStatus(
        kept === null
          ? ''
          : `${c.numbers.beats.keep.label} ${c.numbers.about}${money(Math.round(kept))}${c.numbers.units.perMonth}`,
      );
    }, 400);
    return () => window.clearTimeout(sayTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kept]);

  const control = (
    key: 'people' | 'inbound' | 'hourly' | 'minutes',
    value: number,
    set: (n: number) => void,
    range: { min: number; max: number; step: number },
    shown: string,
    note?: string,
  ) => {
    const id = `${uid}-${key}`;
    return (
      <div className="numbers-field">
        <div className="numbers-control-head">
          <label className="numbers-control-label" htmlFor={id}>
            {c.numbers.inputs[key].label}
          </label>
          <output className="numbers-control-count" htmlFor={id} data-n-input={key}>
            {shown}
          </output>
        </div>
        <input
          id={id}
          name={key}
          className="numbers-range"
          type="range"
          min={range.min}
          max={range.max}
          step={range.step}
          value={value}
          onChange={(e) => set(Number(e.currentTarget.value))}
        />
        {note ? <p className="numbers-field-note">{note}</p> : null}
      </div>
    );
  };

  return (
    <section id="numbers" aria-labelledby="numbers-h" ref={secRef}>
      <div className="numbers-wrap">
        <p className="numbers-folio" aria-hidden="true">
          04
        </p>
        <header className="numbers-head">
          <p className="numbers-eyebrow">{c.numbers.eyebrow}</p>
          <h2 className="numbers-h" id="numbers-h">
            {c.numbers.title}
          </h2>
        </header>

        <div className="numbers-panel">
          <div className="numbers-fields">
            {control('people', heads, setHeads, people, figure(heads))}
            {control('inbound', inbound, setInbound, VALUE.inbound, figure(inbound))}
            {control('hourly', hourly, setHourly, VALUE.hourly, money(hourly) + c.numbers.units.perHour)}
            {control(
              'minutes',
              minutes,
              setMinutes,
              VALUE.minutes,
              figure(minutes),
              VALUE.minutesPerDraft.basis === 'assumed' ? c.numbers.inputs.minutes.note : undefined,
            )}
          </div>

          {/* The sum, read down. Each row is a label with its colon and then
              the figure, which is the shape that is right in every language
              at every count. The fee row is the only one with no hedge on it,
              because the fee is the one number on the panel we know exactly. */}
          <dl className="numbers-beats">
            <div className="numbers-beat" data-n-hours>
              <dt className="numbers-term">{c.numbers.beats.hours.label}</dt>
              <dd className="numbers-amt">
                {hours === null ? '' : <><span className="numbers-about">{c.numbers.about}</span>{figure(hours)}{c.numbers.units.hours}</>}
              </dd>
            </div>
            <div className="numbers-beat" data-n-worth>
              <dt className="numbers-term">{c.numbers.beats.worth.label}</dt>
              <dd className="numbers-amt">
                {worth === null ? '' : <><span className="numbers-about">{c.numbers.about}</span>{money(Math.round(worth))}</>}
              </dd>
            </div>
            <div className="numbers-beat" data-n-fee>
              <dt className="numbers-term">
                {c.numbers.beats.fee.label}
                {pkg ? <span className="numbers-term-note">{pkgName}</span> : null}
              </dt>
              <dd className="numbers-amt">{pkg === null ? '' : money(pkg.price)}</dd>
            </div>
            <div className="numbers-beat numbers-beat-keep" data-n-keep>
              <dt className="numbers-term">{c.numbers.beats.keep.label}</dt>
              <dd className={'numbers-keep' + (clears ? '' : ' is-under')}>
                {kept === null ? '' : <><span className="numbers-about">{c.numbers.about}</span>{money(Math.round(kept))}</>}
                {kept === null ? null : clears ? (
                  <span className="numbers-year" data-n-year>
                    {c.numbers.yearLabel} {c.numbers.about}
                    {money(Math.round(kept) * 12)}
                  </span>
                ) : (
                  <span className="numbers-year" data-n-under>
                    {c.numbers.under}
                  </span>
                )}
              </dd>
            </div>
          </dl>

          {/* One length, split where the fee falls. What the firm pays is seen
              as the share of the total it is rather than asserted to be small,
              and where the fee is the whole of it or more, it is. */}
          {feeShare !== null ? (
            <div className="numbers-bar" aria-hidden="true">
              <span
                className="numbers-bar-fee"
                data-n-bar
                style={{ width: `${(feeShare * 100).toFixed(1)}%` }}
              />
            </div>
          ) : null}

          <p className="numbers-sr" role="status" aria-live="polite" data-n-status>
            {status}
          </p>

          <Disclosure label={c.numbers.moreLabel}>
            {/* The one measured figure the sum rests on, said once, here. */}
            <p className="numbers-note numbers-share">
              {c.numbers.beats.draftsNote.before}
              <span className="numbers-fig" data-n-rate>
                {formatShare(draftRatePercent(), c.htmlLang)}
              </span>
              {c.numbers.beats.draftsNote.after}
            </p>
            <dl className="numbers-basis">
              {c.numbers.basis.map((b) => (
                <div className="numbers-basis-row" key={b.term}>
                  <dt className="numbers-basis-term">{b.term}</dt>
                  <dd className="numbers-basis-def">{b.def}</dd>
                </div>
              ))}
            </dl>
            <p className="numbers-note">{c.numbers.note}</p>
          </Disclosure>
        </div>
      </div>
    </section>
  );
}
