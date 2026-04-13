import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const { userId, format } = (await request.json()) as { userId: string; format?: "json" | "zip" };

  if (!userId) {
    return NextResponse.json({ error: "userId requis" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  const { data: artistProfile } = await supabase.from("artist_profiles").select("*").eq("user_id", userId).single();
  const { data: artworks } = await supabase.from("artworks").select("*").eq("artist_id", artistProfile?.id).order("created_at", { ascending: false });
  const { data: series } = await supabase.from("artwork_series").select("*").eq("artist_id", artistProfile?.id);
  const { data: posts } = await supabase.from("carnet_posts").select("*").eq("artist_id", artistProfile?.id).order("created_at", { ascending: false });
  const { data: conversations } = await supabase.from("conversations").select("*, messages(*)").or(`buyer_id.eq.${userId},artist_id.eq.${artistProfile?.id}`);
  const { data: transactions } = await supabase.from("transactions").select("*").or(`buyer_id.eq.${userId},artist_id.eq.${artistProfile?.id}`).order("created_at", { ascending: false });
  const { data: collection } = await supabase.from("buyer_collections").select("*").eq("user_id", userId);
  const { data: followers } = await supabase.from("follows").select("follower_id, created_at").eq("artist_id", artistProfile?.id);
  const { data: following } = await supabase.from("follows").select("artist_id, created_at").eq("follower_id", userId);
  const { data: analytics } = await supabase.from("artist_analytics_daily").select("*").eq("artist_id", artistProfile?.id).order("date", { ascending: false });

  const exportData = {
    exported_at: new Date().toISOString(),
    platform: "Bozzart (bozzart.art)",
    profile,
    artist_profile: artistProfile,
    artworks: artworks || [],
    series: series || [],
    carnet_posts: posts || [],
    conversations: conversations || [],
    transactions: transactions || [],
    buyer_collection: collection || [],
    followers: followers || [],
    following: following || [],
    analytics: analytics || [],
    media_urls: [
      ...(artworks || []).flatMap((a) => [a.primary_image_url, ...(a.image_urls || [])]),
      ...(posts || []).flatMap((p) => p.media_urls || []),
    ].filter(Boolean),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="bozzart-export-${userId.slice(0, 8)}.json"`,
    },
  });
}
