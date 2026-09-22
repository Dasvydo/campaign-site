import type { Content } from '../types';

export const numbers: Content['numbers'] = {
  eyebrow: 'Jūsų pačių skaičiavimas',
  title: 'Kiek Jums lieka',
  about: 'maždaug\u00a0',
  inputs: {
    people: { label: 'Žmonės, atsakantys į laiškus' },
    drafts: { label: 'Išsiųsta juodraščių per mėnesį' },
    hourly: { label: 'Kiek kainuoja jų darbo valanda' },
    minutes: { label: 'Minučių, sutaupomų vienam juodraščiui', note: 'Jūsų įvertis. Mes to dar nematavome.' },
  },
  beats: {
    hours: { label: 'Valandų, kurias atgaunate:' },
    worth: { label: 'Kiek tos valandos Jums kainuoja šiandien:' },
    fee: { before: 'Tai kainuoja (', after: '):' },
    keep: { label: 'Jums lieka:' },
  },
  units: { hours: '\u00a0val.', perMonth: ' per mėnesį', perHour: ' už valandą' },
  yearLabel: 'Per metus:',
  under: 'Su tokiais skaičiais tai neatsiperka. Pokalbio metu tai pasakytume, o ne parduotume.',
  moreLabel: 'Parodyti skaičiavimą',
  basis: [
    {
      term: 'Juodraščiai per mėnesį',
      def: 'Juodraštis parengiamas ne kiekvienam laiškui. Tikroje pašto dėžutėje jį gavo maždaug vienas iš septynių, nes tai buvo klausimas, į kurį failai jau galėjo atsakyti. Jei apytiksliai žinote, kiek pašto gaunate, taip jį paverčiate juodraščių skaičiumi.',
    },
    {
      term: 'Sutaupytos minutės kiekvienam juodraščiui',
      def: 'Mūsų spėjimas, ne matavimas. Parašyti atsakymą nuo nulio užtrunka apie šešias minutes; perskaityti jau parengtą ir paspausti siųsti - apie vieną. Taigi skirtumas yra penkios. Jei mūsų skaičius netinka, įrašykite savo.',
    },
    {
      term: 'Kiek kainuoja valanda',
      def: 'Jūsų, ne mūsų. Kiek įmonei kainuoja vieno Jūsų žmogaus darbo valanda: atlyginimas ir tai, ką mokate be jo. Valdiklis atsidaro su apytiksliu šios rinkos skaičiumi; pastumkite iki to, kiek mokate iš tikrųjų.',
    },
  ],
  note: 'Per pokalbį perskaičiuosime tai su tikrais Jūsų skaičiais, ir jei neatsiperka, taip ir pasakysime.',
};
