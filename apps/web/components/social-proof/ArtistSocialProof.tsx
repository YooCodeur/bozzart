"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export interface ArtistSocialProofProps {
  artistId: string;
  /** Si l'artiste est en mode "Silence", on masque le nombre de ventes. */
  silenceMode?: boolean;
}

interface ProofData {
  salesCount: number | null;
  lastActivityHours: number | null;
  notableFollowers: Array<{ id: string; display_name: string }>;
}

/**
 * Bloc de social proof affiche sur la page artiste.
 *
 * NOTE : STUB — cf. TODO ci-dessous. A brancher lors d'une phase ulterieure.
 */
export function ArtistSocialProof({ artistId, silenceMode = false }: ArtistSocialProofProps) {
  const [data, setData] = useState<ProofData>({
    salesCount: null,
    lastActivityHours: null,
    notableFollowers: [],
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    (async () => {
      // TODO(16.3): RPC `artist_social_proof(artist_id)` agregee.

      // TODO: nombre de ventes — count(*) transactions where artist_id & status=completed.
      const salesReq = silenceMode
        ? Promise.resolve({ count: null as number | null })
        : supabase
            .from("transactions")
            .select("id", { count: "exact", head: true })
            .eq("artist_id", artistId)
            .eq("status", "completed");

      // TODO: derniere publication — max(created_at) entre carnet_posts et artworks.
      const lastPostReq = supabase
        .from("carnet_posts")
        .select("created_at")
        .eq("artist_id", artistId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // TODO: "suivi par [collectionneurs connus]" — joindre follows -> profiles
      // filtrer les profils avec un flag `is_notable` ou haut score. Stub vide.

      const [sales, lastPost] = await Promise.all([salesReq, lastPostReq]);
      if (cancelled) return;

      const lastActivityHours =
        lastPost.data?.created_at != null
          ? Math.floor((Date.now() - new Date(lastPost.data.created_at).getTime()) / 3_600_000)
          : null;

      setData({
        salesCount: "count" in sales ? sales.count : null,
        lastActivityHours,
        notableFollowers: [], // TODO: voir ci-dessus
      });
    })().catch(() => {
      /* silent */
    });

    return () => {
      cancelled = true;
    };
  }, [artistId, silenceMode]);

  const lines: string[] = [];
  if (!silenceMode && data.salesCount != null && data.salesCount > 0) {
    lines.push(`${data.salesCount} oeuvre${data.salesCount > 1 ? "s vendues" : " vendue"}`);
  }
  if (data.lastActivityHours != null) {
    if (data.lastActivityHours < 1) {
      lines.push("Actif il y a moins d'une heure");
    } else if (data.lastActivityHours < 24) {
      lines.push(`Actif il y a ${data.lastActivityHours} heure${data.lastActivityHours > 1 ? "s" : ""}`);
    } else {
      const days = Math.floor(data.lastActivityHours / 24);
      lines.push(`Actif il y a ${days} jour${days > 1 ? "s" : ""}`);
    }
  }

  if (lines.length === 0 && data.notableFollowers.length === 0) return null;

  return (
    <section className="space-y-1 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {data.notableFollowers.length > 0 && (
        <p className="text-xs text-neutral-400">
          Suivi par{" "}
          {data.notableFollowers
            .slice(0, 3)
            .map((f) => f.display_name)
            .join(", ")}
        </p>
      )}
    </section>
  );
}

export default ArtistSocialProof;
