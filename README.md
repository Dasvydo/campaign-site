# campaign-site

The DoviLoop Teams campaign landing page. English, Danish and Lithuanian, one
template, three routes. Ships to `teams.doviloop.dev`.

> **Campaign-wide documents live in `campaign-n8n/ops/`.** This repo is one of six
> batches; the status of all of them, the setup guide for a new machine, the
> decisions taken and what is still waiting on a human are kept together there:
>
> | File | What |
> |---|---|
> | `ops/STATUS.md` | audit of all six batches |
> | `ops/NEW-PC-SETUP.md` | clone, install and prove every repo from scratch |
> | `ops/DECISIONS.md` | what was decided, why, and how to reverse it |
> | `ops/NIGHT-RUN.md` | the current task plan and its live status |
> | `ops/HANDOFF.md` | what to pick up next |
>
> The six repos must be cloned as **siblings under one parent directory** -
> several tools reach across them by relative path, and this repo's own contract
> tests locate `campaign-ledger` that way.


This repo is deliberately separate from the `doviloop.dev` product. It gets
edited constantly for six weeks by ad and reel copy changes, and it has its own
Vercel project so no campaign edit can ever reach production.

Branch: `campaign/a-site`. Nothing has been pushed.

---

## Run it

```bash
npm install
npm run dev            # http://localhost:5173  ->  /  /da  /lt
```

In a second terminal, if you want the form to actually submit somewhere:

```bash
npm run mock           # local stand-in for Batch F's n8n webhook, port 8787
```

`npm run dev` proxies `/api` to it, so with `VITE_LEAD_WEBHOOK_URL` empty the
qualifier posts to the mock and the mock validates the payload strictly against
the shared contract. Anything that does not match the contract is rejected with
a 422 and the reason printed.

## Verify it

```bash
npm run build          # tsc then vite build, must pass
npm run verify:payload # the full QA harness, ~10 seconds
```

`verify:payload` boots the mock webhook, bundles the real components, renders
them in jsdom, and checks 88 assertions: all three locales render with no
missing keys and no English leaking in, all three routing outcomes are correct,
the POSTed body is exactly the contract shape over real HTTP, the free-provider
email warns without blocking, the retry and localStorage recovery path works,
and every PostHog event name is wired. It exits non-zero on any failure, so it
can go straight into CI.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on 5173, proxies `/api` to the mock |
| `npm run build` | Type check then production build into `dist` |
| `npm run preview` | Serve the production build on 4173 |
| `npm run mock` | Local mock of the n8n lead webhook, port 8787 |
| `npm run verify:payload` | The full QA harness described above |
| `npm run fonts` | Re-copy the woff2 faces into `public/fonts` after an install |

## Layout

```
src/
  content/{en,da,lt}.ts   all copy. Edit these, never the components
  content/types.ts        the shape every locale must fill. A missing key is a
                          build error, which is how "no missing keys" is held
  lib/contract.ts         the shared payload and the three routing rules
  lib/attribution.ts      UTM capture, source and market resolution
  lib/analytics.ts        PostHog, the eight event names
  lib/pixel.ts            Meta pixel, inert until the ID exists
  lib/lead.ts             POST, retry once, queue, drain on next load
  components/             one file per section
  LocalePage.tsx          the page, head tags, event wiring
public/fonts/             self-hosted Playfair and DM Sans, latin + latin-ext
scripts/                  the mock webhook and the verification harnesses
```

### Editing copy

All customer-facing text is in `src/content/{en,da,lt}.ts`. Rules, enforced by
`npm run verify:payload`:

- No em dashes anywhere.
- No AI-flavoured phrasing. No "unlock", "supercharge", "seamless".
- No invented customers, testimonials or named pilots. None exist yet.
- Lithuanian stays in the formal *Jūs* register.

`da.ts` and `lt.ts` are marked `NEEDS NATIVE CHECK` and have not been read by a
native speaker yet.

The objections section is marked `REFRESHED-BY-BATCH-E`. When Batch E's
competitor teardown lands, replace the `objections.items` array in each locale
file. No component changes.

---

## Deploy to Vercel

### 1. Create the project

Push this branch to GitHub first (it has deliberately not been pushed from the
build session).

```bash
git push -u origin campaign/a-site
```

Then, in Vercel:

1. **Add New > Project**, import this repository.
2. Vercel detects Vite from `vercel.json`. Confirm the settings match:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
3. **Do not deploy yet.** Add the environment variables first, otherwise the
   first build bakes in five empty values and you will have to redeploy.

### 2. Environment variables

Settings > Environment Variables. Add all five from `.env.example`, to both
**Production** and **Preview**:

| Variable | Where the value comes from |
|---|---|
| `VITE_LEAD_WEBHOOK_URL` | Batch F's n8n Webhook node, Production URL |
| `VITE_BOOKING_URL` | Google Calendar appointment schedule share link |
| `VITE_POSTHOG_KEY` | PostHog EU cloud, Project settings, the `phc_` key |
| `VITE_POSTHOG_HOST` | `https://eu.i.posthog.com` |
| `VITE_META_PIXEL_ID` | Meta Events Manager, your pixel's ID |

These are all client-side values, baked into the bundle and visible in the
browser. That is expected. No secret belongs in this project.

Every one of them can be empty and the page still works: analytics no-ops, the
pixel stays inert, the booking button falls back to a mailto, and leads queue in
the visitor's browser instead of being lost. Set them anyway before you spend
money on traffic.

### 3. Deploy

Deploy from the branch. Vercel builds `campaign/a-site` as a preview; promote it
to production, or set `campaign/a-site` as the Production Branch under
Settings > Git if you are not merging to `main`.

### 4. Point `teams.doviloop.dev` at it

1. Vercel project > **Settings > Domains > Add**.
2. Enter `teams.doviloop.dev` and add it.
3. Vercel gives you one record. At your DNS provider for `doviloop.dev`, add:

   | Type | Name | Value |
   |---|---|---|
   | `CNAME` | `teams` | `cname.vercel-dns.com` |

   Do not use an A record for a subdomain, and do not proxy it through
   Cloudflare's orange cloud on the first issuance or the TLS challenge fails.
4. Wait for the domain to go green in Vercel. The certificate is automatic and
   usually takes under two minutes once DNS propagates.
5. Open `https://teams.doviloop.dev/`, `/da` and `/lt` and check all three load.

`vercel.json` already contains the SPA rewrite that makes `/da` and `/lt` work
on a hard refresh, and one-year immutable cache headers for `/fonts` and
`/assets`.

### 5. Drop in the demo video

There is no video file in this repo. Section 2 of the page renders a labelled
placeholder that reserves the exact 16:9 box, so adding the file does not move
the layout by a pixel.

```bash
cp /path/to/demo.mp4        public/demo.mp4
cp /path/to/demo-poster.jpg public/demo-poster.jpg   # optional but reduces flash
git add public/demo.mp4 public/demo-poster.jpg && git commit -m "add demo video"
```

The component probes for the file at runtime and swaps itself for a real
`<video>`. No code change, no env var. If the file is much over 20 MB, put it on
a CDN instead and change `VIDEO_SRC` in `src/components/Demo.tsx` to the URL.

### 6. Add the logo, if you want the monogram

There is no logo file anywhere. The header and footer render the wordmark as
live text in the brand two-tone, which brand-lock permits. To use the monogram,
drop the transparent PNG at `public/logo.png` and uncomment the one-line `<img>`
in `src/components/Header.tsx`.

---

## Tracking

PostHog, EU host. Eight events, named exactly as the campaign spec fixes them:

`page_view` · `video_play` · `pricing_view` · `form_start` · `form_submit` ·
`qualified_shown` · `too_small_shown` · `booking_click`

Every event carries `market`, `locale`, `utm_source`, `utm_medium`,
`utm_campaign` and `utm_content`. Those properties are how the three-market A/B
test gets decided, so they are merged in centrally by `track()` in
`src/lib/analytics.ts` rather than passed at each call site. Nothing calls
`posthog.capture` directly.

`posthog-js` is loaded on demand, not bundled into the entry chunk, and events
fired before it finishes loading are held and replayed rather than dropped.

The Meta pixel loader is in `src/lib/pixel.ts` with the explanatory block in
`index.html`. With `VITE_META_PIXEL_ID` empty it does nothing at all: no script,
no request, no cookie.

## Attribution

UTMs are read from the URL on first load and held in `sessionStorage`. First
touch wins, so a visitor who arrives from an ad, wanders off to the pricing page
and comes back with a bare URL still credits the ad.

`source` in the payload is derived from the UTM values, and an explicit
`?source=reel|ad|outreach|direct` on the URL always wins. `market` follows the
locale, with `?market=dk|lt|global` as an override for an English ad pointed at
a specific audience.

## The lead is never lost

`src/lib/lead.ts`: POST, and on failure retry once. If both attempts fail, the
visitor still gets their result screen and their booking link, and the payload
goes into a `localStorage` queue that drains on the next page load. Each POST
carries an `X-DoviLoop-Dedupe` header, so **Batch F must treat that header as an
idempotency key**: a retry can legitimately deliver the same lead twice.

## Read next

`AUDIT.md` for what was and was not found before the build started.
`DESIGN-PLAN.md` for the tokens, the layout, and what the self-review changed.
`BLOCKED.md` for the eight things that are still missing.
`RUN-REPORT.md` for what to do when you land.
