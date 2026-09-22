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
| T1 | Split paper.css into section stylesheets | 1 | running | 0 | | src/styles/sections/** | src/styles/paper.css, src/styles/sections/** |
| T2 | Split content into per-section modules | 1 | running | 0 | | src/content/{en,da,lt}/** | src/content/{en,da,lt}.ts, types.ts, src/content/{en,da,lt}/** |
| T3 | Rehouse Locale + Utm out of contract.ts | 1 | running | 0 | | src/lib/types.ts | src/lib/{types,contract,attribution,analytics}.ts, src/content/index.ts |
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
| C2 | T2 | T5,T6,T7,T8,T11 | Per-locale section modules at src/content/<locale>/<section>.ts, each default-exporting its slice. Content interface shape unchanged. | |
| C3 | T3 | T2,T6,T10 | Locale and Utm exported from src/lib/types.ts ONLY. contract.ts imports them as any other consumer. | |
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

## Coherence audit
<pending — phase 6>
