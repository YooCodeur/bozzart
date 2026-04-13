"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/sanitize";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { formatPrice } from "@bozzart/core";

type Tab = "oeuvres" | "carnet" | "histoire";

interface ArtistProfileViewProps {
  artist: Record<string, unknown>;
  artworks: Record<string, unknown>[];
  posts: Record<string, unknown>[];
}

export function ArtistProfileView({ artist, artworks, posts }: ArtistProfileViewProps) {
  const [tab, setTab] = useState<Tab>("carnet");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function toggleFollow() {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (followLoading) return;
    setFollowLoading(true);

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    const supabase = createSupabaseBrowserClient();

    try {
      if (previousState) {
        const { error } = await supabase.from("follows").delete().match({
          follower_id: user.id,
          artist_id: artist.id,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("follows").insert({
          follower_id: user.id,
          artist_id: artist.id,
        });
        if (error) throw error;
      }
    } catch {
      setIsFollowing(previousState);
      toast.error("Impossible de mettre à jour le suivi. Veuillez réessayer.");
    } finally {
      setFollowLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Header artiste */}
      <header className="border-b bg-white px-8 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-200" role="img" aria-label={`Avatar de ${artist.full_name}`} />
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                {artist.full_name as string}
                {(artist.is_verified as boolean) && <span className="ml-2 text-blue-500" title="Vérifié">✓</span>}
                {(artist.is_founder as boolean) && <span className="ml-1 text-purple-500" title="Fondateur Bozzart">★</span>}
              </h1>
              <p className="mt-1 text-gray-600">
                {[artist.location_city, artist.location_country].filter(Boolean).join(", ")}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {(artist.follower_count as number) || 0} abonnés · {(artist.artwork_count as number) || 0} œuvres
              </p>
              {(artist.silence_messaging as boolean) && (
                <p className="mt-1 text-xs text-amber-600">Mode Silence activé — messagerie temporairement désactivée</p>
              )}
            </div>
            {user?.id !== artist.user_id && (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                aria-label={isFollowing ? "Se désabonner" : "Suivre l'artiste"}
                className={`rounded-md px-6 py-2 text-sm font-medium transition disabled:opacity-50 ${
                  isFollowing
                    ? "border border-gray-300 bg-white hover:bg-gray-50"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {isFollowing ? "Abonné" : "Suivre"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl" role="tablist">
          {(["carnet", "oeuvres", "histoire"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              role="tab"
              aria-selected={tab === t}
              id={`tab-${t}`}
              className={`px-6 py-3 text-sm font-medium capitalize transition ${
                tab === t
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t === "oeuvres" ? `Œuvres (${artworks.length})` : t}
            </button>
          ))}
        </div>
      </nav>

      {/* Contenu */}
      <div className="mx-auto max-w-4xl px-8 py-8" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "oeuvres" && (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {artworks.map((artwork) => (
              <a
                key={artwork.id as string}
                href={`/${artist.slug}/artwork/${artwork.slug}`}
                className="group"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
                  <Image
                    src={artwork.primary_image_url as string}
                    alt={artwork.title as string}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
                <h3 className="mt-2 font-medium">{artwork.title as string}</h3>
                {(artwork.is_price_visible as boolean) !== false && (
                  <p className="text-sm text-gray-600">
                    {formatPrice(artwork.price as number, artwork.price_currency as string)}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}

        {tab === "carnet" && (
          <div className="space-y-8">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setTab("oeuvres")}
                className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm hover:bg-gray-50"
              >
                Voir toutes les oeuvres ({artworks.length})
              </button>
            </div>
            {posts.map((post) => (
              <article key={post.id as string} className="border-b pb-8">
                <p className="text-gray-800">{post.caption as string}</p>
                {((post.media_urls as string[]) || []).length > 0 && (
                  <div className="mt-4 relative max-h-96 overflow-hidden rounded-lg">
                    <Image
                      src={(post.media_urls as string[])[0]!}
                      alt={`Media du post de ${artist.full_name as string}`}
                      width={800}
                      height={384}
                      className="rounded-lg object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                )}
                <time className="mt-2 block text-sm text-gray-400">
                  {new Date(post.created_at as string).toLocaleDateString("fr-FR")}
                </time>
              </article>
            ))}
            {posts.length === 0 && (
              <p className="text-gray-500">Aucun post pour le moment.</p>
            )}
          </div>
        )}

        {tab === "histoire" && (
          <div className="prose max-w-none">
            {artist.story_html ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(artist.story_html as string) }} />
            ) : (
              <p className="text-gray-500">L&apos;artiste n&apos;a pas encore raconté son histoire.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
