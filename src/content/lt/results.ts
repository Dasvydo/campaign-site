import type { Content } from '../types';

export const results: Content['results'] = {
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
  },
  deliveryWarning:
    'Mūsų sistema nepatvirtino Jūsų atsakymų, todėl išsaugojome juos šiame įrenginyje ir išsiųsime dar kartą automatiškai. Niekas neprarasta. Pokalbį žemiau vis tiek galite užsisakyti.',
  startOver: 'Pakeisti atsakymą',
};
