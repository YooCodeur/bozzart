"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

interface WishlistItem {
  artwork_id: string;
  created_at: string;
  artwork: {
    id: string;
    title: string;
    slug: string;
    primary_image_url: string;
    price: number;
    price_currency: string;
    status: string;
    artist: { full_name: string; slug: string };
  };
}

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("wishlists")
      .select("artwork_id, created_at, artwork:artworks(id, title, slug, primary_image_url, price, price_currency, status, artist:artist_profiles(full_name, slug))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Impossible de charger la wishlist : " + error.message);
        }
        setItems((data as unknown as WishlistItem[]) || []);
        setLoading(false);
      });
  }, [user]);

  async function removeFromWishlist(artworkId: string) {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("wishlists").delete().match({ user_id: user.id, artwork_id: artworkId });
    if (error) {
      toast.error("Erreur lors du retrait de la wishlist : " + error.message);
      return;
    }
    toast.success("Œuvre retirée de la wishlist");
    setItems((prev) => prev.filter((i) => i.artwork_id !== artworkId));
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Ma wishlist</h1>
      <p className="mt-1 text-gray-600">{items.length} œuvre{items.length !== 1 ? "s" : ""}</p>

      {loading ? (
        <p className="mt-8 text-gray-500" role="status" aria-live="polite">Chargement...</p>
      ) : items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">Votre wishlist est vide.</p>
          <Link href="/discover" className="mt-4 inline-block text-brand-600 hover:underline">
            Découvrir des œuvres
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.artwork_id} className="group relative">
              <Link href={`/${(item.artwork.artist as unknown as { slug: string }).slug}/artwork/${item.artwork.slug}`}>
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={item.artwork.primary_image_url}
                    alt={item.artwork.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {item.artwork.status === "sold" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-medium">Vendue</span>
                    </div>
                  )}
                </div>
              </Link>
              <h3 className="mt-2 font-medium">{item.artwork.title}</h3>
              <p className="text-sm text-gray-500">{(item.artwork.artist as unknown as { full_name: string }).full_name}</p>
              <p className="text-sm text-gray-600">{item.artwork.price} {item.artwork.price_currency}</p>
              <button
                onClick={() => removeFromWishlist(item.artwork_id)}
                className="mt-1 text-xs text-red-500 hover:underline"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
