import type { Content } from '../types';

/*
 * Prisniveauerne. Skrevet som dansk tekst ud fra den engelske original, ikke
 * oversat linje for linje. Skal laeses igennem af en dansk modersmaalstaler.
 *
 * Hoefligt flertal hele vejen igennem: I, jer, jeres.
 *
 * Ingen tal i teksten. Alle beloeb, pladser og dage kommer fra
 * src/lib/pricing.ts. Ingen lange tankestreger.
 *
 * Navnene paa de tre niveauer er ikke bekraeftet af nogen. Se rapporten:
 * "Teamet" og "Fuld drift" er de to, en modersmaalstaler boer se foerst.
 */
export const tiers: Content['tiers'] = {
  eyebrow: 'Hvad det koster',

  headline: { before: 'Gratis de første', after: 'dage' },
  lede: 'På alle niveauer herunder. I starter selv, og den første faktura kommer kun, hvis I beholder det.',

  freeBadge: { before: 'Gratis i ', after: ' dage' },

  pickLead: 'Vælg ved at tælle dem hos jer, der besvarer post.',
  rows: [
    {
      id: 'individual',
      name: 'Enkeltperson',
      line: 'Én person, der besvarer sin egen post.',
      seatsLabel: 'Pladser',
    },
    {
      id: 'team',
      name: 'Teamet',
      line: 'Et team på én fælles vidensbase.',
      seatsLabel: 'Pladser, op til',
    },
    {
      id: 'managed',
      name: 'Fuld drift',
      line: 'Et større firma, hvor vi står for driften.',
      seatsLabel: 'Pladser, fra',
    },
  ],
  per: 'pr. plads om måneden',
};
