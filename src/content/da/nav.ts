import type { Content } from '../types';

export const nav: Content['nav'] = {
  skipToContent: 'Spring til indholdet',
  localeLabel: 'Sprog',
  localeNames: { en: 'English', da: 'Dansk', lt: 'Lietuvių' },
  /* See the note in en/nav.ts. "prøveperiode" is the word the trial section
     on this page already uses, so the button and the section agree. */
  cta: 'Start en gratis prøveperiode',
};
