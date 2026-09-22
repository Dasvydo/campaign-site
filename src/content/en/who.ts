import type { Content } from '../types';

export const who: Content['who'] = {
  eyebrow: 'Filed under',
  title: 'Who this is for',
  /* Ordered to match the demo's desk tabs, which open on Property because
     the hero's letter is the property one. The two sections used to run in
     different orders one scroll apart. */
  groups: [
    { id: 'property', tab: 'Property managers', line: 'Tenant mail, deposits and maintenance. All year.' },
    { id: 'accounting', tab: 'Accounting firms', line: 'Fee queries and missing documents, every filing deadline.' },
    { id: 'insurance', tab: 'Insurance brokers', line: 'The answer is usually already in the policy.' },
  ],

    sourcesTitle: 'Drafted out of:',

  accuracy: {
    title: 'What happens when it does not know',
    items: [
      'It only drafts the ones it can answer from your files. The rest it leaves alone.',
      'When the answer is not on file, it asks you. It does not fill the gap with something that reads well.',
      'There is no automatic send anywhere in this product. A person reads every draft and sends it themselves.',
      'A draft quotes the fee, the deadline or the rule out of your own documents, in your own wording.',
    ],
  },
};
