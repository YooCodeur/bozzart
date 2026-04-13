"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Suggestion {
  artist_profile_id: string;
  full_name: string;
  slug: string;
  avatar_url: string | null;
  reason: string;
}

/**
 * Phase 15.4 — Encart "Artistes a decouvrir".
 * Affiche 3 suggestions max basees sur le graph 2nd degree + medium + geo.
 */
export function ConnectionSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const supabase = createSupabaseBrowserClient();

    // TODO (Phase 15.4) : etendre l'RPC suggest_connections cote SQL
    // pour inclure le matching medium (vs wishlists) et geo proximity.
    supabase
      .rpc("suggest_connections", { p_user_id: user.id, p_limit: 3 })
      .then(({ data, error }) => {
        if (error) {
          // RPC non deployee ou erreur : fail-silent (widget optionnel)
          // eslint-disable-next-line no-console
          console.warn("[ConnectionSuggestions] suggest_connections RPC error:", error.message);
          setSuggestions([]);
        } else {
          setSuggestions((data as Suggestion[]) || []);
        }
        setLoading(false);
      });
  }, [user]);

  if (!user || loading) return null;
  if (suggestions.length === 0) return null;

  return (
    <aside className="rounded-lg border bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Artistes à découvrir</h3>
      <ul className="space-y-3">
        {suggestions.map((s) => (
          <li key={s.artist_profile_id} className="flex items-center gap-3">
            <Link href={`/${s.slug}`} className="flex flex-1 items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                {s.avatar_url && (
                  <Image src={s.avatar_url} alt={s.full_name} fill className="object-cover" sizes="40px" unoptimized />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{s.full_name}</p>
                <p className="truncate text-xs text-gray-500">{s.reason}</p>
              </div>
            </Link>
            {/* TODO (Phase 15.4) : brancher sur /api/follows */}
            <button
              type="button"
              className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
              aria-label={`Suivre ${s.full_name}`}
            >
              Suivre
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default ConnectionSuggestions;
