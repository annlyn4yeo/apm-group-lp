import type { Transition, Variants } from "framer-motion";

/** Strong ease-out — decisive, not the weak built-in CSS curve. */
export const engineeredEase = [0.16, 1, 0.3, 1] as const;

/**
 * Apple's fluid-interface default: critically damped (no overshoot),
 * settles quickly. Used for anything a user presses or that enters the
 * page. Springs (not fixed-duration tweens) because they stay
 * interruptible and animate from the live on-screen value if re-triggered.
 */
export const springSettle: Transition = { type: "spring", bounce: 0, duration: 0.4 };

/**
 * Reserved for genuinely gesture/momentum-driven moments (a flick, a drag
 * release) — not for static hovers or page-load reveals. None of this
 * phase's components are drag-driven yet; this exists for when one is.
 */
export const springMomentum: Transition = { type: "spring", bounce: 0.18, duration: 0.4 };

export const sectionReveal: Variants = {
  hidden: { opacity: 0, transform: "translateY(28px)" },
  visible: { opacity: 1, transform: "translateY(0px)", transition: { ...springSettle, duration: 0.6 } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, transform: "translateY(18px)" },
  visible: { opacity: 1, transform: "translateY(0px)", transition: springSettle },
};

export const textArrival: Variants = {
  hidden: { opacity: 0, transform: "translateY(22px)" },
  visible: { opacity: 1, transform: "translateY(0px)", transition: { ...springSettle, duration: 0.5 } },
};

export const hoverLift: Variants = {
  rest: { transform: "translateY(0px)", transition: { duration: 0.16, ease: engineeredEase } },
  hover: { transform: "translateY(-4px)", transition: { duration: 0.16, ease: engineeredEase } },
};

export const hairlineDraw: Variants = {
  hidden: { scaleX: 0, transformOrigin: "left" },
  visible: { scaleX: 1, transformOrigin: "left", transition: { duration: 0.8, ease: engineeredEase } },
};

/**
 * Masked line reveal: pairs with an `overflow-hidden` wrapper so the line
 * slides up from fully clipped to settled. Used for the hero headline's
 * line-by-line entrance.
 */
export const maskedLineReveal: Variants = {
  hidden: { transform: "translateY(100%)" },
  visible: { transform: "translateY(0%)", transition: { ...springSettle, duration: 0.5 } },
};

/**
 * Reduced-motion fallback: opacity only, no translation or scale. Swap in
 * for `staggerItem` / `maskedLineReveal` whenever `useReducedMotion()` is
 * true so entrances still register without triggering motion sickness.
 */
export const fadeRise: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: engineeredEase } },
};
