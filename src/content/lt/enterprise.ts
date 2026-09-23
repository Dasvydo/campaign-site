import type { Content } from '../types';

/*
 * <!-- NEEDS NATIVE CHECK -->
 *
 * Antrasis kelias, skirtas didesnems imonems. Parasyta kaip lietuviskas
 * tekstas, o ne pazodinis vertimas. Visur mandagusis kreipinys "Jus".
 *
 * `hosting` yra ta pati sakinio forma, kuria puslapio virsus turejo iki
 * 92c89c7, zodis i zodi. Ji cia neperrasyta.
 *
 * Jokiu skaiciu tekste. Jokiu ilgu bruksniu.
 */
export const enterprise: Content['enterprise'] = {
  eyebrow: 'Didesnėms įmonėms',
  title: 'Diegimas visoje įmonėje',

  lede: {
    before:
      'Aukščiau esantys planai veikia savitarna, ir dauguma tiesiog perskaito sąlygas ir pradeda. Nuo ',
    after:
      ' vietų paprastai prireikia saugumo peržiūros, viešųjų pirkimų formos ir atsakymo IT žmogui, kur keliauja paštas. Parašykite, ką norite pamatyti, ir atsakysime raštu.',
  },

  hostingLabel: 'Kur ji veikia',
  hosting: 'Veikia mūsų serveriuose arba įdiegiame Jūsų.',

  form: {
    title: 'Papasakokite apie savo įmonę',
    intro: 'Tai perskaito žmogus ir atsako el. paštu. Niekas nerezervuojama ir niekas nepradedama.',

    nameLabel: 'Jūsų vardas',
    namePlaceholder: 'Kam atsakyti',

    emailLabel: 'Darbo el. paštas',
    emailHint: 'Atsakymas keliauja tik šiuo adresu.',
    emailFree:
      'Panašu į asmeninį adresą. Darbinis pasiektų tinkamą dėžutę, bet tiks ir šis.',

    sizeLabel: 'Kiek žmonių atsakinėja į laiškus',
    sizeHint: 'Užtenka apytikslio skaičiaus.',

    noteLabel: 'Ką norite sužinoti',
    notePlaceholder:
      'Saugumo peržiūra, viešieji pirkimai, diegimas, kur ji veikia, ar bet kas kita.',
    noteHint: 'Neprivaloma.',

    submit: 'Siųsti mums',
    sending: 'Siunčiama',

    errorName: 'Parašykite, kam atsakyti.',
    errorEmail: 'Reikia adreso, kuriuo atsakytume.',
    errorEmailShape: 'Šiame adrese trūksta eta ženklo arba domeno.',
    errorSize: 'Net apytikslis skaičius padės atsakyti.',

    sentTitle: 'Gavome.',
    sentBody: 'Atsakome el. paštu, dažniausiai tą pačią darbo dieną.',

    heldTitle: 'Išsaugota šiame įrenginyje.',
    heldBody:
      'Tinklas dabar jo nepriėmė. Jis išsiųs pats, kai kitą kartą atversite šį puslapį, ir niekas nedings.',

    lostTitle: 'Šiame įrenginyje išsaugoti nepavyko.',
    lostBody:
      'Tinklas jo nepriėmė, o išsaugoti čia nėra kur, todėl jis mūsų nepasiekė. Parašykite mums tiesiogiai.',

    mailLead: 'Arba parašykite mums tiesiogiai:',
  },
};
