import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { sanitizeHtml } from "@/lib/sanitize";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { WishlistButton } from "@/components/artwork/wishlist-button";
import { ContactArtistButton } from "@/components/artwork/contact-artist-button";
import { TrackView } from "@/components/tracking/track-view";
import { formatPrice } from "@bozzart/core";

interface Props {
  params: { artistSlug: string; artworkSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: artwork } = await supabase
    .from("artworks")
    .select("title, meta_description, price, price_currency, primary_image_url, artist:artist_profiles(full_name)")
    .eq("slug", params.artworkSlug)
    .eq("status", "published")
    .single();

  if (!artwork) return {};

  const artist = artwork.artist as unknown as { full_name: string };

  return {
    title: `${artwork.title} — ${artist.full_name}`,
    description: artwork.meta_description || `${artwork.title} par ${artist.full_name}. ${artwork.price} ${artwork.price_currency}`,
    openGraph: {
      title: artwork.title,
      images: [artwork.primary_image_url],
    },
  };
}

export default async function ArtworkPage({ params }: Props) {
  const supabase = createSupabaseServerClient();

  const { data: artwork } = await supabase
    .from("artworks")
    .select("*, artist:artist_profiles(*, profiles!artist_profiles_user_id_fkey(*))")
    .eq("slug", params.artworkSlug)
    .eq("status", "published")
    .single();

  if (!artwork) notFound();

  // Estimation de valeur (Phase 24.3) — opt-in via artist.show_value_estimate
  let valueEstimate: { estimated_low_cents: number; estimated_high_cents: number; confidence: number } | null = null;
  if (artwork.artist?.show_value_estimate) {
    const { data: est } = await supabase
      .from("value_estimates")
      .select("estimated_low_cents, estimated_high_cents, confidence")
      .eq("artwork_id", artwork.id)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    valueEstimate = est as typeof valueEstimate;
  }

  const { data: otherArtworks } = await supabase
    .from("artworks")
    .select("id, title, slug, primary_image_url, price, price_currency")
    .eq("artist_id", artwork.artist_id)
    .eq("status", "published")
    .neq("id", artwork.id)
    .limit(3);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: artwork.title,
    image: artwork.primary_image_url,
    description: artwork.story_html?.replace(/<[^>]*>/g, "").slice(0, 300) || artwork.title,
    brand: { "@type": "Person", name: artwork.artist.full_name },
    offers: {
      "@type": "Offer",
      price: artwork.price,
      priceCurrency: artwork.price_currency,
      availability: artwork.status === "published" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url: `https://bozzart.art/${params.artistSlug}/artwork/${params.artworkSlug}`,
    },
  };

  return (
    <main className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\/script/gi, "<\\/script") }} />
      <TrackView type="artwork" artistId={artwork.artist_id} />

      <div className="mx-auto max-w-6xl px-8 py-12">
        <Breadcrumbs items={[
          { label: "Accueil", href: "/" },
          { label: artwork.artist.full_name, href: `/${params.artistSlug}` },
          { label: artwork.title },
        ]} />
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={artwork.primary_image_url}
                alt={artwork.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                unoptimized
              />
            </div>
            {artwork.image_urls?.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {artwork.image_urls.map((url: string, i: number) => (
                  <div key={i} className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
                    <Image src={url} alt={`${artwork.title} - ${i + 2}`} fill className="object-cover" sizes="80px" unoptimized />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div>
            <Link href={`/${params.artistSlug}`} className="text-sm text-gray-500 hover:text-gray-800">
              {artwork.artist.full_name}
              {artwork.artist.is_founder && <span className="ml-1 text-purple-500" role="img" aria-label="Artiste fondateur">★</span>}
              {artwork.artist.is_verified && <span className="ml-1 text-blue-500" role="img" aria-label="Artiste vérifié">✓</span>}
            </Link>
            <h1 className="mt-1 text-3xl font-bold">{artwork.title}</h1>

            <div className="mt-4 space-y-1 text-sm text-gray-600">
              {artwork.medium && <p className="capitalize">{artwork.medium}</p>}
              {artwork.year_created && <p>{artwork.year_created}</p>}
              {artwork.dimensions && <p>{artwork.dimensions}</p>}
              {artwork.edition_info && <p>{artwork.edition_info}</p>}
            </div>

            {artwork.is_price_visible && (
              <p className="mt-6 text-2xl font-bold">{formatPrice(artwork.price, artwork.price_currency)}</p>
            )}

            <div className="mt-8 flex items-center gap-3">
              {artwork.status === "published" && (
                <Link href={`/checkout/${artwork.id}`} className="rounded-md bg-black px-8 py-3 text-white hover:bg-gray-800">
                  Acheter
                </Link>
              )}
              {artwork.messaging_enabled && (
                <ContactArtistButton artworkId={artwork.id} artistProfileId={artwork.artist_id} />
              )}
              <WishlistButton artworkId={artwork.id} initialCount={artwork.wishlist_count} />
            </div>

            {valueEstimate && (
              <details className="mt-8 rounded-lg border bg-gray-50 p-4">
                <summary className="cursor-pointer text-sm font-medium">Estimation de valeur</summary>
                <div className="mt-3 text-sm text-gray-700">
                  <p className="text-lg font-semibold">
                    {(valueEstimate.estimated_low_cents / 100).toFixed(0)} € – {(valueEstimate.estimated_high_cents / 100).toFixed(0)} €
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Confiance : {Math.round(valueEstimate.confidence * 100)}%
                  </p>
                  <p className="mt-3 text-xs italic text-gray-500">
                    Estimation indicative basée sur des œuvres comparables du même artiste. Ne constitue pas une valeur marchande certifiée.
                  </p>
                </div>
              </details>
            )}

            {artwork.story_html && (
              <div className="mt-8 border-t pt-8">
                <h2 className="mb-4 text-lg font-semibold">Histoire de l&apos;œuvre</h2>
                <div className="prose text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizeHtml(artwork.story_html) }} />
              </div>
            )}

            {artwork.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {artwork.tags.map((tag: string) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Autres oeuvres */}
        {otherArtworks && otherArtworks.length > 0 && (
          <div className="mt-16 border-t pt-12">
            <h2 className="mb-6 text-lg font-semibold">Autres œuvres de {artwork.artist.full_name}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherArtworks.map((other) => (
                <Link key={other.id} href={`/${params.artistSlug}/artwork/${other.slug}`} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <Image src={other.primary_image_url} alt={other.title} fill className="object-cover transition group-hover:scale-105" sizes="33vw" unoptimized />
                  </div>
                  <h3 className="mt-2 font-medium">{other.title}</h3>
                  <p className="text-sm text-gray-600">{formatPrice(other.price, other.price_currency)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
