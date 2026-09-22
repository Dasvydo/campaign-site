import type { Content } from '../types';

export const numbers: Content['numbers'] = {
  eyebrow: 'Your own arithmetic',
  title: 'What you keep',
  about: 'about\u00a0',
  inputs: {
    people: { label: 'People who answer mail' },
    drafts: { label: 'Drafts sent a month' },
    hourly: { label: 'What an hour of their time costs' },
    minutes: { label: 'Minutes saved on each draft', note: 'Your estimate. We have not timed this yet.' },
  },
  beats: {
    hours: { label: 'Hours handed back:' },
    worth: { label: 'What those hours cost you today:' },
    fee: { before: 'This costs (', after: '):' },
    keep: { label: 'You keep:' },
  },
  units: { hours: '\u00a0h', perMonth: ' a month', perHour: ' an hour' },
  yearLabel: 'Over a year:',
  under: 'At these figures it does not pay for itself. We would say so on the call rather than sell it to you.',
  moreLabel: 'Show the arithmetic',
  basis: [
    {
      term: 'Drafts a month',
      def: 'Not every email gets one. On a live mailbox, about one in seven did, because it was a question the files could already answer. If you know roughly how much mail comes in, that is how to turn it into a number of drafts.',
    },
    {
      term: 'Minutes saved on each draft',
      def: 'Our guess, not a measurement. Writing a reply from nothing takes about six minutes; reading one that is ready and pressing send takes about one. So five is the gap. Put your own number in if ours is wrong.',
    },
    {
      term: 'What an hour costs',
      def: 'Yours, not ours. What one of your people costs the firm for an hour, wages plus what you pay on top of them. The slider opens on a rough figure for this market; move it to what you actually pay.',
    },
  ],
  note: 'On the call we run this again on your real numbers, and if it does not pay for itself we say so.',
};
