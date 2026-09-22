import type { Content } from '../types';

export const who: Content['who'] = {
  eyebrow: 'Arkiveret under',
  title: 'Hvem det er til',
  groups: [
    { id: 'property', tab: 'Ejendomsadministratorer', line: 'Beboerpost, depositum og vedligehold. Hele året.' },
    { id: 'accounting', tab: 'Revisionsfirmaer', line: 'Spørgsmål om honorarer og manglende bilag, hver eneste frist.' },
    { id: 'insurance', tab: 'Forsikringsmæglere', line: 'Svaret står som regel allerede i policen.' },
  ],

    sourcesTitle: 'Skrevet ud fra:',

  accuracy: {
    title: 'Hvad der sker, når den ikke ved det',
    items: [
      'Den skriver kun udkast til dem, den kan svare på ud fra jeres sager. Resten lader den være.',
      'Når svaret ikke står i sagen, spørger den jer. Den fylder ikke hullet ud med noget, der bare lyder rigtigt.',
      'Der er ingen automatisk afsendelse nogen steder i produktet. Et menneske læser hvert udkast og sender det selv.',
      'Et udkast citerer gebyret, fristen eller reglen fra jeres egne dokumenter, i jeres egne ord.',
    ],
  },
};
