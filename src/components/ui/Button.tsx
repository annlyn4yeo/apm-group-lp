"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { springSettle } from "@/lib/animations";

type Variant = "primary" | "outline";
type Size = "sm" | "md";

type SharedProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

// Framer Motion repurposes a handful of native event handler names for its
// own gesture API (drag, animation lifecycle) with incompatible signatures
// — omit them from the native HTML prop types we accept so TS doesn't see
// a signature clash when they're spread onto `motion.button` / `motion(Link)`.
type MotionConflictingHandlers = "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd";

type LinkButtonProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children" | MotionConflictingHandlers> & {
    href: string;
  };

type NativeButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | MotionConflictingHandlers> & {
    href?: undefined;
  };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

// `rounded-tick` (2px), never a pill — matches the structural/blueprint
// geometry everywhere else. Mono/uppercase label treatment: the technical
// family is reserved for metadata and calls to action.
const base =
  "inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-tick border font-mono uppercase tracking-[0.1em] transition-colors duration-direct ease-engineered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950";

const variants: Record<Variant, string> = {
  // Copper is a mid-bright warm hue — dark ink text reads far better on it
  // than light text does (the opposite pairing read as too low-contrast).
  primary: "border-copper-600 bg-copper-600 text-ink-950 hover:border-copper-500 hover:bg-copper-500",
  outline:
    "border-paper-50/70 border-[1.5px] bg-transparent text-paper-50 hover:border-copper-300 hover:bg-copper-300/10 hover:text-copper-300",
};

const sizes: Record<Size, string> = {
  sm: "min-h-[40px] px-4 py-2 text-[11px] sm:text-xs",
  md: "min-h-[44px] px-6 py-3 text-xs sm:text-sm",
};

// Apple's fluid-interface rule: respond on pointer-down, not release, and
// use a spring (not a fixed-duration CSS tween) so the press is
// interruptible — a rapid double-tap doesn't fight a half-finished
// transition. Critically damped: feedback, not bounce.
const MotionLink = motion(Link);

export function Button({ variant = "primary", size = "md", className, children, href, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <MotionLink
        href={href}
        className={classes}
        whileTap={{ scale: 0.97 }}
        transition={springSettle}
        {...(props as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | MotionConflictingHandlers>)}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type="button"
      className={classes}
      whileTap={{ scale: 0.97 }}
      transition={springSettle}
      {...(props as Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | MotionConflictingHandlers>)}
    >
      {children}
    </motion.button>
  );
}
