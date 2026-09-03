import { useEffect, useRef, useState } from 'react';
import type { Content } from '../content/types';
import { Section } from './Section';

/**
 * The demo slot.
 *
 * No video file exists anywhere on this machine (see BLOCKED.md entry 2), so
 * this renders a labelled placeholder that reserves the exact 16:9 box. That is
 * the whole point: when Dovy drops the file at public/demo.mp4 the layout does
 * not move by a single pixel, because the box was always that size.
 *
 * The component probes for the file on mount and swaps itself. There is no
 * code change and no env var for Dovy to set.
 */
const VIDEO_SRC = '/demo.mp4';
const POSTER_SRC = '/demo-poster.jpg';

export function Demo({ c, onPlay }: { c: Content; onPlay: () => void }) {
  const [hasVideo, setHasVideo] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    let live = true;
    // HEAD rather than GET so a missing file costs nothing.
    fetch(VIDEO_SRC, { method: 'HEAD' })
      .then((res) => {
        const type = res.headers.get('content-type') ?? '';
        // A SPA rewrite answers unknown paths with index.html, so a 200 is not
        // enough on its own. The content type has to actually be a video.
        if (live && res.ok && type.startsWith('video')) setHasVideo(true);
      })
      .catch(() => {
        /* no file, keep the placeholder */
      });
    return () => {
      live = false;
    };
  }, []);

  const handlePlay = () => {
    if (fired.current) return;
    fired.current = true;
    onPlay();
  };

  return (
    <Section
      id="demo"
      n="02"
      title={c.demo.title}
      lead={c.demo.lead}
      rule={false}
      className="on-dark bg-charcoal text-warmwhite"
    >
      <div
        className="relative w-full overflow-hidden rounded-brand border border-rule-dark bg-card-dark"
        style={{ aspectRatio: '16 / 9' }}
      >
        {hasVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            controls
            preload="metadata"
            playsInline
            poster={POSTER_SRC}
            onPlay={handlePlay}
            aria-label={c.demo.playLabel}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 p-6 sm:p-8">
            <span
              aria-hidden="true"
              className="absolute left-6 top-6 h-2 w-2 rounded-full sm:left-8 sm:top-8"
              style={{ background: 'var(--color-amber-dark)' }}
            />
            <p className="text-[15px] font-medium">{c.demo.placeholderTitle}</p>
            <p className="max-w-[52ch] text-[14.5px] leading-relaxed text-muted-dark">
              {c.demo.placeholderBody}
            </p>
          </div>
        )}
      </div>
      <p className="mt-4 text-[13.5px] text-muted-dark">{c.demo.caption}</p>
    </Section>
  );
}
