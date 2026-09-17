/**
 * The six environment variables, read in one place.
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

  /** The origin this page declares as its own, in canonical, og:url and every
   *  hreflang alternate. Empty -> the deployment URL below, which is where the
   *  page serves from today.
   *
   *  It is a variable rather than a constant because it has to change on the
   *  day teams.doviloop.dev starts serving this page, and on that day a code
   *  edit plus a rebuild is a worse instrument than a value in Vercel: Meta
   *  scrapes og:url to build the ad's link preview, so an ad pointing at one
   *  origin while the page names another is a visible mismatch in the ad
   *  itself. See ad-engine/docs/FUNNEL-HANDOFF.md, Blocker 1. */
  siteOrigin:
    raw(import.meta.env.VITE_SITE_ORIGIN) || 'https://campaign-site-azure.vercel.app',
} as const;

/** Where a 1-9 seat lead is sent. Product pricing, not a campaign page.
 *  Named with the www host the apex redirects to, so a lead we have already
 *  disqualified does not also pay for a 307 on the way out. */
export const PRICING_URL = 'https://www.doviloop.dev/pricing';

/** Last-resort contact if no booking URL is configured yet. */
export const FALLBACK_CONTACT_EMAIL = 'hello@doviloop.dev';
