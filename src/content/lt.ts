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
    nav: { example: 'Pavyzdys', price: 'Kiek kainuoja', fit: 'Ar tinkame' },

    title: {
      before: '40 laiškų. Tie, į kuriuos atsako Jūsų bylos, ',
      mark: 'juodraščiuose',
      mid: '. Iki ',
      after: ' val.',
    },
    /* Two counts, two endings, and Lithuanian inflects around both.

       The head count is the largest package's coverage, 20, which takes the
       genitive plural: "dirba 20 zmoniu". The hours are what heroHoursBack
       returns, 41, and 21, 31 and 41 take the SINGULAR, so it reads
       "41 valanda" in the accusative and not "41 valandu".

       Both counts are pinned in scripts/verify-offer.mjs. Moving either fails
       the build, which is the only reason these endings are safe: they are
       right for this pair and nothing else. */

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
      text: 'Trunka mažiau nei minutę, kortelės neprašome.',
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
      before: 'Jūs perskaitote. Jūs išsiunčiate. ',
      mark: 'Niekas nepraleido ',
      markEnd: ' minučių',
      after: ' jį rašydamas.',
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
            count: '3 sumos',
            name: 'jau užfiksuoti atskaitymai',
            off: 'Atskaitymų sąrašas išjungtas. Trys sumos pašalintos iš juodraščio.',
            on: 'Atskaitymų sąrašas įjungtas. Trys sumos vėl juodraštyje.',
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
      drafts: {
        label: 'Išsiųsta juodraščių per mėnesį',
        note: { before: 'Žinote tik savo pašto dėžutę? Maždaug ', after: ' % laiškų, kuriuos gauna įmonė, yra tas pats klausimas iš naujo.' },
      },
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
        def: 'Mūsų spėjimas, ne matavimas. Parašyti atsakymą nuo nulio užtrunka apie penkias minutes; perskaityti jau parengtą ir paspausti siųsti - apie vieną. Taigi skirtumas yra keturios. Jei mūsų skaičius netinka, įrašykite savo.',
      },
      {
        term: 'Kiek kainuoja valanda',
        def: 'Jūsų, ne mūsų. Kiek įmonei kainuoja vieno Jūsų žmogaus darbo valanda: atlyginimas ir tai, ką mokate be jo. Valdiklis atsidaro su apytiksliu šios rinkos skaičiumi; pastumkite iki to, kiek mokate iš tikrųjų.',
      },
    ],
    note: 'Pokalbio metu suskaičiuosime pagal Jūsų duomenis ir pasakysime, jei nesueina.',
  },

  who: {
    eyebrow: 'Registruota',
    title: 'Kam tai skirta',
    groups: [
      { id: 'property', tab: 'Nekilnojamojo turto administratoriams', line: 'Gyventojų laiškai, užstatai ir priežiūra. Ištisus metus.' },
      { id: 'accounting', tab: 'Apskaitos įmonėms', line: 'Klausimai dėl mokesčių ir trūkstamų dokumentų, prieš kiekvieną terminą.' },
      { id: 'insurance', tab: 'Draudimo brokeriams', line: 'Atsakymas paprastai jau yra polise.' },
    ],

      sourcesTitle: 'Rašoma remiantis:',

    accuracy: {
      title: 'Kas nutinka, kai ji nežino',
      items: [
        'Juodraščius rašo tik tiems laiškams, į kuriuos gali atsakyti iš Jūsų bylų. Kitų neliečia.',
        'Kai atsakymo byloje nėra, ji Jūsų paklausia. Spragos neužpildo tuo, kas tiesiog gražiai skamba.',
        'Šiame produkte niekur nėra automatinio išsiuntimo. Kiekvieną juodraštį perskaito žmogus ir išsiunčia pats.',
        'Juodraštis cituoja mokestį, terminą ar taisyklę iš Jūsų pačių dokumentų, Jūsų pačių žodžiais.',
      ],
      share: { before: 'Išmatuota tikroje pašto dėžutėje: juodraštį gavo maždaug vienas laiškas iš ', after: '.' },
      unmeasured: 'Nematavome, kaip dažnai juodraštį vis dar reikia taisyti. Kai išmatuosime, skaičius atsiras šiame puslapyje.',
    },
  },

  price: {
    eyebrow: 'Vienas mokestis visai įmonei',
    title: 'Kiek kainuoja',


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
      lede: 'Abiejuose tas pats produktas. Skiriasi tik dydis.',
      pick: 'Rinkitės suskaičiavę savo žmones.',
      rows: [
        { id: 'desk', name: 'Desk', note: 'Mažiausia įmonė, kuriai parduodame.' },
        { id: 'firm', name: 'Firm', note: 'Viena kaina visam intervalui. Ji nekyla, kai priimate naujų žmonių.' },
      ],
      feeLabel: 'Per mėnesį, visai įmonei',
      peopleLabel: 'Apimami žmonės, iki',
      draftsLabel: 'Juodraščiai per mėnesį, bendri',
      note: 'Nė vienas skaičius nėra vienam žmogui. Juodraščiai bendri, ir niekas neturi savo atskiros kvotos, kuri galėtų baigtis.',
      under: { before: 'Mažesnė įmonė? Planas ', link: 'doviloop.dev', after: ' svetainėje daro tą patį ir kainuoja gerokai mažiau.' },
      over: 'Didesnė įmonė? Parašykite, ir apskaičiuosime kainą.',
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
      noProofYet: 'Kol kas neturime klientų, į kuriuos galėtume parodyti.',
      reason: { before: 'Kaina tokia žema, nes mums reikia ', after: ' įmonių, kurios pasakys, kad tai veikia.' },
      lock: 'Jūsų kaina nesikeičia, kol liekate.',
      spots: { label: 'Laisvų vietų dar yra:', of: ' iš ' },
      spotsClosed: 'Vietos, kurios ėjo kartu su mainais, jau užimtos. Mėnesinis mokestis žemiau nesikeičia; įdiegimo mokestis dabar taikomas visas.',
      givesTitle: 'Ką duodate Jūs:',
      gives: [
        'atsiliepimą savais žodžiais',
        'atvejo aprašymą po šešiasdešimties dienų, su skaičiais, kuriuos pasirenkate',
        'savo logotipą produkto svetainėje',
        'du atsiliepimų pokalbius per pirmus du mėnesius',
      ],
      note: 'Jei nenorite būti įvardyti, sumokate įdiegimo mokestį, ir niekas kitas produkte nesikeičia.',
      signature: {
        line: 'Šį produktą sukūriau aš ir įdiegimo pokalbius vedu pats.',
      },
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
    title: 'Trys klausimai. Mažiau nei minutė.',
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
    otherLabel: 'Parašykite, kurį',
    choosePrompt: 'Pasirinkite',
    steps: ['Apie komandą', 'Kaip su Jumis susisiekti'],
    stepsLabel: 'Patikrinimas dviem žingsniais',
    continueCta: 'Toliau',
    backCta: 'Atgal',
    submit: 'Patikrinkite, ar tinkame',
    submitting: 'Palaukite akimirką',
    required: 'Šį lauką reikia užpildyti.',
    invalidEmail: 'Šis adresas atrodo neužbaigtas.',
    privacyNote: 'Naudojama pasiruošti pokalbiui. Jokių sąrašų, jokio perpardavimo.',
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
    company: {
      legalName: 'DoviLoop OU',
      registrationNumber: '17355061',
      address: 'Sepapaja 6, 15551 Tallinn, Estonia',
    },
  },
};
