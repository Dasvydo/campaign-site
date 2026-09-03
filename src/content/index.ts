import type { Locale } from '../lib/contract';
import type { Content } from './types';
import { en } from './en';
import { da } from './da';
import { lt } from './lt';

export const content: Record<Locale, Content> = { en, da, lt };

/** Route path for a locale. English is the root. */
export const pathFor = (locale: Locale): string => (locale === 'en' ? '/' : `/${locale}`);

export const LOCALES: Locale[] = ['en', 'da', 'lt'];

export type { Content };
