import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { calculateTransactionBreakdown } from "@bozzart/core";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = rateLimit(`payment:${ip}`, { windowMs: 60_000, maxRequests: 10 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  const body = await request.json();
  const { artworkId, buyerId, guestEmail, guestName } = body as {
    artworkId: string;
    buyerId?: string;
    guestEmail?: string;
    guestName?: string;
  };

  // Recuperer l'oeuvre et l'artiste
  const { data: artwork, error: artworkError } = await getSupabaseAdmin()
    .from("artworks")
    .select("*, artist:artist_profiles(*)")
    .eq("id", artworkId)
    .eq("status", "published")
    .single();

  if (artworkError || !artwork) {
    return NextResponse.json({ error: "Oeuvre non trouvee ou non disponible" }, { status: 404 });
  }

  if (!artwork.artist.stripe_account_id || !artwork.artist.stripe_onboarded) {
    return NextResponse.json({ error: "L'artiste n'a pas configure ses paiements" }, { status: 400 });
  }

  // Calculer le split
  const breakdown = calculateTransactionBreakdown(
    artwork.price,
    artwork.artist.is_founder,
    artwork.price_currency,
  );

  // Creer la transaction en base
  const { data: transaction, error: txError } = await getSupabaseAdmin()
    .from("transactions")
    .insert({
      artwork_id: artworkId,
      buyer_id: buyerId || null,
      artist_id: artwork.artist_id,
      amount: breakdown.total,
      platform_fee: breakdown.platformFee,
      artist_amount: breakdown.artistAmount,
      currency: breakdown.currency,
      guest_email: guestEmail || null,
      guest_name: guestName || null,
      status: "pending",
    })
    .select()
    .single();

  if (txError || !transaction) {
    return NextResponse.json({ error: "Erreur creation transaction" }, { status: 500 });
  }

  // Creer le PaymentIntent Stripe avec split automatique
  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(breakdown.total * 100), // En centimes
    currency: breakdown.currency.toLowerCase(),
    application_fee_amount: Math.round(breakdown.platformFee * 100), // Commission plateforme
    transfer_data: {
      destination: artwork.artist.stripe_account_id,
    },
    metadata: {
      transactionId: transaction.id,
      artworkId,
      artistId: artwork.artist_id,
    },
    automatic_payment_methods: { enabled: true },
  });

  // Mettre a jour la transaction avec l'ID Stripe
  await getSupabaseAdmin()
    .from("transactions")
    .update({
      stripe_payment_intent_id: paymentIntent.id,
      status: "processing",
    })
    .eq("id", transaction.id);

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    transactionId: transaction.id,
    breakdown,
  });
}
