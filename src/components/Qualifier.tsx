import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Mark } from './Hero';

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

  /* The stylesheet keeps the form hidden until this says the script is running.
     In the prototype that guarded a form which could not submit; here it guards
     a form that would collect six answers and have nowhere to send them. The
     whole page is a single page app, so index.html's <noscript> is what a
     visitor without JavaScript actually sees. */
  const [hasJs, setHasJs] = useState(false);
  useEffect(() => setHasJs(true), []);

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

  /* The three closed questions are radio chips rather than selects. A select
     hides its options until you open it, which on a six question form is one
     more thing to open; the chips put every answer on the page, and a radio
     group is the right thing semantically either way. The payload is unchanged:
     the same names and the same values reach lib/contract, which WF-C1 parses. */
  const groups: {
    name: FieldName;
    label: string;
    options: { value: string; label: string }[];
  }[] = [
    { name: 'team_size', label: c.form.teamSizeLabel, options: c.form.teamSizeOptions },
    { name: 'email_client', label: c.form.emailClientLabel, options: c.form.emailClientOptions },
    { name: 'role', label: c.form.roleLabel, options: c.form.roleOptions },
  ];

  return (
    <section id="qualifier" aria-labelledby="qualifier-h" data-js={hasJs ? 'on' : undefined}>
      <div className="qualifier-wrap">
        <div className="qualifier-head" id="fit" tabIndex={-1}>
          <p className="qualifier-kicker">
            <span className="qualifier-folio" aria-hidden="true">
              06
            </span>
            <span className="qualifier-kicker-rule" aria-hidden="true" />
            <span className="qualifier-eyebrow">{c.form.eyebrow}</span>
          </p>
          <h2 className="qualifier-h" id="qualifier-h">
            {screen.kind === 'form' ? c.form.title : ' '}
          </h2>
        </div>

        <div className="qualifier-sheet">
          <div className="qualifier-letterhead">
            <span className="qualifier-mark" aria-hidden="true">
              <Mark gradientId="qualifier-dl-d" />
            </span>
            <span className="qualifier-wordmark">DoviLoop</span>
            <span className="qualifier-formno">{c.form.formNo}</span>
          </div>

          <div className="qualifier-body">
            {screen.kind === 'form' ? (
              <form className="qualifier-form" noValidate onSubmit={handleSubmit}>
                <p className="qualifier-lead qualifier-indent">{c.form.lead}</p>

                <TextField
                  n="01"
                  id="company_name"
                  label={c.form.companyLabel}
                  error={errors.company_name}
                  value={values.company_name}
                  onChange={(v) => set('company_name', v)}
                  onFocus={touch}
                  inputProps={{ type: 'text', autoComplete: 'organization', required: true }}
                />

                <TextField
                  n="02"
                  id="work_email"
                  label={c.form.emailLabel}
                  hint={c.form.emailHint}
                  error={errors.work_email}
                  value={values.work_email}
                  onChange={(v) => set('work_email', v)}
                  onFocus={touch}
                  extraDescribedBy={freeEmail ? 'w-work_email' : undefined}
                  inputProps={{
                    type: 'email',
                    inputMode: 'email',
                    autoComplete: 'email',
                    spellCheck: false,
                    required: true,
                  }}
                />

                {/* The soft warning. Announced, never blocking. */}
                <div className="qualifier-indent" aria-live="polite">
                  {freeEmail ? (
                    <p className="qualifier-warn" id="w-work_email">
                      {c.form.emailFreeWarning}
                    </p>
                  ) : null}
                </div>

                {/* The prototype marked this one Optional. The live form
                    requires it, and a label that says optional beside a field
                    which blocks submission is simply untrue, so the marker is
                    not carried across. c.form.optional stays in the contract
                    for whenever a field genuinely is. */}
                <TextField
                  n="03"
                  id="phone"
                  label={c.form.phoneLabel}
                  error={errors.phone}
                  value={values.phone}
                  onChange={(v) => set('phone', v)}
                  onFocus={touch}
                  inputProps={{ type: 'tel', inputMode: 'tel', autoComplete: 'tel' }}
                />

                {groups.map((g, i) => {
                  const errId = 'e-' + g.name;
                  const labelId = 'l-' + g.name;
                  return (
                    <div
                      className="qualifier-field qualifier-group"
                      data-field={g.name}
                      role="radiogroup"
                      aria-required="true"
                      aria-labelledby={labelId}
                      aria-describedby={errors[g.name] ? errId : undefined}
                      key={g.name}
                    >
                      <span className="qualifier-num" aria-hidden="true">
                        {'0' + (i + 4)}
                      </span>
                      <span className="qualifier-label" id={labelId}>
                        {g.label}
                      </span>
                      <p className="qualifier-err" id={errId} hidden={!errors[g.name]}>
                        {errors[g.name]}
                      </p>
                      <div className="qualifier-chips">
                        {g.options.map((o) => (
                          <label className="qualifier-chip" key={o.value}>
                            <input
                              type="radio"
                              name={g.name}
                              value={o.value}
                              checked={values[g.name] === o.value}
                              onChange={() => set(g.name, o.value)}
                              onFocus={touch}
                            />
                            <span className="qualifier-chip-box" aria-hidden="true">
                              <svg viewBox="0 0 20 20" focusable="false">
                                <path d="M3 11 L8 15 L17 5" />
                              </svg>
                            </span>
                            <span>{o.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="qualifier-actions qualifier-indent">
                  <button type="submit" className="qualifier-submit" disabled={busy}>
                    {busy ? c.form.submitting : c.form.submit}
                  </button>
                </div>

                <p className="qualifier-reassure qualifier-indent">{c.form.privacyNote}</p>
              </form>
            ) : (
              <div
                className="qualifier-result qualifier-indent"
                ref={resultRef}
                tabIndex={-1}
                role="status"
                aria-live="polite"
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
                      <p className="mt-2.5 max-w-[56ch] text-[15.5px] leading-relaxed text-muted-dark">
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

                    {/* Under the button rather than above it, because it is an
                        instruction for the page the button opens and not a
                        reason to press it. Shown on both branches: the fallback
                        is a mailto, and a lead who writes in from a different
                        address is the same unmatched booking by another route. */}
                    <p className="mt-4 max-w-[52ch] text-[14.5px] leading-relaxed text-warmwhite/90">
                      {c.results.qualified.sameEmail}
                    </p>

                    <div className="mt-11 rule-top pt-7">
                      <h4 className="font-display text-[1.3rem]">{c.results.qualified.coversTitle}</h4>
                      <ul className="mt-4 m-0 list-none p-0">
                        {c.results.qualified.covers.map((line) => (
                          <li key={line} className="flex gap-3 py-2 text-[15.5px] leading-relaxed">
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

          </div>
        </div>
      </div>
    </section>
  );
}

/** One numbered question with a text control.
    The number is decorative: the label already names the field, and a screen
    reader reading "01 Company name" adds nothing but noise. */
function TextField({
  n,
  id,
  label,
  hint,
  optional,
  error,
  value,
  onChange,
  onFocus,
  extraDescribedBy,
  inputProps,
}: {
  n: string;
  id: string;
  label: string;
  hint?: string;
  optional?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  extraDescribedBy?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const errId = 'e-' + id;
  const hintId = 'h-' + id;
  const describedBy =
    [error ? errId : '', hint ? hintId : '', extraDescribedBy ?? ''].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className="qualifier-field" data-field={id}>
      <span className="qualifier-num" aria-hidden="true">
        {n}
      </span>
      <label className="qualifier-label" htmlFor={'f-' + id}>
        {label}
        {optional ? <span className="qualifier-optional">{optional}</span> : null}
      </label>
      <p className="qualifier-err" id={errId} hidden={!error}>
        {error}
      </p>
      <div className="qualifier-control">
        <input
          className="qualifier-input"
          id={'f-' + id}
          name={id}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          {...inputProps}
        />
      </div>
      {hint ? (
        <p className="qualifier-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
