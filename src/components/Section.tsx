import type { ReactNode } from 'react';

/**
 * The page's one layout primitive.
 *
 * A full-bleed hairline on top, a numbered margin column on the left, and the
 * content in the main column. The margin number is what an ALL-CAPS eyebrow
 * label would otherwise be doing, which is why there are no eyebrow labels
 * anywhere on this page.
 */
export function Section({
  id,
  n,
  title,
  lead,
  children,
  rule = true,
  className = '',
  titleId,
}: {
  id?: string;
  n: string;
  title: string;
  lead?: string;
  children: ReactNode;
  rule?: boolean;
  className?: string;
  titleId?: string;
}) {
  const headingId = titleId ?? (id ? `${id}-title` : undefined);
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${rule ? 'rule-top' : ''} ${className}`}
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-8 md:py-24">
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-[64px_minmax(0,1fr)]">
          <div className="hidden md:block">
            <span className="margin-number">{n}</span>
          </div>
          <div>
            <span className="margin-number md:hidden">{n}</span>
            <h2
              id={headingId}
              className="mt-2 max-w-[22ch] text-[clamp(1.85rem,3.6vw,2.9rem)] md:mt-0"
            >
              {title}
            </h2>
            {lead ? (
              <p className="mt-4 max-w-[62ch] text-[1.05rem] leading-relaxed opacity-80">{lead}</p>
            ) : null}
            <div className="mt-10">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
