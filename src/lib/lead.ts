/**
 * Lead delivery. The rule is simple: never lose a lead.
 *
 * Design, as required by the spec:
 *
 *   1. POST the contract payload to VITE_LEAD_WEBHOOK_URL. If that is empty we
 *      post to same-origin /api/lead, which the local mock endpoint answers in
 *      dev, so the shape can be verified without a real n8n.
 *   2. On failure, retry exactly once after a short pause. Two attempts total.
 *      A second failure is treated as a network or n8n problem, not as the
 *      lead's problem.
 *   3. Either way the visitor gets their result screen. A qualified lead sees
 *      the booking link even when the webhook is down, because a booked call is
 *      worth more than a row in the ledger and the row can be replayed.
 *   4. A failed payload is queued in localStorage and retried on the next page
 *      load, oldest first. Entries expire after 14 days so the queue cannot
 *      grow forever, and each carries an id so Batch F can deduplicate.
 *
 * Batch F must therefore treat `dedupe_id` as an idempotency key. A retry can
 * legitimately deliver the same lead twice.
 */
import type { QualifierPayload } from './contract';
import { env } from './env';

const QUEUE_KEY = 'dl_lead_queue';
const MAX_QUEUE = 20;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const RETRY_PAUSE_MS = 1200;
const TIMEOUT_MS = 10000;

export interface QueuedLead {
  dedupe_id: string;
  queued_at: string;
  attempts: number;
  payload: QualifierPayload;
}

export type DeliveryResult =
  | { delivered: true; attempts: number }
  | { delivered: false; attempts: number; queued: boolean; reason: string };

function endpoint(): string {
  return env.leadWebhookUrl || '/api/lead';
}

function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch { /* fall through */ }
  return `dl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeLocal(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = '__dl_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

function readQueue(): QueuedLead[] {
  const store = safeLocal();
  if (!store) return [];
  try {
    const raw = store.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedLead[];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - MAX_AGE_MS;
    return parsed.filter((e) => e && e.payload && Date.parse(e.queued_at) > cutoff);
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedLead[]): boolean {
  const store = safeLocal();
  if (!store) return false;
  try {
    store.setItem(QUEUE_KEY, JSON.stringify(items.slice(-MAX_QUEUE)));
    return true;
  } catch {
    return false;
  }
}

function enqueue(payload: QualifierPayload, dedupeId: string, attempts: number): boolean {
  const items = readQueue().filter((e) => e.dedupe_id !== dedupeId);
  items.push({
    dedupe_id: dedupeId,
    queued_at: new Date().toISOString(),
    attempts,
    payload,
  });
  return writeQueue(items);
}

async function postOnce(payload: QualifierPayload, dedupeId: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Idempotency key. n8n should drop a repeat of the same id.
        'X-DoviLoop-Dedupe': dedupeId,
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}

const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Submits one lead. Two attempts, then queue. Never throws: the caller always
 * gets a result and always shows the visitor their screen.
 */
export async function submitLead(payload: QualifierPayload): Promise<DeliveryResult> {
  const dedupeId = makeId();

  try {
    await postOnce(payload, dedupeId);
    return { delivered: true, attempts: 1 };
  } catch (first) {
    await pause(RETRY_PAUSE_MS);
    try {
      await postOnce(payload, dedupeId);
      return { delivered: true, attempts: 2 };
    } catch (second) {
      const queued = enqueue(payload, dedupeId, 2);
      const reason =
        second instanceof Error ? second.message : first instanceof Error ? first.message : 'unknown';
      if (import.meta.env.DEV) {
        console.warn('[lead] both attempts failed, queued =', queued, reason);
      }
      return { delivered: false, attempts: 2, queued, reason };
    }
  }
}

/**
 * Drains the queue on page load. One attempt per entry per load, oldest first,
 * so a persistent outage cannot turn into a request storm. Survivors stay
 * queued for the next load.
 */
export async function flushLeadQueue(): Promise<{ sent: number; remaining: number }> {
  const items = readQueue();
  if (items.length === 0) return { sent: 0, remaining: 0 };

  const survivors: QueuedLead[] = [];
  let sent = 0;

  for (const item of items) {
    try {
      await postOnce(item.payload, item.dedupe_id);
      sent += 1;
    } catch {
      survivors.push({ ...item, attempts: item.attempts + 1 });
    }
  }

  writeQueue(survivors);
  return { sent, remaining: survivors.length };
}

/** Exposed for the QA checklist and for debugging in the console. */
export function peekLeadQueue(): QueuedLead[] {
  return readQueue();
}
