"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function DashboardPage() {
  const { profile, user, artistProfile, isArtist } = useAuth();
  const [collectionCount, setCollectionCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (isArtist || !user) return;
    const supabase = createSupabaseBrowserClient();

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", user.id)
      .eq("status", "paid")
      .then(({ count }) => setCollectionCount(count ?? 0));

    supabase
      .from("wishlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setWishlistCount(count ?? 0));
  }, [user, isArtist]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Bonjour, {profile?.displayName || "artiste"} !
      </h1>

      {isArtist && artistProfile && (
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Ventes" value={artistProfile.totalSalesCount} />
          <StatCard
            label="Chiffre d'affaires"
            value={`${artistProfile.totalSalesAmount} EUR`}
          />
          <StatCard label="Abonnes" value={artistProfile.followerCount} />
          <StatCard label="Oeuvres" value={artistProfile.artworkCount} />
        </div>
      )}

      {!isArtist && (
        <div className="mt-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <StatCard label="Ma collection" value={collectionCount} />
            <StatCard label="Wishlist" value={wishlistCount} />
          </div>
          <div className="mt-8 flex gap-4">
            <Link
              href="/discover"
              className="rounded-md bg-black px-6 py-3 text-sm text-white hover:bg-gray-800"
            >
              Decouvrir des oeuvres
            </Link>
            <Link
              href="/dashboard/collection"
              className="rounded-md border border-gray-300 px-6 py-3 text-sm hover:bg-gray-50"
            >
              Ma collection
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-background p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
