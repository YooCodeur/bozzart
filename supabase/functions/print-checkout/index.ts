import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

serve(async (req) => {
  try {
    const { print_product_id, quantity, shipping_address, buyer_id } = await req.json();
    if (!print_product_id || !shipping_address || !buyer_id) {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const qty = Number(quantity ?? 1);

    const { data: product, error } = await supabase
      .from("print_products")
      .select("id, format, retail_price_cents, is_enabled, artwork_id")
      .eq("id", print_product_id)
      .single();

    if (error || !product || !product.is_enabled) {
      return new Response(JSON.stringify({ error: "product unavailable" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create pending print_order first
    const { data: order, error: insertErr } = await supabase
      .from("print_orders")
      .insert({
        buyer_id,
        print_product_id: product.id,
        quantity: qty,
        shipping_address,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertErr || !order) {
      return new Response(JSON.stringify({ error: "could not create order" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Print ${product.format}` },
            unit_amount: product.retail_price_cents,
          },
          quantity: qty,
        },
      ],
      success_url: `${SITE_URL}/dashboard/print-orders?success=1`,
      cancel_url: `${SITE_URL}/dashboard/print-orders?canceled=1`,
      metadata: { print_order_id: order.id },
      shipping_address_collection: { allowed_countries: ["FR", "BE", "CH", "LU", "DE", "ES", "IT", "NL", "GB", "US", "CA"] },
    });

    return new Response(JSON.stringify({ url: session.url, id: session.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
