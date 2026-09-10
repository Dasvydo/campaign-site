# Session report: campaign-site (batch A)

Branch `claude/campaign-build-status-9j9194`, from a clean clone.
Every number below was observed in this container. Where something is read
from a config file rather than measured, it says so.

## Verified

**The repo proves itself from a clean clone.**

| Command | Result |
| --- | --- |
| `npm install` | 164 packages, 0 errors, 3 moderate advisories reported by npm |
| `npm run build` | exit 0, 55 modules, `index.js` 228.04 kB (76.05 kB gzip) |
| `npm run verify:payload` | exit 0, **87 assertions, 0 failures**, ALL CHECKS PASSED |
| `node scripts/audit-locales.mjs` | exit 0, **22 checks**, LOCALES COMPLETE |
| `python3 scripts/verify-browser.py` | exit 0, **31 checks**, all passed in a real browser |

The payload count is 87, not the 88 the brief and the repo docs expect. Nothing
is missing: the harness prints one line per assertion and one `ALL CHECKS
PASSED` summary, so `grep -c PASS` returns 88 for 87 assertions. See Found.

**The browser pass, before I touched it.** First run: 13 checks, not 15. The
two demo-video checks skip themselves when no ffmpeg is available to synthesise
`public/demo.mp4`, which is not in the repo. After `pip install imageio-ffmpeg`
the same unmodified script ran **15 checks, all passing**, which is the number
the brief expects. That is the baseline my work starts from.

**Horizontal overflow, measured at three widths in three locales.** The
extended pass loads each locale at each viewport and reports
`document.documentElement.scrollWidth - window.innerWidth`:

| | 360x800 (phone) | 768x1024 (tablet) | 1280x800 (laptop) |
| --- | --- | --- | --- |
| en | **0px** | **0px** | **0px** |
| da | **0px** | **0px** | **0px** |
| lt | **0px** | **0px** | **0px** |

Nine measurements, all exactly zero. No layout bug to find. When a measurement
is positive the check now also names the three widest elements sticking out
past the viewport, so the number points at something.

**The locale files are structurally complete.** 156 leaf keys and 9 arrays in
`en`; both `da` and `lt` carry all 156, no extras, every array the same length,
no blank values, no em dash, both still marked NEEDS NATIVE CHECK. The three
option lists the form is built from send byte-identical values in all three
locales (`1-9,10-24,25-49,50+`, `outlook,gmail,other`,
`owner_partner,ops_office_manager,it_admin,other`), which is what keeps the
payload contract honest across languages. **No Danish or Lithuanian wording was
changed.**

**The recovery path works, in a real browser.** With lead POSTs rewritten to
the mock's own always-500 `/api/lead-fail` route, so the failure is a real HTTP
500 and not a stub:

- the webhook is POSTed exactly **2** times, then given up on
- the lead lands in `localStorage.dl_lead_queue`: **1** entry, carrying a
  `dedupe_id` and the whole contract payload, not a fragment
- the visitor still gets their booking link on the result screen with delivery
  failed
- on the next page load the queue replays, the mock receives **1** payload,
  it passes the contract validator with **0** problems, and it arrives under
  **the same `dedupe_id`** the queue held, which is what lets batch F drop the
  duplicate. Nothing had ever checked that before
- an entry seeded at 15 days old is dropped and one at 13 days is kept, so the
  14-day expiry is now exercised rather than asserted

**Every new check was watched failing before it was trusted.**

| Injected fault | Result |
| --- | --- |
| A 2000px element on the page (`--self-test`) | all **9** overflow checks red, exit 1, each naming `div#overflow-canary` |
| One objection deleted from `da.ts`, its title left in English, one em dash added | **4** audit checks red, each naming the exact key path |
| `MAX_AGE_MS` cut to 12 days, replay sent under a fresh id | the dedupe and expiry checks red, exit 1 |

`src/content/da.ts` and `src/lib/lead.ts` were restored with `git checkout`
after their mutations and confirmed byte-identical to HEAD
(`git diff HEAD` empty for both).

**Environment note, so these numbers reproduce.** Chromium 141.0.7390.37 is
preinstalled at `/opt/pw-browsers` (build 1194). `pip install playwright` gives
1.62.0, which wants build 1234 and fails to launch. Pinning
`playwright==1.56.0` matches the preinstalled browser, so **no browser was
downloaded**. `imageio-ffmpeg` is needed for the two demo-video checks.

## Produced

- `scripts/verify-browser.py` (modified, commit `1e9e571` and `32810b1`)
  - overflow measured at 360, 768 and 1280 across all three locales, up from
    360 alone, with the widest offending elements named on failure
  - `--self-test` injects a deliberate 2000px block so the overflow checks
    must go red, making the proof repeatable instead of a claim in a report
  - a new lead-recovery section: 10 checks against real 500s and real
    localStorage, including dedupe continuity across replay and the 14-day
    expiry
  - 15 checks before, 31 after
- `scripts/audit-locales.mjs` (new, commit `acce32f`) - cross-locale structural
  audit: key paths, array lengths, contract option values, blank values,
  untranslated English, em dashes. Reports only, never edits.
- `SESSION-REPORT.md` (this file)

Four commits, each revertible on its own.

## Found

**1. The documented assertion count is one too high.** `README.md:58` and
`RUN-REPORT.md:5` say 88 assertions. The harness emits 87 assertion lines plus
an `ALL CHECKS PASSED` summary, which also contains the word PASS. Cosmetic,
but it is the number the next person checks the harness against. Left as is:
correcting the founder's own record is not mine to do unilaterally.

**2. `tsc` cannot see a missing list item, and neither could the existing QA.**
`types.ts` says a missing key is a build failure, and for named keys that is
true. It does not constrain the length of the arrays it holds, and four of them
drive the page: `objections.items`, `price.lines`,
`results.qualified.covers`, and the three form option lists. Demonstrated
rather than argued: with one objection deleted from `da.ts` and its title left
in English, **`tsc -b` exits 0 and `verify:payload` reports only the em dash**.
A shorter Danish page and an untranslated heading would both have shipped
silently. `scripts/audit-locales.mjs` closes that gap. As the files stand today
there is no such gap: all 156 keys and all 9 arrays match.

**3. The existing English-leak check cannot catch a copy-paste.**
`scripts/harness-page.tsx:80` builds its list of English strings, then filters
out any that also appear as a value in the target locale file. So if `da.ts`
contained the English `hero.opening` verbatim, that string would be in `da`'s
values, would be filtered out of the candidate list, and would never be
flagged. The check as written finds hardcoded English in a component, not
untranslated copy in a locale file. The new audit compares key path against key
path, which is why it caught the injected English title.

**4. The 14-day expiry governs delivery, not storage. Lead PII can outlive
it.** `flushLeadQueue` reads the queue through the expiry filter and returns
early when nothing survives, before `writeQueue` is ever reached
(`src/lib/lead.ts:158`). Measured on unmutated code:

| Queue on load | `peekLeadQueue()` | Actually in localStorage |
| --- | --- | --- |
| one 20-day-old entry | `[]` | `["old-20"]`, company name, work email and phone still there |
| a 20-day-old and a 2-day-old entry | `["new-2"]` | `["new-2"]`, the old row purged |

The code is honest about delivery: an expired lead is never sent, and
`peekLeadQueue()` correctly reports it gone. But the row is only physically
removed when some *other* live entry keeps the flush running long enough to
rewrite storage. With a single queued lead, which is the ordinary case, the
visitor's own name, work email and phone stay in their browser past the 14 days
the module promises, until another lead is queued. On an EU campaign that is
worth a decision. **Not fixed:** changing retention behaviour is not what this
task asked for.

**5. `/api/lead` in production is correct today, and one edit away from
silently losing every lead.** With `VITE_LEAD_WEBHOOK_URL` unset, `submitLead`
falls back to same-origin `/api/lead`. There is no `api/` directory in this
repo, and `vercel.json` rewrites `/((?!api/).*)` to `index.html`, so that
negative lookahead is the only reason `/api/lead` 404s instead of returning the
SPA. A 404 makes `res.ok` false, which is what sends the lead to the queue,
which is the behaviour the brief describes and the behaviour I verified. If
that rewrite were ever simplified to a catch-all, `/api/lead` would return
`index.html` with **HTTP 200**, `res.ok` would be true, and every lead would be
reported delivered and lost with no queue entry and no warning. *Read from
`vercel.json`, not observed against the live deployment; see Blocked.*

**6. P-6 re-measured in a real browser, unchanged, and left alone.** Both halves
still hold exactly as parked:

- `pricing_view` goes to PostHog only (`src/LocalePage.tsx:96`). Scrolling the
  pricing band into view adds **no pixel calls at all** ("pixel calls added by
  scrolling to pricing: none"), so ad-engine's highest-intent Meta audience
  cannot populate.
- `pixelTrack('Lead')` is sent with no properties
  (`src/LocalePage.tsx:111`), read back from `fbq.queue` as
  `["track","Lead",null]`.

Reported, not changed. The patch was not applied. `pixelTrack('Schedule')` at
`src/LocalePage.tsx:119` fires on booking click and is outside P-6 as written.

**7. `public/demo.mp4` is absent, and its absence is silent.** The two demo
checks print SKIP and the run still says "all checks passed", so the pass reads
as complete at 13 checks or at 15. Anyone reproducing the documented 15 needs
`imageio-ffmpeg` installed or the real video dropped in.

## Blocked

Nothing in the assigned task was blocked. Everything in sections a, b and c ran
to completion. What remains needs someone or something this session
deliberately does not have:

- **The production `/api/lead` behaviour (Found 5) is unconfirmed against the
  live site.** It needs one request against the deployment
  (`curl -i -X POST https://teams.doviloop.dev/api/lead -d '{}'`, expecting 404
  and not 200). Verifying it here would have meant touching the deployment,
  which the hard limits forbid.
- **Danish and Lithuanian still need a native speaker.** The audit proves both
  files are structurally complete and free of leaked English. It cannot judge
  whether the Danish reads like Danish. Both files remain marked NEEDS NATIVE
  CHECK, and no wording was touched.
- **The five environment variables are still empty** and only the founder can
  fill them in Vercel. Until `VITE_LEAD_WEBHOOK_URL` is set, the localStorage
  queue is the live delivery path rather than the fallback, which is what makes
  Found 4 worth reading.
- **P-1 to P-6 remain parked**, P-6 included. None were acted on. Nothing was
  deployed, no environment variable was set in any hosted project, no migration
  was run, no repository setting was changed, and no request reached PostHog or
  Meta: every analytics host was aborted at the route level, 75 requests
  blocked in the final run.
