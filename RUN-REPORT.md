# RUN-REPORT — Batch A, `campaign-site`

Branch `campaign/a-site`.
`npm install` ran, `npm run build` passes, `npm run verify:payload` passes with
88 assertions and 0 failures.

Read `AUDIT.md` and `BLOCKED.md` alongside this.

---

## 1. What was built

A deployable three-locale landing page for `teams.doviloop.dev` with a working
qualifier, tracking, and a Vercel config.

**Stack:** React 18, TypeScript (strict), Tailwind v4, Vite 6, React Router 6.
Chosen from the spec's own evidence because the `doviloop.dev` frontend is not
in this container. See `AUDIT.md` section 3, and `BLOCKED.md` entry 1: **the
convention match is unverified.**

**Design.** `DESIGN-PLAN.md` was written and self-reviewed before any code, and
section 7 names the nine things the self-review changed. Short version: an
asymmetric editorial layout where a real message and the real draft it produced
are the hero, hairline rules instead of cards, a cream and charcoal band rhythm
instead of one warm wash, a sourced numbers table instead of three big stats,
five open objections instead of an accordion, and no entrance animation at all.
Every colour is from `brand-lock.md` and is authoritative rather than derived.

**Nine sections**, in the spec's order: hero, how it works, demo slot, the
numbers, who it is for, five objections, price, qualifier, footer.

**Copy** written for real in English first, then Danish and Lithuanian as native
copy rather than line-by-line translation. Lithuanian is in the formal *Jūs*
register. Both are marked `NEEDS NATIVE CHECK`. All copy is in
`src/content/{en,da,lt}.ts`; components hold no strings. The shape is a
TypeScript interface, so a missing key is a build failure rather than a blank
space on the page.

**Qualifier:** six fields in the spec's order, mapping one to one onto the
shared contract. Three outcomes rendered client-side from `route()` in
`src/lib/contract.ts`, which is the same rules table Batch F applies server
side, written down once.

**Tracking:** PostHog on the EU host with the eight required event names, every
event carrying `market`, `locale` and the four UTM values, merged centrally so a
call site cannot forget them. `posthog-js` is lazy loaded and events fired
before it arrives are replayed, not dropped. Meta pixel loader present and fully
inert while `VITE_META_PIXEL_ID` is empty.

**Never lose a lead:** POST, retry once, then show the booking link anyway and
queue the payload in `localStorage`; the queue drains on the next page load. See
section 5 below for the full design.

**Verification harness:** `npm run mock` is a local stand-in for Batch F's n8n
webhook that validates the body strictly against the contract and rejects
unknown keys, missing keys, wrong types and out-of-range enums.
`npm run verify:payload` boots it, bundles the real components with esbuild,
renders them in jsdom, and asserts 88 things. It exits non-zero on any failure
and is ready to drop into CI.

## 2. The QA gate, line by line

### `[x] All three locales render with no missing keys and no English leaking into /da or /lt`

**Verified, by rendering.** `scripts/harness-page.tsx` renders the entire
`LocalePage` for each locale in jsdom and asserts, per locale: it does not
throw; every leaf string in the locale file is non-empty; every string that
should be visible actually reached the DOM (about 45 strings each, including all
five objection answers and all four price lines); all seven numbered sections
are present; `<html lang>`, `<title>`, description, canonical and four hreflang
alternates are correct; the skip link, `main` landmark and footer exist; the
demo slot reserves `16 / 9`; the qualifier has exactly six controls and every
one has a real `<label for>`.

English leakage is checked by taking every English master string that genuinely
differs from the target locale and asserting none of them appear in the rendered
`/da` or `/lt` output. Shared tokens like "Outlook", "Gmail" and "89 USD" are
excluded so they are not false positives. Zero leaks.

`npm run dev` was also run and `/`, `/da` and `/lt` each returned 200, as did
`vite preview` against the production build.

### `[x] The form submits the exact contract payload shape, verified against a local mock endpoint`

**Verified, over real HTTP.** The real `<Qualifier />` is rendered, the six
fields are filled, the form is submitted, and the real `src/lib/lead.ts` POSTs
to the mock on a real socket. Nothing on the payload path is stubbed.

The mock rejects any deviation: missing key, unexpected key, wrong type, empty
required string, enum value outside the contract, malformed `utm` object, or an
unparseable `submitted_at`. All four scenario payloads validated clean. The
received body is printed in the harness output and matches the contract key for
key, in the contract's own key order.

### `[x] All three routing outcomes are reachable and correct`

**Verified.** Four scenarios, covering all three outcomes and three of the four
`team_size` values:

| Input | Outcome | Screen shown |
|---|---|---|
| 10-24 + outlook | `qualified` | booking link, no Gmail note |
| 50+ + gmail | `gmail_on_request` | booking link plus the Gmail note |
| 25-49 + other | `gmail_on_request` | booking link plus the Gmail note |
| 1-9 + outlook | `too_small` | pricing link, no booking link |

Also asserted: the Outlook path does **not** show the Gmail note, the 1-9 path
links to `doviloop.dev/pricing`, and the mock independently re-derives the same
outcome from the spec's table, so a drift between the UI's copy of the rules and
the table itself would fail the run.

The free-provider email check is verified as a warning and not a block: a
`gmail.com` address raises the warning and the form still submits.

### `[x] No em dashes anywhere in src/content/*`

**Verified** by an assertion in the harness, per file, on every run. Zero in
`en.ts`, `da.ts`, `lt.ts`. En dashes were checked too and are also zero. The
same check also confirms no lorem, TODO or placeholder text in any locale file.

### `[x] DESIGN-PLAN.md names what was revised after the self-review, and why`

**Done.** Section 6 lists seven things in the first-pass plan that read like the
default page, plus two smaller failures. Section 7 lists the nine revisions with
the reason for each. Section 5 is a ban-by-ban table showing how each of the
seven hard bans is answered.

### `[x] Nothing pushed, branch campaign/a-site` *(true as written; superseded 2026-09-08)*

**Verified at the time.** `git remote -v` was empty, no push was attempted, and
every commit sat on `campaign/a-site`.

**Since 2026-09-08** the work is on `claude/campaign-build-status-9j9194` and is
pushed to `github.com/Dasvydo/campaign-site`, on Dovy's explicit instruction.
`campaign/a-site` is untouched and remains this batch's own record. No commit
count is quoted here any more: it goes stale on every commit, and
`git log --oneline` is authoritative.

### Quality floor, unannounced

| Requirement | Status |
|---|---|
| Responsive to mobile | **Measured in Chromium at 360x800 on 2026-09-09, all three locales: zero horizontal overflow.** Fluid `clamp()` type, `minmax(0,1fr)` grids that collapse at `sm`/`md`, 16px form inputs to stop iOS zoom, sticky header that keeps only wordmark, locale switch and button. The 16px rule is measured too - every one of the six fields computes at 16px or more. `python3 scripts/verify-browser.py`, and see section 7 |
| Visible keyboard focus | **In the CSS and asserted present in the built stylesheet.** A 2px amber outline with 2px offset, redefined for the dark bands. `outline: none` appears nowhere |
| `prefers-reduced-motion` respected | **In the CSS and asserted present in the built stylesheet.** It stops the one animation on the page and disables smooth scrolling |
| Accessible contrast | **Calculated by hand, not measured by a tool.** Ratios are written out in `DESIGN-PLAN.md` section 2. The tightest pairing is muted text at about 4.6:1, which clears AA for normal text; it is used only at 16px and above. Amber never carries a letterform on cream, where it would fail badly |
| No layout shift on load | **Designed for.** The demo slot reserves its 16:9 box (asserted), fonts are self-hosted, preloaded and subset with metric-matched fallbacks, and there are no images at all in the page |
| Images sized | No raster images ship. The favicon is inline SVG |
| Fonts preloaded | **Verified.** Two `<link rel=preload>` woff2 entries in the served HTML, and the font files return 200 from the built output |
| Lighthouse | **Not run.** No headless Chrome in the container. `BLOCKED.md` entry 8 |

## 3. What was skipped, and why

- **Lighthouse and real-browser testing.** No headless Chrome available. jsdom
  proves structure, semantics and behaviour but cannot prove pixels. This is the
  single largest unverified area of this batch, and it is a 2 minute check for
  Dovy against the Vercel preview.
- **A GitHub check for an existing `campaign-site` repo.** This session has no
  push rights and is forbidden from pushing, so a remote repo is not something
  it could read into or write to. The local search is conclusive for this
  machine. `AUDIT.md` section 1.
- **Matching the `doviloop.dev` frontend conventions by inspection.** The repo is
  not here. `BLOCKED.md` entry 1.
- **A demo video, a logo file, real env values, Batch E's objection taxonomy, a
  native language check, and the company legal details.** All six are logged in
  `BLOCKED.md` with the workaround shipped in each case.
- **Server-side rendering and three static HTML entry points.** A SPA with a
  Vercel rewrite was chosen instead. Head tags including `lang`, canonical and
  hreflang are set per route in an effect. Trade-off: a crawler that does not
  execute JavaScript sees the English `<title>` on all three routes. Google
  executes JS and will be fine. The campaign's traffic is paid and outbound, not
  organic, so this was judged not worth the extra build complexity for a six
  week campaign. If organic ranking on `/da` and `/lt` starts to matter, moving
  to three Vite entry points is roughly an hour of work.

## 4. Departures from the spec, and concerns to record

The spec said to note contract concerns here rather than fix them. Nothing in
the shared contract was changed. Four things to flag:

1. **`brand-lock.md` and the design brief contradict each other, twice.** The
   brief bans "warm cream background with terracotta accent" while brand-lock
   mandates cream `#FFF0E5` as the light page, and the brief bans "one word in
   the headline coloured differently" while brand-lock offers exactly that as a
   sanctioned use of amber. Resolution, documented in `AUDIT.md` section 2 and
   `DESIGN-PLAN.md` section 5: cream stays because it is the brand and terracotta
   is not in the palette at all, and the tell is broken structurally with a
   cream and charcoal band rhythm; the headline is never recoloured, because the
   brief's ban wins on placement and the contrast maths agrees.
2. **The contract has no consent field, and the `too_small` rule enters people
   into a 3-email nurture.** Under Danish and wider EU marketing rules, quietly
   subscribing someone who filled in a qualifier is not comfortable, and Denmark
   is the strictest market in this campaign. I did not add a field. Instead the
   1-9 screen offers the series as an explicit opt-in button that opens a
   pre-filled email to `hello@doviloop.dev`. That is unambiguous consent, adds
   nothing to the contract, and needs no backend. **Batch F should not
   auto-enrol `too_small` leads into email without checking this.** If a consent
   flag is wanted in the payload, that is a change to `00-START-HERE.md` first,
   then A, B and F together.
3. **Retries can deliver the same lead twice.** Every POST carries an
   `X-DoviLoop-Dedupe` header with a UUID that is stable across the retry and
   across a queue drain. **Batch F must treat it as an idempotency key**, or a
   webhook that is slow rather than genuinely down will produce duplicate ledger
   rows.
4. **The fifth environment variable is a judgement call.** The spec requires
   five and names four (`VITE_LEAD_WEBHOOK_URL`, `VITE_BOOKING_URL`,
   `VITE_POSTHOG_KEY`, `VITE_META_PIXEL_ID`). I chose `VITE_POSTHOG_HOST`,
   because the spec calls out the EU host specifically and it is PostHog's
   standard companion variable. The alternative I rejected was `VITE_MARKET`:
   market is derived from the locale with a `?market=` URL override, which is
   more useful for ads than a build-time constant. If the intended fifth was
   something else, adding it is a one-line change in `src/lib/env.ts`.

One small visual departure: on the charcoal footer the wordmark uses lightened
teal and orange (`#5FA9B8`, `#F0844A`) rather than the brand-lock values, which
sit at roughly 2.5:1 against `#1D1816` and are not legible. The header, on
cream, uses the exact brand-lock hexes.

## 5. The never-lose-a-lead design

Required to be documented here.

1. POST the contract payload to `VITE_LEAD_WEBHOOK_URL`, or to same-origin
   `/api/lead` when that is empty so the local mock can answer it. 10 second
   timeout, `keepalive` set so a POST survives the tab closing.
2. On failure, pause 1.2 seconds and retry exactly once. Two attempts total.
3. Either way the visitor gets their result screen, and a qualified lead gets
   the booking link. A booked call is worth more than a ledger row, and the row
   can be replayed.
4. A twice-failed payload goes into a `localStorage` queue with a UUID, a
   timestamp and an attempt count. Capped at 20 entries, entries expire after 14
   days, and every storage access is wrapped so a private window or blocked
   site data degrades quietly rather than throwing.
5. The queue drains on the next page load, oldest first, one attempt per entry
   per load so a long outage cannot become a request storm. Survivors stay
   queued.
6. When both attempts fail, the result screen adds a plain line saying the
   answers are held on this device and will be sent again, and that nothing is
   lost. It does not ask the visitor to do anything.

All of this is verified end to end by `npm run verify:payload` against the
mock's deliberate-500 endpoint: two attempts, one queued entry holding the full
payload, delivered and the queue emptied on the simulated next load.

## 6. What Dovy has to do, and how long

**About 22 minutes at a keyboard, plus waiting on DNS.** The spec estimated 15;
the extra 7 is the Lighthouse and mobile check that could not be done here, and
the company legal details.

| # | Task | Time | Blocking? |
|---|---|---|---|
| 1 | `git push -u origin campaign/a-site` after reviewing the diff | 2 min | Yes |
| 2 | Create the Vercel project, import the repo, confirm the Vite preset | 3 min | Yes |
| 3 | Add the five env vars to Production and Preview, from `.env.example` | 5 min | Partly. The page works without them, but leads queue in the browser instead of reaching n8n, so this blocks any paid traffic. Needs Batches B and F to exist first |
| 4 | Add `teams.doviloop.dev` in Vercel, add the `CNAME teams -> cname.vercel-dns.com` record, wait for the certificate | 3 min plus DNS | Yes |
| 5 | Copy the demo video to `public/demo.mp4` and commit | 2 min | No. The placeholder holds the exact box, so nothing moves when it lands |
| 6 | Open the preview on a real phone and run Lighthouse | 5 min | No, but do it before spending ad money. It is the one thing this batch could not verify |
| 7 | Fill the `company` block in the three locale files with the legal name, company number and address | 2 min | Not technically, but do it before the first ad euro. Paid EU traffic to a page with no company details is a real exposure, and Denmark is strict |
| 8 | Send `src/content/da.ts` and `src/content/lt.ts` for a native check | 0 min of his own | No, but neither should carry paid traffic until it is back |
| 9 | Drop `public/logo.png` and uncomment one line in `Header.tsx`, if the monogram is wanted | 2 min | No |

Two things for later, not for landing day: swap the `objections.items` arrays
when Batch E's teardown arrives, and confirm with Batch F that
`X-DoviLoop-Dedupe` is honoured as an idempotency key and that `too_small` leads
are not auto-enrolled into email without the opt-in.

## 7. Honest list of what could not be verified

**Partly closed, 2026-09-09.** The first item below was true when written: there
was no browser in the container it was written in. There is one now (Chromium at
`/opt/pw-browsers`), so `scripts/verify-browser.py` was written and run, and
fifteen checks pass. What it measured, and what it did not, is at the end of
this section.

- Rendering in any real browser engine. jsdom has no layout, so responsiveness,
  the actual focus ring, contrast as rendered, and font swap behaviour are
  designed and reasoned about but not observed.
- Lighthouse scores of any kind.
- That the stack matches `doviloop.dev`.
- That the Danish and Lithuanian read correctly to a native speaker.
- Anything requiring a real credential: no live n8n, no live PostHog project, no
  live Meta pixel, no Vercel deploy, no DNS. All of those were stubbed, mocked
  or left inert, and none of them was called.

### What the browser pass measured, 2026-09-09

`python3 scripts/verify-browser.py`. It builds with obviously fake analytics
ids, serves the build locally, and aborts every request to a Meta or PostHog
host at the route level - nothing leaves the machine. The Meta pixel is read
out of `window.fbq.queue`, which with `fbevents.js` blocked is a complete and
exact record of every call the page made.

| | Result |
|---|---|
| Horizontal overflow at 360x800, en/da/lt | **0px on all three** |
| Form fields below 16px (the iOS zoom guard) | **none of six** |
| Pixel calls on load | exactly `init` then `PageView` |
| Playing the demo | one `ViewContent`, `content_name: 'demo_video'` |
| Scrolling the pricing band into view | **no pixel call at all** - this is decision P-6, now measured rather than read |
| Submitting the form | one `Lead`, and it carries **no properties** - the other half of P-6 |
| A phone lead (`utm_source=phone&utm_medium=call&source=outreach`) | arrives at the webhook as `source: "outreach"` - batch C's fix, end to end through a real page load |
| Uncaught javascript errors | none |

Both of the P-6 assertions were proved by making the page do the thing they
forbid and watching them fail, and the overflow check by injecting a 900px
element. A check nobody has seen fail is a check nobody should believe.

Still not measured, and not measurable this way: Lighthouse, contrast as
rendered by a real display, font swap behaviour, and whether the stack matches
`doviloop.dev`. `public/demo.mp4` is still absent - the pass synthesises a
one-second file so the demo lane exists to be observed.

## 8. Decisions applied, 2026-09-06

Dovy made four campaign-wide decisions. This section records each one and what
changed in this repo as a result.

**1. The ROI figures are modelled, not measured.** The ~9x return, ~400 EUR per
seat per month and ~40 day payback were worked out from assumed time saved,
costed at a salary. They have never been observed against a real customer. They
stay on the page as a worked example, and nothing may claim or imply they were
measured.
*Changed here:* the `numbers` section in `src/content/{en,da,lt}.ts`. The lead
is now "Three figures, and the sum behind each one." (and its Danish and
Lithuanian equivalents), the two time-based `basis` lines now say the time is
assumed, and the caveat now opens "These are a model, not a measurement",
explains the arithmetic, and says the figures have not yet been checked against
a real customer. `DESIGN-PLAN.md` (wireframe, section 7 items 3 and 9) and
`AUDIT.md` section 6 no longer describe the figures as measured or as proof.
`da.ts` and `lt.ts` keep their `NEEDS NATIVE CHECK` header; the new Lithuanian
stays in formal *Jūs*. No em dashes were introduced.

**2. Price is 89 USD per seat per month plus 500 USD one-off setup, everywhere.**
*Changed here:* nothing. Grepped `src/` and every markdown file for 49, 99, 89
and 500. The only price occurrences are `perSeat: '89 USD'` and
`setup: '500 USD'` in all three locale files, the "500 dollar setup fee" basis
line, and the `$89` / `$500` in `DESIGN-PLAN.md`. Every other hit is a font
weight, the `25-49` team-size band, or the mock's deliberate HTTP 500.

**3. Reply sentiment taxonomy is interested, not_now, not_a_fit, referred,
objection, unsubscribe.** *Changed here:* nothing. Grepped for every value and
for "sentiment"; this repo does not reference the taxonomy. The five
`objections` blocks are a different thing (Batch E's objection list) and are
unaffected.

**4. The campaign ledger lives in Supabase project `oqpeebtwtikdzorgouxd`,
schema `campaign`.** *Changed here:* `AUDIT.md` section 7 named a different
project ID as of 2026-09-03; that line is now annotated with the confirmed
project and schema. This repo still never contacts Supabase; ledger writes
belong to Batch F via the webhook, exactly as before.

`npm run build` and `npm run verify:payload` were re-run after these edits and
pass. `BLOCKED.md` has a matching note at the end.
