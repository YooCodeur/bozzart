// ─── boost-checkout ─────────────────────────────────────────
// Cree une session Stripe Checkout one-time pour booster une oeuvre.
// Retourne { url } a rediriger cote client.
// Le webhook "checkout.session.completed" (stripe-webhook) active le boost
// en se basant sur metadata.boost_id.
// ────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "missing auth" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verifier l'utilisateur a partir du JWT
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "unauthenticated" }, 401);

    const { artwork_id, duration_days } = await req.json();
    if (!artwork_id || ![1, 3, 7, 14, 30].includes(Number(duration_days))) {
      return json({ error: "invalid payload" }, 400);
    }

    // Charger oeuvre + profil artiste
    const { data: artwork } = await supabase
      .from("artworks")
      .select("id, title, artist_id")
      .eq("id", artwork_id)
      .single();
    if (!artwork) return json({ error: "artwork not found" }, 404);

    const { data: artist } = await supabase
      .from("artist_profiles")
      .select("id, user_id")
      .eq("id", artwork.artist_id)
      .single();
    if (!artist || artist.user_id !== user.id) {
      return json({ error: "forbidden" }, 403);
    }

    const { data: pricing } = await supabase
      .from("boost_pricing")
      .select("*")
      .eq("duration_days", duration_days)
      .single();
    if (!pricing) return json({ error: "pricing missing" }, 500);

    // Creer l'enregistrement boost en 'pending'
    const { data: boost, error: boostErr } = await supabase
      .from("artwork_boosts")
      .insert({
        artwork_id: artwork.id,
        artist_id: artwork.artist_id,
        duration_days,
        price_cents: pricing.price_cents,
        currency: pricing.currency,
        status: "pending",
      })
      .select()
      .single();
    if (boostErr || !boost) return json({ error: "boost create failed" }, 500);

    const origin = req.headers.get("origin") || Deno.env.get("PUBLIC_SITE_URL") || "https://bozzart.art";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: pricing.currency.toLowerCase(),
            unit_amount: pricing.price_cents,
            product_data: {
              name: `Boost ${pricing.label} — ${artwork.title}`,
              description: `Mise en avant de l'oeuvre pendant ${pricing.label}.`,
            },
          },
        },
      ],
      success_url: `${origin}/dashboard/artworks/${artwork.id}/boost?success=1`,
      cancel_url: `${origin}/dashboard/artworks/${artwork.id}/boost?cancelled=1`,
      metadata: {
        boost_id: boost.id,
        artwork_id: artwork.id,
        artist_id: artwork.artist_id,
        duration_days: String(duration_days),
      },
    });

    await supabase
      .from("artwork_boosts")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", boost.id);

    return json({ url: session.url, boost_id: boost.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return json({ error: message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
