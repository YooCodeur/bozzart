// Estimate artwork value — Phase 24.3
// Stub naif "naive-comparables-v0" : 25th / 75th percentile des ventes comparables
// (meme artiste + meme medium + taille proche). TODO: ML model.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface Req {
  artworkId: string;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function parseDims(s: string | null | undefined): number | null {
  if (!s) return null;
  const nums = (s.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => parseFloat(n.replace(",", ".")));
  if (nums.length < 2) return null;
  return nums[0] * nums[1];
}

serve(async (req) => {
  try {
    const { artworkId }: Req = await req.json();
    if (!artworkId) {
      return new Response(JSON.stringify({ error: "artworkId required" }), { status: 400 });
    }

    const { data: artwork, error: awErr } = await supabase
      .from("artworks")
      .select("id, artist_id, medium, dimensions")
      .eq("id", artworkId)
      .single();

    if (awErr || !artwork) {
      return new Response(JSON.stringify({ error: "artwork not found" }), { status: 404 });
    }

    const targetArea = parseDims(artwork.dimensions);

    const { data: comps } = await supabase
      .from("transactions")
      .select("amount, artwork:artworks!inner(id, medium, artist_id, dimensions)")
      .eq("status", "completed")
      .eq("artwork.artist_id", artwork.artist_id)
      .eq("artwork.medium", artwork.medium);

    let sales = ((comps || []) as { amount: number; artwork: { dimensions: string | null } }[])
      .map((c) => ({ amount: Number(c.amount), area: parseDims(c.artwork?.dimensions) }));

    // Filtrer par taille +/- 50% si on a une cible
    if (targetArea && sales.some((s) => s.area != null)) {
      const lo = targetArea * 0.5;
      const hi = targetArea * 1.5;
      const filtered = sales.filter((s) => s.area != null && s.area >= lo && s.area <= hi);
      if (filtered.length >= 3) sales = filtered;
    }

    const prices = sales.map((s) => s.amount).sort((a, b) => a - b);
    if (prices.length < 3) {
      return new Response(
        JSON.stringify({ error: "insufficient comparables", sample_size: prices.length }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const p25 = percentile(prices, 0.25);
    const p75 = percentile(prices, 0.75);
    const confidence = Math.min(1, prices.length / 20);

    const estimated_low_cents = Math.round(p25 * 100);
    const estimated_high_cents = Math.round(p75 * 100);

    const { error: insErr } = await supabase.from("value_estimates").insert({
      artwork_id: artworkId,
      estimated_low_cents,
      estimated_high_cents,
      confidence,
      model_version: "naive-comparables-v0",
    });

    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        estimated_low_cents,
        estimated_high_cents,
        confidence,
        sample_size: prices.length,
        model_version: "naive-comparables-v0",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
