/**
 * Test harness. Not shipped. Bundled and run by scripts/verify-payload.mjs.
 *
 * Renders the REAL <Qualifier /> component into jsdom, walks both screens of
 * the form, fills all six fields, submits, and lets the real lib/lead.ts POST
 * over real HTTP to the local mock webhook. Nothing about the payload is
 * reconstructed for the test: what the mock validates is what a browser would
 * actually send, and it has to still be one POST of six fields however many
 * screens they were collected on.
 */
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Qualifier } from '../src/components/Qualifier';
import { content } from '../src/content';
import type { Locale } from '../src/lib/contract';

interface Scenario {
  name: string;
  locale: Locale;
  team_size: string;
  email_client: string;
  role: string;
  email: string;
  expect: 'qualified' | 'gmail_on_request' | 'too_small';
}

declare global {
  // eslint-disable-next-line no-var
  var __RESULTS__: unknown[];
  // eslint-disable-next-line no-var
  var __SCENARIOS__: Scenario[];
  // eslint-disable-next-line no-var
  var __RUN__: () => Promise<void>;
}

const results: Array<Record<string, unknown>> = [];

function setValue(el: HTMLInputElement | HTMLSelectElement, value: string) {
  const proto =
    el instanceof globalThis.HTMLSelectElement
      ? globalThis.HTMLSelectElement.prototype
      : globalThis.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Tick the radio in `name` whose value is `value`, the way a person would. */
function check(host: HTMLElement, name: string, value: string) {
  const el = host.querySelector<HTMLInputElement>(
    `input[type="radio"][name="${name}"][value="${value}"]`,
  );
  if (!el) throw new Error(`no radio ${name}=${value} on the form`);
  el.click();
}

async function runOne(s: Scenario) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  const events: string[] = [];
  let shownOutcome: string | null = null;

  await act(async () => {
    root.render(
      <Qualifier
        c={content[s.locale]}
        ctx={{
          locale: s.locale,
          market: s.locale === 'da' ? 'dk' : s.locale === 'lt' ? 'lt' : 'global',
          source: 'ad',
          utm: {
            source: 'meta',
            medium: 'paid_social',
            campaign: 'teams_launch_sept',
            content: 'static_a',
          },
        }}
        onFormStart={() => events.push('form_start')}
        onFormStep={() => events.push('form_step')}
        onFormSubmit={() => events.push('form_submit')}
        onQualifiedShown={(outcome) => {
          events.push('qualified_shown');
          shownOutcome = outcome;
        }}
        onTooSmallShown={() => {
          events.push('too_small_shown');
          shownOutcome = 'too_small';
        }}
        onBookingClick={() => events.push('booking_click')}
      />,
    );
  });

  const q = <T extends Element>(sel: string) => host.querySelector<T>(sel)!;
  const submit = async () => {
    await act(async () => {
      q<HTMLFormElement>('form').dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });
  };

  /* Screen one: the three closed questions, which the form now asks first.

     They became radio groups when the page was ported from the prototype. The
     values they send are unchanged, which is the whole point of checking here,
     so the harness picks the radio by value rather than setting a select's. */
  await act(async () => {
    check(host, 'team_size', s.team_size);
    check(host, 'email_client', s.email_client);
    check(host, 'role', s.role);
  });

  /* This submit turns the page and sends nothing. If it ever starts sending,
     the mock sees a payload with three empty strings in it and says so. */
  await submit();
  const reachedStepTwo = Boolean(host.querySelector('#f-company_name'));

  /* Bail out with a report rather than a stack trace.

     Everything below reaches for a field by id and would throw on null, and a
     harness that dies takes every other scenario's findings with it. A split
     that stopped splitting is exactly the defect worth having a named failing
     check for, so it gets one: the run ends here, `reachedStepTwo` is false,
     and verify-payload prints which scenario never got to the second screen. */
  if (!reachedStepTwo) {
    results.push({
      scenario: s.name,
      locale: s.locale,
      events,
      shownOutcome,
      expectedOutcome: s.expect,
      outcomeMatches: false,
      resultTitleRendered: false,
      gmailNoteRendered: false,
      sameEmailRendered: false,
      pricingLinkRendered: false,
      freeEmailWarningShown: false,
      reachedStepTwo,
      localeIsNotEnglish: s.locale === 'en' ? null : true,
    });
    await act(async () => {
      root.unmount();
    });
    host.remove();
    return;
  }

  await act(async () => {
    setValue(q<HTMLInputElement>('#f-company_name'), 'Vesterled Ejendomsadministration');
    setValue(q<HTMLInputElement>('#f-work_email'), s.email);
    setValue(q<HTMLInputElement>('#f-phone'), '+45 32 14 88 90');
  });

  const freeEmailWarningShown = Boolean(host.querySelector('#w-work_email'));

  await submit();

  // Let the real fetch and the real retry pause settle.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 400));
  });

  const text = host.textContent ?? '';
  const c = content[s.locale];
  const expectTitle =
    s.expect === 'too_small' ? c.results.tooSmall.title : c.results.qualified.title;

  results.push({
    scenario: s.name,
    locale: s.locale,
    events,
    shownOutcome,
    expectedOutcome: s.expect,
    outcomeMatches: shownOutcome === s.expect,
    resultTitleRendered: text.includes(expectTitle),
    gmailNoteRendered: text.includes(c.results.gmailNote),
    /* Which address to book under. This is the only thing joining a booking to
       the lead that produced it: WF-C7 matches on the email address and has
       nothing else to match on, and the booking page will take whatever the
       visitor types. So the sentence asking for the same one is load bearing,
       and it has to be measured where it has to appear, which is every screen
       that offers a booking and no screen that does not. The too_small screen
       offers a mailto to a nurture list instead, and the same sentence there
       would be asking somebody to match a call they are not being offered. */
    sameEmailRendered: text.includes(c.results.qualified.sameEmail),
    pricingLinkRendered: Boolean(host.querySelector('a[href*="doviloop.dev/pricing"]')),
    freeEmailWarningShown,
    reachedStepTwo,
    localeIsNotEnglish: s.locale === 'en' ? null : !text.includes(content.en.results.qualified.title),
  });

  await act(async () => {
    root.unmount();
  });
  host.remove();
}

globalThis.__RUN__ = async () => {
  for (const s of globalThis.__SCENARIOS__) {
    await runOne(s);
  }
  globalThis.__RESULTS__ = results;
};
