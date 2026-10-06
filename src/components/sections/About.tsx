"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  animate,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { FOUNDING_INTERESTS } from "@/lib/constants";
import { Ticker } from "@/components/ui/Ticker";

const HEADING_LINES = [
  { text: "Building Relationships", accent: false },
  { text: "With Great Chemistry", accent: true },
] as const;

const FOUNDING_YEAR = 1996;
const COUNT_FROM = 1900;

// Reveal choreography is CSS (see `.about-*` in globals.css); each element
// reads its stagger position from `--i`.
const slot = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Counts the milestone year up on reveal. The final value is in the server
 * HTML (SEO, no-JS, screen readers); the count only rewrites the text while
 * the numeral is still invisible, then runs through ~96 years in under two
 * seconds. Writes straight to the DOM node, so it never re-renders.
 */
function CountUp({ run, reduceMotion }: { run: boolean; reduceMotion: boolean | null }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !run || reduceMotion) return;

    node.textContent = String(COUNT_FROM);
    const controls = animate(COUNT_FROM, FOUNDING_YEAR, {
      duration: 1.8,
      delay: 0.3,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (value) => {
        node.textContent = String(Math.round(value));
      },
      onComplete: () => {
        node.textContent = String(FOUNDING_YEAR);
      },
    });
    return () => controls.stop();
  }, [run, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {FOUNDING_YEAR}
    </span>
  );
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  // Reveal once the section's top edge has crossed into the top 14% of the
  // viewport, i.e. it is fully on screen. An IntersectionObserver (not a
  // scroll listener) so a reload mid-page reveals immediately.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -86% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Ticker: fully there while the section is rising, gone by the time its top
  // edge reaches the top of the viewport. Scrubbed with scroll, so it
  // reappears the same way when scrolling back up.
  const { scrollYProgress: rise } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });
  const tickerOpacity = useTransform(rise, [0.78, 0.96], [1, 0]);
  useMotionValueEvent(rise, "change", (value) => {
    // Out of sight also means out of the tab order.
    if (tickerRef.current) tickerRef.current.inert = value > 0.96;
  });

  // Story rail: a copper line fills down the left edge as the story is read.
  // It must be able to reach 1 at the bottom of the page: with About as the
  // last section there is only ~350px of page below the story, so the story's
  // end can never rise above ~60% of a desktop viewport. Ending the range at
  // 85% keeps it reachable, and it completes as the last paragraph is on
  // screen. Revisit if the tail below the story shrinks.
  const { scrollYProgress: read } = useScroll({
    target: storyRef,
    offset: ["start 80%", "end 85%"],
  });
  const railFill = useTransform(read, [0, 1], [reduceMotion ? 1 : 0, 1]);

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-heading"
      data-revealed={revealed}
      className="relative z-10 -mt-[var(--ticker-h)] bg-verdigris-900 pb-24 pt-[calc(var(--ticker-h)+6rem)] lg:pb-36 lg:pt-[calc(var(--ticker-h)+9rem)]"
    >
      {/* Shadow the section casts onto the pinned hero as it slides over. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-ink-950/45 to-transparent"
      />

      <motion.div
        ref={tickerRef}
        style={{ opacity: tickerOpacity }}
        className="absolute inset-x-0 top-0 border-t border-verdigris-700/40"
      >
        <Ticker />
      </motion.div>

      <div className="site-container">
        <div className="max-w-4xl">
          <p
            style={slot(0)}
            className="about-item eyebrow text-verdigris-300"
          >
            About APM Groups
          </p>

          <h2
            id="about-heading"
            className="mt-5 font-display font-extrabold uppercase leading-[0.98] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 1.2rem + 3.8vw, 4.25rem)" }}
          >
            {HEADING_LINES.map((line, index) => (
              <span key={line.text} className="block overflow-hidden pb-1">
                <span
                  style={slot(index + 1)}
                  className={
                    line.accent
                      ? "about-line block text-copper-300"
                      : "about-line block text-paper-50"
                  }
                >
                  {line.text}
                </span>
              </span>
            ))}
          </h2>

          <p
            style={slot(3)}
            className="about-item mt-8 max-w-[56ch] font-body text-lg leading-relaxed text-paper-100/90 sm:text-xl"
          >
            APM Groups of Company offers diversified business interests across
            Wind Energy, Plantation, Textiles, Construction, Steel Plant and
            Real Estate.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-20">
          <div ref={storyRef} className="relative pl-7 md:pl-10 lg:col-span-7">
            <div
              aria-hidden="true"
              className="absolute bottom-1 left-0 top-1 w-px bg-verdigris-700"
            />
            <motion.div
              aria-hidden="true"
              style={{ scaleY: railFill }}
              className="absolute bottom-1 left-0 top-1 w-px origin-top bg-copper-300"
            />

            <div className="space-y-8">
              <p
                style={slot(4)}
                className="about-item font-body text-base leading-[1.75] text-paper-100/90 sm:text-lg"
              >
                APM Wind Energy and Plantation Pvt. Ltd. was established in{" "}
                {FOUNDING_YEAR} by Managing Director{" "}
                <strong className="font-semibold text-copper-300">
                  Mr. M. Micheal Selvakumar
                </strong>
                , who holds an M.Tech in Agricultural Engineering.
              </p>
              <p
                style={slot(5)}
                className="about-item font-body text-base leading-[1.75] text-paper-100/90 sm:text-lg"
              >
                With a vision to dream big and turn ideas into reality, Mr. M.
                Micheal Selvakumar built the company through determination,
                innovation and hard work.
              </p>
              <p
                style={slot(6)}
                className="about-item font-body text-base leading-[1.75] text-paper-100/90 sm:text-lg"
              >
                The company began its activities in agriculture and horticulture
                plantation, windmills, windmill services, and the sales of small
                and medium-sized wind generators. Over time, these foundations
                contributed to the development of APM Groups of Company as a
                diversified business group.
              </p>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <div
                style={slot(4)}
                className="about-item rounded-tick border border-verdigris-700 bg-verdigris-950/70 p-8 lg:p-10"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-verdigris-300">
                  Milestone Year
                </p>
                <p
                  aria-label={String(FOUNDING_YEAR)}
                  className="mt-6 font-display font-extrabold leading-none text-copper-300"
                  style={{ fontSize: "clamp(5.5rem, 3.5rem + 6.5vw, 9rem)" }}
                >
                  <CountUp run={revealed} reduceMotion={reduceMotion} />
                </p>
                <span
                  aria-hidden="true"
                  style={slot(8)}
                  className="about-draw mt-6 block h-px w-16 bg-copper-300"
                />
                <p className="mt-5 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-paper-50 sm:text-3xl">
                  Beginning of the APM Journey
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-20 lg:mt-28">
          <h3
            style={slot(7)}
            className="about-item font-display text-xl font-bold uppercase tracking-tight text-paper-50 sm:text-2xl"
          >
            Diversified Operations
          </h3>
          <ol className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {FOUNDING_INTERESTS.map((name, index) => (
              <li
                key={name}
                style={slot(8 + index)}
                className="about-item border-t border-verdigris-700 pt-4"
              >
                <span className="font-mono text-xs tracking-[0.18em] text-copper-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 block break-words font-display text-xl font-bold uppercase leading-tight tracking-tight text-paper-50 sm:text-2xl">
                  {name}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
