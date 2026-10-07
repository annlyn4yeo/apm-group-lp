"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { CONTACT_LINK, NAV_LINKS, OPERATING_DIVISIONS } from "@/lib/constants";
import { handleSectionLinkClick, useRevealOnce, useViewProgress } from "@/lib/hooks";
import { Logomark } from "@/components/ui/Logomark";

// Reveal choreography reuses the `.about-*` classes in globals.css; each
// element reads its stagger position from `--i`.
const slot = (index: number) => ({ "--i": index }) as CSSProperties;

const LABEL = "font-mono text-[11px] font-medium uppercase tracking-[0.18em]";

// Underline that draws left to right under a link; quick, not decorative.
const LINK =
  "relative inline-block py-1 font-display text-lg font-bold uppercase leading-tight tracking-tight after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-ink-950 after:transition-transform after:duration-[240ms] after:ease-engineered hover:after:scale-x-100 focus-visible:after:scale-x-100";

/**
 * Footer, on the Contact panel's own copper: ink type, a ruled top edge, three
 * columns, the group's name set as one wide line that rises into place as the
 * page ends, and a legal bar. Sits inside the panel (it travels with it), so
 * it carries `role="contentinfo"` itself.
 */
export function Footer() {
  const reduceMotion = useReducedMotion();
  const [topRef, topRevealed] = useRevealOnce<HTMLDivElement>();
  const [legalRef, legalRevealed] = useRevealOnce<HTMLDivElement>("0%");

  // 0 as the wordmark's top reaches the bottom of the screen, 1 once the whole
  // line has come in. At rest (1) until measured.
  const [markRef, markProgress] = useViewProgress<HTMLDivElement>(
    (rect, vh) => (vh - rect.top) / rect.height,
    1,
  );
  const markShift = useTransform(markProgress, (p) =>
    reduceMotion ? "none" : `translateY(${(1 - p) * 100}%)`,
  );

  return (
    <footer role="contentinfo" className="border-t-2 border-ink-950 pb-8 pt-16 lg:pt-20">
      <div className="site-container">
        <div
          ref={topRef}
          data-revealed={topRevealed}
          className="grid gap-12 lg:grid-cols-12 lg:gap-16"
        >
          <div style={slot(0)} className="about-item lg:col-span-5">
            <Logomark className="h-8 w-8 text-ink-950" />
            <p className="mt-6 font-display text-3xl font-extrabold uppercase leading-[1.02] tracking-tight sm:text-4xl">
              One Group. Multiple Industries. One Vision.
            </p>
            <p className="mt-5 max-w-[46ch] font-body text-base font-semibold leading-relaxed">
              Institutional resilience, industrial progress, and multi-sector leadership engineered
              across renewable energy, agriculture, civil works, real estate, plaza, textiles, and
              steels.
            </p>
          </div>

          <nav
            aria-label="Footer"
            style={slot(1)}
            className="about-item lg:col-span-3 lg:col-start-7"
          >
            <h3 className={LABEL}>Quick Navigation</h3>
            <ul className="mt-5 space-y-1">
              {[...NAV_LINKS, CONTACT_LINK].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(event) => handleSectionLinkClick(event, link.href)}
                    className={LINK}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div style={slot(2)} className="about-item lg:col-span-3">
            <h3 className={LABEL}>Operating Divisions</h3>
            <ul className="mt-5 space-y-1">
              {OPERATING_DIVISIONS.map((division) => (
                <li key={division.name} className="py-1 font-display text-lg font-bold uppercase leading-tight tracking-tight">
                  {division.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The group's name as one line across the full width. It is the
            brand set large, not content, so it is hidden from assistive tech
            (the name is already in the Logomark lockup, the nav and the legal
            bar). The line rises from below a mask as the page ends. */}
        <div aria-hidden="true" className="mt-16 overflow-hidden lg:mt-24">
          <div ref={markRef}>
            {/* Sized to span the container: the line is 9.7em wide, so the
                font is the container width over that: about 9.3vw below the
                1280px container, then fixed. */}
            <motion.p
              style={{ transform: markShift, fontSize: "clamp(1.5rem, 9.3vw, 8.1rem)" }}
              className="whitespace-nowrap pb-[0.04em] text-center font-display font-extrabold uppercase leading-[0.82] tracking-tight will-change-transform"
            >
              APM Groups of Company
            </motion.p>
          </div>
        </div>

        <div
          ref={legalRef}
          data-revealed={legalRevealed}
          className="mt-6 flex flex-col gap-3 border-t border-ink-950 pt-6 font-body text-sm font-semibold sm:flex-row sm:items-center sm:justify-between"
        >
          <p style={slot(0)} className="about-item">
            &copy; APM Groups of Company. All rights reserved.
          </p>
          <p style={slot(1)} className="about-item flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </p>
          <p style={slot(2)} className="about-item">
            Developed by{" "}
            <a
              href="https://root-path.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-base font-extrabold uppercase tracking-tight underline decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-150 ease-engineered hover:decoration-2"
            >
              root-path
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
