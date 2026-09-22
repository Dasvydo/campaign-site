import type { Content } from '../types';

export const hero: Content['hero'] = {
  clockIn: '08:40',
  clockOut: '08:41',

  skip: 'Spring til indholdet',
  nav: { example: 'Eksempel', price: 'Hvad det koster', fit: 'Passer det' },

  /* Re-cut around the clause the pen should mark. Concatenated with clockOut
     it is the same sentence as before, word for word. */
  title: {
    before: 'Fyrre mails ind. ',
    mark: 'Dem jeres sager svarer på',
    mid: ', i udkast. Inden klokken ',
    after: '.',
  },

  pileAlt: 'En bunke på fyrre breve, der venter på et skrivebord.',
  deal: {
    draftLabel: 'Svar i udkast, klar',
    to: 'Til beboeren i lejlighed 214',
    subjectLabel: 'Emne',
    subject: 'Fraflytningsopgørelse, stadig intet',
    preview: 'Tak fordi du rykker, og undskyld at det har været nødvendigt.',
    sr: 'Læs hele udkastet i det gennemgåede eksempel.',
  },

  /* The sub-headline. See the long note on the English key: this slot carried
     where the thing is installed, and now carries what the thing is. */
  setup:
    'DoviLoop skriver svarudkast inde i Outlook, ud fra de sager, jeres virksomhed allerede har, i jeres egen tone. Jeres team læser hvert udkast og trykker send.',

  bar: {
    text: 'Under et minut, intet kort.',
  },

  message: {
    from: 'Hanne Jensen, lejlighed 214',
    subject: 'Fraflytningsopgørelse, stadig intet',
    body: 'Jeg flyttede ud den 30. i sidste måned, og jeg har stadig ikke fået opgørelsen. Nøglerne blev afleveret til tiden, og lejligheden var rengjort. Hvornår får jeg mit depositum, og hvor meget er der tilbage af det?',
  },
  draft: {
    greeting: 'Kære Hanne Jensen,',
    body: 'Tak fordi du rykker, og undskyld at det har været nødvendigt. Opgørelsen skal være hos dig senest tre uger efter afleveringen, altså den 21. De to fradrag, der er rejst indtil nu, er flytterengøring på 850 EUR og pletmaling af væggen i entreen på 400 EUR. Der resterer dermed 4.750 EUR af dit depositum, som betales tilbage til den konto, vi har registreret.',
    signoff: 'Jeg sender den fulde opgørelse, så snart den sidste aflæsning er inde.',
  },
};
