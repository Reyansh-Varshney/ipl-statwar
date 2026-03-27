import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth, currentUser } from "@clerk/nextjs/server";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables on server (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
  }
  return createClient(url, key);
}

const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const session = await auth();
    const user = await currentUser();
    const hostId = session?.userId || "anonymous-host-id";

    const body = await req.json();
    const { name, difficulty, question_count } = body;

    const code = generateRoomCode();

    const { data: room, error } = await supabase
      .from("rooms")
      .insert({
        code,
        host_id: hostId,
        status: "waiting", // initial state waiting for players
        difficulty: difficulty || "medium",
        question_count: question_count || 10,
      })
      .select()
      .single();

    if (error || !room) {
      console.error("[ROOM CREATE] DB Error:", error);
      return NextResponse.json({ error: "Failed to create room matching schema." }, { status: 500 });
    }
    
    // Also add the host to room_players
    await supabase.from("room_players").insert({
      room_id: room.id,
      user_id: hostId,
      nickname: user?.firstName || user?.username || "HostPlayer",
      joined_at: new Date().toISOString()
    });

    return NextResponse.json({ code: room.code, id: room.id });
  } catch (err) {
    console.error("[ROOM CREATE] Failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
