"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GALLERY_ITEMS } from "@/lib/constants";
import { useRevealOnce } from "@/lib/hooks";

const HEADING_LINES = [
  { text: "Our", accent: false },
  { text: "Gallery", accent: true },
] as const;

const COUNT = GALLERY_ITEMS.length;

// Reveal choreography reuses the `.about-*` classes in globals.css; each
// element reads its stagger position from `--i`.
const slot = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * The carousel has one source of truth: `pos`, the fractional slide index. It
 * is unbounded: going past the last slide just keeps counting, and every slide
 * works out where it sits from `wrap(index - pos)`, its signed distance from
 * the leading edge in slides (0 = leading, 1 = next to it, -1 = just left).
 * Nothing is cloned and nothing jumps, so the loop is seamless in either
 * direction and a drag, a spring, an arrow, a dot and a key are all just
 * different ways of moving one number.
 */

// Shortest signed distance on the loop, in -COUNT/2..COUNT/2.
const wrap = (value: number) => value - COUNT * Math.round(value / COUNT);
const mod = (value: number) => ((value % COUNT) + COUNT) % COUNT;

// Critically damped (no overshoot), like every other settle on the page. The
// release velocity is handed to it, so a flick carries straight into the
// spring with no seam between dragging and animating.
const SETTLE = { type: "spring", bounce: 0, duration: 0.6 } as const;

// Pointer must travel this far before the gesture claims the pointer, so a
// click or a slightly shaky tap is never read as a drag.
const DRAG_THRESHOLD = 6;
// A flick may carry at most this many slides past where the drag began.
const MAX_FLICK = 2;

// Apple's momentum projection: where a flick would come to rest if it simply
// decelerated (0.99 is the "snappy" rate). Input px/s, output px.
const DECELERATION = 0.99;
const project = (velocity: number) => ((velocity / 1000) * DECELERATION) / (1 - DECELERATION);

/**
 * How "in focus" a slide is for a given distance: 1 inside the focus window
 * (`span` slides, starting at the leading edge), fading to a dim peek one slide
 * either side of it and to nothing past that.
 */
const focusOf = (distance: number, span: number) => {
  const last = span - 1;
  const value =
    distance < 0 ? 1 + distance * 0.75 : distance > last ? 1 - (distance - last) * 0.75 : 1;
  return Math.min(1, Math.max(0, value));
};

type DragState = {
  id: number;
  startX: number;
  startPos: number;
  startIndex: number;
  step: number;
  locked: boolean;
  samples: Array<{ t: number; pos: number }>;
};

/** One square dot. Its fill is the slide's share of `pos`, so it moves with a drag. */
function Dot({
  pos,
  index,
  onSelect,
}: {
  pos: MotionValue<number>;
  index: number;
  onSelect: (index: number) => void;
}) {
  const fill = useTransform(pos, (p) => Math.max(0, 1 - Math.abs(wrap(index - p))));
  const scale = useTransform(fill, (f) => 1 + f * 0.4);
  const item = GALLERY_ITEMS[index];
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Show slide ${index + 1} of ${COUNT}: ${item.caption}`}
      className="group flex h-6 w-6 touch-manipulation items-center justify-center"
    >
      <motion.span
        aria-hidden="true"
        style={{ scale }}
        className="relative block h-2 w-2 rounded-tick bg-verdigris-700 transition-colors duration-200 ease-engineered group-hover:bg-verdigris-300"
      >
        <motion.span
          style={{ opacity: fill }}
          className="absolute inset-0 rounded-tick bg-copper-300"
        />
      </motion.span>
    </button>
  );
}

function Slide({
  index,
  pos,
  span,
  inFocus,
}: {
  index: number;
  pos: MotionValue<number>;
  span: MotionValue<number>;
  inFocus: boolean;
}) {
  const item = GALLERY_ITEMS[index];
  const distance = useTransform(pos, (p) => wrap(index - p));
  const opacity = useTransform([distance, span], ([d, s]: number[]) => focusOf(d, s));
  // Full string, not the x shorthand: stays on the compositor. The translate is
  // in the slide's own width (plus the gap), so it needs no measuring.
  const transform = useTransform(
    [distance, span],
    ([d, s]: number[]) =>
      `translateX(calc(${d} * (100% + var(--gap)))) scale(${0.94 + 0.06 * focusOf(d, s)})`,
  );

  return (
    <motion.figure
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${COUNT}`}
      aria-hidden={!inFocus}
      style={{ transform, opacity }}
      className="absolute left-0 top-0 m-0 w-[var(--slide-w)] will-change-transform"
    >
      <div className="group/image relative aspect-[4/5] overflow-hidden rounded-tick border border-verdigris-700 bg-verdigris-950 sm:aspect-[4/3]">
        <Image
          src={item.src}
          alt={item.caption}
          fill
          unoptimized
          draggable={false}
          sizes="(min-width: 1024px) 520px, 80vw"
          className="select-none object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/image:scale-[1.03]"
        />
        {/* Verdigris wash: pulls any photograph toward the page's palette, so
            placeholders and later real photography both sit in the same light. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-verdigris-900/30 mix-blend-multiply"
        />
      </div>

      <figcaption className="mt-5 h-[3.5rem]">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-copper-300">
          {item.category}
        </p>
        <p className="mt-2 font-display text-xl font-bold uppercase leading-[1.1] tracking-tight text-paper-50 sm:text-2xl">
          {item.caption}
        </p>
      </figcaption>
    </motion.figure>
  );
}

export function Gallery() {
  const [active, setActive] = useState(0);
  const [wide, setWide] = useState(false);
  const reduceMotion = useReducedMotion();

  const pos = useMotionValue(0);
  // Slides in full focus at once: two from lg up, one below.
  const span = useMotionValue(1);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const target = useRef(0);
  const drag = useRef<DragState | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [headerRef, headerRevealed] = useRevealOnce<HTMLDivElement>();
  const [stageRef, stageRevealed] = useRevealOnce<HTMLDivElement>();

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setWide(query.matches);
      span.set(query.matches ? 2 : 1);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [span]);

  // Moves to a slide (an unbounded integer position). Always animates from
  // where the carousel is right now, never from where it was heading, and
  // carries whatever velocity it has, so a click mid-flight redirects the
  // motion instead of restarting it.
  const goTo = (next: number, velocity = pos.getVelocity()) => {
    target.current = next;
    setActive(mod(next));
    controls.current?.stop();
    controls.current = animate(pos, next, reduceMotion ? { duration: 0 } : { ...SETTLE, velocity });
  };

  const step = (direction: 1 | -1) => goTo(target.current + direction);

  // A dot goes the short way round the loop.
  const selectDot = (index: number) => goTo(target.current + wrap(index - target.current));

  // Distance between two neighbouring slides, in px: slide width plus the gap.
  const stepSize = () => {
    const viewport = viewportRef.current;
    const slide = viewport?.querySelector<HTMLElement>("figure");
    if (!viewport || !slide) return 1;
    const gap = parseFloat(getComputedStyle(viewport).getPropertyValue("--gap")) || 0;
    return slide.offsetWidth + gap;
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Catch the carousel wherever it is mid-spring; the drag continues from
    // its on-screen position.
    controls.current?.stop();
    const current = pos.get();
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startPos: current,
      startIndex: Math.round(current),
      step: stepSize(),
      locked: false,
      samples: [{ t: performance.now(), pos: current }],
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || event.pointerId !== state.id) return;

    if (!state.locked) {
      if (Math.abs(event.clientX - state.startX) < DRAG_THRESHOLD) return;
      // Claim the pointer and start tracking from here, so the carousel does
      // not jump by the threshold distance.
      state.locked = true;
      state.startX = event.clientX;
      state.startPos = pos.get();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // The pointer already ended (a cancelled touch); the drag still tracks.
      }
      event.currentTarget.dataset.dragging = "true";
    }

    // 1:1 with the pointer. The loop has no ends, so there is no resistance.
    const next = state.startPos - (event.clientX - state.startX) / state.step;
    pos.set(next);

    const now = performance.now();
    state.samples.push({ t: now, pos: next });
    while (state.samples.length > 2 && now - state.samples[0].t > 100) state.samples.shift();
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const state = drag.current;
    if (!state || event.pointerId !== state.id) return;
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
    if (!state.locked) {
      // Nothing was claimed; the spring was only stopped, so let it finish.
      goTo(target.current);
      return;
    }

    // Release velocity from the last ~100ms of movement, in slides per second.
    const first = state.samples[0];
    const last = state.samples[state.samples.length - 1];
    const seconds = (last.t - first.t) / 1000;
    const velocity = !cancelled && seconds > 0 ? (last.pos - first.pos) / seconds : 0;

    // Where the flick is heading, not where the finger let go.
    const projected = pos.get() + project(velocity * state.step) / state.step;
    const landing = Math.min(
      state.startIndex + MAX_FLICK,
      Math.max(state.startIndex - MAX_FLICK, Math.round(projected)),
    );
    goTo(landing, velocity);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  const spanNow = wide ? 2 : 1;
  const current = GALLERY_ITEMS[active];

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="relative bg-verdigris-900 pb-24 lg:pb-36"
    >
      <div className="site-container">
        <div ref={headerRef} data-revealed={headerRevealed}>
          {/* Same seam as above Services, Achievements and Our Business: all of
              them sit on the one green surface. */}
          <span
            aria-hidden="true"
            style={slot(0)}
            className="about-draw block h-px w-full bg-verdigris-700"
          />

          <h2
            id="gallery-heading"
            className="mt-14 font-display font-extrabold uppercase leading-[0.98] tracking-tight lg:mt-20"
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
            className="about-item mt-8 max-w-[52ch] font-body text-lg leading-relaxed text-paper-100/90 sm:text-xl"
          >
            A glimpse into our cross-industry footprint, assets, and infrastructure.
          </p>
        </div>

        <div
          ref={stageRef}
          data-revealed={stageRevealed}
          role="region"
          aria-roledescription="carousel"
          aria-label="Gallery"
          onKeyDown={onKeyDown}
          className="mt-14 lg:mt-20"
        >
          <div style={slot(0)} className="about-item">
            {/* Gesture surface. `touch-pan-y`: the browser keeps vertical
                scrolling, this owns horizontal. The viewport clips the loop at
                the container edge; the dim slide at the right is the next one
                waiting. Slide width is chosen so that `span` slides sit in full
                focus and a quarter of the next one shows. */}
            <div
              ref={viewportRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(event) => endDrag(event, false)}
              onPointerCancel={(event) => endDrag(event, true)}
              className="relative cursor-grab touch-pan-y select-none overflow-hidden [--gap:16px] [--slide-w:calc((100%-var(--gap))/1.25)] data-[dragging=true]:cursor-grabbing lg:[--gap:24px] lg:[--slide-w:calc((100%-2*var(--gap))/2.25)]"
            >
              {/* Holds the carousel's height: the slides are all absolutely
                  placed, so this invisible copy of one is what sizes it. */}
              <div aria-hidden="true" className="invisible w-[var(--slide-w)]">
                <div className="aspect-[4/5] sm:aspect-[4/3]" />
                <div className="mt-5 h-[3.5rem]" />
              </div>

              {GALLERY_ITEMS.map((item, index) => (
                <Slide
                  key={item.caption}
                  index={index}
                  pos={pos}
                  span={span}
                  inFocus={mod(index - active) < spanNow}
                />
              ))}
            </div>
          </div>

          <div
            style={slot(1)}
            className="about-item mt-8 flex items-center justify-between gap-6 lg:mt-10"
          >
            <div role="group" aria-label="Choose a slide" className="-ml-1 flex flex-wrap items-center">
              {GALLERY_ITEMS.map((item, index) => (
                <Dot key={item.caption} pos={pos} index={index} onSelect={selectDot} />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous slide"
                className="group flex h-11 w-11 touch-manipulation items-center justify-center rounded-tick border border-verdigris-700 text-paper-50 transition-[color,border-color,transform] duration-150 ease-engineered hover:border-copper-300 hover:text-copper-300 active:scale-[0.96]"
              >
                <ArrowLeft
                  size={20}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="transition-transform duration-150 ease-engineered group-hover:-translate-x-0.5"
                />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next slide"
                className="group flex h-11 w-11 touch-manipulation items-center justify-center rounded-tick border border-verdigris-700 text-paper-50 transition-[color,border-color,transform] duration-150 ease-engineered hover:border-copper-300 hover:text-copper-300 active:scale-[0.96]"
              >
                <ArrowRight
                  size={20}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="transition-transform duration-150 ease-engineered group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {`${current.caption}, slide ${active + 1} of ${COUNT}`}
          </p>
        </div>
      </div>
    </section>
  );
}
