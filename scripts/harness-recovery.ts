/**
 * Exercises the never-lose-a-lead path in lib/lead.ts against the mock's
 * deliberate-500 endpoint. Bundled twice by verify-payload.mjs, once pointed at
 * the failing URL and once at the working one, so the queue written by the
 * first run is drained by the second inside the same jsdom window.
 *
 * The payload used to be a `QualifierPayload`: eleven named keys off the
 * fit-check form's contract, checked field by field on the way out of the
 * queue. The form and the contract are gone, and `submitLead` never read a
 * field of either - it serialises whatever it is handed and adds `dedupe_id`.
 * So the payload here is deliberately arbitrary, and what is asserted is that
 * the object that went in is the object that comes back out. That is the
 * promise the queue actually makes, and it is the one the next form will rely
 * on whatever shape it decides to send.
 */
import { flushLeadQueue, peekLeadQueue, submitLead } from '../src/lib/lead';
import type { LeadPayload } from '../src/lib/lead';

/* Nested, and carrying a value of each JSON type, because the queue round
   trips through JSON.stringify and a shallow copy would pass a check that
   only ever looked at top level strings. */
export const payload: LeadPayload = {
  marker: 'dl-recovery-harness',
  locale: 'da',
  market: 'dk',
  utm: { source: 'linkedin', medium: 'dm', campaign: 'dk_week1', content: 'partner_v2' },
  seats: 12,
  consented: true,
  submitted_at: new Date().toISOString(),
};

declare global {
  // eslint-disable-next-line no-var
  var __MODE__: 'fail' | 'flush';
  // eslint-disable-next-line no-var
  var __RECOVERY__: Record<string, unknown>;
}

globalThis.__RECOVERY__ = globalThis.__RECOVERY__ ?? {};

export async function run() {
  if (globalThis.__MODE__ === 'fail') {
    const result = await submitLead(payload);
    globalThis.__RECOVERY__.submit = result;
    globalThis.__RECOVERY__.queuedAfterFailure = peekLeadQueue().length;
    globalThis.__RECOVERY__.queuedPayload = peekLeadQueue()[0]?.payload ?? null;
    /* What was handed over, so the checker can compare the two rather than
       hold its own copy of the shape and agree with itself. */
    globalThis.__RECOVERY__.sentPayload = payload;
  } else {
    const flushed = await flushLeadQueue();
    globalThis.__RECOVERY__.flush = flushed;
    globalThis.__RECOVERY__.queuedAfterFlush = peekLeadQueue().length;
  }
}

(globalThis as unknown as { __RUN_RECOVERY__: () => Promise<void> }).__RUN_RECOVERY__ = run;
