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
    dateline: 'Teams-udgaven. Ti pladser og opefter.',
    nav: { example: 'Eksempel', price: 'Hvad det koster', fit: 'Passer det' },
    tab: 'Se om vi passer sammen',

    title: { before: 'Skrevet ud fra ', mark: 'jeres egne sager', after: '. Sendt af jeres folk.' },
    deck: { before: 'Klokken er ', after: '. Fyrre mails venter. De har alle sammen allerede et udkast.' },

    cta: 'Se om vi passer sammen',
    ctaNote: 'Fra 890 USD om måneden. De første to uger er gratis.',

    pileAlt: 'En bunke på fyrre breve, der venter på et skrivebord.',
    deal: {
      exampleLabel: 'Eksempel på en mail',
      from: 'Fra en beboer i lejlighed 214',
      subjectLabel: 'Emne',
      subject: 'Fraflytningsopgørelse, stadig intet',
      sr: 'Læs den i det gennemgåede eksempel.',
    },

    bar: {
      text: 'Fra 890 USD om måneden for ti pladser, plus 500 USD i opsætning én gang. De første to uger er gratis.',
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
    title: 'Se det virke',
    lead: 'To minutter, rigtige mails, ingen slides.',
    placeholderTitle: 'Demovideo',
    placeholderBody:
      'Optagelsen ligger her. Læser du det her, før den er lagt op, så spørg på mødet, så viser vi dig det samme live.',
    playLabel: 'Afspil demoen',
    caption: 'Optaget i en rigtig indbakke. Navne og beløb er ændret.',
  },

  numbers: {
    eyebrow: 'Vores eget regnestykke',
    title: 'Hvad det er værd',
    about: 'cirka\u00a0',
    rows: [
      { amount: '5', unit: 'x', label: 'i afkast af prisen per plads' },
      { amount: '400', unit: '\u00a0EUR', label: 'sparet om måneden, per plads' },
      { amount: '40', unit: '\u00a0dage', label: 'til at tjene opsætning og første måned hjem' },
    ],
    lede: { before: 'Det er en model, ', mark: 'ikke en måling', after: '.' },
    moreLabel: 'Vis regnestykket',
    basis: [
      { term: 'cirka 5x', def: 'Antaget sparet tid, holdt op mod prisen per plads.' },
      { term: 'cirka 400 EUR', def: 'Antaget sparede timer, ved en mellemlønning.' },
      {
        term: 'cirka 40 dage',
        def: 'Opsætningen på 500 USD og første måneds pladser, holdt op mod besparelsen ovenfor.',
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
      { tab: 'Administrationsfirmaer', line: 'Beboerpost, depositum og vedligehold. Hele året.' },
    ],
    notes: {
      seats: {
        before: 'Tilbuddet starter ved ',
        mark: '10 pladser',
        mid: '. Under det gør planen på ',
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
      legalName: 'DoviLoop OU',
      registrationNumber: '17355061',
      address: 'Sepapaja 6, 15551 Tallinn, Estonia',
    },
  },
};
