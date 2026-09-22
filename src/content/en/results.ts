import type { Content } from '../types';

export const results: Content['results'] = {
  qualified: {
    title: 'Good fit. Let us book the call.',
    body: 'Twenty minutes, and you pick the time. No deck, no proposal to sign afterwards.',
    coversTitle: 'What we cover',
    covers: [
      'What your team actually answers all day, in their own words.',
      'Whether your existing material is in a shape we can work from.',
      'What the two week pilot would look like on your calendar.',
      'The price again, plainly, and the sum on your own numbers.',
    ],
    bookingCta: 'Pick a time',
    bookingFallback: 'Email us to book',
    sameEmail:
      'One thing: book with the same email you just gave us. That is how the call gets matched to what you told us here.',
  },
  gmailNote:
    'You told us the team is not on Outlook. That is fine. Gmail and other clients are set up per team during onboarding, and we will go through what that takes on the call.',
  tooSmall: {
    title: 'This one starts at ten people.',
    body: 'You are under that today, so a call would spend twenty minutes of your time to reach the same answer. The plan on doviloop.dev does the same drafting for smaller teams and costs a great deal less. Come back to us when the team grows and we will pick this up.',
    pricingCta: 'See the plan for smaller teams',
  },
  deliveryWarning:
    'Our system did not confirm your answers, so we have kept them on this device and will send them again automatically. Nothing is lost. Book the call below either way.',
  startOver: 'Change an answer',
};
