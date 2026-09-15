/**
 * Consent, as a single source of truth.
 *
 * The page loads two things that are not needed to make it work: PostHog, to
 * count visits, and the Meta pixel, to build retargeting audiences. Both write
 * to the visitor's device. Under ePrivacy that needs consent first, and DK and
 * LT are two of our three markets, so "first" has to mean first: nothing is
 * requested, injected or stored until a choice exists.
 *
 * The shape of the rule this file implements:
 *
 *   1. No decision yet  -> neither loads. Events are held in memory (see
 *      analytics.ts) so a later Accept does not lose the page_view.
 *   2. Accepted         -> both load, held events flush.
 *   3. Declined         -> held events are discarded, nothing loads, and the
 *      choice is remembered so the notice does not ask again.
 *
 * Withdrawing has to be as easy as giving, so the footer reopens the notice and
 * a declined choice clears the pixel's cookies on the way out.
 *
 * Deliberately not a consent-management platform. A CMP is a third party that
 * loads before anything else and watches every visitor, which is a strange way
 * to spend a privacy budget. Two categories, two buttons, no vendor.
 */

export type Choice = 'granted' | 'denied';

/** Bump when the categories change: an old choice no longer covers the new ask. */
const VERSION = 1;
const KEY = 'dl_consent';

interface Record_ {
  choice: Choice;
  /** ISO-8601. Kept because "when did they agree" is the whole point of a record. */
  at: string;
  v: number;
}

let current: Choice | null = null;
let loaded = false;
const listeners = new Set<(c: Choice | null) => void>();

function store(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = '__dl_c__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/**
 * Global Privacy Control. A browser-level "do not sell or share" signal that
 * several jurisdictions treat as a legally binding opt-out. Honouring it costs
 * three lines and means those visitors are never asked a question they have
 * already answered.
 *
 * DNT is not read: it was never agreed to mean anything specific, browsers ship
 * it on by default, and acting on it would deny consent nobody withheld.
 */
function gpc(): boolean {
  try {
    return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  } catch {
    return false;
  }
}

function load(): void {
  if (loaded) return;
  loaded = true;
  if (typeof window === 'undefined') return;

  if (gpc()) {
    // Treated as a decision, not as a missing one: the notice never appears.
    current = 'denied';
    return;
  }

  const s = store();
  if (!s) return;
  try {
    const raw = s.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record_;
    if (!parsed || parsed.v !== VERSION) return;
    if (parsed.choice === 'granted' || parsed.choice === 'denied') current = parsed.choice;
  } catch {
    /* a corrupt record is the same as no record: ask again */
  }
}

/** The recorded choice, or null when the visitor has not answered yet. */
export function consentChoice(): Choice | null {
  load();
  return current;
}

/** True only for an explicit yes. Every gate in the app reads this one. */
export function consentGranted(): boolean {
  return consentChoice() === 'granted';
}

/** True once there is any answer, which is what hides the notice. */
export function consentDecided(): boolean {
  return consentChoice() !== null;
}

/** True when the browser answered on the visitor's behalf. */
export function consentIsAutomatic(): boolean {
  load();
  return gpc();
}

/** Records a choice and tells everyone who is listening. */
export function setConsent(choice: Choice): void {
  load();
  current = choice;
  const s = store();
  if (s) {
    try {
      const rec: Record_ = { choice, at: new Date().toISOString(), v: VERSION };
      s.setItem(KEY, JSON.stringify(rec));
    } catch {
      /* private mode. The choice still holds for this page view. */
    }
  }
  notify();
}

/** Forgets the choice so the notice can ask again. Used by the footer link. */
export function clearConsent(): void {
  load();
  current = null;
  const s = store();
  if (s) {
    try {
      s.removeItem(KEY);
    } catch {
      /* nothing to do: the in-memory value is already cleared */
    }
  }
  notify();
}

/** Subscribes to changes. Returns its own unsubscribe. */
export function onConsentChange(fn: (c: Choice | null) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify(): void {
  for (const fn of listeners) {
    try {
      fn(current);
    } catch {
      /* a listener must never be able to break the others */
    }
  }
}
