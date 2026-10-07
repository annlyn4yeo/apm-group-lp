"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BUSINESS_DETAILS, OPERATING_DIVISIONS } from "@/lib/constants";
import { useRevealOnce } from "@/lib/hooks";

const HEADING_LINES = [
  { text: "Our", accent: false },
  { text: "Businesses", accent: true },
] as const;

const COUNT = OPERATING_DIVISIONS.length;
const LAST = COUNT - 1;

// One material per plate, in OPERATING_DIVISIONS order. Each is a drafting
// convention for its trade (see `.biz-pattern-*` in globals.css). Written out
// in full, not built from a template string, so Tailwind's content scan keeps
// the classes.
const PATTERN_CLASSES = [
  "biz-pattern-wind",
  "biz-pattern-plantation",
  "biz-pattern-construction",
  "biz-pattern-estate",
  "biz-pattern-plaza",
  "biz-pattern-textiles",
  "biz-pattern-steels",
] as const;

// Height of a plate's text block (description and CTA), and of the same block
// when it also carries product chips. Fixed, so the division name can travel
// a known distance from the foot of the plate to just above this block.
const BODY_HEIGHT = "11rem";
const BODY_HEIGHT_WITH_CHIPS = "15rem";

// Reveal choreography reuses the `.about-*` classes in globals.css; each
// element reads its stagger position from `--i`. Inside a plate, `.biz-item`
// does the same keyed to the plate's data-active.
const slot = (index: number) => ({ "--i": index }) as CSSProperties;

export function Business() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const plateRefs = useRef<Array<HTMLLIElement | null>>([]);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const settleTimer = useRef<number | undefined>(undefined);

  const [headerRef, headerRevealed] = useRevealOnce<HTMLDivElement>();
  const [stageRef, stageRevealed] = useRevealOnce<HTMLDivElement>();

  // Nothing is open until the rail is on screen: it arrives with seven equal
  // plates and the first one opens as it comes into view.
  const open = stageRevealed ? active : -1;
  const columns = OPERATING_DIVISIONS.map((_, index) => (index === open ? "5fr" : "1fr")).join(" ");

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const select = (index: number, { settle = false }: { settle?: boolean } = {}) => {
    if (index === active) return;
    setActive(index);
    if (!settle) return;

    // Stacked layout only: the plate above collapses as this one opens, which
    // can carry its header up under the navbar. Once the move has finished,
    // bring it back into view.
    window.clearTimeout(settleTimer.current);
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    settleTimer.current = window.setTimeout(() => {
      const plate = plateRefs.current[index];
      if (!plate || plate.getBoundingClientRect().top >= 80) return;
      plate.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    }, 540);
  };

  // Accordion keys: arrows and Home/End move between plates. Focus opens the
  // plate it lands on, so the arrow keys never need a second "select" step.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = index === LAST ? 0 : index + 1;
        break;
      case "ArrowUp":
      case "ArrowLeft":
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
    buttonRefs.current[next]?.focus();
  };

  return (
    <section
      id="divisions"
      aria-labelledby="divisions-heading"
      className="relative bg-verdigris-900 pb-24 lg:pb-36"
    >
      <div className="site-container">
        <div ref={headerRef} data-revealed={headerRevealed}>
          {/* Same seam as above Services and Achievements: all of them sit on
              the one green surface. */}
          <span
            aria-hidden="true"
            style={slot(0)}
            className="about-draw block h-px w-full bg-verdigris-700"
          />

          <h2
            id="divisions-heading"
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
            Diverse businesses. Shared vision. Specialized operating subsidiaries.
          </p>

          {/* The copper tick is the same mark the capability lines use in
              Services, so the count carries the page's own motif. */}
          <p
            style={slot(4)}
            className="about-item mt-6 flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.18em] text-verdigris-300"
          >
            <span aria-hidden="true" className="h-px w-6 bg-copper-300" />
            {COUNT} Active Operating Divisions
          </p>
        </div>

        <div ref={stageRef} data-revealed={stageRevealed} className="mt-14 lg:mt-20">
          <div style={slot(0)} className="about-item">
            {/* The rail. The hairlines between plates are the rail's own
                background showing through a 1px gap. On lg the columns are
                one custom property, so opening a plate is a single
                transition on the grid and every plate follows it. */}
            <ol
              style={{ "--biz-cols": columns } as CSSProperties}
              className="biz-rail grid grid-cols-1 gap-px overflow-hidden rounded-tick border border-verdigris-700 bg-verdigris-700 lg:h-[34rem] lg:grid-rows-1 lg:[grid-template-columns:var(--biz-cols)] xl:h-[36rem]"
            >
              {OPERATING_DIVISIONS.map((division, index) => {
                const details = BUSINESS_DETAILS[division.name];
                const isOpen = index === open;
                const prefix = division.name.split(" ")[0];
                const title = division.name.slice(prefix.length + 1);
                const bodyHeight = details.products ? BODY_HEIGHT_WITH_CHIPS : BODY_HEIGHT;

                return (
                  <li
                    key={division.name}
                    ref={(node) => {
                      plateRefs.current[index] = node;
                    }}
                    data-active={isOpen}
                    style={{ "--biz-body-h": bodyHeight } as CSSProperties}
                    onClick={() => select(index, { settle: true })}
                    onPointerEnter={(event: PointerEvent<HTMLLIElement>) => {
                      if (event.pointerType === "mouse") select(index);
                    }}
                    className="biz-plate"
                  >
                    <div aria-hidden="true" className={`biz-material ${PATTERN_CLASSES[index]}`} />
                    <div aria-hidden="true" className="biz-wash" />

                    <span aria-hidden="true" className="biz-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* One element, two postures: a label standing on the
                        foot of a closed plate, the headline of an open one. */}
                    <h3 className="biz-name">
                      <button
                        ref={(node) => {
                          buttonRefs.current[index] = node;
                        }}
                        type="button"
                        id={`biz-tab-${index}`}
                        aria-expanded={isOpen}
                        aria-controls={`biz-panel-${index}`}
                        onFocus={() => select(index)}
                        onKeyDown={(event) => onKeyDown(event, index)}
                        className="block cursor-pointer text-left uppercase"
                      >
                        <span className="text-copper-300">{prefix}</span> {title}
                      </button>
                    </h3>

                    <span aria-hidden="true" className="biz-toggle">
                      <ChevronRight size={20} strokeWidth={1.5} />
                    </span>

                    <div
                      id={`biz-panel-${index}`}
                      role="region"
                      aria-labelledby={`biz-tab-${index}`}
                      aria-hidden={!isOpen}
                      inert={!isOpen}
                      className="biz-panel"
                    >
                      <div className="biz-panel-inner">
                        {/* The sector, drawn as a dimension line: ticks at
                            both ends, the label set into the line. */}
                        <div className="biz-dim">
                          <span aria-hidden="true" className="biz-dim-tick" />
                          <span aria-hidden="true" className="biz-dim-line biz-dim-line-l" />
                          <span className="biz-dim-label">
                            <span>{division.tag}</span>
                          </span>
                          <span aria-hidden="true" className="biz-dim-line biz-dim-line-r" />
                          <span aria-hidden="true" className="biz-dim-tick" />
                        </div>

                        <div className="biz-body">
                          <p
                            style={slot(0)}
                            className="biz-item font-body text-base leading-relaxed text-paper-100/90"
                          >
                            {details.description}
                          </p>

                          {details.products && (
                            <ul style={slot(1)} className="biz-item biz-chips">
                              {details.products.map((product) => (
                                <li key={product}>{product}</li>
                              ))}
                            </ul>
                          )}

                          <div style={slot(details.products ? 2 : 1)} className="biz-item biz-cta">
                            {/* TODO: division pages are not built yet, so
                                this does nothing for now. */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="group"
                              aria-label={`View Business: ${division.name}`}
                            >
                              View Business
                              <span aria-hidden="true" className="cta-arrow inline-block">
                                →
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
