"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@clerk/nextjs";

type LeaderboardEntry = {
  user_id: string;
  nickname: string;
  correct: number;
  wrong: number;
  total_time_ms: number;
};

export default function ResultsPage() {
  const { code } = useParams<{ code: string }>();
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: room } = await supabase.from("rooms").select("id").eq("code", code).single();
      if (room) setRoomId(room.id);
    };
    init();
  }, [code]);

  useEffect(() => {
    if (!roomId) return;
    const fetchLeaderboard = async () => {
      // Aggregate answers per user
      const { data: answers } = await supabase
        .from("player_answers")
        .select("user_id, is_correct, time_taken_ms")
        .eq("room_id", roomId);

      const { data: players } = await supabase
        .from("room_players")
        .select("user_id, nickname")
        .eq("room_id", roomId);

      if (!answers || !players) return;

      const statsMap: Record<string, { correct: number; wrong: number; total_time_ms: number }> = {};
      for (const ans of answers) {
        if (!statsMap[ans.user_id]) statsMap[ans.user_id] = { correct: 0, wrong: 0, total_time_ms: 0 };
        if (ans.is_correct) statsMap[ans.user_id].correct++;
        else statsMap[ans.user_id].wrong++;
        statsMap[ans.user_id].total_time_ms += ans.time_taken_ms;
      }

      const board: LeaderboardEntry[] = players.map((p) => ({
        user_id: p.user_id,
        nickname: p.nickname,
        correct: statsMap[p.user_id]?.correct ?? 0,
        wrong: statsMap[p.user_id]?.wrong ?? 0,
        total_time_ms: statsMap[p.user_id]?.total_time_ms ?? 0,
      })).sort((a, b) => b.correct - a.correct || a.total_time_ms - b.total_time_ms);

      setLeaderboard(board);
    };

    fetchLeaderboard();

    // Listen for new answers being submitted
    const channel = supabase
      .channel(`results:${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "player_answers", filter: `room_id=eq.${roomId}` }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [roomId]);

  const RANK_STYLES = [
    { border: "border-[#FFD700]", glow: "[box-shadow:0_0_50px_rgba(255,215,0,0.2)]", numColor: "text-[#FFD700]", medal: "workspace_premium", medalColor: "text-[#FFD700]" },
    { border: "border-[#C0C0C0]", glow: "[box-shadow:0_0_40px_rgba(192,192,192,0.15)]", numColor: "text-[#C0C0C0]", medal: "military_tech", medalColor: "text-[#C0C0C0]" },
    { border: "border-[#CD7F32]", glow: "[box-shadow:0_0_30px_rgba(205,127,50,0.1)]", numColor: "text-[#CD7F32]", medal: "military_tech", medalColor: "text-[#CD7F32]" },
  ];

  const winner = leaderboard[0];
  const strikeRate = winner ? ((winner.correct / Math.max(1, winner.correct + winner.wrong)) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body min-h-screen relative">
      {/* Watermark */}
      <div className="fixed top-20 right-6 z-50 pointer-events-none select-none">
        <span className="font-headline font-black text-4xl opacity-[0.03] rotate-12 block">ROOM: {code}</span>
      </div>

      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0e0e13]">
        <Link href="/" className="text-2xl font-black text-[#ff6b00] italic font-headline uppercase tracking-tighter">IPL StatWar</Link>
        <div className="flex items-center gap-6">
          <button className="material-symbols-outlined text-[#a2e7ff] opacity-70 hover:text-[#ff6b00] transition-all p-2">notifications</button>
          <div className="w-8 h-8 bg-surface-container-highest border border-outline-variant overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">person</span>
          </div>
        </div>
      </nav>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 pitch-grid" />
        <div className="absolute inset-0 stadium-glow" />
      </div>

      <main className="relative z-10 pt-24 pb-32 px-4 max-w-4xl mx-auto">
        {/* Winner Section */}
        {winner && (
          <section className="mb-16 text-center">
            <div className="inline-block relative mb-8">
              <div className="absolute inset-0 bg-[#FFD700] blur-[100px] opacity-20 scale-150" />
              <div className="relative z-10 flex flex-col items-center">
                <span
                  className="material-symbols-outlined text-[#FFD700] text-8xl mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
                <h2 className="font-headline font-black text-8xl md:text-[10rem] text-on-surface tracking-tighter italic uppercase leading-none drop-shadow-2xl">
                  RANK #1
                </h2>
                <div className="mt-4 bg-primary-container text-on-primary-container px-8 py-2 font-headline font-black text-2xl uppercase [transform:skewX(-12deg)]">
                  CHAMPION OF THE ARENA
                </div>
              </div>
            </div>

            {/* Winner Card */}
            <div className="bg-surface-container border-l-8 border-[#FFD700] p-8 mb-12 relative overflow-hidden text-left [box-shadow:0_0_50px_rgba(255,215,0,0.2)]">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-surface-container-highest flex-shrink-0 border-2 border-[#FFD700]/30 flex items-center justify-center">
                    <span className="font-headline text-4xl font-black text-[#FFD700]">
                      {winner.nickname.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-headline text-[#FFD700] uppercase text-sm font-bold tracking-[0.2em] mb-1">Elite Tactician</p>
                    <h3 className="font-headline font-black text-5xl uppercase leading-none tracking-tighter">{winner.nickname}</h3>
                  </div>
                </div>
                <div className="flex gap-12 text-center">
                  <div>
                    <p className="font-label text-secondary text-xs font-bold uppercase mb-1">Score</p>
                    <p className="font-headline font-black text-6xl text-white tabular-nums">{winner.correct}/{winner.correct + winner.wrong}</p>
                  </div>
                  <div>
                    <p className="font-label text-xs font-bold uppercase mb-1">Accuracy</p>
                    <p className="font-headline font-black text-6xl text-secondary tabular-nums">{strikeRate}%</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-9xl">emoji_events</span>
              </div>
            </div>
          </section>
        )}

        {/* Leaderboard Table */}
        <section className="space-y-3">
          <div className="flex items-center px-6 py-3 font-label text-secondary/50 text-xs uppercase tracking-widest border-b border-outline-variant/20">
            <div className="w-12">#</div>
            <div className="flex-grow">Tactician</div>
            <div className="w-24 text-center">Correct</div>
            <div className="w-24 text-center">Wrong</div>
            <div className="w-32 text-right">Time</div>
          </div>

          {leaderboard.slice(1).map((entry, idx) => {
            const rank = idx + 2;
            const style = RANK_STYLES[rank - 1] ?? { border: "", glow: "", numColor: "text-outline", medal: "", medalColor: "" };
            const isCurrentUser = entry.user_id === user?.id;

            return (
              <div
                key={entry.user_id}
                className={`flex items-center px-6 py-6 transition-all group border-l-4 ${style.border} ${style.glow}
                  ${isCurrentUser ? "bg-surface-container-highest border-secondary shadow-[inset_0_0_30px_rgba(162,231,255,0.08)]" : "bg-surface-container-low hover:bg-surface-container"}`}
              >
                <div className={`w-12 font-headline font-black text-3xl ${isCurrentUser ? "text-secondary" : style.numColor}`}>
                  {String(rank).padStart(2, "0")}
                </div>
                <div className="flex-grow flex items-center gap-4">
                  <div className={`w-12 h-12 bg-surface-container-highest border ${style.border} flex items-center justify-center`}>
                    <span className="font-headline font-black text-lg">{entry.nickname.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className={`font-headline font-black uppercase text-xl group-hover:text-primary transition-colors ${isCurrentUser ? "text-secondary" : ""}`}>
                      {isCurrentUser ? `YOU (${entry.nickname})` : entry.nickname}
                    </span>
                    {isCurrentUser && <p className="text-[10px] font-label uppercase tracking-tighter opacity-50">Your Performance</p>}
                  </div>
                </div>
                <div className="w-24 text-center font-headline font-black text-[#22C55E] text-2xl">{entry.correct}</div>
                <div className="w-24 text-center font-headline font-black text-[#EF4444] text-2xl">{entry.wrong}</div>
                <div className="w-32 text-right font-headline font-black text-2xl tabular-nums">
                  {(entry.total_time_ms / 1000).toFixed(1)}s
                </div>
              </div>
            );
          })}
        </section>

        {/* Actions */}
        <section className="mt-16 flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/dashboard"
            className="bg-[#ff6b00] text-[#0e0e13] px-12 py-5 font-headline font-black text-xl uppercase tracking-tighter transition-transform duration-100 flex items-center justify-center gap-3 hover:translate-x-1 hover:-translate-y-1 hover:[box-shadow:-8px_8px_0px_0px_#00d2fd]"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>replay</span>
            Play Again
          </Link>
          <Link
            href="/dashboard"
            className="bg-transparent border-2 border-[#6B7280] text-[#6B7280] px-12 py-5 font-headline font-black text-xl uppercase tracking-tighter flex items-center justify-center gap-3 hover:border-secondary hover:text-secondary transition-all"
          >
            <span className="material-symbols-outlined">dashboard</span>
            Back to Dashboard
          </Link>
        </section>
      </main>

      {/* Mobile Nav */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 bg-[#0e0e13] shadow-[0_-4px_20px_rgba(255,107,0,0.1)]">
        <Link className="flex flex-col items-center justify-center text-[#a2e7ff] p-2 opacity-50 font-headline text-[10px] font-bold uppercase" href="#">
          <span className="material-symbols-outlined">sports_cricket</span>
          Arena
        </Link>
        <Link className="flex flex-col items-center justify-center bg-[#ff6b00] text-[#0e0e13] p-2 scale-110 font-headline text-[10px] font-bold uppercase" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
          Leaderboard
        </Link>
        <Link className="flex flex-col items-center justify-center text-[#a2e7ff] p-2 opacity-50 font-headline text-[10px] font-bold uppercase" href="#">
          <span className="material-symbols-outlined">analytics</span>
          Intel
        </Link>
        <Link className="flex flex-col items-center justify-center text-[#a2e7ff] p-2 opacity-50 font-headline text-[10px] font-bold uppercase" href="#">
          <span className="material-symbols-outlined">groups</span>
          Squad
        </Link>
      </footer>
    </div>
  );
}
