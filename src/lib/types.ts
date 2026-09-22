/**
 * Shared types.
 *
 * These two are not part of the lead payload contract, even though they were
 * declared alongside it for a while. `Locale` is what the content layer is
 * keyed on and what the router resolves; `Utm` is what attribution captures
 * and what every analytics event carries. All three of those modules outlive
 * the qualifier, so the types they depend on cannot live in the qualifier's
 * file.
 *
 * They are declared here and nowhere else. `contract.ts` imports them from
 * this file like any other consumer, which is what lets the payload contract
 * be removed without taking the content layer, attribution and analytics down
 * with it.
 */

export type Locale = 'en' | 'da' | 'lt';

export interface Utm {
  source: string;
  medium: string;
  campaign: string;
  content: string;
}
