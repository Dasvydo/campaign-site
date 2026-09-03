import { useEffect, useMemo, useRef } from 'react';
import { content, pathFor, LOCALES } from './content';
import type { Locale, QualifierPayload } from './lib/contract';
import { captureUtm, resolveMarket, resolveSource } from './lib/attribution';
import { initAnalytics, setAnalyticsContext, track } from './lib/analytics';
import { initMetaPixel, pixelTrack } from './lib/pixel';
import { flushLeadQueue } from './lib/lead';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Demo } from './components/Demo';
import { Numbers } from './components/Numbers';
import { WhoFor } from './components/WhoFor';
import { Objections } from './components/Objections';
import { Price } from './components/Price';
import { Qualifier } from './components/Qualifier';
import { Footer } from './components/Footer';

const SITE_ORIGIN = 'https://teams.doviloop.dev';

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

  return (
    <>
      <a
        href="#main"
        className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        {c.nav.skipToContent}
      </a>

      <Header c={c} locale={locale} onCta={() => track('booking_click', { placement: 'header' })} />

      <main id="main">
        <Hero c={c} onCta={() => track('booking_click', { placement: 'hero' })} />

        <HowItWorks c={c} />

        <Demo
          c={c}
          onPlay={() => {
            track('video_play');
            pixelTrack('ViewContent', { content_name: 'demo_video' });
          }}
        />

        <Numbers c={c} />

        <WhoFor c={c} />

        <Objections c={c} />

        <Price
          c={c}
          onView={() => track('pricing_view')}
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
