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
    cta: 'Book et møde',
  },

  hero: {
    clockIn: '08:40',
    clockOut: '08:41',

    skip: 'Spring til indholdet',
    dateline: 'Mailudkast til teams på ti og opefter.',
    nav: { example: 'Eksempel', price: 'Hvad det koster', fit: 'Passer det' },
    tab: 'Se om vi passer sammen',

    title: { before: 'Skrevet ud fra ', mark: 'jeres egne sager', after: '. Sendt af jeres folk.' },
    deck: {
      before: 'Klokken er ',
      after:
        '. Fyrre mails venter. De har alle sammen allerede et svar i udkast, skrevet ud fra jeres egne sager.',
    },

    cta: 'Se om vi passer sammen',
    ctaNote: 'De første to uger er gratis. Intet kort, og ingen betaling.',

    pileAlt: 'En bunke på fyrre breve, der venter på et skrivebord.',
    deal: {
      exampleLabel: 'Eksempel på en mail',
      from: 'Fra en beboer i lejlighed 214',
      subjectLabel: 'Emne',
      subject: 'Fraflytningsopgørelse, stadig intet',
      sr: 'Læs den i det gennemgåede eksempel.',
    },

    bar: {
      text: 'De første to uger er gratis.',
      cta: 'Se om det passer',
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
    title: 'Hvad det er værd',
    about: 'cirka\u00a0',
    rows: [
      { key: 'multiple', unit: 'x', label: 'sparet tid, holdt op mod det, virksomheden betaler' },
      { key: 'saving', amount: '430', unit: '\u00a0USD', label: 'sparet om måneden, for hver person' },
      { key: 'payback', unit: '\u00a0dage', label: 'til at tjene opstarten hjem' },
    ],
    lede: { before: 'Det er en model, ', mark: 'ikke en måling', after: '.' },
    moreLabel: 'Vis regnestykket',
    basis: [
      {
        term: 'Faktoren',
        def: 'Besparelsen nedenfor ganget med ti personer, holdt op mod den ene månedspris, virksomheden betaler. Ti personer er den mindste virksomhed, vi sælger det her til, så et tal, der holder der, holder i alle størrelser derover.',
      },
      {
        term: 'Besparelsen',
        def: 'Antagne sparede timer ved en mellemløn, omregnet fra euro. Én person, én måned.',
      },
      {
        term: 'Tilbagebetalingen',
        def: 'Det, virksomheden betaler for at komme i gang, holdt op mod den samme besparelse på tværs af ti personer.',
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
    eyebrow: 'Hvad det koster, og hvad I risikerer',
    title: 'Hvad det koster',

    tierNames: { founding: 'allerførste', early: 'tidlige', standard: 'almindelige' },

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
          say: { before: 'Opsætningsprisen på ', after: ' bortfalder på det her trin.' },
        },
      },
    ],

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
      lede: 'Vi har endnu ingen kunder at pege på. De her pladser er måden, vi får nogle på, så den lavere pris er det, vi betaler for jeres navn på arbejdet.',
      spots: { label: 'Ledige pladser tilbage:', of: ' af ' },
      spotsClosed: 'Pladserne, der fulgte med en byttehandel, er taget. Prisen nedenfor er den almindelige, og der er ikke noget at bytte for den.',
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
          before: 'Prisen om måneden for hele virksomheden på de ',
          after: ' pladser, ikke den almindelige pris.',
        },
        setup: 'Opsætningsprisen bortfalder helt.',
      },
      note: 'Vil I helst ikke nævnes, tager I den almindelige pris, og intet andet ved produktet ændrer sig.',
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
      zero: '0 USD',
    },

    askEyebrow: 'Inden I booker',
    ask: {
      before: 'Tilbuddet er sat til virksomheder på ti personer og opefter. Under det gør planen på ',
      link: 'doviloop.dev',
      after: ' det samme arbejde og koster væsentligt mindre.',
    },
    cta: 'Se om vi passer sammen',
    ctaNote: 'To uger gratis. Siger I nej på opsamlingsmødet, faktureres der ikke noget.',
  },

  compare: {
    eyebrow: 'Regnestykket per person',
    title: 'Hvad hver person koster',
    lede: 'Én pris for hele virksomheden betyder, at prisen per person falder, i takt med at virksomheden vokser. Her er, hvor den lander, med den største virksomhed, Team-planen sælger til, ved siden af.',

    planLabel: 'Abonnement',
    perHeadLabel: 'Per person',
    firmLabel: 'Virksomheden',

    ourPlan: 'Det her tilbud',
    ourSize: { label: 'Personer:' },

    teamPlan: 'Team-planen',
    teamSize: { label: 'Personer, højst:' },

    claimsTitle: 'Hvad det svarer til',
    claims: {
      belowTeamCeiling: {
        before: 'Team-planen sælges ikke til flere personer end ',
        mid: '. Den største virksomhed, planen kan sælge til, betaler ',
        then: ' om måneden. Hele virksomheden betaler ',
        after: ' om måneden her, i alle de størrelser, prisen dækker.',
      },
      curve: {
        smallOpen: 'Er antallet af personer ',
        smallCost: ', koster hver person ',
        largeOpen: ' om måneden. Er antallet af personer ',
        largeCost: ', koster hver person ',
        after: ' om måneden. Prisen for hele virksomheden er den samme i begge tilfælde, så prisen per person falder, i takt med at virksomheden vokser.',
      },
    },

    individualNote: {
      before:
        'Individual er det andet abonnement på produktsiden. Det er til én person, det købes én plads ad gangen, og hver plads har sin egen vidensbase. Én plads koster ',
      after: ' om måneden.',
    },

    sourceNote: {
      before: 'Taksterne for Team og Individual her er de offentliggjorte priser på ',
      link: 'doviloop.dev',
      mid: ', aflæst ',
      after: '. Vi har ikke justeret dem.',
    },
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
