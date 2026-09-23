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
enterprise enquiry form posts to the mock, which accepts any JSON object and
prints the `dedupe_id` it carries. It used to validate strictly against a shared
contract; that contract described the fit-check form and went with it, and a
validator for a shape nothing sends is worse than none.

## Verify it

```bash
npm run build   # tsc then vite build, must pass
npm run verify  # every offline gate, ~30 seconds

npx vite preview --port 4173 &                        # then, against a served build:
node scripts/verify-visible.mjs        http://127.0.0.1:4173
node scripts/verify-demo.mjs           http://127.0.0.1:4173
node scripts/verify-consent-layout.mjs http://127.0.0.1:4173
```

`verify:payload` boots the mock webhook, bundles the real components, renders
them in jsdom, and checks a hundred-odd assertions: all three locales render
with no missing keys and no English leaking in; the lead webhook's failure
recovery works end to end, including a retry that reuses the same `dedupe_id`
so the webhook can recognise it rather than making a second lead; the content
files carry no em dash and no blank key; the three share cards exist and every
URL in the head is absolute; and every name in the `EventName` union is really
raised somewhere in `src/`. It exits non-zero on any failure, so it can go
straight into CI.

Three Node gates cover what jsdom structurally cannot, each taking the URL of a
served build. `verify-visible.mjs` checks the page is genuinely on the screen,
the 16px rule that stops iOS zooming a form, and that no page raises an
uncaught error. `verify-demo.mjs` checks the worked example runs and stands
down for a pointer, a key, or reduced motion. `verify-consent-layout.mjs`
measures four viewports across three locales, before and after the notice is
answered, including that the notice never covers the hero's call to action.

There was a fourth, `scripts/verify-browser.py`. It needed Playwright for
Python, was never wired into CI, and three of its sections drove the fit-check
form and died with it. What still had a subject was moved into the gates above,
which already had the right instrument: the 14-day queue expiry, the Meta pixel
call order, the 16px rule and an uncaught-error listener. It has been deleted.

The three Node gates need a Chromium, which `scripts/chromium.mjs` resolves:
`CHROMIUM_PATH` if you set it, then this container's own
(`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`), then Playwright's resolution
after `npx playwright-core install chromium`. They are kept out of
`npm run verify` because they need a built site and a browser, which is a fair
thing to leave out of a fast local loop; CI runs all three.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on 5173, proxies `/api` to the mock |
| `npm run build` | Type check then production build into `dist` |
| `npm run preview` | Serve the production build on 4173 |
| `npm run mock` | Local mock of the n8n lead webhook, port 8787 |
| `npm run verify:payload` | The full QA harness described above |
| `npm run fonts` | Re-copy the woff2 faces into `public/fonts` after an install |
| `npm run og` | Redraw the three share cards in `public/og-*.png` from the hero copy. Run it after changing the hero headline, the setup line or the palette |
| `npm run verify` | Every offline gate: consent, payload, PostHog config, locales |
| `npm run verify:visible -- <url>` | Real browser. The page is on the screen, forms do not zoom iOS, nothing throws |
| `npm run verify:demo -- <url>` | Real browser. The worked example runs, and stands down when it should |
| `npm run verify:consent-layout -- <url>` | Real browser. Four viewports x three locales, notice up and answered. Each of these three needs a served build, so pass the URL |

## Layout

```
src/
  content/{en,da,lt}/     all copy, one module per section. Edit these, never
                          the components. The {en,da,lt}.ts files beside them
                          are now only the imports that compose each locale
  content/types.ts        the shape every locale must fill. A missing key is a
                          build error, which is how "no missing keys" is held
  lib/pricing.ts          the seat rates, the seat bands and the trial length.
                          The only place a figure is written down
  lib/attribution.ts      UTM capture, source and market resolution
  lib/analytics.ts        PostHog, the five event names
  lib/pixel.ts            Meta pixel, inert until the ID exists
  lib/lead.ts             POST, retry once, queue, drain on next load
  components/             one file per section
  LocalePage.tsx          the page, head tags, event wiring
public/fonts/             self-hosted Playfair and DM Sans, latin + latin-ext
scripts/                  the mock webhook and the verification harnesses
```

### Editing copy

All customer-facing text is in `src/content/{en,da,lt}/`, one module per
section. Rules, enforced by `npm run verify:payload` and `npm run audit:locales`
over the whole assembled locale, section modules included:

- No em dashes anywhere.
- No AI-flavoured phrasing. No "unlock", "supercharge", "seamless".
- No invented customers, testimonials or named pilots. None exist yet.
- Lithuanian stays in the formal *Jūs* register.

Every Danish and Lithuanian module is marked `NEEDS NATIVE CHECK` and none has
been read by a native speaker yet.

- No figure may be written into a copy string. Every rate, seat band and day
  count comes from `src/lib/pricing.ts`, and a slot that meets a number splits
  into `before` and `after` halves around it, so each language can inflect
  around the numeral.

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
pixel stays inert, the enquiry form falls back to a mailto, and leads queue in
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
5. Open the deployment at `/`, `/da` and `/lt` and check all three load.

`vercel.json` already contains the SPA rewrite that makes `/da` and `/lt` work
on a hard refresh, and one-year immutable cache headers for `/fonts` and
`/assets`.

### 5. Replace the invented example messages

Section 2 is a worked example across three desks, property, accounting and
insurance. Every sender, figure and date on all three is invented, which the
slug under the heading says out loud. Real ones would be the single largest
improvement available to the page, and swapping them in is a content change and
not a code change: three entries in `demo.desks` per locale file.

There is no demo video and the page no longer has a place for one. The earlier
design reserved a 16:9 box for `public/demo.mp4`, which never arrived; the
interactive example replaces it and the `video_play` event became `demo_desk`.

### 6. Add the logo, if you want the monogram

The monogram is drawn as inline SVG in `src/components/Hero.tsx` and reused by
the masthead and the colophon, each with its own gradient id. `design/` also
holds the real 1024px PNG pulled from the product site and a clean SVG redraw of
it, neither of which ships. To use a supplied file instead, drop it at
`public/logo.png` and swap the `<Mark />` call.

---

## Tracking

PostHog, EU host. Five events. The `EventName` union in `src/lib/analytics.ts`
is the entire vocabulary and `track()` will not accept a name outside it, so the
typecheck, not a gate and not this list, is what actually holds it shut:

`page_view` · `demo_desk` · `price_seen` · `trial_cta_click` · `enterprise_enquiry`

`price_seen` is dwell gated: the fee cards have to hold the middle of the
viewport for two continuous seconds, so `page_view` to `price_seen` measures
whether putting the price above the worked example got it in front of anybody,
rather than counting people who loaded a page that has a price somewhere on it.
`trial_cta_click` carries `placement`, `hero` or `pricing`, which is how the two
positions are compared against each other. `enterprise_enquiry` is raised on
delivery only, so an enquiry still sitting in the recovery queue is never
counted as a lead. The honest cost of that is an enquiry which only gets
through on a later visit is under-reported.

The set before this one was eight events built for a gated sales call:
`pricing_view`, `booking_click` and five fit-check form events, all of which
went with the form. Two of them had started reporting motions the page no longer
performed, which is the reason the vocabulary was rewritten rather than trimmed.
`scripts/verify-posthog.mjs` still lists the old names in its header; that is a
record of what a key/region mismatch silently dropped on 2026-09-22, not a
register of what is raised now.

`verify:payload` reads the live set out of the `EventName` union rather than
from this list, so a name added here that nothing raises does not make the gate
pass.

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
visitor still gets their result screen and the mail address, and the payload
goes into a `localStorage` queue that drains on the next page load. Each POST
carries an `X-DoviLoop-Dedupe` header, so **Batch F must treat that header as an
idempotency key**: a retry can legitimately deliver the same lead twice.

## Read next

`AUDIT.md` for what was and was not found before the build started.
`DESIGN-PLAN.md` for the tokens, the layout, and what the self-review changed.
`BLOCKED.md` for the eight things that are still missing.
`RUN-REPORT.md` for what to do when you land.
