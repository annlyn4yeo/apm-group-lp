"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock, useFocusTrap, useScrollSpy } from "@/lib/hooks";
import { engineeredEase, springSettle, springIndicator } from "@/lib/animations";
import { Button } from "@/components/ui/Button";
import { Logomark } from "@/components/ui/Logomark";

// Hash targets point at sections arriving in later phases (About, Services,
// Our Achievements, Our Business / divisions, Gallery, Contact).
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Our Achievements", href: "#achievements" },
  { label: "Our Business", href: "#divisions" },
  { label: "Gallery", href: "#gallery" },
] as const;

const NAV_HREFS: readonly string[] = NAV_LINKS.map((link) => link.href);

const SCROLL_THRESHOLD = 80;

// Icon swap for the mobile menu button: a short rotate + fade so the
// hamburger and the X read as one control changing state, not two icons
// teleporting. Opacity-only under reduced motion (MotionConfig below).
const iconSwap = {
  initial: { opacity: 0, transform: "rotate(-80deg) scale(0.7)" },
  animate: { opacity: 1, transform: "rotate(0deg) scale(1)" },
  exit: { opacity: 0, transform: "rotate(80deg) scale(0.7)" },
  transition: { duration: 0.18, ease: engineeredEase },
} as const;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // The link the underline is currently following: pointer hover or keyboard
  // focus. null means "rest on the active page link".
  const [pointed, setPointed] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // useMotionValueEvent only triggers our setState when the threshold is
  // actually crossed, not on every scroll frame — avoids the "React state
  // tied to raw scroll" perf trap while still being a plain boolean.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > SCROLL_THRESHOLD;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useBodyScrollLock(menuOpen);
  useFocusTrap(menuRef, menuOpen, closeMenu);

  const mobileLinks = [...NAV_LINKS, { label: "Contact", href: "#contact" }] as const;

  // The section on screen (About, Services, ...); above the first section it
  // is the hero, so Home.
  const sectionHref = useScrollSpy(NAV_HREFS);
  const activeHref = sectionHref ?? (pathname === "/" ? "/" : null);
  const underlineHref = pointed ?? activeHref;

  // Mouse only: touch fires synthetic enter events on tap and would leave
  // the underline parked on whatever was last pressed.
  const onLinkEnter = (href: string) => (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "mouse") setPointed(href);
  };

  return (
    // `reducedMotion="user"` drops transform/layout animation (the sliding
    // underline, icon rotation, link stagger) and keeps opacity, which is
    // exactly the "gentler, not zero" behaviour DESIGN.md asks for.
    <MotionConfig reducedMotion="user">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center md:h-[76px]">
        {/* Surface layer. The blur and border live on their own layer and
            fade in with opacity, instead of transitioning backdrop-filter
            itself (which re-rasterises the blur every frame). */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 border-b border-ink-700/50 bg-ink-900/[0.92] backdrop-blur-[12px] transition-opacity duration-[180ms] ease-engineered",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />

        <div className="nav-container relative flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group/logo flex min-w-0 items-center gap-2 text-paper-50 transition-colors duration-direct ease-engineered hover:text-copper-300"
          >
            <Logomark className="h-5 w-5 shrink-0 text-copper-500 sm:h-6 sm:w-6" />
            {/* Full wordmark only where there's genuine room for it (xl+);
                below that, "APM" carries the brand without crowding the
                nav links and Contact button against the viewport edge. */}
            <span className="whitespace-nowrap font-display text-base font-extrabold uppercase tracking-[0.02em] sm:text-lg">
              APM<span className="hidden xl:inline"> Groups of Company</span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-5 lg:flex xl:gap-7"
            onPointerLeave={() => setPointed(null)}
          >
            {NAV_LINKS.map((link) => {
              const isActive = link.href === activeHref;
              const isPointed = link.href === pointed;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? (link.href === "/" ? "page" : "location") : undefined}
                  onPointerEnter={onLinkEnter(link.href)}
                  onFocus={() => setPointed(link.href)}
                  onBlur={() => setPointed(null)}
                  className={cn(
                    "relative whitespace-nowrap py-2 font-display text-[13px] font-bold text-paper-50/80 transition-colors duration-direct ease-engineered xl:text-sm",
                    (isActive || isPointed) && "text-paper-50",
                  )}
                >
                  {link.label}
                  {underlineHref === link.href && (
                    // One shared underline that glides between links
                    // (layoutId) rather than each link drawing its own, so
                    // moving across the nav reads as a single object.
                    <motion.span
                      layoutId="nav-underline"
                      aria-hidden="true"
                      transition={springIndicator}
                      className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-copper-500"
                    />
                  )}
                </Link>
              );
            })}
            {/* Pointing at the CTA releases the underline back to the
                active page; it only follows the text links. */}
            <span className="shrink-0" onPointerEnter={() => setPointed(null)}>
              <Button href="#contact" variant="outline" size="sm">
                Contact
              </Button>
            </span>
          </nav>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="relative flex h-11 w-11 items-center justify-center text-paper-50 lg:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? "close" : "open"}
                className="flex"
                initial={iconSwap.initial}
                animate={iconSwap.animate}
                exit={iconSwap.exit}
                transition={iconSwap.transition}
              >
                {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: engineeredEase }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink-950 lg:hidden"
          >
            <div className="site-container flex h-16 items-center justify-end">
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center text-paper-50"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            <motion.nav
              aria-label="Mobile primary"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
              }}
              className="site-container flex flex-1 flex-col justify-center gap-6 pb-16"
            >
              {mobileLinks.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, transform: "translateY(16px)" },
                    visible: {
                      opacity: 1,
                      transform: "translateY(0px)",
                      transition: springSettle,
                    },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="font-display text-[28px] font-extrabold uppercase tracking-tight text-paper-50 transition-colors duration-direct ease-engineered hover:text-copper-300"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
