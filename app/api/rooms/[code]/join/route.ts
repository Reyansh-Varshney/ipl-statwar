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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = getSupabaseClient();

    const { code } = await params;
    const session = await auth();
    const user = await currentUser();
    const userId = session?.userId || `anon-${Math.random().toString(36).substr(2, 9)}`;
    const nickname = user?.firstName || user?.username || "Player";

    // Get room ID
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", code)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if player already exists
    const { data: existingPlayer } = await supabase
      .from("room_players")
      .select("id")
      .eq("room_id", room.id)
      .eq("user_id", userId)
      .single();

    if (!existingPlayer) {
      await supabase.from("room_players").insert({
        room_id: room.id,
        user_id: userId,
        nickname: nickname,
      });
    }

    return NextResponse.json({ success: true, roomId: room.id });
  } catch (err) {
    console.error("[JOIN ERROR]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
