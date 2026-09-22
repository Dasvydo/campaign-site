import { useEffect, useMemo, useRef, useState } from 'react';
import { content, pathFor, LOCALES } from './content';
import type { QualifierPayload } from './lib/contract';
import type { Locale } from './lib/types';
import type { PackageId } from './lib/offer';
import { headlinePackage } from './lib/offer';
import { captureUtm, resolveMarket, resolveSource } from './lib/attribution';
import { applyConsent, initAnalytics, setAnalyticsContext, track } from './lib/analytics';
import { initMetaPixel, pixelTrack, revokeMetaPixel } from './lib/pixel';
import { onConsentChange } from './lib/consent';
import { flushLeadQueue } from './lib/lead';
import { Consent } from './components/Consent';
import { Rail } from './components/Rail';
import { Hero } from './components/Hero';
import { Demo } from './components/Demo';
import { Numbers } from './components/Numbers';
import { WhoFor } from './components/WhoFor';
import { Price } from './components/Price';
import { Qualifier } from './components/Qualifier';
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

  /* The package a reader presses in <Price /> (04) and the calculator in
     <Numbers /> (05) are two components, and until now two opinions. Pressing
     Firm and scrolling read "This costs (Desk)" against 5,000 pooled drafts,
     which is the other package's allowance under the other package's fee. The
     selection is held here because it is the only place both sections can see
     it.

     It starts on the headline package rather than on null, because the price
     block starts there: the Firm card is lit at rest, and a calculator opening
     on Desk underneath it is the same disagreement one scroll down, with
     nobody having pressed anything.

     The `at` counter is not decoration. A reader who drags the head count away
     and then presses the package that is already lit is asking to be put back,
     and a bare id would be the same value as last time, so the effect
     downstream would not run and the press would do nothing. The counter makes
     every press a new value. */
  const [pickedPackage, setPickedPackage] = useState<{ id: PackageId; at: number }>(() => ({
    id: headlinePackage().id,
    at: 0,
  }));
  const pickPackage = (id: PackageId) => setPickedPackage((prev) => ({ id, at: prev.at + 1 }));

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

        {/* Which desk a visitor picks is the strongest signal on the page of
            what they actually do for a living, so it goes to analytics. */}
        <Demo c={c} onDeskChange={(desk) => track('demo_desk', { desk })} />

        <WhoFor c={c} />


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
          onPackagePick={pickPackage}
        />


        {/* After the price, not before it. A cold click scrolls for the price;
            the calculator is the justification and reads better once the fee
            it subtracts has been seen. */}
        <Numbers c={c} pickedPackage={pickedPackage} />

        <Qualifier
          c={c}
          ctx={{ locale, market, source, utm }}
          onFormStart={() => track('form_start')}
          onFormStep={(step: number) => track('form_step', { step })}
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
