import Link from "next/link";
import { auth0 } from "@/lib/auth0";

export default async function LandingPage() {
  const session = await auth0.getSession();
  const isSignedIn = Boolean(session);
  return (
    <div className="bg-surface-container-lowest min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0e0e13]">
        <div className="text-2xl font-black text-[#ff6b00] italic font-headline uppercase tracking-tighter">
          IPL StatWar
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <Link
            className="text-[#ff6b00] border-b-2 border-[#ff6b00] font-headline uppercase tracking-tighter text-sm transition-all duration-100 px-1 py-1"
            href="#"
          >
            Arena
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center">
            {isSignedIn ? (
              <Link href="/auth/logout" className="material-symbols-outlined text-[#a2e7ff] opacity-70 hover:opacity-100">logout</Link>
            ) : (
              <Link href="/auth/login" className="material-symbols-outlined text-[#a2e7ff] opacity-70 hover:opacity-100">person</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative min-h-screen pt-16 overflow-hidden flex flex-col items-center justify-center">
        {/* Visual Texture Layers */}
        <div className="absolute inset-0 pitch-grid pointer-events-none"></div>
        <div className="absolute inset-0 stadium-glow pointer-events-none"></div>

        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Content: Brand & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start translate-x-0">
            <div className="inline-block bg-primary-container/10 border-l-4 border-primary-container px-4 py-2 mb-6">
              <span className="font-headline font-bold text-primary tracking-widest uppercase text-xs">
                Live Tournament Engine
              </span>
            </div>
            <h1 className="font-headline font-black text-6xl md:text-8xl text-on-surface leading-[0.9] tracking-tighter uppercase mb-6 italic">
              How well do you <br />
              <span className="text-primary-container">really know</span> IPL?
            </h1>
            <p className="text-secondary opacity-80 text-lg md:text-xl max-w-xl mb-10 font-medium leading-relaxed">
              Step into the digital arena. Outsmart your rivals with tactical precision, live stats, and absolute cricket dominance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto min-h-[70px]">
              {isSignedIn ? (
                <Link href="/dashboard" className="group relative px-10 py-5 bg-primary-container text-on-primary-container font-headline font-black text-xl uppercase tracking-wider transition-all duration-100 hover:translate-x-2 hover:-translate-y-2 active:scale-95 text-center">
                  <span className="relative z-10">Go to Arena</span>
                  <div className="absolute inset-0 bg-secondary -z-10 translate-x-0 translate-y-0 group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform duration-100"></div>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="group relative px-10 py-5 bg-primary-container text-on-primary-container font-headline font-black text-xl uppercase tracking-wider transition-all duration-100 hover:translate-x-2 hover:-translate-y-2 active:scale-95 text-center">
                    <span className="relative z-10">Start Training</span>
                    <div className="absolute inset-0 bg-secondary -z-10 translate-x-0 translate-y-0 group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform duration-100"></div>
                  </Link>
                  <Link href="/auth/login?screen_hint=signup" className="px-10 py-5 border-2 border-secondary/30 text-secondary font-headline font-black text-xl uppercase tracking-wider transition-all duration-100 hover:bg-secondary hover:text-surface-container-lowest hover:border-secondary active:scale-95 text-center">
                    Join Room
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-outline-variant/20 pt-8 w-full">
              <div className="flex flex-col">
                <span className="font-headline text-3xl font-black text-on-surface">42K+</span>
                <span className="font-headline text-[10px] uppercase tracking-widest text-secondary opacity-60">
                  Active Managers
                </span>
              </div>
              <div className="w-px h-10 bg-outline-variant/30"></div>
              <div className="flex flex-col">
                <span className="font-headline text-3xl font-black text-on-surface">1.2M</span>
                <span className="font-headline text-[10px] uppercase tracking-widest text-secondary opacity-60">
                  Stats Tracked
                </span>
              </div>
            </div>
          </div>

          {/* Right Content: Stats Dashboard Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-surface-container p-1 border-t-4 border-primary-container shadow-[20px_20px_0px_rgba(255,107,0,0.1)]">
              <div className="bg-surface-container-high p-6 border border-outline-variant/20">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-headline text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-1">
                      Global Leaderboard
                    </h3>
                    <p className="font-headline text-2xl font-black italic">RANK #1</p>
                  </div>
                  <div className="bg-primary-container text-on-primary-container p-2">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      emoji_events
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-10">
                  <div
                    className="relative w-24 h-24 bg-surface-container-highest border-2 border-primary-container/50 overflow-hidden clip-slanted"
                  >
                    <img
                      className="w-full h-full object-cover grayscale contrast-125"
                      alt="Player portrait"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC23DZCXNYWwHkTD-vZyzvDjA_x0LP_wFVAgVJqku6ItC9_E3mJ03QkOHeF3x_2fF2ciEHvZMZziZtJ2rAIGK9V-YL9i-P1PWnC3dPHknjf1r0s97thDmlIV-uXT6OXmRlacROz_bZawPiu5zR-pxv5O4DP-v9iv9sJk0g-l9z7Hs--nkEMAxHRA5UWZe2Yd9_sAmJntsif8uK6f4fOswG9m5kwQl5GW8LkkYhC7RXGbdJYMAmNfyzXEzNEz9GXJIZTl0uzM58SQfw"
                    />
                  </div>
                  <div>
                    <h4 className="font-headline text-3xl font-black text-on-surface leading-none mb-1">
                      Rahul_IPL
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500"></span>
                      <span className="font-label text-[10px] text-secondary/60 uppercase">
                        Dominating: Arena 04
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-container-lowest p-4 border-l-2 border-secondary">
                    <span className="block font-headline text-[10px] text-secondary uppercase mb-1">
                      Match Accuracy
                    </span>
                    <span className="block font-headline text-5xl font-black text-on-surface tabular-nums">
                      10/10
                    </span>
                  </div>
                  <div className="bg-surface-container-lowest p-4 border-l-2 border-primary-container">
                    <span className="block font-headline text-[10px] text-primary-container uppercase mb-1">
                      Total Points
                    </span>
                    <span className="block font-headline text-5xl font-black text-on-surface tabular-nums">
                      2,840
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="font-headline text-[10px] uppercase text-secondary/60">
                      Statistical IQ
                    </span>
                    <span className="font-headline text-xs font-bold text-primary">98%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-lowest flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                      <div key={i} className="h-full w-[10%] bg-primary-container"></div>
                    ))}
                    <div className="h-full w-[10%] bg-surface-container-highest"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative HUD items */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 border-r-2 border-b-2 border-secondary/20 hidden xl:block pointer-events-none"></div>
            <div className="absolute top-1/2 -left-20 w-40 h-px bg-gradient-to-r from-transparent via-primary-container to-transparent hidden xl:block"></div>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section className="py-24 bg-surface-container-lowest relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-16">
            <h2 className="font-headline text-4xl font-black uppercase italic tracking-tighter text-center">
              Engineered for Tactical Mastery
            </h2>
            <div className="h-1 w-24 bg-primary-container mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="p-8 border-l border-t border-outline-variant/10 hover:bg-surface-container transition-colors group">
              <span className="material-symbols-outlined text-primary-container text-4xl mb-6">
                query_stats
              </span>
              <h3 className="font-headline text-xl font-bold uppercase mb-4 text-on-surface">
                Precision Data
              </h3>
              <p className="text-secondary/70 font-body text-sm leading-relaxed">
                Access millisecond-perfect ball-by-ball data synced directly from the stadium broadcast feedback.
              </p>
            </div>
            <div className="p-8 border-x border-t border-outline-variant/10 hover:bg-surface-container transition-colors group">
              <span className="material-symbols-outlined text-secondary text-4xl mb-6">
                dynamic_feed
              </span>
              <h3 className="font-headline text-xl font-bold uppercase mb-4 text-on-surface">
                War Rooms
              </h3>
              <p className="text-secondary/70 font-body text-sm leading-relaxed">
                Create private rooms and challenge your squad in real-time. Highest score takes the prize pool.
              </p>
            </div>
            <div className="p-8 border-r border-t border-outline-variant/10 hover:bg-surface-container transition-colors group">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">
                shield
              </span>
              <h3 className="font-headline text-xl font-bold uppercase mb-4 text-on-surface">
                Anti-Cheat Engine
              </h3>
              <p className="text-secondary/70 font-body text-sm leading-relaxed">
                Our proprietary stadium-sync ensures zero lag exploits. Only pure tactical knowledge wins here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 bg-[#0e0e13] shadow-[0_-4px_20px_rgba(255,107,0,0.1)]">
        <div className="flex flex-col items-center justify-center bg-[#ff6b00] text-[#0e0e13] px-4 py-2 scale-110">
          <span className="material-symbols-outlined">sports_cricket</span>
          <span className="font-headline text-[10px] font-bold uppercase mt-1">Arena</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#a2e7ff] opacity-50 p-2">
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="font-headline text-[10px] font-bold uppercase mt-1">Global</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#a2e7ff] opacity-50 p-2">
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-headline text-[10px] font-bold uppercase mt-1">Intel</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#a2e7ff] opacity-50 p-2">
          <span className="material-symbols-outlined">groups</span>
          <span className="font-headline text-[10px] font-bold uppercase mt-1">Squad</span>
        </div>
      </nav>
    </div>
  );
}
