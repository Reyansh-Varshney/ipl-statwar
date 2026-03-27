"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DIFFICULTY_OPTIONS = [
  { label: "EASY", hex: "#00", color: "bg-[#22C55E] text-black" },
  { label: "MEDIUM", hex: "#55", color: "bg-[#EAB308] text-black" },
  { label: "HARD", hex: "#AA", color: "bg-[#F97316] text-black" },
  { label: "EXTREME", hex: "#FF", color: "bg-[#EF4444] text-white border-2 border-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.5)]" },
] as const;

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function DashboardPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [difficulty, setDifficulty] = useState<"easy"|"medium"|"hard"|"extreme">("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [isCreating, setIsCreating] = useState(false);

  const handleJoin = () => {
    if (joinCode.trim().length > 0) {
      router.push(`/room/${joinCode.trim().toUpperCase()}`);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: roomName,
          difficulty,
          question_count: questionCount
        })
      });
      if (!res.ok) throw new Error("Failed to create room");
      const data = await res.json();
      router.push(`/room/${data.code}`);
    } catch (error) {
      console.error(error);
      setIsCreating(false);
    }
  };

  return (
    <div
      className="bg-[#0e0e13] text-on-background font-body min-h-screen selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden"
    >
      {/* Background Texture Layers */}
      <div className="fixed inset-0 pitch-grid pointer-events-none z-0" />
      <div className="fixed inset-0 stadium-glow pointer-events-none z-0 px-4" />

      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0e0e13]">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-[#ff6b00] italic font-headline uppercase tracking-tighter">
            IPL StatWar
          </Link>
          <div className="hidden md:flex gap-6">
            <a className="font-headline uppercase tracking-tighter text-[#ff6b00] border-b-2 border-[#ff6b00] transition-all duration-100 h-16 flex items-center" href="#">Arena</a>
            <a className="font-headline uppercase tracking-tighter text-[#a2e7ff] opacity-70 hover:bg-[#ff6b00]/10 hover:text-[#ff6b00] transition-all duration-100 h-16 flex items-center px-2" href="#">Leaderboard</a>
            <a className="font-headline uppercase tracking-tighter text-[#a2e7ff] opacity-70 hover:bg-[#ff6b00]/10 hover:text-[#ff6b00] transition-all duration-100 h-16 flex items-center px-2" href="#">Intel</a>
            <a className="font-headline uppercase tracking-tighter text-[#a2e7ff] opacity-70 hover:bg-[#ff6b00]/10 hover:text-[#ff6b00] transition-all duration-100 h-16 flex items-center px-2" href="#">Squad</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[#a2e7ff] hover:text-[#ff6b00] transition-colors">notifications</button>
          <div className="w-10 h-10 bg-surface-container-highest border border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">person</span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Hero Header */}
        <header className="mb-12 relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-primary-container" />
          <h1 className="font-headline text-5xl font-black uppercase tracking-tighter mb-2">Command Center</h1>
          <p className="font-label text-secondary uppercase tracking-widest opacity-80">Season 2024 // Tactical Interface Active</p>
        </header>

        {!showCreate ? (
          <>
            {/* Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Create Room Card */}
              <div
                className="bg-surface-container p-8 relative overflow-hidden group transition-all duration-200 border-l-4 border-primary-container cursor-pointer hover:[box-shadow:0_0_20px_rgba(255,107,0,0.2)]"
                onClick={() => setShowCreate(true)}
              >
                <div className="relative z-10">
                  <span className="font-headline text-primary-container text-xs font-bold uppercase tracking-[0.3em] block mb-4">Tactical Operation</span>
                  <h2 className="font-headline text-4xl font-extrabold uppercase mb-6 leading-none">Create<br />Arena</h2>
                  <p className="text-on-surface-variant font-body mb-8 max-w-xs">Host a private battlefield. Define the stats, invite your squad, and dominate the leaderboard.</p>
                  <button className="w-full bg-primary-container text-on-primary-container font-headline font-black py-4 uppercase tracking-tighter transition-all hover:-translate-x-1 hover:-translate-y-1 hover:[box-shadow:4px_4px_0px_#ff6b00]">
                    Initialize Room
                  </button>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[180px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_cricket</span>
                </div>
              </div>

              {/* Join Room Card */}
              <div className="bg-surface-container p-8 relative overflow-hidden group transition-all duration-200 border-l-4 border-secondary-container hover:[box-shadow:0_0_20px_rgba(0,210,253,0.2)]">
                <div className="relative z-10">
                  <span className="font-headline text-secondary-container text-xs font-bold uppercase tracking-[0.3em] block mb-4">Deployment</span>
                  <h2 className="font-headline text-4xl font-extrabold uppercase mb-6 leading-none">Join<br />Engagement</h2>
                  <div className="mb-8">
                    <label className="font-label text-xs text-secondary-container uppercase mb-2 block tracking-widest">Entry Vector (6-Char Hex Code)</label>
                    <input
                      id="join-code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                      className="w-full bg-transparent border-b-2 border-outline-variant focus:border-secondary-container text-2xl font-headline font-bold uppercase tracking-[0.5em] py-2 focus:outline-none transition-all placeholder:opacity-20"
                      placeholder="E.g. XJ729K"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={handleJoin}
                    className="w-full border-2 border-secondary-container text-secondary-container font-headline font-black py-4 uppercase tracking-tighter hover:bg-secondary-container hover:text-on-secondary-container transition-all"
                  >
                    Authorize Entry
                  </button>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity text-secondary-container">
                  <span className="material-symbols-outlined text-[180px]">login</span>
                </div>
              </div>
            </div>

            {/* Active Rooms */}
            <section>
              <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
                <h3 className="font-headline text-2xl font-black uppercase tracking-tight">Active Battlefronts</h3>
                <a className="font-label text-secondary text-sm uppercase hover:underline" href="#">View All Operations</a>
              </div>
              <div className="space-y-4">
                {[
                  { num: "01", name: "Mumbai Maulers Pro League", tags: ["Expert", "T20 Specialist"], squads: "12/16", intensity: "High", timeLeft: "04:22:10", intensityColor: "text-primary" },
                  { num: "02", name: "The Captain's Challenge", tags: ["Standard"], squads: "08/10", intensity: "Medium", timeLeft: "12:15:00", intensityColor: "text-secondary" },
                  { num: "03", name: "Weekend Smash Blitz", tags: ["Rapid"], squads: "04/20", intensity: "Ultra", timeLeft: "00:45:12", intensityColor: "text-primary" },
                ].map((room) => (
                  <div key={room.num} className="bg-surface-container-low hover:bg-surface-container p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all border-r-2 border-transparent hover:border-primary-container">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-surface-container-highest flex items-center justify-center relative">
                        <span className="font-headline text-3xl font-black text-outline-variant">{room.num}</span>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-container" />
                      </div>
                      <div>
                        <h4 className="font-headline text-xl font-bold uppercase tracking-tight">{room.name}</h4>
                        <div className="flex gap-4 mt-1">
                          {room.tags.map((tag) => (
                            <span key={tag} className="font-label text-[10px] bg-primary-container/10 text-primary-container px-2 py-0.5 font-bold uppercase">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 md:flex md:gap-12 text-center md:text-left">
                      <div className="flex flex-col">
                        <span className="font-label text-[10px] text-outline opacity-60 uppercase mb-1">Squads</span>
                        <span className="font-headline text-xl font-bold">{room.squads}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label text-[10px] text-outline opacity-60 uppercase mb-1">Intensity</span>
                        <span className={`font-headline text-xl font-bold ${room.intensityColor}`}>{room.intensity}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label text-[10px] text-outline opacity-60 uppercase mb-1">Time Left</span>
                        <span className="font-headline text-xl font-bold">{room.timeLeft}</span>
                      </div>
                    </div>
                    <button className="bg-surface-container-highest px-6 py-3 font-headline font-bold uppercase text-xs tracking-widest hover:bg-primary-container hover:text-on-primary-container transition-all">
                      Enter
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Create Room Config */
          <div>
            <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setShowCreate(false)} className="font-headline text-secondary text-sm uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back
              </button>
            </div>
            <header className="mb-10 relative">
              <div className="absolute -left-4 top-0 w-1 h-12 bg-primary-container" />
              <h1 className="font-headline text-5xl font-black uppercase tracking-tighter italic text-primary">Deploy Arena</h1>
              <p className="font-label text-secondary opacity-60 tracking-widest mt-2 uppercase text-xs">Tactical Room Configuration / System.04</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left: Primary Config */}
              <div className="md:col-span-8 space-y-8">
                {/* Room Name */}
                <div className="bg-surface-container p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <span className="material-symbols-outlined text-6xl">terminal</span>
                  </div>
                  <label className="block font-label text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">Identify Sector</label>
                  <input
                    id="room-name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value.toUpperCase())}
                    className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary-container focus:outline-none text-2xl font-headline uppercase tracking-tight py-4 text-on-surface placeholder:opacity-20 transition-all"
                    placeholder="ENTER ROOM CODENAME..."
                  />
                </div>

                {/* Difficulty Matrix */}
                <div className="bg-surface-container p-8">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <label className="block font-label text-primary text-xs font-bold uppercase tracking-[0.2em]">Threat Level</label>
                      <span className="text-secondary text-xs opacity-50 uppercase">Select engine difficulty</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-highest">
                      <div className={`w-3 h-3 rotate-45 ${difficulty === "extreme" ? "bg-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]" : difficulty === "hard" ? "bg-[#F97316]" : difficulty === "medium" ? "bg-[#EAB308]" : "bg-[#22C55E]"}`} />
                      <span className="font-label text-[10px] text-on-surface opacity-80 uppercase font-bold">{difficulty.toUpperCase()}_ACTIVE</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setDifficulty(opt.label.toLowerCase() as typeof difficulty)}
                        className={`flex flex-col items-center justify-center p-4 transition-all ${opt.color} ${difficulty === opt.label.toLowerCase() ? "ring-2 ring-white/50" : "opacity-60 hover:opacity-100"}`}
                      >
                        <span className="font-headline font-black text-lg leading-none">{opt.label}</span>
                        <span className="font-label text-[10px] font-bold opacity-60 mt-1 uppercase tracking-tighter">{opt.hex}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Question Count */}
              <div className="md:col-span-4">
                <div className="bg-surface-container p-8 h-full flex flex-col">
                  <label className="block font-label text-primary text-xs font-bold uppercase tracking-[0.2em] mb-6">Payload Volume</label>
                  <div className="flex flex-col gap-3">
                    {QUESTION_COUNTS.map((count) => (
                      <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        className={`w-full py-4 font-headline font-black text-xl transition-all ${
                          questionCount === count
                            ? "bg-primary-container text-on-primary-container shadow-[4px_4px_0px_#000]"
                            : "border-2 border-outline-variant hover:bg-surface-container-highest"
                        }`}
                      >
                        {String(count).padStart(2, "0")}
                      </button>
                    ))}
                  </div>
                  <div className="mt-auto pt-6 text-[10px] font-label text-secondary opacity-40 uppercase">
                    Estimated match duration: {questionCount * 1.2}m
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Room CTA */}
            <div className="mt-12 group relative">
              <div className="absolute inset-0 bg-secondary translate-x-2 translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-100" />
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="relative w-full bg-primary-container py-8 flex items-center justify-between px-10 transition-transform active:translate-x-1 active:translate-y-1 disabled:opacity-70"
              >
                <span className="font-headline text-4xl font-black uppercase tracking-tighter italic text-on-primary-container">
                  {isCreating ? "Generating..." : "Generate Room"}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-label text-xs font-bold uppercase text-on-primary-container opacity-60">System Ready</span>
                  <span className="material-symbols-outlined text-4xl text-on-primary-container">bolt</span>
                </div>
              </button>
            </div>

            <div className="mt-16 flex justify-between items-center opacity-20">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-outline to-transparent" />
              <div className="px-4 font-label text-[10px] tracking-[0.5em] uppercase">Tactical Simulation Unit v4.02</div>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-outline to-transparent" />
            </div>
          </div>
        )}
      </main>

      {/* Side Decoration */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none opacity-20 rotate-90 origin-right">
        <span className="font-headline text-8xl font-black text-outline-variant uppercase tracking-[0.2em] whitespace-nowrap">TACTICAL OVERRIDE // STATWAR</span>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 bg-[#0e0e13] shadow-[0_-4px_20px_rgba(255,107,0,0.1)]">
        <button className="flex flex-col items-center justify-center bg-[#ff6b00] text-[#0e0e13] p-2 scale-110">
          <span className="material-symbols-outlined">sports_cricket</span>
          <span className="font-headline text-[10px] font-bold uppercase mt-1">Arena</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#a2e7ff] opacity-50 p-2">
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="font-headline text-[10px] font-bold uppercase mt-1">Leaderboard</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#a2e7ff] opacity-50 p-2">
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-headline text-[10px] font-bold uppercase mt-1">Intel</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#a2e7ff] opacity-50 p-2">
          <span className="material-symbols-outlined">groups</span>
          <span className="font-headline text-[10px] font-bold uppercase mt-1">Squad</span>
        </button>
      </nav>
    </div>
  );
}
