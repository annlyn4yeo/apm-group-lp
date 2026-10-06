"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useScroll, type MotionValue } from "framer-motion";

/**
 * 0 at the top of the page, 1 when the About section's top edge reaches the
 * top of the viewport (one viewport of scroll, minus the ticker band that is
 * already peeking in at load). Drives the hero's parallax while it is pinned
 * behind the section sliding over it.
 *
 * A motion value written from a scroll subscription, not React state: it
 * updates the DOM directly and never re-renders. Measured on mount so a page
 * restored mid-scroll starts at the right value.
 */
export function useHeroExitProgress(): MotionValue<number> {
  const { scrollY } = useScroll();
  const progress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const ticker = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--ticker-h"),
      );
      const distance = Math.max(1, window.innerHeight - (Number.isFinite(ticker) ? ticker : 0));
      progress.set(Math.min(1, Math.max(0, scrollY.get() / distance)));
    };

    update();
    const stop = scrollY.on("change", update);
    window.addEventListener("resize", update);
    return () => {
      stop();
      window.removeEventListener("resize", update);
    };
  }, [scrollY, progress]);

  return progress;
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
