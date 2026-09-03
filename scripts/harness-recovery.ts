/**
 * Second harness. Exercises the never-lose-a-lead path in lib/lead.ts against
 * the mock's deliberate-500 endpoint. Bundled twice by verify-payload.mjs, once
 * pointed at the failing URL and once at the working one, so the queue written
 * by the first run is drained by the second inside the same jsdom window.
 */
import { flushLeadQueue, peekLeadQueue, submitLead } from '../src/lib/lead';
import type { QualifierPayload } from '../src/lib/contract';

const payload: QualifierPayload = {
  source: 'outreach',
  market: 'dk',
  locale: 'da',
  utm: { source: 'linkedin', medium: 'dm', campaign: 'dk_week1', content: 'partner_v2' },
  company_name: 'Vesterled Ejendomsadministration',
  work_email: 'lars@vesterled.dk',
  phone: '+45 32 14 88 90',
  team_size: '25-49',
  email_client: 'outlook',
  role: 'owner_partner',
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
  } else {
    const flushed = await flushLeadQueue();
    globalThis.__RECOVERY__.flush = flushed;
    globalThis.__RECOVERY__.queuedAfterFlush = peekLeadQueue().length;
  }
}

(globalThis as unknown as { __RUN_RECOVERY__: () => Promise<void> }).__RUN_RECOVERY__ = run;
