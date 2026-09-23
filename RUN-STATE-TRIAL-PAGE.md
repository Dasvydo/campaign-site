# Run state: trial-page
Started: 2026-09-22
Last updated: 2026-09-22 (wave 1 launch)
Status: executing
Domain profile: software (T5, T7, T8, T11 tagged content)

## Original request
> just run this scoped waves in uh, parallel agents and uh, up the update me on the status of the
> progress that you did after you actually completed all the tasks that you have scoped yourself and
> leave me only something that you need my input

Preceding direction (spoken, captured in DAVID-RECOMMENDATION.md): ad-targeted landing page on the main
DoviLoop site, modernised layout, product-UI hero, audience named, pricing tiers immediately after the
hero, 14 days free made painfully obvious, CTA starts a free trial, call pushed only after login.
Gate answers: CTA = start a free trial · brand = minimal, NO palette change, modernity via interaction
(hover/press/focus) · ships from campaign-site.

## Mission brief
GOAL: An ad-targeted landing page, shipped from campaign-site, that opens with the real product, names
its audience (property / accounting / insurance), shows pricing tiers with the 14-day free trial made
unmissable, and drives to free-trial signup — reading like a modern software company while staying
inside the existing brand.
DONE WHEN: an ad click reaches the page without a 404; the four questions are answerable in the first
viewport; pricing tiers with the trial appear immediately after the hero; the primary CTA reaches a
working signup; the page passes its visibility, consent and analytics gates.
CONSTRAINTS: no palette/typeface change (identity PDF stands, a cool reskin was reverted once at
0fafa00); amber never carries a letterform (#8a5200 is the only amber text); "modern" is expressed
through interaction — hover, press, focus, transition — not colour; ships from campaign-site, the
doviloop monorepo is untouched; no figures hardcoded in copy; all copy lands in en/da/lt together.
OUT OF SCOPE: palette/typeface/brand change; the Dasvydo/doviloop monorepo entirely; billing, tenant
provisioning, trial state, entitlement; the three call-push mechanisms (onboarding email, in-app
booking step, chatbot); the predecessor Vercel project; deploying, pushing to main, DNS, any live change.

## Tasks
| ID | Title | Wave | Status | Attempts | Verdict | Deliverable | Owns |
|----|-------|------|--------|----------|---------|-------------|------|
| T1 | Split paper.css into section stylesheets | 1 | verified | 1 | PASS | src/styles/sections/** | src/styles/paper.css, src/styles/sections/** |
| T2 | Split content into per-section modules | 1 | verified | 1 | PASS | src/content/{en,da,lt}/** | src/content/{en,da,lt}.ts, types.ts, src/content/{en,da,lt}/** |
| T3 | Rehouse Locale + Utm out of contract.ts | 1 | verified | 1 | PASS | src/lib/types.ts | src/lib/{types,contract,attribution,analytics}.ts, src/content/index.ts |
| T4 | Build the interaction system | 1 | verified | 1 | PARTIAL -> PASS (fix applied) | src/styles/interaction.css | src/styles/interaction.css, src/styles/index.css |
| T5 | Extract trial copy before deletion | 2 | verified | 2 | PARTIAL -> PASS (retry) | src/content/*/trial.ts | src/content/*/trial.ts |
| T6 | Delete the dead funnel | 2 | verified | 1 | PARTIAL -> PASS (coverage restored) | removals | +Price.tsx, LocalePage.tsx, content price/numbers/form/results, sections css (SCOPE AMENDED) |
| T7 | Rebuild the hero | 3 | verified | 1 | PASS | Hero.tsx | Hero.tsx, sections/hero.css, content/*/hero.ts |
| T8 | Pricing tiers section | 3 | verified | 1 | PASS | Tiers.tsx | Tiers.tsx, sections/tiers.css, content/*/tiers.ts |
| T9 | Wire trial CTA + analytics | 3 | held | 0 | | CTA wiring | Hero/Tiers CTA blocks, src/lib/env.ts |
| T10 | Rewrite analytics event union | 4 | running | 0 | | analytics.ts | src/lib/analytics.ts |
| T11 | Teams-of-10+ secondary path | 3 | verified | 1 | PASS | Enterprise.tsx | Enterprise.tsx, sections/enterprise.css, content/*/enterprise.ts |
| T12 | Mobile + accessibility pass | 4 | running | 0 | | a11y fixes | sections/** (a11y only), Consent.tsx |
| T13 | Update verification gates | 4 | pending | 0 | | scripts/** | scripts/**, package.json scripts |

## Contracts
| ID | Producer | Consumers | Interface | Honored |
|----|----------|-----------|-----------|---------|
| C1 | T1 | T6,T7,T8,T11,T12 | Section stylesheets at src/styles/sections/<section>.css, imported by paper.css in current cascade order. Only T1 edits the index. | |
| C2 | T2 | T5,T6,T7,T8,T11 | Per-locale section modules at src/content/<locale>/<section>.ts, each exporting its slice as a named export. Content interface shape unchanged. | YES |
| C3 | T3 | T2,T6,T10 | Locale and Utm exported from src/lib/types.ts ONLY. contract.ts imports them as any other consumer. | YES |
| C4 | T4 | T7,T8,T11,T12 | One interaction vocabulary: --ix-lift, --ix-press, --ix-ring, --ix-curve (+10 supporting --ix-* listed in the file header). No component declares its own hover shadow or transition curve. Wrap dark-band blocks in class="on-dark" to flip all six dark-ground values at once. | YES |
| C5 | T5 | T8 | Trial copy exports { whenTitle, stops, termsLabel, terms, included, ctaNote } from src/content/<locale>/trial.ts. T8 renders it, does not rewrite it. AMENDED from { stops, terms, included }: the three extra keys are the heading, the disclosure label and the CTA note, each with an exact counterpart in the price block being rescued. Without them T8 would have to write English and break C5 in spirit. | YES (amended) |

## Hard stops
| ID | Category | Status | Resolved by |
|----|----------|--------|-------------|
| HS1 | External write / only conversion path — where "Start free trial" points | OPEN — T9 held | Founder confirms live app signup URL |
| HS2 | Deploy / push / DNS | Standing — never on my initiative | Founder |
| HS3 | Copy promises a billing behaviour nobody has decided — "No card, and nothing taken." | OPEN — blocks T8/T9 rendering it | Founder confirms whether self-serve signup takes a card |

### HS3 — "No card, and nothing taken." (raised by T5's verifier)
`trial.terms[1]` reads **"No card, and nothing taken." / "Payment details come later, and only if you keep it."**
Under the old funnel this was simply true: a salesperson took details after a yes. Carried into self-serve it
becomes an unverified promise about a signup flow that does not exist yet, and billing is explicitly out of
scope for this run. Most 14-day self-serve trials DO take a card.

**This is coupled to HS1.** Whichever signup "Start free trial" points at decides whether this sentence is
true. If the live app's signup takes a card, the page lies on its most trust-bearing line — on a page whose
entire asset is candour. T9 must not wire a signup that takes a card under a page that says it will not.

### T5 flagged copy — recorded here rather than left in a commit body
| Line | Concern | Status |
|------|---------|--------|
| `terms[0]` "The setup is included." / "It is not billed afterwards." | Contradicts `stops[0].note` "You set it up yourself" on the same screen — included by whom? Also promises unconditionally what `src/lib/offer.ts` still charges (`setupFee: 500`, waived only while founding places remain). `price.ts` carries the waiver condition and T6 deletes it. | **FIXING — T5 retry** |
| `terms[1]` "No card, and nothing taken." | See HS3 above. | **BLOCKED on founder** |
| `terms[3]` "No year to sign, and no notice period." | Replaced "no head count to keep up", which was an artefact of whole-firm flat pricing and would be false per-seat. Sound reasoning, tighter line — but a contractual promise nobody confirmed. | **Needs founder confirmation** |
| `stops[2].day` 'Stop' + ' sooner' | Verifier verdict: acceptable, keep. "Stop any time" would be marginally stronger but collides with the note beneath it. | Keep |
| `included.items[0]` "a place to add whatever it misses" | Surface confirmed real in the product repo (14-pillar coach + a queue that routes users to it). Wording is honest but inert where the original named a person. | Keep; T8 may improve |

### Owed to T8 by this task
- **The trial length figure does not exist anywhere.** `grep -ri trial src/lib/` finds nothing; `offer.ts` has no
  trial length. `figure: 'start'` and `figure: 'end'` resolve to nothing until T8 adds it. The 14-day assumption
  is recorded below and is the founder's choice, not a recovered value.
- **Renderer shape:** `before + (figure === 'none' ? '' : n) + after`. Note `Price.tsx:415` uses `key={s.day}`
  with `day` a string; a trial renderer needs `key={s.day.before + s.day.after}` or the index.
- **Editorial, non-blocking:** the block's frame is money rather than value — six of seven uses of "invoic*" are
  about billing, and only `stops[0]` says what the reader gets, under a heading that promises "What happens, and
  when". Also "invoiced" is inherited sales vocabulary; self-serve normally says "charged". Both are conscious
  choices to make, not defects.

### Deferred, recorded so it is a decision rather than a coincidence
`figure` is a machine key living in the locale copy tree. It escapes `audit-locales.mjs`'s untranslated-string
check only because the generic option-value rule `/^[a-z0-9_]+$/` happens to swallow 'start'/'end'/'none'. That
file's own comment about `isAudienceId` says this exact coincidence is unacceptable. T13 should add an explicit
`isFigureKind` exemption.

## Assumptions made unattended
| When | Task | Decision | Alternative not taken |
|------|------|----------|----------------------|
| scope | all | Keep en/da/lt; all copy lands in three locales | Ship English-only first |
| scope | T8 | Trial = 14 days | 7 (history) — unrecoverable from code |
| scope | T8 | Tiers mirror live site $29/$59/$89 | Await confirmed figures |
| scope | T7 | Demo survives, restyled via C4 | Full visual rebuild |

## Verification log
| Task | Attempt | Verdict | Gaps | Action |
|------|---------|---------|------|--------|
| T3 | 1 | PARTIAL | Two files outside T3's declared boundary still imported Locale/Utm from contract: src/LocalePage.tsx:3 and src/components/Qualifier.tsx:3-12. Tree was red (tsc exit 2, 4 errors). Agent correctly stopped at its boundary rather than reaching outside it — the scoping error was mine, T3's `owns` list should have included both. | Orchestrator applied the two import fixes between waves (neither file was owned by a live agent). Verified: `tsc -b --noEmit` exit 0, multiline-aware scan finds zero residual Locale/Utm imports from contract, zero emitted .js. Independent verifier launched. |

### Carried forward to T6 — contract.ts is NOT freely deletable (EXHAUSTIVE)
T3 made only the `Locale`/`Utm` half safe. Six things still tie `contract.ts` to code that survives the
funnel deletion. T6 must resolve every one BEFORE deleting the file, or the page stops building:

| # | Site | Symbols | Kind | Survives T6? |
|---|------|---------|------|--------------|
| 1 | `src/lib/attribution.ts:9` | `Market`, `Source` | type-only | YES — rehouse to `src/lib/types.ts` |
| 2 | `src/lib/analytics.ts:11` | `Market` | type-only | YES — rehouse to `src/lib/types.ts` |
| 3 | `src/LocalePage.tsx:3` | `QualifierPayload` | type-only | YES (the page itself) — dies with the form's props |
| 4 | `src/lib/lead.ts:22` | `QualifierPayload` | type-only | YES — `lead.ts` is NOT in T6's removal list; retype to whatever the 10+ enquiry form sends |
| 5 | `scripts/harness-page.tsx:29` | `TEAM_SIZES`, `route` | **VALUE import** | **HARD BREAK** — esbuild cannot erase a value import, so `verify:payload` fails to bundle the moment contract.ts goes. Sharpest of the six. |
| 6 | `scripts/harness-recovery.ts:8` | `QualifierPayload` | type-only | erased by esbuild, harmless |

Already fixed by the orchestrator between waves: `scripts/harness.tsx:15`, `harness-page.tsx:30` and
`harness-claim.tsx:26` imported `Locale` from contract and were latently broken — `scripts/` is in no
tsconfig project (`tsconfig.app.json` includes only `src`), so typecheck never looked at them, and esbuild
erased the type import, so every gate stayed green over a real error. All three now point at `src/lib/types`.

### Gate regressions caused by the T2 content split, fixed between waves
Splitting the copy out of `src/content/<loc>.ts` broke four source-text gates that grepped those files.
Two of them went VACUOUS — still exit 0, checking nothing — which is the dangerous kind:

| Gate | Was | Fix |
|------|-----|-----|
| `verify:payload` lt formal register | RED (exit 1) | reads assembled source via `scripts/content-src.mjs` |
| `verify:posthog` EU_CLAIMS | vacuous — "no locale claims EU hosting" | repointed at `src/content/<loc>/consent.ts`, a stricter check than the whole-file match |
| `audit:locales` + `verify:payload` em-dash / placeholder | vacuous — scanned files with no copy | assembled source via `content-src.mjs` |
| `npm run og` | threw | reads `src/content/<locale>/hero.ts` |

New `scripts/content-src.mjs` assembles a locale's full source (composing file + every section module) so
adding a section cannot silently narrow what the gates see. Each fix was negative-tested: an em dash
injected into a section module turns `audit:locales` red, and removing the Lithuanian formal register turns
`verify:payload` red. Both were green against the same mutations before the fix.

### Carried forward to T12 (raised by T4)
- **42 unguarded `:hover` rules in `sections/**`** — a tap leaves them lit. Ranked by harm, not count:
  1. `sections/price.css:328` `.price-pkg:hover{border-color:var(--amber)}` — WORST. On touch the last-tapped
     pricing tier keeps an amber border, so the comparison table shows a tier as chosen that nobody chose.
     Directly in the way of T8's pricing work.
  2. `sections/qualifier.css:327` `.qualifier-chip:hover` — a hovered chip looks checked, on the most-tapped mobile control.
  3. `sections/hero.css:109`, `:591`, `sections/demo.css:112` — tab strips showing two tabs lit.
  4. `sections/hero.css:302` `.hero-btn:hover` — the button the ad click aims at, stays raised after the tap.
  5. `sections/price.css:553`, `sections/qualifier.css:386`, `sections/consent.css:113` — same, on the conversion path.
- **6 reduced-motion rules cancel the press outright** across 5 files (T4 said 5 sites; its verifier found a
  sixth): `phone-hero.css:62`, **`phone-hero.css:63-64`** (`.hero-deal:active .hero-sheet-face`, same shape as the
  demo case), `price.css:588`, `qualifier.css:598`, `footer.css:292`, `demo.css:550`. Fix is to drop the `:active`
  selector and keep `:hover`. T12 must fix SIX sites, not five.
- **`.field`/`.field-label`/`.field-hint`/`.field-error` are unused scaffolding** — clearly meant for the signup
  form. `.field` re-points its ring to `--ix-ring-dark` because it assumes a charcoal ground; if the form lands
  on cream instead, that re-point is wrong.
- Tokens not provided, to add with an `--ix-` name if needed: a disabled-state token, a pending/loading state for
  the signup button, and a `--ix-lift` variant tuned for a large surface (the current one is tuned for controls).

### Carried forward to T13 (raised by T2's verifier)
**`verify:posthog` can be disarmed by a copy edit, and this predates the run.** The gate compares the consent
copy's EU-hosting promise against the configured ingest host. If that sentence were deleted from all three
consent modules it takes the `!claimsEu.length` branch and passes *even against a US host* (confirmed: exit 0).
That branch is unchanged from 18cbaeb, so it is pre-existing design rather than a regression — but it means the
one gate standing between a copy edit and silently shipping EU visitors' analytics to a US host can be switched
off by deleting a sentence. Worth closing before any ad spend starts.
Recommendation for T13: make the EU claim mandatory rather than optional — if no locale claims EU hosting, fail
rather than pass, or require an explicit opt-out constant so disarming it is a deliberate, reviewable act.

### Also carried forward to T12 (raised by T4's verifier, measured in-browser)
- **Focus rings still failing after the global fix** — the global ring change does not reach section rules:
  `consent-sum`, `consent-priv`, `consent-btn` (consent.css) and `numbers-range` (numbers.css) still ring
  `#f59b0a` at **2.10:1**; `price-signature-link` rings `#8a5200` on charcoal at **2.75:1**. Of 19 focusable
  controls on light ground, 16 already ring the passing `#8a5200`; these are the stragglers.
- **`.on-dark` is applied in zero .tsx files**, so every dark-ground token flip is currently dead code. A `.btn`
  dropped on a charcoal band today rings at 2.46:1. T7/T8/T11 must wrap dark bands in `class="on-dark"`.

### SCOPE AMENDMENT — T6 (orchestrator, before launch)
`Price.tsx` was not in T6's declared `owns`, but T6 strips the whole-firm model out of `src/lib/offer.ts`, from
which `Price.tsx` imports eleven named symbols. Deleting one without the other cannot build, so the two cannot
be separated and the granularity rule says merge rather than split. T6's boundary is widened to the whole dead
funnel: `Price.tsx`, its content modules, its section stylesheet, and its removal from `LocalePage`.
The replacement pricing section is still T8's to build; T6 only removes.

### "Nothing to install" — product claim confirmed
Checked in the product repository rather than assumed: mailbox connection is an OAuth consent against a
Microsoft app registration (`apps/api/src/handlers/startMailboxConnect.ts`), and there is no add-in, no
`manifest.xml` and no `office.js` anywhere in `apps/` or `packages/`. Nothing is installed on a user's machine.

### Carried forward to T7 (raised by T6's verifier) — USER-FACING, not a doc nit
**`index.html`'s no-JS fallback still sells the deleted funnel.** Lines 63-95 tell a visitor with scripting off
"This page needs JavaScript to run the fit check" and "For teams of 10 or more". Neither is true any more: there
is no fit check, and the offer is per-seat self-serve. This is the one surface a search engine reads without
script, and `verify:visible` green-lights it because it only asserts the block is >200 chars, mentions
JavaScript, and carries a mailto. T7 owns the hero message, so it should write this block to match — and the
gate should then assert something about its CONTENT, not just its length.

### Carried forward to T8 (raised by T6's verifier)
- **`Disclosure.tsx` is orphaned but deliberately kept.** Its only importers were the deleted Price and Numbers.
  `trial.termsLabel` ("Show the terms") and `trial.included.title` are exactly the two disclosures it renders,
  and `sections/disclosure.css` still ships. Use it; do not rewrite it. It tree-shakes out until something does.
- **`src/content/types.ts` trial doc comment is stale** — still says "price still renders, and still owns its own
  copy, until the whole firm model is taken off the page." The price section is gone. One-line fix.
- **`offer.ts` now exports only formatters.** No `OFFER`, no `PackageId`, no `packages()`, no validator, and the
  `prebuild` hook that guarded the old one has been removed. The new pricing data module starts from an empty
  file and will want its own guard re-added.
- `booking_click` still fires from the hero on a press that navigates nowhere, so PostHog records intent that
  produced no movement for as long as the interim lasts. T9 renames the event when it repoints the CTA.

### Known-broken, left deliberately
`scripts/verify-browser.py` (520 lines, manual, not in `package.json`, not in CI) drives the deleted form in
three of its sections and now **fails loudly** rather than passing green, which is the safe direction. Its other
sections — layout at 360/768/1280, the 16px input rule, pixel call ordering, UTM persistence across a History
navigation — still have live subjects and are worth recovering. Needs a decision, not a silent deletion.

### Deferred from T11's verifier — RESOLVED (two applied, one declined)
T10 and T12 have landed, so these were no longer held. Outcome of each:
1. **`Enterprise.tsx` accepts fractional and exponent head counts.** The form is `noValidate` and the guard is
   `Number(fields.people) > 0`, so `min={1}` and `step={1}` are decorative. Proven by the verifier: typing `3.7`
   delivers `people: 3.7` to the webhook and `1e5` delivers `people: 100000`. Fix is one line, no new copy —
   `const n = Number(fields.people); if (!Number.isInteger(n) || n < 1) found.people = f.errorSize;` — and
   `errorSize` already reads "Even a rough count helps us answer." in all three locales.
2. **Stale rationale in two headers.** `Enterprise.tsx:16` and `enterprise.css:9,239` justify the section by
   saying it "carries no espresso pill on the cream ground" and contrasts with "the espresso pill four sections
   up". That page does not exist: `.on-dark .btn-primary` renders the Tiers CTA warmwhite-on-charcoal, the same
   treatment as this submit. The differentiation is real (ground, placement, label, no anchors) but it is not the
   differentiation the comments claim, and comments this load-bearing are how the next reader gets misled.
3. **DECLINED, having looked at it properly.** The item was that `.field-hint` for the email carries
   `role="status"` from first paint, so static hint text sits in a live region; T12's audit independently
   flagged the same line, adding that it "will be re-announced whenever React re-renders it".

   That stated mechanism does not hold. React writes `nodeValue` only when the string differs, so a re-render
   that leaves the hint unchanged is not a DOM mutation and nothing is announced. (Reasoned from React's DOM
   reconciliation, not measured — if someone wants it measured, a MutationObserver on that node across a
   keystroke settles it.) Live regions also do not announce their initial content, so the text sitting there
   at first paint costs nothing either.

   What IS real is smaller and cuts both ways: the one node is both the `aria-describedby` target and the live
   region, so the warning is read on focus and again as an announcement, and when the warning clears the
   neutral hint is announced as though it were news. The recommended fix — a visible `<p>` as the description
   plus a hidden polite region that starts empty — removes the double purpose but puts the warning text in the
   accessibility tree twice, which a reader browsing linearly then meets twice.

   Neither shape is plainly better, and the current one announces the thing that actually matters. The comment
   above it also records a deliberate choice ("the field keeps one description rather than growing a second
   one"), so swapping the text rather than adding a line is the author's intent, not an oversight. Left as is.

Applied and proven (commit below): the guard blocks `3.7`, `1e5` and `0` in a real browser with the error
shown and zero POSTs, while `12` still delivers `people: 12` and the result screen. The two comment
corrections were checked against the rendered page first: `#price` is `tiers on-dark` and `.ent-panel` is
`on-dark`, so `.on-dark .btn-primary` gives both buttons warmwhite-on-charcoal; the espresso pill on cream is
`.hero-btn` (`background: var(--ink)`), at the top of the page, not four sections up.

### Carried forward to T13 (raised by T10, confirmed by the orchestrator's own grep)
T10 renamed the price event. `pricing_view` is no longer declared anywhere in `src/`, which leaves three
references in `scripts/` describing a vocabulary that has gone. None of them fails a gate today; all three
mislead the next reader, and one of them is a test firing a name that does not exist.

1. **`scripts/verify-payload.mjs:496` — `const NOT_RAISED_YET = ['pricing_view'];`** is now inert. Nothing
   declares that name, so the loop never visits the entry. It should become `[]`. The prose that explains the
   mechanism at **:470 and :480** names `pricing_view` as the worked example and has to move with it, or the
   comment will describe a list that is empty and an exemption that is gone.
2. **`scripts/harness-consent.tsx:107` — `track('pricing_view')`** is the test event the consent harness fires.
   `scripts/` is outside the typecheck program and esbuild does not typecheck, so this compiles and
   `verify:consent` still passes — it asserts the network/storage footprint, never the name. It is nonetheless
   the one place that exercises the declined path, and it is naming an event the page cannot raise. Should
   become `track('price_seen')`.
3. **`scripts/verify-posthog.mjs:9-10` — LEAVE ALONE.** It lists `pricing_view`, `booking_click` and five
   fit-check events. That list is an account of what was silently dropped on 2026-09-22 by the US/EU key
   mismatch, and the file says so directly two paragraphs later. It is history and it is accurate as history.
   The same is true of the `booking_click` references in `analytics.ts`, `LocalePage.tsx:151` and
   `Tiers.tsx:355`: each explains why the old name went. Find-and-replace across this repository has already
   destroyed one historical note in this run. Do not do it again.

### For the founder — Lithuanian, confirmed by two independent reviews
`Veikia mūsų serveriuose arba įdiegiame Jūsų.` was recovered from the old hero byte-for-byte (50/64/49 bytes,
code-point identical in all three locales), exactly as instructed. The **string itself** is elliptical:
`įdiegiame Jūsų` ends on a genitive modifier with no noun to modify; idiomatic Lithuanian wants
`…įdiegiame Jūsų serveriuose` or `…pas Jus`. It passed as clipped shorthand in the hero. It now sits under
"KUR JI VEIKIA" in the one block a security reviewer opens, where "our servers or yours" has to be unambiguous.
Needs a native speaker, not an agent.

## Coherence audit
<pending — phase 6>
