"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import {
  fadeRise,
  maskedLineReveal,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";
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
const PARALLAX_RANGE_PX = 18;

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
    parallaxActive ? [0, -PARALLAX_RANGE_PX] : [0, 0],
  );

  // Desktop/no-preference: masked line reveal + translateY stagger, both
  // spring-driven. Reduced motion: opacity-only, no transform.
  const itemVariant = reduceMotion ? fadeRise : staggerItem;
  const lineVariant = reduceMotion ? fadeRise : maskedLineReveal;

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[max(100svh,640px)] flex-col overflow-hidden bg-ink-950"
    >
      <motion.div
        className="absolute inset-0 -z-20 motion-reduce:!transform-none"
        style={{ y: parallaxY }}
      >
        <Image
          src="/images/hero-wind-turbines-sunset.png"
          alt="Wind turbines across an open landscape at sunset, representing APM Groups of Company's wind energy division"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_50%]"
        />
      </motion.div>

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
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="site-container grid flex-1 grid-cols-1 items-center gap-10 pt-20 pb-10 lg:grid-cols-12 lg:pt-24 lg:pb-14"
        >
          <div className="col-span-1 lg:col-span-8">
            <motion.div
              variants={itemVariant}
              className="inline-flex items-center gap-2 rounded-tick border border-copper-500/40 bg-ink-950/40 px-3 py-1.5 backdrop-blur-sm"
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
            </motion.div>

            <motion.h1
              variants={staggerContainer}
              className="mt-6 font-display font-extrabold uppercase leading-[0.98] tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 1.464rem + 4.42vw, 5rem)" }}
            >
              {HEADLINE_LINES.map((line) => (
                <span key={line.text} className="block overflow-hidden pb-1">
                  <motion.span
                    variants={lineVariant}
                    className={cn(
                      "block",
                      line.accent ? "text-copper-500" : "text-paper-50",
                    )}
                  >
                    {line.text}
                  </motion.span>
                </span>
              ))}
            </motion.h1>

            <motion.p
              variants={itemVariant}
              className="mt-6 max-w-[56ch] font-body text-base leading-relaxed text-paper-100/90 sm:text-lg"
            >
              APM Groups of Company offers diversified business interests across
              Wind Energy, Plantation, Textiles, Construction, Steel Plant and
              Real Estate.
            </motion.p>

            <motion.div
              variants={itemVariant}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
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
            </motion.div>
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
