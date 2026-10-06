"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock, useFocusTrap } from "@/lib/hooks";
import { springSettle } from "@/lib/animations";
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

const SCROLL_THRESHOLD = 80;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // useMotionValueEvent only triggers our setState when the threshold is
  // actually crossed, not on every scroll frame — avoids the "React state
  // tied to raw scroll" perf trap while still being a plain boolean.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > SCROLL_THRESHOLD;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  useBodyScrollLock(menuOpen);
  useFocusTrap(menuRef, menuOpen, () => setMenuOpen(false));

  const closeMenu = () => setMenuOpen(false);
  const mobileLinks = [...NAV_LINKS, { label: "Contact", href: "#contact" }] as const;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b transition-[background-color,backdrop-filter,border-color] duration-direct ease-engineered md:h-[76px]",
          scrolled
            ? "border-ink-700/50 bg-ink-900/[0.92] backdrop-blur-[12px]"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="nav-container flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-paper-50 transition-colors duration-direct ease-engineered hover:text-copper-300"
          >
            <Logomark className="h-5 w-5 shrink-0 text-copper-500 sm:h-6 sm:w-6" />
            {/* Full wordmark only where there's genuine room for it (xl+);
                below that, "APM" carries the brand without crowding the
                nav links and Contact button against the viewport edge. */}
            <span className="whitespace-nowrap font-display text-base font-extrabold uppercase tracking-[0.02em] sm:text-lg">
              APM<span className="hidden xl:inline"> Groups of Company</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex xl:gap-7">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : false;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative whitespace-nowrap py-2 font-display text-[13px] font-bold text-paper-50/85 transition-colors duration-direct ease-engineered hover:text-paper-50 xl:text-sm",
                    isActive && "text-paper-50",
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-copper-500"
                    />
                  )}
                </Link>
              );
            })}
            <Button href="#contact" variant="outline" size="sm" className="shrink-0">
              Contact
            </Button>
          </nav>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center text-paper-50 lg:hidden"
          >
            {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
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
            transition={{ ...springSettle, duration: 0.3 }}
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
                visible: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
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
    </>
  );
}
