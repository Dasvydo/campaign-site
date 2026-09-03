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
    opening: 'Klokken er 08:40, og fyrre mails venter.',
    subOpening:
      'De skal alle sammen have et ordentligt svar. De fleste af dem ligner de fyrre foregående. Lige om lidt bruger en på kontoret hele formiddagen på at skrive dem igen.',
    claim:
      'DoviLoop skriver det første udkast til hver eneste. Dit team læser det, retter det, de vil, og sender. Der går intet ud af huset, som et menneske ikke har godkendt.',
    cta: 'Book et møde',
    ctaNote: 'Teams på 10 eller flere. Tyve minutter, og vi siger det på mødet, hvis det ikke passer.',
    exampleCaption: 'Et eksempel på en mail og det udkast, den gav.',
    message: {
      from: 'Hanne Jensen, lejlighed 214',
      subject: 'Fraflytningsopgørelse, stadig intet',
      body: 'Jeg flyttede ud den 30. i sidste måned, og jeg har stadig ikke fået opgørelsen. Nøglerne blev afleveret til tiden, og lejligheden var rengjort. Hvornår får jeg mit depositum, og hvor meget er der tilbage af det?',
    },
    draftReady: 'Udkast klar',
    draft: {
      greeting: 'Kære Hanne Jensen,',
      body: 'Tak fordi du rykker, og undskyld at det har været nødvendigt. Opgørelsen skal være hos dig senest tre uger efter afleveringen, altså den 21. Jeg kan se, at lejligheden blev afleveret den 30., og at nøglerne kom retur samme dag. De to fradrag, der er rejst indtil nu, er flytterengøring på 850 og pletmaling af væggen i entreen på 400. Der resterer dermed 4.750 af dit depositum, som betales tilbage til den konto, vi har registreret.',
      signoff: 'Jeg sender den fulde opgørelse, så snart den sidste aflæsning er inde.',
    },
    afterLine: 'Du læser det. Du sender det. Det tog elleve sekunder i stedet for ni minutter.',
  },

  how: {
    title: 'Sådan fungerer det i praksis',
    lead: 'Der sker tre ting, fra mailen lander, til udkastet står klar. Ingen af dem kræver nogen teknisk.',
    steps: [
      {
        n: '01',
        title: 'Den læser mailen',
        body: 'Hvem der skriver, hvad de spørger om, og hvad de fik at vide sidste gang de skrev. Præcis det gennemsyn en god kollega laver, før hun begynder at skrive.',
      },
      {
        n: '02',
        title: 'Den henter det, I faktisk ved',
        body: 'Jeres regler for depositum. Jeres prisliste. Den formulering, partneren godkendte i marts. Den svarer ud fra jeres eget materiale og jeres egne tidligere svar, ikke ud fra noget den fandt på nettet.',
      },
      {
        n: '03',
        title: 'Den skriver svaret i jeres tone',
        body: 'I den tone, I allerede bruger, med detaljerne sat ind. Så stopper den og venter på et menneske. Dit team læser udkastet, retter det, de vil, og trykker send.',
      },
    ],
  },

  demo: {
    title: 'Se det virke',
    lead: 'To minutter, rigtige mails, ingen slides.',
    placeholderTitle: 'Demovideo',
    placeholderBody:
      'Optagelsen ligger her. Læser du det her, før den er lagt op, så spørg på mødet, så viser vi dig det samme live.',
    playLabel: 'Afspil demoen',
    caption: 'Optaget i en rigtig indbakke. Navne og beløb er ændret.',
  },

  numbers: {
    title: 'Hvad det er værd',
    lead: 'Tre tal vi kan stå inde for, og hvor hvert af dem kommer fra.',
    rows: [
      {
        figure: 'cirka 9x',
        label: 'i afkast på prisen per bruger',
        basis: 'Sparet tid holdt op mod, hvad en bruger koster jer om måneden.',
      },
      {
        figure: 'cirka 400 EUR',
        label: 'sparet om måneden, per bruger',
        basis: 'Tid der ikke længere går med at skrive de samme svar igen, sat til en mellemlederløn.',
      },
      {
        figure: 'cirka 40 dage',
        label: 'før opstartsgebyret er tjent hjem',
        basis: 'Med opstartsgebyret på 500 dollar og den første måneds brugere regnet med.',
      },
    ],
    caveat:
      'Det er estimater fra målt brug, ikke en garanti. Hvad I får ud af det afhænger af, hvor stor en del af jeres post der er gengangere. Vi laver regnestykket med jeres egne tal på mødet, og hvis det ikke holder, siger vi det.',
  },

  who: {
    title: 'Hvem det er til',
    lead: 'Tre slags kontorer med det samme problem: rigtig meget post, og hvert svar skal være rigtigt.',
    groups: [
      {
        title: 'Revisionsfirmaer',
        body: 'De samme spørgsmål fra kunderne, i hver eneste af de fire uger op til en frist. Spørgsmål om honorar, manglende bilag, hvad der sker hvis vi kommer for sent.',
      },
      {
        title: 'Forsikringsmæglere',
        body: 'Skadesbehandling hvor svaret som regel allerede står i policen, og forsinkelsen ligger i at få det skrevet klart.',
      },
      {
        title: 'Administration og boligselskaber',
        body: 'Boligforeninger, kollegier, ejendoms- og facilityadministration. Beboerpost, depositum, vedligeholdelsessager, i mængder, hele året.',
      },
    ],
    seatMinimum:
      'Det her tilbud starter ved 10 brugere. Er I færre, laver planen på doviloop.dev det samme og koster væsentligt mindre.',
    noTech:
      'I skal ikke bruge en udvikler, og I skal ikke skifte mail. Sidder teamet i Outlook, er opsætningen vores opgave.',
  },

  objections: {
    title: 'Fem ting folk spørger om, før de booker',
    lead: 'De svar vi alligevel ville give jer på mødet.',
    items: [
      {
        q: 'Det kommer til at lyde som en robot.',
        a: 'Det lyder som den, der skrev jeres sidste par hundrede svar, for det er det, den arbejder ud fra. Og et menneske læser hvert udkast, før det går. Lyder et af dem forkert, retter I det, og det næste rammer tættere. Efter fjorten dage holder de fleste teams op med at rette de rutineprægede overhovedet.',
      },
      {
        q: 'Vores data er fortrolige.',
        a: 'Jeres materiale forbliver jeres. Det bruges til at besvare jeres post og ingenting andet. Det bruges ikke til at træne en fælles model, det er ikke synligt for andre kunder, og det ligger i EU. I får databehandleraftalen, før pilotperioden går i gang, ikke bagefter.',
      },
      {
        q: 'Mit team kommer ikke til at bruge det.',
        a: 'Det er den almindelige grund til, at den slags værktøjer falder til jorden, og det er præcis det, opstartsgebyret dækker. Vi holder en workshop med jeres team i deres egen rigtige post, og vi bliver, til de kan køre det uden os. At få jeres folk til at bruge det er vores opgave i uge et, ikke jeres.',
      },
      {
        q: 'Vi har allerede Copilot.',
        a: 'Copilot skriver godt, og den kender ikke jeres virksomhed. Spørg den om jeres depositumregler eller jeres prisliste, og du får noget høfligt og forkert. Det her svarer ud fra jeres dokumenter og jeres egne tidligere svar. Flere teams kører begge dele, Copilot til almindelig skrivning og det her til den post, der skal være korrekt.',
      },
      {
        q: 'Hvad sker der, når den rammer forkert.',
        a: 'Der sendes ikke noget af sig selv. Et forkert udkast er et udkast, du sletter, og det kostede dig de ti sekunder, du ellers havde brugt på at stirre på en tom mail. Der findes ingen vej, hvor et dårligt svar når frem til jeres kunde, uden at en af jeres folk har læst det og trykket send.',
      },
    ],
  },

  price: {
    title: 'Hvad det koster',
    perSeat: '89 USD',
    perSeatNote: 'per bruger, per måned',
    setup: '500 USD',
    setupNote: 'i opstart, én gang. Workshop og onboarding er med.',
    lines: [
      'De første fjorten dage er gratis, hele vejen. Workshop og opsætning er med.',
      'Kortet lægges ind fra start og trækkes på dag 14, når pilotperioden er slut. Ikke før.',
      'Stopper I inden for de fjorten dage, bliver der ikke trukket noget som helst.',
      'Minimum 10 brugere. I kan lægge til og trække fra måned for måned.',
    ],
    cta: 'Se om vi passer sammen',
  },

  form: {
    title: 'Seks spørgsmål. Under et minut.',
    lead: 'Sådan finder vi ud af, om et møde er din tid værd. Er det ikke det, siger den her side det i stedet for at booke dig.',
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
      title: 'Det her starter ved 10 brugere.',
      body: 'I er under det i dag, så et møde ville bruge tyve minutter af din tid på at nå frem til det samme svar. Planen på doviloop.dev laver den samme skrivning for mindre teams og koster væsentligt mindre. Vend tilbage, når teamet vokser, så tager vi den derfra.',
      pricingCta: 'Se planen til mindre teams',
      nurtureTitle: 'Vil du hellere have den korte version på mail?',
      nurtureBody:
        'Tre mails over fjorten dage om, hvordan små kontorer skærer ned på gentagen post. Ingen opkald, og du kan stoppe efter den første.',
      nurtureCta: 'Send mig de tre mails',
      nurtureSubject: 'Send mig de tre mails',
      nurtureMailBody:
        'Send mig gerne de tre korte mails om at skære ned på gentagen post. Vi er under 10 brugere indtil videre.',
    },
    deliveryWarning:
      'Vores system nåede ikke at bekræfte dine svar, så vi har gemt dem på den her enhed og sender dem igen automatisk. Der er ikke noget gået tabt. Book endelig mødet nedenfor alligevel.',
    startOver: 'Ret et svar',
  },

  footer: {
    tagline: 'Mailsvar til teams, der lever i indbakken.',
    productLink: 'Produktsiden',
    privacyLink: 'Privatliv',
    contactLink: 'Kontakt os',
    company: {
      legalName: '',
      registrationNumber: '',
      address: '',
    },
  },
};
