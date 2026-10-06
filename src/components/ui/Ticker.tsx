"use client";

import { useEffect, useRef } from "react";

const TICKER_ITEMS = [
  "Construction",
  "Steel Plant",
  "Real Estate",
  "APM Groups of Company",
  "Wind Energy",
  "Plantation",
  "Textiles",
] as const;

// Repeated enough times per track to stay wider than the viewport on
// ultra-wide monitors, so the -50% loop never reveals a gap.
const TRACK_REPEATS = 4;

function TickerTrackContent() {
  return (
    <>
      {Array.from({ length: TRACK_REPEATS }).map((_, repeatIndex) => (
        <span key={repeatIndex} className="flex shrink-0 items-center">
          {TICKER_ITEMS.map((item, itemIndex) => (
            <span key={`${repeatIndex}-${itemIndex}`} className="flex shrink-0 items-center whitespace-nowrap">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-verdigris-300 sm:text-sm">
                {item}
              </span>
              <span className="mx-4 text-[10px] leading-none text-copper-500 sm:mx-6">•</span>
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

/** Per-frame easing toward the target playback rate; ~0.12 settles in ~350ms. */
const RATE_EASE = 0.12;

/**
 * Ticker band, the top edge of the About section. It has no surface of its
 * own: it sits on the section's green, so it reads as part of that section
 * rather than a strip laid on top of it. Two duplicated tracks sit side by side and the whole
 * pair translates by -50%, producing a seamless 45s loop with no JS-driven
 * positioning. The real content is exposed once via sr-only text; every
 * visual track is `aria-hidden` to avoid reading the brand list 8x over.
 *
 * Hover/focus/touch eases the CSS animation's playbackRate down to a stop
 * (and back up on release) instead of flipping animation-play-state, which
 * halts the strip dead mid-frame. The ramp runs on refs and the Web
 * Animations API, so it never touches React state or re-renders.
 */
export function Ticker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rate = useRef(1);
  const target = useRef(1);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const step = () => {
    const animation = trackRef.current?.getAnimations()[0];
    if (!animation) {
      frame.current = 0;
      return;
    }
    rate.current += (target.current - rate.current) * RATE_EASE;
    if (Math.abs(target.current - rate.current) < 0.005) rate.current = target.current;
    animation.updatePlaybackRate(rate.current);
    frame.current = rate.current === target.current ? 0 : requestAnimationFrame(step);
  };

  const setTarget = (next: number) => {
    target.current = next;
    if (!frame.current) frame.current = requestAnimationFrame(step);
  };

  const pause = () => setTarget(0);
  const resume = () => setTarget(1);

  return (
    <div
      className="relative h-[var(--ticker-h)] w-full"
      tabIndex={0}
      aria-label="APM Groups of Company operating divisions"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <span className="sr-only">{TICKER_ITEMS.join(", ")}</span>

      <div className="ticker-mask flex h-full items-center overflow-hidden">
        <div
          ref={trackRef}
          className="ticker-track flex w-max items-center"
          aria-hidden="true"
        >
          <span className="flex shrink-0 items-center">
            <TickerTrackContent />
          </span>
          <span className="flex shrink-0 items-center">
            <TickerTrackContent />
          </span>
        </div>
      </div>
    </div>
  );
}
