/**
 * Test harness. Not shipped. Bundled and run by scripts/verify-payload.mjs.
 *
 * Renders the REAL <Qualifier /> component into jsdom, fills the six fields,
 * submits, and lets the real lib/lead.ts POST over real HTTP to the local mock
 * webhook. Nothing about the payload is reconstructed for the test: what the
 * mock validates is what a browser would actually send.
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

  await act(async () => {
    setValue(q<HTMLInputElement>('#f-company_name'), 'Vesterled Ejendomsadministration');
    setValue(q<HTMLInputElement>('#f-work_email'), s.email);
    setValue(q<HTMLInputElement>('#f-phone'), '+45 32 14 88 90');
    setValue(q<HTMLSelectElement>('#f-team_size'), s.team_size);
    setValue(q<HTMLSelectElement>('#f-email_client'), s.email_client);
    setValue(q<HTMLSelectElement>('#f-role'), s.role);
  });

  const freeEmailWarningShown = Boolean(host.querySelector('#w-work_email'));

  await act(async () => {
    q<HTMLFormElement>('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
  });

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
    pricingLinkRendered: Boolean(host.querySelector('a[href*="doviloop.dev/pricing"]')),
    freeEmailWarningShown,
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
