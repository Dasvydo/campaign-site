# Run state: flat-fee pricing and the landing page pass (campaign-site)

Started: 2026-09-16
Last updated: 2026-09-20 (waves 1-5 verified; wave 6 verified, T22 superseded, T23 landed;
              wave 7 verified by four independent agents, which refuted two claims outright
              and found five things asserted by nothing; wave 8 partly verified, T34 and T35
              both came back PARTIAL and both are fixed, T33 still with its verifier, so the
              wave is NOT yet verified; three findings left to the founder, recorded below;
              1 blocked; deployed at fcdf808 and read back off the live bundle)
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
| T25 | Derive the minutes from one place instead of two | 7 | verified | 2 | **REFUTED → fixed.** The guard was never called from anywhere: dead code, and `5 - 1` is a literal, not a derivation. A verifier set the constant to 9 and got a page stating three inconsistent minute figures, with a clean build. Now subtracted from named constants, so the drift is unrepresentable, and `validateValue` is wired into the prebuild. All three of the verifier's breaks now fail the build | one source of truth, actually enforced | `src/lib/value.ts`, `scripts/verify-offer.mjs`, `src/components/Demo.tsx` |
| T26 | Hold the founding counter back until a place has gone | 7 | verified | 2 | **PARTIAL → fixed.** Rendering was genuinely absent, not hidden. But it counted holds, so one booked call printed a counter inches under "no customers yet"; the gate left an orphan screen-reader heading; and a gate wired to `false` passed every check, because nothing rendered the state where it should appear. Counts started pilots now, matching `noCustomersYet()`; both directions asserted | `pilotsStarted() > 0` | `src/components/Price.tsx`, `scripts/harness-claim.tsx`, `scripts/verify-payload.mjs` |
| T27 | Say what happens above the largest package | 7 | verified | 2 | **PARTIAL → fixed.** Renders, visible, well placed, and the underlying gap is real (a 40-person firm still books and still cannot use the calculator). It was asserted by nothing: replaced with `{null}` to a green suite. Asserted now. Danish said "en ordentlig pris", which reads as "a hefty price" to the firm just told it is too big; rewritten | `packages.over`, checked | `src/content/*.ts`, `scripts/harness-page.tsx` |
| T28 | Give the hero the hours instead of the break even cost | 7 | verified | 1 | **PARTIAL, the typed half fixed by T35.** The hours are genuinely computed: a verifier recomputed 41 by hand and moved `heroInbound` to watch the page follow. Two things are typed, not derived, and are recorded rather than fixed: "a firm of twenty" is spelled out in three locale files with no link to `covers` (though `verify-offer` pins `covers` at 20), and the da/lt endings are correct for one count each. Those counts are pinned now, so moving them fails the build | `heroHoursBack`, pinned | `src/lib/value.ts`, `scripts/verify-offer.mjs` |
| T34 | Pair the two lists that name the audiences | 8 | verified | 2 | **PARTIAL → fixed.** The pairing is real and the two drift modes it was built for are caught. A verifier drove through three holes it left open: the harness compared the two lists as sequences without requiring each trade to appear once, so a list holding the same id twice passed; nothing pinned the order itself, so both lists could be rotated together and stay equal; and `desks[0]` is the trade the hero letter opens on, which nothing asserted. The `AudienceId` comment also claimed TypeScript compares the two lists, which it does not. Distinctness asserted in the page harness, the order pinned to property,accounting,insurance in `verify-payload`, comment corrected | enforced alignment, order pinned | `src/content/types.ts`, `src/content/*.ts`, `scripts/harness-page.tsx`, `scripts/verify-payload.mjs` |
| T35 | Read the hero's head count from the offer | 8 | verified | 2 | **PARTIAL → fixed.** Both hero figures are genuinely derived and the pins hold. Two defects found. The payback line broke between 320 and 350px with "41" ending one line and its unit opening the next, so the eye read a bare number; non-breaking spaces now bind every figure to its unit in all three locales. And moving `desk.covers` from 10 to 12 cost only two guard edits, after which one card said "People covered, up to 12" and, four lines down, "For a firm of ten people." Those three prose counts are gone rather than derived, on the reasoning that a figure appearing once cannot disagree with itself. **Five head-count sentences elsewhere are still typed and decoupled** and are recorded below rather than fixed | two derived slots, prose counts removed | `src/content/*.ts`, `src/components/Hero.tsx`, `scripts/verify-offer.mjs` |
| T29 | One order for the audiences, in both places they appear | 7 | verified | 1 | **CONFIRMED, then PROTECTED by T34.** Was: A verifier read both orders out of a real browser in all three locales and could not break them, and found no third enumeration anywhere. But swapping two cards in one locale passes the whole suite: nothing asserts the alignment, and `who.groups[]` has no id to pair with `desks[].id`. The fix is real and can silently drift again | who matches the demo tabs | `src/content/*.ts` |
| T30 | Make the invitation to switch a source off visible | 7 | verified | 1 | **PARTIAL, and superseded by T33.** The CSS applies and nothing overrides it (13.2:1, up from 4.6:1). But the verifier judged it cosmetic: the slips still read as evidence, not controls, and the change reaches the reader who reads top to bottom, not the scanner. It also caught the CSS comment inventing a convention that does not exist. Kept, because it costs nothing | inked instruction | `src/styles/paper.css` |
| T31 | Answer what happens when a draft would be wrong | 7 | verified | 2 | **PARTIAL → fixed. A rule was broken.** Three of the four lines traced to pre-existing copy. The fourth ended "so anything it says can be checked against the file it came from", which generalises a claim about three named things to every sentence in a draft and presupposes provenance the page never claims. That is invented proof. Cut back. Danish comma and honoraret/gebyret drift also fixed. Still incomplete by design: the confidently-wrong case and liability need the founder | accuracy block, traceable | `src/content/*.ts`, `src/components/WhoFor.tsx` |
| T33 | Make the section demonstrate itself | 7 | landed | 1 | a new real-browser gate, `scripts/verify-demo.mjs`, holding it to performing, restoring, staying away under reduced motion and standing down on a click; proved by breaking it. No independent pass | the performed demonstration | `src/components/Demo.tsx`, `scripts/verify-demo.mjs` |
| T32 | Put the one person the founding trade is about on the page | 7 | verified | 2 | **CONFIRMED on the exemption, REFUTED on placement.** The audit exemption is exactly the name and nothing else, proved by mutation in both directions. But the signature sat inside a disclosure that is closed at rest, so no reader saw the name without clicking, defeating the point of adding it. Moved onto the open band. Lithuanian register and "paleidimo/idiegimo" also fixed | signed line, on the open band | `src/components/Price.tsx`, `src/content/*.ts`, `scripts/audit-locales.mjs` |

## Found and not fixed, because the call is the founder's

These are wave 8 verifier findings that were deliberately left. Each one is a real
decoupling; none of them is wrong on the page as it stands today.

**Five head-count sentences are still typed, not derived.** `hero.dateline` says
"teams of ten and up", `who.notes.seats.mid` says "priced for ten people and up",
`results.tooSmall.title` says "This one starts at ten people", `meta.description`
says "For teams of 10 or more", and `form.teamSizeOptions` carries the band labels
whose `'1-9'` value the qualifier gate in `src/lib/contract.ts` reads. Move
`desk.covers` off 10 and all five go quietly wrong. Three of them cannot be slot
based without rewriting sentences in three languages around a number that inflects,
and the fifth sits in a file the brief forbids touching. The cheap half measure
would be a pin in `verify-offer` naming all five, which turns silent drift into a
build failure that says where to read. Not done: it is the founder's call whether
10 is ever moving.

**The hero mixes digits and words for the same kind of quantity.** "A firm of 20"
renders as a numeral in the payback line while the dateline spells "ten" out. Both
readings are defensible; the page should pick one. House style question, not a bug.

**Nothing checks rendered order, only content order.** The audience order is now
pinned in the payload check and the two lists are held equal, but a CSS `order`
property or a `.reverse()` in a component would still make the visible order differ
from the content order with the whole suite green. Closing it means reading computed
style out of a real browser, which is a new gate, not a new check.

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

**The deployment was checked on 2026-09-20.** `campaign/a-site` was pushed to
`fcdf808` and `teams.doviloop.dev` was polled until the bundle hash changed; the
served JavaScript at `/assets/index-BpuHdR_G.js` carries the copy this commit
introduced. That is the bundle read back, not the build log trusted.

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
