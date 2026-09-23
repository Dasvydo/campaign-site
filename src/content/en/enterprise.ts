import type { Content } from '../types';

/**
 * The secondary path, in English. This is the master copy.
 *
 * WHAT IT IS FOR. Self-serve is the motion. The hero and the tiers sell a per
 * seat trial anybody can start themselves, and that is deliberately the only
 * thing this page asks for. But a firm with ten desks handling client
 * correspondence has a security review, a procurement form and somebody in IT
 * who wants to know where the mail goes, and none of that fits in a signup
 * button. So this sits at the bottom of the scroll, quietly, and invites them
 * to write. It does not compete with the trial CTA: it is below the audience
 * folders, it never says trial, and its button sends an email rather than
 * starting anything.
 *
 * IT TURNS NOBODY AWAY. The deleted fit check computed a `too_small` outcome
 * and redirected firms under ten people to another site. Under per seat
 * pricing a small firm is a customer, and there is no rejection anywhere in
 * this file.
 *
 * TWO THINGS HERE ARE RECOVERED, NOT WRITTEN. `hosting` is the exact sentence
 * the hero carried until 92c89c7, word for word. It came off the hero because
 * it read as contradicting "Nothing to install" one section below; it is a
 * real product fact and this is where a firm actually asks it. And the
 * accuracy answers this section shows are `who.accuracy`, rendered from there.
 *
 * No figures. The seat floor in the lede is the largest tier's own count from
 * src/lib/pricing.ts, printed between the two halves. No em dashes.
 */
export const enterprise: Content['enterprise'] = {
  eyebrow: 'Larger firms',
  title: 'Rolling it out across a firm',

  lede: {
    before:
      'The tiers above are self-serve, and most firms read the terms and get on with it. From ',
    after:
      ' seats up there is usually a security review, a procurement form and somebody in IT who wants to know where the mail goes. Tell us what you need to see and we will answer in writing.',
  },

  hostingLabel: 'Where it runs',
  hosting: 'It runs on our servers, or we install it on yours.',

  form: {
    title: 'Tell us about your firm',
    intro: 'A person reads this and answers by email. Nothing is booked and nothing is started.',

    nameLabel: 'Your name',
    namePlaceholder: 'Who we are replying to',

    emailLabel: 'Work email',
    emailHint: 'The reply goes here and nowhere else.',
    emailFree:
      'That looks like a personal address. A work one reaches the right inbox, but this will do.',

    sizeLabel: 'People who answer mail',
    sizeHint: 'A rough count is fine.',

    noteLabel: 'What you need to know',
    notePlaceholder: 'Security review, procurement, rollout, where it runs, or anything else.',
    noteHint: 'Optional.',

    submit: 'Send this to us',
    sending: 'Sending',

    errorName: 'Tell us who to reply to.',
    errorEmail: 'We need an address to reply to.',
    errorEmailShape: 'That address is missing an at sign or a domain.',
    errorSize: 'Even a rough count helps us answer.',

    sentTitle: 'It is with us.',
    sentBody: 'We answer by email, usually the same working day.',

    heldTitle: 'It is held on this device.',
    heldBody:
      'The network did not take it just now. It goes out by itself the next time you open this page, and nothing is lost in the meantime.',

    lostTitle: 'This device would not hold it.',
    lostBody:
      'The network did not take it and there is nowhere here to keep it, so it has not reached us. Please write to us instead.',

    mailLead: 'Or write to us directly:',
  },
};
