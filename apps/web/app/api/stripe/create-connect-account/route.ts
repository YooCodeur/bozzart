import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const { artistProfileId, userId } = (await request.json()) as {
    artistProfileId: string;
    userId: string;
  };

  // Verifier que l'artiste existe et n'a pas deja un compte Connect
  const { data: artist } = await getSupabaseAdmin()
    .from("artist_profiles")
    .select("*")
    .eq("id", artistProfileId)
    .eq("user_id", userId)
    .single();

  if (!artist) {
    return NextResponse.json({ error: "Artiste non trouve" }, { status: 404 });
  }

  let accountId = artist.stripe_account_id;

  // Creer le compte Connect si pas encore fait
  if (!accountId) {
    const account = await getStripe().accounts.create({
      type: "express",
      country: "FR",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        artistProfileId,
        userId,
      },
    });

    accountId = account.id;

    await getSupabaseAdmin()
      .from("artist_profiles")
      .update({ stripe_account_id: accountId })
      .eq("id", artistProfileId);
  }

  // Creer le lien d'onboarding
  const accountLink = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://bozzart.art"}/dashboard/settings/stripe?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://bozzart.art"}/dashboard/settings/stripe?success=true`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
