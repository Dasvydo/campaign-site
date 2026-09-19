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
    cta: 'Pažiūrėkite, ar tinkame',
  },

  hero: {
    clockIn: '08:40',
    clockOut: '08:41',

    skip: 'Pereiti prie turinio',
    dateline: 'Laiškų juodraščiai komandoms nuo dešimties žmonių.',
    nav: { example: 'Pavyzdys', price: 'Kiek kainuoja', fit: 'Ar tinkame' },

    title: {
      before: '40 laiškų. ',
      mark: 'Pasikartojantys su juodraščiais',
      mid: '. ',
      after: ' val.',
    },
    deck: 'Parašyta iš Jūsų pačių bylų, Jūsų pačių žodžiais. Jūsų žmonės juos perskaito ir išsiunčia.',

    ctaNote: 'Taip arba ne. Pirmos dvi savaitės nemokamos. Kortelės neprašome ir nieko nenuskaitome.',

    /* The unit agrees with the count heroHoursBack returns, which is 41: in
       Lithuanian 21, 31 and 41 take the singular, so this reads "41 valandą"
       and not "41 valandų". If the offer or the assumed minutes move, the
       count moves with them and this ending has to be read again. */
    payback: {
      before: 'Dvidešimties žmonių įmonė per mėnesį susigrąžina maždaug ',
      after: ' valandą.',
    },

    pileAlt: 'Keturiasdešimties laiškų krūva, laukianti ant stalo.',
    deal: {
      draftLabel: 'Atsakymo juodraštis, paruoštas',
      to: 'Gyventojai iš 214 buto',
      subjectLabel: 'Tema',
      subject: 'Atsiskaitymas už užstatą, vis dar nieko',
      preview: 'Ačiū, kad priminėte, ir atsiprašome, kad teko.',
      sr: 'Visą juodraštį perskaitykite išnagrinėtame pavyzdyje.',
    },

    bar: {
      text: 'Penki klausimai, kortelės neprašome.',
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
    eyebrow: 'Išnagrinėtas pavyzdys',
    title: 'Vienas iš keturiasdešimties',
    lede: 'Juodraštis parašytas iš to, ką biuras jau turi byloje.',
    slug: 'Iš anksto parengta demonstracija. Fiksuotas tekstas, išgalvotas siuntėjas ir sumos, niekas nematuota laiku.',
    noJs: 'Reikia JavaScript. Laiškas, juodraštis ir stabdys sako tą patį bet kuriuo atveju.',
    fromLabel: 'Nuo',
    subjectLabel: 'Tema',
    pickLead: 'Pasirinkite stalą, artimiausią Jūsiškiam.',
    beatIn: 'Kas atėjo, 08:40',
    beatKnows: 'Ką biuras jau žino',
    beatWrote: 'Ką jis parašė atgal',
    beatNote: 'Išjunkite vieną ir žiūrėkite, kaip juodraštis jos netenka.',
    gateNote: 'Šiame produkte niekur nėra automatinio išsiuntimo. Žmogus perskaito, pakeičia, ką nori, ir išsiunčia pats.',
    sendLabel: 'Siųsti',
    editLabel: 'Taisyti',
    doneLabel: 'Baigta',
    sentStamp: 'Išsiųsta',
    draftStamp: 'Juodraštis',
    sentChip: 'Išsiuntėte Jūs, 08:41',
    dealLabel: 'Kitas laiškas',
    payoff: 'Iš šio biuro niekas neišėjo, kol nepaspaudėte siųsti. Kito kelio laukan nėra.',
    editNote: 'Jūs jį pakeitėte prieš išsiunčiant. Būtent taip atrodo pirma savaitė.',
    reLabel: 'Dėl',
    close: {
      before: 'Jūs perskaitote. Jūs išsiunčiate. Niekas nepraleido ',
      after: ' minučių jį rašydamas.',
    },
    closeBasis: {
      before: 'Mūsų prielaida, kiek trunka parašyti vieną nuo nulio, yra ',
      after: ' minutės. Laiko nematavome.',
    },
    share: {
      before: 'Juodraščius rašo tiems laiškams, į kuriuos gali atsakyti iš bylų, o kitų neliečia. Tikroje pašto dėžutėje tai buvo maždaug vienas laiškas iš ',
      after: '.',
    },
    say: {
      allOff: 'Nieko neliko įjungta. Juodraštis yra keturios bendro pobūdžio eilutės.',
      restore: 'Visi penki vėl įjungti. Juodraštis vėl pilnas.',
      deal: 'Ant stalo naujas laiškas. Juodraštis grįžo į pradžią.',
      sent: 'Išsiųsta. Juodraštis išėjo tik todėl, kad paspaudėte siųsti.',
      edit: 'Juodraštį galima taisyti. Baigę spauskite Baigta arba Escape.',
      done: 'Taisymas baigtas. Jūsų pakeitimai išsaugoti.',
      source: 'Šaltinis: ',
      desk: ' stalas. Kitas laiškas, tie patys penki šaltiniai.',
    },
    restoreLabel: 'Grąžinti viską',
    allOffNote: 'Taip rašo bet kuris kitas įrankis, neturėdamas Jūsų bylų.',
    desks: [
      {
        id: 'property',
        tab: 'Nekilnojamasis turtas',
        deskName: 'Nekilnojamojo turto',
        letter: {
          from: 'Rasa Jankauskienė, butas 214',
          subject: 'Atsiskaitymas už užstatą, vis dar nieko',
          body: 'Išsikrausčiau praėjusio mėnesio 30 dieną ir vis dar negavau atsiskaitymo. Raktus grąžinau laiku, butas buvo švarus. Kada atgausiu užstatą ir kiek jo liko?',
        },
        sources: [
          {
            key: 'rules',
            label: 'užstato taisyklės',
            count: '1 eilutė',
            name: 'užstato taisyklės',
            off: 'Užstato taisyklės išjungtos. Juodraštis nebemini trijų savaičių taisyklės.',
            on: 'Užstato taisyklės įjungtos. Trijų savaičių taisyklė vėl juodraštyje.',
          },
          {
            key: 'deadline',
            label: 'trijų savaičių terminas',
            count: '1 data',
            name: 'trijų savaičių terminas',
            off: 'Terminas išjungtas. Data dingsta iš juodraščio.',
            on: 'Terminas įjungtas. 21 diena vėl juodraštyje.',
          },
          {
            key: 'file',
            label: 'to buto byla',
            count: '2 eilutės',
            name: 'to buto byla',
            off: 'Byla išjungta. Nuomininkės vardas ir sąskaita dingsta iš juodraščio.',
            on: 'Byla įjungta. Nuomininkės vardas ir sąskaita vėl juodraštyje.',
          },
          {
            key: 'deductions',
            label: 'jau užfiksuoti atskaitymai',
            count: '2 sumos',
            name: 'jau užfiksuoti atskaitymai',
            off: 'Atskaitymų sąrašas išjungtas. Dvi sumos pašalintos iš juodraščio.',
            on: 'Atskaitymų sąrašas įjungtas. Dvi sumos vėl juodraštyje.',
          },
          {
            key: 'tone',
            label: 'biuro rašymo maniera',
            count: 'tonas',
            name: 'biuro rašymo maniera',
            off: 'Biuro tonas išjungtas. Tie patys faktai, sausesnė kalba.',
            on: 'Biuro tonas įjungtas. Juodraštis vėl skamba biuro balsu.',
          },
        ],
        salutation:
          {
            key: 'file',
            on: { text: 'Gerbiama p. Jankauskiene,' },
            off: { text: 'Gerbiamas nuomininke,' },
          },
        clauses: [
          {
            key: 'tone',
            on: { text: 'Ačiū, kad priminėte, ir atsiprašome, kad teko.' },
            off: { text: 'Pranešame, kad Jūsų užklausa gauta.' },
          },
          {
            key: 'rules',
            on: { text: 'Atsiskaitymą privalome pateikti per tris savaites nuo buto perdavimo' },
            tone: { text: 'Atsiskaitymas turi būti pateiktas per tris savaites nuo buto perdavimo' },
            off: { text: 'Atsiskaitymą pateiksime įprastais terminais' },
            sep: ', ',
          },
          {
            key: 'deadline',
            on: { text: 'taigi jis pasieks Jus iki ', circle: '21 dienos', tail: '.' },
            tone: { text: 'taigi jis bus pateiktas iki 21 dienos.' },
            off: { text: 'tačiau tikslios datos negaliu nurodyti, kol nepatikrinsiu.' },
          },
          {
            key: 'deductions',
            on: { text: 'Iki šiol užfiksuoti du atskaitymai: valymas po išsikraustymo 850 EUR ir koridoriaus sienos pertepimas 400 EUR. Vadinasi, Jums grąžintina 4 750 EUR užstato dalis, ji bus pervesta į' },
            tone: { text: 'Iki šiol užregistruoti du atskaitymai: valymas po išsikraustymo 850 EUR ir koridoriaus sienos pertepimas 400 EUR. Grąžintina užstato dalis sudaro 4 750 EUR ir bus pervesta į' },
            off: { text: 'Gali būti tam tikrų atskaitymų. Sumas patvirtinsiu, kai patikrinsiu.' },
          },
          {
            key: 'file',
            dep: 'deductions',
            on: { text: 'mūsų turimą sąskaitą.' },
            tone: { text: 'registruose nurodytą sąskaitą.' },
            off: { text: 'Jūsų sąskaitą.' },
          },
        ],
      },
      {
        id: 'accounting',
        tab: 'Apskaita',
        deskName: 'Apskaitos',
        letter: {
          from: 'Mantas Adomaitis, UAB Staliaus dirbtuvės',
          subject: 'PVM deklaracija, ar vėluojame?',
          body: 'Mūsų buhalterė išėjo rugpjūtį, ir aš visiškai nežinau, kaip yra. Ar ketvirčio deklaracija pateikta ir ar esame skolingi? Verčiau išgirsiu tiesiai, negu gausiu raštą.',
        },
        sources: [
          {
            key: 'rules',
            label: 'pateikimo taisyklės',
            count: '1 eilutė',
            name: 'pateikimo taisyklės',
            off: 'Pateikimo taisyklės išjungtos. Juodraštis nebemini termino taisyklės.',
            on: 'Pateikimo taisyklės įjungtos. Vieno mėnesio ir septynių dienų taisyklė vėl juodraštyje.',
          },
          {
            key: 'deadline',
            label: 'ketvirčio terminas',
            count: '1 data',
            name: 'ketvirčio terminas',
            off: 'Terminas išjungtas. Data dingsta iš juodraščio.',
            on: 'Terminas įjungtas. 7 diena vėl juodraštyje.',
          },
          {
            key: 'file',
            label: 'to kliento byla',
            count: '2 eilutės',
            name: 'to kliento byla',
            off: 'Byla išjungta. Kliento vardas ir tiesioginis debetas dingsta iš juodraščio.',
            on: 'Byla įjungta. Kliento vardas ir tiesioginis debetas vėl juodraštyje.',
          },
          {
            key: 'deductions',
            label: 'jau apskaityti skaičiai',
            count: '3 sumos',
            name: 'jau apskaityti skaičiai',
            off: 'Apskaityti skaičiai išjungti. Trys sumos pašalintos iš juodraščio.',
            on: 'Apskaityti skaičiai įjungti. Trys sumos vėl juodraštyje.',
          },
          {
            key: 'tone',
            label: 'biuro rašymo maniera',
            count: 'tonas',
            name: 'biuro rašymo maniera',
            off: 'Biuro tonas išjungtas. Tie patys faktai, sausesnė kalba.',
            on: 'Biuro tonas įjungtas. Juodraštis vėl skamba biuro balsu.',
          },
        ],
        salutation:
          {
            key: 'file',
            on: { text: 'Gerbiamas Mantai,' },
            off: { text: 'Gerbiamas kliente,' },
          },
        clauses: [
          {
            key: 'tone',
            on: { text: 'Ačiū, kad klausiate tiesiai, taip paprasčiau abiem.' },
            off: { text: 'Pranešame, kad Jūsų užklausa gauta.' },
          },
          {
            key: 'rules',
            on: { text: 'Ketvirčio iki liepos 31 d. deklaracija turi būti pateikta per vieną mėnesį ir septynias dienas po ketvirčio pabaigos' },
            tone: { text: 'Ketvirčio iki liepos 31 d. deklaracija teikiama per vieną mėnesį ir septynias dienas po ketvirčio pabaigos' },
            off: { text: 'Deklaracija bus pateikta įprastais terminais' },
            sep: ', ',
          },
          {
            key: 'deadline',
            on: { text: 'taigi Jūsų pateikimo data yra ', circle: '7 diena', tail: '.' },
            tone: { text: 'taigi pateikimo data yra 7 diena.' },
            off: { text: 'tačiau tikslios datos negaliu nurodyti, kol nepatikrinsiu.' },
          },
          {
            key: 'deductions',
            on: { text: 'Viskas apskaityta iki liepos pabaigos: 41 280 EUR pardavimo PVM prieš 12 940 EUR atskaitos, taigi mokėtina 28 340 EUR iš' },
            tone: { text: 'Visi įrašai apskaityti iki liepos 31 d.: pardavimo PVM 41 280 EUR prieš 12 940 EUR atskaitos, mokėtina suma 28 340 EUR iš' },
            off: { text: 'Gali būti, kad reikės sumokėti. Sumą patvirtinsiu, kai patikrinsiu.' },
          },
          {
            key: 'file',
            dep: 'deductions',
            on: { text: 'mūsų turimos sąskaitos, tiesioginiu debetu.' },
            tone: { text: 'registruose nurodytos sąskaitos, tiesioginiu debetu.' },
            off: { text: 'Jūsų sąskaitos.' },
          },
        ],
      },
      {
        id: 'insurance',
        tab: 'Draudimas',
        deskName: 'Draudimo',
        letter: {
          from: 'Greta Paulauskienė, polisas 4471-C',
          subject: 'Vandens žala, vis dar jokio atsakymo',
          body: 'Virtuvės grindys išsipūtė 2 dieną, o Jūsų ekspertas atvyko po savaitės. Niekas man nepasakė, kas yra draudžiama. Ar išskaitą mokėsiu aš, ar Jūs, ir kada apskritai kas nors bus išmokėta?',
        },
        sources: [
          {
            key: 'rules',
            label: 'poliso formuluotė',
            count: '1 skyrius',
            name: 'poliso formuluotė',
            off: 'Poliso formuluotė išjungta. Juodraštis nebemini skyriaus ir išskaitos.',
            on: 'Poliso formuluotė įjungta. 4 skyrius ir išskaita vėl juodraštyje.',
          },
          {
            key: 'deadline',
            label: 'keturiolikos dienų standartas',
            count: '1 data',
            name: 'keturiolikos dienų standartas',
            off: 'Terminas išjungtas. Data dingsta iš juodraščio.',
            on: 'Terminas įjungtas. 18 diena vėl juodraštyje.',
          },
          {
            key: 'file',
            label: 'tos žalos byla',
            count: '2 eilutės',
            name: 'tos žalos byla',
            off: 'Byla išjungta. Draudėjos vardas ir sąskaita dingsta iš juodraščio.',
            on: 'Byla įjungta. Draudėjos vardas ir sąskaita vėl juodraštyje.',
          },
          {
            key: 'deductions',
            label: 'jau suderintos sumos',
            count: '3 sumos',
            name: 'jau suderintos sumos',
            off: 'Suderintos sumos išjungtos. Trys sumos pašalintos iš juodraščio.',
            on: 'Suderintos sumos įjungtos. Trys sumos vėl juodraštyje.',
          },
          {
            key: 'tone',
            label: 'biuro rašymo maniera',
            count: 'tonas',
            name: 'biuro rašymo maniera',
            off: 'Biuro tonas išjungtas. Tie patys faktai, sausesnė kalba.',
            on: 'Biuro tonas įjungtas. Juodraštis vėl skamba biuro balsu.',
          },
        ],
        salutation:
          {
            key: 'file',
            on: { text: 'Gerbiama p. Paulauskiene,' },
            off: { text: 'Gerbiamas draudėjau,' },
          },
        clauses: [
          {
            key: 'tone',
            on: { text: 'Ačiū, kad priminėte, ir atsiprašome, kad teko.' },
            off: { text: 'Pranešame, kad Jūsų užklausa gauta.' },
          },
          {
            key: 'rules',
            on: { text: 'Vandens nutekėjimas draudžiamas pagal Jūsų poliso 4 skyrių, išskaita 350 EUR' },
            tone: { text: 'Vandens nutekėjimas patenka į poliso 4 skyrių, išskaita 350 EUR' },
            off: { text: 'Vandens žala draudžiama įprasta tvarka' },
            sep: ', ',
          },
          {
            key: 'deadline',
            on: { text: 'o dėl draudimo apimties atsakome per keturiolika dienų nuo eksperto išvados, tai yra iki ', circle: '18 dienos', tail: '.' },
            tone: { text: 'o draudimo apimtis patvirtinama per keturiolika dienų nuo eksperto išvados, tai yra iki 18 dienos.' },
            off: { text: 'tačiau tikslios datos negaliu nurodyti, kol nepatikrinsiu.' },
          },
          {
            key: 'deductions',
            on: { text: 'Ekspertas patvirtino 6 200 EUR už grindis ir 1 150 EUR už džiovinimą, taigi atskaičius išskaitą 7 000 EUR keliauja į' },
            tone: { text: 'Ekspertas patvirtino 6 200 EUR už grindis ir 1 150 EUR už džiovinimą; atskaičius išskaitą mokėtina 7 000 EUR į' },
            off: { text: 'Gali būti, kad bus išmokėta. Sumas patvirtinsiu, kai patikrinsiu.' },
          },
          {
            key: 'file',
            dep: 'deductions',
            on: { text: 'mūsų turimą sąskaitą.' },
            tone: { text: 'registruose nurodytą sąskaitą.' },
            off: { text: 'Jūsų sąskaitą.' },
          },
        ],
      },
    ],
  },

  numbers: {
    eyebrow: 'Jūsų pačių skaičiavimas',
    title: 'Kiek Jums lieka',
    about: 'maždaug\u00a0',
    inputs: {
      people: { label: 'Žmonės, atsakantys į laiškus' },
      inbound: { label: 'Laiškų, kuriuos kiekvienas gauna per mėnesį' },
      hourly: { label: 'Kiek kainuoja jų darbo valanda' },
      minutes: { label: 'Minučių, sutaupomų vienam juodraščiui', note: 'Jūsų įvertis. Mes to dar nematavome.' },
    },
    beats: {
      draftsNote: { before: 'Išmatuota: ', after: ' % gaunamų laiškų yra tas pats klausimas iš naujo.' },
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
        term: 'Dalis',
        def: 'Išmatuota tikroje pašto dėžutėje: gaunamų laiškų dalis, kuriai parengiamas juodraštis, nes tai tas pats klausimas iš naujo. Visa kita skydelyje padauginta iš jos.',
      },
      {
        term: 'Minutės',
        def: 'Prielaida, dar niekada neišmatuota. Parašyti atsakymą nuo nulio užtrunka apie penkias minutes; perskaityti parengtą juodraštį ir išsiųsti užtrunka apie vieną. Galite įrašyti savo skaičių.',
      },
      {
        term: 'Valanda',
        def: 'Jūsų, ne mūsų. Kiek įmonei kainuoja į laiškus atsakančio žmogaus darbo valanda, su darbdavio mokesčiais. Valdiklį atidarėme su apytiksliu skaičiumi rinkai, kurioje skaitomas šis puslapis.',
      },
    ],
    note: 'Pokalbio metu suskaičiuosime pagal Jūsų duomenis ir pasakysime, jei nesueina.',
  },

  who: {
    eyebrow: 'Registruota',
    title: 'Kam tai skirta',
    groups: [
      { tab: 'Nekilnojamojo turto administratoriams', line: 'Gyventojų laiškai, užstatai ir priežiūra. Ištisus metus.' },
      { tab: 'Apskaitos įmonėms', line: 'Klausimai dėl mokesčių ir trūkstamų dokumentų, prieš kiekvieną terminą.' },
      { tab: 'Draudimo brokeriams', line: 'Atsakymas paprastai jau yra polise.' },
    ],

    accuracy: {
      title: 'Kas nutinka, kai ji nežino',
      items: [
        'Juodraščius rašo tik tiems laiškams, į kuriuos gali atsakyti iš Jūsų bylų. Kitų neliečia.',
        'Kai atsakymo byloje nėra, ji Jūsų paklausia. Spragos neužpildo tuo, kas tiesiog gražiai skamba.',
        'Šiame produkte niekur nėra automatinio išsiuntimo. Kiekvieną juodraštį perskaito žmogus ir išsiunčia pats.',
        'Juodraštis cituoja mokestį, terminą ar taisyklę iš Jūsų pačių dokumentų, todėl viską, ką jis rašo, galima pasitikrinti byloje, iš kurios tai paimta.',
      ],
      unmeasured: 'Nematavome, kaip dažnai juodraštį vis dar reikia taisyti. Kai išmatuosime, skaičius atsiras šiame puslapyje.',
    },
    notes: {
      seats: {
        before: 'Vienas mokestis apima ',
        mark: 'visą įmonę',
        mid: ', o kaina pritaikyta įmonėms nuo dešimties žmonių. Mažesnėms komandoms planas svetainėje ',
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
    eyebrow: 'Vienas mokestis visai įmonei',
    title: 'Kiek kainuoja',

    cohortName: 'steigiamųjų',

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
      lede: 'Abiejuose tas pats produktas. Skiriasi tik tai, kiek žmonių apima ir kiek juodraščių dalijasi visa įmonė.',
      pick: 'Rinkitės suskaičiavę savo žmones.',
      rows: [
        { id: 'desk', name: 'Desk', note: 'Dešimties žmonių įmonei.' },
        { id: 'firm', name: 'Firm', note: 'Įmonei nuo vienuolikos iki dvidešimties žmonių. Tokia pati kaina prie vienuolikos kaip ir prie dvidešimties.' },
      ],
      feeLabel: 'Per mėnesį, visai įmonei',
      peopleLabel: 'Apimami žmonės, iki',
      draftsLabel: 'Juodraščiai per mėnesį, bendri',
      note: 'Nė vienas skaičius nėra vienam žmogui. Juodraščiai bendri, ir niekas neturi savo atskiros kvotos, kuri galėtų baigtis.',
      over: 'Daugiau žmonių? Tada šiame puslapyje Jums tinkamo paketo nėra, ir verčiau tai pasakome čia, o ne pokalbio metu. Vis tiek parašykite, ir kainą pasiūlysime atskirai.',
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
      lede: {
        noProofYet: 'Kol kas neturime klientų, į kuriuos galėtume parodyti.',
        trade: 'Šios vietos yra mainai: netaikomas įdiegimo mokestis už Jūsų vardą prie šio darbo.',
      },
      reason: { before: 'Kaina tokia žema, nes mums reikia ', after: ' įmonių, kurios pasakys, kad tai veikia.' },
      lock: 'Jūsų kaina nesikeičia, kol liekate.',
      spots: { label: 'Laisvų vietų dar yra:', of: ' iš ' },
      spotsClosed: 'Vietos, kurios ėjo kartu su mainais, jau užimtos. Mėnesinis mokestis žemiau toks pat, kokį mokėjo jie; įdiegimo mokestis dabar taikomas visas.',
      givesTitle: 'Ką duodate Jūs',
      gives: [
        'Atsiliepimą produkto svetainei, savais žodžiais.',
        'Atvejo aprašymą po šešiasdešimties dienų, su skaičiais, kuriuos sutinkate rodyti.',
        'Savo logotipą produkto svetainėje.',
        'Du atsiliepimų pokalbius per pirmus du mėnesius.',
      ],
      getsTitle: 'Ką gaunate Jūs',
      gets: {
        fee: { before: 'Vieta tarp ', after: ' penkių, o tiek įmonių vienas žmogus gali iš tikrųjų aprėpti vienu metu.' },
        setup: 'Visas įdiegimo mokestis netaikomas.',
      },
      note: 'Jei nenorite būti įvardyti, sumokate įdiegimo mokestį, ir niekas kitas produkte nesikeičia.',
    },

    guarantee: {
      before: 'Jei per pirmas trisdešimt dienų tinkamų juodraščių gavote mažiau nei ',
      after: ', tas mėnuo nemokamas.',
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
        note: 'Vienas įdiegimo pokalbis su tuo, kas žino, ko Jūsų klausiama. Tada pradeda rastis juodraščiai.',
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

    ctaNote: 'Pasakykite ne per apžvalgos pokalbį, ir jokia sąskaita neišrašoma.',
  },

  form: {
    eyebrow: 'Ką man daryti dabar',
    title: 'Penki klausimai. Mažiau nei minutė.',
    lead: 'Taip išsiaiškiname, ar pokalbis vertas Jūsų laiko. Jei ne, šis puslapis taip ir pasakys, užuot Jus užregistravęs.',
    formNo: 'Tinkamumo patikra',
    optional: 'Neprivaloma',
    companyLabel: 'Įmonės pavadinimas',
    companyPlaceholder: 'Pavadinimas, nurodomas Jūsų sąskaitose',
    emailLabel: 'Darbo el. paštas',
    emailPlaceholder: 'jus@jusuimone.lt',
    emailHint: 'Naudojame tik pokalbio detalėms ir bandomojo laikotarpio sutarčiai išsiųsti.',
    emailFreeWarning:
      'Atrodo, kad tai asmeninis adresas. Jis tiks, bet darbo adresas padeda mums rasti Jūsų įmonę prieš pokalbį.',
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
    steps: ['Apie komandą', 'Kaip su Jumis susisiekti'],
    stepsLabel: 'Patikrinimas dviem žingsniais',
    continueCta: 'Toliau',
    backCta: 'Atgal',
    submit: 'Patikrinkite, ar tinkame',
    submitting: 'Palaukite akimirką',
    required: 'Šį lauką reikia užpildyti.',
    invalidEmail: 'Šis adresas atrodo neužbaigtas.',
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
      sameEmail:
        'Vienas dalykas: registruodamiesi nurodykite tą patį el. pašto adresą, kurį mums čia pateikėte. Tada pokalbį susiesime su tuo, ką parašėte.',
    },
    gmailNote:
      'Nurodėte, kad komanda nedirba su Outlook. Tai nėra kliūtis. Gmail ir kiti klientai paruošiami kiekvienai komandai atskirai įvedimo metu, o ką tai reiškia, aptarsime pokalbio metu.',
    tooSmall: {
      title: 'Šis pasiūlymas prasideda nuo dešimties žmonių.',
      body: 'Šiandien Jūsų yra mažiau, tad pokalbis atimtų dvidešimt Jūsų minučių ir baigtųsi tuo pačiu atsakymu. Planas doviloop.dev svetainėje daro tą patį mažesnėms komandoms ir kainuoja gerokai mažiau. Grįžkite, kai komanda paaugs, ir tęsime nuo čia.',
      pricingCta: 'Pažiūrėti planą mažesnėms komandoms',
      nurtureTitle: 'Gal norite trumpos versijos el. paštu?',
      nurtureBody:
        'Trys laiškai per dvi savaites apie tai, kaip maži biurai mažina pasikartojantį paštą. Jokių skambučių, ir galite sustoti po pirmojo.',
      nurtureCta: 'Atsiųskite man tuos tris laiškus',
      nurtureSubject: 'Atsiųskite man tuos tris laiškus',
      nurtureMailBody:
        'Prašau atsiųsti tuos tris trumpus laiškus apie pasikartojančio pašto mažinimą. Kol kas esame mažesnė įmonė.',
    },
    deliveryWarning:
      'Mūsų sistema nepatvirtino Jūsų atsakymų, todėl išsaugojome juos šiame įrenginyje ir išsiųsime dar kartą automatiškai. Niekas neprarasta. Pokalbį žemiau vis tiek galite užsisakyti.',
    startOver: 'Pakeisti atsakymą',
  },

  consent: {
    title: 'Slapukai šiame puslapyje',
    body: 'Apsilankymų skaičiavimas ir reklama. Nė vienas neveikia, kol nesutinkate.',
    accept: 'Sutinku',
    decline: 'Nesutinku',
    detailsLabel: 'Ką daro kiekvienas',
    items: [
      {
        name: 'Apsilankymų skaičiavimas',
        body: '„PostHog“, talpinama ES. Kurios dalys skaitomos ir kiek toli žemyn nuslenkama. Jokių sesijų įrašų, jokių šilumos žemėlapių.',
      },
      {
        name: 'Reklama',
        body: '„Meta“ pikselis. Leidžia rodyti reklamą „Facebook“ ir „Instagram“ tiems, kurie lankėsi šiame puslapyje.',
      },
    ],
    note: 'Nesutikimas nieko nekeičia nei puslapyje, nei skaičiuotame pavyzdyje, nei formoje. Apsigalvoti galite puslapio apačioje.',
    privacyLabel: 'Privatumo politika',
    statusGranted: 'Sutikta',
    statusDenied: 'Nesutikta',
    statusUnset: 'Nepasirinkta',
    reopenLabel: 'Keisti slapukų pasirinkimą',
  },

  footer: {
    tagline: 'Laiškų atsakymai komandoms, gyvenančioms pašto dėžutėje.',
    consentLink: 'Slapukai',
    officeLabel: 'Registruota buveinė',
    elsewhereLabel: 'Kitur',
    productLink: 'Produkto svetainė',
    privacyLink: 'Privatumas',
    contactLink: 'Susisiekite',
    setIn: 'Rinkta Playfair Display ir DM Sans šriftais',
    company: {
      legalName: 'DoviLoop OU',
      registrationNumber: '17355061',
      address: 'Sepapaja 6, 15551 Tallinn, Estonia',
    },
  },
};
