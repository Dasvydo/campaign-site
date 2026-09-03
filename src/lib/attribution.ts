/**
 * UTM capture and attribution.
 *
 * Captured from the URL on first load, persisted in sessionStorage, and
 * included in every payload and every PostHog event. First touch wins inside a
 * session: if someone lands from an ad, wanders to the pricing page and comes
 * back with a bare URL, the ad still gets the credit.
 */
import type { Locale, Market, Source, Utm } from './contract';

const UTM_KEY = 'dl_utm';
const SOURCE_KEY = 'dl_source';
const EMPTY_UTM: Utm = { source: '', medium: '', campaign: '', content: '' };

function safeSession(): Storage | null {
  // Private mode and blocked site data both throw on access, not on use.
  try {
    const s = window.sessionStorage;
    const probe = '__dl_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

function readUrlUtm(search: string): Utm {
  const p = new URLSearchParams(search);
  return {
    source: p.get('utm_source') ?? '',
    medium: p.get('utm_medium') ?? '',
    campaign: p.get('utm_campaign') ?? '',
    content: p.get('utm_content') ?? '',
  };
}

function hasAnyValue(u: Utm): boolean {
  return Boolean(u.source || u.medium || u.campaign || u.content);
}

/**
 * Reads the URL, merges with whatever the session already holds, writes back.
 * Call once on first load. Returns what the payload should carry.
 */
export function captureUtm(search: string = window.location.search): Utm {
  const fromUrl = readUrlUtm(search);
  const store = safeSession();

  let stored: Utm = EMPTY_UTM;
  if (store) {
    try {
      const raw = store.getItem(UTM_KEY);
      if (raw) stored = { ...EMPTY_UTM, ...(JSON.parse(raw) as Partial<Utm>) };
    } catch {
      stored = EMPTY_UTM;
    }
  }

  // First touch wins. Only write if the session has nothing yet.
  const resolved = hasAnyValue(stored) ? stored : fromUrl;

  if (store && hasAnyValue(resolved)) {
    try {
      store.setItem(UTM_KEY, JSON.stringify(resolved));
    } catch {
      /* storage full or blocked; the in-memory value still works this session */
    }
  }

  return resolved;
}

/**
 * Derives `source` for the contract from the UTM values.
 *
 * The contract's `source` enum is coarser than utm_source on purpose: it is the
 * funnel lane, not the platform. An explicit ?source= on the URL always wins,
 * which is how outreach links can label themselves without inventing UTMs.
 */
export function resolveSource(utm: Utm, search: string = window.location.search): Source {
  const store = safeSession();

  const explicit = new URLSearchParams(search).get('source');
  if (explicit && isSource(explicit)) {
    if (store) {
      try {
        store.setItem(SOURCE_KEY, explicit);
      } catch { /* ignore */ }
    }
    return explicit;
  }

  if (store) {
    try {
      const held = store.getItem(SOURCE_KEY);
      if (held && isSource(held)) return held;
    } catch { /* ignore */ }
  }

  const s = utm.source.toLowerCase();
  const m = utm.medium.toLowerCase();

  let derived: Source = 'direct';
  if (m.includes('reel') || m === 'organic_social' || s.includes('reel') || s === 'youtube' || s === 'tiktok') {
    derived = 'reel';
  } else if (m === 'paid_social' || m === 'cpc' || m === 'paid' || s === 'meta' || s === 'facebook' || s === 'instagram') {
    derived = 'ad';
  } else if (m === 'outreach' || m === 'email' || m === 'dm' || s === 'instantly' || s === 'linkedin') {
    derived = 'outreach';
  }

  if (store && derived !== 'direct') {
    try {
      store.setItem(SOURCE_KEY, derived);
    } catch { /* ignore */ }
  }
  return derived;
}

function isSource(v: string): v is Source {
  return v === 'reel' || v === 'ad' || v === 'outreach' || v === 'direct';
}

/**
 * Market follows the locale, which is what the three-market A/B test measures.
 * A ?market= override exists because an English ad can legitimately be pointed
 * at a Danish audience, and the ad set knows that even though the page does not.
 */
export function resolveMarket(locale: Locale, search: string = window.location.search): Market {
  const explicit = new URLSearchParams(search).get('market');
  if (explicit === 'dk' || explicit === 'lt' || explicit === 'global') return explicit;

  if (locale === 'da') return 'dk';
  if (locale === 'lt') return 'lt';
  return 'global';
}
