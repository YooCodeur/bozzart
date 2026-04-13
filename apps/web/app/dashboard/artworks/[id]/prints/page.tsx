"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Props {
  params: { id: string };
}

interface PrintProduct {
  id?: string;
  artwork_id: string;
  format: string;
  base_price_cents: number;
  artist_margin_cents: number;
  retail_price_cents?: number;
  is_enabled: boolean;
  external_product_id?: string | null;
}

// Formats supportes + cout de base indicatif (cents)
const AVAILABLE_FORMATS: { format: string; label: string; base_price_cents: number }[] = [
  { format: "A3", label: "A3 Fine Art (29.7 x 42 cm)", base_price_cents: 2500 },
  { format: "A2", label: "A2 Fine Art (42 x 59.4 cm)", base_price_cents: 3800 },
  { format: "A1", label: "A1 Fine Art (59.4 x 84.1 cm)", base_price_cents: 5500 },
  { format: "canvas_40", label: "Toile 40 x 60 cm", base_price_cents: 4500 },
  { format: "canvas_60", label: "Toile 60 x 90 cm", base_price_cents: 7200 },
  { format: "poster_A2", label: "Poster A2", base_price_cents: 1500 },
];

function fmt(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default function ArtworkPrintsConfig({ params }: Props) {
  const router = useRouter();
  const { user, artistProfile } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [artworkTitle, setArtworkTitle] = useState("");
  const [products, setProducts] = useState<Record<string, PrintProduct>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user || !artistProfile) return;
      const { data: art } = await supabase
        .from("artworks")
        .select("id, title, artist_id")
        .eq("id", params.id)
        .single();
      if (!active) return;
      if (!art || art.artist_id !== artistProfile.id) {
        toast.error("Oeuvre introuvable ou acces refuse");
        router.push("/dashboard/artworks");
        return;
      }
      setArtworkTitle(art.title);

      const { data: existing } = await supabase
        .from("print_products")
        .select("*")
        .eq("artwork_id", params.id);

      const map: Record<string, PrintProduct> = {};
      for (const f of AVAILABLE_FORMATS) {
        const found = existing?.find((p) => p.format === f.format);
        map[f.format] = found ?? {
          artwork_id: params.id,
          format: f.format,
          base_price_cents: f.base_price_cents,
          artist_margin_cents: 0,
          is_enabled: false,
        };
      }
      if (active) {
        setProducts(map);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, artistProfile, params.id, supabase, router]);

  const update = (format: string, patch: Partial<PrintProduct>) => {
    setProducts((prev) => ({ ...prev, [format]: { ...prev[format], ...patch } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const rows = Object.values(products).map((p) => ({
        artwork_id: p.artwork_id,
        format: p.format,
        base_price_cents: p.base_price_cents,
        artist_margin_cents: p.artist_margin_cents,
        is_enabled: p.is_enabled,
      }));
      const { error } = await supabase
        .from("print_products")
        .upsert(rows, { onConflict: "artwork_id,format" });
      if (error) throw error;
      toast.success("Configuration enregistree");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-500">Chargement…</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reproductions print</h1>
          <p className="text-sm text-gray-500">{artworkTitle}</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </header>

      <ul className="space-y-4">
        {AVAILABLE_FORMATS.map((f) => {
          const p = products[f.format];
          const retail = p.base_price_cents + p.artist_margin_cents;
          return (
            <li
              key={f.format}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{f.label}</div>
                  <div className="text-xs text-gray-500">
                    Cout base : {fmt(p.base_price_cents)}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={p.is_enabled}
                    onChange={(e) => update(f.format, { is_enabled: e.target.checked })}
                  />
                  Activer
                </label>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <label className="text-sm">
                  <span className="mb-1 block text-xs uppercase text-gray-500">
                    Votre marge (cents)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={p.artist_margin_cents}
                    onChange={(e) =>
                      update(f.format, {
                        artist_margin_cents: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5"
                  />
                </label>
                <div className="text-sm">
                  <span className="mb-1 block text-xs uppercase text-gray-500">
                    Marge
                  </span>
                  <div className="rounded-md bg-gray-50 px-3 py-1.5">
                    {fmt(p.artist_margin_cents)}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="mb-1 block text-xs uppercase text-gray-500">
                    Prix public
                  </span>
                  <div className="rounded-md bg-gray-50 px-3 py-1.5 font-semibold">
                    {fmt(retail)}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
