import type { Content } from '../types';

/*
 * Kainu planai. Parasyta lietuviskai pagal anglu kalba parasyta originala, ne
 * verciant eilute po eilutes. Turi perskaityti gimtakalbis.
 *
 * Kreipiamasi mandagiaja forma: Jus, Jusu.
 *
 * Jokiu skaiciu tekste. Visos sumos, vietos ir dienos ateina is
 * src/lib/pricing.ts. Jokiu ilgu bruksniu.
 *
 * Triju planu pavadinimai nera niekieno patvirtinti. Zr. ataskaita: pirmiausia
 * gimtakalbis turetu perskaityti "Su prieziura" ir antrastes linksni.
 */
export const tiers: Content['tiers'] = {
  eyebrow: 'Kiek tai kainuoja',

  headline: { before: 'Nemokamai pirmąsias', after: 'dienų' },
  lede: 'Visiems planams žemiau. Pradedate patys, o pirmoji sąskaita išrašoma tik tuo atveju, jei tęsiate.',

  freeBadge: { before: 'Nemokamai ', after: ' dienų' },

  pickLead: 'Rinkitės pagal tai, kiek žmonių pas Jus atsako į laiškus.',
  rows: [
    {
      id: 'individual',
      name: 'Individualus',
      line: 'Vienas žmogus, atsakantis į savo laiškus.',
      seatsLabel: 'Vietų',
    },
    {
      id: 'team',
      name: 'Komanda',
      line: 'Komanda, dirbanti su viena žinių baze.',
      seatsLabel: 'Vietų, iki',
    },
    {
      id: 'managed',
      name: 'Su priežiūra',
      line: 'Didesnė įmonė, kuriai viską prižiūrime mes.',
      seatsLabel: 'Vietų, nuo',
    },
  ],
  per: 'už vietą per mėnesį',
};
