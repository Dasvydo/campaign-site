import type { Content } from '../types';

export const price: Content['price'] = {
  eyebrow: 'Én pris for hele firmaet',
  title: 'Hvad det koster',


  feesTitle: 'Priserne',
  fees: [
    {
      term: 'Virksomheden',
      per: 'om måneden',
      note: 'Én pris for alle, der skriver mails. Den ændrer sig ikke, når I ansætter flere.',
    },
    {
      term: 'Opsætning',
      per: 'én gang',
      note: 'Ét møde, på jeres egen rigtige post. Vi læser jeres hjemmeside og dokumenter; I fortæller, hvad I bliver spurgt om.',
      waived: {
        label: 'Bortfalder',
        say: { before: 'Opsætningsprisen på ', after: ' bortfalder, så længe der er ledige pladser.' },
      },
    },
  ],

  packages: {
    title: 'De to pakker',
    pick: 'Vælg ved at tælle jeres folk.',
    rows: [
      { id: 'desk', name: 'Desk', note: 'Det mindste firma, vi sælger til.' },
      { id: 'firm', name: 'Firm', note: 'Én pris, uanset hvor mange I ansætter.' },
    ],
    feeLabel: 'Pr. måned, hele firmaet',
    peopleLabel: 'Personer dækket, op til',
    draftsLabel: 'Udkast om måneden, fælles',
    note: 'Ingen af tallene er pr. person. Udkastene er fælles, og ingen har deres egen kvote, der kan løbe tør.',
    under: { before: 'Mindre end det? ', link: 'doviloop.dev', after: ' gør det samme for meget mindre.' },
    over: 'Større end det? Spørg, så regner vi en pris ud til jer.',
  },

  included: {
    title: 'I begge pakker',
    items: [
      'Jeres hjemmeside læst ind i en vidensbase, og ét møde med den, der ved, hvad jeres firma bliver spurgt om, for at udfylde det, den mangler.',
      'Jeres dokumenter indekseret, så et udkast kan citere gebyret, fristen og reglen.',
      'En stemmeprofil for hver person, så et udkast lyder som den, der sender det.',
      'Et spørgsmål tilbage til jer, når svaret ikke ligger på sagen, i stedet for et gæt.',
      'Udkastene lander i Outlook. Intet sender sig selv.',
      'Hostet i EU.',
    ],
  },

  covers: {
    title: 'Hvad prisen dækker',
    people: {
      label: 'Personer dækket, op til:',
      note: 'Navne kommer til og falder fra, efterhånden som holdet ændrer sig.',
    },
    drafts: {
      label: 'Udkast om måneden, delt på tværs af hele virksomheden:',
      note: 'Fælles for alle. Ingen har sin egen pulje, der kan løbe tør.',
    },
    note: 'Kommer I over en af de to, siger vi det og finder ud af det sammen med jer, inden der bliver faktureret noget.',
  },

  founding: {
    title: 'En byttehandel, ikke en rabat',
    noProofYet: 'Ingen kunder endnu.',
    reason: { before: 'Lav pris for ', after: ' virksomheder, der vil gå god for det.' },
    lock: 'Jeres pris stiger aldrig.',
    spots: { label: 'Ledige pladser tilbage:', of: ' af ' },
    spotsClosed: 'Pladserne, der fulgte med en byttehandel, er taget. Månedsprisen nedenfor er uændret; opsætningsprisen opkræves nu fuldt ud.',
    givesTitle: 'Det, I giver:',
    gives: [
      'en udtalelse med jeres egne ord',
      'en case efter tres dage, med tal, I selv vælger',
      'jeres logo på produktsiden',
      'to feedbackmøder i de første to måneder',
    ],
    note: 'Vil I helst ikke nævnes, betaler I opsætningsprisen, og intet andet ved produktet ændrer sig.',
    signature: {
      name: 'Dovydas',
      line: 'Jeg har bygget det her, og jeg holder selv opsætningsmøderne.',
    },
  },

  termsLabel: 'Vis vilkårene',
  terms: [
    { t: 'Opsætningsmødet og opsætningen er med.', n: 'Ingen af delene faktureres bagefter.' },
    { t: 'Intet kort, og ingen betaling.', n: 'Betalingsoplysninger kommer senere, efter I har sagt ja.' },
    { t: 'Siger I nej, betaler I intet.', n: 'Der faktureres ikke noget, og der er ikke noget at opsige.' },
    { t: 'Prisen er måned til måned.', n: 'Ingen binding på et år, og intet fast antal medarbejdere at leve op til.' },
  ],

  whenTitle: 'Hvad der sker, og hvornår',
  stops: [
    {
      day: 'Dag 0',
      note: 'Ét møde med den, der kender svarene. Så begynder udkastene.',
      state: 'Intet faktureret endnu',
      say: {
        before: 'Dag 0. Ét opsætningsmøde, så begynder udkastene. Der faktureres ikke noget. Månedsprisen lyder på ',
        after: '.',
      },
    },
    {
      day: 'Dag 14',
      note: 'Et opsamlingsmøde. Siger I ja, faktureres den første måned.',
      state: 'Faktureres efter et ja',
      say: {
        before: 'Dag 14. Der er et opsamlingsmøde, og den første måned faktureres kun, hvis I siger ja. Månedsprisen er ',
        after: '.',
      },
    },
    {
      day: 'Siger I nej',
      note: 'Når som helst frem til det møde.',
      state: 'Faktureres slet ikke',
      say: { before: 'Siger I nej, bliver månedsprisen streget ud og lyder på ', after: '.' },
    },
  ],
  total: { zero: '0 EUR' },

  ctaNote: 'Der faktureres ikke noget, før I siger ja på opsamlingsmødet.',
};
