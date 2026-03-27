"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@clerk/nextjs";

type Player = {
  id: string;
  nickname: string;
  user_id: string;
  joined_at: string;
};

type Room = {
  id: string;
  code: string;
  host_id: string;
  status: string;
  difficulty: string;
  question_count: number;
};

export default function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const initRoom = async () => {
      // Auto join
      await fetch(`/api/rooms/${code}/join`, { method: "POST" });
      
      const { data: rm } = await supabase.from("rooms").select("*").eq("code", code).single();
      if (rm) {
        setRoom(rm as Room);
        if (user?.id === rm.host_id) {
          setIsHost(true);
        }
      }
    };
    initRoom();
  }, [code, user]);

  useEffect(() => {
    if (!room?.id) return;
    const fetchPlayers = async () => {
      const { data } = await supabase.from("room_players").select("*").eq("room_id", room.id);
      if (data) setPlayers(data as Player[]);
    };
    fetchPlayers();
  }, [room?.id]);

  // Supabase Realtime: room status & player presence
  useEffect(() => {
    if (!room?.id) return;
    const channel = supabase
      .channel(`room:${room.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${room.id}` }, (payload) => {
        if (payload.eventType === "INSERT") setPlayers((prev) => [...prev, payload.new as Player]);
        if (payload.eventType === "DELETE") setPlayers((prev) => prev.filter((p) => p.id !== payload.old.id));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${room.id}` }, (payload) => {
        const updated = payload.new as Room;
        setRoom(updated);
        if (updated.status === "active") router.push(`/room/${code}/play`);
      })
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [room?.id, code, router]);

  const handleStartQuiz = async () => {
    if (!room) return;
    setIsStarting(true);
    await supabase.from("rooms").update({ status: "generating" }).eq("id", room.id);
    // Trigger AI generation API
    await fetch(`/api/rooms/${code}/generate`, { method: "POST" });
  };

  const PLAYER_COLORS = ["#004ba0", "#fdb913", "#2d2a60", "#ec1c24", "#00885a", "#8b5cf6"];

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body min-h-screen overflow-x-hidden">
      {/* Decorative blurs */}
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0e0e13]">
        <Link href="/" className="text-2xl font-black text-[#ff6b00] italic font-headline uppercase tracking-tighter">IPL StatWar</Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-8">
            <a className="font-headline uppercase text-[#ff6b00] border-b-2 border-[#ff6b00] tracking-tighter text-sm" href="#">Arena</a>
            <a className="font-headline uppercase text-[#a2e7ff] opacity-70 hover:text-[#ff6b00] tracking-tighter text-sm" href="#">Leaderboard</a>
          </div>
          <button className="material-symbols-outlined text-[#a2e7ff] opacity-70 hover:opacity-100">notifications</button>
          <div className="w-8 h-8 bg-surface-container-highest border border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">person</span>
          </div>
        </div>
      </header>

      <main className="relative pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center">
        {/* Background Texture Layers */}
        <div className="fixed inset-0 pitch-grid pointer-events-none z-0" />
        <div className="fixed inset-0 stadium-glow pointer-events-none z-0" />

        {/* Live Badge */}
        <div className="mb-8 flex items-center gap-3 bg-error-container/20 px-4 py-1 self-start md:self-center border-l-4 border-error">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-error" />
          </span>
          <span className="font-headline text-xs uppercase tracking-[0.2em] text-error font-bold">Lobby Live: Waiting for Squad</span>
        </div>

        {/* Room Code Centerpiece */}
        <section className="w-full max-w-2xl mb-12">
          <div className="bg-surface-container p-8 md:p-12 relative overflow-hidden shadow-[20px_20px_0px_0px_rgba(255,107,0,0.05)]">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary-container opacity-20" style={{ clipPath: "polygon(0 0, 100% 0, 95% 100%, 0 100%)" }} />
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="font-headline text-secondary text-sm uppercase tracking-widest mb-4">Transmission ID</span>
              <h1 className="font-headline text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary-container tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(255,107,0,0.3)]">
                {code}
              </h1>
              <p className="font-label text-xs text-secondary/50 uppercase tracking-widest">Share this code with your squad</p>
            </div>
          </div>
        </section>

        {/* Players Grid */}
        <section className="w-full max-w-4xl">
          <div className="flex items-end justify-between mb-6 border-b border-outline-variant/20 pb-4">
            <div>
              <h2 className="font-headline text-2xl font-black uppercase text-secondary">Players Joined</h2>
              <p className="font-body text-xs text-on-surface-variant uppercase tracking-tighter">
                Current Squad Strength: {String(players.length).padStart(2, "0")} / {room?.question_count ?? 20}
              </p>
            </div>
            <div className="font-headline text-5xl font-black text-outline-variant/30">{String(players.length).padStart(2, "0")}</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {players.map((player, i) => (
              <div key={player.id} className={`bg-surface-container p-4 ${i === 0 ? "border-l-4 border-primary" : "border-l-4 border-secondary/30 hover:border-secondary"} transition-all`}>
                <div className="relative mb-3 w-full aspect-square flex items-center justify-center border-4 border-white/20" style={{ backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length] }}>
                  <span className="font-headline text-4xl font-black text-white">
                    {player.nickname.slice(0, 2).toUpperCase()}
                  </span>
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 bg-white px-2 py-0.5">
                      <span className="font-headline text-[10px] font-black text-primary-container uppercase">Host</span>
                    </div>
                  )}
                </div>
                <p className="font-headline text-sm font-bold text-on-surface truncate">{player.nickname}</p>
                <p className={`font-headline text-[10px] uppercase ${i === 0 ? "text-primary" : "text-secondary/50"}`}>
                  {i === 0 ? "Ready to Start" : "Connected"}
                </p>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 5 - players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-surface-container-low border border-dashed border-outline-variant/30 p-4 flex flex-col items-center justify-center opacity-40">
                <span className="material-symbols-outlined text-4xl mb-2">person_add</span>
                <p className="font-headline text-[10px] uppercase font-bold text-center">Waiting...</p>
              </div>
            ))}
          </div>
        </section>

        {/* Start Quiz Button (host only) */}
        {isHost && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xs px-4 z-40">
            <button
              onClick={handleStartQuiz}
              disabled={isStarting || players.length < 1}
              className="w-full bg-primary-container text-on-primary-container font-headline font-black text-xl uppercase py-4 transition-all flex items-center justify-center gap-3 hover:translate-x-1 hover:-translate-y-1 hover:[box-shadow:-8px_8px_0px_0px_#00d2fd] disabled:opacity-50"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              {isStarting ? "Generating..." : "Start Quiz"}
            </button>
            <p className="text-center mt-3 font-headline text-[10px] uppercase text-primary font-bold animate-pulse">
              {isStarting ? "AI generating questions..." : "Awaiting your command, Captain"}
            </p>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 bg-[#0e0e13] shadow-[0_-4px_20px_rgba(255,107,0,0.1)]">
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
