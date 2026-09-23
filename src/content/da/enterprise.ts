import type { Content } from '../types';

/*
 * <!-- NEEDS NATIVE CHECK -->
 *
 * Den anden vej ind, til stoerre firmaer. Skrevet som dansk tekst, ikke som en
 * oversaettelse linje for linje. Formel flertalsform hele vejen: I, jer, jeres.
 *
 * `hosting` er den saetning, heltebilledet baerte indtil 92c89c7, ord for ord.
 * Den er ikke skrevet om her.
 *
 * Ingen tal i teksten. Ingen lange tankestreger.
 */
export const enterprise: Content['enterprise'] = {
  eyebrow: 'Større firmaer',
  title: 'Skal det rulles ud i hele firmaet',

  lede: {
    before:
      'Alle niveauer ovenfor er åbne for firmaer i enhver størrelse, og de fleste læser vilkårene og går i gang. Fra ',
    after:
      ' pladser og op er der som regel en sikkerhedsgennemgang, et indkøbsskema og en i IT, der vil vide, hvor posten havner. Skriv, hvad I har brug for at se, så svarer vi skriftligt.',
  },

  hostingLabel: 'Hvor den kører',
  hosting: 'Den kører på vores servere, eller vi sætter den op på jeres.',

  form: {
    title: 'Fortæl os om jeres firma',
    intro:
      'Et menneske læser det og svarer på mail. Der bliver ikke booket noget, og der bliver ikke startet noget.',

    nameLabel: 'Jeres navn',
    namePlaceholder: 'Hvem vi skal svare',

    emailLabel: 'Arbejdsmail',
    emailHint: 'Svaret går hertil og ingen andre steder.',
    emailFree:
      'Det ligner en privat adresse. En arbejdsadresse rammer den rigtige indbakke, men denne kan også bruges.',

    sizeLabel: 'Personer, der svarer på post',
    sizeHint: 'Et omtrentligt tal er fint.',

    noteLabel: 'Hvad I har brug for at vide',
    notePlaceholder:
      'Sikkerhedsgennemgang, indkøb, udrulning, hvor den kører, eller noget helt andet.',
    noteHint: 'Valgfrit.',

    submit: 'Send det til os',
    sending: 'Sender',

    errorName: 'Fortæl os, hvem vi skal svare.',
    errorEmail: 'Vi mangler en adresse at svare på.',
    errorEmailShape: 'Den adresse mangler et snabel-a eller et domæne.',
    errorSize: 'Selv et omtrentligt tal hjælper os med at svare.',

    sentTitle: 'Vi har modtaget det.',
    sentBody: 'Vi svarer på mail, som regel samme arbejdsdag.',

    heldTitle: 'Det ligger på denne enhed.',
    heldBody:
      'Netværket tog ikke imod det lige nu. Det bliver sendt af sig selv, næste gang I åbner siden, og intet går tabt i mellemtiden.',

    lostTitle: 'Denne enhed kunne ikke gemme det.',
    lostBody:
      'Netværket tog ikke imod det, og der er ingen steder at gemme det her, så det er ikke nået frem til os. Skriv venligst til os i stedet.',

    mailLead: 'Eller skriv direkte til os:',
  },
};
