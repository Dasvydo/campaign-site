import type { Content } from '../content/types';
import { Section } from './Section';

/**
 * A sourced table, not three hero stats.
 *
 * The self-review threw out the row of big figures: this reader is a partner
 * who is personally accountable and has been sold to before. A number with its
 * basis printed next to it persuades that reader. The same number set 96px tall
 * does not. See DESIGN-PLAN.md sections 6 and 7.
 */
export function Numbers({ c }: { c: Content }) {
  return (
    <Section
      id="numbers"
      n="03"
      title={c.numbers.title}
      lead={c.numbers.lead}
      rule={false}
      className="on-dark bg-charcoal text-warmwhite"
    >
      <dl className="m-0">
        {c.numbers.rows.map((row, i) => (
          <div
            key={row.label}
            className={[
              'grid items-baseline gap-x-8 gap-y-1 py-6 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]',
              i === 0 ? 'pt-0' : 'rule-top',
            ].join(' ')}
          >
            <dt>
              <span className="font-display text-[clamp(1.6rem,3vw,2.15rem)] leading-none">
                {row.figure}
              </span>
              <span className="mt-1.5 block text-[15px] text-muted-dark">{row.label}</span>
            </dt>
            <dd className="m-0 max-w-[52ch] text-[15px] leading-relaxed">{row.basis}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-9 max-w-[64ch] rule-top pt-6 text-[15px] leading-relaxed text-muted-dark">
        {c.numbers.caveat}
      </p>
    </Section>
  );
}
