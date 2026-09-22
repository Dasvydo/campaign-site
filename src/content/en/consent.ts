import type { Content } from '../types';

export const consent: Content['consent'] = {
  title: 'Cookies on this page',
  body: 'Visit counting and advertising. Neither runs until you accept.',
  accept: 'Accept',
  decline: 'Decline',
  detailsLabel: 'What each one does',
  items: [
    {
      name: 'Counting visits',
      body: 'PostHog, hosted in the EU. Which sections get read and how far down the page people get. No session recording, no heatmaps.',
    },
    {
      name: 'Advertising',
      body: 'The Meta pixel. Lets us show ads on Facebook and Instagram to people who have been on this page.',
    },
  ],
  note: 'Declining changes nothing about the page, the worked example or the form. You can change your mind in the footer.',
  privacyLabel: 'Privacy policy',
  statusGranted: 'Accepted',
  statusDenied: 'Declined',
  statusUnset: 'Not set',
  reopenLabel: 'Change cookie choice',
};
