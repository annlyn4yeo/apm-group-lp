import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Achievements } from "@/components/sections/Achievements";
import { Business } from "@/components/sections/Business";
import { Gallery } from "@/components/sections/Gallery";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";
import { PinnedTail } from "@/components/layout/PinnedTail";

export default function HomePage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[70] focus-visible:rounded-tick focus-visible:bg-copper-500 focus-visible:px-4 focus-visible:py-2 focus-visible:font-mono focus-visible:text-xs focus-visible:uppercase focus-visible:tracking-[0.1em] focus-visible:text-ink-950"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        {/* Stage: the hero is sticky inside this wrapper while About slides
            over it. */}
        <div className="stage relative">
          <Hero />
          <About />
        </div>
        <Services />
        <Achievements />
        <Business />

        {/* Stage two: the Gallery is held in place (by its bottom edge) while
            the copper Contact panel, with the footer, rises over it. The
            wrapper is never transformed and owns the scroll timeline; the
            panel inside it is what moves. */}
        <div className="stage2 relative bg-verdigris-900">
          <PinnedTail>
            <Gallery />
          </PinnedTail>

          <div data-rise-wrap className="contact-wrap relative z-10">
            <div
              id="contact"
              className="stage-contact on-copper relative bg-copper-500 text-ink-950"
            >
              {/* Shadow the panel casts onto the pinned Gallery as it rises. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-ink-950/45 to-transparent"
              />
              <Contact />
              <Footer />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
