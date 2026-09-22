import type { Content } from '../types';

export const consent: Content['consent'] = {
  title: 'Cookies på denne side',
  body: 'Besøgstælling og annoncering. Ingen af dem kører, før du accepterer.',
  accept: 'Accepter',
  decline: 'Afvis',
  detailsLabel: 'Hvad hver ting gør',
  items: [
    {
      name: 'Tælling af besøg',
      body: 'PostHog, hostet i EU. Hvilke afsnit der bliver læst, og hvor langt ned på siden folk når. Ingen sessionsoptagelse, ingen heatmaps.',
    },
    {
      name: 'Annoncering',
      body: 'Meta-pixlen. Gør det muligt at vise annoncer på Facebook og Instagram til folk, der har været på denne side.',
    },
  ],
  note: 'Afviser du, ændrer det intet ved siden, det gennemregnede eksempel eller formularen. Du kan skifte mening nederst på siden.',
  privacyLabel: 'Privatlivspolitik',
  statusGranted: 'Accepteret',
  statusDenied: 'Afvist',
  statusUnset: 'Ikke valgt',
  reopenLabel: 'Skift cookievalg',
};
