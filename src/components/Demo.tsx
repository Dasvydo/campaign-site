import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatCount } from '../lib/offer';
import { VALUE } from '../lib/value';
import { MARK_BOWL, MARK_STEM } from './Hero';
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
/* THE ONE THING THE SECTION DEMONSTRATES, PERFORMED ONCE.

   The five switches are real controls and toggling one visibly takes a clause
   out of the draft. That is the whole argument of this page: it is the
   difference between claiming the product reads your files and showing it.

   An independent reviewer put the problem plainly. At rest the slips read as
   evidence, not controls: tilted paper, a drawn tick, a count. A tick is the
   one glyph that says "confirmed, do not touch". Making the invitation above
   them darker and larger helped the person who reads the column top to bottom
   and did nothing for the scanner, whose eye goes heading, cards, draft. So
   most visitors never saw the proof.

   Rather than describe the interaction better, the page performs it: one
   source goes off and comes back, once, shortly after the reader has both
   halves in front of them. The reader witnesses the draft lose three figures
   and get them back without being asked to do anything.

   `deductions` is the source it uses because its clause carries three amounts
   in the middle of the letter and a dependent tail clause, so what leaves and
   returns is unmistakable. All three desks carry the same five keys by design,
   so this works on whichever desk is open.

   An independent verifier refuted the first build of this on two counts, and
   both are why the code below reads the way it does.

   One: standing down cleared every pending timer, including the one that puts
   the clause back. Interrupting between the two steps left the reader a letter
   missing a clause they never removed, a switch off they never touched, and a
   Send button under a visibly worse draft. The gesture that broke it was the
   gesture the movement is designed to provoke. The restoring step is no longer
   cancellable: it is scheduled from inside the removing step, so nothing can
   strike a clause out without the step that puts it back already on the clock.

   Two: it fired on the switch strip alone. On a phone or a tablet the draft is
   130 to 319px below the fold at that moment, so the whole thing played and
   restored where nobody could see it, and spent its one run doing so. On every
   desktop width the opposite: the draft was on screen and the slip that drove
   it was not, which demonstrates that text changes by itself. It now requires
   the switch AND the clause it drives to be on screen together, and gives the
   run back rather than spending it if the reader scrolls off mid-wait. Where
   both cannot share a screen it correctly never runs.

   IT STANDS DOWN COMPLETELY for `prefers-reduced-motion`, rechecked at the
   moment it would move rather than only at mount, and at the first sign of a
   real person: a pointer, a key or focus anywhere in the section. It runs once
   per page load, never on a desk change, and it never speaks into the live
   region, because announcing a change nobody made is noise. The whole sequence
   is under two seconds, well inside WCAG 2.2.2's five. */
const AUTO_KEY: DemoSource = 'deductions';
/* After the slips finish arriving (five at 74ms plus the tick draw) and a beat
   to read the whole draft first. Measured from the moment both halves are on
   screen together, not from arrival, so this doubles as the dwell the reader
   has to hold still for: scrolling straight past disarms it instead. */
const AUTO_OFF_AT = 1100;
/* Long enough to read the hedged sentence that replaced the figures, short
   enough not to feel like a loop. Measured at 1400ms in a real browser. */
const AUTO_BACK_AFTER = 1400;
/* How much of each half has to be on screen. Both are small elements, so
   asking for nearly all of them is a fair reading of "the reader can see it".
   The fixed call to action bar at the bottom of narrow viewports is discounted
   below, because an element behind it is not on screen in any useful sense. */
const CAUSE_ON_SCREEN = 0.9;
const EFFECT_ON_SCREEN = 0.9;

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
  /* Which draft this is. Bumped on every reset, and used as the `key` of the
     editable body.

     Without it, editing the draft and then dealing the next letter left the
     reader's own typing on the new letter. The body is `contentEditable`, so
     the BROWSER mutates those nodes directly and React never learns about it;
     `reset()` then sets state that reconciles to an identical tree, React
     finds nothing to change, and the edited text survives a letter it was
     never written for. That breaks the one thing this section is arguing,
     which is that each draft is built from the file rather than kept around.

     A changed key is the cheap, honest fix: it unmounts the subtree the
     browser interfered with and mounts a fresh one from the clauses. */
  const [draftNo, setDraftNo] = useState(0);
  /* Has the reader typed into this draft?
 
     The key above fixed dealing the next letter and changing desk, which were
     the two paths that call `reset()`. An independent verifier found the same
     bug alive on three more: toggling a source after an edit, pressing "Put it
     all back" after an edit, and, worst of the three, wiping the body with one
     Backspace, after which the control whose entire job is to put it back
     could not, while the live region announced that the draft was whole again.
     Two of the three left the draft EMPTY.
 
     The cause is the same in all of them: `contentEditable` means the browser
     owns those nodes, and a switch that only recomputes clause state cannot
     reach them. So a switch or a restore, after an edit, rebuilds the draft
     from the clauses instead. The reader loses their typing, which is the
     right trade: the switches only mean anything against a draft the file
     built, and every one of those paths is the reader asking to see that
     again. */
  const hasEdited = useRef(false);
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
    hasEdited.current = false;
    setDraftNo((n) => n + 1);
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

  /* Any path that re-derives the draft from its clauses has to be able to
     reach the nodes, and after an edit it cannot. Bumping the identity throws
     away the browser's copy and mounts a fresh one. */
  const rebuildIfEdited = () => {
    if (!hasEdited.current) return;
    hasEdited.current = false;
    setDraftNo((n) => n + 1);
  };

  const toggle = (key: DemoSource) => {
    if (editing) return;
    rebuildIfEdited();
    standDown(key);
    const next = { ...on, [key]: !on[key] };
    setOn(next);
    applySwitch(key, next);
    const everythingOff = KEYS.every((k) => !next[k]);
    const src = desk.sources.find((s) => s.key === key)!;
    setSay(everythingOff ? c.demo.say.allOff : next[key] ? src.on : src.off);
  };

  const restore = () => {
    rebuildIfEdited();
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

  /* The performed demonstration. See AUTO_KEY at the top of this file.

     `autoStep` is reassigned on every render on purpose: a timer scheduled now
     fires more than a second later, and it has to act on the state as it is
     then rather than as it was when it was scheduled. It never calls setSay,
     because a live region is for changes the reader made. */
  /* Held apart deliberately. Standing down may cancel the removing step and
     must never be able to reach the restoring one. */
  const offTimer = useRef<number | null>(null);
  const backTimer = useRef<number | null>(null);
  const armed = useRef(false);
  const autoRan = useRef(false);
  const autoTookItOff = useRef(false);
  const userActed = useRef(false);
  const editingRef = useRef(false);
  editingRef.current = editing;

  const autoStep = useRef<(want: boolean) => void>(() => {});
  autoStep.current = (want: boolean) => {
    const next = { ...on, [AUTO_KEY]: want };
    setOn(next);
    applySwitch(AUTO_KEY, next);
  };

  /* Any sign of a real person stops it before it starts. Touching the
     demonstrated switch also hands that source over, so the restoring step
     leaves it where the reader put it rather than overruling them.

     This cancels the removing step only. Cancelling the restoring step here is
     what left readers a maimed letter: by the time this runs the clause may
     already be struck out, and the person who interrupted is exactly the
     person owed a whole draft. It is held off by its own guards instead, which
     let it skip the write without skipping the obligation. */
  const standDown = useCallback((key?: DemoSource) => {
    userActed.current = true;
    if (key === AUTO_KEY) autoTookItOff.current = false;
    if (offTimer.current !== null) {
      window.clearTimeout(offTimer.current);
      offTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!hasJs || autoRan.current || reduced()) return;
    const section = rootRef.current;
    /* The switch that drives the change, and the words it drives. Both, or
       this demonstrates nothing: the switch alone is a tick moving for no
       reason, the draft alone is text changing by itself. */
    const cause = section?.querySelector(`.demo-sw[data-src="${AUTO_KEY}"]`);
    const effect = section?.querySelector(`.demo-clause[data-clause="${AUTO_KEY}"]`);
    if (!section || !cause || !effect || typeof IntersectionObserver === 'undefined') return;

    const stop = () => standDown();
    section.addEventListener('pointerdown', stop);
    section.addEventListener('keydown', stop);
    section.addEventListener('focusin', stop);

    const seen = new Map<Element, number>();
    const bothOnScreen = () =>
      (seen.get(cause) ?? 0) >= CAUSE_ON_SCREEN && (seen.get(effect) ?? 0) >= EFFECT_ON_SCREEN;

    const arm = () => {
      if (armed.current || autoRan.current || userActed.current || reduced()) return;
      armed.current = true;
      offTimer.current = window.setTimeout(() => {
        offTimer.current = null;
        if (userActed.current || editingRef.current || reduced()) {
          armed.current = false;
          return;
        }
        /* The run is spent here and nowhere earlier, and the step that puts
           the clause back goes on the clock in the same breath. */
        autoRan.current = true;
        autoTookItOff.current = true;
        autoStep.current(false);
        backTimer.current = window.setTimeout(() => {
          backTimer.current = null;
          if (!autoTookItOff.current || editingRef.current) return;
          autoStep.current(true);
        }, AUTO_BACK_AFTER);
      }, AUTO_OFF_AT);
    };

    /* Scrolled off before it moved: give the run back rather than spend it on
       somebody who is no longer looking. */
    const disarm = () => {
      armed.current = false;
      if (offTimer.current !== null) {
        window.clearTimeout(offTimer.current);
        offTimer.current = null;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target, e.intersectionRatio);
        if (autoRan.current) {
          io.disconnect();
          return;
        }
        if (bothOnScreen()) arm();
        else disarm();
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 0.9, 1],
        /* Discount the fixed call to action bar that sits over the bottom of
           narrow viewports. An element behind it is not on screen. */
        rootMargin: '0px 0px -80px 0px',
      },
    );
    io.observe(cause);
    io.observe(effect);

    return () => {
      io.disconnect();
      section.removeEventListener('pointerdown', stop);
      section.removeEventListener('keydown', stop);
      section.removeEventListener('focusin', stop);
      if (offTimer.current !== null) window.clearTimeout(offTimer.current);
      if (backTimer.current !== null) window.clearTimeout(backTimer.current);
    };
  }, [hasJs, standDown]);

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
    hasEdited.current = true;
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
          <p className="demo-eyebrow">{c.demo.eyebrow}</p>
          <h2 id="demo-h">{c.demo.title}</h2>
          <p className="demo-lede">{c.demo.lede}</p>
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
                key={draftNo}
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
                <path d={MARK_BOWL} />
                <path d={MARK_STEM} />
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

        {/* The minutes are the model's, not this file's. They used to be the
            word "nine" typed into the sentence while every computed figure on
            the page came off five. */}
        <p className="demo-close">
          {c.demo.close.before}
          <span className="demo-close-hl">
            {c.demo.close.mark}
            {formatCount(VALUE.minutesFromScratch.value, c.htmlLang)}
            {c.demo.close.markEnd}
          </span>
          {c.demo.close.after}
        </p>

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
