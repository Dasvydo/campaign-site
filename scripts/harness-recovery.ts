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
 *
 * The third mode, 'age', is recovered coverage. lead.ts drops a queued lead
 * after fourteen days so a dead webhook cannot grow an unbounded queue on a
 * visitor's device, and the only thing that had ever exercised that cutoff was
 * scripts/verify-browser.py - a manual Python gate that drove the deleted
 * fit-check form, was in neither package.json nor CI, and cannot run in this
 * container at all because Playwright for Python is not installed. It was
 * removed on 2026-09-23 and this is where that one live subject went. It needs
 * no browser: the cutoff is a filter inside readQueue(), and reading the queue
 * back is enough to see it.
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
  var __MODE__: 'fail' | 'flush' | 'age';
  // eslint-disable-next-line no-var
  var __RECOVERY__: Record<string, unknown>;
}

globalThis.__RECOVERY__ = globalThis.__RECOVERY__ ?? {};

/** Days old, as an ISO timestamp the queue would have written. */
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

export async function run() {
  if (globalThis.__MODE__ === 'age') {
    /* Seeded either side of the cutoff, and read back through the module's own
       accessor rather than out of localStorage: the filter lives in readQueue,
       so going around it would test JSON.parse. Fifteen and thirteen days,
       because a fixture ON the boundary would flip with the clock. */
    window.localStorage.setItem(
      'dl_lead_queue',
      JSON.stringify([
        { dedupe_id: 'age-15', queued_at: daysAgo(15), attempts: 2, payload },
        { dedupe_id: 'age-13', queued_at: daysAgo(13), attempts: 2, payload },
      ]),
    );
    globalThis.__RECOVERY__.aged = peekLeadQueue().map((e) => e.dedupe_id);
    return;
  }
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
