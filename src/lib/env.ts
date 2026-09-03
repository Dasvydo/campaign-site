/**
 * The five environment variables, read in one place.
 *
 * Every one of them is empty in this container and will stay empty until Dovy
 * fills them in Vercel. Nothing here throws or blocks when a value is missing:
 * each consumer degrades to something that still works. See .env.example for
 * where each value comes from, and BLOCKED.md entry 4.
 */

const raw = (v: string | undefined): string => (v ?? '').trim();

export const env = {
  /** Batch F's n8n webhook. Empty -> POST to same-origin /api/lead, which the
   *  local mock endpoint answers in dev. */
  leadWebhookUrl: raw(import.meta.env.VITE_LEAD_WEBHOOK_URL),

  /** Google Calendar booking page. Empty -> the confirmation screen shows a
   *  mailto fallback so a qualified lead is never left with a dead end. */
  bookingUrl: raw(import.meta.env.VITE_BOOKING_URL),

  /** PostHog project key. Empty -> analytics no-ops entirely, no network call. */
  posthogKey: raw(import.meta.env.VITE_POSTHOG_KEY),

  /** PostHog ingestion host. EU by default, which is the requirement. */
  posthogHost: raw(import.meta.env.VITE_POSTHOG_HOST) || 'https://eu.i.posthog.com',

  /** Meta pixel ID. Empty -> the pixel snippet stays inert, no script loaded. */
  metaPixelId: raw(import.meta.env.VITE_META_PIXEL_ID),
} as const;

/** Where a 1-9 seat lead is sent. Product pricing, not a campaign page. */
export const PRICING_URL = 'https://doviloop.dev/pricing';

/** Last-resort contact if no booking URL is configured yet. */
export const FALLBACK_CONTACT_EMAIL = 'hello@doviloop.dev';
