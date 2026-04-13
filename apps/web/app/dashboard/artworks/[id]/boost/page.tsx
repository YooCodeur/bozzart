"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface PriceRow {
  duration_days: number;
  price_cents: number;
  currency: string;
  label: string;
}

interface Artwork {
  id: string;
  title: string;
  primary_image_url: string;
  artist_id: string;
}

export default function BoostArtworkPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { artistProfile } = useAuth();

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [selected, setSelected] = useState<number>(7);
  const [hasActive, setHasActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    Promise.all([
      supabase
        .from("artworks")
        .select("id, title, primary_image_url, artist_id")
        .eq("id", params.id)
        .single(),
      supabase.from("boost_pricing").select("*").order("duration_days"),
      supabase
        .from("artwork_boosts")
        .select("id")
        .eq("artwork_id", params.id)
        .eq("status", "active")
        .limit(1),
    ]).then(([aw, pr, act]) => {
      if (aw.data) setArtwork(aw.data as Artwork);
      if (pr.data) setPrices(pr.data as PriceRow[]);
      setHasActive(Boolean(act.data && act.data.length > 0));
    });
  }, [params.id]);

  const selectedPrice = prices.find((p) => p.duration_days === selected);

  async function handleBoost() {
    if (!artwork || !artistProfile || !selectedPrice) return;
    if (artwork.artist_id !== artistProfile.id) {
      toast.error("Vous n'etes pas le proprietaire de cette oeuvre.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.functions.invoke("boost-checkout", {
        body: {
          artwork_id: artwork.id,
          duration_days: selected,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        toast.error("Reponse Stripe invalide.");
      }
    } catch (e) {
      toast.error((e as Error).message || "Impossible de demarrer le paiement.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!artwork) {
    return <div className="p-8 text-sm text-gray-500">Chargement de l&apos;oeuvre…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        ← Retour
      </button>
      <h1 className="mt-4 text-2xl font-bold">Booster « {artwork.title} »</h1>
      <p className="mt-1 text-sm text-gray-500">
        Mettez votre oeuvre en avant dans le feed Discover. +100 au score de pertinence
        pendant la duree choisie.
      </p>

      {hasActive && (
        <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Cette oeuvre a deja un boost actif. Vous pouvez en lancer un nouveau apres
          expiration.
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prices.map((p) => (
          <button
            key={p.duration_days}
            onClick={() => setSelected(p.duration_days)}
            className={`rounded-lg border p-4 text-left transition ${
              selected === p.duration_days
                ? "border-black bg-black text-white"
                : "bg-background hover:border-gray-400"
            }`}
          >
            <p className="font-semibold">{p.label}</p>
            <p className="mt-1 text-sm opacity-80">
              {(p.price_cents / 100).toFixed(2)} {p.currency}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-lg border bg-gray-50 p-4 text-sm text-gray-700">
        <p>
          Prix : <strong>{selectedPrice ? (selectedPrice.price_cents / 100).toFixed(2) : "—"} EUR</strong>
        </p>
        <p className="mt-1">
          Paiement unique via Stripe. Votre oeuvre sera boostee immediatement apres le
          paiement.
        </p>
      </div>

      <button
        onClick={handleBoost}
        disabled={submitting || !selectedPrice}
        className="mt-6 w-full rounded-md bg-black px-8 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {submitting ? "Redirection…" : "Booster"}
      </button>
    </div>
  );
}
