import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateQuiz } from "@/lib/ai/router";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables on server (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
  }
  return createClient(url, key);
}

const HEX_MAP: Record<string, string> = {
  easy: "#00",
  medium: "#55",
  hard: "#AA",
  extreme: "#FF",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  let supabase: any;

  try {
    supabase = getSupabaseClient();

    // 1. Get room details
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "generating") {
      return NextResponse.json(
        { error: "Room is not in generating state" },
        { status: 400 }
      );
    }

    // 2. Generate questions via AI Router
    const hexSeed = HEX_MAP[room.difficulty] ?? "#55";
    const questions = await generateQuiz(room.question_count, hexSeed, room.difficulty);

    // 3. Insert questions into DB
    const rows = questions.map((q, i) => ({
      room_id: room.id,
      sequence: i + 1,
      question: q.question,
      options: q.options,
      answer: q.answer,
      type: q.type,
    }));

    const { error: insertError } = await supabase.from("questions").insert(rows);
    if (insertError) throw insertError;

    // 4. Transition room to active (triggers Realtime for all clients)
    await supabase
      .from("rooms")
      .update({ status: "active" })
      .eq("id", room.id);

    return NextResponse.json({ success: true, count: rows.length });
  } catch (err) {
    console.error("[GENERATE] Failed:", err);
    // Rollback to waiting if generation fails
    await supabase
      .from("rooms")
      .update({ status: "waiting" })
      .eq("code", code);

    return NextResponse.json(
      { error: "Question generation failed. Please try again." },
      { status: 500 }
    );
  }
}
