import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { calculateTransactionBreakdown } from "@bozzart/core";

export async function POST(request: NextRequest) {
  const { artworkId, conversationId, senderId } = (await request.json()) as {
    artworkId: string;
    conversationId: string;
    senderId: string;
  };

  // Verifier que l'artiste est bien le proprietaire de l'oeuvre
  const { data: artwork } = await getSupabaseAdmin()
    .from("artworks")
    .select("*, artist:artist_profiles(*)")
    .eq("id", artworkId)
    .single();

  if (!artwork) {
    return NextResponse.json({ error: "Oeuvre non trouvee" }, { status: 404 });
  }

  if (artwork.artist.user_id !== senderId) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  if (!artwork.artist.stripe_account_id) {
    return NextResponse.json({ error: "Paiements non configures" }, { status: 400 });
  }

  const breakdown = calculateTransactionBreakdown(
    artwork.price,
    artwork.artist.is_founder,
    artwork.price_currency,
  );

  // Creer un produit + prix Stripe, puis un Payment Link
  const product = await getStripe().products.create({
    name: artwork.title,
    images: [artwork.primary_image_url],
  });

  const price = await getStripe().prices.create({
    product: product.id,
    unit_amount: Math.round(breakdown.total * 100),
    currency: breakdown.currency.toLowerCase(),
  });

  const paymentLink = await getStripe().paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    application_fee_amount: Math.round(breakdown.platformFee * 100),
    transfer_data: {
      destination: artwork.artist.stripe_account_id,
    },
    metadata: {
      artworkId,
      conversationId,
      artistProfileId: artwork.artist_id,
    },
    after_completion: {
      type: "redirect",
      redirect: {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://bozzart.art"}/checkout/success?artwork=${artworkId}`,
      },
    },
  });

  // Inserer le message payment_link dans la conversation
  await getSupabaseAdmin().from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    type: "payment_link",
    payment_link_url: paymentLink.url,
    payment_link_amount: artwork.price,
    body: `Lien de paiement pour "${artwork.title}" — ${artwork.price} ${artwork.price_currency}`,
  });

  return NextResponse.json({ url: paymentLink.url });
}
