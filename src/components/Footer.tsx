'use client';

import Image from 'next/image';

export default function Footer() {
  const scrollToHero = (e: React.MouseEvent) => {
    e.preventDefault();
    const hero = document.getElementById('hero-section');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative w-full overflow-hidden bg-transparent pt-8 pb-10 px-6 font-sans text-white border-none">
      {/* White Grid Pattern Overlay matching Hero */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.16) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.16) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.85) 35%, rgba(0, 0, 1) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.85) 35%, rgba(0, 0, 1) 100%)',
        }}
      />

      {/* Soft Ambient Radial Glow */}
      <div className="absolute bottom-0 right-1/4 translate-x-1/4 w-full max-w-xl h-48 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.1),transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-center gap-4">
        {/* AralNook Logo - click to scroll back to hero */}
        <button
          onClick={scrollToHero}
          className="group inline-flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
          title="Back to hero"
          aria-label="Back to hero"
        >
          <Image
            src="/assets/logo.png"
            alt="AralNook Logo"
            width={60}
            height={60}
            className="object-contain drop-shadow-md group-hover:drop-shadow-xl transition-all"
            priority
          />
        </button>

        {/* Website Logo SVG - links to https://lhycerie.online/ */}
        <a
          href="https://lhycerie.online/"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white hover:text-[#FFF2E1] transition-all hover:scale-110 active:scale-95 shadow-md backdrop-blur-xs cursor-pointer"
          title="Visit lhycerie.online"
          aria-label="Visit lhycerie.online"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
