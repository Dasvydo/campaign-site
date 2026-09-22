import type { Content } from '../types';

export const who: Content['who'] = {
  eyebrow: 'Registruota',
  title: 'Kam tai skirta',
  groups: [
    { id: 'property', tab: 'Nekilnojamojo turto administratoriams', line: 'Gyventojų laiškai, užstatai ir priežiūra. Ištisus metus.' },
    { id: 'accounting', tab: 'Apskaitos įmonėms', line: 'Klausimai dėl mokesčių ir trūkstamų dokumentų, prieš kiekvieną terminą.' },
    { id: 'insurance', tab: 'Draudimo brokeriams', line: 'Atsakymas paprastai jau yra polise.' },
  ],

    sourcesTitle: 'Rašoma remiantis:',

  accuracy: {
    title: 'Kas nutinka, kai ji nežino',
    items: [
      'Juodraščius rašo tik tiems laiškams, į kuriuos gali atsakyti iš Jūsų bylų. Kitų neliečia.',
      'Kai atsakymo byloje nėra, ji Jūsų paklausia. Spragos neužpildo tuo, kas tiesiog gražiai skamba.',
      'Šiame produkte niekur nėra automatinio išsiuntimo. Kiekvieną juodraštį perskaito žmogus ir išsiunčia pats.',
      'Juodraštis cituoja mokestį, terminą ar taisyklę iš Jūsų pačių dokumentų, Jūsų pačių žodžiais.',
    ],
  },
};
