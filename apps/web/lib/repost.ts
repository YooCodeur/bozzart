"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export interface RepostInput {
  artworkId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Cree un repost dans social_activities (activity_type = 'shared_artwork').
 *
 * NOTE : l'ecriture dans social_activities est reservee au service_role
 * (cf. migration 00017). En production, cet appel doit passer par une
 * edge function / route serveur (ex. POST /api/social/repost) qui utilise
 * la cle service_role. Cette helper centralise la logique cote client.
 */
export async function repostArtwork({ artworkId, metadata = {} }: RepostInput): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Vous devez etre connecte pour partager");
  }

  // TODO: remplacer par un appel a une route API `/api/social/repost`
  // qui utilise le client service_role. En attendant on tente l'insert
  // direct (echouera proprement si la RLS bloque).
  const { error } = await supabase.from("social_activities").insert({
    user_id: user.id,
    activity_type: "shared_artwork",
    target_id: artworkId,
    target_type: "artwork",
    metadata,
    is_public: true,
  });

  if (error) {
    // Silencieux : le lien a quand meme ete copie / partage nativement.
    // On log pour debug.
    // eslint-disable-next-line no-console
    console.warn("[repost] insert social_activities failed", error.message);
  }
}

export interface ShareLinkInput {
  title: string;
  url: string;
  text?: string;
}

/**
 * Declenche navigator.share() si disponible, sinon copie le lien.
 * Resout egalement les URL relatives en URL absolues.
 */
export async function shareArtworkLink({ title, url, text }: ShareLinkInput): Promise<void> {
  const absoluteUrl =
    typeof window !== "undefined" && url.startsWith("/") ? `${window.location.origin}${url}` : url;

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share({ title, text: text ?? title, url: absoluteUrl });
    return;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(absoluteUrl);
    return;
  }

  throw new Error("Le partage n'est pas supporte sur ce navigateur");
}
