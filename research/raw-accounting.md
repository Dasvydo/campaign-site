# Market research: AI email drafting for small/mid accounting, bookkeeping & tax firms (10–40 staff)

**Evidence gate note up front.** I have labelled every block as one of:
- **[MEASURED]** — independent or disclosed-methodology survey/official statistics
- **[VENDOR]** — vendor-published research or marketing; methodology disclosed or not (stated each time)
- **[UNVERIFIED]** — circulating claim I could NOT trace to a primary source. Do not publish.
- **[INFERENCE]** — my reasoning, not a source.

**Access limitations you should know:** Reddit (r/Accounting, r/taxpros, r/Bookkeeping) is hard-blocked to this toolchain (network policy + all mirror front-ends behind bot challenges). AccountingWEB and Glassdoor sit behind Cloudflare and returned 403 to every route including reader proxies. The AccountingWEB material below comes from search-engine snippets of those pages, which reproduce practitioner wording verbatim but which I could not open to confirm full context or attribute every quote to a named poster. Treat AccountingWEB quotes as **near-verbatim, snippet-sourced** — good for voice-of-customer, worth re-verifying manually before publishing any single one as a pull quote.

---

## 1. INBOX REALITY

### The Karbon number — do NOT use it as stated
Karbon's email page says: *"Accountants often handle 100-200 emails per day, which equates to 24 hours each week in their inbox"* and *"some progressive accounting professionals are handling less than 50 emails per day and spending just 6 hours emailing each week."*
https://karbonhq.com/resources/progressive-accounting-firms-manage-email/

**[VENDOR — NO METHODOLOGY]** I fetched this page specifically to find the methodology. There is **none**: no sample size, no survey description, no product-telemetry disclosure, no publication date (only a 2026 copyright line). Their companion page "Rethinking email: How leading accounting firms are saving hours each week" contains **zero** quantitative claims at all — only testimonials. This is the number that circulates everywhere in this category and it is unsourced marketing. If you cite it, cite it as "Karbon's own marketing claims" and pair it with a measured number.

### The measured numbers you CAN use

**[MEASURED] CPA Practice Advisor / Canopy survey — 240 accounting professionals, June 2024**
https://www.cpapracticeadvisor.com/2024/09/15/survey-results-are-in-charting-the-future-of-accounting/110324/
- Client communication takes **9.3 hours per week on average**; respondents said they'd prefer **7.2 hours** — i.e. they self-report ~2.1 hrs/wk of client communication they actively want to eliminate.
- Channel split of client-communication time: **email 35.4%**, in-person meetings 16.8%, business phone 11.3%.
- **64% expect email to remain the most-used client channel**; only 37% predict increased client-portal use.
- Time to gather information for a typical engagement: **49% spend 1–2 days**, **36% spend 3–7 days**, **16% spend two weeks or more**.
- Communication posture: 39% mostly proactive, 39% equally proactive/reactive, **22% mostly reactive**.
- **51% of firms prohibit clients emailing sensitive information; 49% allow it.** (Directly relevant to your objection handling — see §7.)

**[MEASURED] Canopy internal-communication survey — 150 US accountants, ±6% at 95% confidence, independent research firm, Oct 2022**
https://www.getcanopy.com/blog/internal-communication-survey-client-management
- **"79% of accountants aren't sure their firm could function without email"**
- **"37% of accountants say they have missed a client deadline because of poor office staff communication"**
- **"41% of accountants have lost important client information due to poor internal communication"**
- **"51% of accountants and staff say forgetting to 'reply all' has caused work delays"**
- **"70% of accountants and staff say clients are usually more responsive than coworkers"**
- **"91% of accountants and staff say they regularly want to reference client messages within firm communications, but only 42% are sure they can do it easily"** ← this is the single best stat for your "the file on that client" value prop.

**[MEASURED] Financial Cents, 2025 State of Accounting Workflow & Automation — 816 accounting/bookkeeping/tax firm owners, primarily North America** (I extracted the report PDF directly)
https://financial-cents.com/resources/articles/2025-report-state-of-accounting-workflow-and-automation/
PDF: https://4740670.fs1.hubspotusercontent-na1.net/hubfs/4740670/Workflow%20Automation%20Report-2025-final-2.pdf
- Firm-size mix: 34.2% solo, 37.5% 2–5 employees, 12.1% 6–10, 8.7% 11–20, 7.5% 20+. (Note: skews smaller than your 10–40 target; roughly **16% of the sample is 11+**.)
- **"Chasing clients for information" is the #1 workflow challenge at 64%**, ahead of manual administrative tasks (54.7%), onboarding new clients (35.3%), poor work visibility (33.1%), poor systems/processes (29.3%).
- Top firm-level challenges: workflow inefficiencies 55.5%, **managing clients 48.3%**, firm capacity 39.8%, acquiring new clients 36.3%, implementing technology 35.8%, staying profitable 23.3%, recruiting talent 21.2%.
- Document collection before automation: "Nearly half of firms experienced delays of several days"; "nearly one-fifth faced severe delays."

**[MEASURED] AccountingWEB (snippet-sourced), on the arithmetic of email admin**
https://www.accountingweb.co.uk/practice/general-practice/emails-have-blurred-work-life-balance
- *"filing emails for 10 minutes a day equals 37 hours a year"* (one working week); *"spending half an hour a day on emails equates to three weeks of wasted time."*

### Numbers I found but could NOT verify — do not publish
- **[UNVERIFIED]** "AICPA found ~17% of an accountant's time is spent on non-billable tasks." Appears only in time-tracking-vendor blogs (Memtime, HiveDesk). I could not find the AICPA primary.
- **[UNVERIFIED]** "Accountants lose 3.8 hours weekly to meeting admin, costing firms up to £78,000 per accountant." Vendor blog (usevinyl.com), no primary.
- **[UNVERIFIED]** "Randstad research: accountants report 5 interruptions a day, losing 9 hours per employee per week to multi-tasking." Cited by QX Global Group; I could not locate the Randstad original.
- **[UNVERIFIED]** "92% of accountants say they spend too much time on admin" (alkmist.com blog) — no traceable primary.

---

## 2. MESSAGE TAXONOMY — what actually lands in the inbox

### A. Recurring OUTBOUND emails (already templated across the industry → strongest pre-draft candidates)
The clearest proof that these are repetitive is that a whole template-library cottage industry exists. Sequenzy's accountant template set gives 13 categories with real subject lines:
https://www.sequenzy.com/templates/accounting-email-templates
1. Document request — *"{{clientName}}, we need your {{taxYear}} tax documents by {{deadline}}"*
2. Tax deadline reminder — *"{{daysUntilDeadline}} days until the {{filingDeadline}} tax deadline"*
3. Engagement letter follow-up — *"Your engagement letter is ready for signature - {{firmName}}"*
4. Year-end planning invitation — *"{{clientName}}, let's plan for year-end before December 31"*
5. New client welcome — *"Welcome to {{firmName}} - here's how to get started"*
6. Quarterly estimated tax reminder — *"Q{{quarter}} estimated taxes due {{paymentDeadline}} - don't forget"*
7. Monthly bookkeeping summary — *"Your {{month}} financial summary is ready"*
8. Return ready for review — *"Your {{taxYear}} tax return is ready for your review"*
9. Referral request
10. Invoice / payment reminder — *"Invoice #{{invoiceNumber}} from {{firmName}} - {{invoiceAmount}} due {{dueDate}}"*
11. Tax law update — *"Tax law change that may affect you - {{updateTitle}}"*
12. Extension filed notice — *"Your tax extension has been filed - new deadline {{newDeadline}}"*
13. Annual service renewal

Standard cadence for chasing records, documented across several template vendors: **day 0 request → day 3 reminder → day 7 deadline/options → final "pause or call"**, then escalate to extension.
https://filerequestpro.com/articles/client-follow-up-email-templates
https://www.debits.com/email-templates-missing-tax-documents-clients/

### B. Real INBOUND client phrasing
**[MEASURED — practitioners quoted on record]** Accounting Today, 19 March 2025, "No dumb questions: What tax clients are asking this tax season"
https://www.accountingtoday.com/list/no-dumb-questions-what-tax-clients-are-asking-this-tax-season
Deductibility ("can I claim this?") — all attributed to John Dundon, Taxpayer Advocacy Services, Englewood CO:
- *"Can I claim my wedding as a business expense because I networked with clients there?"*
- *"Can I write off my gym membership because staying healthy helps me work better?"*
- *"Can I write off my streaming subscriptions because I use them to de-stress from work?"*
Deadline anxiety — Manasa Nadig, MN Tax and Business Services:
- *"Will the deadline be pushed out?"*
- *"Will tax season be canceled since the news about IRS layoffs?"*
Status/filing anxiety — John Dundon: *"Should I wait to file to see if the IRS is abolished?"*
Refund mechanics — Andrew Newman, CPA: *"Because of what's going on in Washington, I am no longer comfortable having my refund direct-deposited"*
Morris Armstrong reports clients simply opening with *"What's going on?!!?"* and "unprintable variants".

**The "quick question" genre.** AccountingWEB has a long-running thread titled *"Is it just me or are 'quick' emails from clients becoming a general problem for other practices"*. The opener describes clients increasingly seeking advice by email, *"often beginning with 'just a quick email to ask'"*, and worries about the time and the pressure to give same-day replies, plus *"a misconception among some clients (generally younger ones) that there is no cost involved in email communication."*
https://www.accountingweb.co.uk/any-answers/is-it-just-me-or-are-quick-emails-from-clients-becoming-a-general-problem-for-other

**Document chaos (verbatim, Financial Cents 2025 report):**
- *"Clients sending docs from five different ways became too much to track easily."*
- *"When my client texted me six pages of a bank statement in .jpg format. Turning that into a PDF took forever. I needed a portal."*
- *"Clients didn't respond until I personally emailed them, which was unsustainable."*

### C. Taxonomy table with pre-draftability
**[INFERENCE — my classification, built on the sourced material above]**

| Category | Rough frequency | Answer already exists in… | Pre-draftable? |
|---|---|---|---|
| "Where do we stand on my VAT/moms return / årsrapport?" | Very high, spikes at deadlines | Practice mgmt job status + filing log | **Yes, fully** — status + next action + date |
| Chasing missing records/receipts (outbound) & client replies | Highest volume; #1 named bottleneck (64%) | Open document-request list | **Yes, fully** — the 3-touch cadence is already templated |
| "Have you filed it yet / are we late?" | High at deadline | Filing receipt / submission reference | **Yes, fully** |
| "How much do I owe and when?" | High, seasonal | Computed liability + payment calendar | **Yes, with figure lookup** |
| Payroll queries (net pay, starters/leavers, pension) | High, monthly cadence | Payroll run outputs | **Yes, mostly** |
| Deadline reminders out + "confirm received?" back | Very high, calendarised | Deadline calendar | **Yes, fully** |
| Engagement letter / onboarding admin | Medium, clustered at year start | Engagement templates + signature status | **Yes, fully** |
| Bank/audit confirmation requests | Low–medium, seasonal | Standard letters | **Yes, fully** |
| "Can you send me a copy of X?" | High | Document store | **Yes, fully** |
| "I got this letter from SKAT/VMI/HMRC — what is it?" | Medium, spiky | Firm's own explainer notes | **Yes, as a first draft** — needs human judgement |
| Year-end questions | High seasonal | Prior-year file + firm notes | **Partially** |
| Invoice/fee queries & disputes | Medium | Billing record + engagement scope | **Partially** — tone-sensitive |
| Software access / login problems | Medium, recurring | Firm's own how-to notes | **Yes, fully** |
| Deductibility: "can I claim this?" | High, unpredictable | Firm guidance notes; often genuinely novel | **Draft only — never send without review** |

Note the AccountingWEB practitioner solution that already exists and validates your product shape: members build *"one-page briefing notes to answer general enquiries"*, each ending with *"contact us if you want more detailed advice specific to your circumstances"*, which *"weeds out most general enquiries."*

---

## 3. THE SEASONAL CRUSH

### Hours — best available measured data
**[MEASURED] Distinct Recruitment busy-season survey 2026** — North American tax and audit professionals, fielded May–June 2026; 45% managers, 22% seniors, 22% partners, 11% associates; 69% had 8+ busy seasons behind them.
https://www.distinctrecruitment.com/us/resources/blog/busy-season-2026-trends-in-workload-stress-support-across-public-accounting/
- **78% worked more than 50 hours/week**; 43% at 51–60.
- Managers: 30% at 61–70 hrs, 17% at 71–80. Partners: 9% above 70.
- **57% described busy season as "somewhat or extremely stressful"** — managers 65%, seniors 64%, associates only 17%.
- **Managers rating work-life balance "poor" doubled year-on-year to 52%.**
- Recognition score fell 6.5 → 6.1 overall; seniors fell 5.9 → 4.8.
- Support collapsed: only **41% received practical tools/resources, down from 53%**; perks down from 76% to 61%.
- **The killer stat for your ROI story:** of those given practical tools, **38% found busy season stressful; of those given nothing, 78% did.**

**[MEASURED] Distinct 2025 edition** — 110 tax and audit professionals, North America:
https://www.distinctrecruitment.com/us/resources/blog/busy-season-2025-a-snapshot-of-workload-stress-support-in-public-accounting/
- ~80% worked more than 51 hrs/wk; 48.1% at 51–60; 31.4% above 61.
- Managers 38.4% and partners 20.5% exceeded 70 hrs.
- 54% called it somewhat/extremely stressful; **seniors worst affected at 75% vs associates 22%**.
- Only 26% rated work-life balance good/excellent; **74% said fair or poor**.

### Denmark — hard national statistics (this is your strongest Nordic evidence)
**[MEASURED] FSR – danske revisorer, "Høj arbejdstid i revisorbranchen"**, built by FSR with Epinion on **Danmarks Statistik register data (UDDA + LONN), graduate cohorts 2010–2020**:
https://www.fsr.dk/politik-analyse/analyser-og-surveys/analyser/talenter-i-branchen/hoej-arbejdstid-i-revisorbranchen
- Total annual hours, year 1 after graduation: **1,969 hrs in the audit profession vs 1,845 outside** (cand.merc.aud. graduates specifically: 1,996).
- Among those doing overtime, year 1: **296 overtime hours/year = 5.9 hrs/week**, versus **123 hrs/year = 2.3 hrs/week** outside the profession.
- Still elevated at 10 years: **222 hrs/year (4.4/wk) vs 91 hrs/year (1.8/wk)**.
- *"Det gennemsnitlige antal overarbejdstimer for medarbejdere i revisorbranchen er højere end for medarbejdere uden for revisorbranchen."*

**[MEASURED] FSR attrition analysis** (Danmarks Statistik UDDA + BFL, cohorts 2010–2021):
https://www.fsr.dk/politik-analyse/analyser-og-surveys/analyser/talenter-i-branchen/faerdiguddannede-kandidater-forlader-branchen-efter-endt-uddannelse
- 2010 cohort: **70% in the profession at year 1 → 65% at year 2 → 31% at year 10.**
- 2019 cohort: only **61% at year 1** — a 9pp decline in a decade.
- *"der er en stigende tendens til, at cand.merc.aud.-kandidater fravælger revisorbranchen allerede tidligt i deres karriere"*

**[MEASURED] FSR/Epinion labour-shortage study, published 16 May 2023.** Methodology: 959 people with cand.merc.aud. background (470 inside audit firms, 489 outside; 273 were approved auditors), plus 134 audit firms and 101 client firms, plus qualitative interviews and focus groups.
https://www.fsr.dk/stor-mangel-paa-arbejdskraft-i-revisorbranchen
- **7 out of 10 audit firms have problems attracting approved auditors** (statsautoriserede/registrerede).
- Lone Strøm, then FSR CEO: *"Revisorbranchen er en af de bærende søjler i vores tillidssamfund...Derfor er det et samfundsproblem, når branchen mangler arbejdskraft."*

**[MEASURED] FSR survey on administrative burden (2018):** *"Tre ud af fire revisorer oplever, at de samlede administrative byrder i forbindelse med indberetninger til det offentlige er stigende"* — three out of four auditors experience rising total administrative burden from public-sector reporting, partly attributed to poor IT systems.
https://www.fsr.dk/politik-analyse/analyser-og-surveys/surveys

### Capacity / talent shortage — the growth-blocker framing
**[MEASURED] Advancetrack 2026 Accounting Talent Index** — ~500 accountancy firm leaders across UK, US, Australia, Canada; released June 2026:
https://www.consultancy.uk/news/44502/three-in-four-accounting-firms-struggle-to-take-on-new-work-amid-hiring-challenges
- **73% are turning away potential clients because they lack staff.**
- 73% report a "severe" business impact from talent shortages.
- 45% say the shortage is worse than three years ago (19% "significantly" worse).
- 27% report increased staff stress/anxiety; 28% cite reduced system/process efficiency.
- **74% believe sustained workloads "could push people out of the profession"; over 25% have personally considered leaving.**
- Vipul Sheth, MD: *"Many firms are still struggling to retain experienced people and maintain enough capacity to meet demand."*

**[MEASURED] US pipeline**
- 55,152 accounting bachelor's + master's degrees awarded 2023–24, **down 6.6%** year-on-year: https://www.journalofaccountancy.com/news/2025/oct/the-accounting-graduate-pipeline-where-do-things-stand/
- CPA exam candidates **down more than 30% since 2016**; spring 2025 accounting enrolment 266,506, **+12.4%** and the highest since 2020 (the pipeline is bottoming out, not fixed).
- Counterweight for honesty: 75% of participating public firms expected to hire at least as many new graduates in 2025 as 2024 — https://www.aicpa-cima.com/news/article/accounting-firms-report-strong-hiring-outlook-aicpa-report-finds

### Deadline calendars — Denmark
**[MEASURED]** VAT (moms) frequency is turnover-banded: **<DKK 5m → semi-annual; DKK 5–50m → quarterly; >DKK 50m → monthly.**
- Monthly: due the **25th of the month following** the period.
- Quarterly: due the **1st of the third month after** the quarter (e.g. Q2 2026 → 1 September 2026).
- Semi-annual: **1 March** and **1 September**.
https://dinero.dk/tips/momsfrister/ · https://momsfrister.dk/ · https://regnskab.dk/momsfrister/
**Årsrapport:** due to Erhvervsstyrelsen **no later than 6 months after financial year end** → **30 June** for calendar-year companies. Erhvervsstyrelsen sends reminders to the company's e-Boks and a copy to a management member's private digital mailbox.
https://www.danskrevision.dk/nyheder/hvornaar-skal-aarsrapporten-indsendes-indeholde-2026

**[INFERENCE]** The Danish crush is therefore **bimodal**, not a single US-style "April". Peak 1 = the 1 March / 1 September moms cliff for the mass of small clients. Peak 2 = the 30 June årsrapport wall. A Danish 10–40 person practice hits at least four hard client-facing comms spikes a year, which is a better fit for a subscription than a once-a-year US tax product.

### Deadline calendar — Lithuania
**[MEASURED]**
- **VAT FR0600**: monthly period → file by the **25th of the following month**; semi-annual period available for some taxpayers. VAT registration threshold: **€45,000** of consideration over the last 12 months. https://www.pvmdeklaracija.lt/s2/pvm-deklaracijos-ir-formos/pvm-deklaracijos-forma-fr0600
- **i.SAF invoice registers**: by the **20th** of the following month (example given: January registers by 20 February; January FR0600 by 26 February). https://misija-darbas.lt/pvm-deklaracija/
- **GPM313** (monthly income-paid declaration): by the **15th** of the following month.
- **PLN204** (annual corporate income tax): by **15 June** of the following year for calendar-year taxpayers.
- Error correction rule that generates a lot of client email: if the filing deadline has passed, errors must be fixed **within 10 working days**; VMI notifies discrepancies through EDS **within 2 working days** of submission. https://www.vmi.lt/evmi/aktualus-klausimai-del-pvm-deklaracijos-fr0600-vertinimo
- VMI's own tax calendar tool: https://www.vmi.lt/evmi/mokesčių-kalendorius

**[INFERENCE]** Lithuania's cadence is *monthly and relentless* (20th, 25th, 15th) rather than seasonally spiky. That argues for a different message in LT than in DK: not "survive busy season" but "every single month, the same 40 emails."

---

## 4. EMOTIONAL AND BUSINESS PAIN — IN THEIR OWN WORDS

### Firm owners, verbatim, on why they went looking for a system
All from the Financial Cents 2025 report PDF (816 firm owners) — I extracted these directly from the document, so they are exact:
- **"I was spending so much time sending emails and tracking things, and not getting the paid work done!"**
- **"Client reminder emails were manual and exhausting. Most of my time was spent chasing, not working."**
- **"Clients didn't respond until I personally emailed them, which was unsustainable."**
- **"The moment I asked 'Where is Client X at?' and no one could answer me."**
- **"I dropped the ball on a few clients, or ended up doing things after the fact. It was embarrassing."**
- **"This year-end got away from me—no tracking, no visibility. I knew I needed a system."**
- **"Things were falling through the cracks, and clients and staff were getting annoyed."**
- **"When I realized I was spending time away from my toddler doing admin work. Admin work!"**
- **"When I realized I was spending more time on admin than revenue-generating work."**
- **"I spent more time looking for information than actually completing work."**
- **"The moment I hit 20 clients, everything fell apart. Spreadsheets just couldn't keep up."**
- **"I wanted to grow my firm but felt stuck— like I couldn't scale without a better system."**
- **"Long, long nights updating spreadsheets for internal processes, realizing shit wasn't complete when I expected it to be."**
- **"I attended a conference and saw how easily other firms tracked their workflows. I felt behind."**
(PDF: https://4740670.fs1.hubspotusercontent-na1.net/hubfs/4740670/Workflow%20Automation%20Report-2025-final-2.pdf)

### The "clients treat me like a helpdesk" vocabulary — AccountingWEB (snippet-sourced)
- A member describes the situation as **"It feels almost like a job rather than running a practice."** https://www.accountingweb.co.uk/practice/practice-strategy/practitioners-drowning-in-never-ending-client-emails
- Practitioner "Vallery Lee" admitted to having often thought of leaving the profession and **"applying for a job in supermarket filling shelves"**. https://www.accountingweb.co.uk/practice/general-practice/are-nagging-clients-really-that-unreasonable
- Same article: member "The Innkeeper" describes a client who **emailed Sunday night and by Monday morning was demanding to know why the accountant hadn't responded.**
- Regular poster "FirstTab" confessed his email addiction — **fires off responses as soon as an email lands in his inbox, even after hours.** https://www.accountingweb.co.uk/practice/general-practice/emails-have-blurred-work-life-balance
- The billing workaround, verbatim from a practitioner: **"If it is quick response, can be dealt with in under 5 mins, then I just reply with the answer. If more than that I say it requires further research/investigation. Our cost for dealing with it is £x do you want me to proceed?"**
- The boundary workaround: a member **only replies to emails between 1–2pm and 4–5pm each day** so other work gets done.
- One practice sells a tiered SLA: **same-day or 3-working-day guaranteed replies as a paid "speedy response service"; the free email service is within 10 working days.**
- On free advice: **"listen for free, but charge for solving their problem"** — and the blunt self-diagnosis that if clients get into the habit of emailing rather than looking things up, *it's the practitioner's own fault for fielding their calls for free.* https://www.accountingweb.co.uk/any-answers/never-ending-client-emails-0

### Scope creep specifically via email
AccountingWEB, "How to manage 'scope creep'": **"When your client calls with 'just a quick question,' it's easy to give them an answer there and then, but when you do this, you're giving away your expertise for free."** Recommended script: *"I'll check that and come back to you with the price – is that OK?"*
https://www.accountingweb.co.uk/practice/general-practice/how-to-manage-scope-creep

### The money attached to that pain
**[MEASURED — YouGov fieldwork, commissioned by Ignition]**
US: 506 decision-makers at 1–50 employee accounting/bookkeeping firms, August 2022:
https://www.ignitionapp.com/news/putting-off-awkward-client-conversations-is-costing-accountants-over-76k-each-year
- Out-of-scope work costs firms **$76,636 per year on average**.
- **88% admitted delaying or avoiding awkward client conversations**; 68% cited preserving the relationship.
- **94% chase clients for late payments**; 90% have clients not billed for out-of-scope work, and **43% absorb the cost themselves**.
- 38% wrote off part or all of an invoice in the past 12 months to avoid the conversation; 41% lost potential income.
- **40% report negative impact on personal and staff mental health**; 30% experienced turnover/retention difficulty.

UK: 470 decision-makers at 1–50 employee firms, August 2022:
https://www.ignitionapp.com/news/putting-off-awkward-client-conversations-is-costing-uk-accountants-nearly-70k-each-year
- **£69,957 per firm per year** in unrecovered out-of-scope work (85% affected); £5,830/month average.
- 74% avoid or delay awkward conversations; 62% say chasing late payments is the most awkward.
- 33% write off invoices to dodge the conversation; 33% absorb scope increases.
- **33% report mental-health decline, 30% staff morale loss, 28% staff resentment, 26% staff quitting, 35% lost time with family and friends.**

### The "real work after hours" pattern
**[MEASURED — named CPAs on record]** Journal of Accountancy, 1 May 2017:
https://www.journalofaccountancy.com/issues/2017/may/reduce-stress-and-pressure-at-work/
- Amy West, CPA, CGMA (CFO, AHRC NYC), on working from home 3am–7am: **"That is my prime time. That's when I get the most work done. There are no distractions."**
- Danielle Supkis Cheek, CPA (owner, D. Supkis Cheek PLLC, Houston): **"Since we have a practice where we do a lot of hand-holding with our clients and we pride ourselves on being there for them, their emergency is sometimes our emergency."** She also says **"Having a computer in my purse at all times is probably one of the best productivity tools I've ever seen."**

### Practice-management software reviews — the "cons" (Capterra, verbatim)
Karbon reviews (https://www.capterra.com/p/156181/Karbon/reviews/):
- Dinsusha M., Senior Accountant: con — **"no placeholder available to automatically insert the client's name into the email body"**
- Jenny J., Director: con — **"inability to create email rules or auto-replies in Karbon"**
- Ziggy P., Principal: con — **"Sending emails can be patchy at times and slow at times...waiting for example a Forward email to load"**
- Marni G., CEO: con — **"ability to search emails needs improvement"**
- Bette Hochberger, CPA, CGMA (Karbon's own site): **"My inbox used to be a dumpster fire."** https://karbonhq.com/solution/email-management/
- Sandra Magann, SeaChange Accounting Solutions: **"I'm no longer stuck in my inbox for hours"** https://karbonhq.com/resources/rethinking-email-accounting-firms-are-saving-hours-each-week/

TaxDome reviews (https://www.capterra.com/p/186749/TaxDome/reviews/):
- Veronica M., President, 11–50 employees: **"More professional and customizable invoice emails, better reminder options, signatures, subject lines, and visibility of sent billing communications would also improve the experience."**
- JIll D., Owner: **"I also do not like the workflow I currently have and there are lots of other CRM softwares for bookkeeping that integrate the client questions with the CRM for ease of use."**
- A reported limitation worth noting: TaxDome only syncs emails from clients already in the CRM, so new clients and non-client mail still live in the primary inbox — *"often adds more inbox clutter than reduces it."* (This is TaxDome's competitor Karbon characterising it — treat as **[VENDOR]** competitive claim, but the underlying architecture point is real and worth testing in interviews.) https://taxdome.com/blog/accounting-practice-management-software-with-email-integration

**[INFERENCE]** The vocabulary that keeps recurring: *drowning*, *chasing*, *dumpster fire*, *falling through the cracks*, *dropped the ball*, *embarrassing*, *quick question*, *not getting the paid work done*, *admin work. Admin work!*. Notably **"chasing" and "not working"** appear as an explicit opposition in practitioner language — that antonym pair ("chasing vs working") is probably your best headline construct. I did **not** find the specific phrases "clients treat me like a helpdesk" or "I answer the same ten questions every day" in any accessible source; those are plausible but unevidenced, so don't put them in quotation marks.

---

## 5. STACK AND WORKFLOW

### Outlook / M365 vs Gmail — **I could not verify this, and you should not publish a number**
**[UNVERIFIED]** The claim "a 2024 survey by Karbon found that more than 60% of accounting practices still run on Microsoft 365" circulates widely. I traced it to finlens.app, fetched the page, and confirmed **no source is cited** — the same article makes several other unsourced statistical claims. I could not find any Karbon survey publishing that figure.

What **is** sourced and usable:
- **[MEASURED]** Canopy: **79% of accountants aren't sure their firm could function without email**; email is the most common internal technology tool across firms of all sizes. https://www.getcanopy.com/blog/internal-communication-survey-client-management
- **[MEASURED]** CPA Practice Advisor/Canopy: email is 35.4% of client-communication time and **64% expect it to stay the most-used channel**.
- **[VENDOR, but architecturally informative]** Every major practice-management tool syncs Outlook/Exchange *and* Gmail — Karbon, TaxDome, Financial Cents, Mango, TPS Cloud Axis. Nobody is Outlook-only, which implies a genuinely mixed installed base. https://karbonhq.com/resources/accounting-practice-management-software-with-email-integration/
- **[MEASURED, via Canopy citing Intuit]** Intuit's 2026 Accountant Technology Survey: the average firm uses **10 apps or software programs** to manage clients, documents, workflow, billing and communication; **a third use 11 or more.** https://www.getcanopy.com/blog/canopy-vs-taxdome/

**Recommendation:** run a quick LinkedIn Sales Navigator / BuiltWith-style MX-record check on 200 Danish and 200 Lithuanian firms in the 10–40 band and generate your own number. It's a cheap, defensible, ownable stat and there is clearly a gap in the public record.

### Shared mailboxes vs individual
**[VENDOR — but concrete product evidence]** Karbon sells "Shared Triage" explicitly for **shared inboxes like `info@` or `tax@`**, at a per-inbox monthly fee, with assignment, internal comments and @mentions. Its pitch is that *"client email stops living in individual inboxes and becomes something the whole firm can see and act on."*
https://karbonhq.com/solution/email-management/ · https://karbonhq.com/feature/shared-inbox/
Xenett similarly sells firm-wide shared inboxes (e.g. `accounts@yourfirm.com`). Best-practice guidance in this category stresses that *"unassigned emails should not be left in a shared inbox, as everyone assumes someone else will handle it."*
**[INFERENCE]** The existence of a paid, per-inbox shared-triage SKU at the category leader is strong evidence that **both patterns coexist**: a generic `info@`/`kontakt@` front door plus individual mailboxes where the actual client relationships live. Your product almost certainly needs to work in an individual mailbox first (that's where the writer's voice and the client relationship are), with shared-mailbox support as a fast follow.

### Client portals — do clients ignore them?
- **[MEASURED]** CPA Practice Advisor/Canopy: client portals rank 5th in tool importance at 64%, behind tax prep software 88%, document storage 71%, GL 70%, payroll 69%. **Only 37% predict increased portal use, versus 64% who expect email to remain dominant.**
- **[VENDOR/SPONSORED — treat with care]** An AccountingWEB "industry insights" (i.e. sponsored) piece claims 75% of clients want one platform, 90% of clients who log into the portal return rather than reverting to email, and using the client app even once reduces long-term portal inactivity 6x. https://www.accountingweb.co.uk/community/industry-insights/why-client-communication-is-still-the-biggest-challenge-for-accounting
- **[VENDOR]** "Roughly 8 to 12% of clients prefer email permanently" (ustechautomations.com) — no methodology, don't use.
- **[MEASURED, verbatim from a firm owner]** Financial Cents: **"When a client submitted documents via the portal for the first time without me chasing—it was life-changing."** The fact that this is described as life-changing tells you the baseline.

**[INFERENCE]** This is one of your strongest positioning arguments. A decade of portal投资 has not displaced email — 64% of practitioners themselves expect email to stay dominant. Your product accepts that reality instead of fighting it, which is the opposite of every incumbent's bet.

### Who drafts, who reviews — **this is the critical finding for you**
**[SECONDARY, widely described, not survey-measured]** The canonical small-firm workflow: a junior/bookkeeper receives documents, reconciles, categorises, prepares draft financials and **marks the work ready for review**; a manager or partner is notified, opens it, **leaves specific comments on items needing correction, and either approves or sends it back**; the junior addresses comments and resubmits; only then does it go to the client.
https://www.xenett.com/blog/workflow-in-accounting

**[MEASURED] It already extends to email.** Financial Cents 2026 State of AI (486 North American professionals, 15 July–7 Aug 2026; **68% at 2–30 person firms**; 68% owners/partners): **75% already use AI to draft client emails and communications** — the single most common AI use case in the profession. And a managing partner in the same report describes mandatory verification: *"Catch errors before they reach client deliverables through mandatory verification of every AI-produced figure."*
https://financial-cents.com/resources/guides/the-state-of-ai-in-bookkeeping-accounting/

**[INFERENCE]** Your product is not asking firms to adopt a new workflow. **Draft → review → send is already the firm's native operating rhythm**, for both work papers and (increasingly) email. The pitch writes itself: *"a junior who drafts, and never sends."* The review step is not friction you have to apologise for — it's the exact shape of the thing they already trust.

### Denmark — local stack
**[VENDOR figures]** e-conomic (Visma): *"more than 250,000"* / *"280,000"* Danish businesses (company's own marketing). Dinero: 110,000+ registered businesses. Visma owns both (e-conomic acquired 2015, Dinero later). Uniconta / Visma.net / Business Central serve larger/ERP needs; Billy and Dinero skew to one-person businesses.
https://www.e-conomic.dk/bogfoeringsprogram · https://via.ritzau.dk/pressemeddelelse/9121084/visma-kober-regnskabsprogrammet-dinero
**[MEASURED] Market size:** Danmarks Statistik's survey population for branch **DB07 69.20.00 (Bogføring, revision og skatterådgivning)** was **~4,779 businesses in 2022**, restricted to those with 5+ full-time employees; eStatistik counts **8,428 businesses** in the branch overall. https://www.dst.dk/da/Statistik/dokumentation/statistikdokumentation/bogfoering--revision-og-skatteraadgivning/indhold · https://estatistik.dk/branche/bogfoering-og-revision-skatteraadgivning/692000
Separately, Dansk Brancheanalyse reports **206 revisionsvirksomheder** turning over **DKK 23.04bn** in 2024/25 (+5.7%), with net profit DKK 1.003bn and 189 net jobs added — this is the larger-audit-firm subset, not the whole bookkeeping market. https://danskbrancheanalyse.dk/revisionsbranchen/
Also relevant: Erhvervsstyrelsen sends årsrapport reminders to the company's e-Boks **and** a copy to a management member's private digital mailbox — which reliably generates a "what is this letter?" email wave into the practice.

### Lithuania — local stack
**[WEAK METHODOLOGY — flag if used]** apskaitosmokykla.lt compiled rankings from *job postings, business news, IT vendor reports and student internship placements* (explicitly not a survey): **Rivilė GAMA ~one-third of Lithuanian companies**; **Finvalda >20,000 companies**; then Stekas (SME focus), Site.pro, MS Dynamics NAV/365 BC (larger), SAP (top end); niche: Pragma, Centas, Apskaita5, Būtent. Cloud entrants like **B1.lt** growing among small businesses.
https://www.apskaitosmokykla.lt/izvalgos-141/kokias-buhalterines-apskaitos-programas-renkasi-lietuvos-imones-606
**[MEASURED-ish]** Lithuanian accounting-service firms' own stated SLA norm: phone answered immediately, **email within a few hours, at most one business day**. (From a Lithuanian practice-management training description — https://www.countline.lt/renginys/apskaitos-imoniu-veiklos-ypatumai-prievoles-ir-darbo-specifika/)
Scale marker: buhalteres.lt reports **1,300+ clients and 78 senior accountants**; the largest LT accounting-service firms by 2023 revenue (Meso group, Tezaurus konsultacijos, Finansista, Finarenta, Finansų biuras, Audikom, Main Financial Solutions, Finteisa, FINOLTA, Konta LT) sit between **€0.27m and €1.4m annual revenue** — i.e. **your 10–40 staff target is near the top of the Lithuanian market, not the middle.** https://infocloud.lt/didziausios-buhalterines-apskaitos-paslaugu-imones-lietuvoje/
**[INFERENCE]** That has pricing consequences. A €1.4m-revenue LT firm cannot absorb US/UK-level SaaS per-seat pricing. Denmark and UK/IE are your price-anchoring markets; Lithuania is a volume/land-grab market or needs a lower tier.

---

## 6. WHO BUYS, AND WHAT TRIGGERS A PURCHASE

### Titles
**[MEASURED]** Financial Cents 2026 State of AI respondent roles: **68% owners/partners, 19% service-line leaders, 6% admins, 5% operations leaders.** In this segment the buyer, the user and the economic decision-maker are usually the same person.
https://financial-cents.com/resources/guides/the-state-of-ai-in-bookkeeping-accounting/

### Trigger events — verbatim, in the buyers' own words
These are drawn from the Financial Cents 2025 report's "what made you go looking" section, which is effectively a free trigger-event dataset:

| Trigger | Verbatim |
|---|---|
| **Missed deadline / dropped ball** | *"I dropped the ball on a few clients, or ended up doing things after the fact. It was embarrassing."* |
| **A bad year-end / "never again"** | *"This year-end got away from me—no tracking, no visibility. I knew I needed a system."* |
| **Growth without headcount** | *"The moment I hit 20 clients, everything fell apart. Spreadsheets just couldn't keep up."* / *"We needed automation when we took on more corporate and bookkeeping clients. It was too much to track manually."* |
| **Capacity cap on growth** | *"I wanted to grow my firm but felt stuck— like I couldn't scale without a better system."* |
| **Client complaint / client + staff friction** | *"Things were falling through the cracks, and clients and staff were getting annoyed."* / *"Clients were frustrated because we had no visibility, and everything felt like a guessing game."* |
| **Loss of oversight (proxy for losing a bookkeeper mid-season)** | *"The moment I asked 'Where is Client X at?' and no one could answer me."* |
| **Personal cost / burnout** | *"When I realized I was spending time away from my toddler doing admin work. Admin work!"* |
| **Peer comparison** | *"I attended a conference and saw how easily other firms tracked their workflows. I felt behind."* / *"Talking with bigger, more successful firms about how they got to where they are."* |

### Structural triggers with hard numbers
- **Can't hire → turning away revenue:** 73% of firms turn away potential clients for lack of staff (Advancetrack, ~500 leaders, 2026). This is the single most purchase-relevant stat in the whole report: the buyer already has demand they cannot serve, so "more capacity without headcount" is a revenue pitch, not a cost pitch.
- **Firm capacity is a named top-3 challenge (39.8%)**; recruiting talent 21.2% (Financial Cents 2025).
- **Unfilled roles in DK:** 7 in 10 Danish audit firms struggle to attract approved auditors (FSR/Epinion 2023).
- **January/February "never again":** the Distinct data shows the moment — managers rating work-life balance "poor" **doubled to 52%** in one year, and firms cut practical support from 53% to 41%. **[INFERENCE]** The post-busy-season window (Denmark: March and July; US/UK: April/May) is when the emotional purchase authorisation exists.
- Financial Cents 2025 also notes some firms **"reported losing clients due to workflow"** problems — churn as a trigger.

**[INFERENCE] Buying committee reality at 10–40 staff:** managing partner / practice owner signs; an operations or practice manager runs the evaluation; a senior manager is the champion because they are the ones at 61–80 hours. The person whose pain is worst (manager/senior, per Distinct: 65%/64% high stress vs 17% for associates) is *not* usually the signer — build the business case for the partner, but the emotional case for the manager.

---

## 7. OBJECTIONS — and the actual documents behind them

### A. Professional-body guidance (the real, citable documents)

**ACCA — "AI (Artificial Intelligence) in the Finance Profession", August 2023.** I extracted the PDF text directly, so these are exact:
https://www.accaglobal.com/content/dam/ACCA_Global/professional-insights/PI-AI-ACCA-POSITION%20v2.pdf
- **"Accountability rests at the heart of the accounting and [finance profession]"** — and effective accountability now *"requires a level of AI"* literacy.
- On hallucination: **"Inaccuracy and Misinformation: AI systems are fundamentally probabilistic... One example is known as AI hallucinations, where AI systems confidently assert claims that are simply untrue."**
- On liability — this is the sentence that lives in every risk partner's head: **"The question of liability in AI is a significant challenge. When an AI system makes a mistake, who is to blame? Is it the developer, the user, or the machine itself? These unresolved questions pose a significant risk for organisations using AI."**
- On scale of error: **"The Magnification Effect: ... While human workers might make a handful of mistakes daily, a bot handling vastly more amounts of data could substantially amplify any single error. Therefore, robust testing, validation, and monitoring processes can help..."**
- On data: **"Privacy Concerns and Security Risks... Data protection regulations and secure data handling practices are crucial to mitigate these privacy risks."**

**ICAEW.** ⚠️ ICAEW's article bodies are JavaScript-rendered and I could not retrieve verbatim text from the primary pages through any route. The following is **[SECONDARY]** — a specialist guide that cites the ICAEW primary URL; verify verbatim before quoting:
https://www.thefirm.media/articles/ai-uk-accounting-practices-guide/ citing https://www.icaew.com/technical/technology/artificial-intelligence/generative-ai-guide
- ICAEW advises practitioners **should not enter confidential information or personal data into generative AI tools**, warning this may breach data-protection obligations or duties of confidentiality owed to third parties.
- ICAEW requires practitioners to **apply professional scepticism, cross-check outputs against reliable sources, and pose questions multiple times** (because models rarely repeat identical errors).
- Firms must **write a clear AI policy reflecting actual staff usage, train on responsible use, and identify which tools staff are already using.**
- Also reported (verify): ICAEW has updated **PCRT (Professional Conduct in Relation to Taxation)** to address AI in tax work, and is bringing **IESBA Code of Ethics technology provisions** into the ICAEW Code of Ethics, focused on professional competence, due care and confidentiality. ICAEW's framing: *"AI should be viewed as an assistant, not an authority."* https://www.icaew.com/technical/practice-resources/practice-news/ai-and-accountants · https://www.icaew.com/technical/technology/artificial-intelligence/managing-risks

**AICPA / US.** The hard rule is the **Confidential Client Information Rule (ET §1.700.001)**: consent is required before a CPA discloses confidential client information, and **submitting client data to a third-party AI platform is a form of disclosure.** Journal of Accountancy, 1 April 2025, by J. Michael Reese, J.D., LL.M., risk consulting director at **CNA** (underwriter of the AICPA member insurance programme) — so this is effectively the PI insurer talking:
https://www.journalofaccountancy.com/issues/2025/apr/should-i-disclose-my-use-of-gen-ai-to-clients/
- **"The current legal environment is disjointed, and no specific federal law or professional standard applicable to CPAs mandates disclosure when generative AI is used or if client data is used within it."**
- But: **California and Utah have enacted state-level disclosure requirements**; GLBA applies to CPA firms as financial institutions; tax preparers must comply with SSTS §1.3 Data Protection.
- On engagement letters, quoting ABA guidance: **"merely adding general, boiler-plate provisions to engagement letters purporting to authorize the lawyer to use generative AI is not sufficient."**
- Voluntary disclosure **"can engender a client's trust."**

**FSR – danske revisorer (Denmark).** FSR has published AI guides for members and runs an **AI Advisory Board**. Its stated position: AI should be applied *responsibly, with sufficient human involvement, within professional, ethical and regulatory frameworks*; it advocates **AI governance and internal control**, documentation of design, implementation and monitoring of controls addressing significant AI risks, and independent assurance using **ISAE 3000**. It runs a course "AI i revision" covering the audit firm's own AI use, internal policies, governance, quality assurance, data protection, model management, bias and competence requirements.
https://www.fsr.dk/fagligt/ai-og-digitalisering · https://www.fsr.dk/fagligt/ai-og-digitalisering/ai-advisory-board · https://www.fsr.dk/uddannelse-events/alle-vores-kurser/ai-i-revision-forstaaelse-anvendelse-og-compliance-i-praksis
Earlier FSR framing (Ulrich Haase Nielsen, Chef for Strategic Member Services & Education, 12 June 2024): AI *"har et enormt potentiale og giver et utal af muligheder"*, while flagging *"faldgruber, etiske og moralske spørgsmål og ny kommende regulering"* and GDPR/data security. https://www.fsr.dk/work-smarter-not-harder-revisorbranchens-interesse-for-ai-er-enorm-1

### B. GDPR / EU AI Act (the EU-specific objection, which matters more in DK/LT than in the US)
**[SECONDARY, citing ICO primary]** https://www.thefirm.media/articles/ai-uk-accounting-practices-guide/ citing https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/
- The **firm is the data controller** for client names, ID numbers, payroll records, director details — responsibility does not transfer to the AI vendor.
- Using an AI tool on personal data requires a **written processor agreement** specifying processing, security and deletion. **Free consumer tools typically lack a DPA; enterprise tools generally provide one with no-training commitments.**
- A **DPIA is mandatory** before deployment where processing is likely to result in high risk.
- Many AI vendors process in the US — workable with proper transfer mechanisms, but requires explicit vendor confirmation.
- The **EU AI Act does not replace GDPR; it complements it.** https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai

### C. Measured objection weights — how much each actually matters
**[MEASURED]** Financial Cents 2026 State of AI (486 NA professionals, 68% at 2–30 person firms, July–Aug 2026):
| Barrier | % |
|---|---|
| Accuracy / trust in outputs | 26% |
| Data security & confidentiality | 22% |
| Don't know where to start | 17% |
| No time to learn/implement | 11% |
| Leadership unconvinced | 6% |
| Regulatory uncertainty | 6% |
| Cost | 3% |
- **38% named AI's "confident wrongness"** — plausible but inaccurate answers — as their primary worry.
- **87% of AI-using firms have no formal written AI policy; 23% have no plans to create one.**
- Client-data handling: 16% never input client data into AI; 14% redact/anonymise first; 9% require vendor controls (SOC 2, no-training clauses); **15% have no process at all.**
- **Only 3% of firms protecting data include client consent in engagement letters.**
- **Only 18% say clients expect them to use AI.**
- Verbatim: **"Just because it confidently did the task correctly one time doesn't mean it won't do it confidently wrong next."** (solo practitioner) and **"The liability always stays with the human."** (firm owner)
- **Only 19% trust AI enough to use with limited review; 52% actively disagree that they'd trust AI without close oversight; 90% agree human judgment matters *more*, not less, as AI spreads.**

Cross-checks: Karbon 2025 — **70% expressed concerns about data security**. Karbon 2026 — **only 21% of firms have an AI policy or documented strategy; 83% report growing data security awareness.** (Both **[VENDOR]** — see §8.) Accountancy Age (12 Aug 2026) reports **only ~20% of UK practices have a formal AI strategy**, citing Wolters Kluwer's 2025 Future Ready Accountant Report. https://accountancyage.com/2026/08/12/the-uncomfortable-truth-about-ai-in-accountancy/

### D. PI insurance — real, but the sourcing is thin
**[INDUSTRY COMMENTARY, not regulation — label clearly]** Broker/advisory commentary reports that insurers are moving away from "silent AI" (a policy that neither promised nor refused cover) toward **explicit underwriting questions, exclusions and endorsements**, and that some policies now require **mandatory disclosure of AI use in professional workflows** — with non-disclosure of a material change in operations described as "the fastest way to lose a claim."
https://goodtransformer.ai/insights/ai-professional-indemnity-insurance/
Context: PII is **compulsory for all ICAEW members holding a practising certificate and engaging in public practice** (https://www.icaew.com/regulation/professional-indemnity-insurance), and ACCA's PII Regulations took effect 1 September 2023 (https://www.accaglobal.com/content/dam/ACCA_Global/Members/members-in-practice/members-in-practice/Professional-indemnity-insurance-requirements.pdf).
**[INFERENCE]** I found **no** published insurer document stating that AI-assisted *email drafting with mandatory human review* triggers an exclusion. The exposure the market is actually pricing is autonomous or unreviewed AI output. That is a genuinely defensible line for you — but get it in writing from an insurer or broker before you claim it in marketing.

### E. Staff fear and the "clients pay for a human" objection
- **[MEASURED, named source]** Grace Mold, University of Bath, in Accountancy Age: AI *"designed to feel human creates conditions: trust in a system that doesn't know what it's doing"* — the concern being **junior accountants skipping verification when outputs look credible**, eroding skill development. Same article flags **"shadow AI"**: staff covertly using unsecured public tools on sensitive work.
- **[MEASURED]** Harry Lang, MD, The Oxford AI School: **"Main concerns revolve around data and security, but these can be easily mitigated by setting an AI Policy"** — i.e. the stated remedy is a policy document, which 87% of firms don't have. **[INFERENCE] Shipping a ready-made AI policy template with the product removes a named objection at near-zero cost.**
- **[MEASURED]** Counter-evidence for the "clients pay for a human" fear: only **18%** of firms say clients expect them to use AI (Financial Cents 2026) — but Karbon 2026 **[VENDOR]** reports **82%** say AI positively impacts collaboration, communication and client relationships, and **91%** believe graduates are more likely to join firms actively using AI. Recruitment, not client preference, may be the stronger counter-argument.
- **[MEASURED]** Security baseline (CPA Practice Advisor/Canopy 2024): 99% consider online security important, 92% "very important"; 15% have experienced a breach; top cause clicking wrong links (26%), then ransomware (14%). 29% of affected firms lost under $100k; 11% lost $500k–$999k; 3% over $5m; 17% suffered reputational damage with no direct financial loss. **And 51% of firms already prohibit clients from emailing sensitive information** — expect "why would we add AI to the channel we're already trying to lock down?"

### F. Previous AI disappointment
**[SECONDARY — verify]** Accountancy Age reports a **"95% failure rate in AI pilots"** figure cited at Accountex London 2026. Widely repeated industry number with contested provenance — **do not publish without tracing the primary.**
Also from that article, Pac O'Shea (CEO, Round): real gains are in *"matching invoices, reconciling across banks, routing approvals"* rather than dashboards — i.e. a prior belief that AI pays off in back-office plumbing, not client-facing work. **[INFERENCE]** You are selling into that bias and will need to overturn it; the 75%-already-draft-emails stat is your best lever.

---

## 8. WHAT ACCOUNTING FIRMS ALREADY ACCEPT ABOUT AI

**This is the strongest finding in the whole project, and it's very good news for you.**

**[MEASURED] Financial Cents, 2026 State of AI in Bookkeeping & Accounting — 486 North American professionals, fielded 15 July–7 Aug 2026; 68% at 2–30 person firms, 27% solo; 68% owners/partners.**
https://financial-cents.com/resources/guides/the-state-of-ai-in-bookkeeping-accounting/
- **95% have adopted or are exploring AI**; only 5% are not using it. Breakdown: 11% "Running" (embedded firm-wide), 36% "Walking" (regular, defined tasks), 31% "Crawling" (informal), 5% none.
- **Top three uses are all communication, and #1 is exactly your product:**
  1. **Draft client emails and communications — 75%**
  2. Summarize documents or meetings — 71%
  3. Research / answer technical questions — 69%
  - By contrast: bank reconciliation 24%, tax return prep 9%.
- Time saved: 54% save ≤3 hrs/week; 15% save 7+ hrs/week; 13% can't quantify it.
- ROI: 20% report clear measurable ROI; 52% see promising but unquantifiable value; 25% too early; 4% no payoff.
- **The line they will not cross:** only **19% trust AI enough to use with limited review**; **52% disagree** they'd trust AI without close oversight; **90% agree human judgment matters more, not less.** The report's own conclusion: human review is treated as a **permanent design requirement, not a temporary guardrail firms will eventually eliminate.**

**[VENDOR — methodology partially disclosed] Karbon State of AI in Accounting 2025** — 500+ accounting professionals across six continents, released 19 Feb 2025:
https://www.globenewswire.com/news-release/2025/02/19/3028809/0/en/Karbon-State-of-AI-in-Accounting-2025-Report-Reveals-Competitive-Advantage-for-Firms-Embracing-AI
- **Drafting emails: 63%** (#1 use case), meeting summaries 40%, financial analysis/research 13%.
- 18 hours saved per employee per month by automating routine communications tasks. 85% optimistic; 79% believe AI adoption helps attract and retain talent; 70% have data-security concerns.

**[VENDOR] Karbon State of AI in Accounting 2026** — ~600 professionals, six continents, released 20 Jan 2026:
https://karbonhq.com/resources/state-of-ai-accounting-2026/
- **98% of firms now use AI**, a majority daily or several times daily; 60 min/day saved per employee (+7% YoY, ~21 hrs/month); **only 21% have an AI policy or documented strategy**; 82% say AI positively impacts collaboration, communication and client relationships.
- Note: Karbon sells AI email features, so the email-drafting finding is self-serving. It is nonetheless **independently corroborated** by Financial Cents (75%) and directionally by CPA Practice Advisor/Canopy — that triangulation is what makes it publishable.

**[MEASURED] Thomson Reuters, Future of Professionals 2025** — 2,275 responses, February–March 2025, across legal/risk/compliance/tax/accounting/audit/trade; **594 in the tax, audit, trade & accounting segment** (462 of them at firms). Tax-firm size distribution in the sample: **19% 1–3 employees, 33% 4–29, the remainder 30+** — a good fit for your target band.
https://www.thomsonreuters.com/content/dam/ewp-m/documents/thomsonreuters/en/pdf/reports/future-of-professionals-report-2025.pdf
- Anticipated AI savings: **5 hours per week / 240 hours per year** (up from 200 in 2024).
- 53% believe their organisation is already experiencing at least one benefit from AI adoption.

**[MEASURED] Thomson Reuters, Generative AI in Professional Services 2025:**
https://www.thomsonreuters.com/en/press-releases/2025/april/from-incubation-to-integration-generative-ai-adoption-nearly-doubles-as-professional-services-reach-crossroads
- **Tax firms' enterprise GenAI adoption nearly tripled, 8% (2024) → 21% (2025)** — note the gap between *individual* use (near-universal) and *sanctioned enterprise* deployment (one in five).
- **71% of tax professionals now believe GenAI should be applied to daily work, up from 52% in 2024.**
- Top use cases: tax research 77%, return preparation 63%, tax advisory 62%.
- **Only 14% of respondents say their firm has a comprehensive AI strategy**; 61% already see ROI from early initiatives.

**[MEASURED] CPA Practice Advisor/Canopy, June 2024 (the useful baseline for how fast this moved):** 52% were not using AI at all; **34% were using AI for writing tasks** (already the #1 use); 80% anticipated using more AI within 3–5 years.

### Where the line is — synthesised
**[INFERENCE]** Putting the measured sources together, the profession has already settled on a norm, and your product sits exactly on the accepted side of it:

| Already accepted | Contested | Rejected |
|---|---|---|
| AI drafting client emails (75% / 63% doing it) | Putting identifiable client data into AI without vendor controls (only 9% require SOC 2 / no-training today) | AI sending anything without a human |
| AI summarising documents and meetings (71%) | Disclosing AI use to clients (no legal requirement in most places; only 3% cover it in engagement letters) | AI giving final tax advice unreviewed |
| AI for research/first-pass technical answers (69%) | Firm-wide sanctioned deployment (only 21% of tax firms) | AI whose output isn't verifiable against source |
| Human review as permanent (90% say judgment matters more) | Written AI policy (87% have none) | — |

**How hard do you have to push?** Barely at all on the *concept* — three-quarters of your target market is already doing exactly this, badly, by pasting into ChatGPT. You are not selling a new behaviour; you are selling **the governed version of a behaviour they've already adopted ungoverned.** The "shadow AI" problem named in Accountancy Age is your wedge: the partner's real fear is not that staff will use AI, it's that they already are, in a public tool, with client data, with no policy (87%) and no record.

---

## 9. WHAT I'D FLAG BEFORE YOU PUBLISH ANYTHING

**Do not use without re-sourcing:**
1. Karbon's "100–200 emails/day, 24 hours/week" — confirmed no methodology.
2. "60% of accounting practices run on Microsoft 365 (Karbon 2024)" — confirmed unsourced SEO content.
3. "AICPA: 17% of an accountant's time is non-billable" — untraceable.
4. "3.8 hours weekly to meeting admin / £78,000 per accountant" — vendor blog.
5. "Randstad: 5 interruptions/day, 9 hours lost per week" — untraceable.
6. "95% of AI pilots fail" — contested provenance.
7. Any portal-adoption stat from AccountingWEB "industry insights" (sponsored) or ustechautomations.

**Safest headline stats, in order of strength:**
1. **64%** of firm owners name "chasing clients for information" as their #1 workflow challenge (Financial Cents, 816 owners).
2. **75%** already use AI to draft client emails — the profession's single most common AI use (Financial Cents, 486 professionals, 2026), corroborated by Karbon's 63%.
3. **73%** of firms turn away clients because they lack staff (Advancetrack, ~500 leaders, 2026).
4. **9.3 hours/week** on client communication, of which **35.4%** is email; practitioners themselves want it down to 7.2 (CPA Practice Advisor/Canopy, 240 professionals).
5. **90%** say human judgment matters more, not less, as AI spreads; only **19%** would use AI with limited review (Financial Cents 2026) — your never-auto-sends design is the majority position, not a compromise.
6. Denmark: auditors doing overtime log **296 hours/year (5.9/week) vs 123 (2.3)** outside the profession, and only **31%** of a graduating cohort is still in the profession ten years later (FSR on Danmarks Statistik register data).

**Biggest remaining research gaps I could not close:**
- No independent measurement of **emails per day** in an accounting practice anywhere in the public record. This is a genuine white space — a 30-firm mailbox audit would give you an ownable, quotable number and would be worth more than everything above.
- No Outlook/M365 vs Gmail penetration data for accounting firms. Same recommendation: measure it yourself via MX records.
- No Danish or Lithuanian data at all on email volume, client-communication hours, or AI adoption in practices. Danish evidence exists for hours, attrition and shortage; Lithuanian evidence is essentially absent beyond deadlines, software and firm sizes.
- No Reddit/Glassdoor voice-of-customer (hard-blocked). If you want that register of language, it needs a manual pass or a different tool.
