import type { Content } from './types';
import { meta } from './da/meta';
import { nav } from './da/nav';
import { hero } from './da/hero';
import { demo } from './da/demo';
import { numbers } from './da/numbers';
import { who } from './da/who';
import { price } from './da/price';
import { trial } from './da/trial';
import { form } from './da/form';
import { results } from './da/results';
import { consent } from './da/consent';
import { footer } from './da/footer';

/*
 * <!-- NEEDS NATIVE CHECK -->
 *
 * Dansk. Skrevet som dansk tekst, ikke som en oversaettelse linje for linje.
 * Skal laeses igennem af en dansk modersmaalstaler, foer der koeres betalt
 * trafik paa siden. Se BLOCKED.md punkt 6.
 *
 * Ingen lange tankestreger. Ingen opfundne kunder eller udtalelser.
 */
export const da: Content = {
  htmlLang: 'da',
  nativeCheck: 'NEEDS NATIVE CHECK',

  meta,
  nav,
  hero,
  demo,
  numbers,
  who,
  price,
  trial,
  form,
  results,
  consent,
  footer,
};
