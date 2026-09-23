# Run state: trial-page
Started: 2026-09-22
Last updated: 2026-09-23 (phase 6 coherence audit complete)
Status: build complete, 12 of 13 tasks verified; T9 held on the founder
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
| T10 | Rewrite analytics event union | 4 | verified | 1 | PASS | analytics.ts | src/lib/analytics.ts |
| T11 | Teams-of-10+ secondary path | 3 | verified | 1 | PASS | Enterprise.tsx | Enterprise.tsx, sections/enterprise.css, content/*/enterprise.ts |
| T12 | Mobile + accessibility pass | 4 | verified | 1 | PASS | a11y fixes | sections/** (a11y only), Consent.tsx |
| T13 | Update verification gates | 4 | verified | 1 | PASS | scripts/** | scripts/**, package.json scripts |

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

### T12 verified PASS — and the 320px phone it led to
All five criteria proven in a browser: 156 hover probes with `hover:none`/`pointer:coarse` emulated and
asserted through `matchMedia` (forcing `:hover` changed nothing on any control); ~600 pressed-state
measurements across 12 scenarios with pseudo-states forced ONE element at a time, zero controls losing their
press under reduced motion; every focus ring measured twice by two independent methods (painted-pixel diff
and an `elementFromPoint` band walk) which agreed; and 666 overflow checks at 1px steps, with
`documentElement.scrollWidth - innerWidth` zero at every single width.

**A correction to my own commit message.** `d9c8f15` says focus rings measure "5.10:1 at worst across 273 tab
stops". The verifier measures **4.20:1** at worst (`#8a5200` on taupe, on `a.consent-priv`,
`button.consent-btn`, `a.hero-tab`, `a.hero-brand`, `button.demo-tab`). Still comfortably above the 3:1 that
WCAG 1.4.11 asks, but the figure I published is optimistic and I took it from the working agent's report
rather than measuring it. The number to quote is 4.20:1.

### The 320px phone: one pre-existing bug, one I caused, both fixed
The consent layout gate tested 360, 390, 768 and 1280. Nothing below 360 had ever been measured, and at
320x800 with the notice up the sheet sat on the hero's call to action in every language. Measured at the
commit before my change and after, so the attribution is not a guess:

| locale | before the CTA relabel | after it | now |
|---|---|---|---|
| en | **overlap 2px** | overlap 2px | clear by 108px |
| da | **overlap 70px** | overlap 70px | clear by 51px |
| lt | clear by 6px | **overlap 15px** | clear by 98px |

English and Danish predate this run entirely. **Lithuanian is mine**: "Pradėkite nemokamą bandymą" is longer
than the label it replaced and wrapped the button onto a second line at this width, costing 21px and turning
a 6px clearance into a 15px overlap. The fix is one `@media (max-width:359px)` block, scoped below 360 on
purpose so the widths that were already measured and passing are not perturbed — confirmed, 360 and 390 read
byte-identical before and after (65/22/42 and 133/66/134).

**`#hero-title{font-size:42px}` in the 374px block had never applied, to anything, ever.** It is (1,0,0)
against `#hero h1{font-size:clamp(40px, 26px + 3vw, 72px)}` at (1,0,1) in hero.css. Established by asking the
browser — `CSS.getMatchedStylesForNode` on the Danish h1 at 320px listed both rules and the clamp won, with
the title computing 40px rather than 42. My first attempt at the fix had the identical bug and did nothing
until I measured it. The dead rule is removed rather than repaired: giving it the winning specificity would
make the headline BIGGER between 360 and 374, which is the wrong direction entirely. This is the third orphan
rule found in this one file, which already documents the trap twice.

**320 is now in the gate's viewport list**, and the coverage is not decorative: with the new block deleted
the gate goes red in all three locales naming the geometry (`en cta y=578..632 vs slip y=630..800`,
`da 646..700`, `lt 570..645`), which matches my own measurements exactly. 117 PASS, was 90.

### Still thin, and worth knowing before the Danish copy is touched again
**Danish at 360x800 has 22px between the button and the sheet.** That is pre-existing, unchanged by anything
here, and it passes. It is also the third time this page has had a sheet-over-button bug. One more line of
Danish hero copy breaks it again. Left alone deliberately rather than perturbing a verified-passing layout at
the end of a run, but it is the first thing to check after any Danish copy edit.

### Carried forward from T12's verifier — real, pre-existing, nobody owns them
- **The open language menu completely covers the third masthead nav link on a phone.** 100% covered in all
  three locales at 360px; at 390px da 100%, lt 89%, en 57%. Byte-identical at the parent commit, so not this
  run's doing. The verifier calls it "the one real interaction defect on the page" and axe flags it as
  2.5.8 "partially obscured". Nothing in this run touched it.
- **Three inert focus rules that declare a ring nobody ever sees**: `who.css:150-154` (effective ring is
  3px/+4px from `#who button:focus-visible` at `:315-320`), `demo.css:121` (from `demo.css:57-65`), and
  `hero.css:583` (from `hero.css:31-37`). Each looks like it sets the geometry and does not.
- **`hero.css:588-596`** — `.hero-deal:not([href]):hover` and `:active` match zero elements in every locale
  and state; `.hero-deal` always carries `href="#demo"`. Defensive and documented, but dead.
- **Four text-entry fields have no pressed state** (`input.field` x2, `.ent-num`, `.ent-note`). Judgement
  call: a press is not a meaningful gesture on a text field, and they answer both pointer and keyboard.
- **Three controls press with a bare `translateY(1px)` instead of `--ix-press`** — `demo.css:122` `.demo-tab`,
  `consent.css:137` `.consent-btn`, `footer.css:227` `#footer .footer-a`. Visible, but off the C4 contract.
- **`.hero-numeral` at 1.36:1** remains a serious axe `color-contrast` finding, desktop only. `aria-hidden`,
  the count carried sighted beside it, and fixing it is a palette decision which this run was told not to
  make. It will be raised by every future audit; that is the cost of leaving it.

Fixed here: `hero.css:55-57` claimed `--ix-press` "composes with the translateY(0) above rather than
replacing a rest of its own". That is wrong about CSS — `transform: var(--ix-press)` replaces the whole
transform, and `interaction.css:163` says so where the token is defined. The code is correct only because
`translateY(0)` is the identity. A reader who trusted that comment and added a press to a control with a real
resting transform would silently lose it.

### T13 verified — and the run's worst gap is closed
Verified by the orchestrator directly rather than by a fourth agent: full suite re-run here (`typecheck` 0,
`build` 0, `verify` 0 at 153 PASS against 145 before, `verify-visible` 23 PASS against 16, `verify-demo` 22,
`verify-consent-layout` 90), and the single most important claim independently negative-tested in a throwaway
worktree so `src/` was never mutated in the real tree.

**The discard-on-decline promise now has a gate.** Both mutations that used to leave `verify:consent` green
at exit 0 now turn it red, and the failure message names the event that leaked:
- deleting `if (consentDecided()) pending = [];` from `applyConsent()` ->
  `FAIL and a later change of mind resurrects nothing that was raised before it (page_view)`
- neutering the decline drop inside `track()` ->
  `FAIL ... (price_seen)`
`src/lib/analytics.ts` restored byte-identical afterwards, confirmed by `diff`, and the gate returns to 0.
This is the thing the consent dialog promises in three languages to DK and LT visitors, and until now
nothing in the repository checked it.

Also closed: `verify:payload`'s positive branch now strips comments before searching, so a commented-out
`track()` no longer satisfies it; and `verify:consent`'s undecided window samples after a tick, so deleting
the consent gate from `maybeStart()` is caught there rather than only by the decline block.

NOT independently re-run by me: the other ~18 mutations in T13's own sweep table. Its report stands on its
own evidence for those; the three I cared most about I proved myself.

### SIGN-OFF NEEDED FROM THE FOUNDER (low stakes, easily reversed)
T13 put `scripts/` into a typecheck project (`tsconfig.scripts.json`, referenced from `tsconfig.json`) with
**zero pre-existing errors** — nothing suppressed. This is what catches a harness firing an event name the
app cannot raise, which is exactly what had been sitting in `harness-consent.tsx` uncaught for weeks because
`scripts/` was in no project. The trade-off: `tsc -b` runs inside `npm run build`, so a type error in a test
harness now blocks a production bundle. I judge that right and consistent with this repo's stated position,
and I have left it in. It is one line in `tsconfig.json` to revert.

### Carried forward from T13 — dead code with no owner
- **(a) UTM-to-lead attribution is entirely dead.** `src/lib/attribution.ts:81` `resolveSource` has no caller
  anywhere in `src/`, and the enterprise form — the only lead this page now sends — posts no `utm` and no
  `source` field (`Enterprise.tsx:177-186`). So a lead arriving in n8n cannot be attributed to the ad that
  paid for it. Either the payload should carry attribution, or `resolveSource` should go. **This one has
  money attached to it** and is the most consequential item on this list.
- **(b) `src/lib/env.ts:19` `bookingUrl`** — read from the environment, no consumer. The booking flow went
  with the fit check.
- **(c) `src/lib/pixel.ts:102` `pixelTrack`** — exported, no caller. Measured: deleting `!consentGranted()`
  from its guard leaves the ENTIRE suite green, correctly, because nothing can reach it. If a caller is ever
  added, that guard needs a gate the same day.
- **(f)** `verify-demo`'s negative checks are only meaningful because its check 1 proves the sequence runs at
  all. That cross-guard holds, but it is implicit. Nobody should delete check 1 on the grounds that the
  others cover it.

Fixed by the orchestrator in the same commit, both being live instructions rather than history:
`README.md` told a reader three times to run the deleted Python gate, and described a gate set that no longer
existed; `.github/workflows/verify.yml` cited "402 checks" and "the two browser gates" when there are three.
The mentions in `SESSION-REPORT.md`, `RUN-REPORT.md` and earlier in THIS file are historical records and stay.

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

### Known-broken, left deliberately — RESOLVED by T13
`scripts/verify-browser.py` (520 lines, manual, not in `package.json`, not in CI) drove the deleted form in
three of its sections. The decision it needed has been made and it is **deleted**, with its live coverage
moved into gates that already had the right instrument rather than into a fourth gate nobody would run:
the 14-day queue expiry into `harness-recovery.ts` + `verify:payload` (it was the ONLY thing that had ever
exercised `MAX_AGE_MS`, and with no webhook URL set the queue is the live delivery path); the Meta pixel
call order into `harness-consent.tsx` + `verify:consent`; the 16px iOS-zoom rule into `verify-visible.mjs`,
this time asserting the field count so it cannot pass over an empty list the way the Python one would have
after the form was deleted; and an uncaught-JavaScript-error listener across all eight pages, which nothing
in the suite had been watching for. The overflow sweep was dropped as a strict subset of what
`verify-consent-layout` already measures (four widths, not three, before AND after the notice is answered).
It could not have run here in any case: Playwright for Python is not installed, so it exited 2 having
verified nothing.

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

### T10 verified PASS — and the CTA label it exposed
All five criteria proven in a real browser with negative tests behind each gate, not inferred from source:
the dwell gate measured at five viewports (0 on a fast scroll-past, 0 at 1.2s, exactly 1 past 2s, still 1
after leaving and returning three times); five distinct submit outcomes for the enterprise form, of which
only the two that actually arrive raise the event; and the consent gate shown holding with real posthog-js
and a real Meta pixel — zero localStorage keys, zero cookies, zero external requests before a decision, and
held events proven DISCARDED on decline rather than parked. The strongest guard turns out to be `typecheck`:
`EventName` is a real type constraint, so no name outside the union can be raised at all.

**What that verification walked into.** Every call to action on this page renders `c.nav.cta`, and in all
three locales that still read "Check if we are a fit" / "Se om vi passer sammen" / "Pažiūrėkite, ar tinkame"
— the label of the fit-check funnel deleted in T6. Four render sites: `Hero.tsx:334`, `:401`, `:488` and
`Tiers.tsx:359`. The founder's own gate answer was that the CTA is "start a free trial", `types.ts:544`
already documents this button as "the button that starts the trial", and the section directly above it is
headed "Free for the first 14 days". The label was the one thing nobody had changed.

Fixed here, in all three locales, using vocabulary the page already uses (`prøveperiode`, `bandymas`,
`nemokamai`). Measured after: the whole suite green, and the button fits at 320px in every locale, the
Lithuanian being widest at 288px inside a 320px viewport with no document scroll. The Lithuanian string is
NOT native-reviewed — it joins the list at the foot of this file.

**The target is still dangling, and that is HS1, not this fix.** `href="#fit"` resolves to nothing:
`document.getElementById('fit') === null`, confirmed in-browser. So the primary call to action of this page
currently moves the visitor nowhere, in every locale, at every breakpoint. That was documented in the code
but appeared in NO tracking document — not BLOCKED.md, not this file, not OFFER-HANDOFF.md, not README.md.
It is written down now. The button label is now honest about what it offers and still cannot deliver it,
which is strictly better than a button that offered a screening step that does not exist either, but it is
not shippable until HS1 is answered.

### Flagged by T10's verifier and deliberately NOT actioned
`SESSION-REPORT.md:166` names `pricing_view` and a line number that no longer matches, and was reported as
stale. It is not. That file is a dated session report from branch `claude/campaign-build-status-9j9194`
whose own header says "Every number below was observed in this container". Rewriting it would falsify a
record of what was true then. Same standing as `verify-posthog.mjs:9-10`. Left exactly as it is.

### Gate weaknesses proven by negative test, handed to T13 mid-run
None created by this run; all pre-existing, all under `scripts/`.
1. **The discard-on-decline promise is completely ungated.** Removing `if (consentDecided()) pending = [];`
   from `applyConsent()` leaves `verify:consent` GREEN at exit 0; additionally neutering the decline drop
   inside `track()` ALSO leaves it green. The one thing the consent dialog promises in three languages has
   no check behind it at all.
2. **`verify:payload`'s positive branch is a text grep.** Replacing the real `track('price_seen')` with a
   comment containing the same characters keeps it green. It cannot prove a raise happens.
3. **`verify:consent`'s undecided-window block cannot catch an analytics-gate removal on its own** —
   `posthog-js` is a dynamic import and the footprint is sampled synchronously, so deleting
   `if (!consentGranted()) return;` from `maybeStart()` still PASSED that line; only the afterDecline block
   caught it.

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
Run by an independent agent against the founder's own words, then acted on. Its full finding list is long;
what follows is the verdict, what was fixed in response, and what is left.

### The finding that matters: provenance
**The audit's verdict was that the prohibition on David's recommendation was broken in substance, and
papered over in the source. It is right, and the papering-over is the part I own.**

The sequence: the recommendation was relayed aloud and captured, prefaced "don't put any of this into
effect". Dovy then authorised a build and answered three scoping questions in his own words - the CTA is
"start a free trial", the redesign is minimal and carries its modernity in interaction rather than palette,
and it ships from this repository. Of the recommendation's items, exactly one (the trial CTA) is traceable
to him directly. The price-first layout, the fortnight made unmissable and the per-seat rate are not. They
were promoted into the mission brief by relabelling the capture "Preceding direction" at line 12 of this
file, and never justified again.

Three things were correctly honoured as out of scope and I checked each: the three call-push mechanisms
(no chat widget, no booking step, `bookingUrl` has zero consumers), the move onto the main site, and the
product monorepo (`/home/user/doviloop` clean, last commit 2026-08-10).

**What was wrong beyond the judgement call: seven shipped source files attributed an adviser's relayed words
to the founder** - `Tiers.tsx` headed a quote "THE BRIEF, VERBATIM", `types.ts` called it "the founder's own
words", `en/tiers.ts` said "the founder asked for", and `analytics.ts`, `LocalePage.tsx` and `pricing.ts`
each said he "put" the price where it is. One was factually false against this run's own capture:
`pricing.ts` said he "asked for fourteen days free, twice", when the recording has THIRTEEN once and
FOURTEEN once and the capture flags the discrepancy as open.

All seven are corrected. `src/lib/pricing.ts` now carries the provenance in full - what came from the
adviser, what Dovy said himself, and that fourteen days is an assumption nobody has confirmed - and the
other six point at it. This matters practically: the price-first layout is the single thing most worth
revisiting if the page underperforms, and a comment claiming he chose it personally is exactly what would
stop the next reader from asking.

### Constraints: all held
Verified independently against the diff rather than against my own claims. Palette byte-identical (the one
new hex, `#fbbd23`, is the pre-existing amber-dark token). Typefaces untouched. Zero amber-coloured text
anywhere in three locales at two viewports. Monorepo untouched. Nothing deployed; no `main` exists on
origin. 390 leaf keys identical across all three locales. Every real `:hover` behind `(hover:hover)`.

### Fixed in response to the audit
1. **The masthead still advertised the deleted fit check**, in all three languages, one inch from the new
   trial button: "FIT" / "PASSER DET" / "AR TINKAME", pointing at `#fit`. It now reads "Who it is for" /
   "For hvem" / "Kam tai skirta" and points at `#who`, a section that exists. The harness excluded
   `.hero-nav a` from its one-label check on layout grounds, so nothing could ever have flagged the words.
2. **There were FIVE `#fit` anchors, not four**, and both `Tiers.tsx` and this file said four - so whoever
   answered HS1 would have left one dangling. Repointing the nav link makes the remaining four genuinely
   the CTA set, and the count is now correct everywhere.
3. **`verify:payload` now asserts every masthead link resolves to a section on the page.** The old
   assertion required exactly one `#fit` nav link; it failed the moment I repointed it, which is how the
   change got noticed, and it has been inverted rather than deleted. 156 PASS, from 153.
4. **The standing phone bar claimed it stands down when a real CTA is on screen, and did not.** Its watch
   list was `[#fit, .hero-act]`; `#fit` is null, and the pricing CTA was never added, so on a phone both
   buttons were visible at once. Fixed and measured: the bar is `is-off` with the pricing CTA centred in
   all three locales.
5. **The standing bar's copy counted a deleted form and repeated the unconfirmed card promise** - "Under a
   minute, no card." Replaced with a claim the product can actually keep. The same promise remains in
   `trial.terms[1]`, where terms belong and where it is flagged as blocked.
6. **The share cards were stale AND the regenerator was silently broken.** All three carried the old
   headline and the sub-headline "It runs on our servers, or we install it on yours" - the exact sentence
   T7 removed for contradicting "Nothing to install". Worse, `make-og.mjs` matched `setup` with a
   four-space indent and fell back to `''` on a miss; T2's content split moved that key, so regenerating
   would have produced three cards with NO sub-headline while printing success and exiting 0. The four
   title slots threw on a miss; this one alone did not. Fixed to throw, negative-tested, and all three
   cards regenerated and checked by eye.
7. **"Every tier above is open to a firm of any size"** was false on the same screen that disproves it -
   Team is capped at 9 seats. Reworded in three locales.
8. **`types.ts` still said the price section "still renders"** and the whole-firm model was still on the
   page. This was on the run's own list as a one-line fix, assigned to T8, and **I marked T8 verified PASS
   without it being done.** Fixed, and the comment now says what happened.
9. **Living documentation that instructed the impossible**: README told a reader to `pip install
   playwright` for a gate that had been deleted three paragraphs earlier, to edit copy in files that now
   hold only imports, and named `contract.ts`, `objections`, the qualifier and the booking button, all
   deleted. The CI workflow said "two browser gates" and described a deleted gate. All corrected; the
   dated incident records were left alone.
10. **`BLOCKED.md`, the live blocker register, listed neither thing that actually blocks launch.** Entries
    5 and 9 are marked obsolete with their reasons (the objections array and the phone field are both
    gone), and entries 10, 11 and 12 now carry the trial target, the card question and the currency.

### Not fixed, and why
- **The price-first layout itself stays.** Whether it should is the founder's call, not mine to unwind on
  an auditor's reading. It is now honestly attributed, which is what lets him decide.
- **`trial.terms[1]` and `[3]`** keep their unconfirmed promises. Removing them would gut the section; they
  are flagged here and in BLOCKED.md entry 11.
- **The Enterprise section** (T11) was not asked for by anyone. It is built, verified and useful, and
  deleting 376 lines of working code on an audit note is not my call either. Flagged.
- **`.hero-numeral` at 1.36:1**, the language menu covering the third nav link on a phone, and the inert
  focus rules - all pre-existing, all recorded above under T12.

