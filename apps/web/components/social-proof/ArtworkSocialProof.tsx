"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export interface ArtworkSocialProofProps {
  artworkId: string;
  artistId: string;
  /** Affiche les avatars des premiers collectionneurs si la collection est publique. */
  showCollectors?: boolean;
}

interface ProofData {
  wishlistCount: number | null;
  followerCount: number | null;
  lastSaleDays: number | null;
  collectors: Array<{ id: string; display_name: string; avatar_url: string | null }>;
}

/**
 * Bloc de social proof affiche sur la page oeuvre.
 *
 * NOTE : les requetes ci-dessous sont STUB. Elles seront branchees dans une
 * phase ulterieure (cf. ROADMAP 16.3). Les TODO indiquent les RPC/vues
 * Supabase a creer.
 */
export function ArtworkSocialProof({ artworkId, artistId, showCollectors = true }: ArtworkSocialProofProps) {
  const [data, setData] = useState<ProofData>({
    wishlistCount: null,
    followerCount: null,
    lastSaleDays: null,
    collectors: [],
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    (async () => {
      // TODO(16.3): remplacer par une RPC agregee `artwork_social_proof(artwork_id)`
      // qui renvoie wishlist_count, last_sale_at, follower_count, collectors[] en
      // un seul round trip.

      // TODO: wishlist count — lire `artworks.wishlist_count` ou count(*) sur `wishlists`.
      const wishlistReq = supabase
        .from("artworks")
        .select("wishlist_count")
        .eq("id", artworkId)
        .maybeSingle();

      // TODO: follower count — count(*) sur `follows` where artist_id = artistId.
      const followerReq = supabase
        .from("follows")
        .select("follower_id", { count: "exact", head: true })
        .eq("artist_id", artistId);

      // TODO: derniere vente de l'artiste — max(created_at) sur transactions status=completed.
      const lastSaleReq = supabase
        .from("transactions")
        .select("created_at")
        .eq("artist_id", artistId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // TODO: avatars des premiers collectionneurs — join transactions -> profiles
      // filtre par is_collection_public=true. Stub : liste vide.
      const [wishlist, follower, lastSale] = await Promise.all([wishlistReq, followerReq, lastSaleReq]);

      if (cancelled) return;

      const lastSaleDays =
        lastSale.data?.created_at != null
          ? Math.floor((Date.now() - new Date(lastSale.data.created_at).getTime()) / 86_400_000)
          : null;

      setData({
        wishlistCount: wishlist.data?.wishlist_count ?? null,
        followerCount: follower.count ?? null,
        lastSaleDays,
        collectors: [], // TODO: voir ci-dessus
      });
    })().catch(() => {
      /* silent */
    });

    return () => {
      cancelled = true;
    };
  }, [artworkId, artistId]);

  const lines: string[] = [];
  if (data.wishlistCount && data.wishlistCount > 0) {
    lines.push(`${data.wishlistCount} personne${data.wishlistCount > 1 ? "s ont" : " a"} cette oeuvre en wishlist`);
  }
  if (data.lastSaleDays != null) {
    lines.push(`Derniere vente de cet artiste : il y a ${data.lastSaleDays} jour${data.lastSaleDays > 1 ? "s" : ""}`);
  }
  if (data.followerCount && data.followerCount > 0) {
    lines.push(`${data.followerCount} personne${data.followerCount > 1 ? "s suivent" : " suit"} cet artiste`);
  }

  if (lines.length === 0 && data.collectors.length === 0) return null;

  return (
    <section className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {showCollectors && data.collectors.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-neutral-400">Dans les collections de</span>
          <div className="flex -space-x-2">
            {data.collectors.slice(0, 5).map((c) =>
              c.avatar_url ? (
                <Image
                  key={c.id}
                  src={c.avatar_url}
                  alt={c.display_name}
                  width={24}
                  height={24}
                  className="rounded-full border border-neutral-900 object-cover"
                />
              ) : (
                <span
                  key={c.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-900 bg-neutral-800 text-[10px]"
                >
                  {c.display_name.charAt(0)}
                </span>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ArtworkSocialProof;
