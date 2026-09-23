import type { Content } from '../types';

export const nav: Content['nav'] = {
  skipToContent: 'Skip to the main content',
  localeLabel: 'Language',
  localeNames: { en: 'English', da: 'Dansk', lt: 'Lietuvių' },
  /* The one set of words this page asks for. It said "Check if we are a fit"
     until the fit check it named was deleted, which left every button on the
     page - both hero copies, the standing phone bar and the pricing card -
     offering a screening step that no longer exists, under a headline that
     offers a free fortnight. types.ts already called this "the button that
     starts the trial"; now it says so. */
  cta: 'Start a free trial',
};
