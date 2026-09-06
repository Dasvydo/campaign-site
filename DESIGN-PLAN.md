# DESIGN-PLAN — `teams.doviloop.dev`

Two-pass process, as the spec requires. Pass 1 is the plan I first reached for.
The self-review is section 6. What changed and why is section 7. No code was written
until section 7 was finished.

---

## 1. What this page is

One job: get a partner or an office manager at a 10+ seat firm, who is not technical and is
sceptical of AI writing on their behalf, to book a call.

The world is an inbox at 08:40 with forty messages that all need a careful reply. Accountants at
deadline. Insurance brokers with claims. Housing admins fielding tenant mail. These people are
personally accountable for what leaves their office, which means the page cannot promise
automation. It has to promise a draft they read before it goes.

So the page is built around a single artifact: a real incoming message and the real draft it
produced, sitting next to each other. That is the hero. Not a headline over a gradient.

## 2. Token plan

Six named values carry the page. Every one is from `brand-lock.md`, which the Phase 0 audit
confirmed is present and authoritative. Nothing here is provisional.

| Token | Hex | Role |
|---|---|---|
| `cream` | `#FFF0E5` | Default page ground. Hero, how it works, who it is for, objections |
| `espresso` | `#251D18` | All headline and body ink on cream. Also the primary button fill |
| `charcoal` | `#1D1816` | Full-bleed inverted bands. Demo, the numbers, the qualifier, the footer |
| `sand` | `#F2E3D9` | Recessed surface. The incoming message, the price band |
| `border` | `#E4D7CD` | Hairline rules. The page's main structural device, in place of shadows |
| `amber` | `#F59B0A` light / `#FBBD23` dark | The single accent. One per surface. Never a fill, never text on cream |

Supporting neutrals, also straight from brand-lock, used only where those six will not do:
Card `#FDF9F7` (the draft surface, the one genuinely raised plane on the page), Muted text
`#70635C` on cream, and on charcoal: Card `#28221F`, Border `#463E39`, Warm white `#FAF1EB`,
Muted `#B8A394`.

Contrast, checked by hand rather than assumed:
`#251D18` on `#FFF0E5` is about 15:1. `#70635C` on `#FFF0E5` is about 4.6:1, which clears AA for
normal text, so it is used for secondary prose and never smaller than 16px. `#FAF1EB` on
`#1D1816` is about 16:1. `#B8A394` on `#1D1816` is about 7:1. Amber on cream is about 1.9:1, far
below any threshold, which is exactly why amber never carries a letterform on the light ground.
It is a dot, a rule, or a marker. That restriction is brand-lock's rule and the contrast maths
agrees with it.

### Type

Two faces only, per brand-lock. No third face, no JetBrains Mono anywhere.

- **Playfair Display 400** for h1 and h2. Regular weight, not bold, at large sizes. A serif at
  regular weight reads editorial. The same serif at 700 reads like a marketing template, and
  brand-lock separately warns that Bold is measurably wider and overflows long headlines.
  600 is available for the few short headings that need more presence.
- **DM Sans 400 / 500 / 700** for body, sub-heads, labels, buttons, form, the wordmark.
- Self-hosted woff2, latin subset, in `public/fonts`, preloaded from `index.html` at stable paths
  with `font-display: swap` and a matched fallback stack. No Google Fonts request, which also
  keeps the page clean for EU visitors.

### Shape and finish

16px base radius, per brand-lock. Warm, soft, low shadows, used on exactly one element: the draft
card. Everywhere else, structure comes from 1px `#E4D7CD` hairlines that run to the full page
width, the way rules work on a printed page. This is the single biggest thing separating the page
from a deck of identical shadowed cards.

## 3. Layout concept

An asymmetric editorial column. A narrow left column carries the argument. A wide right column
carries the material. Section numbers sit out in the left margin in small DM Sans, the way a
document numbers its parts, which does the job an ALL-CAPS eyebrow would do without being one.

Background rhythm, alternating the two legal brand grounds so the page is never one uninterrupted
cream wash:

```
cream    hero
cream    how it works
CHARCOAL demo video
CHARCOAL the numbers
cream    who it is for
cream    objections
sand     price
CHARCOAL qualifier form
CHARCOAL footer
```

### Wireframe

```
+----------------------------------------------------------------------+
| DoviLoop                                       EN  DA  LT   [Book]   |   header, hairline under
+----------------------------------------------------------------------+
|                                                                      |
|  It is 08:40.       |  +--------------------------------------+      |
|  Forty messages     |  | 08:40  Ms Jensen, Ringgaarden        |      |   sand, recessed,
|  are waiting and    |  | Re: deposit statement, flat 214      |      |   flat left edge
|  every one needs    |  | "I moved out on the 30th and I still |      |
|  a careful reply.   |  |  have not had the statement..."      |      |
|                     |  +--------------------------------------+      |
|  [ 1-para claim ]   |          |                                     |
|                     |  * 08:41 draft ready                           |   amber dot, the only
|  [ Book a call  ]   |  +--------------------------------------+      |   accent on this surface
|  10+ seats. 20 min. |  | Dear Ms Jensen,                      |      |
|                     |  | Thank you for chasing this...        |      |   card #FDF9F7,
|                     |  | [ our actual deposit terms quoted ]  |      |   hairline + soft shadow,
|                     |  +--------------------------------------+      |   the one raised plane
|                     |  You read it. You send it.                     |
+----------------------------------------------------------------------+   full-bleed hairline
| 01 |  It reads the message.        | what that means, one short para  |
|----|-------------------------------|----------------------------------|  hairline between steps
| 02 |  It pulls what your firm      | ...                              |
|    |  actually knows.              |                                  |
|----|-------------------------------|----------------------------------|
| 03 |  It writes the reply in       | ...                              |
|    |  your voice.                  |                                  |
+----------------------------------------------------------------------+
|////////////////////  CHARCOAL BAND  /////////////////////////////////|
|  04  Watch it work                                                   |
|      +------------------------------------------+                    |
|      |            16:9, reserved                |                    |   fixed aspect, no CLS
|      +------------------------------------------+                    |
|                                                                      |
|  05  What it is worth      | ~9x return    | assumed hrs x salary     |   a table, not stat tiles
|                            | ~EUR 400/mo   | ...                      |
|                            | ~40 days      | ...                      |
|      These are a model, not a measurement. Not a guarantee.           |
|//////////////////////////////////////////////////////////////////////|
| 06  Who this is for                                                  |
|     accounting  /  insurance  /  administrative     10 seats minimum |
+----------------------------------------------------------------------+
| 07  Five things people ask before they book                          |
|     Q ..................................................  Playfair   |
|     A ..................................................  DM Sans    |
|     ------------------------------------------------------ hairline |
|     (x5, all open, nothing hidden)                                   |
+----------------------------------------------------------------------+
|::::::::::::::::::  SAND BAND  :::::::::::::::::::::::::::::::::::::::|
| 08  $89 per seat / month     $500 setup, once                        |
|     Two weeks free. Workshop and setup included. Card charges day 14.|
|::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::|
|//////////////////  CHARCOAL BAND  ///////////////////////////////////|
| 09  Six questions. Under a minute.                                   |
|     [ company ] [ work email ] [ phone ]                             |
|     [ how many handle email ] [ what the team uses ] [ your role ]   |
|     [ Check if we are a fit ]                                        |
|                                                                      |
|  DoviLoop  ·  contact  ·  privacy  ·  company details                |
|//////////////////////////////////////////////////////////////////////|
```

Mobile: the two columns stack, the artifact stays above the fold in the sense that the message
block is the first thing under the opening line, the margin numbers move inline as a small
prefix, the sticky header keeps only the wordmark, the locale switch and the book button.

## 4. Principles

1. **Show the artifact, do not describe it.** A real message and a real draft outperform any
   headline. Brand-lock says the same thing in its content preference.
2. **Rules, not shadows.** Hairlines carry the structure. One shadow exists on the whole page.
3. **Unequal by design.** No row of three identical anything. The three steps have deliberately
   different column proportions and no icons.
4. **Amber once.** One accent mark per surface, and never under a letterform on cream.
5. **The page does not move.** No entrance animation of any kind. One amber dot pulses to say
   "this just happened", and it holds still under `prefers-reduced-motion`.
6. **Honest numbers.** Every figure carries its basis and the word estimate. This reader has been
   sold to before.
7. **The price qualifies.** Showing $89 and $500 out loud removes the calls that were never going
   to close.

## 5. How each hard ban is answered

| Ban | How the page avoids it |
|---|---|
| Warm cream with terracotta accent | Cream is brand-locked and stays. Terracotta is not in the palette and never appears. The tell is broken structurally: the page alternates cream with full-bleed charcoal, so it never reads as one warm wash |
| Near-black with one acid accent | The dark bands are warm charcoal `#1D1816`, not near-black, and their accent is amber, which is a warm signal colour, not an acid one |
| Identical rounded cards with the same grey shadow | Exactly one shadow on the page, on the draft card. The message block is a recessed sand surface, the steps are hairline-ruled bands, the objections are a ruled list, the price is a full-bleed band. No two surfaces share a treatment |
| ALL-CAPS eyebrow labels | Replaced by small margin numbers, `01` to `09`, set in sentence-case DM Sans |
| One word in the headline coloured differently | Never. Headlines are single-colour espresso or warm white. This overrides brand-lock's suggestion that amber may highlight a headline word, and the conflict is recorded in `AUDIT.md` |
| Arrows appended to button text | Button labels are verbs and nothing else. "Book a call". "Check if we are a fit" |
| Fade-and-slide entrances | Zero scroll-triggered animation exists in the codebase |

## 6. Self-review

Reading pass 1 back against the brief, seven things read like the default page the client has
already rejected.

1. My hero was a centred Playfair headline with a subhead, a button, and a screenshot floated to
   the right. That is the shape of every AI-generated landing page. It also buries the artifact,
   which the brief says should work harder than any headline.
2. "How it works" was three cards in a row with an icon, a title, and a line of text. That is the
   identical-rounded-cards ban almost verbatim, and icons would have pushed the page toward the
   generic-AI visual language brand-lock rules out.
3. "The numbers" was three large figures in a row on charcoal. The brief opens by telling me not
   to lead with a big number. Three big numbers later in the page is the same instinct wearing a
   different hat, and a sceptical partner reads a round unsourced figure as marketing.
4. Objections were an accordion. Collapsing them optimises for a tidy page. This reader wants to
   find their own objection and read the answer without hunting, and a closed accordion also
   hides the answers from anyone skimming on a phone.
5. Price was a centred bordered card with a shadow. Same ban as point 2, and centring it made the
   price feel like a product tier rather than a fact the page states plainly.
6. The whole page sat on uninterrupted cream. Even with terracotta removed, an unbroken warm
   ground is the tell the brief names first.
7. Sections faded and slid in on scroll. Explicitly banned, and worse, it delays the artifact the
   entire page depends on.

Two smaller things also failed the read. I had amber highlighting one word of the h1, which is
sanctioned by brand-lock but banned by this brief. And I had a generic "trusted by" strip, which
would have needed logos or testimonials that do not exist and that `00-START-HERE.md` forbids
inventing.

## 7. What I revised after the self-review, and why

1. **Hero rebuilt as an asymmetric editorial split.** Narrow left column for the argument, wide
   right column for the artifact. The message and the draft are the hero. The h1 dropped from
   Playfair 700 to Playfair 400, because regular-weight serif at a large size reads as an
   editorial page and bold reads as a template. Reason: the brief asks for the 08:40 inbox, not
   a headline, and brand-lock warns that Playfair Bold overflows.
2. **Three cards became three hairline-ruled bands with margin numbers and no icons**, with
   deliberately unequal column widths so they cannot read as a set of three. Reason: the
   identical-card ban, and icons would have been generic-AI decoration.
3. **Big stat figures became a small sourced table** with a basis line for each figure and a
   plain caveat saying these are a model, assumed time saved costed at a salary, and not a
   measurement or a guarantee. (Wording revised 2026-09-06 on Dovy's decision that the ROI
   figures are modelled, not measured; see `RUN-REPORT.md`, Decisions applied.)
   Reason: the audience is sceptical and personally accountable. A figure with its basis attached
   is more persuasive to this reader than the same figure set 96px tall.
4. **Accordion became five open Q and A blocks** separated by hairlines, question in Playfair,
   answer in DM Sans. Reason: this page's job is to answer objections before the call, and a
   closed accordion answers none of them to a skimmer.
5. **Price card became a full-bleed sand band** with a left-aligned price and a hairline-ruled
   line-item list including what the pilot costs and when the card is charged. Reason: the price
   is a qualifying fact stated plainly, not a tier being sold.
6. **Cream wash became a cream and charcoal rhythm**, two dark bands, one sand band. Reason: it
   breaks the first named tell without breaking brand-lock, since both grounds are sanctioned.
7. **All scroll animation removed.** One amber dot pulses, and `prefers-reduced-motion` stops it.
   Reason: the ban, and the artifact should be readable the instant the page paints.
8. **Amber removed from the headline** and used only as the 08:41 status dot, a rule, and the
   focus ring. Reason: this brief's ban overrides brand-lock's option, and amber on cream fails
   contrast under text anyway.
9. **The "trusted by" strip was deleted outright**, not filled. Reason: no testimonials and no
   named pilots exist, and inventing them is forbidden. The ROI table carries the
   argument instead, as a worked example. It is a model, not proof: nothing in it was measured
   against a customer (decision of 2026-09-06).

## 8. Quality floor, treated as unannounced requirements

- Responsive from 360px up. Two columns collapse to one at 900px, form fields go full width.
- Visible keyboard focus everywhere: a 2px amber outline with a 2px offset, never `outline: none`
  without a replacement. Focus is visible on both grounds.
- `prefers-reduced-motion: reduce` disables the one animation on the page and all scroll smoothing.
- Contrast checked per token above. Amber is never load-bearing for meaning on its own: the
  "draft ready" dot is always accompanied by the words.
- No layout shift: the video slot reserves its 16:9 box, fonts are preloaded and self-hosted with
  a matched fallback, and there are no images that load without dimensions.
- Semantic landmarks, a skip link, labelled form controls with `aria-describedby` for hints and
  errors, `aria-live` on the soft email warning and on the result screen.
