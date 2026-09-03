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
 *   "phone": "",
 *   "team_size": "1-9 | 10-24 | 25-49 | 50+",
 *   "email_client": "outlook | gmail | other",
 *   "role": "owner_partner | ops_office_manager | it_admin | other",
 *   "submitted_at": "ISO-8601"
 * }
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
  phone: string;
  team_size: TeamSize;
  email_client: EmailClient;
  role: Role;
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
