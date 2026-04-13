"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface ConversationRow {
  id: string;
  last_message_at: string | null;
  buyer_unread: number;
  artist_unread: number;
  artwork: { id: string; title: string; primary_image_url: string };
  buyer: { id: string; display_name: string; avatar_url: string | null };
  artist: { full_name: string };
}

export default function MessagesListPage() {
  const { user, artistProfile, isArtist } = useAuth();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function fetchConversations() {
    if (!user) return;
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    let query = supabase
      .from("conversations")
      .select("id, last_message_at, buyer_unread, artist_unread, artwork:artworks(id, title, primary_image_url), buyer:profiles!conversations_buyer_id_fkey(id, display_name, avatar_url), artist:artist_profiles!conversations_artist_id_fkey(full_name)")
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (isArtist && artistProfile) {
      query = query.eq("artist_id", artistProfile.id);
    } else {
      query = query.eq("buyer_id", user.id);
    }

    query.then(({ data, error }) => {
      if (error) {
        const msg = "Erreur lors du chargement des messages.";
        setError(msg);
        toast.error(msg);
      } else {
        setConversations((data as unknown as ConversationRow[]) || []);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    fetchConversations();
  }, [user, artistProfile, isArtist]);

  const getUnread = (conv: ConversationRow) =>
    isArtist ? conv.artist_unread : conv.buyer_unread;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Messages</h1>

      {error ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchConversations}
            className="mt-2 rounded-md bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Reessayer
          </button>
        </div>
      ) : loading ? (
        <p className="mt-8 text-gray-500" role="status" aria-live="polite">Chargement...</p>
      ) : conversations.length === 0 ? (
        <p className="mt-8 text-gray-500">Aucune conversation.</p>
      ) : (
        <div className="mt-6 divide-y">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/dashboard/messages/${conv.id}`}
              className="flex items-center gap-4 py-4 hover:bg-gray-50 rounded-lg px-2 transition"
            >
              <img
                src={conv.artwork.primary_image_url}
                alt={conv.artwork.title}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{conv.artwork.title}</p>
                <p className="text-sm text-gray-500 truncate">
                  {isArtist ? conv.buyer.display_name : conv.artist?.full_name || "Artiste"}
                </p>
              </div>
              <div className="text-right">
                {conv.last_message_at && (
                  <p className="text-xs text-gray-400">
                    {new Date(conv.last_message_at).toLocaleDateString("fr-FR")}
                  </p>
                )}
                {getUnread(conv) > 0 && (
                  <span className="mt-1 inline-block rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">
                    {getUnread(conv)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
