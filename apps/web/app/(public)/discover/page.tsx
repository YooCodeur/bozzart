"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { TrackView } from "@/components/tracking/track-view";

interface DiscoveryArtwork {
  id: string;
  title: string;
  primary_image_url: string;
  slug: string;
  medium: string | null;
  artist_id: string;
  artist: { full_name: string; slug: string };
  // computed client-side
  _score?: number;
  _pinned?: boolean;
}

interface ScoreRow {
  id: string;
  artist_id: string;
  medium: string | null;
  popularity_score: number;
  freshness_score: number;
  artist_score: number;
  artwork: {
    id: string;
    title: string;
    primary_image_url: string;
    slug: string;
    medium: string | null;
    artist_id: string;
    status: string;
    artist: { full_name: string; slug: string } | null;
  } | null;
}

export default function DiscoverPage() {
  const [artworks, setArtworks] = useState<DiscoveryArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const today = new Date().toISOString().split("T")[0];

    (async () => {
      try {
        // 1) Fetch top-scored artworks from artwork_scores joined with artworks.
        const { data: scored, error: scoredErr } = await supabase
          .from("artwork_scores")
          .select(
            "id, artist_id, medium, popularity_score, freshness_score, artist_score, artwork:artworks!inner(id, title, primary_image_url, slug, medium, artist_id, status, artist:artist_profiles(full_name, slug))",
          )
          .limit(50);

        if (scoredErr) throw scoredErr;

        // 2) Fetch today's admin-pinned discovery_slots → boost +50.
        const { data: slots } = await supabase
          .from("discovery_slots")
          .select("artwork_id")
          .eq("slot_date", today)
          .eq("is_active", true);

        const pinned = new Set<string>((slots || []).map((s: { artwork_id: string }) => s.artwork_id));

        // 3) Hide artworks user marked "not_interested".
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        let hiddenIds = new Set<string>();
        if (userId) {
          const { data: signals } = await supabase
            .from("feed_signals")
            .select("artwork_id")
            .eq("user_id", userId)
            .eq("signal_type", "not_interested");
          hiddenIds = new Set<string>((signals || []).map((s: { artwork_id: string }) => s.artwork_id));
        }

        const combined = ((scored as unknown as ScoreRow[]) || [])
          .map((s) => {
            if (!s.artwork || s.artwork.status !== "published") return null;
            const base =
              Number(s.popularity_score || 0) +
              Number(s.freshness_score || 0) +
              Number(s.artist_score || 0);
            const boost = pinned.has(s.id) ? 50 : 0;
            const a: DiscoveryArtwork = {
              id: s.artwork.id,
              title: s.artwork.title,
              primary_image_url: s.artwork.primary_image_url,
              slug: s.artwork.slug,
              medium: s.artwork.medium,
              artist_id: s.artwork.artist_id,
              artist: s.artwork.artist || { full_name: "", slug: "" },
              _score: base + boost,
              _pinned: boost > 0,
            };
            return a;
          })
          .filter((x): x is DiscoveryArtwork => x !== null)
          .filter((a) => !hiddenIds.has(a.id))
          .sort((a, b) => (b._score || 0) - (a._score || 0))
          .slice(0, 20);

        if (combined.length === 0) {
          // Fallback: latest published artworks.
          const { data: fallback, error: fbErr } = await supabase
            .from("artworks")
            .select("id, title, primary_image_url, slug, medium, artist_id, artist:artist_profiles(full_name, slug)")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(20);
          if (fbErr) throw fbErr;
          setArtworks((fallback as unknown as DiscoveryArtwork[]) || []);
        } else {
          setArtworks(combined);
        }
      } catch {
        setError("Impossible de charger les œuvres.");
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const container = e.currentTarget as HTMLElement;
    if (e.key === "ArrowDown" || e.key === " ") {
      e.preventDefault();
      container.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      container.scrollBy({ top: -window.innerHeight, behavior: "smooth" });
    }
  }, []);

  const handleNotInterested = useCallback(async (artworkId: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      toast.error("Connectez-vous pour personnaliser votre decouverte.");
      return;
    }
    const { error: insErr } = await supabase
      .from("feed_signals")
      .insert({ user_id: userId, artwork_id: artworkId, signal_type: "not_interested" });
    if (insErr) {
      toast.error("Erreur, reessayez.");
      return;
    }
    setHidden((prev) => new Set(prev).add(artworkId));
    toast.success("Merci pour ce signal.");
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black" role="status" aria-live="polite">
        <p className="text-white/80">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black gap-4">
        <p className="text-white/80">{error}</p>
        <button onClick={() => window.location.reload()} className="rounded-md bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition">
          Réessayer
        </button>
      </div>
    );
  }

  const visible = artworks.filter((a) => !hidden.has(a.id));

  if (visible.length === 0) {
    return <div className="flex h-screen items-center justify-center bg-black"><p className="text-white/80">Aucune œuvre à découvrir.</p></div>;
  }

  return (
    <main
      id="main-content"
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Bouton retour */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 rounded-full bg-black/40 px-4 py-2 text-sm text-white backdrop-blur-sm hover:bg-black/60 transition"
        aria-label="Retour a l'accueil"
      >
        ← Bozzart
      </Link>

      {visible.map((artwork, index) => (
        <section key={artwork.id} className="relative h-screen w-full snap-start snap-always">
          <TrackView type="discovery" artistId={artwork.artist_id} />

          {/* Image plein ecran */}
          <Image
            src={artwork.primary_image_url}
            alt={artwork.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority={index < 2}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Pas interesse */}
          <button
            onClick={() => handleNotInterested(artwork.id)}
            className="fixed top-6 right-6 z-50 rounded-full bg-black/40 px-4 py-2 text-sm text-white backdrop-blur-sm hover:bg-black/60 transition"
            aria-label="Pas interesse par cette oeuvre"
          >
            Pas interesse
          </button>

          {/* Infos — sans prix */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <Link href={`/${artwork.artist.slug}`} className="text-sm text-white/70 hover:text-white transition">
              {artwork.artist.full_name}
            </Link>
            <h2 className="mt-1 text-3xl font-bold">{artwork.title}</h2>
            {artwork.medium && (
              <p className="mt-1 text-sm uppercase tracking-wide text-white/60">{artwork.medium}</p>
            )}

            <div className="mt-6 flex gap-3">
              <Link
                href={`/${artwork.artist.slug}/artwork/${artwork.slug}`}
                className="rounded-md bg-white px-6 py-3 font-medium text-black hover:bg-gray-100 transition"
              >
                Decouvrir cette oeuvre
              </Link>
            </div>
          </div>

          {/* Indicateur scroll */}
          {index < visible.length - 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 animate-bounce">
              <svg className="h-6 w-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="sr-only">Défiler pour voir plus</span>
            </div>
          )}
        </section>
      ))}
    </main>
  );
}
