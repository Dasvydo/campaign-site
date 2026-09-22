import type { Content } from '../types';

/*
 * Den gratis proeveperiode. Skrevet som dansk tekst ud fra den engelske
 * original, ikke oversat linje for linje. Skal laeses igennem af en dansk
 * modersmaalstaler. Ingen lange tankestreger, og ingen tal i teksten.
 */
export const trial: Content['trial'] = {
  whenTitle: 'Hvad der sker, og hvornår',

  stops: [
    {
      figure: 'start',
      day: { before: 'Dag ', after: ' i prøveperioden' },
      note: 'I sætter det op selv. Så begynder udkastene.',
      state: 'Intet faktureret endnu',
      say: {
        before:
          'Den dag I starter. I sætter det op selv, og udkastene begynder. Der faktureres ikke noget. Månedsprisen lyder på ',
        after: '.',
      },
    },
    {
      figure: 'end',
      day: { before: 'Dag ', after: ' i prøveperioden' },
      note: 'Prøveperioden slutter. Beholder I det, faktureres den første måned.',
      state: 'Faktureres, hvis I beholder det',
      say: {
        before:
          'Den dag prøveperioden slutter. Den første måned faktureres kun, hvis I beholder det. Månedsprisen er ',
        after: '.',
      },
    },
    {
      figure: 'none',
      day: { before: 'Afbryd', after: ' før tid' },
      note: 'Når som helst frem til den dag.',
      state: 'Faktureres slet ikke',
      say: { before: 'Afbryder I før tid, bliver månedsprisen streget ud og lyder på ', after: '.' },
    },
  ],

  termsLabel: 'Vis vilkårene',
  terms: [
    { t: 'Opsætningen er med.', n: 'Den faktureres ikke bagefter.' },
    { t: 'Intet kort, og ingen betaling.', n: 'Betalingsoplysninger kommer senere, og kun hvis I beholder det.' },
    { t: 'Stopper I, betaler I intet.', n: 'Der faktureres ikke noget, og der er ikke noget at opsige.' },
    { t: 'Prisen er måned til måned.', n: 'Ingen binding på et år, og intet opsigelsesvarsel.' },
  ],

  included: {
    title: 'Det, prøveperioden indeholder',
    items: [
      'Jeres hjemmeside læst ind i en vidensbase, og et sted at tilføje det, den mangler.',
      'Jeres dokumenter indekseret, så et udkast kan citere gebyret, fristen og reglen.',
      'En stemmeprofil for hver person, så et udkast lyder som den, der sender det.',
      'Et spørgsmål tilbage til jer, når svaret ikke ligger på sagen, i stedet for et gæt.',
      'Udkastene lander i Outlook. Intet sender sig selv.',
      'Hostet i EU.',
    ],
  },

  ctaNote: 'Der faktureres ikke noget, medmindre I beholder det.',
};
