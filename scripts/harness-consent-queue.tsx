/**
 * The other half of the consent promise: what happens to events raised BEFORE
 * the visitor answers.
 *
 * scripts/harness-consent.tsx proves nothing reaches the device while the
 * notice is up, and that declining leaves it that way. It cannot see the queue
 * itself. src/lib/analytics.ts holds an event raised before a decision in an
 * in-memory array, flushes it on Accept, and DISCARDS it on Decline - "they
 * were never sent and are not kept for a later change of mind, because that is
 * not what declining means", as the module puts it.
 *
 * That sentence had no gate at all. Measured on 2026-09-23: deleting
 * `if (consentDecided()) pending = [];` from `applyConsent()` left every check
 * in this suite green, and so did additionally neutering the drop inside
 * `track()`. A visitor who declined and later accepted would have had the
 * events they refused sent after all, and nothing would have said so.
 *
 * So this harness stands where posthog-js stands - see scripts/stub-posthog.ts
 * for why that is the only place the promise is observable - and drives the
 * two paths that fork at the notice:
 *
 *   __MODE__ = 'accept'   raise, then accept. The held event MUST arrive.
 *   __MODE__ = 'decline'  raise, then decline, then change your mind and
 *                         accept. The held event must NEVER arrive, and a
 *                         fresh event raised after that accept MUST.
 *
 * The two halves are load-bearing on each other. Without the accept path,
 * "nothing was captured" passes on a queue that is simply broken; without the
 * fresh raise at the end of the decline path, it passes on an analytics module
 * that has stopped working altogether.
 */
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Consent, ConsentStatus } from '../src/components/Consent';
import { content } from '../src/content';
import { initAnalytics, applyConsent, track } from '../src/lib/analytics';
import { consentChoice, onConsentChange } from '../src/lib/consent';

declare global {
  // eslint-disable-next-line no-var
  var __QUEUE_MODE__: 'accept' | 'decline';
  // eslint-disable-next-line no-var
  var __QUEUE_RESULTS__: Record<string, unknown>;
  // eslint-disable-next-line no-var
  var __RUN_QUEUE__: () => Promise<void>;
}

import { record } from './stub-posthog';

const names = () => record().captured.map((c) => c.name);

/** Long enough for analytics.ts's dynamic import of the client to resolve. */
const settle = () => new Promise((r) => setTimeout(r, 60));

globalThis.__RUN_QUEUE__ = async () => {
  const out: Record<string, unknown> = {};
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  /* Exactly the subscription LocalePage makes. The pixel is not involved
     here; harness-consent.tsx owns that half. */
  onConsentChange(() => applyConsent());

  await act(async () => {
    root.render(
      <>
        <Consent c={content.da} />
        <ConsentStatus c={content.da} />
      </>,
    );
  });

  initAnalytics({
    market: 'dk',
    locale: 'da',
    utm: { source: 'meta', medium: 'paid_social', campaign: '', content: '' },
  });

  /* The event a real first frame raises, while the notice is still up. */
  track('page_view', { path: '/da' });
  await settle();
  out.startedUndecided = record().inits.length;
  out.capturedUndecided = names();

  const press = async (label: string) => {
    const btn = Array.from(host.querySelectorAll<HTMLButtonElement>('.consent-btn')).find(
      (b) => b.textContent?.trim() === label,
    );
    await act(async () => {
      btn?.click();
    });
    await settle();
    return Boolean(btn);
  };

  if (globalThis.__QUEUE_MODE__ === 'accept') {
    out.pressed = await press(content.da.consent.accept);
    out.choice = consentChoice();
    out.capturedAfterAccept = names();
    globalThis.__QUEUE_RESULTS__ = out;
    return;
  }

  out.pressed = await press(content.da.consent.decline);
  out.choice = consentChoice();
  /* Raised AFTER the refusal, which is a different branch from the one above:
     `track()` drops an event outright once the answer is a no, rather than
     queueing it. Without this the only thing under test would be
     `applyConsent()`, and neutering the drop inside `track()` would go
     unnoticed. */
  track('price_seen');
  await settle();
  out.capturedAfterDecline = names();

  /* The change of mind. Withdraw from the colophon, which clears the answer,
     then accept. This is the path a visitor actually has. */
  const reopen = host.querySelector<HTMLButtonElement>('.footer-a-btn');
  out.reopenPresent = Boolean(reopen);
  await act(async () => {
    reopen?.click();
  });
  out.pressedAccept = await press(content.da.consent.accept);
  out.choiceAfterAccept = consentChoice();
  out.capturedAfterLaterAccept = names();

  /* And the pipe is open, so the line above is not passing because analytics
     stopped working. */
  track('demo_desk', { desk: 'after-a-change-of-mind' });
  await settle();
  out.capturedAfterFreshRaise = names();

  globalThis.__QUEUE_RESULTS__ = out;
};
