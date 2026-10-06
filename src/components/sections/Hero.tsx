"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHeroExitProgress } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";

const HEADLINE_LINES = [
  { text: "ONE GROUP.", accent: false },
  { text: "MULTIPLE INDUSTRIES.", accent: false },
  { text: "ONE VISION.", accent: true },
] as const;

// The hero is pinned (sticky) while the About section slides up over it, so
// its own scroll position never changes. These layers are driven by
// `useHeroExitProgress` instead: 0 at the top of the page, 1 when About's top
// edge reaches the top of the viewport. Each layer moves at its own rate,
// which is where the depth comes from.
const IMAGE_SCALE_END = 1.1; // photograph pushes in slowly
const CONTENT_EXIT_Y = "-14%"; // copy drifts up far slower than the page
const DIM_END = 0.6; // ink veil deepens as the section covers it

// Entrance stagger slot, consumed by `.hero-rise` / `.hero-line` in
// globals.css (delay = slot * 80ms + 80ms).
const slot = (index: number) => ({ "--i": index }) as CSSProperties;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const progress = useHeroExitProgress();

  const imageScale = useTransform(progress, [0, 1], [1, reduceMotion ? 1 : IMAGE_SCALE_END]);
  const contentY = useTransform(progress, [0, 1], ["0%", reduceMotion ? "0%" : CONTENT_EXIT_Y]);
  const contentOpacity = useTransform(progress, [0, 0.6], [1, reduceMotion ? 1 : 0]);
  const dim = useTransform(progress, [0, 1], [0, reduceMotion ? 0 : DIM_END]);

  return (
    // Sticky: the hero stays put and the About section (z-10) slides up over
    // it, so the ticker at About's top edge "grows" into a full section.
    <section className="sticky top-0 z-0 isolate flex min-h-[max(100svh,640px)] flex-col overflow-hidden bg-ink-950">
      {/* Scroll scale on the outer layer, one-time settle on the inner one:
          separate elements so the CSS entrance and the scroll-linked
          transform never fight over the same `transform`. */}
      <motion.div
        className="absolute inset-0 -z-20 will-change-transform"
        style={{ scale: imageScale }}
      >
        <div className="hero-settle absolute inset-0">
          <Image
            src="/images/hero-wind-turbines-sunset.png"
            alt="Wind turbines across an open landscape at sunset, representing APM Groups of Company's wind energy division"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_50%]"
          />
        </div>
      </motion.div>

      {/* Ink veil that lifts off the photograph on load. It also masks the
          priority image decoding in, so the picture never pops. */}
      <div
        className="hero-veil pointer-events-none absolute inset-0 -z-[15] bg-ink-950"
        aria-hidden="true"
      />

      {/* Mobile: uniform 72% dark scrim for guaranteed contrast. */}
      <div
        className="absolute inset-0 -z-10 bg-ink-950/[0.72] lg:hidden"
        aria-hidden="true"
      />

      {/* Desktop: left-weighted radial gradient (82% left -> 25% right). */}
      <div
        className="absolute inset-0 -z-10 hidden lg:block"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 85% 120% at 16% 45%, rgba(21,19,14,0.84) 0%, rgba(21,19,14,0.56) 45%, rgba(21,19,14,0.26) 78%)",
        }}
      />

      {/* Deepens as the About section covers the hero: the layer being
          covered recedes, which is the depth cue that makes the overlap
          read as a surface sliding over another. */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 bg-ink-950"
        style={{ opacity: dim }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <motion.div
          className="flex flex-1 flex-col will-change-transform"
          style={{ opacity: contentOpacity, y: contentY }}
        >
        <div className="site-container grid flex-1 grid-cols-1 items-center gap-10 pt-20 pb-10 lg:grid-cols-12 lg:pt-24 lg:pb-14">
          <div className="col-span-1 lg:col-span-8">
            {/* No backdrop-blur here: a backdrop-filter on an element that is
                moving re-blurs the photograph every frame and re-rasterises
                when the move ends, which reads as a shimmer on landing. */}
            <div
              style={slot(0)}
              className="hero-rise inline-flex items-center gap-2 rounded-tick border border-copper-500/40 bg-ink-950/55 px-3 py-1.5"
            >
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-paper-50 sm:text-sm">
                Established 1996
              </span>
              <span aria-hidden="true" className="text-copper-500">
                •
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-copper-300 sm:text-sm">
                APM Groups of Company
              </span>
            </div>

            <h1
              className="mt-6 font-display font-extrabold uppercase leading-[0.98] tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 1.464rem + 4.42vw, 5rem)" }}
            >
              {HEADLINE_LINES.map((line, index) => (
                <span key={line.text} className="block overflow-hidden pb-1">
                  <span
                    style={slot(index + 1)}
                    className={cn(
                      "hero-line block",
                      line.accent ? "text-copper-500" : "text-paper-50",
                    )}
                  >
                    {line.text}
                  </span>
                </span>
              ))}
            </h1>

            {/* Horizon line: drawn once the headline has landed. */}
            <span
              style={slot(9)}
              aria-hidden="true"
              className="hero-draw horizon-line mt-6 block w-20 text-copper-500"
            />

            <p
              style={slot(4)}
              className="hero-rise mt-6 max-w-[56ch] font-body text-base leading-relaxed text-paper-100/90 sm:text-lg"
            >
              APM Groups of Company offers diversified business interests across
              Wind Energy, Plantation, Textiles, Construction, Steel Plant and
              Real Estate.
            </p>

            <div
              style={slot(5)}
              className="hero-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <Button
                href="#divisions"
                variant="primary"
                size="md"
                className="group w-full sm:w-auto"
              >
                Explore Our Businesses
                <span aria-hidden="true" className="cta-arrow inline-block">
                  →
                </span>
              </Button>
              <Button
                href="#about"
                variant="outline"
                size="md"
                className="w-full sm:w-auto"
              >
                Discover APM
              </Button>
            </div>
          </div>
        </div>
        </motion.div>

        {/* The ticker is no longer docked here: it is the top edge of the
            About section, which overlaps the bottom of the hero by exactly
            --ticker-h. Reserve that band so the cue clears it. */}
        <div className="site-container pb-[calc(var(--ticker-h)+1.5rem)] lg:pb-[calc(var(--ticker-h)+2rem)]">
          <div className="flex justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-50/70 sm:text-xs">
              Scroll to explore
              <span
                aria-hidden="true"
                className="animate-signal-pulse motion-reduce:animate-none"
              >
                ↓
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
