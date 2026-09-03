/**
 * Third harness. Renders the entire <LocalePage /> for each locale in jsdom and
 * reports what came out, so "all three locales render, with no missing keys and
 * no English leaking into /da or /lt" is a measured claim rather than a hope.
 */
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LocalePage } from '../src/LocalePage';
import { content, pathFor } from '../src/content';
import type { Locale } from '../src/lib/contract';

const SECTION_IDS = ['how', 'demo', 'numbers', 'who', 'objections', 'price', 'qualifier'];

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

    /* Empty or whitespace-only strings anywhere in the locale file. */
    const blankKeys = leaves(c)
      .filter(([k, v]) => v.trim() === '' && !k.startsWith('footer.company') && k !== 'nativeCheck')
      .map(([k]) => k);

    /* Every visible string that should appear in the DOM. Excludes the form
       result screens (not rendered until submit), placeholders and meta. */
    const mustAppear = [
      c.hero.opening, c.hero.claim, c.hero.afterLine,
      c.how.title, ...c.how.steps.map((s) => s.title), ...c.how.steps.map((s) => s.body),
      c.demo.title, c.numbers.title, c.numbers.caveat,
      ...c.numbers.rows.map((r) => r.basis),
      c.who.title, ...c.who.groups.map((g) => g.body), c.who.seatMinimum, c.who.noTech,
      c.objections.title, ...c.objections.items.map((i) => i.q), ...c.objections.items.map((i) => i.a),
      c.price.title, c.price.perSeat, c.price.setup, ...c.price.lines, c.price.cta,
      c.form.title, c.form.lead, c.form.companyLabel, c.form.emailLabel, c.form.phoneLabel,
      c.form.teamSizeLabel, c.form.emailClientLabel, c.form.roleLabel, c.form.submit,
      c.footer.tagline, c.footer.privacyLink,
    ];
    const missing = mustAppear.filter((s) => !text.includes(s));

    /* English master strings that must NOT appear on /da or /lt. Compared only
       where the two locales genuinely differ, so shared tokens like "Outlook",
       "Gmail" and "89 USD" are not false positives. */
    const en = content.en;
    const englishOnly = [
      en.hero.opening, en.hero.claim, en.how.title, en.numbers.title, en.who.title,
      en.objections.title, en.price.title, en.form.title, en.form.submit,
      ...en.how.steps.map((s) => s.title),
      ...en.objections.items.map((i) => i.q),
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
      sectionsFound: SECTION_IDS.filter((id) => host.querySelector(`#${id}`)),
      hasSkipLink: Boolean(host.querySelector('a[href="#main"]')),
      hasMainLandmark: Boolean(host.querySelector('main#main')),
      hasFooter: Boolean(host.querySelector('footer')),
      videoPlaceholderAspect: (host.querySelector('#demo [style*="aspect-ratio"]') as HTMLElement | null)?.style.aspectRatio ?? '',
      labelledControls: Array.from(host.querySelectorAll('#qualifier input, #qualifier select')).every(
        (el) => Boolean(host.querySelector(`label[for="${el.id}"]`)),
      ),
      controlCount: host.querySelectorAll('#qualifier input, #qualifier select').length,
      blankKeys,
      missing,
      leaked,
      charCount: text.length,
    });

    await act(async () => {
      root.unmount();
    });
    host.remove();
  }

  (globalThis as unknown as { __PAGE_RESULTS__: unknown }).__PAGE_RESULTS__ = results;
};
