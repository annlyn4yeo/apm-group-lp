"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Ticker } from "@/components/ui/Ticker";

const HEADLINE_LINES = [
  { text: "ONE GROUP.", accent: false },
  { text: "MULTIPLE INDUSTRIES.", accent: false },
  { text: "ONE VISION.", accent: true },
] as const;

// Restrained parallax range per the motion contract (8–24px), not a literal
// 0.92x-of-page-scroll translation — that would move the image hundreds of
// pixels on a long page, which DESIGN.md's motion tokens explicitly forbid.
// Positive: the photograph travels slower than the page, which is what reads
// as depth (the old negative range moved it faster than the page).
const PARALLAX_RANGE_PX = 24;

// Copy lifts away and fades over the first half of the hero's scroll, so the
// photograph is left alone as the section exits instead of text sliding
// across it.
const CONTENT_EXIT_PX = 56;

// Entrance stagger slot, consumed by `.hero-rise` / `.hero-line` in
// globals.css (delay = slot * 80ms + 80ms).
const slot = (index: number) => ({ "--i": index }) as CSSProperties;

function useIsDesktopViewport(minWidth = 1024) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [minWidth]);

  return isDesktop;
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktopViewport();
  const parallaxActive = isDesktop && !reduceMotion;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    parallaxActive ? [0, PARALLAX_RANGE_PX] : [0, 0],
  );
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], reduceMotion ? [1, 1] : [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], reduceMotion ? [0, 0] : [0, -CONTENT_EXIT_PX]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[max(100svh,640px)] flex-col overflow-hidden bg-ink-950"
    >
      {/* Scroll parallax on the outer layer, one-time settle on the inner
          one: separate elements so the CSS entrance and the scroll-linked
          transform never fight over the same `transform`. */}
      <motion.div
        className="absolute inset-0 -z-20 will-change-transform motion-reduce:!transform-none"
        style={{ y: parallaxY }}
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

        <div className="site-container pb-6 lg:pb-8">
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

        <Ticker />
      </div>
    </section>
  );
}
