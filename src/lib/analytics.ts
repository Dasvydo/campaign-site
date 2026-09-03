/**
 * PostHog, EU host.
 *
 * The event names below are fixed by the spec and must not drift: the
 * three-market A/B test is decided on them. Every event carries market, locale
 * and the four UTM values, which is why nothing calls posthog.capture directly.
 * Use track() and the properties come along automatically.
 */
import { env } from './env';
import type { Locale, Market, Utm } from './contract';

/** The eight event names, exactly as the spec lists them. */
export type EventName =
  | 'page_view'
  | 'video_play'
  | 'pricing_view'
  | 'form_start'
  | 'form_submit'
  | 'qualified_shown'
  | 'too_small_shown'
  | 'booking_click';

interface Context {
  market: Market;
  locale: Locale;
  utm: Utm;
}

type PostHog = typeof import('posthog-js').default;

let ctx: Context | null = null;
let started = false;
let ph: PostHog | null = null;
/* Events fired before the library finishes loading are held here, not dropped.
   page_view in particular fires on the first frame and would otherwise be lost. */
let pending: Array<{ name: EventName; props: Record<string, unknown> }> = [];

export function initAnalytics(context: Context): void {
  ctx = context;

  if (started) return;
  started = true;

  if (!env.posthogKey) {
    // No key yet. Do not initialise, do not make a request, do not warn in
    // production. See BLOCKED.md entry 4.
    if (import.meta.env.DEV) {
      console.info('[analytics] VITE_POSTHOG_KEY is empty, events log to console only');
    }
    return;
  }

  /* Loaded on demand rather than bundled into the entry chunk. posthog-js is
     larger than the rest of this page put together, and a landing page that
     paints fast converts better than one that ships an analytics library in
     its critical path. */
  void import('posthog-js')
    .then((mod) => {
      const client = mod.default;
      client.init(env.posthogKey, {
        api_host: env.posthogHost,
        // We fire page_view ourselves so it carries market, locale and UTM.
        capture_pageview: false,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        autocapture: false,
        disable_session_recording: true,
      });
      ph = client;
      const queued = pending;
      pending = [];
      for (const e of queued) {
        try {
          client.capture(e.name, e.props);
        } catch {
          /* never break the page for analytics */
        }
      }
    })
    .catch(() => {
      // Blocked by an extension or offline. The page carries on unaffected.
      pending = [];
    });
}

/** Keeps market and locale current when the visitor switches language. */
export function setAnalyticsContext(context: Context): void {
  ctx = context;
}

/**
 * The only way events leave this app. Merges the required properties into every
 * call so a caller cannot forget them.
 */
export function track(name: EventName, props: Record<string, unknown> = {}): void {
  const base = ctx
    ? {
        market: ctx.market,
        locale: ctx.locale,
        utm_source: ctx.utm.source,
        utm_medium: ctx.utm.medium,
        utm_campaign: ctx.utm.campaign,
        utm_content: ctx.utm.content,
      }
    : {};

  const payload = { ...base, ...props };

  if (!env.posthogKey) {
    if (import.meta.env.DEV) console.info('[analytics]', name, payload);
    return;
  }

  if (!ph) {
    // Still loading. Hold it, with a cap so a permanently blocked library
    // cannot grow an unbounded array.
    if (pending.length < 40) pending.push({ name, props: payload });
    return;
  }

  try {
    ph.capture(name, payload);
  } catch {
    // Analytics must never break the page or the form.
  }
}
