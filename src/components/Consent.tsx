import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { Content } from '../content/types';
import {
  clearConsent,
  consentChoice,
  consentDecided,
  consentIsAutomatic,
  setConsent,
  type Choice,
} from '../lib/consent';

/** Footer dispatches this to reopen the notice. Avoids threading a context
 *  through seven components for one link. */
export const CONSENT_OPEN_EVENT = 'dl:consent-open';
/* Fired when a visitor answers, so the footer's cookie row stops saying "not
   set" the moment they have set it. The open event could not do this job: the
   notice itself listens to that one and would reopen on every answer. Without
   it the row was correct only on a reload, which is to say it was wrong for
   the whole of the visit in which the choice was made. */
export const CONSENT_SET_EVENT = 'dl:consent-set';

/**
 * The consent notice.
 *
 * Set as a slip laid on the desk rather than a bar bolted to the window,
 * because everything else on this page is paper and a consent banner is the
 * one element visitors are most trained to distrust on sight.
 *
 * Three rules it holds itself to:
 *
 *   1. Accept and Decline are the same size, the same weight and the same
 *      distance from the thumb. A notice where declining is harder than
 *      accepting is not collecting consent, it is collecting clicks.
 *   2. It states what actually loads, in the two categories this page really
 *      has, rather than the usual five-category taxonomy copied from a vendor.
 *   3. It never traps focus. It is not modal: the page underneath is readable,
 *      scrollable and usable while it is up, because nothing on this page is
 *      gated on the answer.
 *
 * It renders first in the document so the keyboard reaches it before the page,
 * and it takes over the bottom of a phone screen from the standing price bar
 * for as long as it is up, rather than stacking two fixed bars on top of each
 * other. See the CONSENT block in paper.css.
 */
export function Consent({ c }: { c: Content }) {
  const t = c.consent;
  const [open, setOpen] = useState(false);
  /* The reopened notice gets focus, the first-load one does not: a page that
     moves focus before the visitor has done anything is a page that loses
     their place. */
  const [takeFocus, setTakeFocus] = useState(false);
  const panel = useRef<HTMLDivElement | null>(null);
  const head = useRef<HTMLParagraphElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  /* Mounted, not initial state: consentDecided() reads localStorage, and doing
     that during render would differ between the first client paint and any
     future server render. */
  useEffect(() => {
    if (!consentDecided()) setOpen(true);
  }, []);

  useEffect(() => {
    const reopen = () => {
      setTakeFocus(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  /* Tells the stylesheet whether the bottom of the viewport is spoken for, and
     measures the slip so the footer is never left underneath it. */
  useEffect(() => {
    const body = document.body;
    body.dataset.consent = open ? 'pending' : 'set';

    if (!open) {
      body.style.removeProperty('--consent-h');
      return;
    }
    const el = panel.current;
    if (!el) return;

    const measure = () => {
      body.style.setProperty('--consent-h', `${Math.ceil(el.getBoundingClientRect().height)}px`);
    };
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  useEffect(() => {
    if (open && takeFocus) head.current?.focus();
  }, [open, takeFocus]);

  const answer = useCallback((choice: Choice) => {
    setConsent(choice);
    setOpen(false);
    setTakeFocus(false);
    window.dispatchEvent(new Event(CONSENT_SET_EVENT));
  }, []);

  /* Escape closes only a notice that is being revisited. On first load there is
     no previous answer to fall back to, so dismissing it would have to invent
     one, and an invented consent is the thing this whole file exists to avoid. */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && consentDecided()) {
        setOpen(false);
        setTakeFocus(false);
      }
    },
    [],
  );

  if (!open) return null;

  return (
    <div
      className="consent"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      ref={panel}
      onKeyDown={onKeyDown}
    >
      <div className="consent-slip">
        <p className="consent-h" id={titleId} tabIndex={-1} ref={head}>
          {t.title}
        </p>
        <p className="consent-body" id={bodyId}>
          {t.body}
        </p>

        {/* The disclosure and the policy link share a row. Both are secondary,
            both are one line, and on a phone giving the link a row of its own
            cost more height than the notice's whole question. */}
        <div className="consent-meta">
          <details className="consent-more">
            <summary className="consent-sum">
              <span className="consent-mark" aria-hidden="true" />
              {t.detailsLabel}
            </summary>
            <dl className="consent-dl">
              {t.items.map((item) => (
                <div key={item.name}>
                  <dt>{item.name}</dt>
                  <dd>{item.body}</dd>
                </div>
              ))}
            </dl>
            <p className="consent-note">{t.note}</p>
          </details>

          <a
            className="consent-priv"
            href="https://doviloop.dev/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.privacyLabel}
          </a>
        </div>

        <div className="consent-acts">
          {/* Same element, same class, same order every time. The only
              difference between the two is the word on them. */}
          <button type="button" className="consent-btn" onClick={() => answer('granted')}>
            {t.accept}
          </button>
          <button type="button" className="consent-btn" onClick={() => answer('denied')}>
            {t.decline}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The footer's row. Shows the standing answer and reopens the notice.
 *
 * A withdrawal has to be as easy as the original yes, which in practice means
 * it has to be somewhere a visitor can find six weeks later without reading the
 * privacy policy to get there.
 */
export function ConsentStatus({ c }: { c: Content }) {
  const t = c.consent;
  const [choice, setChoice] = useState<Choice | null>(null);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    setChoice(consentChoice());
    setAuto(consentIsAutomatic());
    /* Re-read whenever the notice closes, so the footer never shows a stale
       answer on a page the visitor has not reloaded. */
    const sync = () => setChoice(consentChoice());
    window.addEventListener(CONSENT_OPEN_EVENT, sync);
    window.addEventListener(CONSENT_SET_EVENT, sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, sync);
      window.removeEventListener(CONSENT_SET_EVENT, sync);
      document.removeEventListener('visibilitychange', sync);
    };
  });

  const label =
    choice === 'granted' ? t.statusGranted : choice === 'denied' ? t.statusDenied : t.statusUnset;

  /* A browser-level opt-out is not ours to overrule, so there is nothing to
     reopen: the row states the answer and stops. */
  if (auto) return <span className="footer-a footer-a-flat">{label}</span>;

  return (
    <button
      type="button"
      className="footer-a footer-a-btn"
      aria-label={t.reopenLabel}
      onClick={() => {
        clearConsent();
        window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
      }}
    >
      {label}
    </button>
  );
}
