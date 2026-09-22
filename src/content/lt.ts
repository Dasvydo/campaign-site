import type { Content } from './types';
import { meta } from './lt/meta';
import { nav } from './lt/nav';
import { hero } from './lt/hero';
import { demo } from './lt/demo';
import { numbers } from './lt/numbers';
import { who } from './lt/who';
import { price } from './lt/price';
import { trial } from './lt/trial';
import { form } from './lt/form';
import { results } from './lt/results';
import { consent } from './lt/consent';
import { footer } from './lt/footer';

/*
 * <!-- NEEDS NATIVE CHECK -->
 *
 * Lietuviu kalba. Parasyta kaip lietuviskas tekstas, o ne pazodinis vertimas.
 * Visur naudojamas mandagusis kreipinys "Jus". Pries paleidziant mokama
 * reklama tekstas turi buti perskaitytas gimtakalbio. Zr. BLOCKED.md 6 punkta.
 *
 * Jokiu ilgu bruksniu. Jokiu isgalvotu klientu ar atsiliepimu.
 */
export const lt: Content = {
  htmlLang: 'lt',
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
