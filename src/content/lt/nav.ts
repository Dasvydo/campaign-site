import type { Content } from '../types';

export const nav: Content['nav'] = {
  skipToContent: 'Pereiti prie turinio',
  localeLabel: 'Kalba',
  localeNames: { en: 'English', da: 'Dansk', lt: 'Lietuvių' },
  /* See the note in en/nav.ts. "bandymas" and "nemokamai" are both already
     used by the trial section on this page. Formal plural, as the rest of
     this locale is. NOT reviewed by a native speaker - see the Lithuanian
     note in RUN-STATE-TRIAL-PAGE.md. */
  cta: 'Pradėkite nemokamą bandymą',
};
