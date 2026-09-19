# Run state: flat-fee pricing and the landing page pass (campaign-site)

Started: 2026-09-16
Last updated: 2026-09-19, later (waves 1-5 verified; wave 6 verified by a second session, T22
              superseded, T23 unblocked and landed; wave 7 landed and self-checked at eight
              tasks; 1 blocked; deployed to production)
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

- **Wave 6 verification (2026-09-19)** was done by a later session that did not
  write any of T16-T22, against the code as it stands now rather than as it stood
  when they landed. That satisfies "someone other than the author", and it is worth
  being precise about what it does not satisfy: it is one reader, not an agent per
  task, and it checked the deliverables that still exist.
- **Wave 7 (T25-T30)** is the landing page grilling pass. Not orchestrated, done in
  one session, checked by the suites plus a deliberate mutation of the offer. No
  independent agent has seen it. `landed`, never `verified`.

**Twenty commits between wave 6 and wave 7 were never scoped.** `1b20ca7` (this
file) through `78fc8dd` carry the two-package offer, the euro switch, the merged
layout and the calculator, and none of them has a task ID, a verdict or a verifier.
They are not in the bar below and the bar is therefore a floor, not a measurement:
the denominator counts the work that was scoped, not the work that was done. That
is the same failure this file opens with, repeated after it was written down.

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
| T16 | Wire the formatters, add the same-email line | 6 | verified | 1 | **PASS** — second session read the same figure in three locales: `4,750` / `4.750` / `4 750` | locale-correct separators | `src/components/{Price,Numbers}.tsx` |
| T17 | Hero: lead with the outcome, put the draft in the hero | 6 | verified | 1 | **PASS** — H1 leads with the outcome and the draft card renders, in all three | new H1, proof card | `src/components/Hero.tsx`, `src/content/*.ts` |
| T18 | Ask the six questions across two screens | 6 | verified | 1 | **PASS** — two named screens and three radio groups on the first, in all three | two-step form, `form_step` | `src/components/Qualifier.tsx`, `src/lib/analytics.ts` |
| T19 | Cut the payback row | 6 | verified | 1 | **PASS** — the ledger reads hours, worth, fee, kept. No payback row survives, in all three | two-figure ledger | `src/components/Numbers.tsx`, `src/lib/offer.ts` |
| T20 | Stop the founding lede claiming we have no customers | 6 | verified | 1 | **PASS** — second session started a pilot in the offer and watched the claim leave the page, then reverted | `noCustomersYet()` | `src/lib/offer.ts`, `scripts/harness-claim.tsx` |
| T21 | Stop calling Individual the other plan on the product site | 6 | verified | 1 | **PASS** — the note names doviloop.dev and no plan; read in en and lt, da by file | corrected note | `src/content/*.ts` |
| T22 | Put Managed in the table, name plans as the source names them | 6 | landed | 1 | **SUPERSEDED, not outstanding** — it landed at `8db3734` and was removed at `ac8cb83`, so it is counted done rather than left in STILL TO DO where it would read as work somebody owes. `Compare.tsx` is gone and `OFFER.compare` and its six rate helpers now reach no component: the published rates are still configured and still guarded, and nothing renders them | five-row comparison, since removed | `src/lib/offer.ts` |
| T23 | Drop the phone field to get under six | 6 | landed | 1 | **UNBLOCKED 2026-09-19** by the founder: spec changed, n8n validator updated to accept an empty string. The field is gone and the fit check asks five. The key is still on the wire, empty, because the contract still declares it. The repo's own mock still encoded the old rule and rejected every submission, which is what caught it; it now checks the key and its type and not its emptiness. **Not verified against the real n8n**, only against that mock | five questions | `src/components/Qualifier.tsx`, `scripts/mock-webhook.mjs` |
| T24 | Prefill the booking email | 6 | blocked | 0 | | | `src/components/Qualifier.tsx` |
| T25 | Derive the minutes from one place instead of two | 7 | landed | 1 | suites + a new assembled assertion; no independent pass | `minutesFromScratch`, a guard that refuses a pair that does not subtract | `src/lib/value.ts`, `src/components/Demo.tsx`, `src/content/*.ts` |
| T26 | Hold the founding counter back until a place has gone | 7 | landed | 1 | suites + started a pilot and watched it appear, then reverted; no independent pass | `anyPlaceTaken` | `src/components/Price.tsx`, `scripts/harness-page.tsx` |
| T27 | Say what happens above the largest package | 7 | landed | 1 | suites; no independent pass | `packages.over` in three locales | `src/content/*.ts`, `src/components/Price.tsx` |
| T28 | Give the hero the hours instead of the break even cost | 7 | landed | 1 | suites + the assembled hero assertion follows the new figure; no independent pass | `heroHoursBack` | `src/lib/value.ts`, `src/components/Hero.tsx`, `src/content/*.ts` |
| T29 | One order for the audiences, in both places they appear | 7 | landed | 1 | read back in three locales; no independent pass | who matches the demo tabs | `src/content/*.ts` |
| T30 | Make the invitation to switch a source off visible | 7 | landed | 1 | layout gate; no independent pass | inked instruction with a rule | `src/styles/paper.css` |
| T31 | Answer what happens when a draft would be wrong | 7 | landed | 1 | suites + every line asserted in the page harness; no independent pass. **Incomplete by design**: two of the strongest lines, what a confidently wrong draft has looked like and where liability sits, need the founder and are not invented | accuracy block in `who` | `src/content/*.ts`, `src/components/WhoFor.tsx` |
| T32 | Put the one person the founding trade is about on the page | 7 | landed | 1 | suites + read back from the DOM in three locales; no independent pass | signed line under the trade | `src/content/*.ts`, `src/components/Price.tsx`, `scripts/audit-locales.mjs` |

## Blocked

| ID | What stands in the way | Whose |
|----|------------------------|-------|
| T24 | The Google booking shortlink strips query parameters. Needs a test of whether the long form accepts an email parameter. **Re-checked 2026-09-19 and still true**, and there is a second reason it cannot be done here: `VITE_BOOKING_URL` is empty in `.env.example`, so this repo does not hold the booking page to test against. The `sameEmail` line shipped in T16 is the standing workaround and is on the confirmation screen now. | founder, 5 minutes |

## Cleared

| ID | What it was waiting on | Cleared by |
|----|------------------------|-----------|
| T23 | The spec and the n8n validator requiring a non-empty phone | The founder, 2026-09-19. **One thing is still unproven**: nothing in this repo has submitted a lead to the real n8n since. One real submission end to end would settle it, and until somebody does, a validator that was not actually updated would drop every lead in silence. |

## To test it live

**The paragraph that used to sit here described a page that no longer exists.** It
recorded a deployed bundle carrying `390`/`490`/`590`, which was the rising tier
ladder. That ladder was replaced by the two-package offer at `9814dea` and the
currency moved to euro at `09a86a9`, both of them after this file was written and
neither of them scoped. Anyone reading the old paragraph would have checked the
live page against three prices that are not on it.

What holds as of 2026-09-19, on `claude/campaign-build-status-9j9194` at `0912c1c`,
measured locally rather than against the deployment: `npm run verify` is green at
383 checks, the served-build consent layout gate is green at 90 across four
viewports and three locales, and `/`, `/da` and `/lt` all return 200. The offer is
two packages at 149 and 199 EUR.

**Not checked: the deployment.** Nothing in this session read the live URL, so
whether Vercel is serving this commit is unknown from here.

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
