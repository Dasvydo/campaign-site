import type { Content } from './types';

/*
 * <!-- NEEDS NATIVE CHECK -->
 *
 * Lietuviu kalba. Parasyta kaip lietuviskas tekstas, o ne pazodinis vertimas.
 * Visur naudojamas mandagusis kreipinys "Jus". Pries paleidziant mokama
 * reklama tekstas turi buti perskaitytas gimtakalbio. Zr. BLOCKED.md 6 punkta.
 *
 * Jokiu ilgu bruksniu. Jokiu isgalvotu klientu ar atsiliepimu.
 */
export const lt: Content = {
  htmlLang: 'lt',
  nativeCheck: 'NEEDS NATIVE CHECK',

  meta: {
    title: 'DoviLoop komandoms. Laiškų atsakymai biurams, dirbantiems su Outlook.',
    description:
      'Jūsų komanda visą dieną atsako į tokio paties pobūdžio laiškus. DoviLoop perskaito kiekvieną, paima tai, ką Jūsų įmonė iš tikrųjų žino, ir parašo atsakymą Jūsų tonu. Jūsų žmonės perskaito ir išsiunčia. Komandoms nuo 10 žmonių.',
  },

  nav: {
    skipToContent: 'Pereiti prie turinio',
    localeLabel: 'Kalba',
    localeNames: { en: 'English', da: 'Dansk', lt: 'Lietuvių' },
    cta: 'Užsisakykite pokalbį',
  },

  hero: {
    clockIn: '08:40',
    clockOut: '08:41',

    skip: 'Pereiti prie turinio',
    dateline: 'Komandų leidimas. Nuo dešimties vietų.',
    nav: { example: 'Pavyzdys', price: 'Kiek kainuoja', fit: 'Ar tinkame' },
    tab: 'Pažiūrėkite, ar tinkame',

    title: { before: 'Parašyta iš ', mark: 'jūsų pačių bylų', after: '. Išsiųsta jūsų žmonių.' },
    deck: { before: 'Dabar ', after: '. Laukia keturiasdešimt laiškų. Kiekvienas jau turi juodraštį.' },

    cta: 'Pažiūrėkite, ar tinkame',
    ctaNote: 'Nuo 890 USD per mėnesį. Pirmos dvi savaitės nemokamai.',

    pileAlt: 'Keturiasdešimties laiškų krūva, laukianti ant stalo.',
    deal: {
      exampleLabel: 'Laiško pavyzdys',
      from: 'Nuo gyventojos iš 214 buto',
      subjectLabel: 'Tema',
      subject: 'Atsiskaitymas už užstatą, vis dar nieko',
      sr: 'Perskaitykite jį išnagrinėtame pavyzdyje.',
    },

    bar: {
      text: 'Nuo 890 USD per mėnesį dešimčiai vietų, plius 500 USD vienkartinis įdiegimas. Pirmos dvi savaitės nemokamai.',
      cta: 'Patikrinkite, ar tinkame',
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
  },

  demo: {
    title: 'Pažiūrėkite, kaip veikia',
    lead: 'Dvi minutės, tikri laiškai, jokių skaidrių.',
    placeholderTitle: 'Demonstracinis vaizdo įrašas',
    placeholderBody:
      'Įrašas bus čia. Jei skaitote tai anksčiau, nei jis įkeltas, paklauskite pokalbio metu ir parodysime tą patį gyvai.',
    playLabel: 'Paleisti demonstraciją',
    caption: 'Įrašyta tikroje pašto dėžutėje. Vardai ir sumos pakeisti.',
  },

  numbers: {
    eyebrow: 'Mūsų pačių skaičiavimas',
    title: 'Kiek tai verta',
    about: 'apie\u00a0',
    rows: [
      { amount: '5', unit: 'x', label: 'grąža nuo vienos vietos kainos' },
      { amount: '400', unit: '\u00a0EUR', label: 'sutaupoma per mėnesį vienai vietai' },
      { amount: '40', unit: '\u00a0dienų', label: 'kol atsiperka įdiegimas ir pirmas mėnuo' },
    ],
    lede: { before: 'Tai modelis, ', mark: 'o ne matavimas', after: '.' },
    moreLabel: 'Parodyti skaičiavimą',
    basis: [
      { term: 'apie 5x', def: 'Numanomas sutaupytas laikas, palyginti su vietos kaina.' },
      { term: 'apie 400 EUR', def: 'Numanomos sutaupytos valandos, esant vidutiniam atlyginimui.' },
      {
        term: 'apie 40 dienų',
        def: '500 USD įdiegimo mokestis ir pirmas vietų mėnuo, palyginti su aukščiau nurodytu sutaupymu.',
      },
    ],
    notes: [
      'Dar nė karto nepatikrinta su tikru klientu. Jūsų skaičius priklauso nuo to, kiek Jūsų laiškų yra pasikartojantis darbas.',
      'Pokalbio metu suskaičiuosime pagal Jūsų duomenis ir pasakysime, jei nesueina.',
    ],
  },

  who: {
    eyebrow: 'Registruota',
    title: 'Kam tai skirta',
    groups: [
      { tab: 'Apskaitos įmonėms', line: 'Klausimai dėl mokesčių ir trūkstamų dokumentų, prieš kiekvieną terminą.' },
      { tab: 'Draudimo brokeriams', line: 'Atsakymas paprastai jau yra polise.' },
      { tab: 'Administravimo įmonėms', line: 'Gyventojų laiškai, užstatai ir priežiūra. Ištisus metus.' },
    ],
    notes: {
      seats: {
        before: 'Šis pasiūlymas prasideda nuo ',
        mark: '10 vietų',
        mid: '. Mažesnėms komandoms planas svetainėje ',
        link: 'doviloop.dev',
        after: ' atlieka tą patį darbą ir kainuoja gerokai mažiau.',
      },
      setup: {
        before: 'Nereikia programuotojo, nereikia keisti pašto. Jei dirbate su Outlook, ',
        mark: 'įdiegimas yra mūsų darbas',
        after: '.',
      },
    },
  },

  price: {
    title: 'Kiek tai kainuoja',
    perSeat: '89 USD',
    perSeatNote: 'už vieną vietą per mėnesį',
    setup: '500 USD',
    setupNote: 'paruošimas, vieną kartą. Dirbtuvės ir įvedimas įskaičiuoti.',
    lines: [
      'Pirmos dvi savaitės nemokamos, visiškai. Įskaitant dirbtuves ir paruošimą.',
      'Kortelė pridedama iš karto, o nuskaitoma 14 dieną, kai bandomasis laikotarpis baigiasi. Ne anksčiau.',
      'Jei sustojate per tas dvi savaites, nenuskaitoma visiškai nieko.',
      'Mažiausiai 10 vietų. Vietas galite pridėti arba atimti kas mėnesį.',
    ],
    cta: 'Patikrinkite, ar tinkame',
  },

  form: {
    title: 'Šeši klausimai. Mažiau nei minutė.',
    lead: 'Taip išsiaiškiname, ar pokalbis vertas Jūsų laiko. Jei ne, šis puslapis taip ir pasakys, užuot Jus užregistravęs.',
    companyLabel: 'Įmonės pavadinimas',
    companyPlaceholder: 'Pavadinimas, nurodomas Jūsų sąskaitose',
    emailLabel: 'Darbo el. paštas',
    emailPlaceholder: 'jus@jusuimone.lt',
    emailHint: 'Naudojame tik pokalbio detalėms ir bandomojo laikotarpio sutarčiai išsiųsti.',
    emailFreeWarning:
      'Atrodo, kad tai asmeninis adresas. Jis tiks, bet darbo adresas padeda mums rasti Jūsų įmonę prieš pokalbį.',
    phoneLabel: 'Telefonas',
    phonePlaceholder: 'Su šalies kodu',
    teamSizeLabel: 'Kiek žmonių kasdien tvarko laiškus?',
    teamSizeOptions: [
      { value: '1-9', label: 'nuo 1 iki 9 žmonių' },
      { value: '10-24', label: 'nuo 10 iki 24 žmonių' },
      { value: '25-49', label: 'nuo 25 iki 49 žmonių' },
      { value: '50+', label: '50 ar daugiau' },
    ],
    emailClientLabel: 'Kuo naudojasi komanda?',
    emailClientOptions: [
      { value: 'outlook', label: 'Outlook' },
      { value: 'gmail', label: 'Gmail' },
      { value: 'other', label: 'Kažkuo kitu' },
    ],
    roleLabel: 'Jūsų pareigos',
    roleOptions: [
      { value: 'owner_partner', label: 'Savininkas arba partneris' },
      { value: 'ops_office_manager', label: 'Veiklos arba biuro vadovas' },
      { value: 'it_admin', label: 'IT arba administracija' },
      { value: 'other', label: 'Kita' },
    ],
    choosePrompt: 'Pasirinkite',
    submit: 'Patikrinkite, ar tinkame',
    submitting: 'Palaukite akimirką',
    required: 'Šį lauką reikia užpildyti.',
    invalidEmail: 'Šis adresas atrodo neužbaigtas.',
    invalidPhone: 'Nurodykite numerį, kuriuo galėtume su Jumis susisiekti.',
    privacyNote:
      'Šiuos atsakymus naudojame tik pasiruošti pokalbiui. Jokių sąrašų, jokio perpardavimo.',
  },

  results: {
    qualified: {
      title: 'Tinkame. Užsisakykime pokalbį.',
      body: 'Dvidešimt minučių, ir laiką pasirenkate Jūs. Jokių skaidrių ir jokio pasiūlymo pasirašyti po to.',
      coversTitle: 'Ką aptarsime',
      covers: [
        'Į ką Jūsų komanda iš tikrųjų atsakinėja visą dieną, jų pačių žodžiais.',
        'Ar Jūsų turima medžiaga yra tokios formos, su kuria galime dirbti.',
        'Kaip dviejų savaičių bandomasis laikotarpis atrodytų Jūsų kalendoriuje.',
        'Kainą dar kartą, aiškiai, ir skaičiavimą su Jūsų pačių skaičiais.',
      ],
      bookingCta: 'Pasirinkite laiką',
      bookingFallback: 'Parašykite mums, kad užsiregistruotumėte',
    },
    gmailNote:
      'Nurodėte, kad komanda nedirba su Outlook. Tai nėra kliūtis. Gmail ir kiti klientai paruošiami kiekvienai komandai atskirai įvedimo metu, o ką tai reiškia, aptarsime pokalbio metu.',
    tooSmall: {
      title: 'Šis pasiūlymas prasideda nuo 10 vietų.',
      body: 'Šiandien Jūsų yra mažiau, tad pokalbis atimtų dvidešimt Jūsų minučių ir baigtųsi tuo pačiu atsakymu. Planas doviloop.dev svetainėje daro tą patį mažesnėms komandoms ir kainuoja gerokai mažiau. Grįžkite, kai komanda paaugs, ir tęsime nuo čia.',
      pricingCta: 'Pažiūrėti planą mažesnėms komandoms',
      nurtureTitle: 'Gal norite trumpos versijos el. paštu?',
      nurtureBody:
        'Trys laiškai per dvi savaites apie tai, kaip maži biurai mažina pasikartojantį paštą. Jokių skambučių, ir galite sustoti po pirmojo.',
      nurtureCta: 'Atsiųskite man tuos tris laiškus',
      nurtureSubject: 'Atsiųskite man tuos tris laiškus',
      nurtureMailBody:
        'Prašau atsiųsti tuos tris trumpus laiškus apie pasikartojančio pašto mažinimą. Kol kas esame mažiau nei 10 vietų.',
    },
    deliveryWarning:
      'Mūsų sistema nepatvirtino Jūsų atsakymų, todėl išsaugojome juos šiame įrenginyje ir išsiųsime dar kartą automatiškai. Niekas neprarasta. Pokalbį žemiau vis tiek galite užsisakyti.',
    startOver: 'Pakeisti atsakymą',
  },

  footer: {
    tagline: 'Laiškų atsakymai komandoms, gyvenančioms pašto dėžutėje.',
    productLink: 'Produkto svetainė',
    privacyLink: 'Privatumas',
    contactLink: 'Susisiekite',
    company: {
      legalName: 'DoviLoop OU',
      registrationNumber: '17355061',
      address: 'Sepapaja 6, 15551 Tallinn, Estonia',
    },
  },
};
