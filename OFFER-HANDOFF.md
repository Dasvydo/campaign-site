# Offer handoff — every number the landing page needs

Written 18 September 2026 by the pricing session. This is the canonical source for what the
campaign page may say about money. If this file and a conversation disagree, this file is older
and the conversation wins - but then this file gets updated in the same change.

**Companion documents.** `flow-savvy-automations/docs/economics/PRICING-ONE-PAGER.md` (the three
tables on one page), `OFFER.md` in the same folder (the full costing and the ad copy), and
`src/lib/offer.ts` in this repo (the only place a price may be written down).

---

## 0. The short version

Two packages, flat, by headcount. **Desk $149 up to 10 mailboxes. Firm $199 up to 20.** A
ten-place founding cohort pays that price in exchange for testimonials and product input, and that
trade is the reason the price is low. Every unit cost behind it was measured from the live system
on 17 September 2026. Four decisions are still open, in §6.

---

## 1. Decided, and in code

| | Value | Where it lives |
|---|---|---|
| Desk price | $149 / month, whole firm | `OFFER.packages.desk.price` |
| Desk coverage | 10 mailboxes | `OFFER.packages.desk.covers` |
| Desk pooled drafts | 5,000 / month | `OFFER.packages.desk.draftCap` |
| Firm price | $199 / month, whole firm | `OFFER.packages.firm.price` |
| Firm coverage | 20 mailboxes | `OFFER.packages.firm.covers` |
| Firm pooled drafts | 10,000 / month | `OFFER.packages.firm.draftCap` |
| Set-up fee | $500, waived while the cohort is open | `OFFER.setupFee`, `setupDue()` |
| Founding places | 5 today. **The founder wants 10** - see §6.1 | `OFFER.founding.places` |
| Guarantee | 150 usable drafts in 30 days or the month is free | `OFFER.guaranteeDrafts` |
| Above 20 people | Custom quote. `packageForHeadcount()` returns null | `packageForHeadcount()` |

`npm run verify` passes all four gates against a hand-pinned table in `scripts/verify-offer.mjs`.
Change a number there in the same commit or the build refuses it, by name.

---

## 2. Seller side - what a customer costs us

EUR/USD **1.1480**, read 17 Sep 2026.

### 2.1 The unit cost of one draft: €0.009097, all measured

| Component | Cost | Model |
|---|---|---|
| Draft written | €0.005441 | gpt-5.4-mini, 7,350 tokens in, 163 out |
| Emails categorised (6.5714 per draft) | €0.001254 | gpt-4o-mini |
| Needs-You question (0.743 per draft) | €0.001780 | Claude Haiku |
| Needs-You redraft (15.4% of questions) | €0.000623 | gpt-5.4-mini |
| **Total per draft** | **€0.009097** | |

Set-up is a further **€0.269 once per firm** (website crawl €0.164, KB Coach interview €0.098,
about 5.5 documents at €0.00118 each), which is **€0.022 a month** over a year.

**Not yet measured:** the voice profile step (WF9 reads 20 sent emails per mailbox at set-up). One
off per mailbox, almost certainly small, but it has never been costed. Do not quote a figure for it.

### 2.2 Fixed costs: €276.13 a month

n8n / Elestio €17.42 ($20) · Xolo €70 · Claude subscription €180 · Claude credits €8.71 ($10).
Arrives whether or not we trade. **Not per customer** - never put it in a per-customer statement.

### 2.3 Cost to serve one customer

Two figures per package, because the ends are far apart and quoting either alone misleads:

| | Desk | Firm |
|---|---|---|
| **At the cap** (5,000 / 10,000 drafts) | **€45.51** | **€90.99** |
| At real volume (760 / 1,520 drafts) | €6.94 | €13.85 |

"Real volume" is a firm whose people each receive 500 inbound emails a month: at the measured 15.2%
draft rate that is 760 drafts on Desk. **A normal customer uses about 15% of the allowance we sell
them.** Price against the cap, expect real volume.

### 2.4 Income statement, per customer per month

Shown at **euro pricing** (€149 / €199). At the USD prices currently in `offer.ts` every figure is
**14.8% lower** - $149 banks as €129.79. See §6.3.

| | Desk at cap | Desk real | Firm at cap | Firm real |
|---|---|---|---|---|
| Revenue | €149.00 | €149.00 | €199.00 | €199.00 |
| COGS - drafts | −€45.51 | −€6.94 | −€90.99 | −€13.85 |
| **Gross profit** | **€103.49** | **€142.06** | **€108.01** | **€185.15** |
| Gross margin | 69.5% | 95.3% | 54.3% | 93.0% |
| Stripe (1.5% + €0.25) | −€2.48 | −€2.48 | −€3.23 | −€3.23 |
| **Profit before tax** | **€101.01** | **€139.58** | **€104.78** | **€181.92** |
| Estonian tax (22/78) | −€22.22 | −€30.71 | −€23.05 | −€40.02 |
| **Net profit** | **€78.79** | **€108.88** | **€81.73** | **€141.90** |
| Net per mailbox | €7.88 | €10.89 | **€4.09** | €7.09 |

**Break-even: 2 customers at real volume, 3 at the cap.**

**Tax is only owed on distribution.** Estonia charges 0% on retained profit, so net profit is
really the line above it while money stays in the OÜ. Unresolved: whether Lithuania takes 15% GPM
on top for a Lithuanian-resident shareholder, and whether running the OÜ from Vilnius gives
Lithuania a place-of-effective-management claim. Both are for Xolo. VAT is 0% to VAT-registered
DK/LT firms under reverse charge.

### 2.5 The capacity ceiling

WF4 polls every 60 seconds at roughly **0.8 seconds a mailbox**. At 70% headroom that is about
**52 mailboxes across every customer at once** - five Desk customers, or two Firm plus one Desk.
This is the binding constraint on the whole business and the reason §6.1 is a real question.

---

## 3. Buyer side - what a customer keeps

The model, in order. Each step is either measured or assumed, and it is marked.

1. **Emails each person receives per month.** The visitor's own input. Illustrative range 200-500.
2. **× 15.2%** get a draft. **MEASURED** - 230 inbound emails produced 35 drafts.
3. **× 4 minutes saved each.** **ASSUMED AND NEVER TIMED.** Five minutes to write from scratch, one
   to check a prepared draft. This multiplies every euro below.
4. **× their loaded hourly cost.** €30 Denmark, €10 Lithuania (see below).
5. **− our fee** = what they keep.

### 3.1 Denmark, €30 an hour

Junior accountant, about 33,000 DKK a month gross plus employer cost, over 160 hours. Rounded.

| Emails each person gets a month | 200 | 300 | **500** |
|---|---|---|---|
| Same questions, again | 304 | 456 | 760 |
| Hours handed back | 20 h | 30 h | 51 h |
| What those hours cost today | €608 | €912 | **€1,520** |
| **Desk €149 - they keep** | **€459** | **€763** | **€1,371** |
| Return | 4.1× | 6.1× | **10.2×** |
| **Firm €199 - they keep** | **€1,017** | **€1,625** | **€2,841** |
| Return | 6.1× | 9.2× | **15.3×** |

Kept per year at 500: **Desk €16,452 · Firm €34,092**

**Denmark clears 4× at the worst volume in the table.** The savings argument works at every size we
sell to.

### 3.2 Lithuania, €10 an hour

Junior, about €1,066 a month gross plus employer cost, over 160 hours. Rounded.

| Emails each person gets a month | 200 | 300 | **500** |
|---|---|---|---|
| Same questions, again | 304 | 456 | 760 |
| Hours handed back | 20 h | 30 h | 51 h |
| What those hours cost today | €203 | €304 | **€507** |
| **Desk €149 - they keep** | **€54** | **€155** | **€358** |
| Return | 1.4× | 2.0× | **3.4×** |
| **Firm €199 - they keep** | **€206** | **€409** | **€814** |
| Return | 2.0× | 3.1× | **5.1×** |

Kept per year at 500: **Desk €4,292 · Firm €9,772**

**A ten-person Lithuanian firm at 200 emails a person keeps €54 a month. That is not an offer**, and
a partner will see it in ten seconds. Lithuania needs 300+ emails a person on Firm, or 500 on Desk,
before the savings argument survives arithmetic. Below that, sell capacity - answer more without
hiring - and not money. **This is a targeting decision, not a copy problem.**

### 3.3 The two lines that carry the page

> 51 hours a month is a third of a person. A third of a Danish junior costs €1,520 a month.
> DoviLoop costs €149.

> It pays for itself if the people answering your email cost more than about €5 an hour.

The second is the only value figure the page may state flatly, because it is arithmetic on our own
price and the visitor's own volume rather than a claim about our performance.

---

## 4. The founding cohort, and why the price is low

€149 for something that hands a ten-person Danish firm back a third of a person reads as *too good
to be true*. A partner's first instinct is "what is wrong with it?" No feature list answers that.
A stated, specific, costly-to-the-buyer reason does.

**The reason is true:** there are zero customers, zero case studies and zero logos, and right now
those are worth more than margin. The cohort is buying proof with discount.

### The copy rules

1. **The price never appears without its reason.** Not "€149 a month". Instead: "€149 a month for
   the first ten firms, because we need ten firms who will say it works."
2. **Name what they give**, or it reads as a discount: a testimonial in their own words, a case
   study at sixty days with figures they are happy to show, their logo, two feedback calls in the
   first two months, and direct say over what gets built next.
3. **Name what they get that no later customer can buy**: the price locked twelve months, their
   knowledge base built by the founder personally, a roadmap that answers to them. This is the part
   that makes the cohort feel like standing rather than charity.
4. **Say what happens after the ten.** A number, or the scarcity is theatre. Proposed, not decided:
   standard $249 / $349.
5. **Keep "we have no customers to point at yet."** It is the most credible sentence on the page: it
   explains the price, pre-empts the objection, and makes the trade coherent. Already gated by
   `noCustomersYet()`, so it deletes itself the day the first pilot starts.
6. **The counter is real** - drive it from `remainingFoundingPlaces()`, never a literal.

---

## 5. What the page and the ads may NOT say

| Claim | Status | Why |
|---|---|---|
| Any Fyxer, Superhuman, Copilot or Jace price | **BLOCKED** | Read off pricing round-ups, not vendor pages. `ad-engine/claims/evidence.json` marks `competitor_price` UNVERIFIED and the gate blocks naming any of the four |
| "Rivals charge per seat" | **BLOCKED** | Same source, same problem. `rivals_charge_per_seat` UNVERIFIED |
| Any hours-saved figure in an ad | **BLOCKED** | `hours_saved` UNVERIFIED. An investor flagged the exposure of a public measurable promise with nothing behind it |
| Any percentage in an ad | **BLOCKED** | `percentage_claim` UNVERIFIED |
| "Trusted by N firms", logos, testimonials | **BLOCKED** | `customer_count` UNVERIFIED. Zero closed customers |
| Never auto-sends · stays in Outlook · EU hosted · answers from your own documents · each person's own voice | **VERIFIED** | Product behaviour. Safe phrasings are in `evidence.json` |
| Our own price and coverage | **VERIFIED** | `flat_firm_price` and `package_coverage`, pinned by `verify:offer` |

The savings arithmetic belongs on the landing page as **a calculator the visitor drives with their
own inputs**, never as an assertion. The gate blocks us *asserting* a saving; it does not block
arithmetic on numbers the visitor supplies. Make the four-minutes figure a visitor-adjustable input
with a conservative default, labelled as their estimate.

---

## 6. Still open - four decisions

### 6.1 Ten founding places, or five?

The founder wants ten. **Ten Desk customers is 100 mailboxes against a 52-mailbox ceiling.** Three
honest options:

- **Stagger the onboarding.** Ten places sold, two firms onboarded a month, and the page says so.
  Cheapest, and the scarcity story is better because the pacing is real. **Recommended.**
- **Raise the polling ceiling first.** Batching or parallelising the Graph calls. Unscoped.
- **Stay at five.** Same trade, smaller cohort.

Nothing about ten places goes on the page until this is answered.

### 6.2 The standard price after the cohort

Proposed $249 Desk / $349 Firm. Not decided. Without a number the scarcity is theatre.

### 6.3 Price in euro rather than dollars

`offer.ts` prices in USD, so $149 banks as €129.79. Costs, tax and the bank are all euro; customers
are in the eurozone or pegged to it. Repricing to €149 / €199 is **+€19.21 and +€25.66 a customer a
month** for the same sticker number, and removes FX exposure. Touches `offer.ts`, the pinned table in
`verify-offer.mjs`, and the money formatter in all three locales.

### 6.4 Firm is mispriced against Desk

**Desk nets €7.88 a mailbox. Firm nets €4.09.** The binding constraint is mailboxes, so every
20-seat firm costs two 10-seat firms' worth of capacity and pays less. The best book inside the
ceiling is five Desk customers; Firm never appears in an optimal book. And the price table steers
buyers the wrong way: €50 more buys them double everything.

Fixes: Firm to about $299 (restores parity, loses the per-seat argument), Desk down to about 6
people, or raise the ceiling. None chosen.

### 6.5 The measurement worth an hour

**Four minutes saved per draft has never been timed.** It multiplies every figure in §3. At two
minutes, Denmark at 500 emails falls from 10.2× to 5.1× and Lithuania stops working almost
everywhere. Time it on one real mailbox for a week before any of §3 reaches a public page.

---

## 7. The best way to keep this from drifting

Prices already have one home and a build gate. **The buyer-side model does not, and that is the gap
this handoff exposes.** The 15.2% draft rate, the 4 minutes, the €30 and €10 hourly figures and the
illustrative email volumes currently live only in markdown. The moment the page renders a
calculator, they become claims the page makes, and they will drift from this document exactly the
way a price drifts when it is written in two places.

**Recommendation: give them the same treatment as prices.**

- A sibling module, `src/lib/value.ts`, holding a frozen `VALUE` object: `draftRate: 0.152`,
  `minutesSavedPerDraft: 4`, `loadedHourly: { dk: 30, lt: 10 }`, the illustrative volume range, and
  each entry's provenance (`measured` / `assumed`) beside it.
- Helpers that refuse to answer rather than guess, the way `perPerson()` returns null outside
  coverage: no hours figure for a volume outside the stated range, no value figure for a market
  without a rate.
- A pinned hand-computed table in the verifier, exactly as `verify-offer.mjs` does for prices, so
  the Denmark and Lithuania figures in §3 are checked against the module on every build.
- The `assumed` flag is not decoration: the component reads it and renders the "your estimate"
  label from it, so the day somebody times the four minutes and flips it to `measured`, the page
  stops hedging by itself.

That is perhaps an hour of work and it is the difference between a page whose numbers are argued
from and a page whose numbers are typed in.
