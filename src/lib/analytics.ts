/**
 * PostHog, EU host.
 *
 * The event names below are fixed by the spec and must not drift: the
 * three-market A/B test is decided on them. Every event carries market, locale
 * and the four UTM values, which is why nothing calls posthog.capture directly.
 * Use track() and the properties come along automatically.
 */
import posthog from 'posthog-js';
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

let ctx: Context | null = null;
let started = false;

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

  posthog.init(env.posthogKey, {
    api_host: env.posthogHost,
    // We fire page_view ourselves so it carries market, locale and UTM.
    capture_pageview: false,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    autocapture: false,
    disable_session_recording: true,
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

  try {
    posthog.capture(name, payload);
  } catch {
    // Analytics must never break the page or the form.
  }
}
