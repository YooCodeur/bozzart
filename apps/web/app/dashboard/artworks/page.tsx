"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { ArtworkStatus, ArtworkMedium } from "@bozzart/api";

interface ArtworkRow {
  id: string;
  title: string;
  slug: string;
  primary_image_url: string;
  price: number;
  price_currency: string;
  status: ArtworkStatus;
  medium: ArtworkMedium;
  created_at: string;
  published_at: string | null;
}

const statusLabels: Record<ArtworkStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  sold: "Vendue",
  reserved: "Réservée",
  archived: "Archivée",
};

const statusColors: Record<ArtworkStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  sold: "bg-blue-100 text-blue-700",
  reserved: "bg-yellow-100 text-yellow-700",
  archived: "bg-red-100 text-red-700",
};

export default function ArtworksListPage() {
  const { artistProfile } = useAuth();
  const [artworks, setArtworks] = useState<ArtworkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ArtworkStatus | "all">("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  function fetchArtworks() {
    if (!artistProfile) return;
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    let query = supabase
      .from("artworks")
      .select("id, title, slug, primary_image_url, price, price_currency, status, medium, created_at, published_at")
      .eq("artist_id", artistProfile.id)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    // Count query
    let countQuery = supabase
      .from("artworks")
      .select("id", { count: "exact", head: true })
      .eq("artist_id", artistProfile.id);
    if (filter !== "all") {
      countQuery = countQuery.eq("status", filter);
    }

    Promise.all([query, countQuery]).then(([{ data, error }, { count }]) => {
      if (error) {
        const msg = "Erreur lors du chargement des œuvres.";
        setError(msg);
        toast.error(msg);
      } else {
        setArtworks((data as ArtworkRow[]) || []);
        setTotalCount(count ?? 0);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    fetchArtworks();
  }, [artistProfile, filter, page]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes œuvres</h1>
        <Link
          href="/dashboard/artworks/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Nouvelle œuvre
        </Link>
      </div>

      {/* Filtres */}
      <div className="mt-6 flex gap-2">
        {(["all", "draft", "published", "sold", "archived"] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(0); }}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              filter === s ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "Toutes" : statusLabels[s]}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchArtworks}
            className="mt-2 rounded-md bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <p className="mt-8 text-gray-500" role="status" aria-live="polite">Chargement...</p>
      ) : artworks.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">Aucune œuvre pour le moment.</p>
          <Link
            href="/dashboard/artworks/new"
            className="mt-4 inline-block text-brand-600 hover:underline"
          >
            Créer ma première œuvre
          </Link>
        </div>
      ) : (
        <>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {artworks.map((artwork) => (
            <Link
              key={artwork.id}
              href={`/dashboard/artworks/${artwork.id}/edit`}
              className="group"
            >
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={artwork.primary_image_url}
                  alt={artwork.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <h3 className="mt-2 font-medium">{artwork.title}</h3>
              <p className="text-sm text-gray-600">{artwork.price} {artwork.price_currency}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${statusColors[artwork.status]}`}>
                {statusLabels[artwork.status]}
              </span>
            </Link>
          ))}
        </div>
        {totalCount > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="rounded-md border px-4 py-2 text-sm disabled:opacity-50">Précédent</button>
            <span className="text-sm text-foreground/60">Page {page + 1} sur {Math.ceil(totalCount / PAGE_SIZE)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= totalCount} className="rounded-md border px-4 py-2 text-sm disabled:opacity-50">Suivant</button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
