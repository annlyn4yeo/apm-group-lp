import type { Variants } from "framer-motion";

export const massEase = [0.22, 0.61, 0.36, 1] as const;

export const sectionReveal: Variants = {
  hidden: { opacity: 0, transform: "translateY(28px)" },
  visible: { opacity: 1, transform: "translateY(0px)", transition: { duration: 0.6, ease: massEase } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, transform: "translateY(18px)" },
  visible: { opacity: 1, transform: "translateY(0px)", transition: { duration: 0.45, ease: massEase } },
};

export const textArrival: Variants = {
  hidden: { opacity: 0, transform: "translateY(22px)" },
  visible: { opacity: 1, transform: "translateY(0px)", transition: { duration: 0.6, ease: massEase } },
};

export const hoverLift: Variants = {
  rest: { transform: "translateY(0px)", transition: { duration: 0.18, ease: massEase } },
  hover: { transform: "translateY(-4px)", transition: { duration: 0.18, ease: massEase } },
};

export const hairlineDraw: Variants = {
  hidden: { scaleX: 0, transformOrigin: "left" },
  visible: { scaleX: 1, transformOrigin: "left", transition: { duration: 0.9, ease: massEase } },
};
