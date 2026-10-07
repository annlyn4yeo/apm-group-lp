"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Holds the last section before the Contact panel (the Gallery) in place while
 * the panel rises over it, the way the hero is held while About rises.
 *
 * The section is taller than the viewport, so pinning its top would leave its
 * lower half permanently covered. It is pinned by its bottom edge instead:
 * `top = viewportHeight - height`, so it scrolls normally until its bottom
 * reaches the bottom of the viewport and is held there. That is exactly the
 * moment the panel's wrapper starts entering, so the two line up. The offset
 * is re-measured on resize only, never on scroll. Before it is measured the
 * wrapper has no `top`, which makes `sticky` a no-op, so it stays in plain flow.
 *
 * The `stage2-*` layers are scroll-driven CSS animations (see globals.css):
 * the content drifts up and settles back as it is covered and a veil deepens,
 * so the section being covered recedes.
 */
export function PinnedTail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const sync = () => {
      const viewport = document.documentElement.clientHeight;
      element.style.top = `${viewport - element.offsetHeight}px`;
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      element.style.top = "";
    };
  }, []);

  return (
    <div ref={ref} className="sticky z-0 isolate bg-verdigris-900">
      <div className="stage2-content">{children}</div>
      <div
        aria-hidden="true"
        className="stage2-dim pointer-events-none absolute inset-0 bg-verdigris-950 opacity-0"
      />
    </div>
  );
}
