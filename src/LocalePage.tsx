import { useEffect, useMemo, useRef } from 'react';
import { content, pathFor, LOCALES } from './content';
import type { Locale, QualifierPayload } from './lib/contract';
import { captureUtm, resolveMarket, resolveSource } from './lib/attribution';
import { initAnalytics, setAnalyticsContext, track } from './lib/analytics';
import { initMetaPixel, pixelTrack } from './lib/pixel';
import { flushLeadQueue } from './lib/lead';
import { Rail } from './components/Rail';
import { Hero } from './components/Hero';
import { Demo } from './components/Demo';
import { Numbers } from './components/Numbers';
import { WhoFor } from './components/WhoFor';
import { Price } from './components/Price';
import { Qualifier } from './components/Qualifier';
import { Footer } from './components/Footer';

/* teams.doviloop.dev 301s to www.doviloop.dev: it is not dead, which is worse
   than dead. Ads pointing there would have returned 200 and landed every paid
   click on the product homepage, with no qualifier and no instrumentation. The
   ad-engine repo was repointed at the deployment on 2026-09-14 and this is the
   same correction: canonical, og:url and every hreflang alternate now name the
   origin the page is actually served from. */
const SITE_ORIGIN = 'https://campaign-site-azure.vercel.app';

export function LocalePage({ locale }: { locale: Locale }) {
  const c = content[locale];

  /* Captured once on first load and held for the session. First touch wins, so
     an ad still gets the credit if the visitor wanders off and comes back. */
  const utm = useMemo(() => captureUtm(), []);
  const source = useMemo(() => resolveSource(utm), [utm]);
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
    setMeta('twitter:card', 'summary_large_image', 'name');
    setLink('canonical', SITE_ORIGIN + pathFor(locale));
    for (const l of LOCALES) setAlternate(l, SITE_ORIGIN + pathFor(l));
    setAlternate('x-default', SITE_ORIGIN + '/');
  }, [c, locale]);

  /* Analytics, pixel, and the recovery queue. Once per load, not per route. */
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

        {/* Which desk a visitor picks is the strongest signal on the page of
            what they actually do for a living, so it goes to analytics. */}
        <Demo c={c} onDeskChange={(desk) => track('demo_desk', { desk })} />

        <WhoFor c={c} />

        <Numbers c={c} />

        <Price
          c={c}
          onView={() => track('pricing_view')}
          /* Decision P-6, settled 2026-09-14: the pricing band feeds Meta.
             Without this, ad-engine's audience 3 (pricing viewers, 90 days)
             cannot be built at all - it was documented as available while
             nothing on the page ever sent the event it keys on. Dwell-gated
             in <Price /> so it stays a high-intent pool. */
          onSeen={() =>
            pixelTrack('ViewContent', {
              content_name: 'pricing',
              content_category: 'teams_landing',
            })
          }
          onCta={() => track('booking_click', { placement: 'price' })}
        />

        <Qualifier
          c={c}
          ctx={{ locale, market, source, utm }}
          onFormStart={() => track('form_start')}
          onFormSubmit={(payload: QualifierPayload) => {
            track('form_submit', {
              team_size: payload.team_size,
              email_client: payload.email_client,
              role: payload.role,
              lead_source: payload.source,
            });
            pixelTrack('Lead');
          }}
          onQualifiedShown={(outcome, delivered) =>
            track('qualified_shown', { outcome, webhook_delivered: delivered })
          }
          onTooSmallShown={(delivered) => track('too_small_shown', { webhook_delivered: delivered })}
          onBookingClick={() => {
            track('booking_click', { placement: 'confirmation' });
            pixelTrack('Schedule');
          }}
        />
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
