"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface ContactArtistButtonProps {
  artworkId: string;
  artistProfileId: string;
}

export function ContactArtistButton({ artworkId, artistProfileId }: ContactArtistButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  async function handleContact() {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      // Verifier si une conversation existe deja
      const { data: existing, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .eq("artwork_id", artworkId)
        .eq("buyer_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existing) {
        router.push(`/dashboard/messages/${existing.id}`);
        return;
      }

      // Creer une nouvelle conversation
      const { data: conversation, error: insertError } = await supabase
        .from("conversations")
        .insert({
          artwork_id: artworkId,
          buyer_id: user.id,
          artist_id: artistProfileId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (conversation) {
        router.push(`/dashboard/messages/${conversation.id}`);
      }
    } catch {
      toast.error("Impossible de contacter l'artiste. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      aria-label="Contacter l'artiste"
      className="rounded-md border border-gray-300 px-8 py-3 hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "..." : "Contacter l'artiste"}
    </button>
  );
}
