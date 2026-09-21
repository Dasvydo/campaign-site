/**
 * Review mode: a way to point at a thing on the page and say what is wrong
 * with it.
 *
 * Open any page of the site with `?review` on the end. A button appears in the
 * corner. Press it to arm marking, then tap anything: the tap is swallowed
 * rather than passed to the page, a numbered pin is dropped on what you tapped,
 * and a box opens to type the note. Press the button again and the page works
 * normally, so a tab or a slider can be driven to the state worth commenting
 * on and then marked.
 *
 * Every note records where it was taken from, not just what was said: the
 * nearest section id, the class the thing is styled by, which one it is where
 * there are several, and the first hundred and twenty characters of its own
 * text. That last part is what makes a note actionable without a second round
 * trip, because the text is searchable in the three content files.
 *
 * Nothing here is React. It is plain DOM in a container of its own at the end
 * of body, with its own stylesheet and every class prefixed `dlrv-`, so it
 * cannot collide with the page or be torn down by a re-render.
 *
 * It is loaded by a dynamic import in main.tsx that only runs when the query
 * string asks for it, so the code sits in a chunk of its own and a visitor who
 * never types `?review` never downloads a byte of it. scripts/verify-visible.mjs
 * checks both halves of that: present with the flag, absent without it.
 */

type Note = {
  id: number;
  path: string;
  lang: string;
  viewport: string;
  selector: string;
  nth: string;
  text: string;
  body: string;
};

const KEY = 'dl:review-notes';
const PREFIX = 'dlrv';

/* ---------- where a thing is ------------------------------------------- */

/** The nearest id, the class it is styled by, and which one of those it is. */
function locate(el: Element): { selector: string; nth: string } {
  const own = el.id ? '#' + el.id : '';
  if (own) return { selector: own, nth: '' };

  const section = el.closest('[id]');
  const anchor = section ? '#' + section.id : 'body';

  const raw = typeof el.className === 'string' ? el.className : '';
  const cls = raw
    .trim()
    .split(/\s+/)
    .filter((c) => c && !c.startsWith(PREFIX))[0];

  const selector = cls ? `${anchor} .${cls}` : `${anchor} ${el.tagName.toLowerCase()}`;
  let nth = '';
  try {
    const all = Array.from(document.querySelectorAll(selector));
    const i = all.indexOf(el);
    if (all.length > 1 && i >= 0) nth = `${i + 1} of ${all.length}`;
  } catch {
    /* a class with a character CSS will not take: the selector is still
       readable by a person, which is what it is for. */
  }
  return { selector, nth };
}

const own = (el: Element): string =>
  (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);

/* ---------- the notes -------------------------------------------------- */

function read(): Note[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Note[]) : [];
  } catch {
    return [];
  }
}

function write(notes: Note[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes));
  } catch {
    /* A private window cannot keep them. The session still works; it just does
       not survive a reload, and the copy button is right there. */
  }
}

/** What gets pasted back. Written for a reader, not for a parser. */
function transcribe(notes: Note[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const head = `REVIEW of ${location.host} - ${today}\n${notes.length} note${notes.length === 1 ? '' : 's'}\n`;
  const body = notes
    .map((n, i) => {
      const where = n.nth ? `${n.selector}  (${n.nth})` : n.selector;
      const quoted = n.text ? `\n    "${n.text}"` : '';
      return `\n[${i + 1}] ${n.path} (${n.lang}) - ${n.viewport}\n    ${where}${quoted}\n    -> ${n.body}`;
    })
    .join('\n');
  return head + body + '\n';
}

/* ---------- the overlay ------------------------------------------------ */

export function startReview() {
  if (document.getElementById(PREFIX + '-root')) return;

  let notes = read();
  let arming = false;
  let composing: { el: Element; note: Note } | null = null;

  const root = document.createElement('div');
  root.id = PREFIX + '-root';
  root.setAttribute('data-nosnippet', '');

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const pins = document.createElement('div');
  pins.className = PREFIX + '-pins';

  const bar = document.createElement('div');
  bar.className = PREFIX + '-bar';

  const mark = document.createElement('button');
  mark.type = 'button';
  mark.className = PREFIX + '-btn ' + PREFIX + '-mark';

  const open = document.createElement('button');
  open.type = 'button';
  open.className = PREFIX + '-btn ' + PREFIX + '-open';

  bar.append(mark, open);

  const panel = document.createElement('div');
  panel.className = PREFIX + '-panel';
  panel.hidden = true;

  root.append(pins, bar, panel);
  document.body.appendChild(root);

  /* --- pins, repositioned rather than reparented, so nothing in the page
         has to be touched to carry them ---------------------------------- */
  /* How much of the bottom of the screen the page has already spoken for.

     The page pins two things down there: the consent notice, and on a phone a
     bar carrying the call to action. The review bar was put at `bottom:12px`
     and landed straight on top of both, so on a phone the first thing a
     reviewer met was a Decline button they could not press. Playwright found
     it before the founder did, which is the only reason it is not in his hands
     that way.

     Measured rather than named. Hard-coding `.consent` and `.hero-bar` would
     be shorter and would quietly stop being true the day either is renamed;
     this asks the page what it has fixed to the bottom of the viewport, three
     levels deep, which is a few dozen nodes on a frame that is already
     throttled to an animation frame. */
  const lift = () => {
    let h = 0;
    /* `fixed` on the thing you can see is not the test. The page's bottom bar
       is a fixed wrapper of zero height with the visible bar laid out inside
       it, so asking only for elements that are themselves fixed measured it at
       nothing and put the review bar straight back on top of the call to
       action. What is carried along by a fixed ancestor counts too, and what
       is measured is how far up the screen its top edge reaches. */
    const walk = (el: Element, depth: number, pinned: boolean) => {
      if (depth > 4) return;
      for (const c of Array.from(el.children)) {
        if (c === root || root.contains(c)) continue;
        const cs = getComputedStyle(c);
        const isPinned = pinned || cs.position === 'fixed';
        if (isPinned && cs.visibility !== 'hidden' && cs.display !== 'none') {
          const r = c.getBoundingClientRect();
          if (r.height > 0 && r.bottom > innerHeight - 4 && r.top < innerHeight) {
            h = Math.max(h, innerHeight - r.top);
          }
        }
        walk(c, depth + 1, isPinned);
      }
    };
    walk(document.body, 0, false);
    /* Never push it so far up it leaves the screen. */
    root.style.setProperty('--dlrv-lift', `${Math.round(Math.min(h, innerHeight * 0.5))}px`);
  };

  let raf = 0;
  const place = () => {
    raf = 0;
    lift();
    const kids = Array.from(pins.children) as HTMLElement[];
    for (const pin of kids) {
      const sel = pin.dataset.sel ?? '';
      const idx = Number(pin.dataset.idx ?? '0');
      let el: Element | null = null;
      try {
        const all = document.querySelectorAll(sel);
        el = all[idx] ?? all[0] ?? null;
      } catch {
        el = null;
      }
      if (!el) {
        pin.classList.add(PREFIX + '-lost');
        continue;
      }
      pin.classList.remove(PREFIX + '-lost');
      const r = el.getBoundingClientRect();
      pin.style.transform = `translate(${Math.round(r.left + scrollX - 10)}px, ${Math.round(r.top + scrollY - 10)}px)`;
    }
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(place);
  };

  const drawPins = () => {
    pins.textContent = '';
    notes.forEach((n, i) => {
      const pin = document.createElement('span');
      pin.className = PREFIX + '-pin';
      pin.textContent = String(i + 1);
      pin.dataset.sel = n.selector;
      pin.dataset.idx = String(n.nth ? Number(n.nth.split(' ')[0]) - 1 : 0);
      pins.appendChild(pin);
    });
    schedule();
  };

  /* --- the list ----------------------------------------------------------*/
  const drawPanel = () => {
    panel.textContent = '';

    const head = document.createElement('div');
    head.className = PREFIX + '-head';
    head.textContent = notes.length ? `${notes.length} marked` : 'Nothing marked yet';

    const list = document.createElement('ol');
    list.className = PREFIX + '-list';
    notes.forEach((n, i) => {
      const li = document.createElement('li');

      const where = document.createElement('code');
      where.className = PREFIX + '-where';
      where.textContent = n.nth ? `${n.selector} (${n.nth})` : n.selector;

      const said = document.createElement('p');
      said.className = PREFIX + '-said';
      said.textContent = n.body;

      const bin = document.createElement('button');
      bin.type = 'button';
      bin.className = PREFIX + '-bin';
      bin.textContent = 'Remove';
      bin.onclick = () => {
        notes = notes.filter((x) => x.id !== n.id);
        write(notes);
        drawPins();
        drawPanel();
        paint();
      };

      const no = document.createElement('span');
      no.className = PREFIX + '-no';
      no.textContent = String(i + 1);

      li.append(no, where, said, bin);
      list.appendChild(li);
    });

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = PREFIX + '-btn ' + PREFIX + '-copy';
    copy.textContent = 'Copy all notes';
    copy.disabled = notes.length === 0;
    copy.onclick = async () => {
      const text = transcribe(notes);
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        /* http, an old browser, or a permission refused: fall back to a
           textarea the reader can select by hand rather than failing shut. */
        const ta = document.createElement('textarea');
        ta.className = PREFIX + '-fallback';
        ta.value = text;
        panel.appendChild(ta);
        ta.select();
        try {
          ok = document.execCommand('copy');
        } catch {
          ok = false;
        }
      }
      copy.textContent = ok ? 'Copied. Paste it to Claude.' : 'Select the text below and copy it.';
      window.setTimeout(() => {
        copy.textContent = 'Copy all notes';
      }, 4000);
    };

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = PREFIX + '-bin ' + PREFIX + '-clear';
    clear.textContent = 'Clear all';
    clear.hidden = notes.length === 0;
    clear.onclick = () => {
      if (!window.confirm(`Throw away all ${notes.length} notes?`)) return;
      notes = [];
      write(notes);
      drawPins();
      drawPanel();
      paint();
    };

    panel.append(head, list, copy, clear);
  };

  /* --- the composer ------------------------------------------------------*/
  const compose = (el: Element) => {
    const { selector, nth } = locate(el);
    const note: Note = {
      id: Date.now(),
      path: location.pathname,
      lang: document.documentElement.lang || 'en',
      viewport: `${innerWidth}x${innerHeight}`,
      selector,
      nth,
      text: own(el),
      body: '',
    };

    const box = document.createElement('div');
    box.className = PREFIX + '-compose';

    const where = document.createElement('code');
    where.className = PREFIX + '-where';
    where.textContent = nth ? `${selector} (${nth})` : selector;

    const quote = document.createElement('p');
    quote.className = PREFIX + '-quote';
    quote.textContent = note.text ? `"${note.text}"` : '(no text of its own)';

    const ta = document.createElement('textarea');
    ta.className = PREFIX + '-ta';
    ta.rows = 3;
    ta.placeholder = 'What is wrong with this?';

    const save = document.createElement('button');
    save.type = 'button';
    save.className = PREFIX + '-btn';
    save.textContent = 'Save note';

    const drop = document.createElement('button');
    drop.type = 'button';
    drop.className = PREFIX + '-bin';
    drop.textContent = 'Cancel';

    const close = () => {
      box.remove();
      composing = null;
      paint();
    };

    save.onclick = () => {
      const said = ta.value.trim();
      if (!said) {
        ta.focus();
        return;
      }
      note.body = said;
      notes = notes.concat(note);
      write(notes);
      drawPins();
      drawPanel();
      close();
    };
    drop.onclick = close;
    ta.onkeydown = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save.click();
    };

    const row = document.createElement('div');
    row.className = PREFIX + '-row';
    row.append(save, drop);

    box.append(where, quote, ta, row);
    root.appendChild(box);
    composing = { el, note };

    const r = el.getBoundingClientRect();
    const top = Math.min(r.bottom + scrollY + 8, scrollY + innerHeight - 220);
    box.style.transform = `translate(${Math.round(Math.max(12, Math.min(r.left + scrollX, scrollX + innerWidth - 340)))}px, ${Math.round(top)}px)`;
    ta.focus();
    paint();
  };

  /* --- arming ------------------------------------------------------------*/
  /* The press is taken away from the page, but not from the browser.

     The first version cancelled `pointerdown` as well, which keeps the page
     from reacting - and on a touch screen also stops the browser ever
     synthesising the click that follows. On a phone, which is where half of
     this reviewing will happen, arming marking would have armed nothing: every
     tap would have been swallowed and no note would ever have opened. So the
     early events are only stopped from travelling, never cancelled, and the
     cancelling happens on the click, where it stops a link from navigating and
     a radio from taking a value without costing us the event itself. */
  const hush = (e: Event) => {
    if (!arming || composing) return;
    const t = e.target as Element | null;
    if (!t || root.contains(t)) return;
    e.stopPropagation();
  };
  const take = (e: Event) => {
    if (!arming || composing) return;
    const t = e.target as Element | null;
    if (!t || root.contains(t)) return;
    e.preventDefault();
    e.stopPropagation();
    compose(t);
  };
  for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart'] as const) {
    document.addEventListener(type, hush, true);
  }
  document.addEventListener('click', take, true);

  const paint = () => {
    mark.textContent = arming ? 'Marking on' : 'Mark something';
    mark.classList.toggle(PREFIX + '-on', arming);
    open.textContent = panel.hidden ? `Notes (${notes.length})` : 'Hide notes';
    document.documentElement.classList.toggle(PREFIX + '-arming', arming && !composing);
  };

  mark.onclick = () => {
    arming = !arming;
    paint();
  };
  open.onclick = () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) drawPanel();
    paint();
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  /* The page's bottom bar slides in AFTER the scroll that summons it, so the
     measurement taken during that scroll caught it still translated off the
     bottom of the screen and read nothing: the review bar then sat on the call
     to action until the next scroll, which is to say until after a reviewer
     had already tried to press it. The animation's own end re-measures, and a
     slow tick underneath it covers anything that arrives without a transition
     at all. Four levels of walk twice a second costs nothing and this is a
     tool for one person. */
  document.addEventListener('transitionend', schedule, true);
  document.addEventListener('animationend', schedule, true);
  window.setInterval(schedule, 500);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && arming && !composing) {
      arming = false;
      paint();
    }
  });

  drawPins();
  drawPanel();
  paint();
}

/* ---------- its own stylesheet ----------------------------------------- */

const CSS = `
#${PREFIX}-root{position:absolute;top:0;left:0;width:0;height:0;z-index:2147483000;
  font:14px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#1b1b1b}
#${PREFIX}-root *{box-sizing:border-box}
html.${PREFIX}-arming, html.${PREFIX}-arming *{cursor:crosshair!important}
html.${PREFIX}-arming *:hover{outline:2px solid #EA6D31!important;outline-offset:1px}
/* Not the tool's own buttons. An id outranks the class above, so the outline
   that shows what a tap would mark stops at the edge of the overlay. */
#${PREFIX}-root *:hover, #${PREFIX}-root:hover{outline:none!important}

.${PREFIX}-pins{position:absolute;top:0;left:0}
.${PREFIX}-pin{position:absolute;top:0;left:0;display:grid;place-items:center;
  width:20px;height:20px;border-radius:50%;background:#EA6D31;color:#fff;
  font-size:11px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.35);pointer-events:none}
.${PREFIX}-lost{background:#8a8a8a}

.${PREFIX}-bar{position:fixed;right:12px;bottom:calc(12px + var(--dlrv-lift,0px));
  display:flex;gap:8px;flex-wrap:wrap;
  justify-content:flex-end;max-width:calc(100vw - 24px)}
.${PREFIX}-btn{appearance:none;border:1px solid #2b2b2b;border-radius:6px;background:#fff;
  color:#1b1b1b;padding:9px 13px;font:inherit;font-weight:600;cursor:pointer;
  box-shadow:0 2px 10px rgba(0,0,0,.22)}
.${PREFIX}-btn:disabled{opacity:.45;cursor:default}
.${PREFIX}-mark.${PREFIX}-on{background:#EA6D31;border-color:#EA6D31;color:#fff}

.${PREFIX}-panel{position:fixed;right:12px;bottom:calc(62px + var(--dlrv-lift,0px));width:min(400px,calc(100vw - 24px));
  max-height:min(60vh,520px);overflow:auto;background:#fff;border:1px solid #2b2b2b;
  border-radius:8px;padding:14px;box-shadow:0 8px 30px rgba(0,0,0,.3)}
.${PREFIX}-head{font-weight:700;margin-bottom:10px}
.${PREFIX}-list{margin:0 0 12px;padding:0;list-style:none;display:grid;gap:12px}
.${PREFIX}-list li{display:grid;grid-template-columns:22px 1fr auto;gap:4px 8px;
  align-items:start;border-top:1px solid #e5e5e5;padding-top:10px}
.${PREFIX}-no{grid-row:1/3;display:grid;place-items:center;width:20px;height:20px;
  border-radius:50%;background:#EA6D31;color:#fff;font-size:11px;font-weight:700}
.${PREFIX}-where{grid-column:2;font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;
  color:#6a6a6a;word-break:break-all}
.${PREFIX}-said{grid-column:2;margin:0;white-space:pre-wrap}
.${PREFIX}-bin{grid-column:3;grid-row:1;appearance:none;border:0;background:none;
  color:#9a3412;font:inherit;font-size:12px;cursor:pointer;padding:0;text-decoration:underline}
.${PREFIX}-clear{display:block;margin-top:10px;grid-column:auto}
.${PREFIX}-copy{width:100%}
.${PREFIX}-fallback{width:100%;height:160px;margin-top:10px;font:11px/1.4 ui-monospace,monospace}

.${PREFIX}-compose{position:absolute;top:0;left:0;width:min(330px,calc(100vw - 24px));
  background:#fff;border:1px solid #2b2b2b;border-radius:8px;padding:12px;
  box-shadow:0 8px 30px rgba(0,0,0,.3)}
.${PREFIX}-quote{margin:6px 0 8px;font-size:12px;color:#4a4a4a;max-height:64px;overflow:hidden}
.${PREFIX}-ta{width:100%;font:inherit;padding:8px;border:1px solid #bdbdbd;border-radius:5px;resize:vertical}
.${PREFIX}-row{display:flex;gap:8px;align-items:center;margin-top:8px}

@media (prefers-color-scheme: dark){
  .${PREFIX}-panel,.${PREFIX}-compose,.${PREFIX}-btn{background:#1c1c1c;color:#f2f2f2;border-color:#555}
  .${PREFIX}-list li{border-top-color:#3a3a3a}
  .${PREFIX}-quote{color:#bdbdbd}
  .${PREFIX}-ta{background:#111;color:#f2f2f2;border-color:#555}
}
`;
