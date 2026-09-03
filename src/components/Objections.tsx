import type { Content } from '../content/types';
import { Section } from './Section';

/**
 * REFRESHED-BY-BATCH-E
 *
 * These five are the ones we can defend today. Batch E produces the real
 * objection taxonomy from the competitor teardown; when it lands, replace the
 * `objections.items` array in src/content/{en,da,lt}.ts. Nothing in this
 * component needs to change. See BLOCKED.md entry 5.
 *
 * All five are open. The self-review threw out the accordion: a closed
 * accordion answers nothing to someone skimming on a phone, and answering these
 * before the call is the entire job of the section.
 */
export function Objections({ c }: { c: Content }) {
  return (
    <Section id="objections" n="05" title={c.objections.title} lead={c.objections.lead}>
      <dl className="m-0">
        {c.objections.items.map((item, i) => (
          <div
            key={item.q}
            className={[
              'grid gap-x-9 gap-y-2.5 py-7 md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]',
              i === 0 ? 'pt-0' : 'rule-top',
            ].join(' ')}
          >
            <dt className="font-display text-[clamp(1.15rem,2vw,1.42rem)] leading-snug">
              {item.q}
            </dt>
            <dd className="m-0 max-w-[62ch] leading-relaxed opacity-85">{item.a}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
