"use client";

import { cn } from "@/lib/utils";
import { setTheme, useTheme } from "@/lib/hooks";

/**
 * Light switch, drawn as the power rocker on a piece of plant: a square-cut
 * track, a copper knob, and the standard I / O marks (O is off, I is on, so
 * lights on is light mode). Like everything here it has 2px corners, never a
 * pill.
 *
 * The picture is driven by CSS off `<html data-theme>` (see `.theme-switch-*`
 * in globals.css), not by React state, so it is always in step with the page
 * it sits on, even halfway through the page crossfade. React only supplies the
 * accessible state.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const light = useTheme() === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      aria-label="Light mode"
      onClick={() => setTheme(light ? "dark" : "light")}
      // The button is the 44px hit area; only the track is drawn.
      className={cn(
        "theme-switch group flex h-11 w-[58px] shrink-0 touch-manipulation items-center justify-center focus-visible:outline-none",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="theme-switch-track relative block h-[26px] w-[50px] rounded-tick border border-verdigris-700 bg-verdigris-950/70 transition-[border-color,transform] duration-direct ease-engineered group-hover:border-copper-300 group-active:scale-[0.97] group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-copper-500"
      >
        <span className="theme-switch-knob absolute left-[3px] top-[3px] flex h-[18px] w-[18px] items-center justify-center rounded-[1px] bg-copper-500">
          {/* O: a ring. */}
          <span className="theme-switch-off absolute h-2 w-2 rounded-full border-[1.5px] border-ink-950" />
          {/* I: a bar. */}
          <span className="theme-switch-on absolute h-2.5 w-0.5 bg-ink-950" />
        </span>
      </span>
    </button>
  );
}
