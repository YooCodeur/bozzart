import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId");
  const medium = searchParams.get("medium");

  if (!artistId) {
    return NextResponse.json({ error: "artistId requis" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("artworks")
    .select("price")
    .eq("artist_id", artistId)
    .eq("status", "published");

  if (medium) {
    query = query.eq("medium", medium);
  }

  const { data: artworks } = await query;

  if (!artworks || artworks.length === 0) {
    return NextResponse.json({ min: 0, max: 0, median: 0, count: 0 });
  }

  const prices = artworks.map((a) => a.price).sort((a, b) => a - b);
  const count = prices.length;
  const min = prices[0]!;
  const max = prices[count - 1]!;
  const median = count % 2 === 0
    ? (prices[count / 2 - 1]! + prices[count / 2]!) / 2
    : prices[Math.floor(count / 2)]!;

  return NextResponse.json({ min, max, median, count });
}
