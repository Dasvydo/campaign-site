/**
 * Consent harness. Not shipped. Bundled and run by scripts/verify-consent.mjs.
 *
 * Renders the REAL <Consent /> component and calls the REAL loaders, with a
 * pixel ID and a PostHog key configured, so the thing under test is the actual
 * gate rather than a description of it. The question it answers is the only one
 * that matters legally: with no choice made, does anything reach the device?
 */
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Consent, ConsentStatus } from '../src/components/Consent';
import { content } from '../src/content';
import { initMetaPixel, pixelTrack } from '../src/lib/pixel';
import { initAnalytics, applyConsent, track } from '../src/lib/analytics';
import { consentChoice, onConsentChange } from '../src/lib/consent';

declare global {
  // eslint-disable-next-line no-var
  var __RESULTS__: Record<string, unknown>;
  // eslint-disable-next-line no-var
  var __RUN__: () => Promise<void>;
}

/** Everything the page could possibly have put on the device or the wire. */
function footprint() {
  return {
    fbScripts: document.querySelectorAll('script[src*="connect.facebook.net"]').length,
    /* Asked of the <noscript> directly: a descendant CSS selector does not
       reach inside it in every engine, and a false zero here would look like
       a missing fallback. */
    noscriptPixels: Array.from(document.querySelectorAll('noscript')).filter((n) =>
      Array.from(n.children).some((el) =>
        (el as HTMLImageElement).src?.includes('facebook.com/tr'),
      ),
    ).length,
    /* Every beacon this page built for itself, wherever it ended up parked.
       The count above only looks inside <noscript>, which is where the old
       duplicate PageView was eventually appended - but the request had already
       gone out the moment `.src` was assigned, while the element was still
       detached, so "inside a noscript" was never the thing that mattered.
       fbevents.js is the only thing allowed to talk to Meta; anything the page
       constructs itself is a second, undeduplicated hit. */
    trBeacons: Array.from(document.querySelectorAll('*')).filter((el) =>
      (el as HTMLImageElement).src?.includes('facebook.com/tr'),
    ).length,
    fbqDefined: typeof window.fbq !== 'undefined',
    /* Everything the page has asked Meta to record, in order.

       fbevents.js never loads here - jsdom does not fetch external scripts,
       and in a browser this gate's siblings abort the host - so `callMethod`
       stays undefined and the loader stub keeps every call in `queue`. That
       array is therefore a complete and exact record of the conversation,
       which is what makes it worth reading: PostHog is checked by its
       footprint on the device, but Meta's is the one that is checked by what
       was SAID.

       Recovered from scripts/verify-browser.py, which read the same array in a
       real Chromium and was removed on 2026-09-23. It needs no browser: the
       loader is the standard snippet and the queue is plain JavaScript. */
    fbqQueue: window.fbq?.queue
      ? Array.from(window.fbq.queue as unknown[]).map((a) =>
          Array.from(a as ArrayLike<unknown>).map((v) =>
            typeof v === 'object' && v !== null ? JSON.parse(JSON.stringify(v)) : v,
          ),
        )
      : null,
    cookies: document.cookie,
    storageKeys: Object.keys(window.localStorage),
  };
}

function ctx() {
  return {
    market: 'dk' as const,
    locale: 'da' as const,
    utm: { source: 'meta', medium: 'paid_social', campaign: '', content: '' },
  };
}

globalThis.__RUN__ = async () => {
  const out: Record<string, unknown> = {};
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  /* The loaders run exactly as LocalePage runs them, including the
     subscription that re-runs them when the answer arrives. */
  onConsentChange((choice) => {
    applyConsent();
    if (choice === 'granted') initMetaPixel();
  });

  await act(async () => {
    root.render(
      <>
        <Consent c={content.da} />
        <ConsentStatus c={content.da} />
      </>,
    );
  });

  initAnalytics(ctx());
  initMetaPixel();
  track('page_view', { path: '/da' });

  /* ---- 1. undecided ---------------------------------------------------- */
  /* Sampled after a tick, not synchronously.

     posthog-js is loaded by a dynamic `import()` inside `maybeStart()`, so
     nothing it does can possibly have happened by the next statement. Reading
     the footprint immediately meant this whole block passed with the consent
     gate DELETED from `maybeStart()`: the library had simply not finished
     loading yet, and only the after-declining block below noticed. Measured on
     2026-09-23 by removing `if (!consentGranted()) return;` - every check here
     stayed green.

     So the window is given time to misbehave before it is judged. In correct
     code nothing starts loading at all and this tick costs a few milliseconds. */
  await new Promise((r) => setTimeout(r, 60));
  out.beforeChoice = footprint();
  const dialog = host.querySelector('[role="dialog"]');
  out.noticeShown = Boolean(dialog);
  out.noticeLabelled = Boolean(dialog?.getAttribute('aria-labelledby'));
  out.noticeNotModal = dialog?.getAttribute('aria-modal') === 'false';

  const buttons = Array.from(host.querySelectorAll<HTMLButtonElement>('.consent-btn'));
  out.buttonCount = buttons.length;
  out.buttonLabels = buttons.map((b) => b.textContent?.trim());
  /* The anti-dark-pattern check: both choices must be the same element with
     the same classes, so neither can be visually demoted. */
  out.buttonClassesIdentical =
    buttons.length === 2 && buttons[0].className === buttons[1].className;

  /* ---- 2. decline ------------------------------------------------------ */
  const decline = buttons.find((b) => b.textContent?.trim() === content.da.consent.decline);
  await act(async () => {
    decline?.click();
  });
  pixelTrack('ViewContent', { content_name: 'pricing' });
  /* A name the page can actually raise. This was `pricing_view` until
     2026-09-23, and it compiled for weeks after that name was retired because
     scripts/ is in no tsconfig project - see the note at the top of
     tsconfig.scripts.json. What is being tested here is the footprint after a
     refusal, not the name, so the gate was measuring the right thing the whole
     time; it was just firing an event the page could not. */
  track('price_seen');
  out.afterDecline = footprint();
  out.choiceAfterDecline = consentChoice();
  out.noticeGoneAfterDecline = !host.querySelector('[role="dialog"]');

  /* ---- 3. reopen from the footer, then accept -------------------------- */
  const reopen = host.querySelector<HTMLButtonElement>('.footer-a-btn');
  out.footerReopenPresent = Boolean(reopen);
  await act(async () => {
    reopen?.click();
  });
  out.noticeReopened = Boolean(host.querySelector('[role="dialog"]'));
  out.choiceAfterReopen = consentChoice();

  const accept = Array.from(host.querySelectorAll<HTMLButtonElement>('.consent-btn')).find(
    (b) => b.textContent?.trim() === content.da.consent.accept,
  );
  await act(async () => {
    accept?.click();
  });
  /* Give the injected loader a tick to append its nodes. */
  await new Promise((r) => setTimeout(r, 20));
  out.afterAccept = footprint();
  out.choiceAfterAccept = consentChoice();

  globalThis.__RESULTS__ = out;
};
