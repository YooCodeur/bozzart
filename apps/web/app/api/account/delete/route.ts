import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const { userId, confirmation } = (await request.json()) as {
    userId: string;
    confirmation: string;
  };

  if (confirmation !== "SUPPRIMER MON COMPTE") {
    return NextResponse.json(
      { error: "Confirmation invalide. Tapez exactement : SUPPRIMER MON COMPTE" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  // Verifier que l'utilisateur existe
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Utilisateur non trouve" }, { status: 404 });
  }

  // Si artiste, verifier qu'il n'a pas de transactions en cours
  if (profile.role === "artist" || profile.role === "both") {
    const { data: artistProfile } = await supabase
      .from("artist_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (artistProfile) {
      const { data: pendingTx } = await supabase
        .from("transactions")
        .select("id")
        .eq("artist_id", artistProfile.id)
        .in("status", ["pending", "processing"])
        .limit(1);

      if (pendingTx && pendingTx.length > 0) {
        return NextResponse.json(
          { error: "Vous avez des transactions en cours. Attendez qu'elles soient completees avant de supprimer votre compte." },
          { status: 400 },
        );
      }
    }
  }

  // Supprimer l'utilisateur auth (cascade supprime profiles, artist_profiles, etc. via ON DELETE CASCADE)
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
