"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface DropRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export default function DropsPage() {
  const { artistProfile } = useAuth();
  const [drops, setDrops] = useState<DropRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function fetchDrops() {
    if (!artistProfile) return;
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("drops")
      .select("*")
      .eq("artist_id", artistProfile.id)
      .order("starts_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          const msg = "Erreur lors du chargement des drops.";
          setError(msg);
          toast.error(msg);
        } else {
          setDrops((data as DropRow[]) || []);
        }
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchDrops();
  }, [artistProfile]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Mes Drops</h1>
      <p className="mt-1 text-gray-600">Événements de vente limités dans le temps</p>

      {error ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchDrops}
            className="mt-2 rounded-md bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <p className="mt-8 text-gray-500" role="status" aria-live="polite">Chargement...</p>
      ) : drops.length === 0 ? (
        <p className="mt-8 text-gray-500">Aucun drop pour le moment.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {drops.map((drop) => (
            <div key={drop.id} className="rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{drop.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  drop.status === "active" ? "bg-green-100 text-green-700" :
                  drop.status === "scheduled" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {drop.status}
                </span>
              </div>
              {drop.description && <p className="mt-2 text-sm text-gray-600">{drop.description}</p>}
              <p className="mt-2 text-sm text-gray-400">
                {new Date(drop.starts_at).toLocaleDateString("fr-FR")} — {new Date(drop.ends_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
