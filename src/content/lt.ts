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
    opening: 'Yra 08:40, ir laukia keturiasdešimt laiškų.',
    subOpening:
      'Kiekvienam iš jų reikia rimto atsakymo. Dauguma jų panašūs į ankstesnius keturiasdešimt. Netrukus kažkas biure praleis visą rytą juos vėl perrašinėdamas.',
    claim:
      'DoviLoop parašo pirmą kiekvieno atsakymo juodraštį. Jūsų žmogus jį perskaito, pataiso, ką nori, ir išsiunčia. Iš biuro neišeina niekas, ko nepatvirtino žmogus.',
    cta: 'Užsisakykite pokalbį',
    ctaNote: 'Komandoms nuo 10 žmonių. Dvidešimt minučių, ir pokalbio metu pasakysime, jei netinkame.',
    exampleCaption: 'Pavyzdys: laiškas ir juodraštis, kurį jis sukūrė.',
    message: {
      from: 'Rasa Jankauskienė, butas 214',
      subject: 'Atsiskaitymas už užstatą, vis dar nieko',
      body: 'Išsikrausčiau praėjusio mėnesio 30 dieną ir vis dar negavau atsiskaitymo. Raktus grąžinau laiku, butas buvo švarus. Kada atgausiu užstatą ir kiek jo liko?',
    },
    draftReady: 'Juodraštis paruoštas',
    draft: {
      greeting: 'Gerbiama p. Jankauskiene,',
      body: 'Ačiū, kad priminėte, ir atsiprašome, kad teko. Atsiskaitymą privalome pateikti per tris savaites nuo buto perdavimo, taigi jis pasieks Jus iki 21 dienos. Matau, kad butas perduotas 30 dieną, o raktai grąžinti tą pačią dieną. Iki šiol užfiksuoti du atskaitymai: valymas po išsikraustymo 850 ir koridoriaus sienos pertepimas 400. Vadinasi, Jums grąžintina 4 750 užstato dalis, ji bus pervesta į mūsų turimą sąskaitą.',
      signoff: 'Visą atsiskaitymą atsiųsiu, kai tik gausime paskutinius skaitiklių rodmenis.',
    },
    afterLine: 'Jūs perskaitote. Jūs išsiunčiate. Tai užtruko vienuolika sekundžių, o ne devynias minutes.',
  },

  how: {
    title: 'Kaip tai veikia iš tikrųjų',
    lead: 'Nuo laiško gavimo iki paruošto juodraščio įvyksta trys dalykai. Nė vienam iš jų nereikia techninių žinių.',
    steps: [
      {
        n: '01',
        title: 'Jis perskaito laišką',
        body: 'Kas rašo, ko klausia ir ką jam atsakėte praėjusį kartą. Toks pat peržvelgimas, kokį atlieka geras kolega prieš pradėdamas rašyti.',
      },
      {
        n: '02',
        title: 'Jis paima tai, ką Jūsų įmonė iš tikrųjų žino',
        body: 'Jūsų užstato taisyklės. Jūsų kainoraštis. Formuluotė, kurią partneris patvirtino kovą. Jis atsako remdamasis Jūsų pačių medžiaga ir Jūsų ankstesniais atsakymais, o ne tuo, ką rado internete.',
      },
      {
        n: '03',
        title: 'Jis parašo atsakymą Jūsų tonu',
        body: 'Tokiu tonu, kokį Jūsų įmonė jau naudoja, su suvestomis detalėmis. Tada sustoja ir laukia žmogaus. Jūsų darbuotojas perskaito juodraštį, pataiso, ką nori, ir paspaudžia siųsti.',
      },
    ],
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
    title: 'Kiek tai verta',
    lead: 'Trys skaičiai, už kuriuos galime atsakyti, ir iš kur kiekvienas jų.',
    rows: [
      {
        figure: 'apie 9 kartus',
        label: 'grąža nuo vienos vietos kainos',
        basis: 'Sutaupytas laikas, palygintas su tuo, kiek viena vieta Jums kainuoja per mėnesį.',
      },
      {
        figure: 'apie 400 EUR',
        label: 'sutaupoma per mėnesį vienai vietai',
        basis: 'Laikas, nebeskiriamas tiems patiems atsakymams perrašyti, įvertintas vidutinio lygio atlyginimu.',
      },
      {
        figure: 'apie 40 dienų',
        label: 'kol atsiperka paruošimo mokestis',
        basis: 'Įskaičiuotas 500 dolerių paruošimo mokestis ir pirmas vietų mėnuo.',
      },
    ],
    caveat:
      'Tai yra įverčiai iš išmatuoto naudojimo, o ne garantija. Rezultatas priklauso nuo to, kokia Jūsų pašto dalis kartojasi. Skaičiavimą atliksime su Jūsų pačių skaičiais pokalbio metu, o jei jis neapsimoka, taip ir pasakysime.',
  },

  who: {
    title: 'Kam tai skirta',
    lead: 'Trijų rūšių biurai su ta pačia problema: labai daug laiškų, ir kiekvienas atsakymas turi būti tikslus.',
    groups: [
      {
        title: 'Apskaitos įmonės',
        body: 'Tie patys klientų klausimai kiekvieną iš keturių savaičių prieš deklaravimo terminą. Klausimai apie mokestį, trūkstamus dokumentus, kas bus, jei pavėluosime.',
      },
      {
        title: 'Draudimo brokeriai',
        body: 'Žalų susirašinėjimas, kai atsakymas paprastai jau yra polise, o vėlavimas kyla dėl to, kad reikia jį aiškiai išdėstyti.',
      },
      {
        title: 'Administravimo įmonės',
        body: 'Būsto bendrijos, bendrabučiai, nekilnojamojo turto ir ūkio administravimas. Gyventojų laiškai, užstatai, remonto prašymai, dideliais kiekiais, ištisus metus.',
      },
    ],
    seatMinimum:
      'Šis pasiūlymas prasideda nuo 10 vietų. Jei Jūsų mažiau, planas doviloop.dev svetainėje daro tą patį ir kainuoja gerokai mažiau.',
    noTech:
      'Jums nereikia programuotojo ir nereikia keisti pašto. Jei komanda dirba su Outlook, paruošimas yra mūsų darbas.',
  },

  objections: {
    title: 'Penki klausimai, kurių žmonės klausia prieš užsisakydami pokalbį',
    lead: 'Atsakymai, kuriuos vis tiek pasakytume pokalbio metu.',
    items: [
      {
        q: 'Skambės kaip robotas.',
        a: 'Skamba taip, kaip rašė tas, kuris parašė paskutinius kelis šimtus Jūsų atsakymų, nes būtent iš jų ir mokomasi. Ir kiekvieną juodraštį prieš išsiuntimą perskaito žmogus. Jei kuris nors skamba ne taip, jį pataisote, o kitas jau bus artimesnis. Po dviejų savaičių dauguma komandų įprastų atsakymų nebetaiso visai.',
      },
      {
        q: 'Mūsų duomenys yra konfidencialūs.',
        a: 'Jūsų medžiaga lieka Jūsų. Ji naudojama tik Jūsų laiškams atsakyti ir niekam kitam. Ji nenaudojama bendram modeliui mokyti, jos nemato joks kitas klientas, ir ji saugoma Europos Sąjungoje. Duomenų tvarkymo sutartį gaunate prieš bandomąjį laikotarpį, o ne po jo.',
      },
      {
        q: 'Mano komanda tuo nesinaudos.',
        a: 'Būtent dėl to tokie įrankiai paprastai ir žlunga, ir būtent tam skirtas paruošimo mokestis. Surengiame dirbtuves su Jūsų komanda, dirbdami su jų pačių tikrais laiškais, ir liekame tol, kol jie moka dirbti be mūsų. Padaryti taip, kad Jūsų žmonės tuo naudotųsi, yra mūsų darbas pirmą savaitę, ne Jūsų.',
      },
      {
        q: 'Mes jau turime Copilot.',
        a: 'Copilot rašo gerai, bet nepažįsta Jūsų įmonės. Paklauskite jo apie Jūsų užstato taisykles ar kainoraštį, ir gausite kažką mandagaus ir neteisingo. Šis įrankis atsako remdamasis Jūsų dokumentais ir Jūsų ankstesniais atsakymais. Ne viena komanda naudoja abu: Copilot bendram rašymui, o šį tam paštui, kuris turi būti tikslus.',
      },
      {
        q: 'Kas bus, kai jis suklys.',
        a: 'Niekas neišsiunčiama savaime. Klaidingas juodraštis yra juodraštis, kurį ištrinate, ir jis Jums kainavo tas dešimt sekundžių, kurias vis tiek būtumėte praleidę žiūrėdami į tuščią laišką. Nėra kelio, kuriuo blogas atsakymas pasiektų Jūsų klientą, jei jo neperskaitė ir nepaspaudė siųsti Jūsų žmogus.',
      },
    ],
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
      legalName: '',
      registrationNumber: '',
      address: '',
    },
  },
};
