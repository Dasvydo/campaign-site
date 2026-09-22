import type { Content } from '../types';

export const results: Content['results'] = {
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
    sameEmail:
      'Én ting: book med den samme mail, som du har givet os her. Så kobler vi mødet sammen med det, du har skrevet.',
  },
  gmailNote:
    'Du skrev, at teamet ikke sidder i Outlook. Det er helt fint. Gmail og andre klienter sættes op per team i onboardingen, og vi gennemgår på mødet, hvad det kræver.',
  tooSmall: {
    title: 'Det her starter ved ti personer.',
    body: 'I er under det i dag, så et møde ville bruge tyve minutter af din tid på at nå frem til det samme svar. Planen på doviloop.dev laver den samme skrivning for mindre teams og koster væsentligt mindre. Vend tilbage, når teamet vokser, så tager vi den derfra.',
    pricingCta: 'Se planen til mindre teams',
  },
  deliveryWarning:
    'Vores system nåede ikke at bekræfte dine svar, så vi har gemt dem på den her enhed og sender dem igen automatisk. Der er ikke noget gået tabt. Book endelig mødet nedenfor alligevel.',
  startOver: 'Ret et svar',
};
