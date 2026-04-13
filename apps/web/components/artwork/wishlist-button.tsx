"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface WishlistButtonProps {
  artworkId: string;
  initialCount?: number;
}

export function WishlistButton({ artworkId, initialCount = 0 }: WishlistButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("wishlists")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("artwork_id", artworkId)
      .single()
      .then(({ data, error }) => {
        if (data) setIsWishlisted(true);
        if (error && error.code !== "PGRST116") {
          toast.error("Impossible de charger l'etat de la wishlist.");
        }
      });
  }, [user, artworkId]);

  async function toggle() {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (loading) return;
    setLoading(true);

    const previousWishlisted = isWishlisted;
    const previousCount = count;

    // Optimistic update
    setIsWishlisted(!isWishlisted);
    setCount(isWishlisted ? Math.max(0, count - 1) : count + 1);

    const supabase = createSupabaseBrowserClient();

    try {
      if (previousWishlisted) {
        const { error } = await supabase.from("wishlists").delete().match({ user_id: user.id, artwork_id: artworkId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("wishlists").insert({ user_id: user.id, artwork_id: artworkId });
        if (error) throw error;
      }
    } catch {
      setIsWishlisted(previousWishlisted);
      setCount(previousCount);
      toast.error("Impossible de mettre a jour la wishlist. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition disabled:opacity-50 ${
        isWishlisted
          ? "bg-red-50 text-red-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      aria-label={isWishlisted ? "Retirer de la wishlist" : "Ajouter a la wishlist"}
      title={isWishlisted ? "Retirer de la wishlist" : "Ajouter a la wishlist"}
    >
      <svg
        className="h-4 w-4"
        fill={isWishlisted ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
