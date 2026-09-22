import type { Content } from './types';
import { meta } from './en/meta';
import { nav } from './en/nav';
import { hero } from './en/hero';
import { demo } from './en/demo';
import { numbers } from './en/numbers';
import { who } from './en/who';
import { price } from './en/price';
import { trial } from './en/trial';
import { form } from './en/form';
import { results } from './en/results';
import { consent } from './en/consent';
import { footer } from './en/footer';

/**
 * English. This is the master copy. Danish and Lithuanian are written from it
 * as native copy, not translated line by line.
 *
 * No em dashes. No invented customers. Figures carry their basis.
 */
export const en: Content = {
  htmlLang: 'en',
  nativeCheck: '',

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
