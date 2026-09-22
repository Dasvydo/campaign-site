import type { Content } from '../types';

export const price: Content['price'] = {
  eyebrow: 'Vienas mokestis visai įmonei',
  title: 'Kiek kainuoja',


  feesTitle: 'Kainos',
  fees: [
    {
      term: 'Įmonė',
      per: 'per mėnesį',
      note: 'Vienas mokestis visiems, kas rašo laiškus. Jis nepasikeičia, kai priimate naujų žmonių.',
    },
    {
      term: 'Įdiegimas',
      per: 'vieną kartą',
      note: 'Vienas pokalbis, su tikrais Jūsų įmonės laiškais. Mes perskaitome Jūsų svetainę ir dokumentus; Jūs pasakote, ko Jūsų klausiama.',
      waived: {
        label: 'Netaikomas',
        say: { before: 'Įdiegimo mokestis, kuris yra ', after: ', netaikomas, kol yra laisvų vietų.' },
      },
    },
  ],

  packages: {
    title: 'Du paketai',
    pick: 'Rinkitės suskaičiavę savo žmones.',
    rows: [
      { id: 'desk', name: 'Desk', note: 'Mažiausia įmonė, kuriai parduodame.' },
      { id: 'firm', name: 'Firm', note: 'Viena kaina, kad ir kiek žmonių priimtumėte.' },
    ],
    feeLabel: 'Per mėnesį, visai įmonei',
    peopleLabel: 'Apimami žmonės, iki',
    draftsLabel: 'Juodraščiai per mėnesį, bendri',
    note: 'Nė vienas skaičius nėra vienam žmogui. Juodraščiai bendri, ir niekas neturi savo atskiros kvotos, kuri galėtų baigtis.',
    under: { before: 'Mažesnė įmonė? ', link: 'doviloop.dev', after: ' daro tą patį gerokai pigiau.' },
    over: 'Didesnė įmonė? Parašykite, ir apskaičiuosime kainą.',
  },

  included: {
    title: 'Abiejuose paketuose',
    items: [
      'Jūsų svetainė perkelta į žinių bazę, o vienas pokalbis su tuo, kas žino, ko klausiama Jūsų įmonės, užpildo tai, ko joje trūksta.',
      'Jūsų dokumentai suindeksuoti, kad juodraštis galėtų cituoti mokestį, terminą ir taisyklę.',
      'Kiekvieno žmogaus balso profilis, kad juodraštis skambėtų kaip tas, kuris jį siunčia.',
      'Klausimas Jums, kai atsakymo nėra bylose, o ne spėjimas.',
      'Juodraščiai atsiduria „Outlook“. Niekas nesiunčiama savaime.',
      'Talpinama ES.',
    ],
  },

  covers: {
    title: 'Ką apima mokestis',
    people: {
      label: 'Aprėpiama žmonių, ne daugiau kaip:',
      note: 'Vardai įrašomi ir išbraukiami keičiantis komandai.',
    },
    drafts: {
      label: 'Juodraščių per mėnesį, bendrai visai įmonei:',
      note: 'Bendra visiems. Niekas neturi atskiro limito, kuris galėtų baigtis.',
    },
    note: 'Peržengus bet kurią iš šių ribų, pasakysime ir susitarsime su Jumis dar prieš išrašydami sąskaitą.',
  },

  founding: {
    title: 'Mainai, o ne nuolaida',
    noProofYet: 'Klientų kol kas nėra.',
    reason: { before: 'Žema kaina pirmosioms ', after: ' įmonėms, kurios už tai laiduos.' },
    lock: 'Jūsų kaina niekada nekyla.',
    spots: { label: 'Laisvų vietų dar yra:', of: ' iš ' },
    spotsClosed: 'Vietos, kurios ėjo kartu su mainais, jau užimtos. Mėnesinis mokestis žemiau nesikeičia; įdiegimo mokestis dabar taikomas visas.',
    givesTitle: 'Ką duodate Jūs:',
    gives: [
      'atsiliepimą savais žodžiais',
      'atvejo aprašymą po šešiasdešimties dienų, su skaičiais, kuriuos pasirenkate',
      'savo logotipą produkto svetainėje',
      'du atsiliepimų pokalbius per pirmus du mėnesius',
    ],
    note: 'Jei nenorite būti įvardyti, sumokate įdiegimo mokestį, ir niekas kitas produkte nesikeičia.',
    signature: {
      name: 'Dovydas',
      line: 'Šį produktą sukūriau aš ir įdiegimo pokalbius vedu pats.',
    },
  },

  termsLabel: 'Parodyti sąlygas',
  terms: [
    { t: 'Įdiegimo pokalbis ir įdiegimas įskaičiuoti.', n: 'Nei vienas, nei kitas vėliau neapmokestinamas.' },
    { t: 'Kortelės neprašome ir nieko nenuskaitome.', n: 'Mokėjimo duomenų prireiks vėliau, kai pasakysite taip.' },
    { t: 'Pasakius ne, nemokate nieko.', n: 'Jokia sąskaita neišrašoma ir nėra ko atšaukti.' },
    { t: 'Mokestis mokamas kas mėnesį.', n: 'Nereikia pasirašyti metams ir nereikia išlaikyti žmonių skaičiaus.' },
  ],

  whenTitle: 'Kas vyksta ir kada',
  stops: [
    {
      day: '0 diena',
      note: 'Vienas pokalbis su tuo, kas žino atsakymus. Tada pradeda rastis juodraščiai.',
      state: 'Kol kas jokios sąskaitos',
      say: {
        before: '0 diena. Vienas įdiegimo pokalbis, tada pradeda rastis juodraščiai. Jokia sąskaita neišrašoma. Mėnesinis mokestis rodo ',
        after: '.',
      },
    },
    {
      day: '14 diena',
      note: 'Apžvalgos pokalbis. Pasakykite taip, ir už pirmą mėnesį išrašoma sąskaita.',
      state: 'Sąskaita tik pasakius taip',
      say: {
        before:
          '14 diena. Vyksta apžvalgos pokalbis, o sąskaita už pirmą mėnesį išrašoma tik tada, jei pasakote taip. Mėnesio suma yra ',
        after: '.',
      },
    },
    {
      day: 'Pasakykite ne',
      note: 'Bet kada iki to pokalbio.',
      state: 'Jokios sąskaitos išvis',
      say: { before: 'Pasakykite ne, ir mėnesio suma perbraukiama bei rodo ', after: '.' },
    },
  ],
  total: { zero: '0 EUR' },

  ctaNote: 'Jokia sąskaita neišrašoma, kol per apžvalgos pokalbį nepasakote taip.',
};
