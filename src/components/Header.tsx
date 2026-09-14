import { Link } from 'react-router-dom';
import type { Content } from '../content/types';
import type { Locale } from '../lib/contract';
import { LOCALES, pathFor } from '../content';

/**
 * Wordmark, language switch, one button.
 *
 * The wordmark is live text in the brand-lock two-tone. There is no logo file
 * anywhere on this machine, and the monogram is not faked. When Dovy drops the
 * transparent PNG at public/logo.png, swap the span for the commented img.
 * See BLOCKED.md entry 3.
 */
export function Header({
  c,
  locale,
  onCta,
}: {
  c: Content;
  locale: Locale;
  onCta: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 rule-bottom bg-cream/95 backdrop-blur-[6px]">
      <div className="mx-auto flex w-full max-w-[1180px] items-center gap-4 px-5 py-3.5 sm:px-8">
        <Link
          to={pathFor(locale)}
          className="font-sans text-[1.15rem] font-bold tracking-[-0.01em] no-underline"
          aria-label="DoviLoop"
        >
          {/* <img src="/logo.png" alt="" width={26} height={26} /> when it exists */}
          <span style={{ color: 'var(--color-teal)' }}>Dovi</span>
          <span style={{ color: 'var(--color-orange)' }}>Loop</span>
        </Link>

        <nav aria-label={c.nav.localeLabel} className="ml-auto flex items-center gap-1">
          {LOCALES.map((l) => {
            const active = l === locale;
            return (
              <Link
                key={l}
                to={pathFor(l)}
                hrefLang={l}
                aria-current={active ? 'page' : undefined}
                className={[
                  'rounded-[10px] px-2.5 py-1.5 text-[14px] no-underline transition-colors',
                  active ? 'font-medium text-espresso' : 'text-muted hover:text-espresso',
                ].join(' ')}
              >
                {c.nav.localeNames[l]}
              </Link>
            );
          })}
        </nav>

        <a href="#qualifier" className="btn btn-primary hidden sm:inline-flex" onClick={onCta}>
          {c.nav.cta}
        </a>
      </div>
    </header>
  );
}
