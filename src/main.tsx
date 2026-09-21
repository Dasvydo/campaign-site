import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

/* Review mode, for marking things on the live page and saying what is wrong
   with them. `teams.doviloop.dev/?review` and a button appears in the corner.

   The import is dynamic and inside the test on purpose. Vite puts what is
   behind a dynamic import in a chunk of its own, so a visitor who never asks
   for review mode never downloads it: the overlay, its stylesheet and all of
   its handlers are simply not on their machine. scripts/verify-visible.mjs
   checks both halves - that the flag brings it, and that its absence keeps it
   away - because a reviewing tool that leaked onto the page a customer sees
   would be worse than no reviewing tool. */
if (new URLSearchParams(window.location.search).has('review')) {
  void import('./review/review').then((m) => m.startReview());
}
