"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type RefObject } from "react";
import { useMotionValue, useScroll, type MotionValue } from "framer-motion";
import { DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

/**
 * Scroll distance, in px, over which the About section finishes rising over
 * the pinned hero: the same quantity as `--rise-distance` in design-tokens.css
 * (a calc() custom property reads back as an unresolved string, so it is
 * rebuilt from its parts here).
 */
export function getRiseDistance(): number {
  const root = getComputedStyle(document.documentElement);
  const ticker = parseFloat(root.getPropertyValue("--ticker-h")) || 0;
  const speed = parseFloat(root.getPropertyValue("--rise-speed")) || 1;
  return Math.max(1, (window.innerHeight - ticker) / speed);
}

/** True when the element is currently driven by a scroll-linked CSS animation. */
export function isStageAnimated(element: Element | null): boolean {
  return !!element && getComputedStyle(element).animationName.includes("stage-");
}

/**
 * Document scroll position at which the Contact panel has finished rising over
 * the pinned Gallery: its wrapper (`[data-rise-wrap]`, which is never
 * transformed) reaches the bottom of the viewport, then the panel climbs at
 * `--rise-speed` of scroll speed, so the rise lasts `innerHeight / speed`.
 * The same quantity as `--rise2-distance` in design-tokens.css.
 */
export function getContactRiseTarget(wrap: Element): number {
  const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rise-speed")) || 1;
  const distance = window.innerHeight / speed;
  return wrap.getBoundingClientRect().top + window.scrollY - window.innerHeight + distance;
}

/**
 * Click handler for in-page section links. About and Contact are held back by
 * scroll-linked transforms, so the browser's native anchor scroll (which aims
 * at where the section is *now*) lands short and the section never finishes
 * rising. For an animated section, scroll to the end of its rise instead;
 * every other link keeps native behaviour.
 */
export function handleSectionLinkClick(event: MouseEvent<HTMLElement>, href: string) {
  if (!href.startsWith("#")) return;
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = document.getElementById(href.slice(1));
  if (!target || !isStageAnimated(target)) return;

  const wrap = target.closest("[data-rise-wrap]");
  event.preventDefault();
  window.scrollTo({ top: wrap ? getContactRiseTarget(wrap) : getRiseDistance(), behavior: "smooth" });
  history.replaceState(null, "", href);
}

/**
 * A 0..1 motion value that follows how far an element has travelled through
 * the viewport, measured from its real on-screen box (so it stays right when
 * an ancestor is held back by a transform, which framer's `useScroll` target
 * offsets are not). `progress(rect, viewportHeight)` decides what 0 and 1
 * mean. Writes straight to a motion value, so scrolling never re-renders;
 * `initial` (the at-rest value) until measured, so server HTML and no-JS sit
 * at rest.
 */
export function useViewProgress<T extends Element>(
  progress: (rect: DOMRect, viewportHeight: number) => number,
  initial = 0.5,
): [RefObject<T | null>, MotionValue<number>] {
  const ref = useRef<T | null>(null);
  const value = useMotionValue(initial);
  const { scrollY } = useScroll();
  // Latest callback without re-subscribing to scroll each render.
  const compute = useRef(progress);
  compute.current = progress;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const next = compute.current(element.getBoundingClientRect(), window.innerHeight);
      value.set(Math.min(1, Math.max(0, next)));
    };
    update();
    const stop = scrollY.on("change", update);
    window.addEventListener("resize", update);
    return () => {
      stop();
      window.removeEventListener("resize", update);
    };
  }, [scrollY, value]);

  return [ref, value];
}

/**
 * True once the referenced block has entered the viewport (its top edge is
 * more than `bottomInset` up from the bottom of the screen), and stays true.
 * Used to reveal each block of a section as it arrives, rather than the whole
 * section at once, so content never sits invisible while it is already on
 * screen or plays out below the fold unseen. IntersectionObserver, so a
 * reload mid-page reveals whatever is already in view straight away.
 */
export function useRevealOnce<T extends Element>(
  bottomInset = "12%",
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { rootMargin: `0px 0px -${bottomInset} 0px` },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [bottomInset]);

  return [ref, revealed];
}

/**
 * Which section is on screen: the hash (`#about`) of the last listed section
 * that crosses a thin band just above the vertical middle of the viewport, or
 * null while the page is still above the first section (the hero, i.e. Home).
 * Sections that do not exist yet are skipped, so nav links can be listed ahead
 * of the sections being built. Once past the last section it holds that
 * section rather than falling back to Home.
 *
 * IntersectionObserver, not a scroll listener; state only changes when the
 * active section does.
 */
export function useScrollSpy(hrefs: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = hrefs
      .filter((href) => href.startsWith("#"))
      .map((href) => ({ href, el: document.getElementById(href.slice(1)) }))
      .filter((target): target is { href: string; el: HTMLElement } => target.el !== null);
    if (targets.length === 0) return;

    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const href = `#${entry.target.id}`;
          if (entry.isIntersecting) inBand.add(href);
          else inBand.delete(href);
        }
        const current = [...targets].reverse().find((target) => inBand.has(target.href))?.href;
        const aboveFirst = targets[0].el.getBoundingClientRect().top > window.innerHeight * 0.5;
        setActive((previous) => current ?? (aboveFirst ? null : previous));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    targets.forEach((target) => observer.observe(target.el));
    return () => observer.disconnect();
  }, [hrefs]);

  return active;
}

/**
 * Locks body scroll while `locked` is true. Used for the full-screen mobile
 * navigation overlay so the page behind it cannot scroll.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previousPaddingRight = style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    style.overflow = "hidden";
    if (scrollbarWidth > 0) style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      style.overflow = previousOverflow;
      style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Minimal, dependency-free focus trap for the mobile navigation dialog.
 * Moves focus into the container on open, cycles Tab/Shift+Tab within it,
 * closes on Escape, and restores focus to the trigger on close.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const firstFocusable = getFocusable()[0] ?? container;
    firstFocusable.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [active, containerRef, onClose]);
}

// The `data-theme` attribute on <html> is the single source of truth for the
// theme: CSS reads it directly (design-tokens.css) and React subscribes to it,
// so every light switch on the page stays in step without shared state.
const readTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** The active theme. The default on the server and the first client render. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, readTheme, () => DEFAULT_THEME);
}

/**
 * Switches theme. Where the View Transitions API exists the browser snapshots
 * the page and crossfades to the new one (see globals.css), which is smoother
 * than transitioning every element's colours and costs nothing per element;
 * elsewhere the change is simply instant.
 */
export function setTheme(next: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage blocked (private mode, site data off): the switch still works
    // for this visit, it just is not remembered.
  }
  const apply = () => {
    document.documentElement.dataset.theme = next;
  };
  if (typeof document.startViewTransition === "function") document.startViewTransition(apply);
  else apply();
}
