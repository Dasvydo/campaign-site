/**
 * A stand-in for posthog-js, used by scripts/harness-consent-queue.tsx only.
 *
 * WHY A STUB, when the rest of this suite is written against the real thing.
 *
 * The promise being tested is not "does PostHog work". It is that an event
 * raised while the consent notice is still up is HELD IN MEMORY, and that
 * pressing Decline throws it away rather than parking it for a later change of
 * mind. src/lib/analytics.ts keeps that queue in a module-private `pending`
 * array and flushes it by calling `capture()` on the real client. Nothing
 * outside the module can see the array, so the only honest place to observe
 * the promise is at the call the flush makes - and that means standing where
 * posthog-js stands.
 *
 * Reading it off the wire instead would be worse, not better: posthog-js
 * batches, retries, and in jsdom has no working transport, so "no request was
 * made" would pass for a dozen reasons that have nothing to do with consent.
 *
 * This is deliberately NOT aliased into scripts/harness-consent.tsx. That
 * harness asserts what the real library puts on the device - a cookie, a
 * localStorage key - and swapping it for this would turn those checks green
 * over nothing, which is the exact failure this repository keeps finding.
 * Two harnesses, two instruments, one gate.
 */

export interface Captured {
  name: string;
  props: Record<string, unknown>;
}

declare global {
  // eslint-disable-next-line no-var
  var __PH__: { inits: string[]; captured: Captured[] } | undefined;
}

/* Created on demand rather than at module scope, and this is not a style
   choice. analytics.ts reaches this file through a dynamic `import()` that it
   only performs once consent is granted, so on the declined path the module
   never evaluates at all. A record that springs into existence at import time
   would therefore be missing exactly when the harness needs to read an empty
   one, and the read would throw rather than report "nothing was sent". */
export function record(): { inits: string[]; captured: Captured[] } {
  if (!globalThis.__PH__) globalThis.__PH__ = { inits: [], captured: [] };
  return globalThis.__PH__;
}

const client = {
  init(key: string, _options?: Record<string, unknown>): void {
    record().inits.push(key);
  },
  capture(name: string, props: Record<string, unknown> = {}): void {
    record().captured.push({ name, props });
  },
};

export default client;
