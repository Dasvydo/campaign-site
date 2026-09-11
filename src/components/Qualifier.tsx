import { useCallback, useMemo, useRef, useState } from 'react';
import type { Content } from '../content/types';
import type {
  EmailClient,
  Locale,
  Market,
  QualifierPayload,
  Role,
  Source,
  TeamSize,
  Utm,
} from '../lib/contract';
import { route } from '../lib/contract';
import { submitLead } from '../lib/lead';
import { env, FALLBACK_CONTACT_EMAIL, PRICING_URL } from '../lib/env';
import { Section } from './Section';

/**
 * The qualifier.
 *
 * Six fields, in the order the spec fixes, mapping one to one onto the shared
 * contract in 00-START-HERE.md. The three outcomes are rendered client-side
 * from lib/contract.ts `route()`, which is the same rules table Batch F applies
 * server side. The table is written down in exactly one place so the two
 * implementations cannot drift apart quietly.
 */

/* Free providers get a soft warning, never a block. Someone at a ten person
   brokerage genuinely might be on a personal address, and rejecting them would
   cost us the lead to prove a point. */
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'hotmail.co.uk',
  'live.com', 'live.dk', 'msn.com', 'yahoo.com', 'yahoo.co.uk', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com',
  'gmx.com', 'gmx.de', 'mail.com', 'zoho.com', 'yandex.com', 'inbox.lt',
  'mail.lt', 'takas.lt', 'one.lt', 'gmail.lt',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldName = 'company_name' | 'work_email' | 'phone' | 'team_size' | 'email_client' | 'role';

interface FormState {
  company_name: string;
  work_email: string;
  phone: string;
  team_size: '' | TeamSize;
  email_client: '' | EmailClient;
  role: '' | Role;
}

const EMPTY: FormState = {
  company_name: '',
  work_email: '',
  phone: '',
  team_size: '',
  email_client: '',
  role: '',
};

export interface QualifierContext {
  locale: Locale;
  market: Market;
  source: Source;
  utm: Utm;
}

type Screen =
  | { kind: 'form' }
  | { kind: 'result'; outcome: 'qualified' | 'gmail_on_request' | 'too_small'; delivered: boolean };

export function Qualifier({
  c,
  ctx,
  onFormStart,
  onFormSubmit,
  onQualifiedShown,
  onTooSmallShown,
  onBookingClick,
}: {
  c: Content;
  ctx: QualifierContext;
  onFormStart: () => void;
  onFormSubmit: (payload: QualifierPayload) => void;
  onQualifiedShown: (outcome: string, delivered: boolean) => void;
  onTooSmallShown: (delivered: boolean) => void;
  onBookingClick: () => void;
}) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [busy, setBusy] = useState(false);
  const [screen, setScreen] = useState<Screen>({ kind: 'form' });
  const [nurtureAsked, setNurtureAsked] = useState(false);
  const startFired = useRef(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const freeEmail = useMemo(() => {
    const at = values.work_email.lastIndexOf('@');
    if (at < 0) return false;
    return FREE_EMAIL_DOMAINS.has(values.work_email.slice(at + 1).trim().toLowerCase());
  }, [values.work_email]);

  const touch = useCallback(() => {
    if (startFired.current) return;
    startFired.current = true;
    onFormStart();
  }, [onFormStart]);

  const set = (name: FieldName, value: string) => {
    touch();
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
  };

  function validate(v: FormState): Partial<Record<FieldName, string>> {
    const e: Partial<Record<FieldName, string>> = {};
    if (!v.company_name.trim()) e.company_name = c.form.required;
    if (!v.work_email.trim()) e.work_email = c.form.required;
    else if (!EMAIL_RE.test(v.work_email.trim())) e.work_email = c.form.invalidEmail;
    // Deliberately loose: international formats vary and a wrong reject here
    // costs a real lead. Anything with six or more digits gets through.
    const digits = v.phone.replace(/\D/g, '');
    if (!v.phone.trim()) e.phone = c.form.required;
    else if (digits.length < 6) e.phone = c.form.invalidPhone;
    if (!v.team_size) e.team_size = c.form.required;
    if (!v.email_client) e.email_client = c.form.required;
    if (!v.role) e.role = c.form.required;
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (busy) return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = document.getElementById(`f-${Object.keys(found)[0]}`);
      first?.focus();
      return;
    }

    setBusy(true);

    /* THE CONTRACT PAYLOAD. Key order matches 00-START-HERE.md so a diff
       against Batch F reads cleanly. Do not add fields here. */
    const payload: QualifierPayload = {
      source: ctx.source,
      market: ctx.market,
      locale: ctx.locale,
      utm: {
        source: ctx.utm.source,
        medium: ctx.utm.medium,
        campaign: ctx.utm.campaign,
        content: ctx.utm.content,
      },
      company_name: values.company_name.trim(),
      work_email: values.work_email.trim(),
      phone: values.phone.trim(),
      team_size: values.team_size as TeamSize,
      email_client: values.email_client as EmailClient,
      role: values.role as Role,
      submitted_at: new Date().toISOString(),
    };

    onFormSubmit(payload);

    const decision = route(payload.team_size, payload.email_client);
    const delivery = await submitLead(payload);

    setBusy(false);
    setScreen({ kind: 'result', outcome: decision.outcome, delivered: delivery.delivered });

    if (decision.outcome === 'too_small') onTooSmallShown(delivery.delivered);
    else onQualifiedShown(decision.outcome, delivery.delivered);

    // Move focus to the result so a screen reader and a keyboard user both land
    // on the answer rather than back at the top of the form.
    window.requestAnimationFrame(() => resultRef.current?.focus());
  }

  const bookingHref =
    env.bookingUrl ||
    `mailto:${FALLBACK_CONTACT_EMAIL}?subject=${encodeURIComponent('Book a DoviLoop call')}`;

  const nurtureHref =
    `mailto:${FALLBACK_CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent(c.results.tooSmall.nurtureSubject)}` +
    `&body=${encodeURIComponent(c.results.tooSmall.nurtureMailBody)}`;

  return (
    <Section
      id="qualifier"
      n="07"
      title={screen.kind === 'form' ? c.form.title : ' '}
      lead={screen.kind === 'form' ? c.form.lead : undefined}
      rule={false}
      className="on-dark bg-charcoal text-warmwhite"
      titleId="qualifier-title"
    >
      {screen.kind === 'form' ? (
        <form noValidate onSubmit={handleSubmit} className="max-w-[760px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="f-company_name"
              label={c.form.companyLabel}
              error={errors.company_name}
              className="sm:col-span-2"
            >
              <input
                id="f-company_name"
                name="company_name"
                className="field"
                type="text"
                autoComplete="organization"
                placeholder={c.form.companyPlaceholder}
                value={values.company_name}
                aria-invalid={Boolean(errors.company_name)}
                aria-describedby={errors.company_name ? 'e-company_name' : undefined}
                onChange={(e) => set('company_name', e.target.value)}
                onFocus={touch}
              />
            </Field>

            <Field
              id="f-work_email"
              label={c.form.emailLabel}
              hint={c.form.emailHint}
              error={errors.work_email}
            >
              <input
                id="f-work_email"
                name="work_email"
                className="field"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={c.form.emailPlaceholder}
                value={values.work_email}
                aria-invalid={Boolean(errors.work_email)}
                aria-describedby={
                  [errors.work_email ? 'e-work_email' : '', 'h-work_email', freeEmail ? 'w-work_email' : '']
                    .filter(Boolean)
                    .join(' ') || undefined
                }
                onChange={(e) => set('work_email', e.target.value)}
                onFocus={touch}
              />
            </Field>

            <Field id="f-phone" label={c.form.phoneLabel} error={errors.phone}>
              <input
                id="f-phone"
                name="phone"
                className="field"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={c.form.phonePlaceholder}
                value={values.phone}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'e-phone' : undefined}
                onChange={(e) => set('phone', e.target.value)}
                onFocus={touch}
              />
            </Field>

            {/* The soft warning. Announced, never blocking. */}
            <div className="sm:col-span-2" aria-live="polite">
              {freeEmail ? (
                <p
                  id="w-work_email"
                  className="rounded-brand border border-rule-dark bg-secondary-dark px-4 py-3 text-[14.5px] leading-relaxed text-warmwhite"
                >
                  {c.form.emailFreeWarning}
                </p>
              ) : null}
            </div>

            <Field
              id="f-team_size"
              label={c.form.teamSizeLabel}
              error={errors.team_size}
              className="sm:col-span-2"
            >
              <select
                id="f-team_size"
                name="team_size"
                className="field"
                value={values.team_size}
                aria-invalid={Boolean(errors.team_size)}
                aria-describedby={errors.team_size ? 'e-team_size' : undefined}
                onChange={(e) => set('team_size', e.target.value)}
                onFocus={touch}
              >
                <option value="">{c.form.choosePrompt}</option>
                {c.form.teamSizeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="f-email_client" label={c.form.emailClientLabel} error={errors.email_client}>
              <select
                id="f-email_client"
                name="email_client"
                className="field"
                value={values.email_client}
                aria-invalid={Boolean(errors.email_client)}
                aria-describedby={errors.email_client ? 'e-email_client' : undefined}
                onChange={(e) => set('email_client', e.target.value)}
                onFocus={touch}
              >
                <option value="">{c.form.choosePrompt}</option>
                {c.form.emailClientOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="f-role" label={c.form.roleLabel} error={errors.role}>
              <select
                id="f-role"
                name="role"
                className="field"
                value={values.role}
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? 'e-role' : undefined}
                onChange={(e) => set('role', e.target.value)}
                onFocus={touch}
              >
                <option value="">{c.form.choosePrompt}</option>
                {c.form.roleOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? c.form.submitting : c.form.submit}
            </button>
            <p className="max-w-[42ch] text-[14px] text-muted-dark">{c.form.privacyNote}</p>
          </div>
        </form>
      ) : (
        <div
          ref={resultRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="max-w-[760px] outline-none"
        >
          {screen.outcome === 'too_small' ? (
            <>
              <h3 className="text-[clamp(1.6rem,3.2vw,2.3rem)]">{c.results.tooSmall.title}</h3>
              <p className="mt-5 max-w-[58ch] leading-relaxed text-warmwhite/90">
                {c.results.tooSmall.body}
              </p>

              <a
                className="btn btn-primary mt-8"
                href={PRICING_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.results.tooSmall.pricingCta}
              </a>

              <div className="mt-11 rule-top pt-7">
                <h4 className="font-display text-[1.3rem]">{c.results.tooSmall.nurtureTitle}</h4>
                <p className="mt-2.5 max-w-[56ch] text-[15px] leading-relaxed text-muted-dark">
                  {c.results.tooSmall.nurtureBody}
                </p>
                <a
                  className="btn btn-quiet mt-5"
                  href={nurtureHref}
                  onClick={() => setNurtureAsked(true)}
                >
                  {c.results.tooSmall.nurtureCta}
                </a>
                {nurtureAsked ? (
                  <p className="mt-3 text-[14px] text-muted-dark" aria-live="polite">
                    {c.form.submitting}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-[clamp(1.6rem,3.2vw,2.3rem)]">{c.results.qualified.title}</h3>
              <p className="mt-5 max-w-[56ch] leading-relaxed text-warmwhite/90">
                {c.results.qualified.body}
              </p>

              {screen.outcome === 'gmail_on_request' ? (
                <p className="mt-6 max-w-[62ch] rounded-brand border border-rule-dark bg-card-dark px-5 py-4 text-[15px] leading-relaxed">
                  {c.results.gmailNote}
                </p>
              ) : null}

              <a
                className="btn btn-primary mt-8"
                href={bookingHref}
                target={env.bookingUrl ? '_blank' : undefined}
                rel={env.bookingUrl ? 'noopener noreferrer' : undefined}
                onClick={onBookingClick}
              >
                {env.bookingUrl
                  ? c.results.qualified.bookingCta
                  : c.results.qualified.bookingFallback}
              </a>

              <div className="mt-11 rule-top pt-7">
                <h4 className="font-display text-[1.3rem]">{c.results.qualified.coversTitle}</h4>
                <ul className="mt-4 m-0 list-none p-0">
                  {c.results.qualified.covers.map((line) => (
                    <li key={line} className="flex gap-3 py-2 text-[15px] leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full"
                        style={{ background: 'var(--color-amber-dark)' }}
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* The lead is never lost. If both POST attempts failed the payload is
              already in the localStorage queue and will retry on next load, and
              the visitor still gets their booking link. */}
          {!screen.delivered ? (
            <p className="mt-9 max-w-[62ch] rounded-brand border border-rule-dark px-5 py-4 text-[14.5px] leading-relaxed text-muted-dark">
              {c.results.deliveryWarning}
            </p>
          ) : null}

          <button
            type="button"
            className="btn btn-quiet mt-9"
            onClick={() => {
              setScreen({ kind: 'form' });
              setErrors({});
            }}
          >
            {c.results.startOver}
          </button>
        </div>
      )}
    </Section>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  className = '',
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const key = id.replace(/^f-/, '');
  return (
    <div className={className}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className="field-hint" id={`h-${key}`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field-error" id={`e-${key}`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
