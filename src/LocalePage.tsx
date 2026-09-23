import { useEffect, useMemo, useRef } from 'react';
import { content, pathFor, LOCALES } from './content';
import type { Locale } from './lib/types';
import { captureUtm, resolveMarket } from './lib/attribution';
import { applyConsent, initAnalytics, setAnalyticsContext, track } from './lib/analytics';
import { initMetaPixel, revokeMetaPixel } from './lib/pixel';
import { onConsentChange } from './lib/consent';
import { flushLeadQueue } from './lib/lead';
import { Consent } from './components/Consent';
import { Rail } from './components/Rail';
import { Hero } from './components/Hero';
import { Tiers } from './components/Tiers';
import { Demo } from './components/Demo';
import { WhoFor } from './components/WhoFor';
import { Enterprise } from './components/Enterprise';
import { Footer } from './components/Footer';

/* The origin every absolute URL in the head names: canonical, og:url, the
   og:image and all four hreflang alternates.

   This was campaign-site-azure.vercel.app, and correctly so at the time: the
   custom domain was still 301ing to www.doviloop.dev, so naming it would have
   pointed search engines and link unfurlers at the product homepage. That is
   no longer true. teams.doviloop.dev now serves this deployment (same bundle
   hash, checked against the vercel.app host), and the ads go to the custom
   domain. Leaving the old value here would hand every share card and every
   indexed page a canonical on a hostname the visitor never sees, and split
   the ranking between two live origins serving identical HTML.

   If the domain is ever moved again, this constant is the only place to
   change, and scripts/verify-payload.mjs asserts every head URL starts with
   it. */
const SITE_ORIGIN = 'https://teams.doviloop.dev';

/* Open Graph wants a language_TERRITORY pair, not a bare language tag. */
const OG_LOCALE: Record<Locale, string> = { en: 'en_GB', da: 'da_DK', lt: 'lt_LT' };

export function LocalePage({ locale }: { locale: Locale }) {
  const c = content[locale];

  /* Captured once on first load and held for the session. First touch wins, so
     an ad still gets the credit if the visitor wanders off and comes back. */
  const utm = useMemo(() => captureUtm(), []);
  const market = useMemo(() => resolveMarket(locale), [locale]);

  const booted = useRef(false);

  /* Head management. A SPA cannot ship three static <html lang> values, so the
     tags are written per route: lang, title, description, canonical, and the
     hreflang alternates for all three locales plus x-default. */
  useEffect(() => {
    document.documentElement.lang = c.htmlLang;
    document.title = c.meta.title;
    setMeta('description', c.meta.description);
    setMeta('og:title', c.meta.title, 'property');
    setMeta('og:description', c.meta.description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:url', SITE_ORIGIN + pathFor(locale), 'property');
    setMeta('og:site_name', 'DoviLoop for teams', 'property');
    setMeta('og:locale', OG_LOCALE[locale], 'property');
    /* The card. twitter:card said summary_large_image and there was no image
       to be large, which unfurls as a bare line of text on LinkedIn and Slack
       and lets Facebook scrape whatever raster it can find. One per locale,
       drawn from that locale's own hero copy by scripts/make-og.mjs. Absolute,
       because a relative og:image is ignored by every scraper. */
    const card = `${SITE_ORIGIN}/og-${locale}.png`;
    setMeta('og:image', card, 'property');
    setMeta('og:image:width', '1200', 'property');
    setMeta('og:image:height', '630', 'property');
    setMeta('og:image:alt', c.meta.cardAlt, 'property');
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:image', card, 'name');
    setLink('canonical', SITE_ORIGIN + pathFor(locale));
    for (const l of LOCALES) setAlternate(l, SITE_ORIGIN + pathFor(l));
    setAlternate('x-default', SITE_ORIGIN + '/');
  }, [c, locale]);

  /* Consent can be answered long after first paint, so the two gated loaders
     are re-run on every change rather than only on mount. Withdrawing clears
     what the pixel wrote; see revokeMetaPixel for what that can and cannot
     promise. */
  useEffect(
    () =>
      onConsentChange((choice) => {
        applyConsent();
        if (choice === 'granted') initMetaPixel();
        else revokeMetaPixel();
      }),
    [],
  );

  /* Analytics, pixel, and the recovery queue. Once per load, not per route.
     The first two no-op until there is a consent decision; the lead queue does
     not, because replaying a lead the visitor typed themselves is the service
     they asked for, not tracking. */
  useEffect(() => {
    const ctx = { market, locale, utm };
    if (!booted.current) {
      booted.current = true;
      initAnalytics(ctx);
      initMetaPixel();
      // Anything that failed to reach n8n on a previous visit goes out now.
      void flushLeadQueue();
    } else {
      setAnalyticsContext(ctx);
    }
    track('page_view', { path: pathFor(locale) });
  }, [locale, market, utm]);

  const localeNames = LOCALES.map((l) => ({ code: l, label: c.nav.localeNames[l] }));

  return (
    <>
      {/* First in the document on purpose: a keyboard reaches the notice before
          the page it is asking about. */}
      <Consent c={c} />

      <Rail />

      <main id="main">
        {/* The masthead, the skip link and the standing price bar all belong to
            the hero's own composition and are positioned against it, so the
            hero owns them rather than a separate chrome component. */}
        <Hero
          c={c}
          locale={locale}
          localeNames={localeNames}
          pathFor={(code) => pathFor(code as Locale)}
          onCta={() => track('booking_click', { placement: 'hero' })}
        />

        {/* The price, immediately after the hero and before anything else,
            because that is where the founder put it and because an ad click
            that has to scroll past a worked example to find out what it costs
            is an ad click that leaves. It carries id="price", which is the
            target the masthead's own nav link has been pointing at since the
            old band was deleted. */}
        <Tiers c={c} />

        {/* Which desk a visitor picks is the strongest signal on the page of
            what they actually do for a living, so it goes to analytics. */}
        <Demo c={c} onDeskChange={(desk) => track('demo_desk', { desk })} />

        <WhoFor c={c} />

        {/* The secondary path, last and deliberately quiet. Self-serve is the
            motion this page sells and the trial CTA above is the only ask;
            this is here because a firm of ten desks with a security review
            and a procurement form will not press that button today, and
            sending them away is worse than answering them. It never says
            trial, it carries no #fit control, and it turns nobody away: the
            old funnel's `too_small` redirect went with the funnel. */}
        <Enterprise c={c} locale={locale} />
      </main>

      <Footer c={c} />
    </>
  );
}

/* Small head helpers. Kept here rather than pulling in a helmet library for
   five tags. */
function setMeta(key: string, value: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]:not([hreflang])`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setAlternate(hreflang: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${hreflang}"]`,
  );
  if (!el) {
    el = document.createElement('link');
    el.rel = 'alternate';
    el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}
