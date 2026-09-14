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
- **Payback is "about 40 days"**, matching `src/content/en.ts`. The generated
  page had drifted to "about 10 days", which is the ten-seat reading and makes
  the claim four times stronger. Restored to the conservative figure. Dovy has
  not yet said which he actually means.

## Known, deliberate exception

`gates.mjs` reports **4 axe color-contrast violations**, all the same cause: the
decorative ghost numerals (the large "40" behind the hero pile, and 01/02/03
behind the how-it-works stations). `#DDCFC6` on cream is 1.36:1 against a 3:1
requirement. All four are inside `aria-hidden="true"`, and the ordering they
imply is carried by the `<ol>` and the step headings, so nothing is lost to a
screen reader.

Reaching 3:1 needs roughly 26% relative luminance, at which point the numeral
stops being a watermark and becomes a label competing with the headline. Moving
them to CSS `::before` would silence the checker without changing a single pixel
a low-vision user sees, so that was refused as checker-gaming.

**This is a design decision, not an oversight.** Dovy can overrule it.

## Running the gates

Needs `playwright-core` and `axe-core`, and a Chromium at
`PLAYWRIGHT_BROWSERS_PATH`. Neither is a dependency of this project yet; install
them where you run it.

```bash
node design/gates.mjs
```

The page must be wrapped in a minimal `<!doctype html><html lang="en">…` shell
first, because `paper-desk.html` is page content rather than a document. Without
`lang` the run reports a false `html-has-lang` violation; the real site sets it
per locale from `content.htmlLang`.

Current results:

| Gate | Bar | Measured |
|---|---|---|
| CLS | 0 | 0.0000 |
| LCP | < 1000ms | 168ms |
| TBT | < 50ms | 31ms |
| Initial JS | < 100KB gzip | 10.7KB |
| Frame rate at 4x CPU throttle | 60fps | 61.0fps |
| axe WCAG 2.2 AA | 0 violations | 4, see above |

Also verified in Chromium, not asserted: the five knowledge toggles change the
draft and restore it exactly, Enter and Space operate them, both qualifier
branches resolve, the whole form completes keyboard-only, reduced motion leaves
every end state readable, and there is zero horizontal overflow at 360, 390,
768, 1024, 1280 and 1440 in both disclosure states.

## Not done yet

- **Porting into `src/`.** This is still a prototype. The port must keep all
  three locales, and `src/lib/contract.ts` and the live intake are not to be
  touched: WF-C1 parses that payload shape.
- **Three real example messages**, one accounting, one insurance, one property.
  The demo currently carries one invented property scenario. Real ones turn it
  into a picker across the three verticals and are the largest single
  improvement available.
- **A product screenshot or screen recording.** Still the highest-leverage
  missing asset. `public/demo.mp4` is referenced in `src/` and does not exist.
- **`DoviLoop_Visual_Identity.pdf`.** Not in Drive; `Brand.md` there still
  carries an unfinished "add your brand-colors.pdf" action. Every palette
  decision so far has been made against a paraphrase in `DESIGN-PLAN.md`.
