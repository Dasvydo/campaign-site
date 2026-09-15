import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Content } from '../content/types';
import type { DemoClause, DemoSource, DemoVariant } from '../content/types';

/**
 * The worked example: a letter, the five things the office knows, and the draft
 * those five things produced.
 *
 * THE ARGUMENT. The five sources are deliberately the same five on every desk,
 * because that is the point the section is making: every firm has a rule, a
 * date, a file, some figures and a house voice, and only the paper changes.
 * Switching one off takes the corresponding clause out of the draft in front of
 * you, which is the difference between claiming the product reads your files
 * and showing it.
 *
 * Everything here is canned and says so on the page. Every sender, figure and
 * date on all three desks is invented. There are no customers yet, so there is
 * nothing here that could be one.
 *
 * ON THE PORT. The prototype drove this by hand, swapping spans in and out of
 * the DOM. Here the draft is rendered from state, which makes dealing a fresh
 * letter and changing desk the same thing: reset the state. The one piece that
 * did not simplify is the strike-through, which has to draw over the old
 * wording before the new wording replaces it, so a clause carries a short lived
 * `striking` flag and a timer.
 *
 * WHILE EDITING, the five switches stand down. The draft is contenteditable at
 * that point and React does not know about the reader's own typing, so a
 * re-render would throw it away. The prototype had the same hazard and lost the
 * edit silently; here the controls say they are unavailable instead.
 */

type VariantName = 'on' | 'tone' | 'off';
const KEYS: DemoSource[] = ['rules', 'deadline', 'file', 'deductions', 'tone'];
const ALL_ON: Record<DemoSource, boolean> = {
  rules: true,
  deadline: true,
  file: true,
  deductions: true,
  tone: true,
};

/** Which reading of a clause the current switch positions call for, or null
    when the clause is the tail of a sentence whose source has gone. */
function variantFor(cl: DemoClause, on: Record<DemoSource, boolean>): VariantName | null {
  if (cl.dep && !on[cl.dep]) return null;
  if (!on[cl.key]) return 'off';
  if (!on.tone && cl.tone) return 'tone';
  return 'on';
}

function pick(cl: DemoClause, v: VariantName): DemoVariant {
  if (v === 'tone') return cl.tone ?? cl.on;
  return v === 'on' ? cl.on : cl.off;
}

export function Demo({ c, onDeskChange }: { c: Content; onDeskChange?: (id: string) => void }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const replyRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const sendRef = useRef<HTMLButtonElement | null>(null);
  const editRef = useRef<HTMLButtonElement | null>(null);
  const dealRef = useRef<HTMLButtonElement | null>(null);
  const switchRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [deskIndex, setDeskIndex] = useState(0);
  const [on, setOn] = useState<Record<DemoSource, boolean>>({ ...ALL_ON });
  const [sent, setSent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pinned, setPinned] = useState<DemoSource | null>(null);
  const [traced, setTraced] = useState<DemoSource | null>(null);
  const [ringOn, setRingOn] = useState(false);
  const [ticksReady, setTicksReady] = useState(false);
  const [hasJs, setHasJs] = useState(false);
  const [say, setSay] = useState('');
  const [sendSay, setSendSay] = useState('');

  const desk = c.demo.desks[deskIndex];
  const clauses = useMemo(
    () => [{ ...desk.salutation, id: 'salut' }, ...desk.clauses.map((cl, i) => ({ ...cl, id: 'c' + i }))],
    [desk],
  );

  /* The reading each clause is showing, and whether the old one is still being
     struck out on its way off. */
  const [shown, setShown] = useState<Record<string, VariantName | null>>({});
  const [striking, setStriking] = useState<Record<string, boolean>>({});
  const timers = useRef<Record<string, number>>({});
  const mounted = useRef(false);

  const reduced = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reset to a whole draft. Dealing the next letter and changing desk are the
     same move with different paper. */
  const reset = useCallback(() => {
    Object.values(timers.current).forEach((t) => window.clearTimeout(t));
    timers.current = {};
    setOn({ ...ALL_ON });
    setStriking({});
    setPinned(null);
    setTraced(null);
    setSent(false);
    setEditing(false);
    setSendSay('');
    const next: Record<string, VariantName | null> = {};
    for (const cl of clauses) next[cl.id] = variantFor(cl, ALL_ON);
    setShown(next);
    setRingOn(false);
    const t = window.setTimeout(() => setRingOn(true), reduced() ? 0 : 260);
    return () => window.clearTimeout(t);
  }, [clauses]);

  useEffect(() => {
    setHasJs(true);
  }, []);

  /* First paint, and every change of desk. */
  useEffect(() => {
    reset();
    return () => Object.values(timers.current).forEach((t) => window.clearTimeout(t));
  }, [reset]);

  useEffect(() => {
    mounted.current = true;
  }, []);

  /* A source moves. Clauses that lose their source are struck through first,
     because seeing the wording crossed out is the whole demonstration; every
     other change swaps straight over. */
  const applySwitch = (key: DemoSource, nextOn: Record<DemoSource, boolean>) => {
    const animate = !reduced();
    const nextShown: Record<string, VariantName | null> = {};
    const nextStriking: Record<string, boolean> = {};

    for (const cl of clauses) {
      const want = variantFor(cl, nextOn);
      const cur = shown[cl.id] ?? null;
      const related = cl.key === key || cl.dep === key;
      window.clearTimeout(timers.current[cl.id]);

      if (want === cur) {
        nextShown[cl.id] = cur;
        continue;
      }
      if (animate && cur !== null && (want === null || (related && want === 'off'))) {
        nextShown[cl.id] = cur;
        nextStriking[cl.id] = true;
        const id = cl.id;
        timers.current[id] = window.setTimeout(() => {
          setShown((s) => ({ ...s, [id]: want }));
          setStriking((s) => ({ ...s, [id]: false }));
        }, 380);
        continue;
      }
      nextShown[cl.id] = want;
    }
    setShown(nextShown);
    setStriking(nextStriking);
  };

  const toggle = (key: DemoSource) => {
    if (editing) return;
    const next = { ...on, [key]: !on[key] };
    setOn(next);
    applySwitch(key, next);
    const everythingOff = KEYS.every((k) => !next[k]);
    const src = desk.sources.find((s) => s.key === key)!;
    setSay(everythingOff ? c.demo.say.allOff : next[key] ? src.on : src.off);
  };

  const restore = () => {
    setOn({ ...ALL_ON });
    const nextShown: Record<string, VariantName | null> = {};
    for (const cl of clauses) nextShown[cl.id] = variantFor(cl, ALL_ON);
    setShown(nextShown);
    setStriking({});
    setSay(c.demo.say.restore);
    switchRefs.current[0]?.focus();
  };

  const changeDesk = (i: number, focusTab: boolean) => {
    if (i === deskIndex) return;
    setDeskIndex(i);
    onDeskChange?.(c.demo.desks[i].id);
    setSay(c.demo.desks[i].deskName + c.demo.say.desk);
    if (focusTab) window.setTimeout(() => tabRefs.current[i]?.focus(), 0);
  };

  /* The switches ship inert, so a page whose script never ran does not offer
     five controls that announce as switches and do nothing. */
  const switchProps = hasJs ? {} : { tabIndex: -1, 'aria-disabled': true as const };

  /* The strip of five arrives, then the ticks are drawn onto it. */
  useEffect(() => {
    const group = rootRef.current?.querySelector('.demo-switches');
    if (!group) return;
    const wait = reduced() ? 0 : desk.sources.length * 74 + 120;
    if (typeof IntersectionObserver === 'undefined') {
      const t = window.setTimeout(() => setTicksReady(true), wait);
      return () => window.clearTimeout(t);
    }
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.disconnect();
          if (!reduced()) group.classList.add('demo-in');
          timer = window.setTimeout(() => setTicksReady(true), wait);
        }
      },
      { threshold: 0.25 },
    );
    io.observe(group);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [desk.sources.length]);

  /* The pen rings the date once the draft has been seen. */
  useEffect(() => {
    const reply = replyRef.current;
    if (!reply || typeof IntersectionObserver === 'undefined') {
      setRingOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.disconnect();
          window.setTimeout(() => setRingOn(true), reduced() ? 0 : 260);
        }
      },
      { threshold: 0.25 },
    );
    io.observe(reply);
    return () => io.disconnect();
  }, []);

  const clauseKey = (cl: DemoClause) => cl.dep ?? cl.key;

  const pinClause = (cl: DemoClause) => {
    if (editing) return;
    const key = clauseKey(cl);
    if (pinned === key) {
      setPinned(null);
      return;
    }
    setPinned(key);
    const src = desk.sources.find((s) => s.key === key);
    setSay(c.demo.say.source + (src?.name ?? key));
  };

  const beginEdit = () => {
    setEditing(true);
    setPinned(null);
    setSay(c.demo.say.edit);
    window.setTimeout(() => bodyRef.current?.focus(), 0);
  };
  const endEdit = () => {
    setEditing(false);
    setSay(c.demo.say.done);
    window.setTimeout(() => editRef.current?.focus(), 0);
  };

  const send = () => {
    if (sent) return;
    if (editing) setEditing(false);
    setSent(true);
    setSendSay(c.demo.say.sent);
    window.setTimeout(() => dealRef.current?.focus(), 0);
  };

  const deal = () => {
    reset();
    setSay(c.demo.say.deal);
    window.setTimeout(() => sendRef.current?.focus(), 0);
  };

  const everythingOff = KEYS.every((k) => !on[k]);

  const renderClause = (cl: DemoClause & { id: string }) => {
    const v = shown[cl.id] ?? null;
    if (v === null) return null;
    const part = pick(cl, v);
    const key = clauseKey(cl);
    const isStriking = !!striking[cl.id];
    return (
      <span
        key={cl.id}
        className={'demo-clause' + (traced === key ? ' demo-traced' : '')}
        data-clause={cl.key}
        {...(cl.dep ? { 'data-dep': cl.dep } : {})}
        {...(editing
          ? {}
          : {
              role: 'button',
              tabIndex: 0,
              'aria-pressed': pinned === key,
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                pinClause(cl);
              },
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                pinClause(cl);
              },
              onMouseEnter: () => setTraced(null),
            })}
      >
        <span
          key={v}
          className={'demo-v' + (isStriking ? ' demo-struck demo-drawn' : '') + (mounted.current ? ' demo-v-in' : '')}
        >
          {part.text}
          {part.circle ? (
            <span className={'demo-circ' + (ringOn ? ' demo-drawn' : '')} data-draw>
              {part.circle}
            </span>
          ) : null}
          {part.tail}
        </span>
      </span>
    );
  };

  return (
    <section id="demo" aria-labelledby="demo-h" data-js={hasJs ? 'on' : undefined} ref={rootRef}>
      <div className="demo-wrap">
        <header className="demo-head">
          <p className="demo-folio" aria-hidden="true">
            02
          </p>
          <p className="demo-eyebrow">{c.demo.eyebrow}</p>
          <h2 id="demo-h">{c.demo.title}</h2>
          <p className="demo-lede">{c.demo.lede}</p>
          <p className="demo-slug">{c.demo.slug}</p>
          <p className="demo-nojs">{c.demo.noJs}</p>
        </header>

        <div className="demo-pick">
          <p className="demo-pick-lead" id="demo-pick-lead">
            {c.demo.pickLead}
          </p>
          <div className="demo-tabs" role="tablist" aria-labelledby="demo-pick-lead">
            {c.demo.desks.map((d, i) => (
              <button
                key={d.id}
                type="button"
                role="tab"
                className="demo-tab"
                id={'demo-tab-' + d.id}
                aria-controls="demo-panel"
                aria-selected={i === deskIndex}
                tabIndex={i === deskIndex ? undefined : -1}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                onClick={() => changeDesk(i, false)}
                onKeyDown={(e) => {
                  const last = c.demo.desks.length - 1;
                  let n = -1;
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % (last + 1);
                  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i + last) % (last + 1);
                  else if (e.key === 'Home') n = 0;
                  else if (e.key === 'End') n = last;
                  if (n < 0) return;
                  e.preventDefault();
                  changeDesk(n, true);
                }}
              >
                {d.tab}
              </button>
            ))}
          </div>
        </div>

        <div
          className="demo-beats"
          id="demo-panel"
          role={hasJs ? 'tabpanel' : undefined}
          aria-labelledby={hasJs ? 'demo-tab-' + desk.id : undefined}
        >
          <div className="demo-beat demo-beat--a">
            <h3 className="demo-beat-h" id="demo-beat-a">
              {c.demo.beatIn}
            </h3>
            <article className="demo-paper demo-letter" aria-labelledby="demo-beat-a">
              <dl className="demo-meta">
                <dt>{c.demo.fromLabel}</dt>
                <dd>{desk.letter.from}</dd>
                <dt>{c.demo.subjectLabel}</dt>
                <dd className="demo-subj">{desk.letter.subject}</dd>
              </dl>
              <p className="demo-letter-body">{desk.letter.body}</p>
            </article>
          </div>

          <div className="demo-beat demo-beat--b">
            <h3 className="demo-beat-h" id="demo-beat-b">
              {c.demo.beatKnows}
            </h3>
            <p className="demo-beat-note">{c.demo.beatNote}</p>

            <div className="demo-switches" role="group" aria-labelledby="demo-beat-b">
              {desk.sources.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={
                    'demo-sw' +
                    (pinned === s.key ? ' demo-pinned' : '') +
                    (traced === s.key ? ' demo-ticked' : '')
                  }
                  role="switch"
                  aria-checked={on[s.key]}
                  aria-controls="demo-draft"
                  aria-disabled={editing || undefined}
                  data-src={s.key}
                  data-name={s.name}
                  ref={(el) => {
                    switchRefs.current[i] = el;
                  }}
                  onClick={() => toggle(s.key)}
                  onMouseEnter={() => setTraced(s.key)}
                  onMouseLeave={() => setTraced(null)}
                  onFocus={() => setTraced(s.key)}
                  onBlur={() => setTraced(null)}
                  {...switchProps}
                >
                  <span className="demo-sw-tick" aria-hidden="true">
                    <svg viewBox="0 0 20 20" className={'demo-draw' + (on[s.key] && ticksReady ? ' demo-drawn' : '')}>
                      <path d="M3 11 L8 15 L17 5" />
                    </svg>
                  </span>
                  <span className="demo-sw-label">{s.label}</span>
                  <span className="demo-sw-count" aria-hidden="true">
                    {s.count}
                  </span>
                  <span className="demo-sw-trace" aria-hidden="true">
                    <svg viewBox="0 0 24 16" className="demo-draw demo-drawn">
                      <path d="M2 9 L7 14 L22 2" />
                    </svg>
                  </span>
                  <span className="demo-sw-clip" aria-hidden="true">
                    <svg viewBox="0 0 20 26">
                      <path d="M14.5 5.5 v13 a4.6 4.6 0 0 1 -9.2 0 V6.4 a2.9 2.9 0 0 1 5.8 0 v11.4" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>

            <div className="demo-alloff" hidden={!everythingOff}>
              <p className="demo-pencil">{c.demo.allOffNote}</p>
              <button type="button" className="demo-restore" onClick={restore}>
                <span className="demo-restore-clip" aria-hidden="true">
                  <svg viewBox="0 0 20 26">
                    <path d="M14.5 5.5 v13 a4.6 4.6 0 0 1 -9.2 0 V6.4 a2.9 2.9 0 0 1 5.8 0 v11.4" />
                  </svg>
                </span>
                {c.demo.restoreLabel}
              </button>
            </div>
          </div>

          <div className="demo-beat demo-beat--c">
            <h3 className="demo-beat-h" id="demo-beat-c">
              {c.demo.beatWrote}
            </h3>

            <article
              className="demo-paper demo-reply"
              id="demo-draft"
              aria-labelledby="demo-beat-c"
              ref={replyRef}
              onClick={() => setPinned(null)}
            >
              <div className="demo-reply-head">
                <div className="demo-reply-ref">
                  <span className="demo-clock" aria-hidden="true">
                    {sent ? c.hero.clockOut : c.hero.clockIn}
                  </span>
                  <span className="demo-label">{c.demo.reLabel}</span>
                  <span className="demo-ref">{desk.letter.subject}</span>
                </div>
                <p className="demo-stamps">
                  {sent ? (
                    <span className="demo-stamp demo-stamp--sent">{c.demo.sentStamp}</span>
                  ) : (
                    <span className="demo-stamp demo-stamp--draft">{c.demo.draftStamp}</span>
                  )}
                </p>
              </div>

              <p className="demo-salut">{renderClause(clauses[0])}</p>

              <div
                className="demo-body"
                id="demo-body"
                ref={bodyRef}
                contentEditable={editing}
                suppressContentEditableWarning
                {...(editing ? { 'aria-labelledby': 'demo-beat-c' } : {})}
                onKeyDown={(e) => {
                  if (editing && e.key === 'Escape') endEdit();
                }}
              >
                <p>
                  {clauses.slice(1).map((cl, i) => {
                    const node = renderClause(cl);
                    if (!node) return null;
                    return (
                      <span key={cl.id}>
                        {i > 0 ? ' ' : null}
                        {node}
                        {cl.sep}
                      </span>
                    );
                  })}
                </p>
              </div>

              <svg className="demo-emboss" viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
                <path
                  fillRule="evenodd"
                  d="M420 250 H565 a255 255 0 0 1 0 510 H420 Z M545 365 H565 a140 140 0 0 1 0 280 H545 Z"
                />
                <path d="M215 250 H372 V630 H550 V762 H215 Z" />
              </svg>
            </article>

            <div className="demo-gate">
              <p className="demo-gate-note">{c.demo.gateNote}</p>

              <div className="demo-gate-controls" hidden={sent}>
                <button type="button" className="demo-btn demo-btn--send" ref={sendRef} onClick={send}>
                  {c.demo.sendLabel}
                </button>
                <button
                  type="button"
                  className="demo-btn demo-btn--edit"
                  ref={editRef}
                  onClick={() => (editing ? endEdit() : beginEdit())}
                >
                  {editing ? c.demo.doneLabel : c.demo.editLabel}
                </button>
              </div>

              <div className="demo-gate-done" hidden={!sent}>
                <p className="demo-sent-chip">{c.demo.sentChip}</p>
                <button
                  type="button"
                  className="demo-btn demo-btn--ghost demo-btn--deal"
                  ref={dealRef}
                  onClick={deal}
                >
                  {c.demo.dealLabel}
                </button>
              </div>

              <p className="demo-payoff" hidden={!sent}>
                {c.demo.payoff}
              </p>
              <p className="demo-editnote" hidden={!editing}>
                {c.demo.editNote}
              </p>
            </div>
          </div>
        </div>

        <p className="demo-close">{c.demo.close}</p>
        <p className="demo-close-basis">{c.demo.closeBasis}</p>

        <p className="demo-sr" aria-live="polite" aria-atomic="false">
          {say}
        </p>
        <p className="demo-sr" role="status">
          {sendSay}
        </p>
      </div>
    </section>
  );
}
