# BLOCKED — Batch A, `campaign-site`

Log and continue. Nothing here stopped the batch. Each entry says what was missing, what it
blocks, and what unblocks it.

---

## 1. `doviloop.dev` product frontend stack match — RESOLVED 2026-09-08

**The original entry said the product frontend was not present in this container. It was.** The
search looked for a directory named `doviloop*`; the repo is named `flow-savvy-automations`, so the
match was missed. The `/home/user/reel-engine/brands/doviloop` hit was a red herring.

**Compared directly, `package.json` to `package.json`:**

| | product (`flow-savvy-automations`) | this repo |
|---|---|---|
| framework | Vite `^5.4.19` | Vite `^6.0.0` |
| react | `^18.3.1` | `^18.3.1` |
| react-dom | `^18.3.1` | `^18.3.1` |
| react-router-dom | `^6.30.1` | `^6.28.0` |
| tailwindcss | `^3.4.17` | `^4.0.0` |
| typescript | `^5.8.3` | `^5.6.3` |
| **next** | **absent** | **absent** |

**The risk this entry existed to flag is gone.** The concern was "if the product frontend is
Next.js, this repo does not match it, and the switch costs roughly half a day." Neither is Next.js.
Both are Vite + React 18 + Tailwind + TypeScript, and the reasoning recorded in `AUDIT.md` — that
`VITE_` env prefixes and editing `index.html` directly are Vite conventions — was correct.

**What remains is two major-version gaps, and they are harmless by design.** Vite 5 vs 6 and
Tailwind 3 vs 4. The spec requires a separate repo and a separate Vercel project, so the two share
no build artefact, no config and no dependency tree. Nothing needs to change unless you later want
to move components between them, at which point the Tailwind major is the one that would bite
(v4 moved configuration into CSS).

**No action needed.** Left here rather than deleted so the original reasoning stays legible.

## 2. No demo video file exists locally

**Missing:** any `.mp4`, `.mov`, `.webm` or `.m4v` under `/home` or `/root`.

**Blocks:** page section 3, the demo video.

**What I did instead:** shipped a labelled placeholder that reserves the exact 16:9 box so there
is no layout shift when the real file arrives. The component checks for `/demo.mp4` at runtime and
swaps itself for a real `<video>` element the moment the file is present.

**Unblocks it:** Dovy copies the demo video to `public/demo.mp4` and a poster frame to
`public/demo-poster.jpg`. No code change. About 2 minutes.

## 3. No DoviLoop logo file

**Missing:** no PNG or SVG of the interlocking L-D monogram anywhere on the machine.

**Blocks:** the header lockup as brand-lock describes it.

**What I did instead:** rendered the wordmark as live text in DM Sans with brand-lock's two-tone
colouring, "Dovi" in teal `#2A6C7C` and "Loop" in orange `#E96C32`. Brand-lock sanctions the
wordmark used alone. The monogram is not faked or approximated.

**Unblocks it:** Dovy drops the transparent monogram PNG at `public/logo.png`; the header has a
commented slot for it. About 2 minutes.

## 4. No live values for any of the five environment variables

**Missing:** `VITE_LEAD_WEBHOOK_URL` (Batch F's n8n webhook does not exist yet), `VITE_BOOKING_URL`
(the Google Calendar booking page is on Dovy's landing checklist), `VITE_POSTHOG_KEY`,
`VITE_META_PIXEL_ID` (the Meta Business account does not exist yet), `VITE_POSTHOG_HOST`.

**Blocks:** end-to-end verification against the real webhook, real PostHog ingestion, and a live
pixel.

**What I did instead:** every consumer degrades safely with the variable empty. PostHog no-ops,
the pixel snippet stays inert, the booking button falls back to a `mailto:` on Dovy's address, and
the form POST target falls back to a same-origin `/api/lead` path. The payload shape was verified
against a local mock endpoint instead, which is what the QA gate asks for. No secret value is
written into any committed file.

**Unblocks it:** Dovy fills the five values in Vercel once Batches B and F land. About 5 minutes.

## 5. Batch E's objection taxonomy does not exist yet — OBSOLETE 2026-09-23

**There is nothing left to refresh.** The objections section was deleted with the fit-check
funnel; `objections` does not appear anywhere in `src/`, and `src/content/{en,da,lt}.ts` now hold
only the imports that compose each locale. The unblock step below names a file shape and an array
that no longer exist. Kept as a record of what was traded away, not as work.

The original entry:

**Missing:** the competitor teardown that Batch E produces.

**Blocks:** the final wording of the five objection blocks.

**What I did instead:** wrote the five the spec names as defensible, in all three languages, and
marked the section `REFRESHED-BY-BATCH-E` in the code and in each content file so it is trivial to
find and replace.

**Unblocks it:** when Batch E lands, swap the five `objections` entries in
`src/content/{en,da,lt}.ts`. Nothing else changes.

## 6. Danish and Lithuanian copy has not been checked by a native speaker

**Missing:** a native reviewer. This is a person, not a file.

**Blocks:** shipping `/da` and `/lt` to paid traffic with confidence.

**What I did instead:** wrote both as native-sounding copy rather than literal translation.
Lithuanian uses the formal *Jūs* register throughout. Each file is headed `NEEDS NATIVE CHECK`
and the marker also appears in `AUDIT.md` and `RUN-REPORT.md`.

**The part that most needs the check** is the worked example in section 2. Its draft is cut
into clauses that swap between three readings as the reader turns the five sources on and off,
so every combination has to stay grammatical, not just every clause. Danish is V2 and Lithuanian
is inflected, which means a clause that reads correctly on its own can still leave the sentence
broken once the clause before it changes. Both were written as whole letters and then cut, but
a native reader should turn each of the five switches off on each of the three desks and read
what is left.

**Unblocks it:** Dovy sends `src/content/da.ts` and `src/content/lt.ts` out for review. It is on
his own landing checklist in `00-START-HERE.md`.

## 7. Legal and company details in the footer are partly unknown

**Missing:** the registered company name, company number, registered address, and the URL of the
privacy policy that covers `teams.doviloop.dev`.

**Blocks:** a legally complete footer. This matters more than usual because the campaign runs paid
Meta traffic into an EU audience and the Danish market has stricter marketing rules.

**What I did instead:** the footer renders the fields it can defend, links privacy to
`https://doviloop.dev/privacy`, and reads the rest from a single `company` block in each content
file so filling them is one edit per locale and no component changes.

**Unblocks it:** Dovy fills the `company` block. About 5 minutes. Worth doing before the first ad
euro is spent.

## 8. Lighthouse was not run

**Missing:** a headless Chrome in this container.

**Blocks:** the "Lighthouse-level sanity" deliverable being *measured* rather than *designed for*.

**What I did instead:** built to the underlying constraints directly. Fonts are self-hosted woff2,
preloaded, latin-subset, with a matched fallback stack. The video slot reserves its aspect ratio.
There are no unsized images. No third-party request is made on load unless PostHog is configured.
These are the things Lighthouse would flag, but the score itself is unverified.

**Unblocks it:** Dovy runs Lighthouse against the Vercel preview URL. About 2 minutes.

---

## 9. The phone number is collected again, but only this repo knows it — OBSOLETE 2026-09-23

**Nothing collects a phone number any more.** The two-step form, its phone field and
`src/lib/contract.ts` were all deleted when the gated sales call came off the page. The only lead
this page now sends is the enterprise enquiry: name, email, head count, note. The unblock step
below asks for a lead to be opened "through the live form with a number in the box", and there is
no such form and no such box. Kept as a record.

The original entry:

**Asked for on 2026-09-22:** a field where a visitor can type their number, so it shows up in
Supabase against the lead. The field is back on the form (step two, `06 Phone`), and the number
now travels in the payload as `phone`. It shipped optional that morning and was made **required**
the same day, on the founder's call: an optional number on a lead form is a number most people do
not give, and the point of the field is to have it.

The requirement is the FORM's, not the wire's. The mock still accepts an empty `phone` and n8n
should keep doing the same, because the recovery queue in `src/lib/lead.ts` replays payloads saved
on earlier visits: a lead who filled the form in while the field was optional, failed to reach the
webhook and came back later would be dropped by a validator that had since started insisting on a
non-empty string. Tightening it server-side would throw away exactly the leads the queue exists to
save.

**What is done here and needs nothing further.** `phone` never left the contract. It has been
declared in `src/lib/contract.ts`, sent on every POST and type-checked by the mock throughout the
period the form did not ask for it, carrying `""`. It carries what was typed now. `npm run
verify:payload` proves the typed number reaches the webhook byte for byte, over real HTTP, in four
different formats; `scripts/verify-visible.mjs` proves the form refuses to send a lead with the box
left empty, in a real browser, and that nothing is POSTed when it refuses.

**What this repo cannot do and has not done.** The page POSTs to n8n; n8n writes the ledger row to
Supabase project `yheilbuunzdugfnermfb`, schema `campaign`. Neither is in this repository and this
container has credentials for neither. So two things are unverified and both are outside Batch A:

1. whether the n8n workflow maps `phone` into the row it inserts, rather than simply accepting the
   key and dropping it. The validator accepts `phone` as a string - that was settled in T23 when
   the field came off - but accepting a key and storing it are different things.
2. whether the `campaign` schema's lead table still has a `phone` column. It very likely does,
   since the field was collected before 2026-09-19 and the column would not have been dropped when
   the form stopped asking, but "very likely" is not "checked".

**Unblocks it:** open one lead through the live form with a number in the box, then look at the
row. If the column is there and populated, nothing more is needed. If the value is missing, it is
an n8n mapping change or a column, and both are the founder's, not this repo's.

---

## Resolved by Dovy's decisions of 2026-09-06

Four campaign-wide decisions landed. Checked each of the eight entries above against them.

- **ROI figures are modelled, not measured.** Not a numbered entry, but the old caveat ("estimates
  from measured usage") was an unflagged assumption and is now wrong. **Resolved:** the `numbers`
  copy in all three locales, plus `DESIGN-PLAN.md` and `AUDIT.md`, now say the figures are a model
  built from assumed time saved costed at a salary, never checked against a real customer.
- **Price is 89 USD per seat per month plus 500 USD setup.** Already what the page said. Nothing
  was blocked on it and nothing changed.
- **Reply sentiment taxonomy** (interested, not_now, not_a_fit, referred, objection,
  unsubscribe). Not referenced in this repo. Entry 5 is about Batch E's *objection* taxonomy,
  which is a different list, so entry 5 stays open.
- **Ledger is Supabase project `yheilbuunzdugfnermfb`, schema `campaign`.** Entry 4 was never
  blocked on *where* the ledger lives, only on the live `VITE_LEAD_WEBHOOK_URL` value, which
  still does not exist. Entry 4 stays open for that reason alone. `AUDIT.md` section 7, which
  named a different project ID, is annotated.

Net: no numbered entry closes. Entries 1 to 8 remain open on exactly what they said before, and
none of them was waiting on these four decisions.

---

## 10. Where "Start a free trial" points — OPEN, and it is the one that blocks launch

**Missing:** a URL. The page's primary call to action carries `href="#fit"`, and no element with
`id="fit"` exists. Measured in a browser: pressing it appends `#fit` to the address, moves the page
zero pixels, and consumes the Back button.

**Blocks:** the only conversion path on the page. Everything else can be right and this page still
converts nobody. It is also why `trial_cta_click` deliberately claims only that a button was
pressed, rather than that a signup was reached.

**What was done instead:** the button's label was corrected to say what it offers, so at least it
no longer advertises the fit check that was deleted. The target was left dangling rather than
guessed at.

**Unblocks it:** the founder names the URL. Then repoint **all four** `href="#fit"` anchors
together (`Tiers.tsx`, and three in `Hero.tsx`) and give it an env slot — `.env.example` has no
`VITE_TRIAL_URL` and `src/lib/env.ts` has no reader, so answering this today means hand-editing
four hardcoded strings in two components.

## 11. Does self-serve signup take a card? — OPEN, and the page has already answered it

**Missing:** confirmation. Self-serve 14-day trials usually do take a card up front.

**Blocks:** nothing technically, which is exactly the problem. The page ships the promise anyway:
`trial.terms[1]` renders "No card, and nothing taken." in all three locales, and `terms[3]` adds
"No year to sign, and no notice period." Neither has been confirmed by anyone. If the signup this
eventually points at asks for a card, the page is lying on its most trust-bearing line, in three
languages, to two markets.

**What was done instead:** the claim was removed from the standing phone bar, where it was
gratuitous and where the surrounding copy was stale anyway. It remains in the trial terms, which is
where terms belong and where it is flagged.

**Unblocks it:** the founder says yes or no. Coupled to entry 10 - the trial target must not be
wired under this copy until both are answered together.

## 12. What currency does this campaign sell in, and at what rate? — OPEN

**Missing:** a decision. The tiers print `29 / 59 / 89 USD` per seat. Those three figures were
transcribed from doviloop.dev's published pricing on 2026-09-16, and the file they came from said
in its own header that dollars are "the currency the rates below are PUBLISHED in, which is not
ours". The same file carried an FX rate and a conversion helper whose stated purpose was to stop
exactly this confusion; both went with the whole-firm model.

**Blocks:** nothing from building, everything from being true. The markets are Denmark and
Lithuania. The worked example two sections below the price prints EUR. No VAT is stated anywhere.

**Unblocks it:** the founder states the currency and the rates. Then `PRICING.currency` and the
three `seat` values in `src/lib/pricing.ts` are one edit, a VAT line is added to `tiers.lede` in
all three locales, and `OFFER-HANDOFF.md` is updated in the same change - it still calls itself the
canonical source on money and still describes a whole-firm fee that is off the page.
