/**
 * THE SHARED CONTRACT.
 *
 * Fixed in campaign-specs/00-START-HERE.md. Batches A (this repo), B (ledger)
 * and F (n8n) all build against it. Nothing in this file may be renamed or
 * extended without changing that document first. Concerns about the shape are
 * recorded in RUN-REPORT.md rather than fixed here.
 *
 * {
 *   "source": "reel | ad | outreach | direct",
 *   "market": "dk | lt | global",
 *   "locale": "en | da | lt",
 *   "utm": { "source": "", "medium": "", "campaign": "", "content": "" },
 *   "company_name": "",
 *   "work_email": "",
 *   "phone": "",                // optional: "" when the reader leaves it blank
 *   "team_size": "1-9 | 10-24 | 25-49 | 50+",
 *   "email_client": "outlook | gmail | other",
 *   "email_client_other": "",   // only when email_client = other, and filled in
 *   "role": "owner_partner | ops_office_manager | it_admin | other",
 *   "role_other": "",           // only when role = other, and filled in
 *   "submitted_at": "ISO-8601"
 * }
 *
 * THE TWO "_other" KEYS ARE NEW AND NOT YET IN 00-START-HERE.md.
 *
 * They were asked for from the live page: picking "Something else" now offers
 * a box to say what the something else is, because "other" on its own tells
 * the call nothing. They are additive and optional - the key is left out
 * entirely unless the reader picked "other" AND typed something - so a
 * consumer that ignores unknown keys is unaffected and the routing table,
 * which reads only `team_size` and `email_client`, is untouched.
 *
 * What is NOT settled: whether the n8n validator rejects a payload carrying
 * keys its schema does not name. If it does, every lead from a reader who
 * chose "Something else" is dropped. That is one line in the spec doc and one
 * check in n8n, and both are the founder's. Recorded in BLOCKED.md.
 */

export type Source = 'reel' | 'ad' | 'outreach' | 'direct';
export type Market = 'dk' | 'lt' | 'global';
export type Locale = 'en' | 'da' | 'lt';
export type TeamSize = '1-9' | '10-24' | '25-49' | '50+';
export type EmailClient = 'outlook' | 'gmail' | 'other';
export type Role = 'owner_partner' | 'ops_office_manager' | 'it_admin' | 'other';

export interface Utm {
  source: string;
  medium: string;
  campaign: string;
  content: string;
}

export interface QualifierPayload {
  source: Source;
  market: Market;
  locale: Locale;
  utm: Utm;
  company_name: string;
  work_email: string;
  /** The only optional answer on the form, and the only key here that may be
      an empty string. It was asked for, then not asked for from 2026-09-19
      (T23), and asked for again from 2026-09-22. Through all of that this key
      has been declared, sent and validated, which is why the form can take it
      on and off without a spec change: '' when the box is blank, whatever was
      typed when it is not. */
  phone: string;
  team_size: TeamSize;
  email_client: EmailClient;
  /** What they typed when they picked "other". Absent unless both are true:
      `email_client` is 'other' and they filled the box in. Optional in the
      type because it is optional on the wire - see the header. */
  email_client_other?: string;
  role: Role;
  /** The same, for the role. */
  role_other?: string;
  submitted_at: string;
}

/** Enum values, in the order the form presents them. */
export const TEAM_SIZES: TeamSize[] = ['1-9', '10-24', '25-49', '50+'];
export const EMAIL_CLIENTS: EmailClient[] = ['outlook', 'gmail', 'other'];
export const ROLES: Role[] = ['owner_partner', 'ops_office_manager', 'it_admin', 'other'];

/**
 * The three routing rules, from the table in 00-START-HERE.md.
 *
 * | team_size in 10-24 / 25-49 / 50+ AND email_client = outlook
 * |   -> booking link, ledger stage `qualified`
 * | same size AND email_client = gmail or other
 * |   -> booking link, ledger flag `gmail_on_request`
 * | team_size = 1-9
 * |   -> redirect to doviloop.dev pricing, ledger stage `too_small`, 3-email nurture
 *
 * Batch F applies these server-side and owns the ledger writes. This function
 * exists so the UI mirrors the same table rather than re-deriving it, and the
 * ledger fields are carried here purely so the two implementations can be
 * diffed against each other by eye.
 */
export type Outcome = 'qualified' | 'gmail_on_request' | 'too_small';

export interface RoutingResult {
  outcome: Outcome;
  /** What Batch F will write as the ledger stage. Mirrored, not sent. */
  ledger_stage: 'qualified' | 'too_small';
  /** What Batch F will set as the ledger flag, if any. Mirrored, not sent. */
  ledger_flag: 'gmail_on_request' | null;
  /** Whether this outcome shows the booking link. */
  showsBooking: boolean;
}

export function route(team_size: TeamSize, email_client: EmailClient): RoutingResult {
  // Rule 3 first: size is the gate, and 1-9 never sees a booking link.
  if (team_size === '1-9') {
    return {
      outcome: 'too_small',
      ledger_stage: 'too_small',
      ledger_flag: null,
      showsBooking: false,
    };
  }

  // Rule 1: 10+ seats on Outlook.
  if (email_client === 'outlook') {
    return {
      outcome: 'qualified',
      ledger_stage: 'qualified',
      ledger_flag: null,
      showsBooking: true,
    };
  }

  // Rule 2: 10+ seats on Gmail or something else. Still qualified, still books,
  // carries the flag so onboarding knows to set Gmail up for them.
  return {
    outcome: 'gmail_on_request',
    ledger_stage: 'qualified',
    ledger_flag: 'gmail_on_request',
    showsBooking: true,
  };
}
