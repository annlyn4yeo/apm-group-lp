"use client";

import { useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";

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
 * Click handler for in-page section links. About is held back by a scroll-
 * linked transform, so the browser's native anchor scroll (which aims at
 * where About is *now*) lands short and the section never finishes rising.
 * When About is animated, scroll to the end of its rise instead; every other
 * link keeps native behaviour.
 */
export function handleSectionLinkClick(event: MouseEvent<HTMLElement>, href: string) {
  if (!href.startsWith("#")) return;
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = document.getElementById(href.slice(1));
  if (!target || !isStageAnimated(target)) return;

  event.preventDefault();
  window.scrollTo({ top: getRiseDistance(), behavior: "smooth" });
  history.replaceState(null, "", href);
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
