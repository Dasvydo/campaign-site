# Run state: flat-fee pricing and the landing page pass (campaign-site)

Started: 2026-09-16
Last updated: 2026-09-16 (waves 1-5 verified; wave 6 landed and self-checked only; 2 blocked)
Status: executing
Domain profile: software, with a `content` lens — every task shipped copy in en/da/lt

## How this file came to exist, and what that costs it

It was written **after** the work, not during it. The orchestrator was supposed to
write it before the first wave launched and did not, so for the whole run there was
no denominator and `/progress` could not answer a single question about this repo.
That is the finding this file opens with, because it is the one that cost the most.

What is reconstructed, and from what:

- **Waves 1-5 (T1-T15)** ran under `batch-orchestrator`, each task checked by a
  verifier agent that did not do the work. The scope table itself was never
  committed, so the titles below are recovered from the commit log and the run
  record. **T9-T15 map to their original IDs; T3-T8 do not** — those IDs existed but
  the mapping from ID to commit was not written down and is not recoverable. Their
  rows are named for what the commit did.
- **Wave 6 (T16-T22)** was not orchestrated. Tasks were done directly, in one
  session, and checked by the suites plus deliberate mutation. **No independent
  agent saw any of it.** They are `landed`, never `verified`, and that gap is the
  single most useful thing this file records.

Verified here means what the bar means: someone other than the author checked it.
Passing suites is evidence, not a verifier.

## Scope

This run is `campaign-site` only. Ads are not in it: `ad-engine` has no run file and
nothing was built there. Two branches on `flow-savvy-automations` came out of this
session and belong to that repo's own runs, not this one.

## Original request

> HANDOFF.md document argues the fact that I cant really have such high prices having
> in mind that i dont have any active users [...] I need your help when it comes to
> structuring the price and offer

Then, after the waves:

> This is the transcript of one of the Hormozi's shorts where he talks about the
> landing page. Take that into account when you done with all of the waves

## Mission brief (frozen)

```
GOAL:        Replace the per-seat model with one flat fee for the firm, on a tier
             ladder that can be advanced by hand, with every figure read from one
             config so no two places on the page can disagree.
DONE WHEN:   The page sells the flat fee in en/da/lt, the build refuses a
             configuration that contradicts itself, and no claim survives a tier
             it stops being true on.
CONSTRAINTS: No em dash. No invented proof. No price digit in a locale file.
             Never push to the default branch without being asked.
OUT OF SCOPE: auth, DB schema, lib/contract.ts, n8n workflow JSON, any repo
             other than campaign-site and ad-engine.
```

## Tasks

| ID | Title | Wave | Status | Attempts | Verdict | Deliverable | Owns |
|----|-------|------|--------|----------|---------|-------------|------|
| T1 | One config for the ladder, with a guard that can fail | 1 | verified | 2 | **PARTIAL → closed** — first guard was circular, verifier mutated four values and it still passed | `src/lib/offer.ts` | `src/lib/offer.ts`, `scripts/verify-offer.mjs` |
| T2 | Price the firm, not the seat: English master | 1 | verified | 2 | **PARTIAL → closed** — five copy defects on first pass | flat-fee content contract | `src/content/types.ts`, `src/content/en.ts` |
| T3 | Render the flat fee and the active tier | 2 | verified | 1 | **PASS** | rebuilt price band | `src/components/Price.tsx` |
| T4 | Compute the ledger figures instead of leaving them blank | 2 | verified | 1 | **PASS** | computed multiple and payback | `src/components/Numbers.tsx` |
| T5 | Check figures against the offer, not a word list | 2 | verified | 1 | **PASS** | assembled assertions | `scripts/harness-page.tsx` |
| T6 | The sum per head, and only the claims that hold | 3 | verified | 1 | **PASS** — orchestrator gave it a wrong spec line; it followed the arithmetic instead | `src/components/Compare.tsx` | `src/components/Compare.tsx` |
| T7 | Danish onto the price band | 3 | verified | 1 | **PASS** | | `src/content/da.ts` |
| T8 | Lithuanian onto the price band | 3 | verified | 1 | **PASS** | | `src/content/lt.ts` |
| T9 | Argue against Team and the curve, not against Individual | 4 | verified | 2 | **PARTIAL → closed** — first pass kept the comparison the offer loses at ten people | reframed comparison | `src/components/Compare.tsx`, `src/content/en.ts` |
| T10 | Make the guard actually gate the build | 4 | verified | 1 | **PASS** | `prebuild` hook | `package.json`, `scripts/verify-offer.mjs` |
| T11 | Assert the ledger figures, which shipped blank once already | 4 | verified | 1 | **PASS** | per-row numeral assertions | `scripts/harness-page.tsx` |
| T12 | Formatters that read correctly in the language they print in | 5 | verified | 1 | **PASS** — built and tested, call sites deferred to T16 | `formatMoney`, `formatCount` | `src/lib/offer.ts` |
| T13 | Danish onto the reworked comparison | 5 | verified | 1 | **PASS** | | `src/content/da.ts` |
| T14 | Lithuanian onto the reworked comparison | 5 | verified | 1 | **PASS** | | `src/content/lt.ts` |
| T15 | Catch the comparison coming back | 5 | verified | 1 | **PASS** — caught a mutation that reinstated the losing row under another name | negative checks | `scripts/harness-page.tsx` |
| T16 | Wire the formatters, add the same-email line | 6 | landed | 1 | suites + 3 mutations; no independent pass | `19,50` on da/lt | `src/components/{Price,Compare,Numbers}.tsx` |
| T17 | Hero: lead with the outcome, put the draft in the hero | 6 | landed | 1 | suites + 2 mutations; no independent pass | new H1, proof card | `src/components/Hero.tsx`, `src/content/*.ts` |
| T18 | Ask the six questions across two screens | 6 | landed | 1 | suites + 3 mutations; no independent pass | two-step form, `form_step` | `src/components/Qualifier.tsx`, `src/lib/analytics.ts` |
| T19 | Cut the payback row | 6 | landed | 1 | suites + tuple guard; no independent pass | two-figure ledger | `src/components/Numbers.tsx`, `src/lib/offer.ts` |
| T20 | Stop the founding lede claiming we have no customers | 6 | landed | 1 | suites + 3 mutations + a second-state harness; no independent pass | `noCustomersYet()` | `src/lib/offer.ts`, `scripts/harness-claim.tsx` |
| T21 | Stop calling Individual the other plan on the product site | 6 | landed | 1 | suites; no independent pass | corrected note | `src/content/*.ts` |
| T22 | Put Managed in the table, name plans as the source names them | 6 | landed | 1 | suites + 2 mutations; no independent pass | five-row comparison | `src/lib/offer.ts`, `src/components/Compare.tsx` |
| T23 | Drop the phone field to get under six | 6 | blocked | 0 | | | `src/components/Qualifier.tsx` |
| T24 | Prefill the booking email | 6 | blocked | 0 | | | `src/components/Qualifier.tsx` |

## Blocked

| ID | What stands in the way | Whose |
|----|------------------------|-------|
| T23 | `phone` is required non-empty by the shared contract in `00-START-HERE.md`. The validator rejects an empty string, so sending a blank drops every lead. Needs the spec changed, then Batch F on the n8n validator and Batch B on the ledger. | founder, then B and F |
| T24 | The Google booking shortlink strips query parameters. Needs a test of whether the long form accepts an email parameter. | founder, 5 minutes |

## To test it live

The page is live. `campaign/a-site` was fast-forwarded to `8db3734` and Vercel
rebuilt it; the deployed bundle was read back and carries `390`/`490`/`590` and no
`890`, with zero cookies set before consent. Chromium against the live URL shows no
console errors and no failed requests, and `verify:consent-layout` passes at three
viewports in three locales.

What is NOT testable live: nobody can pay. Stripe is in test mode on the product
site and every pricing CTA there routes to a call. That is fine for a campaign that
books calls, and it is the next thing that breaks if a lead says yes.

## Decisions taken during the run

| Decision | Taken |
|---|---|
| Compare against Team at its ceiling, not Individual | founder chose A after the coherence audit |
| Setup fee stays 500 on both sites | founder |
| Both Managed and this offer stay; align the sites | founder |
| Cut the payback row rather than soften it | founder |
| Drop phone vs split the form | founder chose drop; blocked by contract, split shipped instead |
