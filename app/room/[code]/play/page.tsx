"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@clerk/nextjs";

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

type Question = {
  id: string;
  sequence: number;
  question: string;
  options: string[];
  answer: string;
  type: "trivia" | "stat_puzzle";
};

const TIME_LIMIT = 20; // seconds per question

export default function PlayPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [submittedCount, setSubmittedCount] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: room } = await supabase.from("rooms").select("id").eq("code", code).single();
      if (room) setRoomId(room.id);
    };
    init();
  }, [code]);

  useEffect(() => {
    if (!roomId) return;
    const fetchQuestions = async () => {
      const { data } = await supabase.from("questions").select("*").eq("room_id", roomId).order("sequence");
      if (data) setQuestions(data as Question[]);
    };
    fetchQuestions();
  }, [roomId]);

  // Countdown timer
  useEffect(() => {
    if (locked || questions.length === 0) return;
    setTimeLeft(TIME_LIMIT);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(null); // auto-submit on timeout
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, questions.length]);

  const handleSubmit = async (choice: string | null) => {
    const userId = user?.id;
    if (locked || !roomId || !userId || questions.length === 0) return;
    clearInterval(timerRef.current!);
    setLocked(true);
    const q = questions[currentIdx];
    const timeTakenMs = Date.now() - startTimeRef.current;
    const isCorrect = choice === q.answer;

    await supabase.from("player_answers").insert({
      room_id: roomId,
      user_id: userId,
      question_id: q.id,
      selected_option: choice ?? "__timeout__",
      is_correct: isCorrect,
      time_taken_ms: timeTakenMs,
    });

    setSubmittedCount((c) => c + 1);

    // Move to next question after 1.5s or redirect to results
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((i) => i + 1);
        setSelected(null);
        setLocked(false);
      } else {
        router.push(`/room/${code}/results`);
      }
    }, 1500);
  };

  const q = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx) / questions.length) * 100 : 0;

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-headline text-secondary uppercase tracking-widest">Loading Questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body min-h-screen overflow-x-hidden relative">
      {/* Background Texture Layers */}
      <div className="fixed inset-0 pitch-grid pointer-events-none z-0" />
      <div className="fixed inset-0 stadium-glow pointer-events-none z-0" />

      {/* Decorative blurs */}
      <div className="fixed bottom-32 -right-32 w-96 h-96 bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="fixed top-32 -left-32 w-96 h-96 bg-secondary/10 blur-[150px] pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0e0e13] border-b border-surface-container-highest">
        <Link href="/" className="text-2xl font-black text-[#ff6b00] italic font-headline uppercase tracking-tighter">IPL StatWar</Link>
        <div className="hidden md:flex gap-8 items-center">
          <a className="font-headline uppercase tracking-tighter text-[#ff6b00] border-b-2 border-[#ff6b00] h-16 flex items-center" href="#">Arena</a>
          <a className="font-headline uppercase tracking-tighter text-[#a2e7ff] opacity-70 hover:text-[#ff6b00] h-16 flex items-center" href="#">Leaderboard</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-secondary opacity-70 hover:opacity-100">notifications</button>
          <div className="w-8 h-8 bg-surface-container-highest border border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">person</span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-32 px-4 max-w-6xl mx-auto flex flex-col min-h-screen">
        {/* Progress Header */}
        <header className="w-full mb-16">
          {/* Segmented progress bar */}
          <div className="flex gap-1 mb-8">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-[6px] flex-grow ${i < currentIdx ? "bg-[#00d2fd] shadow-[0_0_10px_rgba(0,210,253,0.5)]" : i === currentIdx ? "bg-primary-container" : "bg-surface-container"}`}
              />
            ))}
          </div>

          <div className="flex justify-between items-end border-b border-surface-container-highest pb-4">
            <div className="flex flex-col gap-1">
              <span className="font-headline font-black text-5xl text-on-surface tracking-tighter uppercase">
                Q{currentIdx + 1}<span className="text-outline-variant">/{questions.length}</span>
              </span>
              <span className="font-headline text-xs font-bold tracking-[0.3em] text-secondary uppercase opacity-70">Tactical Journey</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-1 border ${timeLeft <= 5 ? "border-error text-error" : "border-secondary text-secondary"}`}>
                <span className="material-symbols-outlined text-sm">timer</span>
                <span className="font-headline font-black text-xl tabular-nums">{String(timeLeft).padStart(2, "0")}</span>
              </div>
              <div className="bg-primary-container px-4 py-1">
                <span className="font-headline font-bold text-sm text-on-primary-container tracking-widest uppercase italic">
                  {q?.type === "stat_puzzle" ? "STAT PUZZLE" : "TRIVIA"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Question */}
        <section className="flex-grow flex flex-col justify-center items-center text-center mb-20 relative px-4">
          <div className="absolute -top-16 -left-12 w-32 h-32 border-l-2 border-t-2 border-secondary/10 hidden md:block" />
          <div className="absolute -bottom-16 -right-12 w-32 h-32 border-r-2 border-b-2 border-secondary/10 hidden md:block" />
          <h1 className="font-headline font-black text-5xl md:text-7xl text-on-surface uppercase mb-10 max-w-4xl leading-[0.95] tracking-tighter">
            {q?.question}
          </h1>
          <div className="flex items-center gap-4 bg-surface-container-low px-6 py-2 border border-surface-container-highest">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            <span className="font-label text-sm font-black text-secondary tracking-[0.2em] uppercase">Match Data: IPL 2008-2024</span>
          </div>
        </section>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {q?.options.map((option, i) => {
            const letter = OPTION_LETTERS[i];
            const isSelected = selected === option;
            const isCorrectReveal = locked && option === q.answer;
            const isWrongReveal = locked && isSelected && option !== q.answer;

            return (
              <button
                key={option}
                disabled={locked}
                onClick={() => {
                  if (!locked) {
                    setSelected(option);
                    handleSubmit(option);
                  }
                }}
                className={`group relative text-left p-8 flex items-center justify-between transition-all duration-200
                  ${isCorrectReveal ? "border-2 border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.3)]" : ""}
                  ${isWrongReveal ? "border-2 border-error bg-error/10" : ""}
                  ${isSelected && !locked ? "border-2 border-primary-container shadow-[0_0_30px_rgba(255,107,0,0.4)] bg-surface-container-high" : ""}
                  ${!isSelected && !locked ? "bg-surface-container-low border border-surface-container-highest hover:border-secondary" : ""}
                `}
              >
                <div className="flex items-center gap-8">
                  <span className={`font-headline font-black text-5xl italic transition-colors ${isSelected ? "text-primary-container" : "text-outline-variant group-hover:text-secondary"}`}>
                    {letter}
                  </span>
                  <span className={`font-headline font-black text-2xl text-on-surface uppercase tracking-tight transition-transform ${isSelected ? "translate-x-3" : "group-hover:translate-x-3"}`}>
                    {option}
                  </span>
                </div>
                {isSelected && !locked && (
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-black text-xs text-primary-container uppercase tracking-widest">Lock-In</span>
                    <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_box</span>
                  </div>
                )}
                {isCorrectReveal && <span className="material-symbols-outlined text-green-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                {isWrongReveal && <span className="material-symbols-outlined text-error text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>}
                {!isSelected && !locked && <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 text-secondary transition-opacity text-3xl">keyboard_double_arrow_right</span>}
              </button>
            );
          })}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 bg-[#0e0e13] border-t border-surface-container-highest">
        <a className="flex flex-col items-center justify-center text-[#ff6b00] p-2 scale-110" href="#">
          <span className="material-symbols-outlined">sports_cricket</span>
          <span className="font-headline text-[10px] font-bold uppercase">Arena</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#a2e7ff] p-2 opacity-50" href="#">
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="font-headline text-[10px] font-bold uppercase">Leaderboard</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#a2e7ff] p-2 opacity-50" href="#">
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-headline text-[10px] font-bold uppercase">Intel</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#a2e7ff] p-2 opacity-50" href="#">
          <span className="material-symbols-outlined">groups</span>
          <span className="font-headline text-[10px] font-bold uppercase">Squad</span>
        </a>
      </nav>
    </div>
  );
}
