import type { Content } from '../content/types';
import { Section } from './Section';

/**
 * Three hairline-ruled bands, not three cards.
 *
 * The columns are deliberately unequal so the three steps cannot read as a
 * matched set, and there are no icons: an icon here would be generic AI
 * decoration and brand-lock rules that out.
 */
export function HowItWorks({ c }: { c: Content }) {
  return (
    <Section id="how" n="01" title={c.how.title} lead={c.how.lead}>
      <ol className="m-0 list-none p-0">
        {c.how.steps.map((step, i) => (
          <li
            key={step.n}
            className={[
              'grid gap-x-8 gap-y-2 py-7 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]',
              i === 0 ? 'pt-0' : 'rule-top',
            ].join(' ')}
          >
            <h3 className="text-[clamp(1.25rem,2.2vw,1.6rem)]">
              <span className="mr-3 align-middle text-[0.72em] font-normal tabular-nums text-muted">
                {step.n}
              </span>
              {step.title}
            </h3>
            <p className="max-w-[58ch] leading-relaxed opacity-85">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
