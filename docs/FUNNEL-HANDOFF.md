# FUNNEL-HANDOFF — pointer

**The contract lives in the `ad-engine` repo: `ad-engine/docs/FUNNEL-HANDOFF.md`.**

It is kept there, not here, because the ads side is the side that has to comply
with it — destination URLs and UTM strings are written into `ad-engine`'s
creative specs. One copy, so the two cannot drift.

## What this repo owes that contract

Three things in this codebase are load-bearing for the funnel. Change any of them
and the ad breaks silently — nothing throws, the leads just misfile.

- **`src/lib/attribution.ts`** — `resolveSource()` maps incoming UTMs onto the
  `source` enum in the lead payload. The ads must send `utm_source=meta` and
  `utm_medium=paid_social` (or one of the other literals it matches) or every paid
  lead files itself as `direct`.
- **`src/lib/contract.ts:31`** — exactly four UTM fields exist. A fifth parameter,
  including a Meta `{{macro}}`, is read by nothing and vanishes.
- **`src/LocalePage.tsx:26`** — `SITE_ORIGIN` is pinned to the `.vercel.app` host
  and is written into `canonical`, `og:url` and every `hreflang`. It must be
  flipped to `https://teams.doviloop.dev` on the same day that domain starts
  serving this page.

## Status as of 2026-09-16

The Meta work here is done and tested: consent-gated pixel, four events
(`PageView`, `ViewContent`, `Lead`, `Schedule`), gate proven by
`npm run verify:consent` — 23 assertions, all PASS. It needs `VITE_META_PIXEL_ID`
set in Vercel and a redeploy. Nothing to rebuild.
