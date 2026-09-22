/**
 * Fourth harness. Not shipped. Bundled and run by scripts/verify-payload.mjs.
 *
 * One question: does the sentence claiming we have no customers appear exactly
 * when the offer says it may?
 *
 * It needs a harness of its own because it cannot be answered by rendering the
 * page as shipped. The claim is gated on `noCustomersYet()`, which is true for
 * the offer on disk and will be until the first pilot starts, so a page
 * rendered today prints the sentence whether the gate is wired up or not. The
 * defect this is here to catch, somebody printing it unconditionally, is
 * invisible in the only state the bundle can normally reach.
 *
 * So verify-payload builds this twice: once against src/lib/offer.ts as it is,
 * and once against the same file with a founding pilot started, patched in the
 * bundler rather than kept as a second copy of the offer that would drift. The
 * sentence has to be there in the first run and gone in the second, and the
 * sentence explaining the trade has to survive both, because it is true at any
 * count and is what the block reads as once the admission goes.
 */
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Price } from '../src/components/Price';
import { content } from '../src/content';
import { noCustomersYet, pilotsStarted } from '../src/lib/offer';
import type { Locale } from '../src/lib/types';

declare global {
  // eslint-disable-next-line no-var
  var __CLAIM_RESULTS__: unknown[];
  // eslint-disable-next-line no-var
  var __RUN_CLAIM__: () => Promise<void>;
}

globalThis.__RUN_CLAIM__ = async () => {
  const results: Array<Record<string, unknown>> = [];

  for (const locale of ['en', 'da', 'lt'] as Locale[]) {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<Price c={content[locale]} onView={() => {}} onCta={() => {}} />);
    });

    const c = content[locale];
    const text = host.textContent ?? '';
    /* The founding block's own lede, found by its own hook.

       It was found by walking up from `#price-founding-h`, the counter's
       screen-reader heading. That worked only while the counter always
       rendered; once the counter was withheld on a cohort nobody has joined,
       the anchor vanished and this harness read every lede as empty. An
       element's anchor should not depend on a sibling that can legitimately
       disappear. */
    const lede = host.querySelector('[data-price-lede]');

    results.push({
      locale,
      started: pilotsStarted(),
      gate: noCustomersYet(),
      claimShown: text.includes(c.price.founding.noProofYet),
      /* Does the counter come back once a pilot has started?

         Nothing asserted this. The page harness only ever renders the shipped
         offer, where the counter is correctly absent, so a gate wired to
         `false` was indistinguishable from a working one: an independent
         verifier replaced the condition with a literal `false` and the whole
         suite stayed green. This harness is the only one that builds a second
         state, so the negative direction is checked here. */
      counterShown: Boolean(
        host.querySelector('dl[aria-labelledby="price-founding-h"] .price-fig'),
      ),
      /* The half that never goes false, and its own hook rather than the
         lede's.

         It used to be the second sentence of the lede, "These places are a
         trade, not a discount", which was cut for saying what the reason says
         without the number in it. The guard it stood for is still needed: a
         gate that took the whole paragraph with it would leave the founding
         block opening on a list of obligations with no reason above them. The
         reason is what must survive the gate, so the reason is what is read. */
      reasonShown: (host.querySelector('[data-price-reason]')?.textContent ?? '')
        .replace(/\s+/g, ' ')
        .trim(),
      /* Carried across because verify-payload.mjs runs outside the bundle and
         has no content to read. Both sides come from the same file, so this
         cannot catch a wrong translation - other checks do that. What it can
         catch, and what it is for, is the paragraph disappearing with the gate:
         an empty `reasonShown` fails every one of these. */
      reasonWants: [c.price.founding.reason.before.trim(), c.price.founding.lock],
      /* The whole rendered sentence, so a gate that fires correctly but leaves
         a stray fragment behind still fails. The admission is not emptied when
         the gate closes; the element itself goes, and an element that is still
         in the DOM holding an empty string fails this. */
      ledeFound: lede !== null,
      lede: (lede?.textContent ?? '').trim(),
      wantLede: noCustomersYet() ? c.price.founding.noProofYet : '',
    });

    await act(async () => {
      root.unmount();
    });
    host.remove();
  }

  globalThis.__CLAIM_RESULTS__ = results;
};
