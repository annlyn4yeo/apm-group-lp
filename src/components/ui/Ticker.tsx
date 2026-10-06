"use client";

import { useState } from "react";

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

/**
 * Docked base ticker. Two duplicated tracks sit side by side and the whole
 * pair translates by -50%, producing a seamless 45s loop with no JS-driven
 * positioning. The real content is exposed once via sr-only text; every
 * visual track is `aria-hidden` to avoid reading the brand list 8x over.
 */
export function Ticker() {
  const [paused, setPaused] = useState(false);

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <div
      className="relative w-full overflow-hidden border-t border-verdigris-700/40 bg-verdigris-900"
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

      <div
        className="ticker-track flex w-max items-center py-2.5 sm:py-3"
        style={{ animationPlayState: paused ? "paused" : "running" }}
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
  );
}
