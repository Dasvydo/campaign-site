import type { Content } from '../types';

/*
 * Nemokamas bandomasis laikotarpis. Parasyta lietuviskai pagal anglu kalba
 * parasyta originala, ne verciant eilute po eilutes. Turi perskaityti gimtakalbis.
 * Kreipiamasi mandagiaja forma: Jus, Jusu. Jokiu bruksniu ir jokiu skaiciu tekste.
 */
export const trial: Content['trial'] = {
  whenTitle: 'Kas vyksta ir kada',

  stops: [
    {
      figure: 'start',
      day: { before: 'Bandymo ', after: ' diena' },
      note: 'Įsidiegiate patys. Tada pradeda rastis juodraščiai.',
      state: 'Kol kas jokios sąskaitos',
      say: {
        before:
          'Diena, kurią pradedate. Įsidiegiate patys, ir pradeda rastis juodraščiai. Jokia sąskaita neišrašoma. Mėnesinis mokestis rodo ',
        after: '.',
      },
    },
    {
      figure: 'end',
      day: { before: 'Bandymo ', after: ' diena' },
      note: 'Bandomasis laikotarpis baigiasi. Jei tęsiate, išrašoma sąskaita už pirmą mėnesį.',
      state: 'Sąskaita tik jei tęsiate',
      say: {
        before:
          'Diena, kurią baigiasi bandomasis laikotarpis. Sąskaita už pirmą mėnesį išrašoma tik tada, jei tęsiate. Mėnesio suma yra ',
        after: '.',
      },
    },
    {
      figure: 'none',
      day: { before: 'Nutraukite', after: ' anksčiau' },
      note: 'Bet kada iki tos dienos.',
      state: 'Jokios sąskaitos išvis',
      say: { before: 'Nutraukus anksčiau, mėnesio suma perbraukiama ir rodo ', after: '.' },
    },
  ],

  termsLabel: 'Parodyti sąlygas',
  terms: [
    { t: 'Nieko nereikia diegti.', n: 'Veikia su tuo paštu, kurį jau turite.' },
    { t: 'Kortelės neprašome ir nieko nenuskaitome.', n: 'Mokėjimo duomenų prireiks vėliau ir tik tuo atveju, jei tęsiate.' },
    { t: 'Nutraukę nemokate nieko.', n: 'Jokia sąskaita neišrašoma ir nėra ko atšaukti.' },
    { t: 'Mokestis mokamas kas mėnesį.', n: 'Nereikia pasirašyti metams ir nėra įspėjimo termino.' },
  ],

  included: {
    title: 'Ką apima bandomasis laikotarpis',
    items: [
      'Jūsų svetainė perkelta į žinių bazę, ir vieta, kurioje užpildote tai, ko joje trūksta.',
      'Jūsų dokumentai suindeksuoti, kad juodraštis galėtų cituoti mokestį, terminą ir taisyklę.',
      'Kiekvieno žmogaus balso profilis, kad juodraštis skambėtų kaip tas, kuris jį siunčia.',
      'Klausimas Jums, kai atsakymo nėra bylose, o ne spėjimas.',
      'Juodraščiai atsiduria „Outlook“. Niekas nesiunčiama savaime.',
      'Talpinama ES.',
    ],
  },

  ctaNote: 'Jokia sąskaita neišrašoma, nebent tęsiate.',
};
