# BLOCKED — Batch A, `campaign-site`

Log and continue. Nothing here stopped the batch. Each entry says what was missing, what it
blocks, and what unblocks it.

---

## 1. `doviloop.dev` product frontend is not present in this container

**Missing:** the product repo, anywhere on the machine. Searched the whole filesystem; the only
`doviloop` hit is `/home/user/reel-engine/brands/doviloop`, a sibling batch repo this session is
forbidden to read.

**Blocks:** Phase 0 step 3, "look at the existing frontend for the stack conventions and match
them". Could not be executed by inspection.

**What I did instead:** chose the stack the spec's own evidence implies, React + TypeScript +
Tailwind + Vite. The `VITE_` env prefixes and the instruction to edit `index.html` directly are
Vite conventions and are not how Next.js is configured. Reasoning is written out in `AUDIT.md`.

**Status: the convention match is UNVERIFIED.** If the product frontend is Next.js, or pins
different majors of React or Tailwind, this repo does not match it.

**Unblocks it:** Dovy opens `doviloop.dev`'s repo and compares `package.json`. Impact is low
because the spec requires a separate repo and separate Vercel project by design, so no build
artefact is shared. Cost of a later switch would be a rewrite of routing and entry files, roughly
half a day, and it is avoidable by checking now.

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

## 5. Batch E's objection taxonomy does not exist yet

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
