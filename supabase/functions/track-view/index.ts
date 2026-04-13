import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface TrackViewRequest {
  type: "profile" | "artwork" | "discovery";
  artistId: string;
}

serve(async (req) => {
  const { type, artistId }: TrackViewRequest = await req.json();
  const today = new Date().toISOString().split("T")[0];

  // Upsert la ligne du jour
  const field =
    type === "profile" ? "profile_views" :
    type === "artwork" ? "artwork_views" :
    "discovery_impressions";

  // Essayer de mettre a jour
  const { data: existing } = await supabase
    .from("artist_analytics_daily")
    .select("id")
    .eq("artist_id", artistId)
    .eq("date", today)
    .single();

  if (existing) {
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

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
