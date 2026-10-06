export default function HomePage() {
  return (
    <>
      <header className="border-b border-navy-950/10 bg-paper-50">
        <div className="site-container flex items-center justify-between py-5">
          <span className="font-archivo text-xl font-extrabold tracking-tight">APM<span className="text-gold-700">.</span></span>
          <span className="eyebrow text-navy-950/60">Phase 0</span>
        </div>
      </header>
      <main>
        <section className="bg-navy-950 py-32 text-paper-50">
          <div className="site-container">
            <p className="eyebrow text-gold-300">APM Groups of Company</p>
            <h1 className="mt-6 max-w-4xl font-archivo text-6xl font-extrabold leading-none tracking-[-0.06em] md:text-8xl">Landing page foundation.</h1>
          </div>
        </section>
      </main>
      <footer className="bg-navy-950 py-8 text-paper-50/60">
        <div className="site-container font-plex text-[10px] uppercase tracking-[0.12em]">APM Groups of Company</div>
      </footer>
    </>
  );
}
