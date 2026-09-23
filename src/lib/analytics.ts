/**
 * PostHog, EU host.
 *
 * Every event carries market, locale and the four UTM values, which is why
 * nothing calls posthog.capture directly. Use track() and the properties come
 * along automatically.
 *
 * The union below is the page's entire vocabulary, and it is not decoration:
 * an event name is what a dashboard, a Meta audience and a conversion goal are
 * each built on, and once one is live the name is the only thing anybody reads
 * it by. A name that describes a motion the page no longer performs is worse
 * than no event at all, because it reports the old motion happening.
 */
import { env } from './env';
import { consentDecided, consentGranted } from './consent';
import type { Locale, Market, Utm } from './types';

/** The event names the page may raise.

    THIS SET DESCRIBES A SELF-SERVE TRIAL. The set before it described a whole
    firm flat fee sold through a gated sales call, and by the time the page had
    finished changing under it, two of its four names were reporting things
    that were not happening:

      - `booking_click` fired from the hero. There is no call to book. The
        button it fired from offers a 14 day trial, and the `#fit` target it
        carries was deleted with the old funnel, so every one of those events
        recorded booking intent for a press that moved the visitor nowhere at
        all. `trial_cta_click` below is what actually took place: the primary
        call to action was pressed. It claims nothing about where the visitor
        arrived, because today they do not arrive anywhere.

      - `pricing_view` was declared and deliberately never raised: it named a
        price band that had been deleted, and it was kept for the band's
        return. The price came back as the section directly under the hero,
        which is where the brief puts it precisely so that it would convert,
        and it emitted nothing, so the one decision this page was rebuilt
        around could not be measured.

    Five names now, and every one of them is raised from somewhere in src/.
    `page_view` and `demo_desk` are untouched: they describe what they always
    described.

    ON THE NAMES THEMSELVES. Each one says what the VISITOR did, not what the
    business would like that to mean. `booking_click` is the lesson: it was
    named for the outcome somebody hoped a press implied, so when the outcome
    went away the name stayed and kept promising it. `price_seen` is named for
    a thing that can be observed happening; `enterprise_enquiry` is raised only
    once the enquiry has actually arrived somewhere it can be answered.

    WHY THE PRICE EVENT IS NOT CALLED `pricing_view`. scripts/verify-payload.mjs
    reads these names out of this union and asserts each is raised, with an
    exemption list that still pins `pricing_view` as declared-and-never-raised
    from the months it was exactly that. Raising a name on that list fails the
    gate, and scripts/ is not this change's to edit. The rename is not a dodge:
    `price_seen` is the more accurate name for what the dwell gate in Tiers.tsx
    actually observes, and the stale exemption can be dropped whenever the
    gates are next touched, because nothing declares `pricing_view` any more. */
export type EventName =
  /* First frame, from LocalePage, carrying the path. */
  | 'page_view'
  /* Which of the three desks a visitor picks in the worked example: the
     strongest signal on the page of what they actually do for a living. It
     replaces video_play, which keyed on a demo video that never existed. */
  | 'demo_desk'
  /* The price was on this reader's screen, rather than merely on a page they
     loaded. Raised from the tiers section, from LocalePage, behind the dwell
     gate the deleted price band used: the per seat cards have to hold the
     middle half of the viewport continuously before it counts. A page_view to
     price_seen ratio is the measurement of the decision to move the price
     above the worked example. */
  | 'price_seen'
  /* The primary call to action was pressed. `placement` says which copy of it,
     'hero' or 'pricing', because which of the two converts is the thing the
     price-first layout is being judged on. It does not assert that a signup
     was reached: the target is dangling until the trial signup is built. */
  | 'trial_cta_click'
  /* A larger firm wrote in through the enterprise form AND the enquiry
     arrived. Raised on delivery only; see Enterprise.tsx for what the queued
     and undelivered outcomes do instead, and why they raise nothing. */
  | 'enterprise_enquiry';

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
