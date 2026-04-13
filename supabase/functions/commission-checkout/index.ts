import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

// Platform commission on custom commissions: 10% (same as regular sales)
const PLATFORM_COMMISSION_RATE = 0.10;

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Supabase client scoped to the caller's JWT (RLS applies)
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userResp, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userResp.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userResp.user;

    const { commission_id } = await req.json();
    if (!commission_id) {
      return new Response(JSON.stringify({ error: "commission_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch commission (RLS: buyer/artist only)
    const { data: commission, error: fetchErr } = await supabaseUser
      .from("commissions")
      .select(
        "id, buyer_id, artist_id, title, status, artist_price_cents, currency",
      )
      .eq("id", commission_id)
      .single();

    if (fetchErr || !commission) {
      return new Response(JSON.stringify({ error: "Commission not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (commission.buyer_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (commission.status !== "accepted") {
      return new Response(
        JSON.stringify({ error: "Commission must be in 'accepted' status" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!commission.artist_price_cents || commission.artist_price_cents <= 0) {
      return new Response(
        JSON.stringify({ error: "Artist has not set a price yet" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Look up artist Stripe Connect account (service role via separate client)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: artist } = await supabaseAdmin
      .from("artist_profiles")
      .select("stripe_account_id, full_name")
      .eq("user_id", commission.artist_id)
      .single();

    const amount = commission.artist_price_cents;
    const currency = (commission.currency ?? "eur").toLowerCase();
    const platformFee = Math.round(amount * PLATFORM_COMMISSION_RATE);

    const origin =
      req.headers.get("origin") ??
      Deno.env.get("NEXT_PUBLIC_SITE_URL") ??
      "https://bozzart.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Commande sur mesure — ${commission.title}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        ...(artist?.stripe_account_id
          ? { transfer_data: { destination: artist.stripe_account_id } }
          : {}),
        metadata: {
          commission_id: commission.id,
          type: "commission",
        },
      },
      metadata: {
        commission_id: commission.id,
        type: "commission",
      },
      success_url: `${origin}/dashboard/commissions?success=1&commission=${commission.id}`,
      cancel_url: `${origin}/dashboard/commissions?canceled=1&commission=${commission.id}`,
    });

    // Persist session id
    await supabaseAdmin
      .from("commissions")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", commission.id);

    return new Response(
      JSON.stringify({ url: session.url, id: session.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
