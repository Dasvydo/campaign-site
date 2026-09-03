/**
 * Meta pixel, inert by default.
 *
 * The snippet lives here rather than hardcoded in index.html so it can be
 * genuinely inert: with VITE_META_PIXEL_ID empty, nothing is injected, no
 * request is made and no cookie is written. index.html carries the explanatory
 * comment block; this is the loader it refers to.
 *
 * Dovy creates the Meta Business account, sets the ID in Vercel, redeploys.
 * No code change. See BLOCKED.md entry 4.
 */
import { env } from './env';

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

export function initMetaPixel(): void {
  const id = env.metaPixelId;
  if (!id || injected) return;
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
    s.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq?.('init', id);
  window.fbq?.('track', 'PageView');

  // The noscript fallback, also only when an ID exists.
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.alt = '';
  img.src = `https://www.facebook.com/tr?id=${encodeURIComponent(id)}&ev=PageView&noscript=1`;
  const ns = document.createElement('noscript');
  ns.appendChild(img);
  document.body.appendChild(ns);
}

/** Mirrors a funnel step to Meta. No-ops when the pixel is inert. */
export function pixelTrack(event: string, props?: Record<string, unknown>): void {
  if (!env.metaPixelId) return;
  try {
    window.fbq?.('track', event, props);
  } catch {
    /* never break the page for a pixel */
  }
}
