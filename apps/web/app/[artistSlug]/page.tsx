import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { ArtistProfileView } from "@/components/artist/artist-profile-view";
import { SupportArtistSection } from "@/components/artist/support-artist-section";
import { TrackView } from "@/components/tracking/track-view";

interface Props {
  params: { artistSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: artist } = await supabase
    .from("artist_profiles")
    .select("full_name, story_html, location_city")
    .eq("slug", params.artistSlug)
    .single();

  if (!artist) return {};

  const description = artist.story_html
    ? artist.story_html.replace(/<[^>]*>/g, "").slice(0, 160)
    : `Découvrez les œuvres de ${artist.full_name} sur Bozzart`;
  const ogImage = `/api/og?title=${encodeURIComponent(artist.full_name)}&subtitle=${encodeURIComponent(artist.location_city || "Bozzart")}`;

  return {
    title: artist.full_name,
    description,
    openGraph: {
      title: artist.full_name,
      description,
      type: "profile",
      images: [{ url: ogImage, width: 1200, height: 630, alt: artist.full_name }],
    },
    twitter: {
      card: "summary_large_image",
      title: artist.full_name,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArtistProfilePage({ params }: Props) {
  const supabase = createSupabaseServerClient();

  const { data: artist } = await supabase
    .from("artist_profiles")
    .select("*, profiles!inner(*)")
    .eq("slug", params.artistSlug)
    .single();

  if (!artist) notFound();

  const { data: artworks } = await supabase
    .from("artworks")
    .select("*")
    .eq("artist_id", artist.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const { data: posts } = await supabase
    .from("carnet_posts")
    .select("*")
    .eq("artist_id", artist.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Phase 17 : stories visuelles publiees pour cet artiste
  const { data: storyRows } = await supabase
    .from("artwork_stories")
    .select("artwork_id, slides, created_at, artworks!inner(title, primary_image_url, artist_id, status)")
    .eq("is_published", true)
    .eq("artworks.artist_id", artist.id)
    .eq("artworks.status", "published")
    .order("created_at", { ascending: false });

  // Phase 18 : plans d'abonnement publics de cet artiste + compte d'abonnes actifs
  const { data: planRows } = await supabase
    .from("subscription_plans")
    .select("id, artist_id, name, description, price_monthly, currency, benefits, max_subscribers")
    .eq("artist_id", artist.id)
    .eq("is_active", true)
    .order("price_monthly", { ascending: true });

  const plans = await Promise.all(
    (planRows ?? []).map(async (p: any) => {
      const { count } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan_id", p.id)
        .eq("status", "active");
      return {
        id: p.id as string,
        artist_id: p.artist_id as string,
        name: p.name as string,
        description: (p.description as string | null) ?? null,
        price_monthly: p.price_monthly as number,
        currency: p.currency as string,
        benefits: Array.isArray(p.benefits) ? (p.benefits as string[]) : [],
        max_subscribers: (p.max_subscribers as number | null) ?? null,
        subscriber_count: count ?? 0,
      };
    }),
  );

  const stories = (storyRows ?? []).map((r: any) => ({
    artwork_id: r.artwork_id as string,
    artwork_title: r.artworks?.title as string,
    primary_image_url: (r.artworks?.primary_image_url as string) ?? null,
    slides: (r.slides as any[]) ?? [],
    created_at: r.created_at as string,
  }));

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artist.full_name,
    url: `https://bozzart.art/${artist.slug}`,
    jobTitle: "Artiste",
    address: artist.location_city
      ? { "@type": "PostalAddress", addressLocality: artist.location_city, addressCountry: artist.location_country }
      : undefined,
    description: artist.story_html?.replace(/<[^>]*>/g, "").slice(0, 300),
    sameAs: [artist.website_url, artist.instagram_url].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\/script/gi, "<\\/script") }} />
      <TrackView type="profile" artistId={artist.id} />
      <ArtistProfileView
        artist={artist}
        artworks={artworks || []}
        posts={posts || []}
        stories={stories}
      />
      <div id="soutenir" className="max-w-5xl mx-auto px-4">
        <SupportArtistSection
          artistId={artist.id}
          artistName={artist.full_name ?? artist.slug}
          plans={plans}
        />
      </div>
    </>
  );
}
