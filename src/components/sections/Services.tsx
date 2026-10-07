"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { Building2, Factory, HardHat, Shirt, Sprout, Store, Wind, type LucideIcon } from "lucide-react";
import { OPERATING_DIVISIONS, SERVICE_CAPABILITIES } from "@/lib/constants";
import { useRevealOnce } from "@/lib/hooks";

const HEADING_LINES = [
  { text: "Our Core", accent: false },
  { text: "Services", accent: true },
] as const;

// One icon per canonical division, in OPERATING_DIVISIONS order.
const SERVICE_ICONS: readonly LucideIcon[] = [Wind, Sprout, HardHat, Building2, Store, Shirt, Factory];

// Reveal choreography reuses the `.about-*` classes in globals.css: they are
// generic (hidden until an ancestor sets data-revealed), and each element
// reads its stagger position from `--i`.
const slot = (index: number) => ({ "--i": index }) as CSSProperties;

// Soft follow for the cursor light on the stage: decorative, so it trails
// the pointer with a little mass instead of being glued to it.
const SPOTLIGHT_SPRING = { stiffness: 140, damping: 22, mass: 0.6 };

export function Services() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [headerRef, headerRevealed] = useRevealOnce<HTMLDivElement>();
  const [stageRef, stageRevealed] = useRevealOnce<HTMLDivElement>();

  // Cursor light. Motion values drive the gradient directly, so tracking the
  // pointer never re-renders React.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const lightX = useSpring(pointerX, SPOTLIGHT_SPRING);
  const lightY = useSpring(pointerY, SPOTLIGHT_SPRING);
  const light = useMotionTemplate`radial-gradient(380px circle at ${lightX}px ${lightY}px, rgb(var(--copper-300) / 0.12), transparent 70%)`;

  const moveLight = (event: PointerEvent<HTMLDivElement>, snap: boolean) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointerX.set(x);
    pointerY.set(y);
    // On entry the light appears under the cursor instead of sliding in from
    // wherever it was last left.
    if (snap) {
      lightX.jump(x);
      lightY.jump(y);
    }
  };

  // On small screens the list is a horizontal strip; keep the selected chip
  // in view when it changes by keyboard or tap. A no-op on desktop, where the
  // list is vertical and never overflows sideways.
  const revealTab = (index: number) => {
    const list = listRef.current;
    const tab = tabRefs.current[index];
    if (!list || !tab || list.scrollWidth <= list.clientWidth + 1) return;
    // Bounding rects, not offsetLeft: each chip sits in a transformed wrapper,
    // which becomes its offsetParent.
    const tabLeft = tab.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    list.scrollTo({
      left: tabLeft - (list.clientWidth - tab.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const select = (index: number, { focus = false }: { focus?: boolean } = {}) => {
    setActive(index);
    revealTab(index);
    if (focus) tabRefs.current[index]?.focus();
  };

  // Tabs pattern: arrows move and select, Home/End jump, only the selected
  // tab is in the tab order.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = OPERATING_DIVISIONS.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next, { focus: true });
  };

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative bg-verdigris-900 pb-24 lg:pb-36"
    >
      <div className="site-container">
        <div ref={headerRef} data-revealed={headerRevealed}>
          {/* Draws once across the top: the seam between About and Services,
              which share one surface. */}
          <span
            aria-hidden="true"
            style={slot(0)}
            className="about-draw block h-px w-full bg-verdigris-700"
          />

          <h2
            id="services-heading"
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
            Comprehensive engineering, manufacturing, and commercial expertise
            driving enduring cross-sector growth.
          </p>
        </div>

        <div
          ref={stageRef}
          data-revealed={stageRevealed}
          className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-12 lg:items-stretch lg:gap-10 xl:gap-16"
        >
          {/* Index. A strip of chips on small screens, a column of large
              names from lg up. Hovering (mouse), focusing or tapping a name
              selects it. */}
          <div className="relative min-w-0 lg:col-span-5">
            <div
              ref={listRef}
              role="tablist"
              aria-label="Core services"
              className="relative -mx-[var(--site-gutter)] flex snap-x gap-2 overflow-x-auto px-[var(--site-gutter)] pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
            >
              {/* Rail and its copper mark. The mark is one element that
                  slides to the selected row (every row is 4.5rem tall). */}
              <div
                aria-hidden="true"
                style={slot(0)}
                className="about-item pointer-events-none absolute inset-y-0 left-0 hidden lg:block"
              >
                <span className="absolute inset-y-0 left-0 w-px bg-verdigris-700" />
                <span
                  className="service-mark absolute left-0 top-0 h-[4.5rem] w-0.5 bg-copper-500"
                  style={{ transform: `translateY(${active * 100}%)` }}
                />
              </div>

              {OPERATING_DIVISIONS.map((division, index) => {
                const selected = index === active;
                return (
                  <div
                    key={division.name}
                    role="presentation"
                    style={slot(index + 1)}
                    className="about-item shrink-0 snap-start lg:shrink"
                  >
                    <button
                      ref={(node) => {
                        tabRefs.current[index] = node;
                      }}
                      type="button"
                      role="tab"
                      id={`service-tab-${index}`}
                      aria-selected={selected}
                      aria-controls={`service-panel-${index}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => select(index)}
                      onKeyDown={(event) => onKeyDown(event, index)}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") select(index);
                      }}
                      className="group relative flex h-11 shrink-0 items-center whitespace-nowrap rounded-tick border border-verdigris-700 px-4 font-display text-lg font-extrabold uppercase leading-none tracking-tight text-paper-50/85 transition-[color,background-color,border-color,transform] duration-200 ease-engineered active:scale-[0.97] aria-selected:border-copper-600 aria-selected:bg-copper-600 aria-selected:text-ink-950 lg:h-[4.5rem] lg:w-full lg:gap-5 lg:rounded-none lg:border-0 lg:py-0 lg:pl-8 lg:pr-0 lg:text-4xl xl:text-[2.75rem] lg:text-paper-50/55 lg:active:scale-100 lg:aria-selected:bg-transparent lg:aria-selected:text-paper-50"
                    >
                      <span
                        aria-hidden="true"
                        className="hidden w-6 font-mono text-xs font-medium tracking-[0.18em] tabular-nums text-verdigris-300 transition-colors duration-200 ease-engineered group-aria-selected:text-copper-300 lg:inline"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="transition-transform duration-[420ms] ease-[cubic-bezier(0.25,1,0.5,1)] lg:group-aria-selected:translate-x-2">
                        {division.name}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage. */}
          <div
            style={slot(2)}
            onPointerEnter={(event) => moveLight(event, true)}
            onPointerMove={(event) => moveLight(event, false)}
            className="about-item group/stage relative flex flex-col overflow-hidden rounded-tick border border-verdigris-700 bg-verdigris-950/70 min-w-0 lg:col-span-7"
          >
            {!reduceMotion && (
              <motion.div
                aria-hidden="true"
                style={{ background: light }}
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-engineered group-hover/stage:opacity-100"
              />
            )}

            <div className="grid flex-1">
              {OPERATING_DIVISIONS.map((division, index) => {
                const Icon = SERVICE_ICONS[index];
                const capabilities = SERVICE_CAPABILITIES[division.name];
                const current = index === active;
                const position = index < active ? "before" : index > active ? "after" : "current";
                return (
                  <div
                    key={division.name}
                    id={`service-panel-${index}`}
                    role="tabpanel"
                    aria-labelledby={`service-tab-${index}`}
                    aria-hidden={!current}
                    inert={!current}
                    tabIndex={current ? 0 : undefined}
                    data-pos={position}
                    className="service-panel relative col-start-1 row-start-1 p-6 focus-visible:outline-offset-[-6px] sm:p-8 lg:p-12"
                  >
                    <span
                      aria-hidden="true"
                      className="service-glyph pointer-events-none absolute -bottom-3 right-4 select-none font-display text-[9rem] font-extrabold leading-none text-verdigris-700/35 sm:text-[11rem] lg:-bottom-6 lg:right-8 lg:text-[15rem]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="relative flex items-start justify-between gap-6">
                      <span className="service-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-tick border border-verdigris-700 bg-verdigris-900 text-copper-300">
                        <Icon size={26} strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <p
                        style={slot(0)}
                        className="service-item pt-1 text-right font-mono text-xs font-medium uppercase tracking-[0.18em] text-verdigris-300"
                      >
                        {division.tag}
                      </p>
                    </div>

                    <ul className="relative mt-10 grid gap-3 lg:mt-16 lg:gap-4">
                      {capabilities.map((capability, capabilityIndex) => (
                        <li
                          key={capability}
                          style={slot(capabilityIndex + 1)}
                          className="service-item flex items-start gap-4 font-display text-[1.65rem] font-bold uppercase leading-[1.1] tracking-tight text-paper-50 sm:text-3xl lg:text-[2.1rem]"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[0.55em] h-px w-5 shrink-0 bg-copper-300"
                          />
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
