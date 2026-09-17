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
- **`VITE_SITE_ORIGIN`** — the origin written into `canonical`, `og:url` and every
  `hreflang`. Meta scrapes `og:url` for the ad's link preview. It defaults to the
  `.vercel.app` deployment; set it to `https://teams.doviloop.dev` in Vercel on
  the day that domain starts serving this page. It was a literal in
  `src/LocalePage.tsx:26` until 2026-09-17; same default, so nothing changed today.

## What the page claims, that an ad may not

The `numbers` block renders `430 USD saved per month, for each person` and a
multiple computed from it at runtime. **The page is allowed to** — it carries
"These are a model, not a measurement" in the same eyeline. An ad carries no
disclosure, so `ad-engine`'s claims gate now blocks both. Scan this repo's copy
with:

```
cd ../ad-engine && python -m engine.cli check --landing ../campaign-site/src/content
```

Advisory only; it does not fail. Price is **out of scope** and deliberately still
passes the gate.

## Status as of 2026-09-16

The Meta work here is done and tested: consent-gated pixel, four events
(`PageView`, `ViewContent`, `Lead`, `Schedule`), gate proven by
`npm run verify:consent` — 23 assertions, all PASS. It needs `VITE_META_PIXEL_ID`
set in Vercel and a redeploy. Nothing to rebuild.
