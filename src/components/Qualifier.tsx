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
 * Five fields mapping onto the shared contract in 00-START-HERE.md,
 * asked across two screens. The three outcomes are rendered client-side from
 * lib/contract.ts `route()`, which is the same rules table Batch F applies
 * server side. The table is written down in exactly one place so the two
 * implementations cannot drift apart quietly.
 *
 * The screens are a presentation choice and reach no further than this file.
 * The payload is still assembled in the key order the contract fixes, from
 * `values`, whatever order the screens happened to collect them in, and no
 * field was added, dropped or renamed to make the split possible.
 */

/* Which questions live on which screen.

   The three closed questions go first because they cost a click rather than a
   keystroke. A form whose first line is "company name" asks for the commitment
   before it has earned any, and these three are the half of the form that is
   actually about the reader's firm rather than about reaching them.

   This is also the list each screen is validated against, so a screen can only
   ever complain about a field the reader can see. */
const STEP_FIELDS: Record<1 | 2, readonly FieldName[]> = {
  1: ['team_size', 'email_client', 'role'],
  2: ['company_name', 'work_email', 'phone'],
};

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

type FieldName =
  | 'company_name'
  | 'work_email'
  | 'phone'
  | 'team_size'
  | 'email_client'
  | 'email_client_other'
  | 'role'
  | 'role_other';

interface FormState {
  company_name: string;
  work_email: string;
  /* Asked again since 2026-09-22. It was taken off the form on 2026-09-19
     (T23) to keep the count down, and the contract kept carrying the key with
     an empty string in it, which is why putting it back costs nothing on the
     wire: `phone` is already declared, already accepted by the n8n validator
     and already type checked by the mock.

     Required since 2026-09-22, the founder's call: it shipped optional that
     morning and an optional number on a lead form is a number most people do
     not give. The form's heading is untouched by this, because it counts the
     three closed questions on the first screen and has never counted the
     contact details on the second. */
  phone: string;
  team_size: '' | TeamSize;
  email_client: '' | EmailClient;
  /* What they typed after picking "Something else". Kept even if they change
     their mind back to Outlook - it is only READ while the answer is 'other',
     so a reader who wanders through the options and returns does not have to
     type it again. It is not sent unless it is being read. */
  email_client_other: string;
  role: '' | Role;
  role_other: string;
}

const EMPTY: FormState = {
  company_name: '',
  work_email: '',
  phone: '',
  team_size: '',
  email_client: '',
  email_client_other: '',
  role: '',
  role_other: '',
};

/** The one option that opens a box. Both lists use the same value. */
const OTHER = 'other';

/** Which of the three closed questions offer a box when "other" is picked.
    Team size does not: "50 or more" is already the open end of that scale. */
const opensBox = (name: FieldName): name is 'email_client' | 'role' =>
  name === 'email_client' || name === 'role';

/** The field that holds what they typed, for a question that has one. */
const otherFieldOf = (name: 'email_client' | 'role'): 'email_client_other' | 'role_other' =>
  name === 'email_client' ? 'email_client_other' : 'role_other';

export interface QualifierContext {
  locale: Locale;
  market: Market;
  source: Source;
  utm: Utm;
}

type Screen =
  | { kind: 'form'; step: 1 | 2 }
  | { kind: 'result'; outcome: 'qualified' | 'gmail_on_request' | 'too_small'; delivered: boolean };

export function Qualifier({
  c,
  ctx,
  onFormStart,
  onFormStep,
  onFormSubmit,
  onQualifiedShown,
  onTooSmallShown,
  onBookingClick,
}: {
  c: Content;
  ctx: QualifierContext;
  onFormStart: () => void;
  onFormStep: (step: number) => void;
  onFormSubmit: (payload: QualifierPayload) => void;
  onQualifiedShown: (outcome: string, delivered: boolean) => void;
  onTooSmallShown: (delivered: boolean) => void;
  onBookingClick: () => void;
}) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [busy, setBusy] = useState(false);
  const [screen, setScreen] = useState<Screen>({ kind: 'form', step: 1 });
  const startFired = useRef(false);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const stepRef = useRef<HTMLLIElement | null>(null);

  /* The stylesheet keeps the form hidden until this says the script is running.
     In the prototype that guarded a form which could not submit; here it guards
     a form that would collect five answers and have nowhere to send them. The
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
    /* Required, and still deliberately loose about the shape: international
       formats vary and a wrong reject here costs a real lead. Anything with
       six or more digits gets through. Two different complaints, because
       "needed" and "that is not a number" are different mistakes and telling
       someone their empty box is malformed helps nobody. */
    if (!v.phone.trim()) e.phone = c.form.required;
    else if ((v.phone.match(/\d/g) ?? []).length < 6) e.phone = c.form.invalidPhone;
    if (!v.team_size) e.team_size = c.form.required;
    if (!v.email_client) e.email_client = c.form.required;
    if (!v.role) e.role = c.form.required;
    return e;
  }

  /* Moving between the two screens.

     Focus goes to the step that is now current, which is the only thing on the
     page that says which one that is. Without it a keyboard user presses
     Continue and lands back at the top of the document with three new questions
     somewhere below them, and a screen reader is told nothing at all. */
  const goTo = (step: 1 | 2) => {
    setScreen({ kind: 'form', step });
    setErrors({});
    window.requestAnimationFrame(() => stepRef.current?.focus());
  };

  /** The first field of a screen that has something wrong with it, in the order
      the screen presents them rather than the order the errors were found. */
  const firstBad = (
    found: Partial<Record<FieldName, string>>,
    step: 1 | 2,
  ): FieldName | undefined => STEP_FIELDS[step].find((f) => found[f]);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (busy || screen.kind !== 'form') return;

    const found = validate(values);

    /* The first screen is checked on its own, so it cannot complain about a
       field that is not on it. Nothing is sent here: this is a page turn. */
    if (screen.step === 1) {
      const mine = Object.fromEntries(
        STEP_FIELDS[1].filter((f) => found[f]).map((f) => [f, found[f]]),
      ) as Partial<Record<FieldName, string>>;
      setErrors(mine);
      const bad = firstBad(mine, 1);
      if (bad) {
        document.getElementById(`f-${bad}`)?.focus();
        return;
      }
      goTo(2);
      onFormStep(2);
      return;
    }

    /* The second screen is checked against the whole form. By now the only way
       a first screen answer can be missing is something having gone wrong, and
       the right response to that is to put the reader back where the missing
       answer lives rather than to show them an error for a field they cannot
       see. The errors are set after the page turn so `goTo` does not clear
       the very thing being reported. */
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const back = firstBad(found, 1);
      if (back) {
        goTo(1);
        setErrors(found);
        window.requestAnimationFrame(() => document.getElementById(`f-${back}`)?.focus());
        return;
      }
      document.getElementById(`f-${firstBad(found, 2)}`)?.focus();
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
      /* Asked again since 2026-09-22, at the founder's request, so he can see
         a number against a lead. The key never left the contract, so nothing
         downstream changes shape: it carried '' while the page did not ask,
         and carries what was typed now that it does. Still '' when the box is
         left empty, which the n8n validator already accepts. */
      phone: values.phone.trim(),
      team_size: values.team_size as TeamSize,
      email_client: values.email_client as EmailClient,
      role: values.role as Role,
      /* Sent only where there is something to send. Spreading a conditional
         object leaves the key out entirely rather than sending an empty
         string, so a payload from a reader who picked Outlook is byte for byte
         the payload the contract described before these two existed. That is
         what keeps this additive for anything downstream that was written
         against the old shape. */
      ...(values.email_client === OTHER && values.email_client_other.trim()
        ? { email_client_other: values.email_client_other.trim() }
        : {}),
      ...(values.role === OTHER && values.role_other.trim()
        ? { role_other: values.role_other.trim() }
        : {}),
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


  /* The three closed questions are radio chips rather than selects. A select
     hides its options until you open it, which on a five question form is one
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
          {/* The rule went with the number it separated. It sat between the
              folio and the eyebrow; with the folio gone it hung off the left
              of the section as a dash attached to nothing - "- WHAT DO I DO
              NOW". A separator needs two things to separate. */}
          <p className="qualifier-kicker">
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

          <div className="qualifier-body" data-screen={screen.kind}>
            {screen.kind === 'form' ? (
              <form className="qualifier-form" noValidate onSubmit={handleSubmit}>
                <p className="qualifier-lead qualifier-indent">{c.form.lead}</p>

                {/* Where they are, and how far there is to go.

                    The list is the only thing on the page that says which
                    screen is open, so `aria-current` carries that fact and
                    focus is sent here on every page turn. Names rather than
                    "1 of 2": a name says what the screen is going to ask for,
                    and a numeral inside a phrase that has to agree with it is
                    the thing the price band had to be rewritten to stop
                    doing. */}
                <ol className="qualifier-steps qualifier-indent" aria-label={c.form.stepsLabel}>
                  {c.form.steps.map((title, i) => {
                    const on = i + 1 === screen.step;
                    return (
                      <li
                        className={'qualifier-step' + (on ? ' is-on' : '')}
                        aria-current={on ? 'step' : undefined}
                        ref={on ? stepRef : undefined}
                        tabIndex={on ? -1 : undefined}
                        key={title}
                      >
                        {title}
                      </li>
                    );
                  })}
                </ol>

                {screen.step === 1 ? (
  groups.map((g, i) => {
                    const errId = 'e-' + g.name;
                    const labelId = 'l-' + g.name;
                    /* Resolved once, here, rather than narrowed inside the
                       JSX: a type predicate on `g.name` does not survive being
                       read twice in one expression, and a local const says the
                       same thing more plainly anyway. Null for the question
                       that has no box. */
                    const otherField = opensBox(g.name) ? otherFieldOf(g.name) : null;
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
                          {'0' + (i + 1)}
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
                        {/* "Something else" is not an answer, it is the absence
                            of one. The box turns it back into an answer.

                            It appears only once that option is chosen, and what
                            is typed in it rides the payload only while it is
                            showing, so a reader who tries "Something else",
                            types a word and then picks Outlook sends a payload
                            with no trace of the word - and one who wanders back
                            to "Something else" finds their word still there
                            rather than having to type it twice.

                            Optional on purpose. It is the last thing between a
                            reader and the end of a form they are already
                            filling in, and a lead that arrives saying "other"
                            is worth more than no lead at all. */}
                        {otherField && values[g.name] === OTHER ? (
                          <div className="qualifier-other">
                            <label
                              className="qualifier-other-label"
                              htmlFor={'q-' + g.name + '-other'}
                            >
                              {c.form.otherLabel}
                              <span className="qualifier-optional">{c.form.optional}</span>
                            </label>
                            <input
                              className="qualifier-input"
                              id={'q-' + g.name + '-other'}
                              name={g.name + '_other'}
                              type="text"
                              autoComplete="off"
                              maxLength={80}
                              value={values[otherField]}
                              onChange={(e) => set(otherField, e.currentTarget.value)}
                              onFocus={touch}
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <>
                    <TextField
                      n="04"
                      id="company_name"
                      label={c.form.companyLabel}
                      error={errors.company_name}
                      value={values.company_name}
                      onChange={(v) => set('company_name', v)}
                      onFocus={touch}
                      inputProps={{ type: 'text', autoComplete: 'organization', required: true }}
                    />

                    <TextField
                      n="05"
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

                    <TextField
                      n="06"
                      id="phone"
                      label={c.form.phoneLabel}
                      hint={c.form.phoneHint}
                      error={errors.phone}
                      value={values.phone}
                      onChange={(v) => set('phone', v)}
                      onFocus={touch}
                      inputProps={{
                        type: 'tel',
                        inputMode: 'tel',
                        autoComplete: 'tel',
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

                  </>
                )}

                <div className="qualifier-actions qualifier-indent">
                  {screen.step === 2 ? (
                    <button type="button" className="qualifier-back" onClick={() => goTo(1)}>
                      {c.form.backCta}
                    </button>
                  ) : null}
                  {/* One button, two jobs. On the first screen it turns the
                      page and sends nothing, which is why its label does not
                      promise an answer; on the second it is the submit it
                      always was. Both are type="submit" so that pressing
                      Enter in a field does the obvious thing on either. */}
                  <button type="submit" className="qualifier-submit" disabled={busy}>
                    {screen.step === 1
                      ? c.form.continueCta
                      : busy
                        ? c.form.submitting
                        : c.form.submit}
                  </button>
                </div>

                <p className="qualifier-reassure qualifier-indent">{c.form.privacyNote}</p>
              </form>
            ) : (
              <div
                className="qualifier-result"
                ref={resultRef}
                tabIndex={-1}
                role="status"
                aria-live="polite"
              >
                {screen.outcome === 'too_small' ? (
                  <>
                    <h3 className="qualifier-result-h">{c.results.tooSmall.title}</h3>
                    <p className="qualifier-result-lead">{c.results.tooSmall.body}</p>

                    <a
                      className="btn btn-primary qualifier-result-cta"
                      href={PRICING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {c.results.tooSmall.pricingCta}
                    </a>

                  </>
                ) : (
                  <>
                    <h3 className="qualifier-result-h">{c.results.qualified.title}</h3>
                    <p className="qualifier-result-lead">{c.results.qualified.body}</p>

                    {screen.outcome === 'gmail_on_request' ? (
                      <p className="qualifier-result-note">{c.results.gmailNote}</p>
                    ) : null}

                    <a
                      className="btn btn-primary qualifier-result-cta"
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
                    <p className="qualifier-result-aside">{c.results.qualified.sameEmail}</p>

                    <div className="qualifier-result-more">
                      <h4 className="qualifier-result-more-h">{c.results.qualified.coversTitle}</h4>
                      <ul className="qualifier-covers">
                        {c.results.qualified.covers.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* The lead is never lost. If both POST attempts failed the payload is
                    already in the localStorage queue and will retry on next load, and
                    the visitor still gets their booking link. */}
                {!screen.delivered ? (
                  <p className="qualifier-result-warn">{c.results.deliveryWarning}</p>
                ) : null}

                <button
                  type="button"
                  className="btn btn-quiet qualifier-result-again"
                  onClick={() => {
                    setScreen({ kind: 'form', step: 1 });
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
