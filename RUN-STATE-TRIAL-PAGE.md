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
| T1 | Split paper.css into section stylesheets | 1 | returned | 1 | verifying | src/styles/sections/** | src/styles/paper.css, src/styles/sections/** |
| T2 | Split content into per-section modules | 1 | returned | 1 | verifying | src/content/{en,da,lt}/** | src/content/{en,da,lt}.ts, types.ts, src/content/{en,da,lt}/** |
| T3 | Rehouse Locale + Utm out of contract.ts | 1 | verified | 1 | PASS | src/lib/types.ts | src/lib/{types,contract,attribution,analytics}.ts, src/content/index.ts |
| T4 | Build the interaction system | 1 | running | 0 | | src/styles/interaction.css | src/styles/interaction.css, src/styles/index.css |
| T5 | Extract trial copy before deletion | 2 | pending | 0 | | src/content/*/trial.ts | src/content/*/trial.ts |
| T6 | Delete the dead funnel | 2 | pending | 0 | | removals | Qualifier/Numbers/Pen.tsx, offer/value/contract.ts, package.json |
| T7 | Rebuild the hero | 3 | pending | 0 | | Hero.tsx | Hero.tsx, sections/hero.css, content/*/hero.ts |
| T8 | Pricing tiers section | 3 | pending | 0 | | Tiers.tsx | Tiers.tsx, sections/tiers.css, content/*/tiers.ts |
| T9 | Wire trial CTA + analytics | 3 | held | 0 | | CTA wiring | Hero/Tiers CTA blocks, src/lib/env.ts |
| T10 | Rewrite analytics event union | 4 | pending | 0 | | analytics.ts | src/lib/analytics.ts |
| T11 | Teams-of-10+ secondary path | 3 | pending | 0 | | Enterprise.tsx | Enterprise.tsx, sections/enterprise.css, content/*/enterprise.ts |
| T12 | Mobile + accessibility pass | 4 | pending | 0 | | a11y fixes | sections/** (a11y only), Consent.tsx |
| T13 | Update verification gates | 4 | pending | 0 | | scripts/** | scripts/**, package.json scripts |

## Contracts
| ID | Producer | Consumers | Interface | Honored |
|----|----------|-----------|-----------|---------|
| C1 | T1 | T6,T7,T8,T11,T12 | Section stylesheets at src/styles/sections/<section>.css, imported by paper.css in current cascade order. Only T1 edits the index. | |
| C2 | T2 | T5,T6,T7,T8,T11 | Per-locale section modules at src/content/<locale>/<section>.ts, each exporting its slice as a named export. Content interface shape unchanged. | YES |
| C3 | T3 | T2,T6,T10 | Locale and Utm exported from src/lib/types.ts ONLY. contract.ts imports them as any other consumer. | YES |
| C4 | T4 | T7,T8,T11,T12 | One interaction vocabulary: --ix-lift, --ix-press, --ix-ring, --ix-curve. No component declares its own hover shadow or transition curve. | |
| C5 | T5 | T8 | Trial copy exports { stops, terms, included } from src/content/<locale>/trial.ts. T8 renders it, does not rewrite it. | |

## Hard stops
| ID | Category | Status | Resolved by |
|----|----------|--------|-------------|
| HS1 | External write / only conversion path — where "Start free trial" points | OPEN — T9 held | Founder confirms live app signup URL |
| HS2 | Deploy / push / DNS | Standing — never on my initiative | Founder |

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

## Coherence audit
<pending — phase 6>
