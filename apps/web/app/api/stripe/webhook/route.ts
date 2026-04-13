import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Desactiver le body parser de Next.js pour les webhooks Stripe
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Deleguer au handler principal (Edge Function Supabase)
  // Ce webhook est un fallback si l'Edge Function n'est pas configuree
  // En production, pointer Stripe vers l'Edge Function directement

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object;
      await getSupabaseAdmin()
        .from("artist_profiles")
        .update({
          stripe_onboarded: account.details_submitted ?? false,
          stripe_payouts_enabled: account.payouts_enabled ?? false,
        })
        .eq("stripe_account_id", account.id);
      break;
    }
    // Les autres events sont geres par l'Edge Function stripe-webhook
  }

  return NextResponse.json({ received: true });
}
