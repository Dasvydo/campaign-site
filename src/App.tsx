import { Navigate, Route, Routes } from 'react-router-dom';
import { LocalePage } from './LocalePage';

/**
 * Three routes, one template. English is the root, per the spec.
 * Anything unknown goes to English rather than a 404: this page is the target
 * of ads and outreach links, and a mistyped path should still sell.
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<LocalePage locale="en" />} />
      <Route path="/da" element={<LocalePage locale="da" />} />
      <Route path="/lt" element={<LocalePage locale="lt" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
