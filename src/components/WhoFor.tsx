import type { Content } from '../content/types';
import { Section } from './Section';

/**
 * The seat minimum is said out loud here on purpose. It pre-qualifies, and it
 * saves both sides a call that was never going to close.
 */
export function WhoFor({ c }: { c: Content }) {
  return (
    <Section id="who" n="04" title={c.who.title} lead={c.who.lead}>
      <div className="grid gap-x-9 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {c.who.groups.map((g) => (
          <div key={g.title} className="rule-top pt-5">
            <h3 className="text-[1.22rem]">{g.title}</h3>
            <p className="mt-2.5 text-[15.5px] leading-relaxed opacity-85">{g.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-4 rule-top pt-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
        <p className="flex items-start gap-3 text-[1.02rem] leading-relaxed">
          <span
            aria-hidden="true"
            className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full"
            style={{ background: 'var(--color-amber)' }}
          />
          <span>{c.who.seatMinimum}</span>
        </p>
        <p className="text-[1.02rem] leading-relaxed opacity-85">{c.who.noTech}</p>
      </div>
    </Section>
  );
}
