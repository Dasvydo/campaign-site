import type { Content } from '../types';

export const hero: Content['hero'] = {
  clockIn: '08:40',
  clockOut: '08:41',

  skip: 'Pereiti prie turinio',
  nav: { label: 'Puslapio skiltys', example: 'Pavyzdys', price: 'Kiek kainuoja', who: 'Kam tai skirta' },

  /* Re-cut around the clause the pen should mark. Concatenated with clockOut
     it is the same sentence as before, word for word. */
  title: {
    before: '40 laiškų. ',
    mark: 'Tie, į kuriuos atsako Jūsų bylos',
    mid: ', juodraščiuose. Iki ',
    after: ' val.',
  },
  pileAlt: 'Keturiasdešimties laiškų krūva, laukianti ant stalo.',
  deal: {
    draftLabel: 'Atsakymo juodraštis, paruoštas',
    to: 'Gyventojai iš 214 buto',
    subjectLabel: 'Tema',
    subject: 'Atsiskaitymas už užstatą, vis dar nieko',
    preview: 'Ačiū, kad priminėte, ir atsiprašome, kad teko.',
    sr: 'Visą juodraštį perskaitykite išnagrinėtame pavyzdyje.',
  },

  /* The sub-headline. See the long note on the English key: this slot carried
     where the thing is installed, and now carries what the thing is. */
  setup:
    'DoviLoop rašo atsakymų juodraščius Outlook programoje, remdamasi bylomis, kurias Jūsų įmonė jau turi, ir Jūsų pačių tonu. Jūsų žmonės kiekvieną perskaito ir išsiunčia.',

  bar: {
    text: 'Įsidiegiate patys, savo pašte.',
  },

  message: {
    from: 'Rasa Jankauskienė, butas 214',
    subject: 'Atsiskaitymas už užstatą, vis dar nieko',
    body: 'Išsikrausčiau praėjusio mėnesio 30 dieną ir vis dar negavau atsiskaitymo. Raktus grąžinau laiku, butas buvo švarus. Kada atgausiu užstatą ir kiek jo liko?',
  },
  draft: {
    greeting: 'Gerbiama p. Jankauskiene,',
    body: 'Ačiū, kad priminėte, ir atsiprašome, kad teko. Atsiskaitymą privalome pateikti per tris savaites nuo buto perdavimo, taigi jis pasieks Jus iki 21 dienos. Iki šiol užfiksuoti du atskaitymai: valymas po išsikraustymo 850 EUR ir koridoriaus sienos pertepimas 400 EUR. Vadinasi, Jums grąžintina 4 750 EUR užstato dalis, ji bus pervesta į mūsų turimą sąskaitą.',
    signoff: 'Visą atsiskaitymą atsiųsiu, kai tik gausime paskutinius skaitiklių rodmenis.',
  },
};
