import type { ReactNode } from 'react';

/**
 * Detail, behind a native <details>.
 *
 * Native rather than a React toggle on purpose: it opens with no JavaScript, it
 * is already a disclosure to a screen reader, Enter and Space already work, and
 * the browser's own find-in-page can open it. A hand-rolled version would have
 * to re-earn all four.
 */
export function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="disc">
      <summary className="disc-sum">
        <span className="disc-mark" aria-hidden="true" />
        {label}
      </summary>
      <div className="disc-body">{children}</div>
    </details>
  );
}
