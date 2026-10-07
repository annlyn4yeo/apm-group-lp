"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { ACHIEVEMENTS } from "@/lib/constants";
import { useRevealOnce } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const HEADING_LINES = [
  { text: "Our", accent: false },
  { text: "Achievements", accent: true },
] as const;

const COUNT = ACHIEVEMENTS.length;
const LAST = COUNT - 1;

// Reveal choreography reuses the `.about-*` classes in globals.css; slide
// content uses `.award-*` (keyed to the slide's data-active). Each element
// reads its stagger position from `--i`.
const slot = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * The carousel has one source of truth: `pos`, the fractional slide index
 * (0 = first slide, 1 = second, 0.4 = a drag 40% of the way across). The
 * track, the parallax layers and the progress bars are all derived from it, so
 * they can never disagree, and a drag, a spring, a tab click and a keypress
 * are all just different ways of moving one number.
 */

// Critically damped (no overshoot), like every other settle on the page. The
// release velocity is handed to it, so a flick carries straight into the
// spring with no seam between dragging and animating.
const SETTLE = { type: "spring", bounce: 0, duration: 0.55 } as const;

// Pointer must travel this far before the gesture claims the pointer, so a
// click or a slightly shaky tap is never read as a drag.
const DRAG_THRESHOLD = 6;

// Apple's momentum projection: where a flick would come to rest if it simply
// decelerated (0.99 is the "snappy" rate). Input px/s, output px.
const DECELERATION = 0.99;
const project = (velocity: number) => ((velocity / 1000) * DECELERATION) / (1 - DECELERATION);

// Resistance past either end: the further you pull, the less it follows.
const rubberband = (overshoot: number, dimension: number, constant = 0.55) =>
  (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));

type DragState = {
  id: number;
  startX: number;
  startPos: number;
  startIndex: number;
  width: number;
  locked: boolean;
  samples: Array<{ t: number; pos: number }>;
};

/** One bar of the progress control. Fill is the slide's share of `pos`. */
function SegmentFill({ pos, index }: { pos: MotionValue<number>; index: number }) {
  const transform = useTransform(pos, (p) => `scaleX(${Math.max(0, 1 - Math.abs(p - index))})`);
  // The copper leaves a bar toward the side the carousel is travelling to and
  // enters the next from the side it arrives on, so it reads as one thing
  // passing from segment to segment.
  const transformOrigin = useTransform(pos, (p) => (p < index ? "0% 50%" : "100% 50%"));
  return (
    <motion.span
      aria-hidden="true"
      style={{ transform, transformOrigin }}
      className="absolute inset-0 bg-copper-500"
    />
  );
}

function Slide({
  item,
  index,
  pos,
  current,
  revealed,
}: {
  item: (typeof ACHIEVEMENTS)[number];
  index: number;
  pos: MotionValue<number>;
  current: boolean;
  revealed: boolean;
}) {
  // Signed distance from this slide: 0 when it is the one in view, +1 when it
  // has left to the left, -1 when it is waiting on the right.
  const rel = useTransform(pos, (p) => p - index);
  const opacity = useTransform(rel, (r) => Math.max(0, 1 - Math.abs(r) * 1.15));
  // Depth: the title travels a little faster than the slide and the body text
  // a little slower, so the layers separate as they pass.
  const titleShift = useTransform(rel, (r) => `translateX(${r * -8}%)`);
  const bodyShift = useTransform(rel, (r) => `translateX(${r * 22}%)`);
  const bodyOpacity = useTransform(rel, (r) => Math.max(0, 1 - Math.abs(r) * 2));

  return (
    <motion.div
      id={`achievement-panel-${index}`}
      role="tabpanel"
      aria-labelledby={`achievement-tab-${index}`}
      aria-hidden={!current}
      inert={!current}
      data-active={current && revealed}
      style={{ opacity, flex: `0 0 ${100 / COUNT}%` }}
      className="flex min-h-[26rem] min-w-0 flex-col p-6 sm:min-h-[28rem] sm:p-10 lg:min-h-[32rem] lg:p-16"
    >
      <motion.div style={{ transform: titleShift }}>
        <h3
          className="font-display font-extrabold uppercase leading-[0.98] tracking-tight"
          style={{ fontSize: "clamp(2.25rem, 0.9rem + 4.6vw, 5.5rem)" }}
        >
          {item.title.map((line, lineIndex) => (
            <span key={line} className="block overflow-hidden pb-1">
              <span
                style={slot(lineIndex)}
                className={cn(
                  "award-line block",
                  lineIndex === item.title.length - 1 ? "text-copper-300" : "text-paper-50",
                )}
              >
                {line}
              </span>
            </span>
          ))}
        </h3>
      </motion.div>

      <div className="mt-auto pt-14 lg:pt-20">
        {/* Copper lead-in, then the verdigris line carries on across. */}
        <span
          aria-hidden="true"
          style={{
            ...slot(2),
            backgroundImage:
              "linear-gradient(to right, var(--copper-300) 0 6rem, var(--verdigris-700) 6rem)",
          }}
          className="award-rule block h-px w-full"
        />
        <motion.div
          style={{ transform: bodyShift, opacity: bodyOpacity }}
          className="mt-6 grid gap-5 lg:grid-cols-12 lg:gap-10"
        >
          <p
            style={slot(3)}
            className="award-fade font-mono text-xs font-medium uppercase tracking-[0.18em] text-copper-300 lg:col-span-4 lg:pt-1.5"
          >
            {item.category}
          </p>
          <p
            style={slot(4)}
            className="award-fade max-w-[52ch] font-body text-lg leading-relaxed text-paper-100/90 sm:text-xl lg:col-span-7 lg:col-start-6"
          >
            {item.description}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Achievements() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const pos = useMotionValue(0);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const drag = useRef<DragState | null>(null);
  const touched = useRef(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [headerRef, headerRevealed] = useRevealOnce<HTMLDivElement>();
  const [stageRef, stageRevealed] = useRevealOnce<HTMLDivElement>();

  const trackTransform = useTransform(pos, (p) => `translateX(${(-p * 100) / COUNT}%)`);

  // Moves to a slide. Always animates from where the carousel is right now
  // (never from where it was heading) and carries whatever velocity it has, so
  // a tab click mid-flight redirects the motion instead of restarting it.
  const goTo = (index: number, velocity = pos.getVelocity()) => {
    touched.current = true;
    setActive(index);
    controls.current?.stop();
    controls.current = animate(pos, index, reduceMotion ? { duration: 0 } : { ...SETTLE, velocity });
  };

  // One-time hint that the slides can be dragged: after it arrives, the track
  // leans toward the next slide and settles back, showing a sliver of it.
  // Cancelled by any interaction, and skipped under reduced motion.
  useEffect(() => {
    if (!stageRevealed || reduceMotion) return;
    const timer = window.setTimeout(() => {
      if (touched.current || pos.get() !== 0) return;
      controls.current = animate(pos, [0, 0.045, 0], {
        duration: 1.1,
        times: [0, 0.35, 1],
        ease: [
          [0.23, 1, 0.32, 1],
          [0.77, 0, 0.175, 1],
        ],
      });
    }, 1600);
    return () => {
      window.clearTimeout(timer);
      if (!touched.current) controls.current?.stop();
    };
  }, [stageRevealed, reduceMotion, pos]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    touched.current = true;
    // Catch the carousel wherever it is mid-spring; the drag continues from
    // its on-screen position.
    controls.current?.stop();
    const current = pos.get();
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startPos: current,
      startIndex: Math.round(current),
      width: event.currentTarget.clientWidth,
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

    // 1:1 with the pointer, with progressive resistance past either end.
    let next = state.startPos - (event.clientX - state.startX) / state.width;
    if (next < 0) {
      next = -rubberband(-next * state.width, state.width) / state.width;
    } else if (next > LAST) {
      next = LAST + rubberband((next - LAST) * state.width, state.width) / state.width;
    }
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
    if (!state.locked) return;

    // Release velocity from the last ~100ms of movement, in slides per second.
    const first = state.samples[0];
    const last = state.samples[state.samples.length - 1];
    const seconds = (last.t - first.t) / 1000;
    const velocity = !cancelled && seconds > 0 ? (last.pos - first.pos) / seconds : 0;

    // Where the flick is heading, not where the finger let go. Never more
    // than one slide from where the gesture began.
    const projected = pos.get() + project(velocity * state.width) / state.width;
    const target = Math.min(
      Math.min(LAST, state.startIndex + 1),
      Math.max(Math.max(0, state.startIndex - 1), Math.round(projected)),
    );
    goTo(target, velocity);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = index === LAST ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = index === 0 ? LAST : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = LAST;
        break;
      default:
        return;
    }
    event.preventDefault();
    goTo(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      id="achievements"
      aria-labelledby="achievements-heading"
      className="relative bg-verdigris-900 pb-24 lg:pb-36"
    >
      <div className="site-container">
        <div ref={headerRef} data-revealed={headerRevealed}>
          {/* Same seam as above Services: both sit on the one green surface. */}
          <span
            aria-hidden="true"
            style={slot(0)}
            className="about-draw block h-px w-full bg-verdigris-700"
          />

          <h2
            id="achievements-heading"
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
            Honoring proven industry dedication and green revolution leadership.
          </p>
        </div>

        <div ref={stageRef} data-revealed={stageRevealed} className="mt-14 lg:mt-20">
          <div
            style={slot(0)}
            className="about-item overflow-hidden rounded-tick border border-verdigris-700 bg-verdigris-950/70"
          >
            {/* Gesture surface. `touch-pan-y`: the browser keeps vertical
                scrolling, this owns horizontal. */}
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(event) => endDrag(event, false)}
              onPointerCancel={(event) => endDrag(event, true)}
              className="cursor-grab touch-pan-y select-none overflow-hidden data-[dragging=true]:cursor-grabbing"
            >
              <motion.div
                style={{ transform: trackTransform, width: `${COUNT * 100}%` }}
                className="flex will-change-transform"
              >
                {ACHIEVEMENTS.map((item, index) => (
                  <Slide
                    key={item.label}
                    item={item}
                    index={index}
                    pos={pos}
                    current={index === active}
                    revealed={stageRevealed}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Progress and navigation in one: each bar is a tab, and the copper
              fill is driven by the same position as the track, so it moves
              with a drag, not after it. */}
          <div style={slot(1)} className="about-item mt-5 lg:mt-6">
            <div role="tablist" aria-label="Achievements" className="grid grid-cols-2 gap-4 lg:gap-8">
              {ACHIEVEMENTS.map((item, index) => (
                <button
                  key={item.label}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`achievement-tab-${index}`}
                  aria-selected={index === active}
                  aria-controls={`achievement-panel-${index}`}
                  tabIndex={index === active ? 0 : -1}
                  onClick={() => goTo(index)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className="group touch-manipulation select-none text-left transition-transform duration-150 ease-engineered active:scale-[0.98]"
                >
                  <span aria-hidden="true" className="relative block h-0.5 overflow-hidden bg-verdigris-700">
                    <SegmentFill pos={pos} index={index} />
                  </span>
                  <span className="mt-3 block pb-2 font-display text-lg font-bold uppercase leading-tight tracking-tight text-paper-50/55 transition-colors duration-200 ease-engineered hover:text-paper-50/85 group-aria-selected:text-paper-50 sm:text-2xl">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
