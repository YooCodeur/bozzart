import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";
import { getPrintProvider } from "../_shared/printing/provider.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  try {
    const { print_order_id } = await req.json();
    if (!print_order_id) {
      return new Response(JSON.stringify({ error: "print_order_id required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch order + nested product + artwork
    const { data: order, error } = await supabase
      .from("print_orders")
      .select(
        `id, quantity, shipping_address, status,
         print_product:print_products!inner(
           id, format, external_product_id,
           artwork:artworks!inner(id, image_url, title)
         )`,
      )
      .eq("id", print_order_id)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: "order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // deno-lint-ignore no-explicit-any
    const pp: any = Array.isArray(order.print_product) ? order.print_product[0] : order.print_product;
    // deno-lint-ignore no-explicit-any
    const artwork: any = Array.isArray(pp?.artwork) ? pp.artwork[0] : pp?.artwork;

    const provider = getPrintProvider();
    const result = await provider.createOrder({
      external_reference: order.id,
      artwork_image_url: artwork.image_url,
      format: pp.format,
      quantity: order.quantity,
      // deno-lint-ignore no-explicit-any
      shipping: order.shipping_address as any,
    });

    await supabase
      .from("print_orders")
      .update({ status: "printing" })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ ok: true, external_order_id: result.external_order_id }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
