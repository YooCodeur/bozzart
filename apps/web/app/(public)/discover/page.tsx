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
  price: number;
  price_currency: string;
  slug: string;
  artist_id: string;
  artist: { full_name: string; slug: string };
}

export default function DiscoverPage() {
  const [artworks, setArtworks] = useState<DiscoveryArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const today = new Date().toISOString().split("T")[0];

    supabase
      .from("discovery_slots")
      .select("artwork:artworks(id, title, primary_image_url, price, price_currency, slug, artist_id, artist:artist_profiles(full_name, slug))")
      .eq("slot_date", today)
      .eq("is_active", true)
      .order("slot_hour", { ascending: true })
      .then(({ data, error: err }) => {
        if (err) {
          setError("Impossible de charger les œuvres.");
          toast.error("Erreur de chargement");
          setLoading(false);
          return;
        }

        const items = (data || [])
          .map((d) => d.artwork as unknown as DiscoveryArtwork)
          .filter(Boolean);

        if (items.length === 0) {
          supabase
            .from("artworks")
            .select("id, title, primary_image_url, price, price_currency, slug, artist_id, artist:artist_profiles(full_name, slug)")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(20)
            .then(({ data: fallback, error: fallbackErr }) => {
              if (fallbackErr) {
                setError("Impossible de charger les œuvres.");
                toast.error("Erreur de chargement");
              } else {
                setArtworks((fallback as unknown as DiscoveryArtwork[]) || []);
              }
              setLoading(false);
            });
        } else {
          setArtworks(items);
          setLoading(false);
        }
      });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const container = e.currentTarget as HTMLElement;
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        container.scrollBy({ top: window.innerHeight, behavior: "smooth" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        container.scrollBy({ top: -window.innerHeight, behavior: "smooth" });
      }
    },
    [],
  );

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

  if (artworks.length === 0) {
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

      {artworks.map((artwork, index) => (
        <section
          key={artwork.id}
          className="relative h-screen w-full snap-start snap-always"
        >
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

          {/* Infos */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <Link href={`/${artwork.artist.slug}`} className="text-sm text-white/70 hover:text-white transition">
              {artwork.artist.full_name}
            </Link>
            <h2 className="mt-1 text-3xl font-bold">{artwork.title}</h2>
            <p className="mt-2 text-xl">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: artwork.price_currency }).format(artwork.price)}
            </p>

            <div className="mt-6 flex gap-3">
              <Link
                href={`/${artwork.artist.slug}/artwork/${artwork.slug}`}
                className="rounded-md bg-white px-6 py-3 font-medium text-black hover:bg-gray-100 transition"
              >
                Voir l&apos;œuvre
              </Link>
              <Link
                href={`/checkout/${artwork.id}`}
                className="rounded-md border border-white/30 px-6 py-3 text-white hover:bg-white/10 transition"
              >
                Acheter
              </Link>
            </div>
          </div>

          {/* Indicateur scroll */}
          {index < artworks.length - 1 && (
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
