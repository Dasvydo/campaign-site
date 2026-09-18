import type { Content } from './types';

/*
 * <!-- NEEDS NATIVE CHECK -->
 *
 * Dansk. Skrevet som dansk tekst, ikke som en oversaettelse linje for linje.
 * Skal laeses igennem af en dansk modersmaalstaler, foer der koeres betalt
 * trafik paa siden. Se BLOCKED.md punkt 6.
 *
 * Ingen lange tankestreger. Ingen opfundne kunder eller udtalelser.
 */
export const da: Content = {
  htmlLang: 'da',
  nativeCheck: 'NEEDS NATIVE CHECK',

  meta: {
    title: 'DoviLoop til teams. Mailsvar til kontorer, der lever i Outlook.',
    description:
      'Dit team svarer på de samme slags mails hele dagen. DoviLoop læser hver enkelt, henter det, jeres virksomhed faktisk ved, og skriver svaret i jeres tone. Dit team læser det og sender. Til teams på 10 eller flere.',
  },

  nav: {
    skipToContent: 'Spring til indholdet',
    localeLabel: 'Sprog',
    localeNames: { en: 'English', da: 'Dansk', lt: 'Lietuvių' },
    cta: 'Se om vi passer sammen',
  },

  hero: {
    clockIn: '08:40',
    clockOut: '08:41',

    skip: 'Spring til indholdet',
    dateline: 'Mailudkast til teams på ti og opefter.',
    nav: { example: 'Eksempel', price: 'Hvad det koster', fit: 'Passer det' },

    title: {
      before: 'Fyrre mails ind. ',
      mark: 'Fyrre svar i udkast',
      mid: '. Klokken ',
      after: '.',
    },
    deck: 'Skrevet ud fra jeres egne sager, i jeres egne ord. Jeres folk læser dem igennem og sender.',

    ctaNote: 'Få et ja eller nej. De første to uger er gratis. Intet kort, og ingen betaling.',

    payback: {
      before: 'Det tjener sig selv hjem, hvis de folk, der svarer på jeres mails, koster mere end cirka ',
      after: ' i timen.',
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

    bar: {
      text: 'De første to uger er gratis.',
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
  },

  demo: {
    eyebrow: 'Gennemgået eksempel',
    title: 'En af de fyrre',
    lede: 'Udkastet er skrevet ud fra det, kontoret allerede har på sagen.',
    slug: 'En optaget demonstration. Fast tekst, opdigtet afsender og opdigtede beløb, intet er taget tid på.',
    noJs: 'Kræver JavaScript. Mailen, udkastet og spærren siger det samme uanset hvad.',
    fromLabel: 'Fra',
    subjectLabel: 'Emne',
    pickLead: 'Vælg det skrivebord, der ligner jeres mest.',
    beatIn: 'Det, der kom ind, 08:40',
    beatKnows: 'Det, kontoret allerede ved',
    beatWrote: 'Det, den skrev tilbage',
    beatNote: 'Slå en fra, og se udkastet miste den.',
    gateNote: 'Der er ingen automatisk afsendelse nogen steder i produktet. Et menneske læser det, retter det, det vil, og sender selv.',
    sendLabel: 'Send',
    editLabel: 'Ret',
    doneLabel: 'Færdig',
    sentStamp: 'Sendt',
    draftStamp: 'Udkast',
    sentChip: 'Sendt af dig, 08:41',
    dealLabel: 'Næste brev',
    payoff: 'Intet forlod kontoret, før du trykkede send. Der er ingen anden vej ud.',
    editNote: 'Du rettede det, før det blev sendt. Sådan ser den første uge ud.',
    reLabel: 'Vedr',
    close: 'Du læser det. Du sender det. Ingen brugte ni minutter på at skrive det.',
    closeBasis: 'De ni minutter er vores antagelse om at skrive et fra bunden, ikke en måling.',
    say: {
      allOff: 'Intet er slået til. Udkastet er fire intetsigende linjer.',
      restore: 'Alle fem er slået til igen. Udkastet er helt.',
      deal: 'Et nyt brev på bordet. Udkastet er tilbage, hvor det startede.',
      sent: 'Sendt. Udkastet forlod kun kontoret, fordi du trykkede send.',
      edit: 'Udkastet kan rettes. Tryk Færdig, eller Escape, når du er klar.',
      done: 'Rettelsen er afsluttet. Dine ændringer er beholdt.',
      source: 'Kilde: ',
      desk: '-skrivebordet. En anden mail, de samme fem kilder.',
    },
    restoreLabel: 'Sæt det hele tilbage',
    allOffNote: 'Sådan skriver ethvert andet værktøj, uden jeres sager.',
    desks: [
      {
        id: 'property',
        tab: 'Ejendom',
        deskName: 'Ejendoms',
        letter: {
          from: 'Hanne Jensen, lejlighed 214',
          subject: 'Fraflytningsopgørelse, stadig intet',
          body: 'Jeg flyttede ud den 30. i sidste måned, og jeg har stadig ikke fået opgørelsen. Nøglerne blev afleveret til tiden, og lejligheden var rengjort. Hvornår får jeg mit depositum, og hvor meget er der tilbage af det?',
        },
        sources: [
          {
            key: 'rules',
            label: 'reglerne om depositum',
            count: '1 linje',
            name: 'reglerne om depositum',
            off: 'Depositumreglerne er slået fra. Udkastet nævner ikke længere fristen på tre uger.',
            on: 'Depositumreglerne er slået til. Fristen på tre uger er tilbage i udkastet.',
          },
          {
            key: 'deadline',
            label: 'fristen på tre uger',
            count: '1 dato',
            name: 'fristen på tre uger',
            off: 'Fristen er slået fra. Datoen forsvinder ud af udkastet.',
            on: 'Fristen er slået til. Den 21. er tilbage i udkastet.',
          },
          {
            key: 'file',
            label: 'sagen på den lejlighed',
            count: '2 linjer',
            name: 'sagen på den lejlighed',
            off: 'Sagen er slået fra. Lejerens navn og kontoen forsvinder ud af udkastet.',
            on: 'Sagen er slået til. Lejerens navn og kontoen er tilbage i udkastet.',
          },
          {
            key: 'deductions',
            label: 'de fradrag, der allerede er noteret',
            count: '2 beløb',
            name: 'de fradrag, der allerede er noteret',
            off: 'Fradragslisten er slået fra. To beløb er fjernet fra udkastet.',
            on: 'Fradragslisten er slået til. To beløb er tilbage i udkastet.',
          },
          {
            key: 'tone',
            label: 'den måde kontoret skriver på',
            count: 'tonen',
            name: 'den måde kontoret skriver på',
            off: 'Kontortonen er slået fra. Samme fakta, stivere sprog.',
            on: 'Kontortonen er slået til. Udkastet lyder som kontoret igen.',
          },
        ],
        salutation:
          {
            key: 'file',
            on: { text: 'Kære Hanne Jensen,' },
            off: { text: 'Kære lejer,' },
          },
        clauses: [
          {
            key: 'tone',
            on: { text: 'Tak fordi du rykker, og undskyld at det har været nødvendigt.' },
            off: { text: 'Det bekræftes hermed, at din henvendelse er modtaget.' },
          },
          {
            key: 'rules',
            on: { text: 'Opgørelsen skal være hos dig senest tre uger efter afleveringen' },
            tone: { text: 'Opgørelsen skal fremsendes senest tre uger efter afleveringen' },
            off: { text: 'Opgørelsen sendes inden for de sædvanlige frister' },
            sep: ', ',
          },
          {
            key: 'deadline',
            on: { text: 'hvilket vil sige senest ', circle: 'den 21', tail: '.' },
            tone: { text: 'hvilket vil sige senest den 21.' },
            off: { text: 'men jeg kan ikke oplyse datoen uden at undersøge det.' },
          },
          {
            key: 'deductions',
            on: { text: 'De to fradrag, der er rejst indtil nu, er flytterengøring på 850 EUR og pletmaling af væggen i entreen på 400 EUR. Der resterer dermed 4.750 EUR af dit depositum, som betales tilbage til' },
            tone: { text: 'Der er hidtil rejst to fradrag: flytterengøring på 850 EUR og pletmaling af væggen i entreen på 400 EUR. Restbeløbet på 4.750 EUR tilbagebetales til' },
            off: { text: 'Der kan komme nogle fradrag. Jeg bekræfter beløbene, når jeg har undersøgt det.' },
          },
          {
            key: 'file',
            dep: 'deductions',
            on: { text: 'den konto, vi har registreret.' },
            tone: { text: 'den registrerede konto.' },
            off: { text: 'din konto.' },
          },
        ],
      },
      {
        id: 'accounting',
        tab: 'Revision',
        deskName: 'Revisions',
        letter: {
          from: 'Mads Kjær, Kjær Snedkeri',
          subject: 'Momsangivelsen, er vi bagud?',
          body: 'Vores bogholder stoppede i august, og jeg aner ikke, hvor vi står. Er angivelsen for kvartalet sendt ind, og skylder vi noget? Jeg vil hellere høre det lige ud end få et brev om det.',
        },
        sources: [
          {
            key: 'rules',
            label: 'reglerne for indberetning',
            count: '1 linje',
            name: 'reglerne for indberetning',
            off: 'Indberetningsreglerne er slået fra. Udkastet nævner ikke længere fristreglen.',
            on: 'Indberetningsreglerne er slået til. Reglen om en måned og syv dage er tilbage i udkastet.',
          },
          {
            key: 'deadline',
            label: 'kvartalets frist',
            count: '1 dato',
            name: 'kvartalets frist',
            off: 'Fristen er slået fra. Datoen forsvinder ud af udkastet.',
            on: 'Fristen er slået til. Den 7. er tilbage i udkastet.',
          },
          {
            key: 'file',
            label: 'sagen på den kunde',
            count: '2 linjer',
            name: 'sagen på den kunde',
            off: 'Sagen er slået fra. Kundens navn og betalingsservice forsvinder ud af udkastet.',
            on: 'Sagen er slået til. Kundens navn og betalingsservice er tilbage i udkastet.',
          },
          {
            key: 'deductions',
            label: 'de tal, der allerede er bogført',
            count: '3 beløb',
            name: 'de tal, der allerede er bogført',
            off: 'De bogførte tal er slået fra. Tre beløb er fjernet fra udkastet.',
            on: 'De bogførte tal er slået til. Tre beløb er tilbage i udkastet.',
          },
          {
            key: 'tone',
            label: 'den måde kontoret skriver på',
            count: 'tonen',
            name: 'den måde kontoret skriver på',
            off: 'Kontortonen er slået fra. Samme fakta, stivere sprog.',
            on: 'Kontortonen er slået til. Udkastet lyder som kontoret igen.',
          },
        ],
        salutation:
          {
            key: 'file',
            on: { text: 'Kære Mads,' },
            off: { text: 'Kære kunde,' },
          },
        clauses: [
          {
            key: 'tone',
            on: { text: 'Tak fordi du spørger lige ud, det er nemmest for os begge.' },
            off: { text: 'Det bekræftes hermed, at din henvendelse er modtaget.' },
          },
          {
            key: 'rules',
            on: { text: 'Angivelsen for kvartalet til den 31. juli skal være inde en måned og syv dage efter kvartalets udløb' },
            tone: { text: 'Angivelsen for kvartalet til den 31. juli skal indsendes en måned og syv dage efter kvartalets udløb' },
            off: { text: 'Angivelsen skal indsendes inden for de sædvanlige frister' },
            sep: ', ',
          },
          {
            key: 'deadline',
            on: { text: 'hvilket giver jer frist ', circle: 'den 7', tail: '.' },
            tone: { text: 'hvilket giver fristen den 7.' },
            off: { text: 'men jeg kan ikke oplyse datoen uden at undersøge det.' },
          },
          {
            key: 'deductions',
            on: { text: 'Alt er bogført til og med juli: 41.280 EUR i salgsmoms mod 12.940 EUR i fradrag, så der skal betales 28.340 EUR fra' },
            tone: { text: 'Samtlige posteringer er bogført til den 31. juli: salgsmoms på 41.280 EUR mod 12.940 EUR i fradrag, hvilket giver 28.340 EUR til betaling fra' },
            off: { text: 'Der kan være noget at betale. Jeg bekræfter beløbet, når jeg har undersøgt det.' },
          },
          {
            key: 'file',
            dep: 'deductions',
            on: { text: 'den konto, vi har registreret, via betalingsservice.' },
            tone: { text: 'den registrerede konto, via betalingsservice.' },
            off: { text: 'din konto.' },
          },
        ],
      },
      {
        id: 'insurance',
        tab: 'Forsikring',
        deskName: 'Forsikrings',
        letter: {
          from: 'Grethe Poulsen, police 4471-C',
          subject: 'Vandskade, stadig intet svar',
          body: 'Køkkengulvet bulede op den 2., og jeres taksator kom ud en uge senere. Ingen har fortalt mig, hvad der er dækket. Skal jeg betale selvrisikoen, eller skal I, og hvornår bliver noget af det egentlig udbetalt?',
        },
        sources: [
          {
            key: 'rules',
            label: 'policens ordlyd',
            count: '1 afsnit',
            name: 'policens ordlyd',
            off: 'Policens ordlyd er slået fra. Udkastet nævner ikke længere afsnittet og selvrisikoen.',
            on: 'Policens ordlyd er slået til. Afsnit 4 og selvrisikoen er tilbage i udkastet.',
          },
          {
            key: 'deadline',
            label: 'fristen på fjorten dage',
            count: '1 dato',
            name: 'fristen på fjorten dage',
            off: 'Fristen er slået fra. Datoen forsvinder ud af udkastet.',
            on: 'Fristen er slået til. Den 18. er tilbage i udkastet.',
          },
          {
            key: 'file',
            label: 'sagen på den skade',
            count: '2 linjer',
            name: 'sagen på den skade',
            off: 'Sagen er slået fra. Skadelidtes navn og kontoen forsvinder ud af udkastet.',
            on: 'Sagen er slået til. Skadelidtes navn og kontoen er tilbage i udkastet.',
          },
          {
            key: 'deductions',
            label: 'de beløb, der allerede er godkendt',
            count: '3 beløb',
            name: 'de beløb, der allerede er godkendt',
            off: 'De godkendte beløb er slået fra. Tre beløb er fjernet fra udkastet.',
            on: 'De godkendte beløb er slået til. Tre beløb er tilbage i udkastet.',
          },
          {
            key: 'tone',
            label: 'den måde kontoret skriver på',
            count: 'tonen',
            name: 'den måde kontoret skriver på',
            off: 'Kontortonen er slået fra. Samme fakta, stivere sprog.',
            on: 'Kontortonen er slået til. Udkastet lyder som kontoret igen.',
          },
        ],
        salutation:
          {
            key: 'file',
            on: { text: 'Kære Grethe Poulsen,' },
            off: { text: 'Kære forsikringstager,' },
          },
        clauses: [
          {
            key: 'tone',
            on: { text: 'Tak fordi du rykker, og undskyld at det har været nødvendigt.' },
            off: { text: 'Det bekræftes hermed, at din henvendelse er modtaget.' },
          },
          {
            key: 'rules',
            on: { text: 'Vandskade er dækket efter policens afsnit 4, med en selvrisiko på 350 EUR' },
            tone: { text: 'Vandskade henhører under policens afsnit 4, selvrisiko 350 EUR' },
            off: { text: 'Vandskade er dækket på sædvanlig vis' },
            sep: ', ',
          },
          {
            key: 'deadline',
            on: { text: 'og vi melder tilbage om dækningen senest fjorten dage efter taksatorrapporten, altså ', circle: 'den 18', tail: '.' },
            tone: { text: 'og dækningen bekræftes senest fjorten dage efter taksatorrapporten, altså den 18.' },
            off: { text: 'men jeg kan ikke oplyse datoen uden at undersøge det.' },
          },
          {
            key: 'deductions',
            on: { text: 'Taksator har godkendt 6.200 EUR til gulvet og 1.150 EUR til affugtning, så efter selvrisiko udbetales 7.000 EUR til' },
            tone: { text: 'Taksator har godkendt 6.200 EUR til gulvet og 1.150 EUR til affugtning; efter selvrisiko udgør beløbet 7.000 EUR, som udbetales til' },
            off: { text: 'Der kan komme en udbetaling. Jeg bekræfter beløbene, når jeg har undersøgt det.' },
          },
          {
            key: 'file',
            dep: 'deductions',
            on: { text: 'den konto, vi har registreret.' },
            tone: { text: 'den registrerede konto.' },
            off: { text: 'din konto.' },
          },
        ],
      },
    ],
  },

  numbers: {
    eyebrow: 'Vores eget regnestykke',
    title: 'Hvad I beholder',
    lede: { before: 'Jeres post, jeres timepris. ', mark: 'Siden regner det ud', after: ' og påstår aldrig en besparelse.' },
    about: 'cirka\u00a0',
    inputs: {
      people: { label: 'Personer, der svarer på mails' },
      inbound: { label: 'Mails, hver af dem får om måneden' },
      hourly: { label: 'Hvad en time af deres tid koster' },
      minutes: { label: 'Minutter sparet pr. udkast', note: 'Jeres skøn. Vi har ikke taget tid på det endnu.' },
    },
    beats: {
      drafts: { label: 'Udkast om måneden:' },
      draftsNote: { before: 'Målt: ', after: ' % af den indgående post er det samme spørgsmål igen.' },
      hours: { label: 'Timer, I får tilbage:' },
      worth: { label: 'Hvad de timer koster jer i dag:' },
      fee: { label: 'Det her koster:' },
      keep: { label: 'I beholder:' },
    },
    units: { hours: '\u00a0t', perMonth: ' om måneden', perHour: ' i timen' },
    yearLabel: 'Over et år:',
    under: 'Med de tal tjener det sig ikke hjem. Det ville vi sige på mødet i stedet for at sælge det til jer.',
    moreLabel: 'Vis regnestykket',
    basis: [
      {
        term: 'Andelen',
        def: 'Målt på en rigtig postkasse: den andel af den indgående post, der får et udkast, fordi det er det samme spørgsmål igen. Alt andet på panelet er ganget op fra den.',
      },
      {
        term: 'Minutterne',
        def: 'Antaget, og endnu aldrig taget tid på. At skrive et svar fra bunden tager omkring fem minutter; at læse et færdigt udkast og sende det tager omkring ét. I kan sætte jeres eget tal ind.',
      },
      {
        term: 'Timen',
        def: 'Jeres, ikke vores. Hvad en person, der svarer på mails, koster virksomheden i timen, med arbejdsgiveromkostninger oveni. Vi har sat et groft tal ind for det marked, siden læses i.',
      },
    ],
    notes: [
      'Endnu aldrig efterprøvet hos en rigtig kunde. Jeres tal afhænger af, hvor meget af jeres post der er gentagelsesarbejde.',
      'Vi regner det igennem på jeres egne tal på mødet og siger det, hvis det ikke går op.',
    ],
  },

  who: {
    eyebrow: 'Arkiveret under',
    title: 'Hvem det er til',
    groups: [
      { tab: 'Revisionsfirmaer', line: 'Spørgsmål om honorarer og manglende bilag, hver eneste frist.' },
      { tab: 'Forsikringsmæglere', line: 'Svaret står som regel allerede i policen.' },
      { tab: 'Ejendomsadministratorer', line: 'Beboerpost, depositum og vedligehold. Hele året.' },
    ],
    notes: {
      seats: {
        before: 'Én pris dækker ',
        mark: 'hele virksomheden',
        mid: ', og den er sat til ti personer og opefter. Under det gør planen på ',
        link: 'doviloop.dev',
        after: ' det samme arbejde og koster væsentligt mindre.',
      },
      setup: {
        before: 'Ingen udvikler, ingen ny mailadresse. Sidder I i Outlook, ',
        mark: 'er opsætningen vores opgave',
        after: '.',
      },
    },
  },

  price: {
    eyebrow: 'To uger, så bestemmer I',
    title: 'Hvad det koster',

    cohortName: 'allerførste',

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
        note: 'En workshop på jeres egen rigtige post.',
        waived: {
          label: 'Bortfalder',
          say: { before: 'Opsætningsprisen på ', after: ' bortfalder, så længe der er ledige pladser.' },
        },
      },
    ],

    packages: {
      title: 'De to pakker',
      lede: 'Samme produkt i begge. Det, der ændrer sig, er hvor mange mennesker det dækker, og hvor mange udkast firmaet deles om.',
      pick: 'Vælg ved at tælle jeres folk.',
      rows: [
        { id: 'desk', name: 'Desk', note: 'Til et firma op til ti personer.' },
        { id: 'firm', name: 'Firm', note: 'Til et firma op til tyve. Samme pris ved elleve personer som ved tyve.' },
      ],
      feeLabel: 'Pr. måned, hele firmaet',
      peopleLabel: 'Personer dækket, op til',
      draftsLabel: 'Udkast om måneden, fælles',
      note: 'Ingen af tallene er pr. person. Udkastene er fælles, og ingen har deres egen kvote, der kan løbe tør.',
    },

    included: {
      title: 'I begge pakker',
      items: [
        'Jeres hjemmeside læst ind i en vidensbase, og en samtale, der udfylder det, den mangler.',
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
      eyebrow: { before: 'De ', after: ' pladser' },
      title: 'En byttehandel, ikke en rabat',
      lede: {
        noProofYet: 'Vi har endnu ingen kunder at pege på.',
        trade: 'De her pladser er en byttehandel: opsætningsprisen bortfalder, for jeres navn på arbejdet.',
      },
      reason: { before: 'Prisen er så lav, fordi vi har brug for ', after: ' virksomheder, der vil sige, at det virker.' },
      spots: { label: 'Ledige pladser tilbage:', of: ' af ' },
      spotsClosed: 'Pladserne, der fulgte med en byttehandel, er taget. Månedsprisen nedenfor er den samme, de betalte; opsætningsprisen opkræves nu fuldt ud.',
      givesTitle: 'Det, I giver',
      gives: [
        'En udtalelse til produktsiden, med jeres egne ord.',
        'En case efter tres dage, med tal, I gerne vil vise frem.',
        'Jeres logo på produktsiden.',
        'To feedbackmøder i de første to måneder.',
      ],
      getsTitle: 'Det, I får',
      gets: {
        fee: {
          before: 'En plads blandt de ',
          after: ' fem, hvilket er så mange virksomheder, én person kan give rigtig opmærksomhed ad gangen.',
        },
        setup: 'Opsætningsprisen bortfalder helt.',
      },
      note: 'Vil I helst ikke nævnes, betaler I opsætningsprisen, og intet andet ved produktet ændrer sig.',
    },

    freeTitle: 'De første to uger er gratis',
    freeNote: 'I bruger tiden på workshoppen, intet andet.',
    termsLabel: 'Vis vilkårene',
    terms: [
      { t: 'Workshop og opsætning er med.', n: 'Ingen af delene faktureres bagefter.' },
      { t: 'Intet kort, og ingen betaling.', n: 'Betalingsoplysninger kommer senere, efter I har sagt ja.' },
      { t: 'Siger I nej, betaler I intet.', n: 'Der faktureres ikke noget, og der er ikke noget at opsige.' },
      { t: 'Prisen er måned til måned.', n: 'Ingen binding på et år, og intet fast antal medarbejdere at leve op til.' },
    ],

    whenTitle: 'Hvad der sker, og hvornår',
    stops: [
      {
        day: 'Dag 0',
        note: 'Workshoppen køres. Udkastene begynder at komme tilbage.',
        state: 'Intet faktureret endnu',
        say: {
          before: 'Dag 0. Workshoppen køres, og udkastene begynder at komme tilbage. Der faktureres ikke noget. Månedsprisen lyder på ',
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
    total: {
      term: 'Hele virksomheden',
      sub: { label: 'Personer dækket, op til:' },
      per: 'om måneden',
      zero: '0 EUR',
    },

    askEyebrow: 'Inden I booker',
    ask: {
      before: 'Tilbuddet er sat til virksomheder på tre personer og opefter. Under det gør planen på ',
      link: 'doviloop.dev',
      after: ' det samme arbejde og koster væsentligt mindre.',
    },
    ctaNote: 'To uger gratis. Siger I nej på opsamlingsmødet, faktureres der ikke noget.',
  },

  form: {
    eyebrow: 'Hvad gør jeg nu',
    title: 'Seks spørgsmål. Under et minut.',
    lead: 'Sådan finder vi ud af, om et møde er din tid værd. Er det ikke det, siger den her side det i stedet for at booke dig.',
    formNo: 'Pasformstjek',
    optional: 'Valgfrit',
    companyLabel: 'Virksomhedens navn',
    companyPlaceholder: 'Navnet på jeres fakturaer',
    emailLabel: 'Arbejdsmail',
    emailPlaceholder: 'dig@ditfirma.dk',
    emailHint: 'Bruges kun til at sende mødedetaljer og pilotaftalen.',
    emailFreeWarning:
      'Det ligner en privat adresse. Den virker fint, men en arbejdsmail hjælper os med at finde jeres virksomhed, inden vi taler sammen.',
    phoneLabel: 'Telefon',
    phonePlaceholder: 'Med landekode',
    teamSizeLabel: 'Hvor mange sidder med mails hver dag?',
    teamSizeOptions: [
      { value: '1-9', label: '1 til 9 personer' },
      { value: '10-24', label: '10 til 24 personer' },
      { value: '25-49', label: '25 til 49 personer' },
      { value: '50+', label: '50 eller flere' },
    ],
    emailClientLabel: 'Hvad bruger teamet?',
    emailClientOptions: [
      { value: 'outlook', label: 'Outlook' },
      { value: 'gmail', label: 'Gmail' },
      { value: 'other', label: 'Noget andet' },
    ],
    roleLabel: 'Din rolle',
    roleOptions: [
      { value: 'owner_partner', label: 'Ejer eller partner' },
      { value: 'ops_office_manager', label: 'Drift eller kontorchef' },
      { value: 'it_admin', label: 'IT eller administration' },
      { value: 'other', label: 'Noget andet' },
    ],
    choosePrompt: 'Vælg en',
    steps: ['Om teamet', 'Sådan får vi fat i jer'],
    stepsLabel: 'Tjekket, i to trin',
    continueCta: 'Videre',
    backCta: 'Tilbage',
    submit: 'Se om vi passer sammen',
    submitting: 'Et øjeblik',
    required: 'Den her skal udfyldes.',
    invalidEmail: 'Den adresse ser ikke komplet ud.',
    invalidPhone: 'Skriv et nummer, vi kan få fat i dig på.',
    privacyNote:
      'Vi bruger svarene til at forberede mødet og ikke til andet. Ingen liste, intet videresalg.',
  },

  results: {
    qualified: {
      title: 'Det passer. Lad os få booket mødet.',
      body: 'Tyve minutter, og du vælger tidspunktet. Ingen slides, ingen tilbudsmappe bagefter.',
      coversTitle: 'Det gennemgår vi',
      covers: [
        'Hvad dit team faktisk svarer på hele dagen, med deres egne ord.',
        'Om jeres eksisterende materiale er i en form, vi kan arbejde ud fra.',
        'Hvordan de fjorten dages pilot ville se ud i jeres kalender.',
        'Prisen igen, lige ud, og regnestykket på jeres egne tal.',
      ],
      bookingCta: 'Vælg et tidspunkt',
      bookingFallback: 'Skriv til os for at booke',
      sameEmail:
        'Én ting: book med den samme mail, som du har givet os her. Så kobler vi mødet sammen med det, du har skrevet.',
    },
    gmailNote:
      'Du skrev, at teamet ikke sidder i Outlook. Det er helt fint. Gmail og andre klienter sættes op per team i onboardingen, og vi gennemgår på mødet, hvad det kræver.',
    tooSmall: {
      title: 'Det her starter ved ti personer.',
      body: 'I er under det i dag, så et møde ville bruge tyve minutter af din tid på at nå frem til det samme svar. Planen på doviloop.dev laver den samme skrivning for mindre teams og koster væsentligt mindre. Vend tilbage, når teamet vokser, så tager vi den derfra.',
      pricingCta: 'Se planen til mindre teams',
      nurtureTitle: 'Vil du hellere have den korte version på mail?',
      nurtureBody:
        'Tre mails over fjorten dage om, hvordan små kontorer skærer ned på gentagen post. Ingen opkald, og du kan stoppe efter den første.',
      nurtureCta: 'Send mig de tre mails',
      nurtureSubject: 'Send mig de tre mails',
      nurtureMailBody:
        'Send mig gerne de tre korte mails om at skære ned på gentagen post. Vi er et mindre firma indtil videre.',
    },
    deliveryWarning:
      'Vores system nåede ikke at bekræfte dine svar, så vi har gemt dem på den her enhed og sender dem igen automatisk. Der er ikke noget gået tabt. Book endelig mødet nedenfor alligevel.',
    startOver: 'Ret et svar',
  },

  consent: {
    title: 'Cookies på denne side',
    body: 'To ting her gemmer noget på din enhed: besøgstælling og annoncering. Ingen af dem kører, før du accepterer.',
    accept: 'Accepter',
    decline: 'Afvis',
    detailsLabel: 'Hvad hver ting gør',
    items: [
      {
        name: 'Tælling af besøg',
        body: 'PostHog, hostet i EU. Hvilke afsnit der bliver læst, og hvor langt ned på siden folk når. Ingen sessionsoptagelse, ingen heatmaps.',
      },
      {
        name: 'Annoncering',
        body: 'Meta-pixlen. Gør det muligt at vise annoncer på Facebook og Instagram til folk, der har været på denne side.',
      },
    ],
    note: 'Afviser du, ændrer det intet ved siden, det gennemregnede eksempel eller formularen. Du kan skifte mening nederst på siden.',
    privacyLabel: 'Privatlivspolitik',
    statusGranted: 'Accepteret',
    statusDenied: 'Afvist',
    statusUnset: 'Ikke valgt',
    reopenLabel: 'Skift cookievalg',
  },

  footer: {
    tagline: 'Mailsvar til teams, der lever i indbakken.',
    consentLink: 'Cookies',
    officeLabel: 'Hjemsted',
    elsewhereLabel: 'Andre steder',
    productLink: 'Produktsiden',
    privacyLink: 'Privatliv',
    contactLink: 'Kontakt os',
    setIn: 'Sat i Playfair Display og DM Sans',
    company: {
      legalName: 'DoviLoop OU',
      registrationNumber: '17355061',
      address: 'Sepapaja 6, 15551 Tallinn, Estonia',
    },
  },
};
