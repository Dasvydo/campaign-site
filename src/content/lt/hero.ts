import type { Content } from '../types';

export const hero: Content['hero'] = {
  clockIn: '08:40',
  clockOut: '08:41',

  skip: 'Pereiti prie turinio',
  nav: { example: 'Pavyzdys', price: 'Kiek kainuoja', fit: 'Ar tinkame' },

  title: {
    before: '40 laiškų. Tie, į kuriuos atsako Jūsų bylos, ',
    mark: 'juodraščiuose',
    mid: '. Iki ',
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

  setup: 'Veikia mūsų serveriuose arba įdiegiame Jūsų.',

  bar: {
    text: 'Trunka mažiau nei minutę, kortelės neprašome.',
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
