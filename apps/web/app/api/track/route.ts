import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const { type, artistId } = (await request.json()) as {
    type: "profile" | "artwork" | "discovery";
    artistId: string;
  };

  if (!artistId || !type) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split("T")[0]!;

  const fieldMap = {
    profile: "profile_views",
    artwork: "artwork_views",
    discovery: "discovery_impressions",
  } as const;

  const field = fieldMap[type];

  // Upsert : creer la ligne du jour si elle n'existe pas, puis incrementer
  const { data: existing } = await supabase
    .from("artist_analytics_daily")
    .select("id")
    .eq("artist_id", artistId)
    .eq("date", today)
    .single();

  if (existing) {
    // Increment atomique via RPC
    await supabase.rpc("increment_analytics", {
      row_id: existing.id,
      field_name: field,
    });
  } else {
    await supabase.from("artist_analytics_daily").insert({
      artist_id: artistId,
      date: today,
      [field]: 1,
    });
  }

  return NextResponse.json({ ok: true });
}
