import type { Content } from '../content/types';
import { FALLBACK_CONTACT_EMAIL } from '../lib/env';
import { MARK_BOWL, MARK_STEM, Mark } from './Hero';
import { ConsentStatus } from './Consent';

/**
 * The colophon: the last sheet in the ream.
 *
 * The registered office is set as a compliment slip with a torn edge, because
 * it is a registry fact rather than marketing copy and should not read like
 * marketing copy. Those three fields are identical in every locale, which
 * scripts/audit-locales.mjs enforces: a company number and a street address are
 * not translated, and a locale that "translated" them would be filing a
 * different company.
 *
 * Every field renders only when it is filled, so the block can stay empty
 * without leaving a gap. See BLOCKED.md entry 7.
 */
export function Footer({ c }: { c: Content }) {
  const { legalName, registrationNumber, address } = c.footer.company;
  /* "Sepapaja 6, 15551 Tallinn, Estonia" is one field in the contract because
     it is one fact, and a slip sets it a line at a time. */
  const addressLines = address
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean);
  const hasOffice = Boolean(legalName || registrationNumber || address);

  return (
    <footer id="footer" role="contentinfo" aria-labelledby="footer-h">
      <div className="footer-wrap">
        <p className="footer-folio" aria-hidden="true">
          07
        </p>
        <div className="footer-rule" aria-hidden="true" />

        <div className="footer-grid">
          <div className="footer-sign">
            <h2 className="footer-h" id="footer-h">
              <Mark gradientId="footer-dl-d" />
              <span>DoviLoop</span>
            </h2>
            <p className="footer-tag">{c.footer.tagline}</p>
          </div>

          {hasOffice ? (
            <div className="footer-co">
              <h3 className="footer-label">{c.footer.officeLabel}</h3>
              <div className="footer-slipwrap">
                <div className="footer-slip">
                  <svg viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
                    <path d={MARK_BOWL} />
                    <path d={MARK_STEM} />
                  </svg>
                  <address className="footer-addr">
                    {legalName ? <span className="footer-entity">{legalName}</span> : null}
                    {registrationNumber ? (
                      <span className="footer-reg">{registrationNumber}</span>
                    ) : null}
                    {addressLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </address>
                </div>
                <div className="footer-cut" aria-hidden="true" />
              </div>
            </div>
          ) : null}

          <div className="footer-links">
            <h3 className="footer-label">{c.footer.elsewhereLabel}</h3>
            <ul className="footer-list">
              <li>
                <span className="footer-term" id="footer-t1">
                  {c.footer.productLink}
                </span>
                <a
                  className="footer-a"
                  href="https://doviloop.dev"
                  aria-describedby="footer-t1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  doviloop.dev
                </a>
              </li>
              <li>
                <span className="footer-term" id="footer-t2">
                  {c.footer.privacyLink}
                </span>
                <a
                  className="footer-a"
                  href="https://doviloop.dev/privacy"
                  aria-describedby="footer-t2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {c.footer.privacyLink}
                </a>
              </li>
              <li>
                <span className="footer-term" id="footer-t4">
                  {c.footer.consentLink}
                </span>
                <ConsentStatus c={c} />
              </li>
              <li>
                <span className="footer-term" id="footer-t3">
                  {c.footer.contactLink}
                </span>
                <a
                  className="footer-a"
                  href={`mailto:${FALLBACK_CONTACT_EMAIL}`}
                  aria-describedby="footer-t3"
                >
                  {FALLBACK_CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-foot">
          <p className="footer-legal">
            <span aria-hidden="true">&copy;</span> {new Date().getFullYear()}{' '}
            {legalName || 'DoviLoop'}
          </p>
        </div>
      </div>
    </footer>
  );
}
