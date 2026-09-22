/**
 * Renders the entire <LocalePage /> for each locale in jsdom and reports what
 * came out, so "all three locales render, with no missing keys and no English
 * leaking into /da or /lt" is a measured claim rather than a hope.
 *
 * WHAT IT NO LONGER MEASURES.
 *
 * It also measured the price band, the calculator and the fit-check form: the
 * flat firm fee and the setup fee assembled out of the offer and the copy, the
 * two package cards driven by their ids, the founding cohort's counter in both
 * of its states, the calculator walked across a grid of its four controls with
 * every figure on the panel set against what value.ts computed, and the form
 * walked over both of its screens counting its six questions. All three
 * sections are deleted, and every one of those measurements went with them
 * rather than being pointed at something nearby. A measurement that has lost
 * its subject and is kept anyway is the thing this repository has been bitten
 * by twice.
 *
 * What is left is the page-level claim, which still has a subject: the head a
 * crawler and a link unfurler read, the sections that remain and their order,
 * the audience folders against the worked example's desks, the mark, and the
 * copy. This file does the measuring and the deriving; verify-payload.mjs does
 * the asserting.
 */
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LocalePage } from '../src/LocalePage';
import { MARK_BOWL, MARK_STEM } from '../src/components/Hero';
import { content, pathFor } from '../src/content';
import type { Locale } from '../src/lib/types';
import { formatCount } from '../src/lib/offer';
import { VALUE } from '../src/lib/value';

/* The page as it stands: hero, the worked example, who it is for. The price
   band, the calculator and the fit check are gone with the sales call they
   were built for, and what replaces them below the audience folders is the
   trial section, which is not built yet. The order below is the document order
   the page is asserted to have, not just a set of ids. */
const SECTION_IDS = ['hero', 'demo', 'who'];

/** Every leaf string in a content object, so a blank key is caught. */
function leaves(value: unknown, path = '', out: Array<[string, string]> = []): Array<[string, string]> {
  if (typeof value === 'string') out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => leaves(v, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) leaves(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

(globalThis as unknown as { __RUN_PAGE__: () => Promise<void> }).__RUN_PAGE__ = async () => {
  const results: Array<Record<string, unknown>> = [];

  for (const locale of ['en', 'da', 'lt'] as Locale[]) {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);

    let crashed: string | null = null;
    try {
      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={[pathFor(locale)]}>
            <LocalePage locale={locale} />
          </MemoryRouter>,
        );
      });
    } catch (err) {
      crashed = err instanceof Error ? err.message : String(err);
    }

    const text = host.textContent ?? '';
    const c = content[locale];

    /* A count, in the language it is read in. The same formatter the worked
       example's close uses, so an expectation built here is assembled exactly
       the way the component assembles it: Danish and Lithuanian write the
       decimal with a comma and each groups thousands its own way, and an
       expectation built in English would fail on every grouped figure. */
    const figure = (value: number): string => formatCount(value, c.htmlLang);

    /* Empty or whitespace-only strings anywhere in the locale file. */
    const blankKeys = leaves(c)
      .filter(([k, v]) => v.trim() === '' && !k.startsWith('footer.company') && k !== 'nativeCheck')
      .map(([k]) => k);

    /* Every visible string that should appear in the DOM. Placeholders and
       meta are excluded, and so is everything under `trial`: that copy exists
       and is complete in all three languages, and nothing renders it yet.
       Asserting it here would fail honestly today and, worse, would have to be
       deleted again by whoever builds the section. Whole strings only:
       anything with a slot in it for a figure is asserted further down,
       assembled, because half a sentence proves nothing when the other half
       comes from a data module. */
    const mustAppear = [
      c.hero.title.mark, c.nav.cta,
      /* Where it is installed, under the button. It answers the question a
         firm asks before it asks the price, so it is not decoration that can
         quietly fall off the hero. */
      c.hero.setup,
      c.hero.deal.subject,
      c.demo.title, c.demo.lede, c.demo.pickLead,
      /* The close carries the minutes from value.ts now, so its two halves
         are what reach the DOM; the assembled sentence is asserted below. */
      c.demo.close.before, c.demo.close.mark, c.demo.close.markEnd, c.demo.close.after,
      ...c.demo.desks.map((d) => d.tab),
      /* only the first desk's paper is on the page at rest; the other two are
         one click away and are covered by the browser run instead. */
      c.demo.desks[0].letter.from, c.demo.desks[0].letter.subject,
      ...c.demo.desks[0].sources.map((x) => x.label),
      c.who.title, ...c.who.groups.map((g) => g.line),
      /* The accuracy block. Asserted line by line because it is the answer to
         the objection that decides a regulated sale, and a block that quietly
         stopped rendering would look like nothing at all. */
      c.who.accuracy.title, ...c.who.accuracy.items,
      c.footer.tagline, c.footer.privacyLink, c.footer.officeLabel,
    ];
    const missing = mustAppear.filter((s) => !text.includes(s));

    /* The lines where the copy and a data module meet. Each one is the content
       fragments and the module's own figure, concatenated in the order the
       component lays them out, so it can only be satisfied if the figure
       actually reached the slot the sentence left for it. Two are left: the
       rest met the offer, and the offer's figures are gone. */
    const assembled: Array<[string, string]> = [
      /* The headline. It grew a slot when it started promising an outcome
         rather than describing a mechanism, and the hour in that slot is the
         whole promise: forty replies drafted, by then. A headline that lost it
         would still read as a sentence, which is why presence of the words is
         not enough on its own. */
      [
        'the headline, with the hour the work is finished by',
        c.hero.title.before + c.hero.title.mark + c.hero.title.mid + c.hero.clockOut +
          c.hero.title.after,
      ],
      /* The worked example's close, with the minutes it says nobody spent.
         The figure was typed into the sentence as a word until 2026-09-19,
         and it disagreed with the assumption every other figure on the page
         was computed from: the demo said nine minutes, value.ts said five.
         Asserted assembled so the two cannot drift apart again in silence.
         It is the last thing reading from value.ts, and the only reason that
         file still exists. */
      [
        'the worked example, with the minutes nobody spent',
        c.demo.close.before + c.demo.close.mark + figure(VALUE.minutesFromScratch.value) +
          c.demo.close.markEnd + c.demo.close.after,
      ],
    ];
    const unassembled = assembled.filter(([, s]) => !text.includes(s)).map(([label]) => label);

    /* English master strings that must NOT appear on /da or /lt. Compared only
       where the two locales genuinely differ, because a good deal of what is on
       this page is the same string in all three and none of it is a leak.

       Three kinds of shared token. Names somebody else owns: "Outlook",
       "Gmail", "doviloop.dev". Marks and dates. And figures, none of which is
       a word. None of them belongs in the list below; the list is master copy,
       and the filter drops anything the target locale happens to share. */
    const en = content.en;
    const englishOnly = [
      en.hero.title.mark, en.nav.cta, en.demo.title, en.demo.pickLead,
      en.who.title, en.who.accuracy.title, ...en.who.accuracy.items,
      en.hero.setup,
      ...en.demo.desks.map((d) => d.tab),
      ...en.demo.desks[0].sources.map((x) => x.label),
      ...en.who.groups.map((g) => g.line),
      en.footer.tagline,
    ].filter((s) => !leaves(c).some(([, v]) => v === s));
    const leaked = locale === 'en' ? [] : englishOnly.filter((s) => text.includes(s));

    results.push({
      locale,
      crashed,
      htmlLang: document.documentElement.lang,
      title: document.title,
      description: document.head.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
      canonical: document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
      hreflangs: Array.from(document.head.querySelectorAll('link[rel="alternate"]')).map((l) => l.getAttribute('hreflang')),
      /* Every absolute URL the head hands a crawler or a link unfurler. These
         all named campaign-site-azure.vercel.app while the ads pointed at
         teams.doviloop.dev, and nothing here noticed: the only check on the
         canonical was that it ended with the locale path, which is true of
         any host. So the hosts are collected, not just the paths. */
      headHosts: [
        document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
        document.head.querySelector('meta[property="og:url"]')?.getAttribute('content') ?? '',
        document.head.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '',
        document.head.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ?? '',
        ...Array.from(document.head.querySelectorAll('link[rel="alternate"]')).map(
          (l) => l.getAttribute('href') ?? '',
        ),
      ],
      ogImage: document.head.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '',
      ogImageAlt: document.head.querySelector('meta[property="og:image:alt"]')?.getAttribute('content') ?? '',
      twitterCard: document.head.querySelector('meta[name="twitter:card"]')?.getAttribute('content') ?? '',
      twitterImage: document.head.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ?? '',
      ogLocale: document.head.querySelector('meta[property="og:locale"]')?.getAttribute('content') ?? '',
      sectionsExpected: SECTION_IDS,
      sectionsFound: SECTION_IDS.filter((id) => host.querySelector(`#${id}`)),
      /* Presence would be satisfied by the sections in any order.
         querySelectorAll returns document order, which is the whole point. */
      sectionOrder: Array.from(
        host.querySelectorAll(SECTION_IDS.map((id) => `#${id}`).join(',')),
      ).map((el) => el.id),
      /* The skip link belongs to the hero now, because it is positioned
         against it, and it skips the masthead rather than the whole page. */
      hasSkipLink: Boolean(host.querySelector('#hero a[href="#hero-content"]')),
      hasMainLandmark: Boolean(host.querySelector('main#main')),
      hasFooter: Boolean(host.querySelector('footer')),
      /* The three desks of the worked example, and the tablist that changes
         them. This replaced the reserved 16:9 video box, which never got a
         video. */
      deskCount: host.querySelectorAll('#demo [role="tab"]').length,
      /* The page asks for one thing, so it has to ask for it in one set of
         words. The hero's folder tab, its button and the standing bar on
         phones all used to carry their own wording; one of the three said a
         call was being booked, which is not what happened. They read a single
         key now, and this is the check that keeps them there: a literal typed
         back into any one of them shows up as a second distinct label rather
         than as nothing at all.

         THE TARGET IS CURRENTLY DANGLING. All three still point at #fit, and
         #fit went with the form. Only the wording is asserted here, because
         only the wording is this check's business; whoever builds the trial
         signup repoints the href. Recorded so it is a known interim state
         rather than a discovery. */
      fitCtaLabels: Array.from(
        host.querySelectorAll('a[href="#fit"]:not(.hero-nav a)'),
      ).map((a) => (a.textContent ?? '').trim()),
      /* The masthead's own section link also points at #fit and is excluded
         above. It is a table of contents entry, not an ask, and holding it to
         the button wording would put a sentence in a list of one-word labels.
         Counted here so that the exclusion is a measurement rather than an
         assumption: if the masthead ever stops carrying it, this reads 0 and
         says so. */
      fitNavLinks: host.querySelectorAll('.hero-nav a[href="#fit"]').length,
      fitCtaInContent: c.nav.cta,
      /* The audiences, in the two places the page enumerates them.

         Read off the CONTENT rather than the DOM, because the DOM order is
         the content order (both components map in array order, and no CSS
         reorders either list), and because reading it here catches a locale
         whose folders drifted even if that locale's markup is fine. Paired on
         the id the two lists now share; before they shared one, a verifier
         swapped two folders in a single locale and the whole suite stayed
         green. */
      audienceOrder: c.who.groups.map((g) => g.id).join(','),
      /* Distinctness, because a union type does not give exhaustiveness: the
         same id twice in both lists compares equal and silently drops a trade
         from the page. */
      audienceIdsDistinct: new Set(c.who.groups.map((g) => g.id)).size === 3,
      deskIdsDistinct: new Set(c.demo.desks.map((d) => d.id)).size === 3,
      deskOrder: c.demo.desks.map((d) => d.id).join(','),
      /* The language control: one summary saying where you are, and every
         language behind it, each to its own path. It was three links in a row;
         a picker that lost one of them, or pointed two at the same page, would
         look exactly as right as this does. */
      localeSummary: (host.querySelector('#hero .hero-locale > summary')?.textContent ?? '').trim(),
      localeHrefs: Array.from(
        host.querySelectorAll<HTMLAnchorElement>('#hero .hero-locale-menu a'),
      ).map((a) => a.getAttribute('href') ?? ''),
      blankKeys,
      missing,
      unassembled,
      /* The hero card quotes the draft the worked example goes on to show in
         full. Asserted against the copy rather than the DOM on purpose: the
         demo renders that letter behind a desk picker, so the two strings can
         be held to each other here without driving the picker, and an excerpt
         that stopped being an excerpt is a defect in the content whether or
         not the section it belongs to happens to be on screen. */
      previewIsExcerpt: c.hero.draft.body.includes(c.hero.deal.preview),
      /* The draft card itself, read out of the DOM.
         `previewIsExcerpt` compares one content string to another and never
         looks at the page, so an independent verifier replaced the entire card
         with {null} and got a clean build, a green suite and both browser
         gates green. The hero's argument is that a drafted reply is already
         waiting; with no card the hero merely asserts it. */
      heroCardText: (host.querySelector('#hero .hero-deal')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      heroCardWants: [c.hero.deal.draftLabel, c.hero.deal.subject, c.hero.deal.preview],
      /* Every copy of the mark draws the one definition.

         The first version of this asked only that each path start with M, be
         longer than twenty characters, and that there be two distinct ones. A
         verifier walked all three of the cases it was written for straight
         through it: a copy left on the old shape, a placeholder (two
         29-character specks rendering at half a unit inside a 1024 viewBox, so
         the hero showed the wordmark alone), and a square with a triangle in
         it. "Longer than twenty characters" is not a shape.

         It compares against MARK_BOWL and MARK_STEM now, which is the only
         thing that can catch a valid path that is the wrong valid path, and it
         looks at every copy rather than the first match of two selectors. The
         footer was the copy that actually drifted. A fourth, on the fit check,
         went with that section. */
      markCopies: (
        [
          ['the hero masthead', '#hero .hero-brand svg path'],
          ['the draft watermark', '#demo .demo-emboss path'],
          ['the footer emboss', '#footer .footer-slip svg path'],
        ] as Array<[string, string]>
      ).map(([name, sel]) => [
        name,
        Array.from(host.querySelectorAll(sel)).map((n) => (n.getAttribute('d') ?? '').trim()),
      ]) as Array<[string, string[]]>,
      markWants: [MARK_BOWL, MARK_STEM],
      /* Each folder against the desk it claims to be about.

         The folder does not hold its own list: it looks the desk up by the id
         the two lists share, so the five things named under "Accounting firms"
         are the worked example's accounting sources and not the property ones.
         A join that broke would not empty the page - it would quietly print
         deposit rules to an accountant, in three languages, and every check
         that only asks whether some text is present would pass.

         The actual comes off the rendered DOM and the wanted comes off the
         content, so a join wired to `desks[0]` fails two of the three. */
      whoFolders: c.who.groups.map((g, i) => {
        const panel = host.querySelectorAll('#who .who-sheet')[i];
        const desk = c.demo.desks.find((d) => d.id === g.id);
        return {
          tab: g.tab,
          shown: Array.from(panel?.querySelectorAll('.who-source') ?? []).map((n) =>
            (n.textContent ?? '').trim(),
          ),
          want: desk ? desk.sources.map((s) => s.label) : [],
        };
      }),
      leaked,
    });

    await act(async () => {
      root.unmount();
    });
    host.remove();
  }

  (globalThis as unknown as { __PAGE_RESULTS__: unknown }).__PAGE_RESULTS__ = results;
};
