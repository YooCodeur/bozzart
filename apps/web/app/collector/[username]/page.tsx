import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { formatPrice } from "@bozzart/core";

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, collector_bio, is_collection_public")
    .eq("username", params.username)
    .single();

  if (!profile || !profile.is_collection_public) return {};

  return {
    title: `Collection de ${profile.display_name || profile.username} — Bozzart`,
    description: profile.collector_bio || `Decouvrez la collection de ${profile.display_name || profile.username}.`,
  };
}

export default async function CollectorPage({ params }: Props) {
  const supabase = createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, collector_bio, follower_count, is_collection_public")
    .eq("username", params.username)
    .single();

  if (!profile || !profile.is_collection_public) notFound();

  // Oeuvres acquises via transactions completees
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      id,
      paid_at,
      artwork:artworks(id, title, slug, primary_image_url, price, price_currency),
      artist:artist_profiles(full_name, slug)
    `)
    .eq("buyer_id", profile.id)
    .eq("status", "completed")
    .order("paid_at", { ascending: false });

  const items = (transactions || []).filter((t) => t.artwork);
  const artworkCount = items.length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {profile.avatar_url && (
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100">
              <Image src={profile.avatar_url} alt={profile.display_name || profile.username} fill className="object-cover" sizes="96px" unoptimized />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
            <p className="mt-1 text-sm text-gray-500">@{profile.username}</p>
            {profile.collector_bio && (
              <p className="mt-3 max-w-xl text-gray-700">{profile.collector_bio}</p>
            )}
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <span><strong className="text-gray-900">{artworkCount}</strong> œuvre{artworkCount !== 1 ? "s" : ""}</span>
              <span><strong className="text-gray-900">{profile.follower_count ?? 0}</strong> follower{(profile.follower_count ?? 0) !== 1 ? "s" : ""}</span>
            </div>
          </div>
          {/* TODO (Phase 15.1) : brancher sur /api/follows avec following_id=profile.id */}
          <button
            type="button"
            className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800"
            aria-label={`Suivre ${profile.display_name || profile.username}`}
          >
            Suivre
          </button>
        </header>

        <section className="mt-12">
          <h2 className="mb-6 text-lg font-semibold">Collection</h2>
          {items.length === 0 ? (
            <p className="text-gray-500">Aucune œuvre dans la collection publique pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((t) => {
                const artwork = t.artwork as unknown as {
                  id: string; title: string; slug: string; primary_image_url: string; price: number; price_currency: string;
                };
                const artist = t.artist as unknown as { full_name: string; slug: string };
                return (
                  <Link key={t.id} href={`/${artist.slug}/artwork/${artwork.slug}`} className="group">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={artwork.primary_image_url}
                        alt={artwork.title}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="25vw"
                        unoptimized
                      />
                    </div>
                    <h3 className="mt-2 font-medium">{artwork.title}</h3>
                    <p className="text-sm text-gray-600">{artist.full_name}</p>
                    <p className="text-xs text-gray-500">{formatPrice(artwork.price, artwork.price_currency)}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
