/**
 * PostHog, EU host.
 *
 * The event names below are fixed by the spec and must not drift: the
 * three-market A/B test is decided on them. Every event carries market, locale
 * and the four UTM values, which is why nothing calls posthog.capture directly.
 * Use track() and the properties come along automatically.
 */
import { env } from './env';
import { consentDecided, consentGranted } from './consent';
import type { Locale, Market, Utm } from './types';

/** The event names the page may raise.

    It was eight, fixed by the spec the fit-check form was built to. Five of
    them described that form and its two result screens: form_start, form_step,
    form_submit, qualified_shown, too_small_shown. The form is gone, nothing
    raises them, and leaving them declared would be a vocabulary for a funnel
    that no longer exists - a name in this union reads as an event somebody can
    build a dashboard or an audience on.

    `pricing_view` is kept although nothing on the page raises it today. It
    describes a band this page is getting back, it is what Meta audience 3
    keys on, and the consent gate fires it as its test event. */
export type EventName =
  | 'page_view'
  /* Which of the three desks a visitor picks in the worked example: the
     strongest signal on the page of what they actually do for a living. It
     replaces video_play, which keyed on a demo video that never existed. */
  | 'demo_desk'
  | 'pricing_view'
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
   page_view in particular fires on the first frame and would otherwise be lost.
   The same queue covers the wait for a consent decision: an event raised while
   the notice is still up stays in this array, in memory, and is either flushed
   on Accept or discarded on Decline. Nothing is written to the device and
   nothing leaves the page until there is a yes. */
let pending: Array<{ name: EventName; props: Record<string, unknown> }> = [];

export function initAnalytics(context: Context): void {
  ctx = context;
  maybeStart();
}

/**
 * Boots PostHog if, and only if, there is both a key and a granted consent.
 * Called on mount and again from applyConsent(), so an Accept that arrives
 * after first paint starts the library at that moment rather than never.
 */
function maybeStart(): void {
  if (started) return;
  /* The gate. PostHog is configured with persistence 'localStorage+cookie'
     below, so initialising it at all writes to the visitor's device. */
  if (!consentGranted()) return;
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

/**
 * Re-reads the consent store after the visitor answers the notice.
 *
 * Accept starts the library and flushes whatever was held. Decline throws the
 * held events away: they were never sent and are not kept for a later change of
 * mind, because that is not what declining means.
 */
export function applyConsent(): void {
  if (consentGranted()) {
    maybeStart();
    return;
  }
  if (consentDecided()) pending = [];
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

  /* An answered no is final for this event. An unanswered notice falls through
     to the pending queue below, which is memory only. */
  if (consentDecided() && !consentGranted()) {
    if (import.meta.env.DEV) console.info('[analytics] declined, dropped', name, payload);
    return;
  }

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
