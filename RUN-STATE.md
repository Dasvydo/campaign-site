# Run state: flat-fee pricing and the landing page pass (campaign-site)

Started: 2026-09-16
Last updated: 2026-09-20 (waves 1-5 verified; wave 6 verified, T22 superseded, T23 landed;
              wave 7 verified by four independent agents, which refuted two claims outright
              and found five things asserted by nothing; wave 8 verified by three more, which
              returned PARTIAL, PARTIAL and REFUTED, all fixed; three findings left to the
              founder, recorded below; T22 and now T21 closed as superseded; waves 6
              and 9 both independently verified on 2026-09-20, which refuted T21 and
              T18's own row, found three guards that could not fail and two pages that
              got a fully green workflow while broken, all fixed; 1 blocked)
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

Statuses: `verified` means somebody other than the author checked it. `landed` means it
shipped and nobody independent has. `blocked` means it cannot proceed here. `superseded`
means the thing it built no longer exists, so it is closed and counts in neither bar.

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
| T16 | Wire the formatters, add the same-email line | 6 | verified | 2 | **PARTIAL → fixed.** A second verifier drove the form to the confirmation screen in all three locales and read the line; the formatters are genuinely locale aware in both separator and decimal mark (5,000 / 5.000 / 5 000). Two defects. **The evidence recorded for the 2026-09-19 pass was worthless**: the three figures it cited are hand-typed inside the demo letter and never touch a formatter, so it would have read identically with them deleted. And the grouping was asserted by nothing: setting `useGrouping: false` left the whole suite green while every locale printed 5000, because the page harness builds its expectations with the formatters it is checking. Nine hand-written strings now pin it in the prebuild, and the break fails six of them | the line, and grouping that is actually checked | `src/content/*.ts`, `scripts/verify-offer.mjs` |
| T17 | Hero: lead with the outcome, put the draft in the hero | 6 | verified | 2 | **PARTIAL → the guard fixed, the copy is the founder's call.** The draft card renders and the headline still ends on the outcome, read in all three locales. But **nothing asserted the card**: a verifier replaced it with `{null}` and got a clean build, a green suite and both browser gates green, because the only thing resembling a guard compared one content string to another and never read the DOM. Asserted now, and deleting the card fails all three locales. Separately, wave 9 deleted the deck, the dateline and the CTA note at the founder's request, which removes the sub-headline half of the pattern T17 was built around. That is recorded, not undone | the card, asserted | `src/components/Hero.tsx`, `scripts/harness-page.tsx`, `scripts/verify-payload.mjs` |
| T18 | Ask the questions across two screens | 6 | verified | 2 | **The row title said six. It asks five**, and has since T23 dropped the phone field. A verifier counted in a real browser, both steps, all three locales: three radio groups on step one, two text fields on step two. The page itself is correct everywhere, including the sticky bar, the step indicator and the meta description, and the count is guarded: a sixth field fails `verify:payload` in all three locales. The ledger was the thing that was wrong, and four stale comments in the source said six as well. Both corrected | five questions, two screens | `src/components/Qualifier.tsx`, `src/content/types.ts` |
| T19 | Cut the payback row | 6 | verified | 2 | **PARTIAL → fixed.** The row is gone and no equivalent is on the page. But the guard that kept it gone had dissolved: `numbers.beats` became a named record, so there was no length left to pin and nothing counted the rendered rows. A verifier added a payback row straight into the component, **in untranslated English on two locales**, and the suite reported 0 failures. The exact set of ledger rows is asserted in order now, and that break fails all three locales | four rows, pinned in order | `scripts/harness-page.tsx`, `scripts/verify-payload.mjs` |
| T20 | Stop the founding lede claiming we have no customers | 6 | verified | 2 | **CONFIRMED both directions, one adjacent bug fixed.** A verifier built four offer states and watched the claim leave and return; holds move neither gate, so the claim and the counter cannot contradict each other. But at five holds and zero pilots the page dropped into the closed branch and said "the monthly fee below is the same one they paid", asserting five firms had paid at a configuration where nobody had started. The sentence no longer claims anyone paid | a gate that holds, and copy that does not overreach | `src/lib/offer.ts`, `src/content/*.ts` |
| T21 | Stop calling Individual the other plan on the product site | 6 | superseded | 2 | **REFUTED, and the old verified mark was false.** T21 edited one key, `compare.individualNote`; that key was removed at `c70b27f`, an unscoped commit that predates the 2026-09-19 verification. The fallback a reader could have met instead, `who.notes.seats`, was deleted in wave 9 at the founder's request. A verifier force-opened every disclosure and found `doviloop.dev` in exactly two places, both in the footer. The negative half holds vacuously: the word Individual is nowhere in the content or on the page. Closed, not verified, because the artefact no longer exists. **The signpost for firms under ten now survives only on the too-small result screen**, which is the founder's call and is recorded below | nothing on the page | `src/content/*.ts` |
| T22 | Put Managed in the table, name plans as the source names them | 6 | superseded | 1 | **CLOSED, not owed.** It landed at `8db3734` and the table it built was removed at `ac8cb83`, so there is nothing on the page left to verify: it can never go green by being checked, only by a decision, and the founder took that decision on 2026-09-20. `superseded` is a terminal status and sits outside both bars, rather than reading as work somebody still owes. `Compare.tsx` is gone. `OFFER.compare` and its six rate helpers stay: confirmed reachable from no component, but they are the record of what doviloop.dev publishes, the prebuild guard keeps them honest, and they cost nothing at runtime. Deleting them would have meant editing the single source of truth for prices to remove the only written record of the rates this offer is positioned against | five-row comparison, since removed | `src/lib/offer.ts` |
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
| T33 | Make the section demonstrate itself | 7 | verified | 2 | **REFUTED → fixed.** The mechanism ran, but the central safety claim was false on the likeliest path: standing down cancelled the restoring step, so interrupting between the two steps left a letter missing a clause nobody removed, a switch off nobody touched, and Send under a worse draft than the product makes. The gesture that broke it is the gesture the movement provokes. It also fired on the switch strip alone, so on phone and tablet it played and restored entirely below the fold and spent its one run doing so, and on every desktop width the slip driving the change was 0 to 21% on screen. Restoring is now scheduled from inside the removing step and cannot be cancelled; both halves must be on screen together or it declines to run; the run is given back, not spent, if the reader scrolls off. Reduced motion is rechecked at the moment it would move, not only at mount. The property desk told screen readers "Two figures" for a clause carrying three: corrected in all three locales. **The gate passed identically on the broken build and the fixed one** and is rewritten: its stand-down check clicked a switch, which stands down through the toggle handler and never reaches the section listeners, so deleting the listener mechanism passed, as did firing twice, re-arming on a desk change, and speaking into the live region. Sixteen checks now, each proved by breaking what it watches | the performed demonstration, and a gate that catches its removal | `src/components/Demo.tsx`, `scripts/verify-demo.mjs`, `src/content/*.ts`, `package.json` |
| T32 | Put the one person the founding trade is about on the page | 7 | verified | 2 | **CONFIRMED on the exemption, REFUTED on placement.** The audit exemption is exactly the name and nothing else, proved by mutation in both directions. But the signature sat inside a disclosure that is closed at rest, so no reader saw the name without clicking, defeating the point of adding it. Moved onto the open band. Lithuanian register and "paleidimo/idiegimo" also fixed | signed line, on the open band | `src/components/Price.tsx`, `src/content/*.ts`, `scripts/audit-locales.mjs` |

| T36 | Run every guard on every push | 9 | verified | 3 | **PARTIAL → REFUTED → fixed.** Every mechanism works, but a verifier broke the reader's page sixteen ways with a fully green workflow. `verify-visible` asked four questions of the FIRST match of each selector: display, visibility, opacity exactly zero, and a box bigger than a pixel. So a headline in transparent ink, a calculator at x −11838, the price band at 2%, the second package card gone, the accuracy bullets hidden, an opaque sheet over three sections, and the answer at font-size zero were all invisible and all green. It now checks every match, and adds colour against the painted background behind it, position in the viewport, clip-path, readable type size, and what `elementFromPoint` says is on top, no longer excusing an ancestor, which was exactly how the `::after` sheet got through. **Thirteen of the verifier's breaks were re-run against it and every one now fails.** Four more parts added, including the signpost and the form, which had been checked by its heading block rather than itself | CI, and a gate that looks at the page a reader gets | `.github/workflows/verify.yml`, `scripts/verify-visible.mjs` |
| T37 | Cut the seven pieces the founder did not want | 9 | verified | 2 | **CONFIRMED.** A verifier diffed the orphan analysis against the pre-wave-9 tree: 52 orphaned CSS classes before, the same 52 after, so the deletions created none and left none of their own. Stylesheet brace-balanced at depth 0, no empty rules, no empty media blocks, no locale broken, `oneEmailIn` live again. ~46 pre-existing dead selectors and 7 dead content keys were found in passing and are recorded below | 268 lines removed, 82 added | `src/content/*.ts`, `src/components/*.tsx`, `src/styles/paper.css` |
| T38 | Fix the two lines that misled | 9 | verified | 2 | **CONFIRMED on the count, PARTIAL on the translations → fixed.** A verifier counted in a real browser: three then two, in all three locales, and nothing reader-facing claims otherwise. But **both translations had lost the deadline**. English says "By 08:41"; Danish said `Klokken 08:41`, which is a timestamp, and Lithuanian dropped the preposition entirely. The headline's whole claim is that the work is finished before a time, and two of three languages were saying what time it was. Now `Inden klokken` and `Iki` | one honest line, in three languages | `src/content/*.ts` |
| T39 | Show the three things that were built but not visible | 9 | verified | 2 | **CONFIRMED.** Measured at five widths in three locales. `price-gives-h` is `display:block`, opaque, unclipped, and its `aria-labelledby` still resolves to the four-item list. The beat headings are weight 600 with a 30x2px amber rule and collide with nothing. The close line runs 1 to 3 lines from 1440 down to 360 with `scrollWidth === clientWidth` everywhere: no overflow, no orphaned word | a visible heading, inked beats, one line | `src/components/Price.tsx`, `src/styles/paper.css` |
| T40 | Print the drafts in the calculator | 9 | superseded | 2 | **CONFIRMED by a verifier, then replaced by T43 at the founder's instruction.** It was genuinely derived: the row tracked `people x inbound x draftRate` across seven slider positions, followed a mutated rate to 270, and could not exceed either pooled cap. The founder then asked for the input itself to be drafts, which removes the row entirely. Closed rather than left reading as work owed | a derived drafts row, since replaced | `src/components/Numbers.tsx` |
| T41 | Make the favicon the mark | 9 | verified | 2 | **CONFIRMED.** The path data is byte-identical to the `Mark` component read out of the live DOM, gradient stops and all, and `dist/favicon.svg` matches `public/`. Legible at 32px and still reads as the mark at 16 | one mark, everywhere | `public/favicon.svg` |
| T42 | Move the measured share somewhere quieter, and guard it | 9 | verified | 2 | **PARTIAL → fixed.** Both guards fire exactly as claimed, proved again by an independent verifier. Three findings. **The placement this row described was not the placement on the page**: the accuracy list is a two column grid flowing 1 3 / 2 4, so the note landed under "There is no automatic send anywhere in this product" at 1440 and 1280, where a measurement of how much mail gets a draft reads as a measurement of sends. It is nested inside the first item now, so it is adjacent at every width. **The pin's stated reason was invented**: it claimed Lithuanian's case after "is" was written for seven; "is" takes the genitive for every numeral and the count renders as a digit, so nothing inflects. The comment now says what the pin actually does. Still true and recorded: the line can be rewritten to say something false and no check can see it | the figure, adjacent to its claim | `src/components/WhoFor.tsx`, `src/styles/paper.css`, `scripts/verify-offer.mjs` |
| T43 | Ask the calculator for drafts, not for inbound mail | 9 | landed | 1 | The founder's call: the thing he sells is drafts, so the panel is denominated in it. The control asks for drafts directly, head count no longer enters the sum at all (it picks the package and so the fee), and the measured share becomes a hint under the control for anyone who knows their inbox and not their draft count. **The rebuild shipped with nothing pinning it and I found that myself**: `hoursFromDrafts` was changed to ignore its own argument and the entire suite reported 0 failures, because the page harness asks the helpers what to expect. Four hand-computed chains now pin it, plus a check that twice the drafts is twice the hours, and that mutation fails ten of them. No independent pass | a panel that asks what it sells | `src/lib/value.ts`, `src/components/Numbers.tsx`, `src/content/*.ts`, `scripts/verify-offer.mjs`, `scripts/harness-page.tsx` |
| T44 | Send a firm too small for either card somewhere | 9 | landed | 1 | The wave 6 verifier found that T21's signpost to doviloop.dev had gone, first at `c70b27f` and then with the block the founder cut in wave 9, leaving the routing behind the form: a firm that reads the price and leaves never meets it. One sentence under the package cards now, paired with the one for firms too big, with a real amber link to the product site. Asserted three ways and proved by deleting it: both halves must appear on the page in every locale, and the link must be pressable and point at the product site. Removing it fails six checks. No independent pass | the half of the pair nobody was answering | `src/content/*.ts`, `src/components/Price.tsx`, `src/styles/paper.css`, `scripts/harness-page.tsx`, `scripts/verify-payload.mjs` |
| T45 | Stop the next letter carrying the last one's edits | 9 | verified | 2 | **PARTIAL → fixed.** The founder found this on "next letter"; a verifier then found the same bug alive on three paths the fix did not reach, and **two of them left the draft empty**: a source toggled after an edit, "Put it all back" after an edit, and one Backspace over the whole body, after which the control whose entire job is to put it back could not, while the live region announced the draft was whole again. Same cause every time: `contentEditable` means the browser owns those nodes and a switch that recomputes clause state cannot reach them. Any path that re-derives the draft now rebuilds it when the reader has typed. Four more checks, one per path, and all four fail on the unfixed build naming how many characters were left | a draft that always comes back | `src/components/Demo.tsx`, `scripts/verify-demo.mjs` |
| T46 | Draw the founder's actual logo | 9 | verified | 3 | **Shape CONFIRMED, check REFUTED → fixed.** A verifier found the founder's real file committed at `design/doviloop-icon.png` and pixel-diffed the shipped mark against it independently: 0.57% differing, against 4.88% for the shape it replaced, so both figures in this row are honest and the redraw is right. **The check was not.** It asked only that each path start with M, be over twenty characters, and that two be distinct; all three attack cases walked through it green, including a placeholder of two 29-character specks that rendered the hero as a wordmark with no mark at all. It compares against `MARK_BOWL` and `MARK_STEM` now, per copy, across all four consumers: the fit check's was a fourth nobody had counted, and the footer, the copy that actually drifted, was outside the old selector | the mark, and a check that knows its shape | `src/components/Hero.tsx`, `scripts/harness-page.tsx`, `scripts/verify-payload.mjs` |
| T47 | Cut the pricing section down to one telling | 9 | landed | 1 | The founder read the section and called it redundant, unclear and too much text beside everything else in it. He was right. "A trade, not a discount" was a second, collapsed telling of the block already open above it: read side by side it repeated the price lock word for word, the setup waiver that is a chip on the band two inches up, and the count of firms the reason already names. The disclosure is gone. What was unique in it is on the open band: the admission that there are no customers yet, which had been left behind a closed disclosure even after a verifier made exactly that criticism of the founder's signature and it was moved out, and the opt out for a firm that would rather not be named. The trade sentence itself stopped restating the four bullets under it and keeps the framing the deleted disclosure's title carried. Block reads admission, framing, reason, what you give, opt out, signature, with nothing said twice. `getsTitle`, `gets` and `cohortName` went dead and were removed from the contract and all three locales rather than left translated for nobody. No independent pass | one telling, in order | `src/components/Price.tsx`, `src/content/*.ts`, `scripts/harness-page.tsx` |
| T48 | Guard the figure a phone reader actually sees | 9 | landed | 1 | The sticky pin at the top of the calculator is the only figure visible under 720px while a reader drags a control, and no check in this repository had ever looked at it. A verifier pointed it at `worth` instead of `kept` and got a pin reading "You keep: about 900 EUR" over a row reading 751, under the correct label, fully green: a 20% overstatement of the headline saving, on the viewport most ads land on. It is a duplicate of the keep row by design, so it is asserted to be exactly that, label and figure, in all three locales. The mutation fails all three | the phone figure, checked | `scripts/harness-page.tsx`, `scripts/verify-payload.mjs` |
| T49 | Make the calculator multiply for a reader with a pencil | 9 | landed | 1 | Its own docstring says every number on it can be checked with a pencil, and at the bottom of the range it could not: fifty drafts at a minute saved printed "about 1 h" beside "about 83 EUR", and a reader multiplying the two figures in front of them got 100. The exact hours and the printed hours were two different numbers and the money came from the exact one. The panel prints a tenth of an hour below ten now, and the money is derived from the figure on the screen, so the two always multiply out. Rounding costs a little accuracy at the low end and always downwards, which is the right direction for a figure we are asking somebody to trust. Checked in a browser at five slider positions: every one matches. The hand-computed pin for that case is whole numbers now, on purpose, because a repeating decimal there would mean the money had stopped coming from the printed figure | a panel that survives arithmetic | `src/lib/value.ts`, `src/components/Numbers.tsx`, `scripts/verify-offer.mjs`, `scripts/harness-page.tsx` |
| T50 | Tie the favicon to the mark the page draws | 9 | landed | 1 | They were made identical by hand and nothing held them that way: a verifier rewrote `public/favicon.svg` to a rectangle and a square and every check stayed green, because the browser gates render the page and the page does not contain its own favicon. The prebuild now reads both files and holds the icon to the two exported paths, and to nothing else. Drifting one path fails it twice. The tab icon is the mark most people see most often | one mark, including the tab | `scripts/verify-offer.mjs` |

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

**Six things about the demonstration nobody has tested.** Its verifier named them
and could not reach them from here: real screen readers, real touch hardware and
iOS Safari, back and forward cache restore, React StrictMode's double effect, the
`/da` and `/lt` sequences in isolation, and browsers without `IntersectionObserver`.
The reasoning for the screen reader case is that the sequence never writes to the
live region and never moves focus, both now asserted, so the remaining exposure is
a virtual cursor parked inside the draft when the clause swaps. Unverified is not
the same as fine.

**~~There is no CI.~~ Fixed 2026-09-20, and now T36.** `.github/workflows/verify.yml` runs all
three on every push and pull request: `npm run verify`, then a build, then the
consent layout and the performed demonstration against a real Chromium. Proved on
GitHub's runner, not asserted: run 1 failed and run 2 is green at
`e636a49`, with all 16 demonstration checks and all 90 layout checks in the log.

Two things had to change for the browser gates to run anywhere but this container.
`playwright-core` was undeclared, and Chromium was resolved by hard-coded path,
with the two gates on two different paths in the same container. That is now
`scripts/chromium.mjs`: a named `CHROMIUM_PATH` wins and a missing one is a stated
error rather than a quiet fall through to some other browser, then the container
paths if they really exist, then Playwright's own resolution, which is what CI
uses. The third branch had never been run by anything and was exercised
deliberately before shipping.

Run 1's failure is worth keeping: `vite preview` binds to `localhost`, which
resolves to ::1 first on the runner, so it listened on IPv6 while every request
went over IPv4. The step guard reported that the server never came up and failed
the run, instead of letting both gates skip in silence and reporting green. That
is the failure mode it was written for, caught on its first outing.

**Dead weight nobody owns.** An independent verifier counted ~46 CSS class
selectors in `paper.css` that style nothing (whole clusters: `price-total-*`,
`qualifier-r-*`, `numbers-lede`, `numbers-caveat` and more), 7 content keys
declared in `types.ts` and translated in all three languages that no component
renders (the entire `hero.draft` object, `nav.skipToContent`, two form
placeholders and two others), and 7 exports in `src/lib` referenced only by their
own file. All pre-existing. `audit:locales` cannot see the content ones because it
only checks the three files agree with each other. 21 translated strings are being
maintained for nobody.

**`verify-offer.mjs` pins `founding.started` and `founding.held` at 0.** The day
the first setup call is booked or the first pilot starts, `npm run build` fails
with `founding.started is the agreed 0` plus knock-on failures. That is the pin
doing its job, but it is an unwritten release step, and it is why the closed-cohort
copy path has never been exercised by anything but a verifier.

**Nothing makes the workflow a required check.** That it runs on every push is
proved. That it blocks a bad merge is not, and branch protection is not readable
from here.

**`.hero-sheet-face` is clipped at the right edge at 1280 exactly**, in en and da:
three elements sit at 1288 to 1308 against a 1280 client width. `scrollWidth`
equals `clientWidth`, so there is no scrollbar and the consent-layout gate cannot
see it. Cosmetic, at a very common laptop width.

**`price.total.zero` is a currency literal in three locale files.** `'0 EUR'` is
typed rather than derived, which the frozen brief forbids. A zero is the weakest
possible case of it, but it is the one figure on the price band that does not come
from the offer.

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
| Close T22 as superseded and keep the dead compare config | founder, 2026-09-20. The rates are the record of what the product site charges; the guard keeps them true; deleting them would edit the price source of truth to lose that record |
