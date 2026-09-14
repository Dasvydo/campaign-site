# Landing page redesign, "paper desk"

Working design for the campaign landing page, approved in direction by Dovy and
not yet ported into `src/`. Everything here is a prototype: it is plain HTML and
vanilla JS so it can be judged in a browser without a build step. **No file in
this folder ships to visitors.**

Live prototype: https://claude.ai/code/artifact/0e625003-48cb-46a9-aeda-61518d8cbdba

## What is here

| File | What it is |
|---|---|
| `paper-desk.html` | The full page. Artifact page content: a `<title>`, one `<style>`, the body markup, one `<script>`. No `<html>`/`<head>`/`<body>` wrapper. |
| `gates.mjs` | Numeric quality gates. axe-core WCAG 2.2 AA, CLS, LCP, TBT, JS weight, frame rate under 4x CPU throttle. |
| `doviloop-icon.png` | The real mark, 1024px, pulled from the live product site. The repo had no logo asset at all. |
| `mark.svg` | A clean SVG **redraw** of that mark, so it can scale and animate. Geometry is approximate. A real vector from Dovy would be better. |

## How this page got here

1. Three directions were built and judged. Dovy picked "the firm's own paper".
2. It was advanced to a full page: six expert critiques, three competing upgrade
   plans scored by a judge panel (the "argument" angle won), section-by-section
   build, then five adversarial audits and a repair pass.
3. Copy was cut 1250 -> 783 visible words with no loss of meaning.
4. Detail moved behind two native `<details>` disclosures.
5. The headline became a proposition, the demo moved to position two, and the
   page gained a tonal rhythm.
6. The worked example became three desks, property, accounting and insurance,
   behind a tab picker; "How it actually works" was deleted; copy fell to 718
   visible words.
7. The closing call to action became a full width door with its risk reversal
   attached, and the page gained a scroll rail. 728 visible words.

## Decisions that are settled, and why

- **Warm palette and Playfair/DM Sans are brand law.** Dovy confirmed this. The
  cool-white redesign in `0fafa00` was reverted for violating it.
- **Amber never carries a letterform.** `#F59B0A` as text on cream is 1.97:1.
  Amber text on cream is `#8A5200` (5.73:1); text on an amber fill is `#1D1816`
  (8.02:1). The identity guide's own `#FFFBEB` on amber is 2.11:1 and must not
  be used.
- **The interactive demo is canned**, deterministic, no model call, and says so
  on the page. Dovy chose this over a live model.
- **The modelled figures keep their basis**, and the caveat is designed to read
  as confidence rather than as small print. Dovy chose this over cutting them.
- **The demo is the proof.** There are no customers yet, so there is no
  testimonial, no logo wall and no rating. None will be invented.
- **The demo has three desks, not one.** Property, accounting and insurance,
  chosen from a tab picker. The five sources are deliberately the same five in
  all three, because that is the argument: every firm has a rule, a date, a
  file, some figures and a voice, and only the paper changes. A visitor
  recognises their own job in the first few seconds instead of translating a
  landlord's problem into their own.

  The property desk is **not** written out in JavaScript. It is the one in the
  markup, read back off the DOM at boot, so a page whose script never ran still
  shows a whole worked example and the two copies cannot drift apart. The other
  two live in a table in the script. Every sender, figure and date in all three
  is invented, which the slug under the heading says out loud.

- **"How it actually works" is gone.** It restated in three static stations what
  the demo lets you do with your hands, and it cost about 700px of scroll and
  roughly 86 words. The one thing it carried that the demo does not show,
  "no developer, no change of email", moved into "Who this is for", which is on
  cream and already had a half-empty note grid. It cannot go in the price
  section: that ground is charcoal, and the safe amber (`#8A5200`) is a
  cream-only colour.

- **The last call to action is a door, not a third button.** The same six words
  appear in the masthead tab, in the hero, and once more at the foot of the
  price section. Only the last has nothing after it, so it is full width and
  58px tall rather than an inline button, and the one thing a person wants to
  know before pressing it, "two weeks free, stop inside them and you pay
  nothing", is attached to it rather than left six hundred pixels up the page
  on the timeline. The wording stays identical in all three places: a promise
  that changes its phrasing three times reads as three different offers.

- **There is a scroll rail.** Three pixels, brand amber, fixed to the top of
  the viewport. The page is around 7,500px and the browser's own scrollbar is
  an overlay that fades, so an impatient reader has no way of knowing how much
  is left. It is `aria-hidden`: it says nothing a screen reader does not
  already have, and a `progressbar` role would announce a number on every
  scroll tick. It carries no transition, so it tracks the scroll position
  exactly rather than chasing it, which is also why reduced motion leaves it
  alone; it moves only when the reader moves. It lives outside `<main>`,
  because several sections set `overflow-x:clip` and a clip context captures
  fixed descendants.

- **Payback is "about 40 days"**, matching `src/content/en.ts`. The generated
  page had drifted to "about 10 days", which is the ten-seat reading and makes
  the claim four times stronger. Restored to the conservative figure. Dovy has
  not yet said which he actually means.

## Known, deliberate exception

`gates.mjs` reports **1 axe color-contrast violation**: the decorative ghost
numeral, the large "40" behind the hero pile. `#DDCFC6` on cream is 1.36:1
against a 3:1 requirement. It is inside `aria-hidden="true"` and the count it
whispers is stated in words in the deck beside it, so nothing is lost to a
screen reader. (There used to be four. The other three were 01/02/03 behind the
how-it-works stations, and they went when that section did.)

Reaching 3:1 needs roughly 26% relative luminance, at which point the numeral
stops being a watermark and becomes a label competing with the headline. Moving
them to CSS `::before` would silence the checker without changing a single pixel
a low-vision user sees, so that was refused as checker-gaming.

**This is a design decision, not an oversight.** Dovy can overrule it.

## Running the gates

Needs `playwright-core` and `axe-core` in `./node_modules` where you run it, and
a Chromium at the path in the script. Neither is a dependency of this project
yet.

```bash
node gates.mjs path/to/paper-desk.html [fonts-dir]
```

It builds the `<!doctype html><html lang="en">…` shell itself, because
`paper-desk.html` is page content rather than a document and an unwrapped run
reports a `html-has-lang` violation that belongs to the harness rather than to
the page. The real site sets `lang` per locale from `content.htmlLang`. Give it
a directory of the self-hosted woff2 faces as the second argument, or it falls
back to system fonts and the line breaks will not match the real page.

Current results:

| Gate | Bar | Measured |
|---|---|---|
| CLS | 0 | 0.0000 |
| LCP | < 1000ms | 224-236ms |
| TBT | < 50ms | 50-75ms |
| Initial JS | < 100KB gzip | 13.3KB |
| Frame rate at 4x CPU throttle | 60fps | 53-56fps |
| axe WCAG 2.2 AA | 0 violations | 1, see above |
| Visible words | fewer than before | 728, from 782 |

**Read TBT and frame rate with care.** Those two were 31ms and 61.0fps when this
page was first measured, and the numbers above look like a regression. They are
not. Running the *previous* revision of the page on the same container the same
afternoon gives 55-58ms and 53-54fps, so the machine moved, not the page. The
honest comparison is old against new on one machine, and on that comparison the
three-desk version is marginally faster on frames and level on TBT. Anyone
adopting these as CI gates should re-baseline on the CI runner rather than
trusting the numbers in this table.

Also verified in Chromium, not asserted: the rail reads 0 at the top and 1.0000
at the foot, stays pinned at y=0 over the clipped price section, and remeasures
when a disclosure changes the page height; the closing call to action clears the
standing price bar at 390px; changing desk swaps the message, the
five source labels, the salutation and the draft, resets a sent letter back to
a draft, and re-draws the circled date; the tab picker follows the tablist
pattern, so arrow keys move the selection, Tab leaves the strip after one stop,
and the picker is absent with no JavaScript rather than present and inert; the
five knowledge toggles change the draft and restore it exactly, Enter and Space operate them, both qualifier
branches resolve, the whole form completes keyboard-only, reduced motion leaves
every end state readable, and there is zero horizontal overflow at 360, 390,
768, 1024, 1280 and 1440 in both disclosure states.

## Not done yet

- **Porting into `src/`.** This is still a prototype. The port must keep all
  three locales, and `src/lib/contract.ts` and the live intake are not to be
  touched: WF-C1 parses that payload shape.
- **Three real example messages**, one accounting, one insurance, one property,
  each with the reply that actually went out. The picker across the three
  verticals now exists; the paper in it is invented. Swapping invented paper for
  real paper is the largest single improvement still available, and it is a
  content change only, not a code change: three entries in the `SCENARIOS`
  table in the script, one of them the markup's own.
- **A product screenshot or screen recording.** Still the highest-leverage
  missing asset. `public/demo.mp4` is referenced in `src/` and does not exist.
- **`DoviLoop_Visual_Identity.pdf`.** Not in Drive; `Brand.md` there still
  carries an unfinished "add your brand-colors.pdf" action. Every palette
  decision so far has been made against a paraphrase in `DESIGN-PLAN.md`.
