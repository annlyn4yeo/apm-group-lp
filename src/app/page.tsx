import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";

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
      </main>
    </>
  );
}
