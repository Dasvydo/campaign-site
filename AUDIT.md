# AUDIT — Batch A, `campaign-site`

Phase 0. Written before any other file in this repo was created or changed.

Date of audit: 2026-09-03
Branch: `campaign/a-site`
Repo state at audit time: one commit (`9ec6360`), a placeholder `README.md`, nothing else.

---

## 1. Does `campaign-site` already exist?

**No.** Verified two ways:

- A filesystem search (`find / -maxdepth 6 -type d -name campaign-site`) returns exactly one
  hit, `/home/user/campaign-site`, which is the empty repo prepared for this batch.
- No GitHub check was attempted. This session has no push rights and the global rules forbid
  pushing, so a remote repo, if one exists, is not something this batch may read into or write to.

**Conclusion: scaffolding fresh.** There is no prior implementation to audit or preserve.

## 2. Brand authority — `brand-lock.md`

**Found and read.** Location:

```
/root/.claude/skills/synced/0f088901-9751-425a-bcea-b23469219627_0f340692-f96f-4dc9-919a-d9599a164727/hm-static-ad-generator/references/brand-lock.md
```

Colour tokens taken from it are therefore **authoritative, not provisional**. Nothing was derived
from the live `doviloop.dev` and no colour in this repo is a guess.

What it fixes for this build:

| Thing | Value from brand-lock |
|---|---|
| Light page | Cream `#FFF0E5` |
| Dark page | Charcoal `#1D1816` |
| Headline / body ink (light) | Espresso `#251D18` |
| Muted text (light) | `#70635C` |
| Border (light) | `#E4D7CD` |
| Card (light) | `#FDF9F7` |
| Accent | Amber `#F59B0A` light / `#FBBD23` dark, once per surface, never a fill |
| Headline face | Playfair Display (h1/h2 only) |
| Body/UI face | DM Sans |
| Banned face in marketing | JetBrains Mono |
| Radius | 16px base |
| Logo | Interlocking L-D monogram, teal `#2A6C7C` + orange gradient `#E96C32` to `#E9A246`; wordmark "Dovi" teal, "Loop" orange |
| Voice | Short declarative fragments, no em dashes, no AI-hype register |

### Conflict found between brand-lock and the Batch A design brief

Two of the spec's hard bans collide with brand-lock instructions. Recording them here because the
resolution shapes the whole design, and it is documented again in `DESIGN-PLAN.md`.

1. Spec bans "warm cream background with terracotta accent". Brand-lock **mandates** cream
   `#FFF0E5` as the light page. Read strictly, the ban is on the *cream + terracotta* pairing,
   which is the recognisable AI-landing-page tell. Terracotta is not in the DoviLoop palette at
   all. **Resolution:** keep brand-locked cream, never introduce terracotta, and break the tell
   structurally instead: the page is not one uninterrupted cream wash but alternates cream with
   full-bleed charcoal `#1D1816` sections, both of which are legal brand-lock backgrounds.
2. Spec bans "one word in the headline coloured differently". Brand-lock offers that as one of
   several sanctioned uses of amber. **Resolution:** the spec wins on placement, brand-lock wins
   on the token. Amber appears once per surface as a marker, a rule, or a status dot, never as a
   recoloured word inside a headline.

Where the two documents do not conflict, brand-lock is followed literally.

## 3. `doviloop.dev` product frontend — stack conventions

**NOT PRESENT in this container.** Could not be read, so the spec's instruction to "match" its
conventions could not be executed by inspection.

Searched: no directory matching `doviloop*` anywhere on the machine except
`/home/user/reel-engine/brands/doviloop`, which is a sibling batch repo (Batch D) that this
session is explicitly forbidden to read.

**Choice made:** the stack the spec itself names as the expected shape, **React + TypeScript +
Tailwind + Vite**. Justification: the spec's Phase 0 lists "(React, TypeScript, Tailwind, Vite or
Next)" as the candidate set, the deliverables section requires `npm run build` and `npm run dev`,
the env vars are all `VITE_`-prefixed (`VITE_LEAD_WEBHOOK_URL`, `VITE_BOOKING_URL`,
`VITE_POSTHOG_KEY`, `VITE_META_PIXEL_ID`, `VITE_MARKET`), and the tracking section says to put the
Meta pixel snippet in `index.html`. `VITE_` prefixes and a hand-edited `index.html` are Vite
conventions and are not how a Next.js app is configured. The evidence inside the spec is
consistent and points one way.

**Stated plainly, as required: the convention match with the real `doviloop.dev` frontend is
UNVERIFIED.** If the product frontend turns out to be Next.js, or to pin different major versions
of React or Tailwind, this repo will not match it. That mismatch is low-cost here because the spec
requires a separate repo and a separate Vercel project by design, so nothing is shared at build
time. Logged in `BLOCKED.md`.

## 4. Demo video file

**None exists locally.** A search across `/home` and `/root` for `*.mp4`, `*.mov`, `*.webm` and
`*.m4v` (excluding `node_modules`) returned zero files.

Per the spec, section 3 of the page ships as a labelled placeholder block holding the exact
aspect ratio (16:9), with no layout shift when the real file lands. Logged in `BLOCKED.md`.
The component reads `VITE_DEMO_VIDEO_URL`-free: the file is dropped at `public/demo.mp4` and the
placeholder swaps itself out. Dovy's step is one file copy, no code change.

## 5. Toolchain available in this container

| Tool | Version | Note |
|---|---|---|
| Node | v22.22.2 | Comfortably above Vite 7's floor |
| npm | 10.9.7 | Fine |
| npm registry | Reachable | `npm ping` succeeded, so `npm install` and `npm run build` can actually be run and proven, not just written |

## 6. Assets not present

- No DoviLoop logo PNG or SVG anywhere on the machine. The wordmark is therefore rendered as
  live text in DM Sans with the brand-lock two-tone colouring ("Dovi" `#2A6C7C`, "Loop"
  `#E96C32`), which is a sanctioned lockup. The monogram is not faked. Logged in `BLOCKED.md`.
- No testimonials, no named pilots, no customer logos. Per `00-START-HERE.md` these must not be
  invented, so the social-proof slot is filled with the measured ROI figures instead, presented
  as estimates.

## 7. What this batch will not touch

- Supabase project `kngcxwcybozgqgnoweyt`: untouched, never contacted.
- No database migration written or applied.
- No live API call requiring a secret. The webhook POST is exercised against a local mock
  endpoint only.
- Sibling repos `ad-engine`, `outreach-engine`, `reel-engine`, `campaign-ledger`,
  `campaign-n8n`: not read, not modified. Their existence is noted only from a directory listing.
- Nothing pushed to any remote.
