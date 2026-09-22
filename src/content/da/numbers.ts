import type { Content } from '../types';

export const numbers: Content['numbers'] = {
  eyebrow: 'Jeres eget regnestykke',
  title: 'Hvad I beholder',
  about: 'cirka\u00a0',
  inputs: {
    people: { label: 'Personer, der svarer på mails' },
    drafts: { label: 'Udkast sendt om måneden' },
    hourly: { label: 'Hvad en time af deres tid koster' },
    minutes: { label: 'Minutter sparet pr. udkast', note: 'Jeres skøn. Vi har ikke taget tid på det endnu.' },
  },
  beats: {
    hours: { label: 'Timer, I får tilbage:' },
    worth: { label: 'Hvad de timer koster jer i dag:' },
    fee: { before: 'Det her koster (', after: '):' },
    keep: { label: 'I beholder:' },
  },
  units: { hours: '\u00a0t', perMonth: ' om måneden', perHour: ' i timen' },
  yearLabel: 'Over et år:',
  under: 'Med de tal tjener det sig ikke hjem. Det ville vi sige på mødet i stedet for at sælge det til jer.',
  moreLabel: 'Vis regnestykket',
  basis: [
    {
      term: 'Udkast om måneden',
      def: 'Ikke alle mails får et. På en rigtig postkasse fik omkring én ud af syv det, fordi det var et spørgsmål, filerne allerede kunne svare på. Kender I nogenlunde jeres mængde post, er det sådan, den bliver til et antal udkast.',
    },
    {
      term: 'Minutter sparet pr. udkast',
      def: 'Vores gæt, ikke en måling. At skrive et svar fra bunden tager omkring seks minutter; at læse et, der ligger klar, og trykke send tager omkring ét. Så fem er forskellen. Sæt jeres eget tal ind, hvis vores er forkert.',
    },
    {
      term: 'Hvad en time koster',
      def: 'Jeres, ikke vores. Hvad en af jeres folk koster virksomheden i timen, løn plus det, I betaler oveni. Skyderen åbner på et groft tal for dette marked; flyt den hen til det, I faktisk betaler.',
    },
  ],
  note: 'På mødet regner vi det igennem igen på jeres rigtige tal, og hvis det ikke tjener sig hjem, siger vi det.',
};
