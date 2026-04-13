"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ArtistMap } from "@/components/map/artist-map";

interface ArtistRow {
  id: string;
  slug: string;
  full_name: string;
  location_city: string | null;
  location_country: string | null;
  location_lat: number | null;
  location_lng: number | null;
  follower_count: number;
  artwork_count: number;
  is_verified: boolean;
  is_founder: boolean;
  profiles: { avatar_url: string | null; bio: string | null };
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<ArtistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "map">("grid");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Debounce de 300ms sur la recherche
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setError(null);
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from("artist_profiles")
        .select("id, slug, full_name, location_city, location_country, location_lat, location_lng, follower_count, artwork_count, is_verified, is_founder, profiles!inner(avatar_url, bio)")
        .gt("artwork_count", 0)
        .order("follower_count", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (search) {
        query = query.ilike("full_name", `%${search}%`);
      }
      if (country) {
        query = query.eq("location_country", country);
      }

      // Count query
      let countQuery = supabase
        .from("artist_profiles")
        .select("id", { count: "exact", head: true })
        .gt("artwork_count", 0);
      if (search) {
        countQuery = countQuery.ilike("full_name", `%${search}%`);
      }
      if (country) {
        countQuery = countQuery.eq("location_country", country);
      }

      Promise.all([
        query,
        countQuery,
      ]).then(([{ data, error: err }, { count }]) => {
        if (err) {
          setError("Impossible de charger les artistes.");
          toast.error("Erreur de chargement");
        } else {
          setArtists((data as unknown as ArtistRow[]) || []);
          setTotalCount(count ?? 0);
        }
        setLoading(false);
      });
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search, country, page]);
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <h1 className="text-3xl font-bold">Artistes</h1>
        <p className="mt-2 text-foreground/60">Découvrez les artistes présents sur Bozzart</p>

        {/* Vue toggle */}
        <div className="mt-6 flex gap-2" role="radiogroup" aria-label="Mode d'affichage">
          <button
            onClick={() => setView("grid")}
            role="radio"
            aria-checked={view === "grid"}
            className={`rounded-full px-4 py-1.5 text-sm ${view === "grid" ? "bg-black text-white" : "bg-gray-100"}`}
          >
            Grille
          </button>
          <button
            onClick={() => setView("map")}
            role="radio"
            aria-checked={view === "map"}
            className={`rounded-full px-4 py-1.5 text-sm ${view === "map" ? "bg-black text-white" : "bg-gray-100"}`}
          >
            Carte
          </button>
        </div>

        {/* Filtres */}
        <div className="mt-4 flex gap-4">
          <div className="flex-1">
            <label htmlFor="artist-search" className="sr-only">Rechercher un artiste</label>
            <input
              id="artist-search"
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Rechercher un artiste..."
              className="w-full rounded-md border border-gray-300 px-4 py-2"
            />
          </div>
          <div>
            <label htmlFor="country-filter" className="sr-only">Filtrer par pays</label>
            <select
              id="country-filter"
              value={country}
              onChange={(e) => { setCountry(e.target.value); setPage(0); }}
              className="rounded-md border border-gray-300 px-4 py-2"
            >
              <option value="">Tous les pays</option>
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Canada">Canada</option>
              <option value="Allemagne">Allemagne</option>
              <option value="Espagne">Espagne</option>
              <option value="Italie">Italie</option>
              <option value="Royaume-Uni">Royaume-Uni</option>
              <option value="Etats-Unis">États-Unis</option>
              <option value="Japon">Japon</option>
            </select>
          </div>
        </div>

        {/* Carte */}
        {view === "map" && !loading && (
          <div className="mt-8">
            {artists.filter((a) => a.location_lat && a.location_lng).length > 0 ? (
              <ArtistMap
                artists={artists
                  .filter((a) => a.location_lat && a.location_lng)
                  .map((a) => ({
                    slug: a.slug,
                    full_name: a.full_name,
                    location_lat: a.location_lat!,
                    location_lng: a.location_lng!,
                    location_city: a.location_city || "",
                    artwork_count: a.artwork_count,
                  }))}
              />
            ) : (
              <p className="py-12 text-center text-foreground/60">Aucun artiste avec une localisation a afficher sur la carte.</p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-12 text-center">
            <p className="text-red-600" role="alert">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
              Réessayer
            </button>
          </div>
        )}

        {!error && loading ? (
          <p>Chargement...</p>
        ) : !error && artists.length === 0 ? (
          <p>Aucun artiste.</p>
        ) : !error && view === "grid" ? (
          <>
          <div>grid</div>
          <div>pagination</div>
          </>
        ) : null}
      </div>
    </main>
  );
}
