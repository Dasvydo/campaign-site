import { useId, useRef, useState } from 'react';
import type { Content } from '../content/types';
import type { Locale } from '../lib/types';
import { PRICING, count } from '../lib/pricing';
import { submitLead } from '../lib/lead';
import { FALLBACK_CONTACT_EMAIL } from '../lib/env';
import { Disclosure } from './Disclosure';

/**
 * The secondary path: a larger firm, invited to write rather than to start.
 *
 * WHERE IT SITS AND WHY IT IS QUIET. Last section before the footer, after the
 * worked example and the audience folders. Self-serve is the motion this page
 * sells and the trial CTA above is the ask; a reader scanning for "start the
 * trial" must not land here by mistake. So this block never says trial, it
 * sits last, and its one button is a form submit that sends an email rather
 * than an anchor that starts something.
 *
 * What separates it is NOT colour. This header used to claim the block
 * "carries no espresso pill on the cream ground", which read as a contrast
 * with the page's call to action. The panel below is `.on-dark`, so
 * `.on-dark .btn-primary` renders this submit warmwhite on charcoal - and the
 * tiers section four up is `.on-dark` too, so the trial CTA inside it gets the
 * very same rule and the very same treatment. The espresso pill on cream is
 * the HERO's button, at the top of the page. It is the answer to "we are ten
 * people with a procurement form", not a second front door.
 *
 * IT REJECTS NOBODY. The deleted fit check was 727 lines with a routing table,
 * two screens and a `too_small` outcome that redirected firms under ten people
 * to another site. Under per seat pricing a small firm is a customer. Nothing
 * below scores, routes or turns anyone away: it asks four things and posts
 * them.
 *
 * TWO PATTERNS KEPT FROM THAT FORM, BOTH VERIFIED BEHAVIOURS.
 *   1. Only fields the reader can currently see are validated. This form is
 *      one screen, so that is every field while the form is up and none of
 *      them once it has been replaced by its result. An error the reader
 *      cannot find is worse than no error.
 *   2. The free email provider check renders a SOFT WARNING and never blocks.
 *      A ten person brokerage genuinely might be on a personal address, and a
 *      form that refuses one loses the lead to make a point.
 *
 * DELIVERY IS lib/lead.ts, UNTOUCHED. It does the POST, one retry after 1.2s,
 * the localStorage queue capped at twenty with a fourteen day expiry, the
 * oldest first flush on the next load, and `dedupe_id` in the body. This file
 * defines its own payload shape and hands it over; it does not reimplement any
 * of that, and the three result states below are exactly the three answers
 * `submitLead` can give: delivered, queued, or neither.
 *
 * ONLY ONE OF THOSE THREE RAISES AN EVENT, AND DELIBERATELY SO. `onDelivered`
 * is called when, and only when, the enquiry ARRIVED. The reader sees their
 * result screen in all three cases, because that is about them; the analytics
 * event is about whether there is a lead to answer, and the two are not the
 * same question.
 *
 *   delivered - the POST was accepted, on the first attempt or the retry. The
 *               enquiry is in the inbox, so `enterprise_enquiry` is raised and
 *               carries `attempts`, which is the only way to see from the
 *               dashboard that the webhook needed a second go.
 *   queued    - both attempts failed and the payload is in this visitor's
 *               localStorage. Nothing is raised. An enquiry sitting in a
 *               browser is not an enquiry: nobody can answer it, and counting
 *               it would put a lead on the dashboard that is not in the inbox.
 *               It goes out on that visitor's next load through
 *               flushLeadQueue, which knows nothing about which form wrote it
 *               and runs before a consent decision is necessarily in, so it is
 *               not the place to raise an event either. The cost is stated
 *               rather than papered over: an enquiry recovered from the queue
 *               is invisible to PostHog and visible in n8n, and n8n is the
 *               system of record for leads.
 *   neither   - both attempts failed and the queue could not be written
 *               (storage blocked or full). Nothing is raised, for the same
 *               reason, and the result screen hands the reader the mailto.
 *
 * NO PERSONAL DATA GOES TO POSTHOG. The name, the email and the note go to the
 * lead webhook, which is what they were typed for. The event carries the head
 * count and the attempt count and nothing else.
 *
 * THE FORM IS ON THE DARK PANEL ON PURPOSE. `.field` in index.css re-points
 * its focus ring to --ix-ring-dark because it assumes a charcoal ground; on
 * cream that ring measures about 2.5:1. Putting the fields where the class
 * expects them is the fix, not overriding the ring back.
 */

/** What one enquiry carries. A type alias rather than an interface, because
    only an alias gets the implicit index signature `LeadPayload` wants. */
type EnterpriseLead = {
  form: 'enterprise_enquiry';
  name: string;
  email: string;
  people: number;
  note: string;
  locale: Locale;
  path: string;
  submitted_at: string;
};

/** Consumer mailbox providers, for the soft warning only. Never a gate, so the
    list being incomplete costs a nudge and not a lead. */
const FREE_EMAIL = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'hotmail.co.uk', 'hotmail.dk',
  'live.com', 'live.dk', 'msn.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.dk', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com', 'aol.com', 'gmx.com', 'gmx.net', 'gmx.de', 'web.de',
  't-online.de', 'mail.com', 'mail.ru', 'yandex.com', 'proton.me', 'protonmail.com',
  'zoho.com', 'mail.dk', 'post.dk', 'inbox.lt', 'one.lt', 'zebra.lt', 'takas.lt', 'centras.lt',
]);

const domainOf = (v: string) => v.trim().toLowerCase().split('@')[1] ?? '';
const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v.trim());

type Sent = { kind: 'sent' } | { kind: 'held' } | { kind: 'lost' };

export function Enterprise({
  c,
  locale,
  onDelivered,
}: {
  c: Content;
  locale: Locale;
  /* Called once per enquiry that ARRIVED. Not called for the queued or the
     undelivered outcome; see the header. */
  onDelivered: (info: { people: number; attempts: number }) => void;
}) {
  const t = c.enterprise;
  const f = t.form;
  const uid = useId();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [fields, setFields] = useState({ name: '', email: '', people: '', note: '' });
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'people', string>>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);

  /* Editing a field clears that field's complaint. An error that survives the
     correction tells the reader their fix did not count, and on a four field
     form the whole block can end up red while every field is already right. */
  const set = (key: keyof typeof fields) => (value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (key in prev ? { ...prev, [key]: undefined } : prev));
  };

  /* The warning, not an error: it is computed from what is typed and is never
     consulted by `check` below. */
  const personal = looksLikeEmail(fields.email) && FREE_EMAIL.has(domainOf(fields.email));

  /* Every field here is on the screen. A second screen would validate only its
     own, which is the rule this keeps by having nothing to hide behind. */
  const check = () => {
    const found: typeof errors = {};
    if (!fields.name.trim()) found.name = f.errorName;
    if (!fields.email.trim()) found.email = f.errorEmail;
    else if (!looksLikeEmail(fields.email)) found.email = f.errorEmailShape;
    /* The form is `noValidate`, so `min={1}` and `step={1}` on the input are
       decorative - the browser never enforces them, and `Number()` turns "3.7"
       into 3.7 and "1e5" into 100000. Both used to reach the webhook verbatim:
       a head count of three and seven tenths of a person, and a hundred
       thousand seats out of three keystrokes. Testing the STRING keeps this a
       format rule rather than a policy one - a firm that really does have a
       hundred thousand people can still say so, but it has to type it out. */
    const people = fields.people.trim();
    if (!/^\d+$/.test(people) || Number(people) < 1) found.people = f.errorSize;
    return found;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const found = check();
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setBusy(true);
    const payload: EnterpriseLead = {
      form: 'enterprise_enquiry',
      name: fields.name.trim(),
      email: fields.email.trim(),
      people: Number(fields.people),
      note: fields.note.trim(),
      locale,
      path: window.location.pathname,
      submitted_at: new Date().toISOString(),
    };
    const res = await submitLead(payload);
    setBusy(false);
    setSent(res.delivered ? { kind: 'sent' } : res.queued ? { kind: 'held' } : { kind: 'lost' });
    /* After the result screen is set, and never in front of it: analytics must
       not be able to delay or break what the reader is waiting for. */
    if (res.delivered) onDelivered({ people: payload.people, attempts: res.attempts });
  };

  const result =
    sent?.kind === 'sent'
      ? { title: f.sentTitle, body: f.sentBody, mail: false }
      : sent?.kind === 'held'
        ? { title: f.heldTitle, body: f.heldBody, mail: true }
        : { title: f.lostTitle, body: f.lostBody, mail: true };

  return (
    <section id="enterprise" aria-labelledby="ent-h">
      <div className="ent-wrap">
        <div className="ent-say">
          <p className="ent-eyebrow">{t.eyebrow}</p>
          <h2 className="ent-h" id="ent-h">
            {t.title}
          </h2>
          {/* The seat floor is the largest tier's own count, printed between
              the two halves the locale wrote around it. Not one figure in the
              copy file. */}
          <p className="ent-lede">
            {t.lede.before}
            <span className="ent-fig">{count(PRICING.tiers.managed.seats, c.htmlLang)}</span>
            {t.lede.after}
          </p>

          {/* Where the software itself runs. The sentence is the hero's, word
              for word, recovered from 92c89c7~1: it was taken off the first
              screen because it read as contradicting "Nothing to install" one
              section below it, and this is four sections further down, in the
              one block where a firm handling client correspondence is actually
              asking the question. */}
          <div className="ent-host">
            <h3 className="ent-host-h">{t.hostingLabel}</h3>
            <p className="ent-host-p">{t.hosting}</p>
          </div>

          {/* The objection a regulated trade asks first, rendered from
              `who.accuracy` rather than rewritten. It is already answered in
              full one section up, so it sits behind a disclosure here: a
              procurement reader opens it, a scanner is not shown the same four
              lines twice in a row. */}
          <Disclosure label={c.who.accuracy.title}>
            <ul className="ent-acc-list">
              {c.who.accuracy.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Disclosure>
        </div>

        {/* on-dark flips all six dark ground values at once, and the fields
            take .field, which index.css built for exactly this panel. */}
        <div className="ent-panel on-dark">
          {sent ? (
            <div className="ent-done" role="status">
              <h3 className="ent-done-h">{result.title}</h3>
              <p className="ent-done-p">{result.body}</p>
              {result.mail ? (
                <p className="ent-done-mail">
                  {f.mailLead}{' '}
                  <a className="ix-link" href={`mailto:${FALLBACK_CONTACT_EMAIL}`}>
                    {FALLBACK_CONTACT_EMAIL}
                  </a>
                </p>
              ) : null}
            </div>
          ) : (
            <form ref={formRef} className="ent-form" onSubmit={onSubmit} noValidate>
              <h3 className="ent-form-h" id={`${uid}-h`}>
                {f.title}
              </h3>
              <p className="ent-form-p">{f.intro}</p>

              <div className="ent-field">
                <label className="field-label" htmlFor={`${uid}-name`}>
                  {f.nameLabel}
                </label>
                <input
                  className="field"
                  id={`${uid}-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder={f.namePlaceholder}
                  value={fields.name}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? `${uid}-name-e` : undefined}
                  onChange={(e) => set('name')(e.target.value)}
                />
                {errors.name ? (
                  <p className="field-error" id={`${uid}-name-e`}>
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div className="ent-field">
                <label className="field-label" htmlFor={`${uid}-email`}>
                  {f.emailLabel}
                </label>
                <input
                  className="field"
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={fields.email}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={`${uid}-email-h${errors.email ? ` ${uid}-email-e` : ''}`}
                  onChange={(e) => set('email')(e.target.value)}
                />
                {/* The hint and the soft warning share one live region, so the
                    nudge is announced when it appears and the field keeps one
                    description rather than growing a second one. The warning
                    is never consulted by `check`: it cannot block a submit. */}
                <p className="field-hint" id={`${uid}-email-h`} role="status">
                  {personal ? <span className="ent-warn">{f.emailFree}</span> : f.emailHint}
                </p>
                {errors.email ? (
                  <p className="field-error" id={`${uid}-email-e`}>
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="ent-field">
                <label className="field-label" htmlFor={`${uid}-people`}>
                  {f.sizeLabel}
                </label>
                {/* The reader types the count, so no seat band is written into
                    the copy and no option list has to be translated. */}
                <input
                  className="field ent-num"
                  id={`${uid}-people`}
                  name="people"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={fields.people}
                  aria-invalid={errors.people ? true : undefined}
                  aria-describedby={`${uid}-people-h${errors.people ? ` ${uid}-people-e` : ''}`}
                  onChange={(e) => set('people')(e.target.value)}
                />
                <p className="field-hint" id={`${uid}-people-h`}>
                  {f.sizeHint}
                </p>
                {errors.people ? (
                  <p className="field-error" id={`${uid}-people-e`}>
                    {errors.people}
                  </p>
                ) : null}
              </div>

              <div className="ent-field">
                <label className="field-label" htmlFor={`${uid}-note`}>
                  {f.noteLabel}
                </label>
                <textarea
                  className="field ent-note"
                  id={`${uid}-note`}
                  name="note"
                  rows={3}
                  placeholder={f.notePlaceholder}
                  value={fields.note}
                  aria-describedby={`${uid}-note-h`}
                  onChange={(e) => set('note')(e.target.value)}
                />
                <p className="field-hint" id={`${uid}-note-h`}>
                  {f.noteHint}
                </p>
              </div>

              <button className="btn btn-primary ent-send" type="submit" disabled={busy}>
                {busy ? f.sending : f.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
