/**
 * Meta pixel, inert by default and gated on consent.
 *
 * The snippet lives here rather than hardcoded in index.html so it can be
 * genuinely inert: with VITE_META_PIXEL_ID empty, nothing is injected, no
 * request is made and no cookie is written. index.html carries the explanatory
 * comment block; this is the loader it refers to.
 *
 * Two gates now, not one. An ID must exist AND the visitor must have accepted.
 * That ordering matters: the pixel writes _fbp to the device the moment
 * fbevents.js initialises, so the check has to sit in front of the injection
 * rather than in front of the events. See consent.ts.
 */
import { env } from './env';
import { consentGranted } from './consent';

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      push?: unknown;
      loaded?: boolean;
      version?: string;
    };
    _fbq?: unknown;
  }
}

let injected = false;

/**
 * Injects the pixel. Safe to call repeatedly: it is called once on mount and
 * again whenever consent changes, and only the first call that finds both an
 * ID and a granted consent does anything.
 */
export function initMetaPixel(): void {
  const id = env.metaPixelId;
  if (!id || injected) return;
  if (!consentGranted()) return;
  if (typeof document === 'undefined') return;
  injected = true;

  /* Standard fbevents.js loader, unmodified apart from formatting. */
  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    /* Meta's own snippet ends `s.parentNode.insertBefore(t, s)` and assumes a
       script tag already exists. When none does it throws, or silently does
       nothing under optional chaining, and the result is the worst of both
       worlds: fbq is defined, so every call is accepted and queued, but
       fbevents.js never loads and none of it is ever sent. Falling back to the
       head means the loader cannot half-succeed. */
    if (s?.parentNode) s.parentNode.insertBefore(t, s);
    else (b.head || b.documentElement).appendChild(t);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq?.('init', id);
  window.fbq?.('track', 'PageView');

  /* There used to be a <noscript> <img> beacon here, Meta's standard fallback
     for visitors with JavaScript turned off. It was removed on 2026-09-22
     because it could never do that job and was actively corrupting the count.

     Two reasons, and the second is the one that cost us numbers.

     It cannot help a visitor without JavaScript, because this whole file is
     JavaScript. If the loader above ran, scripts are on, and the browser will
     never render the contents of a <noscript> it just built. So the beacon was
     unreachable for the only audience it existed to serve.

     And setting `.src` on an element created by document.createElement fires
     the request THERE AND THEN, while it is still detached. Parking it inside a
     <noscript> afterwards does not unsend it. So every visitor WITH JavaScript
     sent two PageViews for one page load - one from this beacon, one from fbq -
     and neither carried an event_id, so Meta had nothing to deduplicate on.
     Landing page views, and every ratio built on them, read about twice high.
     Measured in a real browser, 2026-09-22.

     There is no replacement, and that is deliberate rather than an omission. A
     real no-JS beacon would have to be static markup in index.html, which would
     fire before the visitor answered the consent notice - exactly the thing
     consent.ts exists to prevent. A no-JS visitor is not counted. That is the
     correct trade in DK and LT, and it is a rounding error next to counting
     every other visitor twice. */
}

/** Mirrors a funnel step to Meta. No-ops when the pixel is inert or unconsented. */
export function pixelTrack(event: string, props?: Record<string, unknown>): void {
  if (!env.metaPixelId || !consentGranted()) return;
  try {
    window.fbq?.('track', event, props);
  } catch {
    /* never break the page for a pixel */
  }
}

/**
 * Best effort cleanup when consent is withdrawn.
 *
 * fbevents.js cannot be unloaded once it is in the document, so what this can
 * honestly promise is: the cookies it wrote are expired, and pixelTrack stops
 * calling it, so nothing further is sent. A reload after this leaves no pixel
 * at all, because initMetaPixel will not run again. Anything already sent
 * before the visitor changed their mind is gone to Meta and this cannot
 * retrieve it - which is exactly why the gate is in front of the injection.
 */
export function revokeMetaPixel(): void {
  if (typeof document === 'undefined') return;
  const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
  /* _fbp is set on the registrable domain, so it is cleared on both the exact
     host and the dot-prefixed parent that fbevents.js actually writes to. */
  const host = window.location.hostname;
  const parts = host.split('.');
  const domains = [host, parts.length > 1 ? `.${parts.slice(-2).join('.')}` : host];
  for (const name of ['_fbp', '_fbc']) {
    document.cookie = `${name}=; expires=${past}; path=/`;
    for (const d of domains) {
      document.cookie = `${name}=; expires=${past}; path=/; domain=${d}`;
    }
  }
}
