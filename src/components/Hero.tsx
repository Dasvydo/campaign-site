import type { Content } from '../content/types';

/**
 * The hero is the artifact, not a headline.
 *
 * Left column carries the argument, right column carries a real message and the
 * draft it produced. The two surfaces are deliberately different: the incoming
 * message is a recessed sand block with a flat left edge, the draft is the one
 * raised paper card on the page. No two surfaces on this site share a treatment,
 * which is how the identical-card look is avoided.
 */
export function Hero({ c, onCta }: { c: Content; onCta: () => void }) {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 pt-14 pb-16 sm:px-8 md:pt-20 md:pb-24">
      <div className="grid gap-12 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-14 lg:gap-20">
        {/* The argument */}
        <div className="md:pt-2">
          <h1 className="max-w-[16ch] text-[clamp(2.3rem,5.2vw,3.5rem)]">{c.hero.opening}</h1>

          <p className="mt-6 max-w-[46ch] text-[1.06rem] leading-relaxed opacity-85">
            {c.hero.subOpening}
          </p>

          <p className="mt-6 max-w-[46ch] text-[1.06rem] leading-relaxed">{c.hero.claim}</p>

          <div className="mt-9">
            <a href="#qualifier" className="btn btn-primary" onClick={onCta}>
              {c.hero.cta}
            </a>
            <p className="mt-3.5 max-w-[38ch] text-[14.5px] text-muted">{c.hero.ctaNote}</p>
          </div>
        </div>

        {/* The artifact */}
        <figure className="m-0">
          {/* Incoming: recessed, flat left edge, no shadow. */}
          <div className="rounded-r-brand border-l-2 border-taupe bg-sand p-6 sm:p-7">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13.5px] text-muted">
              <time className="font-medium tabular-nums text-espresso">{c.hero.clockIn}</time>
              <span>{c.hero.message.from}</span>
            </div>
            <p className="mt-3 font-medium">{c.hero.message.subject}</p>
            <p className="mt-2.5 text-[15.5px] leading-relaxed opacity-85">{c.hero.message.body}</p>
          </div>

          {/* The one moment of colour and the one animation on the page. */}
          <div className="flex items-center gap-2.5 py-4 pl-1 text-[13.5px]">
            <span className="live-dot" aria-hidden="true" />
            <time className="font-medium tabular-nums">{c.hero.clockOut}</time>
            <span className="text-muted">{c.hero.draftReady}</span>
          </div>

          {/* The draft: the one raised plane on the whole page. */}
          <div
            className="rounded-brand border border-rule bg-paper p-6 sm:p-7"
            style={{ boxShadow: '0 10px 30px -18px rgba(37, 29, 24, 0.35)' }}
          >
            <p className="text-[15.5px]">{c.hero.draft.greeting}</p>
            <p className="mt-3 text-[15.5px] leading-relaxed">{c.hero.draft.body}</p>
            <p className="mt-3 text-[15.5px] leading-relaxed opacity-85">{c.hero.draft.signoff}</p>
          </div>

          <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-3 text-[13.5px] text-muted">
            <span>{c.hero.exampleCaption}</span>
          </figcaption>

          <p className="mt-5 max-w-[52ch] text-[1.02rem] leading-relaxed">{c.hero.afterLine}</p>
        </figure>
      </div>
    </section>
  );
}
