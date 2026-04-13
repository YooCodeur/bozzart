import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  plan_id: string;
  return_url: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    // Client a l'echelle utilisateur pour recuperer l'identite
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return json({ error: "Unauthorized" }, 401);
    }
    const user = userRes.user;

    const body = (await req.json()) as Payload;
    if (!body?.plan_id || !body?.return_url) {
      return json({ error: "plan_id and return_url are required" }, 400);
    }

    // Service client : lire le plan et mettre a jour stripe_price_id
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: plan, error: planErr } = await adminClient
      .from("subscription_plans")
      .select("id, artist_id, name, description, price_monthly, currency, stripe_price_id, stripe_product_id, is_active, max_subscribers")
      .eq("id", body.plan_id)
      .single();

    if (planErr || !plan) return json({ error: "Plan not found" }, 404);
    if (!plan.is_active) return json({ error: "Plan inactive" }, 400);

    // Verifier la capacite max_subscribers
    if (plan.max_subscribers !== null && plan.max_subscribers !== undefined) {
      const { count } = await adminClient
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan_id", plan.id)
        .eq("status", "active");
      if ((count ?? 0) >= plan.max_subscribers) {
        return json({ error: "Plan full" }, 409);
      }
    }

    // Creer Product + Price Stripe si pas en cache
    let stripePriceId = plan.stripe_price_id as string | null;
    if (!stripePriceId) {
      const product = plan.stripe_product_id
        ? await stripe.products.retrieve(plan.stripe_product_id)
        : await stripe.products.create({
            name: `${plan.name}`,
            description: plan.description ?? undefined,
            metadata: { plan_id: plan.id, artist_id: plan.artist_id },
          });

      const price = await stripe.prices.create({
        unit_amount: plan.price_monthly,
        currency: plan.currency,
        recurring: { interval: "month" },
        product: product.id,
        metadata: { plan_id: plan.id, artist_id: plan.artist_id },
      });

      stripePriceId = price.id;
      await adminClient
        .from("subscription_plans")
        .update({ stripe_price_id: price.id, stripe_product_id: product.id })
        .eq("id", plan.id);
    }

    const returnUrl = body.return_url;
    const sep = returnUrl.includes("?") ? "&" : "?";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${returnUrl}${sep}subscribe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}${sep}subscribe=cancel`,
      subscription_data: {
        metadata: {
          plan_id: plan.id,
          artist_id: plan.artist_id,
          subscriber_id: user.id,
        },
      },
      metadata: {
        plan_id: plan.id,
        artist_id: plan.artist_id,
        subscriber_id: user.id,
      },
    });

    return json({ checkout_url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
