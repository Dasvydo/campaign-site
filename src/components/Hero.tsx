import { useEffect, useRef } from 'react';
import type { Content } from '../content/types';

/**
 * The hero: masthead, the argument, and the pile of forty letters.
 *
 * Ported from design/paper-desk.html, where the composition was built and
 * measured. The class names and the stylesheet that drives them are the
 * prototype's; what changed here is that the geometry became data and the four
 * hand-written listeners became hooks.
 *
 * THE PHONE IS NOT THE DESKTOP REFLOWED. Below 720px the ghost numeral is not
 * rendered at all and the tally carries the count on its own. That is a
 * composition decision recorded in design/README.md, and it is done in CSS
 * rather than here so that a resize past the breakpoint needs no re-render.
 */

/* Eight sheets of decorative paper. A bar is either a width, or a width and a
   role: 'h' is the heading rule, 'br' is the line before a paragraph break. */
type Bar = number | [number, 'h' | 'br'];
const SHEETS: { mod: string; bars: Bar[] }[] = [
  { mod: 'ream', bars: [] },
  { mod: '', bars: [[0, 'h'], 63, 93, 71, 57, 70, [87, 'br'], 67, 58, 53, 58] },
  { mod: '', bars: [[0, 'h'], 59, 85, 70, 60, 60, 65, 59, 85, [83, 'br'], 55] },
  { mod: '', bars: [[0, 'h'], 64, 61, 78, 71, 57, 94, [82, 'br'], 57] },
  { mod: '', bars: [[0, 'h'], 56, 63, 81, 67, 86, [74, 'br'], 61] },
  { mod: '', bars: [[0, 'h'], 68, 62, 59, 81, 63, [69, 'br'], 84, 57] },
  { mod: 'lit', bars: [[0, 'h'], 85, 72, 54, 91, 81, [73, 'br'], 78, 75, 91] },
  { mod: 'lit', bars: [[0, 'h'], 81, 79, [58, 'br'], 84, 62, 64, 67] },
];

/* Eight groups of five, drawn group by group. 'up' is the four uprights,
   'x' is the fifth stroke through them. --g is the group's place in the
   stagger; the stylesheet turns it into a delay. */
const TALLY: [string, number, string][] = [
  ['up', 0, 'M4.9 3.3L4.9 18.4 M8.9 3.9L9.5 18.3 M12.8 3.2L13.2 18.3 M16.8 3.1L16.5 18.9'],
  ['x', 0, 'M2.4 15.5C9.0 13.3 14.0 9.7 19.9 5.3'],
  ['up', 1, 'M26.4 3.5L25.9 18.5 M30.0 3.8L30.3 18.9 M34.3 3.2L34.5 18.3 M38.0 3.6L37.7 18.4'],
  ['x', 1, 'M23.8 15.8C30.4 13.6 35.4 9.5 41.3 6.4'],
  ['up', 2, 'M47.7 3.9L48.3 18.8 M51.8 3.5L51.2 18.1 M55.3 3.4L55.7 18.8 M59.3 3.7L58.8 18.8'],
  ['x', 2, 'M45.2 15.3C51.8 12.7 56.8 9.0 62.7 5.5'],
  ['up', 3, 'M69.3 3.3L69.7 19.0 M72.9 4.0L73.6 18.3 M76.8 3.1L76.0 18.8 M81.2 3.4L81.5 18.3'],
  ['x', 3, 'M66.6 15.6C73.2 13.2 78.2 9.7 84.1 5.6'],
  ['up', 4, 'M90.5 3.6L89.9 18.4 M94.1 3.9L94.2 18.4 M98.3 3.3L98.7 18.2 M102.5 3.6L103.0 18.9'],
  ['x', 4, 'M88.0 15.9C94.6 12.7 99.6 9.6 105.5 5.2'],
  ['up', 5, 'M112.1 3.7L111.3 18.6 M115.7 3.8L115.7 18.2 M119.9 3.5L119.8 18.6 M124.0 3.7L123.2 18.4'],
  ['x', 5, 'M109.4 16.4C116.0 13.3 121.0 9.7 126.9 6.1'],
  ['up', 6, 'M133.5 3.5L134.1 18.9 M137.2 3.2L136.5 18.2 M141.3 3.7L140.6 18.4 M145.5 3.6L145.1 18.4'],
  ['x', 6, 'M130.8 15.4C137.4 13.0 142.4 9.5 148.3 5.6'],
  ['up', 7, 'M154.7 3.2L154.0 18.9 M159.1 3.9L159.3 18.4 M162.6 3.4L162.3 18.1 M166.3 3.5L166.6 18.6'],
  ['x', 7, 'M152.2 15.3C158.8 13.5 163.8 9.6 169.7 5.9'],
];

export function Hero({
  c,
  locale,
  localeNames,
  pathFor,
  onCta,
}: {
  c: Content;
  locale: string;
  localeNames: { code: string; label: string }[];
  pathFor: (code: string) => string;
  onCta: () => void;
}) {
  const heroRef = useRef<HTMLElement | null>(null);
  /* The head count the hours were computed on, read from the same package the
     model used rather than spelled out in the copy. It was a word in three
     locale files, decoupled, and a verifier moved the coverage to watch the
     sentence contradict itself. */
  const tallyRef = useRef<SVGSVGElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const localeRef = useRef<HTMLDetailsElement | null>(null);

  /* The language you are reading, by its own name. Falls back to the code
     rather than to nothing, so an unknown locale still labels its own
     control. */
  const current = localeNames.find((l) => l.code === locale);

  /* What a <details> does not do by itself: shut when you press somewhere else,
     and shut on Escape. Both are what a person expects of a thing that opened
     over the page, and neither is needed for the control to work. */
  useEffect(() => {
    const el = localeRef.current;
    if (!el) return;
    const away = (e: Event) => {
      if (!el.open) return;
      const t = e.target as Node | null;
      if (t && el.contains(t)) return;
      el.open = false;
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !el.open) return;
      el.open = false;
      el.querySelector('summary')?.focus();
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('focusin', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('focusin', away);
      document.removeEventListener('keydown', esc);
    };
  }, []);

  /* The tally is drawn by stroke-dashoffset, which needs each path's own
     length. Measured here rather than guessed, because the lengths differ and a
     wrong one either clips the stroke or leaves it complete from the start. */
  useEffect(() => {
    const svg = tallyRef.current;
    if (!svg) return;
    svg.querySelectorAll('path').forEach((p) => {
      let len = 0;
      try {
        len = p.getTotalLength();
      } catch {
        /* no geometry yet: the path stays complete, which is the safe end */
      }
      if (len) p.style.setProperty('--hero-len', len.toFixed(1));
    });

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) {
      svg.classList.add('is-drawn');
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => svg.classList.add('is-drawn'));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  /* Which section the masthead link points at, marked while you are in it. */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !('IntersectionObserver' in window)) return;
    const links = Array.from(hero.querySelectorAll<HTMLAnchorElement>('.hero-nav a[href^="#"]'));
    if (!links.length) return;

    const visible: Record<string, boolean> = {};
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible[e.target.id] = e.isIntersecting;
        let claimed = false;
        for (const a of links) {
          const id = a.getAttribute('href')!.slice(1);
          if (!claimed && visible[id]) {
            a.setAttribute('aria-current', 'true');
            claimed = true;
          } else {
            a.removeAttribute('aria-current');
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    for (const a of links) {
      const t = document.getElementById(a.getAttribute('href')!.slice(1));
      if (t) io.observe(t);
    }
    return () => io.disconnect();
  }, []);

  /* The standing price bar on phones. It stands down whenever a real call to
     action is already on the screen, so there are never two of the same button
     in view, and the page reserves exactly the bar's measured height rather
     than a guessed constant. */
  useEffect(() => {
    const hero = heroRef.current;
    const bar = barRef.current;
    if (!hero || !bar) return;

    const root = document.documentElement;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const h = bar.offsetHeight;
      if (h > 0) root.style.setProperty('--hero-bar-h', h + 'px');
      else root.style.removeProperty('--hero-bar-h');
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('resize', queue);
    window.visualViewport?.addEventListener('resize', queue);

    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      const watch = [document.getElementById('fit'), hero.querySelector('.hero-act')].filter(
        Boolean,
      ) as Element[];
      if (watch.length) {
        bar.classList.add('is-off');
        const seen = new Set<Element>();
        io = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) seen.add(e.target);
              else seen.delete(e.target);
            }
            bar.classList.toggle('is-off', seen.size > 0);
          },
          { threshold: 0 },
        );
        for (const el of watch) io.observe(el);
      }
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', queue);
      window.visualViewport?.removeEventListener('resize', queue);
      io?.disconnect();
      root.style.removeProperty('--hero-bar-h');
    };
  }, []);

  /* An in-page link moves the eye; it has to move the keyboard too. */
  const focusTarget = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    if (!el.style.scrollMarginTop) el.style.scrollMarginTop = '2rem';
    window.setTimeout(() => {
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
    }, 0);
  };

  return (
    <section id="hero" aria-labelledby="hero-title" ref={heroRef}>
      <a className="hero-skip" href="#hero-content" onClick={() => focusTarget('hero-content')}>
        {c.hero.skip}
      </a>

      <div className="hero-wrap">
        <header className="hero-mast">
          <a className="hero-brand" href={pathFor(locale)}>
            <Mark gradientId="dl-d" />
            <b>DoviLoop</b>
          </a>

          <nav className="hero-nav" aria-label={c.hero.nav.example}>
            <a href="#demo" onClick={() => focusTarget('demo')}>
              {c.hero.nav.example}
            </a>
            <a href="#price" onClick={() => focusTarget('price')}>
              {c.hero.nav.price}
            </a>
            <a href="#fit" onClick={() => focusTarget('fit')}>
              {c.hero.nav.fit}
            </a>
          </nav>

          {/* One control that says what language you are reading, and opens
              the other two when you press it.

              It was three links printed side by side, which spends a third of
              the masthead on two words nobody wants and makes the one that is
              current hard to pick out of the row.

              A native <details>, for the reasons the Disclosure component
              already gives: it opens with no JavaScript, Enter and Space
              already work, it is already a disclosure to a screen reader, and
              find-in-page can open it. The only things script adds are the two
              a <details> does not do on its own - closing when you press
              elsewhere, and closing on Escape - and the control is complete
              without either. */}
          <details className="hero-locale" ref={localeRef}>
            <summary aria-label={c.nav.localeLabel}>
              <span className="hero-locale-now">{current ? current.label : locale}</span>
              <svg className="hero-locale-caret" viewBox="0 0 10 6" aria-hidden="true" focusable="false">
                <path d="M1 1.4 L5 5 L9 1.4" />
              </svg>
            </summary>
            <ul className="hero-locale-menu">
              {localeNames.map((l) => (
                <li key={l.code}>
                  <a
                    href={pathFor(l.code)}
                    hrefLang={l.code}
                    aria-current={l.code === locale ? 'page' : undefined}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>

          <a className="hero-tab" href="#fit" onClick={() => { onCta(); focusTarget('fit'); }}>
            {c.nav.cta}
          </a>
        </header>

        <div className="hero-rule" aria-hidden="true" />
      </div>

      <div className="hero-grid" id="hero-content" tabIndex={-1}>
        <div className="hero-copy">
          <p className="hero-folio" aria-hidden="true">
            01
          </p>

          {/* The outcome, then the time it is reached by. The clock is the
              one this headline is allowed to name: clockOut is when the work
              is done, and the promise is the finishing, not the starting.
              clockIn still opens the worked example, where the hour is the
              beginning of a morning rather than the end of a job. */}
          <h1 id="hero-title">
            {c.hero.title.before}
            <span className="hero-hl">{c.hero.title.mark}</span>
            {c.hero.title.mid}
            <span className="hero-clock">{c.hero.clockOut}</span>
            {c.hero.title.after}
          </h1>

          <div className="hero-act">
            <a className="hero-btn" href="#fit" onClick={() => { onCta(); focusTarget('fit'); }}>
              {c.nav.cta}
            </a>
          </div>

        </div>

        <div className="hero-count" aria-hidden="true">
          <span className="hero-numeral">40</span>
          <svg
            ref={tallyRef}
            className="hero-tally"
            viewBox="0 0 176 22"
            preserveAspectRatio="xMinYMid meet"
            focusable="false"
          >
            {TALLY.map(([kind, g, d], i) => (
              <path
                key={i}
                className={'hero-tally-' + kind}
                style={{ ['--g' as string]: g }}
                d={d}
              />
            ))}
          </svg>
        </div>

        <div className="hero-pile">
          <div className="hero-pile-shadow" aria-hidden="true" />

          <div className="hero-stack" role="img" aria-label={c.hero.pileAlt}>
            {SHEETS.map((s, i) => (
              <div key={i} className={'hero-sheet' + (s.mod ? ' hero-sheet--' + s.mod : '')}>
                <span className="hero-sheet-face">
                  {s.bars.map((b, j) => {
                    const w = Array.isArray(b) ? b[0] : b;
                    const k = Array.isArray(b) ? b[1] : '';
                    return (
                      <i
                        key={j}
                        className={k ? 'hero-' + k : undefined}
                        style={w ? { width: w + '%' } : undefined}
                      />
                    );
                  })}
                </span>
              </div>
            ))}
          </div>

          <a className="hero-sheet hero-deal" href="#demo" onClick={() => focusTarget('demo')}>
            <span className="hero-sheet-face">
                <span className="hero-lab">{c.hero.deal.draftLabel}</span>
              <span className="hero-from">{c.hero.deal.to}</span>
              <span className="hero-lab">{c.hero.deal.subjectLabel}</span>
              <span className="hero-subj">{c.hero.deal.subject}</span>
              {/* The first line of the draft itself, word for word out of the
                  letter the worked example goes on to show in full. This is the
                  only thing in the hero that is the product rather than a
                  description of it. */}
              <span className="hero-draft">{c.hero.deal.preview}</span>
              <span className="hero-sr">{c.hero.deal.sr}</span>
            </span>
          </a>
        </div>
      </div>

      <div className="hero-bar" ref={barRef}>
        <p>{c.hero.bar.text}</p>
        <a className="hero-btn" href="#fit" onClick={() => { onCta(); focusTarget('fit'); }}>
          {c.nav.cta}
        </a>
      </div>
    </section>
  );
}

/** The two paths the mark is made of.
 *
 * Exported because they were hand-copied into three components, and three
 * copies of a shape is how a shape drifts: when the mark was corrected against
 * the founder's own file, the footer's emboss and the draft card's watermark
 * kept drawing the old wrong one, still on the page, still stamped over his
 * own letter. One definition now; the copies read it. */
export const MARK_BOWL =
  'M420 253 L558 253 A254 254 0 0 1 558 761 L585 761 L585 645 A147 147 0 0 0 598 375 L420 375 Z';
export const MARK_STEM = 'M217 253 H368 V638 H547 V760 H217 Z';

/** The mark.
 *
 * Rebuilt on 2026-09-20 against the founder's own file, because the one here
 * was not his logo. It had a solid orange stem, which made a conventional D
 * standing beside an L. His has no stem at all: the counter opens to the left
 * and the teal bar of the L reads as the D's spine, which is the whole idea of
 * the lockup. I had compared my own path data to my own assumption and called
 * them identical; a pixel diff against the actual file put the disagreement at
 * 5.5% of the frame, in exactly that shape.
 *
 * Every number below was measured off his file rather than eyeballed: the arcs
 * are the outer bowl at r254 and the counter at r147, the counter's radius
 * worked out from its sagitta because SVG had been silently rescaling a radius
 * too small for its chord. The rebuild differs from his by 0.78% of the frame,
 * which at this size is the antialiasing on the edges.
 *
 * The gradient id has to be unique per instance or the second copy on the page
 * borrows the first one's. */
export function Mark({ gradientId }: { gradientId: string }) {
  return (
    <svg viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0.32" y1="0.05" x2="0.72" y2="0.95">
          <stop offset="0" stopColor="#EA6D31" />
          <stop offset="1" stopColor="#EFAB4A" />
        </linearGradient>
      </defs>
      <path
        fill={'url(#' + gradientId + ')'}
        d={MARK_BOWL}
      />
      <path fill="#27697A" d={MARK_STEM} />
    </svg>
  );
}
