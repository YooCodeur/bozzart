"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface ArtistRow {
  id: string;
  full_name: string;
  slug: string;
  location_city: string | null;
  location_country: string | null;
  is_verified: boolean;
  is_founder: boolean;
  stripe_onboarded: boolean;
  follower_count: number;
  artwork_count: number;
  total_sales_count: number;
  created_at: string;
}

export default function ArtistsAdminPage() {
  const [artists, setArtists] = useState<ArtistRow[]>([]);

  useEffect(() => {
    supabase
      .from("artist_profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setArtists((data as ArtistRow[]) || []));
  }, []);

  async function toggleVerified(id: string, current: boolean) {
    await supabase.from("artist_profiles").update({ is_verified: !current }).eq("id", id);
    setArtists((prev) => prev.map((a) => (a.id === id ? { ...a, is_verified: !current } : a)));
  }

  async function toggleFounder(id: string, current: boolean) {
    await supabase
      .from("artist_profiles")
      .update({
        is_founder: !current,
        commission_rate: !current ? 0.08 : 0.1,
        founder_since: !current ? new Date().toISOString() : null,
      })
      .eq("id", id);
    setArtists((prev) => prev.map((a) => (a.id === id ? { ...a, is_founder: !current } : a)));
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Artistes</h1>
      <p className="mt-1 text-gray-600">{artists.length} artistes inscrits</p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-3 pr-4">Artiste</th>
              <th className="py-3 pr-4">Localisation</th>
              <th className="py-3 pr-4">Oeuvres</th>
              <th className="py-3 pr-4">Ventes</th>
              <th className="py-3 pr-4">Stripe</th>
              <th className="py-3 pr-4">Verifie</th>
              <th className="py-3 pr-4">Fondateur</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => (
              <tr key={artist.id} className="border-b">
                <td className="py-3 pr-4">
                  <p className="font-medium">{artist.full_name}</p>
                  <p className="text-xs text-gray-500">/{artist.slug}</p>
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  {[artist.location_city, artist.location_country].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="py-3 pr-4">{artist.artwork_count}</td>
                <td className="py-3 pr-4">{artist.total_sales_count}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${artist.stripe_onboarded ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {artist.stripe_onboarded ? "Actif" : "Non"}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <button onClick={() => toggleVerified(artist.id, artist.is_verified)} className={`rounded-full px-2 py-0.5 text-xs ${artist.is_verified ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {artist.is_verified ? "Verifie" : "Non verifie"}
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <button onClick={() => toggleFounder(artist.id, artist.is_founder)} className={`rounded-full px-2 py-0.5 text-xs ${artist.is_founder ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                    {artist.is_founder ? "Fondateur (8%)" : "Standard (10%)"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
