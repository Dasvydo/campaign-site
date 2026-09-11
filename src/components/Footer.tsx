import type { Content } from '../content/types';
import { FALLBACK_CONTACT_EMAIL } from '../lib/env';

/**
 * Company details, privacy, contact.
 *
 * The legal fields render only when they are filled. They live in a single
 * `company` block per locale file, so filling them is one edit and no code
 * change. This matters before any ad money is spent into an EU audience.
 * See BLOCKED.md entry 7.
 */
export function Footer({ c }: { c: Content }) {
  const { legalName, registrationNumber, address } = c.footer.company;
  const details = [legalName, registrationNumber, address].filter(Boolean);

  return (
    <footer className="on-dark rule-top border-t-rule-dark bg-charcoal text-warmwhite">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <p className="font-sans text-[15px] font-bold">
              <span style={{ color: '#5FA9B8' }}>Dovi</span>
              <span style={{ color: '#F0844A' }}>Loop</span>
            </p>
            <p className="mt-2 max-w-[42ch] text-[15px] text-muted-dark">{c.footer.tagline}</p>

            {details.length > 0 ? (
              <address className="mt-5 not-italic text-[14px] leading-relaxed text-muted-dark">
                {details.map((d) => (
                  <span key={d} className="block">
                    {d}
                  </span>
                ))}
              </address>
            ) : null}
          </div>

          <nav aria-label={c.footer.contactLink} className="flex flex-wrap gap-x-7 gap-y-3">
            <a
              className="text-[15px] text-warmwhite underline underline-offset-4 hover:opacity-80"
              href="https://doviloop.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              {c.footer.productLink}
            </a>
            <a
              className="text-[15px] text-warmwhite underline underline-offset-4 hover:opacity-80"
              href="https://doviloop.dev/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {c.footer.privacyLink}
            </a>
            <a
              className="text-[15px] text-warmwhite underline underline-offset-4 hover:opacity-80"
              href={`mailto:${FALLBACK_CONTACT_EMAIL}`}
            >
              {c.footer.contactLink}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
