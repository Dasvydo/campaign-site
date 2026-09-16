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
import type { Locale } from '../src/lib/contract';

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
    /* The founding block's own lede, found through the heading that names it
       rather than by position, because `price-subnote` is a class this section
       uses more than once. */
    const block = host.querySelector('#price-founding-h')?.closest('.price-block') ?? null;

    results.push({
      locale,
      started: pilotsStarted(),
      gate: noCustomersYet(),
      claimShown: text.includes(c.price.founding.lede.noProofYet),
      tradeShown: text.includes(c.price.founding.lede.trade),
      /* The whole rendered sentence, so a gate that fires correctly but leaves
         a stray fragment behind still fails. */
      lede: (block?.querySelector('.price-subnote')?.textContent ?? '').trim(),
      wantLede: (
        noCustomersYet()
          ? c.price.founding.lede.noProofYet + ' ' + c.price.founding.lede.trade
          : c.price.founding.lede.trade
      ).trim(),
    });

    await act(async () => {
      root.unmount();
    });
    host.remove();
  }

  globalThis.__CLAIM_RESULTS__ = results;
};
